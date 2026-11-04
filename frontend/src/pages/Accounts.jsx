// ==========================================================
// MODULE 2: Accounts Management (Milestone 1)
// ==========================================================
import { useState } from "react";
import { api, money } from "../api";
import { Modal } from "../components";

export default function Accounts({ accounts, reload }) {
  const [open, setOpen] = useState(false);
  const total = accounts.reduce((s, a) => s + a.balance, 0);
  return (
    <div>
      <div className="row"><h3>Total Balance: {money(total)}</h3><button onClick={() => setOpen(true)}>Add Account</button></div>
      <div className="cards">
        {accounts.map((a) => (
          <div key={a.id} className="card">
            <div className="chip" />
            <div>**** **** **** {a.last4 || "----"}</div>
            <div className="row"><span>{a.name}</span><small>{a.card_type}</small></div>
            <h3>{money(a.balance)}</h3>
            <button className="link" onClick={() => confirm("Delete account and its transactions?") && api(`/accounts/${a.id}`, "DELETE").then(reload)}>Delete</button>
          </div>
        ))}
      </div>
      {open && (
        <Modal title="Add Account" onClose={() => setOpen(false)}
          fields={[
            { name: "name", label: "Account / Card Name" },
            { name: "card_number", label: "Card Number (only last 4 digits are stored)", optional: true },
            { name: "card_type", label: "Type", default: "Debit", options: ["Debit", "Credit", "Savings", "Cash"].map((v) => ({ value: v, label: v })) },
            { name: "balance", label: "Opening Balance", type: "number" },
          ]}
          onSubmit={(f) => api("/accounts", "POST", f).then(reload)} />
      )}
    </div>
  );
}
