// ==========================================================
// MODULE 7: Goal Setting & Tracking (Milestone 4)
// ==========================================================
import { useState } from "react";
import { api, money } from "../api";
import { Modal } from "../components";

export function GoalList({ goals, onDelete }) {
  return goals.map((g) => {
    const pct = Math.min(100, (g.progress / g.target) * 100);
    return (
      <div key={g.id} className="goal">
        <div className="row"><b>{g.name}</b><span>{money(g.progress)} / {money(g.target)} ({pct.toFixed(0)}%)</span></div>
        <div className="progress"><div style={{ width: pct + "%", background: pct >= 100 ? "#e74c3c" : "#5046e5" }} /></div>
        {onDelete && <button className="link" onClick={() => onDelete(g.id)}>Delete</button>}
      </div>
    );
  });
}

export default function Goals({ goals, reload }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="panel">
      <div className="row"><h3>Expense Goals by Category</h3><button onClick={() => setOpen(true)}>Add Goal</button></div>
      <p className="muted">Progress = total of all transactions tagged with the goal.</p>
      <GoalList goals={goals} onDelete={(id) => api(`/goals/${id}`, "DELETE").then(reload)} />
      {open && (
        <Modal title="Set New Goal" onClose={() => setOpen(false)}
          fields={[{ name: "name", label: "Goal Name" }, { name: "target", label: "Goal Target", type: "number" }]}
          onSubmit={(f) => api("/goals", "POST", f).then(reload)} />
      )}
    </div>
  );
}
