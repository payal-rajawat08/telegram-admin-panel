import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function Login() {
  const { token, login, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (token) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "register") {
        await register(email, password);
        toast("Account created. Please log in.");
        setMode("login");
      } else {
        await login(email, password);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="authwrap">
      <div className="card authcard">
        <div className="authbrand">
          <div className="authlogo">TA</div>
          <div><b>Telegram Admin</b><small>Panel</small></div>
        </div>
        <div className="tabs2">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); }}>Login</button>
          <button type="button" className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setError(""); }}>Register</button>
        </div>
        {error && <div className="autherr show">{error}</div>}
        <form className="authform" onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input type="email" required placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" required minLength={6} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn primary" disabled={busy}>
            {busy ? (mode === "login" ? "Logging in..." : "Creating...") : (mode === "login" ? "Login" : "Create account")}
          </button>
        </form>
      </div>
    </div>
  );
}
