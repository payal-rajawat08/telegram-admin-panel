import { useAuth } from "../context/AuthContext.jsx";
import { useMessages } from "../context/MessagesContext.jsx";
import { API_BASE } from "../api.js";

export default function Settings() {
  const { email } = useAuth();
  const { messages } = useMessages();

  return (
    <>
      <div className="head">
        <div>
          <h1>Settings</h1>
          <p>Account and connection details</p>
        </div>
      </div>

      <div className="settingsgrid">
        <div className="card">
          <h3>Account</h3>
          <div className="kv"><span className="muted">Logged in as</span><b>{email || "—"}</b></div>
          <div className="kv"><span className="muted">Role</span><b>Super Admin</b></div>
        </div>
        <div className="card">
          <h3>Connection</h3>
          <div className="kv"><span className="muted">API base</span><b>{API_BASE}</b></div>
          <div className="kv"><span className="muted">Stored messages</span><b>{messages.length}</b></div>
        </div>
      </div>
    </>
  );
}
