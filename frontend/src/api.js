export async function api(path, method = "GET", body) {
  const res = await fetch("/api" + path, {
    method,
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + localStorage.getItem("token") },
    body: body && JSON.stringify(body),
  });
  const data = await res.json();
  if (res.status === 401 && localStorage.getItem("token")) { localStorage.clear(); location.reload(); }
  if (!res.ok) throw new Error(data.detail?.[0]?.msg || data.detail || "Request failed");
  return data;
}

export const money = (n) => "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });
export const today = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD, local time
export const daysUntil = (d) => Math.round((new Date(d) - new Date(today())) / 86400000);
