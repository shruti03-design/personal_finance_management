// ==========================================================
// MODULE 6: Expense Management (Milestone 4)
// Chart + breakdown components live in components.jsx
// ==========================================================
import { MonthlyBarChart, ExpenseBreakdown } from "../components";

export default function Expenses({ transactions }) {
  return (
    <div>
      <div className="panel"><h3>Monthly Credit vs Debit (last 12 months)</h3><MonthlyBarChart transactions={transactions} /></div>
      <div className="panel"><h3>Expense Breakdown (this month vs last month, by goal)</h3><ExpenseBreakdown transactions={transactions} /></div>
    </div>
  );
}
