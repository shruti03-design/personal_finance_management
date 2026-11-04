import { useState } from "react";

const ym = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; // local YYYY-MM

// Shared popup form used by Modules 2, 4, 5 and 7 (Add Account / Transaction / Bill / Goal)
export function Modal({ title, fields, onSubmit, onClose }) {
  const [form, setForm] = useState(Object.fromEntries(fields.map((f) => [f.name, f.default ?? ""])));
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try { await onSubmit(form); onClose(); } catch (err) { setError(err.message); }
  };
  return (
    <div className="overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3>{title} <span className="close" onClick={onClose}>×</span></h3>
        {fields.map((f) => (
          <label key={f.name}>{f.label}
            {f.options ? (
              <select value={form[f.name]} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} required={!f.optional}>
                <option value="">Select...</option>
                {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : (
              <input type={f.type || "text"} value={form[f.name]} step="0.01" required={!f.optional}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
            )}
          </label>
        ))}
        {error && <p className="error">{error}</p>}
        <button className="green">Submit</button>
      </form>
    </div>
  );
}

// MODULE 6 (Expenses) + MODULE 8 (Dashboard): monthly bar graph
// Simple CSS bar chart: credits vs debits for the last 12 months
export function MonthlyBarChart({ transactions }) {
  const months = [...Array(12)].map((_, i) => {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 11 + i);
    return ym(d);
  });
  const sum = (m, type) => transactions.filter((t) => t.date.startsWith(m) && t.type === type).reduce((s, t) => s + t.amount, 0);
  const data = months.map((m) => ({ m, credit: sum(m, "credit"), debit: sum(m, "debit") }));
  const max = Math.max(1, ...data.flatMap((d) => [d.credit, d.debit]));
  return (
    <div>
      <div className="legend"><span className="sw credit" /> Credit <span className="sw debit" /> Debit</div>
      <div className="chart">
        {data.map((d) => (
          <div key={d.m} className="col" title={`${d.m}\nCredit: ${d.credit}\nDebit: ${d.debit}`}>
            <div className="bars">
              <div className="bar credit" style={{ height: (d.credit / max) * 100 + "%" }} />
              <div className="bar debit" style={{ height: (d.debit / max) * 100 + "%" }} />
            </div>
            <small>{new Date(d.m + "-01T00:00").toLocaleString("en", { month: "short", year: "2-digit" })}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

// MODULE 6 (Expenses) + MODULE 8 (Dashboard): expense breakdown by category (goal)
// Debits this month per goal, with % change vs last month
export function ExpenseBreakdown({ transactions }) {
  const d = new Date(); const thisM = ym(d);
  d.setDate(1); d.setMonth(d.getMonth() - 1); const lastM = ym(d);
  const spent = (m, g) => transactions.filter((t) => t.type === "debit" && t.date.startsWith(m) && (t.goal || "Other") === g).reduce((s, t) => s + t.amount, 0);
  const cats = [...new Set(transactions.filter((t) => t.type === "debit").map((t) => t.goal || "Other"))];
  const rows = cats.map((c) => ({ c, now: spent(thisM, c), prev: spent(lastM, c) })).filter((r) => r.now || r.prev);
  if (!rows.length) return <p className="muted">No expenses in the last two months.</p>;
  return (
    <div className="tiles">
      {rows.map((r) => {
        const pct = r.prev ? ((r.now - r.prev) / r.prev) * 100 : 100;
        return (
          <div key={r.c} className="tile">
            <b>{r.c}</b> <span className={pct > 0 ? "red" : "greentext"}>{pct > 0 ? "▲" : "▼"} {Math.abs(pct).toFixed(0)}%</span>
            <div className="amount">₹{r.now.toFixed(2)}</div>
            <small className="muted">last month ₹{r.prev.toFixed(2)}</small>
          </div>
        );
      })}
    </div>
  );
}
