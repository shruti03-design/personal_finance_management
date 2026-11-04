// ==========================================================
// MODULE 4: Transaction History (Milestone 2)
// ==========================================================
import { useState } from "react";
import { api, money, today } from "../api";
import { Modal } from "../components";

// Export transaction history to CSV for further analysis
function exportCsv(transactions) {
  const cols = ["date", "item", "type", "amount", "account", "goal", "payment_type"];
  const quote = (v) => '"' + String(v).replaceAll('"', '""') + '"';
  const csv = [cols.join(","), ...transactions.map((t) => cols.map((c) => quote(t[c])).join(","))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = "transactions.csv";
  a.click();
}

export default function Transactions({ transactions, accounts, goals, reload }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="row">
        <h3>Transaction Table</h3>
        <div><button onClick={() => exportCsv(transactions)}>Export CSV</button> <button onClick={() => setOpen(true)}>Add Transaction</button></div>
      </div>
      <table>
        <thead><tr><th>Item</th><th>Goal</th><th>Account Name</th><th>Date of Payment</th><th>Payment Type</th><th>Amount</th><th></th></tr></thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{t.item}</td><td>{t.goal}</td><td>{t.account}</td><td>{t.date}</td><td>{t.payment_type}</td>
              <td className={t.type === "credit" ? "greentext" : "red"}>{t.type === "credit" ? "+" : "-"}{money(t.amount)}</td>
              <td><button className="link" onClick={() => api(`/transactions/${t.id}`, "DELETE").then(reload)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {open && (
        <Modal title="Add Transaction" onClose={() => setOpen(false)}
          fields={[
            { name: "item", label: "Item" },
            { name: "account_id", label: "Account Name", options: accounts.map((a) => ({ value: a.id, label: a.name })) },
            { name: "goal_id", label: "Goal (optional)", optional: true, options: goals.map((g) => ({ value: g.id, label: g.name })) },
            { name: "type", label: "Credit / Debit", default: "debit", options: [{ value: "debit", label: "Debit (expense)" }, { value: "credit", label: "Credit (income)" }] },
            { name: "payment_type", label: "Payment Type", default: "Card", options: ["Card", "UPI", "Cash", "Bank Transfer"].map((v) => ({ value: v, label: v })) },
            { name: "date", label: "Date of Payment", type: "date", default: today() },
            { name: "amount", label: "Amount", type: "number" },
          ]}
          onSubmit={(f) => api("/transactions", "POST", { ...f, goal_id: f.goal_id || null }).then(reload)} />
      )}
    </div>
  );
}
