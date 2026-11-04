# Personal Finance Management System (PFMS)

React → FastAPI (API) → Django (ORM + Auth + Admin) → SQLite / PostgreSQL

## Run (two terminals)

**Backend** (http://localhost:8000; API docs at `/docs`, Django admin at `/admin/`)
```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser      # optional, for /admin
uvicorn main:app --reload --port 8000
```

**Frontend** (http://localhost:5173)
```
cd frontend
npm install
npm run dev
```

## Using PostgreSQL
SQLite is used by default. To use PostgreSQL, create a database and set the env vars
before `migrate` / `uvicorn`:
```
set DB_NAME=personal_finance_management
set DB_USER=postgres
set DB_PASSWORD=yourpassword
```

## Structure
```
backend/
  core/settings.py      Django settings (DB switch here)
  finance/models.py     Account, Transaction, Bill, Goal (User = Django's built-in)
  finance/admin.py      registers models in Django admin
  main.py               FastAPI: all /api endpoints + mounts Django admin
frontend/src/
  App.jsx               sidebar layout, header, bill-reminder bell, loads all data
  api.js                fetch helper (sends token)
  components.jsx        Modal form, bar chart, expense breakdown
  pages/                Auth, Dashboard, Accounts, Transactions, Bills, Expenses, Goals
```

## Modules
1. **Auth**: register/login; the token is a signed Django value valid for 7 days.
2. **Accounts**: add cards/accounts. Only the last 4 digits are stored (never the full number or CVV). The total balance updates automatically.
3. **Transactions**: credit/debit entries that adjust the account balance. Export to CSV.
4. **Bills**: upcoming bills, a 🔔 reminder for bills due within 3 days or overdue, mark as paid, and payment history.
5. **Expenses**: 12-month credit vs debit bar chart and a per-goal breakdown with month-over-month % change.
6. **Goals**: set a target. Progress is the sum of transactions tagged with that goal.
7. **Dashboard**: balance, breakdown, bills, recent transactions, chart and goals on one screen.
