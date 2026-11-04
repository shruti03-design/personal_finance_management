import { useEffect, useState } from "react";
import { api, daysUntil } from "./api";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Transactions from "./pages/Transactions";
import Bills from "./pages/Bills";
import Expenses from "./pages/Expenses";
import Goals from "./pages/Goals";

const PAGES = { Dashboard, Balances: Accounts, Transactions, Bills, Expenses, Goals };

export default function App() {
  const [user, setUser] = useState(localStorage.getItem("username"));
  const [page, setPage] = useState("Dashboard");
  const [data, setData] = useState({ accounts: [], transactions: [], bills: [], goals: [] });
  const [showAlerts, setShowAlerts] = useState(false);

  // All data lives here, so every page and the bell update together after any change
  // MODULE 8: real-time updates - after any change, all data is reloaded
  const reload = async () => {
    const [accounts, transactions, bills, goals] = await Promise.all(
      ["/accounts", "/transactions", "/bills", "/goals"].map((p) => api(p)));
    setData({ accounts, transactions, bills, goals });
  };
  useEffect(() => { if (user) reload(); }, [user]);

  // MODULE 1: not logged in -> show Sign In / Sign Up page
  if (!user) return <Auth onLogin={setUser} />;

  // MODULE 5: Bill reminders - bills due within 3 days or overdue (shown in bell + banner)
  const dueSoon = data.bills.filter((b) => !b.paid_on && daysUntil(b.due_date) <= 3);
  const Page = PAGES[page];
  return (
    <div className="layout">
      <aside>
        <h2>💰 PFMS</h2>
        {Object.keys(PAGES).map((p) => (
          <button key={p} className={p === page ? "nav active" : "nav"} onClick={() => setPage(p)}>{p}</button>
        ))}
        <button className="nav logout" onClick={() => { localStorage.clear(); setUser(null); }}>Logout ({user})</button>
      </aside>
      <main>
        <header>
          <div><h2>Hi, {user}</h2><small>{new Date().toDateString()}</small></div>
          <div className="bell" onClick={() => setShowAlerts(!showAlerts)}>
            🔔{dueSoon.length > 0 && <span className="badge">{dueSoon.length}</span>}
            {showAlerts && (
              <div className="alerts">
                {dueSoon.length ? dueSoon.map((b) => {
                  const d = daysUntil(b.due_date);
                  return <div key={b.id}>{b.name}: {d < 0 ? `overdue by ${-d} day(s)` : d === 0 ? "due today" : `due in ${d} day(s)`}</div>;
                }) : "No bills due soon"}
              </div>
            )}
          </div>
        </header>
        {dueSoon.length > 0 && <div className="reminder">⚠ You have {dueSoon.length} bill(s) due within 3 days.</div>}
        <Page {...data} reload={reload} />
      </main>
    </div>
  );
}
