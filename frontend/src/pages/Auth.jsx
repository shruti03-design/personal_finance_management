// ==========================================================
// MODULE 1: User Authentication & Registration (Milestone 1)
// ==========================================================
import { useState } from "react";
import { api } from "../api";

export default function Auth({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api(isSignUp ? "/register" : "/login", "POST", form);
      localStorage.setItem("token", res.token);
      localStorage.setItem("username", res.username);
      onLogin(res.username);
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <form onSubmit={submit}>
          <h1>{isSignUp ? "Create Account" : "Sign In"}</h1>
          <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          {error && <p className="error">{error}</p>}
          <button className="dark">{isSignUp ? "SIGN UP" : "SIGN IN"}</button>
        </form>
        <div className="auth-side">
          <h1>{isSignUp ? "Welcome Back!" : "Hello...!"}</h1>
          <p>{isSignUp ? "Already have an account? Log in with your personal info" : "Enter your personal details and start your journey with us"}</p>
          <button className="outline" onClick={() => { setIsSignUp(!isSignUp); setError(""); }}>{isSignUp ? "SIGN IN" : "SIGN UP"}</button>
        </div>
      </div>
    </div>
  );
}
