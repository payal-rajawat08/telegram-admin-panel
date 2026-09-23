import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useMessages } from "../context/MessagesContext.jsx";

function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function AppLayout() {
  const { email, logout } = useAuth();
  const { messages, connected } = useMessages();
  const navigate = useNavigate();
  const clock = useClock();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const apiStatusClass = connected === null ? "warnstat" : connected ? "ok" : "offstat";
  const apiStatusText = connected === null ? "Checking…" : connected ? "Connected" : "Offline";
  const botStatusClass = connected && messages.length > 0 ? "ok" : "warnstat";
  const botStatusText = connected && messages.length > 0 ? "Receiving" : "No messages yet";

  return (
    <div className="app">
      <aside className="side">
        <div className="brand">
          <div className="brandlogo">TA</div>
          <div><b>TELEGRAM ADMIN</b><small>Panel</small></div>
        </div>
        <div className="sect">MAIN</div>
        <NavLink to="/dashboard" className={({ isActive }) => "nav" + (isActive ? " active" : "")}>
          <i>⌂</i><span>Dashboard</span>
        </NavLink>
        <NavLink to="/messages" className={({ isActive }) => "nav" + (isActive ? " active" : "")}>
          <i>✉</i><span>Messages</span><em className="count">{messages.length}</em>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => "nav" + (isActive ? " active" : "")}>
          <i>⚙</i><span>Settings</span>
        </NavLink>
        <div className="system">
          <b>SYSTEM STATUS</b>
          <p><span className={apiStatusClass}>● API Service</span><span>{apiStatusText}</span></p>
          <p><span className={botStatusClass}>● Telegram Bot</span><span>{botStatusText}</span></p>
        </div>
        <button className="btn danger" onClick={handleLogout}>Logout</button>
      </aside>
      <main className="main">
        <header className="top">
          <div className="push"></div>
          <span className="muted">{clock.toLocaleTimeString()}</span>
          <div className="avatar">{(email || "A").charAt(0).toUpperCase()}</div>
          <b>{email || "Admin"}</b>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
