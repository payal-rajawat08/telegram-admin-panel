import { useMemo, useState } from "react";
import { useMessages } from "../context/MessagesContext.jsx";
import { fmtTime } from "../helpers.js";

export default function Messages() {
  const { messages, refresh } = useMessages();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return messages;
    return messages.filter(
      (m) => (m.text || "").toLowerCase().includes(term) || (m.sender || "").toLowerCase().includes(term)
    );
  }, [messages, search]);

  return (
    <>
      <div className="head">
        <div>
          <h1>Messages</h1>
          <p>All messages synced from the connected Telegram group</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="search">
          ⌕ <input placeholder="Search sender or text…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button className="btn" onClick={refresh}>⟳ Refresh</button>
        <span className="muted">{filtered.length} of {messages.length} shown</span>
      </div>

      <div className="card">
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Sender</th>
                <th>Chat ID</th>
                <th>Message</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? (
                filtered.map((m) => (
                  <tr key={m.messageId}>
                    <td>{m.sender}</td>
                    <td>{m.chatId}</td>
                    <td style={{ whiteSpace: "normal", maxWidth: 420 }}>{m.text}</td>
                    <td>{fmtTime(m.date)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>
                    <div className="empty">No messages found</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
