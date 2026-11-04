// ==========================================================
// MODULE 5: Bill Management (Milestone 3)
// Reminder bell/banner for due bills lives in App.jsx
// ==========================================================
import { useState } from "react";
import { api, money, daysUntil } from "../api";
import { Modal } from "../components";

export default function Bills({ bills, reload }) {
  const [open, setOpen] = useState(false);
  const upcoming = bills.filter((b) => !b.paid_on);
  const paid = bills.filter((b) => b.paid_on);
  return (
    <div>
      <div className="row"><h3>Upcoming Bills</h3><button onClick={() => setOpen(true)}>Add Bill</button></div>
      <table>
        <thead><tr><th>Bill Name</th><th>Item Description</th><th>Due Date</th><th>Amount</th><th></th></tr></thead>
        <tbody>
          {upcoming.map((b) => {
            const d = daysUntil(b.due_date);
            return (
              <tr key={b.id} className={d < 0 ? "overdue" : d <= 3 ? "soon" : ""}>
                <td>{b.name}</td><td>{b.description}</td>
                <td>{b.due_date} {d < 0 ? "(overdue)" : d <= 3 ? `(in ${d} day${d === 1 ? "" : "s"})` : ""}</td>
                <td>{money(b.amount)}</td>
                <td>
                  <button className="link" onClick={() => api(`/bills/${b.id}/pay`, "POST").then(reload)}>Mark paid</button>{" "}
                  <button className="link" onClick={() => api(`/bills/${b.id}`, "DELETE").then(reload)}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <h3>Payment History</h3>
      <table>
        <thead><tr><th>Bill Name</th><th>Due Date</th><th>Paid On</th><th>Amount</th></tr></thead>
        <tbody>{paid.map((b) => <tr key={b.id}><td>{b.name}</td><td>{b.due_date}</td><td>{b.paid_on}</td><td>{money(b.amount)}</td></tr>)}</tbody>
      </table>
      {open && (
        <Modal title="Add New Bill" onClose={() => setOpen(false)}
          fields={[
            { name: "name", label: "Bill Name" },
            { name: "description", label: "Item Description", optional: true },
            { name: "due_date", label: "Due Date", type: "date" },
            { name: "amount", label: "Amount", type: "number" },
          ]}
          onSubmit={(f) => api("/bills", "POST", f).then(reload)} />
      )}
    </div>
  );
}
