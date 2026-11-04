// ==========================================================
// MODULE 8: Dashboard Overview (Milestone 4)
// ==========================================================
import { money } from "../api";
import { MonthlyBarChart, ExpenseBreakdown } from "../components";
import { GoalList } from "./Goals";

export default function Dashboard({ accounts, transactions, bills, goals }) {
  const total = accounts.reduce((s, a) => s + a.balance, 0);
  return (
    <div className="grid">
      <div className="panel"><h3>Total Balance</h3><div className="big">{money(total)}</div>
        {accounts.map((a) => <div key={a.id} className="row"><span>{a.name}</span><span>{money(a.balance)}</span></div>)}</div>
      <div className="panel"><h3>Expense Breakdown</h3><ExpenseBreakdown transactions={transactions} /></div>
      <div className="panel"><h3>Upcoming Bills</h3>
        {bills.filter((b) => !b.paid_on).slice(0, 5).map((b) => <div key={b.id} className="row"><span>{b.name} · {b.due_date}</span><span>{money(b.amount)}</span></div>)}</div>
      <div className="panel"><h3>Recent Transactions</h3>
        {transactions.slice(0, 6).map((t) => <div key={t.id} className="row"><span>{t.item} · {t.date}</span>
          <span className={t.type === "credit" ? "greentext" : "red"}>{t.type === "credit" ? "+" : "-"}{money(t.amount)}</span></div>)}</div>
      <div className="panel wide"><h3>Monthly Bar Graph</h3><MonthlyBarChart transactions={transactions} /></div>
      <div className="panel" style={{ gridColumn: "span 3" }}><h3>Goals</h3><GoalList goals={goals} /></div>
    </div>
  );
}
