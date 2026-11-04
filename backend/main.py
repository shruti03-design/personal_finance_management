"""FastAPI API layer. Uses Django for ORM, auth and admin (mounted at /admin)."""
import os
from datetime import date
from decimal import Decimal
from typing import Optional

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from django.contrib.auth import authenticate  # noqa: E402
from django.contrib.auth.models import User  # noqa: E402
from django.core import signing  # noqa: E402
from django.core.wsgi import get_wsgi_application  # noqa: E402
from django.db import transaction as db_tx  # noqa: E402
from django.db.models import F  # noqa: E402
from fastapi import Depends, FastAPI, Header, HTTPException  # noqa: E402
from fastapi.middleware.wsgi import WSGIMiddleware  # noqa: E402
from fastapi.staticfiles import StaticFiles  # noqa: E402
from pydantic import BaseModel  # noqa: E402

from finance.models import Account, Bill, Goal, Transaction  # noqa: E402

app = FastAPI(title="PFMS API")


# ======================================================================
# MODULE 1: User Authentication & Registration  (Milestone 1)
# ======================================================================
class Credentials(BaseModel):
    username: str
    password: str


def make_token(user):
    return {"token": signing.dumps(user.id, salt="api"), "username": user.username}


def current_user(authorization: str = Header("")) -> User:
    try:
        uid = signing.loads(authorization.removeprefix("Bearer "), salt="api", max_age=7 * 86400)
        return User.objects.get(id=uid)
    except Exception:
        raise HTTPException(401, "Not authenticated")


@app.post("/api/register")
def register(c: Credentials):
    if len(c.username) < 3 or len(c.password) < 6:
        raise HTTPException(400, "Username min 3 chars, password min 6 chars")
    if User.objects.filter(username=c.username).exists():
        raise HTTPException(400, "Username already taken")
    return make_token(User.objects.create_user(c.username, password=c.password))


@app.post("/api/login")
def login(c: Credentials):
    user = authenticate(username=c.username, password=c.password)
    if not user:
        raise HTTPException(400, "Invalid username or password")
    return make_token(user)


# ======================================================================
# MODULE 2: Accounts Management  (Milestone 1)
# ======================================================================
class AccountIn(BaseModel):
    name: str
    card_type: str = "Debit"
    card_number: str = ""
    balance: Decimal = Decimal(0)


def account_out(a):
    return {"id": a.id, "name": a.name, "card_type": a.card_type, "last4": a.last4, "balance": float(a.balance)}


@app.get("/api/accounts")
def list_accounts(u=Depends(current_user)):
    return [account_out(a) for a in Account.objects.filter(user=u)]


@app.post("/api/accounts")
def add_account(d: AccountIn, u=Depends(current_user)):
    digits = "".join(ch for ch in d.card_number if ch.isdigit())
    a = Account.objects.create(user=u, name=d.name, card_type=d.card_type, last4=digits[-4:], balance=d.balance)
    return account_out(a)


@app.delete("/api/accounts/{id}")
def delete_account(id: int, u=Depends(current_user)):
    Account.objects.filter(user=u, id=id).delete()
    return {"ok": True}


# ======================================================================
# MODULE 7: Goal Setting & Tracking  (Milestone 4)
# ======================================================================
class GoalIn(BaseModel):
    name: str
    target: Decimal


@app.get("/api/goals")
def list_goals(u=Depends(current_user)):
    out = []
    for g in Goal.objects.filter(user=u):
        spent = sum((t.amount for t in g.transaction_set.all()), Decimal(0))
        out.append({"id": g.id, "name": g.name, "target": float(g.target), "progress": float(spent)})
    return out


@app.post("/api/goals")
def add_goal(d: GoalIn, u=Depends(current_user)):
    g = Goal.objects.create(user=u, name=d.name, target=d.target)
    return {"id": g.id, "name": g.name, "target": float(g.target), "progress": 0}


@app.delete("/api/goals/{id}")
def delete_goal(id: int, u=Depends(current_user)):
    Goal.objects.filter(user=u, id=id).delete()
    return {"ok": True}


# ======================================================================
# MODULE 4: Transaction History  (Milestone 2)
# ======================================================================
class TransactionIn(BaseModel):
    account_id: int
    goal_id: Optional[int] = None
    item: str
    type: str  # "credit" | "debit"
    payment_type: str = "Card"
    date: date
    amount: Decimal


def tx_out(t):
    return {
        "id": t.id, "item": t.item, "type": t.type, "payment_type": t.payment_type,
        "date": t.date.isoformat(), "amount": float(t.amount),
        "account": t.account.name, "goal": t.goal.name if t.goal else "",
    }


def apply_balance(t, sign=1):
    delta = t.amount if t.type == "credit" else -t.amount
    Account.objects.filter(id=t.account_id).update(balance=F("balance") + sign * delta)


@app.get("/api/transactions")
def list_transactions(u=Depends(current_user)):
    return [tx_out(t) for t in Transaction.objects.filter(user=u).select_related("account", "goal")]


@app.post("/api/transactions")
def add_transaction(d: TransactionIn, u=Depends(current_user)):
    if d.type not in ("credit", "debit") or d.amount <= 0:
        raise HTTPException(400, "Type must be credit/debit and amount > 0")
    account = Account.objects.filter(user=u, id=d.account_id).first()
    goal = Goal.objects.filter(user=u, id=d.goal_id).first() if d.goal_id else None
    if not account:
        raise HTTPException(400, "Select a valid account")
    with db_tx.atomic():
        t = Transaction.objects.create(
            user=u, account=account, goal=goal, item=d.item, type=d.type,
            payment_type=d.payment_type, date=d.date, amount=d.amount)
        apply_balance(t)  # total balance updates automatically
    return tx_out(t)


@app.delete("/api/transactions/{id}")
def delete_transaction(id: int, u=Depends(current_user)):
    t = Transaction.objects.filter(user=u, id=id).first()
    if t:
        with db_tx.atomic():
            apply_balance(t, -1)
            t.delete()
    return {"ok": True}


# ======================================================================
# MODULE 5: Bill Management  (Milestone 3)
# ======================================================================
class BillIn(BaseModel):
    name: str
    description: str = ""
    due_date: date
    amount: Decimal


def bill_out(b):
    return {"id": b.id, "name": b.name, "description": b.description, "due_date": b.due_date.isoformat(),
            "amount": float(b.amount), "paid_on": b.paid_on.isoformat() if b.paid_on else None}


@app.get("/api/bills")
def list_bills(u=Depends(current_user)):
    return [bill_out(b) for b in Bill.objects.filter(user=u)]


@app.post("/api/bills")
def add_bill(d: BillIn, u=Depends(current_user)):
    return bill_out(Bill.objects.create(user=u, **d.model_dump()))


@app.post("/api/bills/{id}/pay")
def pay_bill(id: int, u=Depends(current_user)):
    Bill.objects.filter(user=u, id=id).update(paid_on=date.today())
    return {"ok": True}


@app.delete("/api/bills/{id}")
def delete_bill(id: int, u=Depends(current_user)):
    Bill.objects.filter(user=u, id=id).delete()
    return {"ok": True}


# ======================================================================
# Django Admin (http://localhost:8000/admin/)
# Modules 6 (Expenses) & 8 (Dashboard) need no extra endpoints: the frontend
# computes them from the /api/transactions, /accounts, /bills and /goals data.
# ======================================================================
app.mount("/static/admin", StaticFiles(directory=os.path.join(os.path.dirname(django.__file__), "contrib/admin/static/admin")))
app.mount("/admin", WSGIMiddleware(get_wsgi_application()))
