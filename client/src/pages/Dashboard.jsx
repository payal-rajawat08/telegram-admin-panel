import { useMemo, useState } from "react";
import { useMessages } from "../context/MessagesContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { fmtTime } from "../helpers.js";
import MessageCard from "../components/MessageCard.jsx";

export default function Dashboard() {
  const { messages, sendReply } = useMessages();
  const toast = useToast();
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const uniqueSenders = useMemo(() => new Set(messages.map((m) => m.sender)).size, [messages]);
  const last = messages[0];
  const recent = messages.slice(0, 8);

  const handleSend = async () => {
    const text = replyText.trim();
    if (!text) {
      toast("Type a message first", true);
      return;
    }
    setSending(true);
    try {
      await sendReply(text);
      toast("Reply sent to Telegram group");
      setReplyText("");
    } catch (err) {
      toast(err.message, true);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="head">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of incoming Telegram messages and bot status</p>
        </div>
      </div>

      <div className="kpis">
        <div className="card kpi">
          <div className="label">Total Messages</div>
          <div className="value">{messages.length}</div>
          <div className="sub">stored in database</div>
        </div>
        <div className="card kpi">
          <div className="label">Unique Senders</div>
          <div className="value">{uniqueSenders}</div>
          <div className="sub">distinct people</div>
        </div>
        <div className="card kpi">
          <div className="label" style={{ fontSize: 15 }}>Last Activity</div>
          <div className="value" style={{ fontSize: 15 }}>{last ? fmtTime(last.date) : "—"}</div>
          <div className="sub">{last ? last.sender : "no messages"}</div>
        </div>
        <div className="card kpi">
          <div className="label">Bot Status</div>
          <div className="value" style={{ fontSize: 16 }}>{messages.length ? "Active" : "Waiting"}</div>
          <div className="sub">Telegram group sync</div>
        </div>
      </div>

      <div className="bottom">
        <div className="card">
          <h3>Recent Messages</h3>
          <div className="feed">
            {recent.length ? recent.map((m) => <MessageCard key={m.messageId} message={m} />) : <div className="empty">No messages yet</div>}
          </div>
        </div>
        <div className="card replybox">
          <h3>Send Reply to Telegram Group</h3>
          <label>Message</label>
          <textarea
            placeholder="Type a reply to send to the connected Telegram group…"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <div className="replyfoot">
            <button className="btn primary" onClick={handleSend} disabled={sending}>
              {sending ? "Sending…" : "Send"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
