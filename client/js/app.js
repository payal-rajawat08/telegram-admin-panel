if (!getToken()) {
  location.href = "index.html";
}

const content = document.getElementById("content");
const toastEl = document.getElementById("toast");
let currentPage = "dashboard";
let messages = [];
let searchTerm = "";

document.getElementById("userEmailLabel").textContent = getEmail() || "Admin";
document.getElementById("avatarInitial").textContent = (getEmail() || "A").charAt(0).toUpperCase();

function toast(msg, isErr) {
  toastEl.textContent = msg;
  toastEl.className = "toast show" + (isErr ? " err" : "");
  setTimeout(() => (toastEl.className = "toast"), 2500);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function fmtTime(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return "—";
  return d.toLocaleString();
}

function pageHead(title, sub) {
  return `<div class="head"><div><h1>${title}</h1><p>${sub}</p></div></div>`;
}

// ---------- navigation ----------
document.querySelectorAll(".nav[data-page]").forEach((el) => {
  el.addEventListener("click", () => setPage(el.dataset.page));
});

function setPage(page) {
  currentPage = page;
  document.querySelectorAll(".nav[data-page]").forEach((el) => {
    el.classList.toggle("active", el.dataset.page === page);
  });
  render();
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  clearSession();
  location.href = "index.html";
});

document.getElementById("globalSearch").addEventListener("input", (e) => {
  searchTerm = e.target.value.trim().toLowerCase();
  if (currentPage === "messages") renderMessages();
});

// ---------- data loading ----------
async function loadMessages() {
  try {
    const data = await apiRequest("/telegram/messages");
    messages = data.messages || [];
    document.getElementById("msgCount").textContent = messages.length;
    document.getElementById("apiStatus").className = "ok";
    document.getElementById("apiStatusText").textContent = "Connected";
    if (messages.length > 0) {
      document.getElementById("botStatus").className = "ok";
      document.getElementById("botStatusText").textContent = "Receiving";
    } else {
      document.getElementById("botStatus").className = "warnstat";
      document.getElementById("botStatusText").textContent = "No messages yet";
    }
  } catch (err) {
    document.getElementById("apiStatus").className = "offstat";
    document.getElementById("apiStatusText").textContent = "Offline";
    document.getElementById("botStatus").className = "offstat";
    document.getElementById("botStatusText").textContent = "Unknown";
  }
  render();
}

function filteredMessages() {
  if (!searchTerm) return messages;
  return messages.filter((m) =>
    (m.text || "").toLowerCase().includes(searchTerm) ||
    (m.sender || "").toLowerCase().includes(searchTerm)
  );
}

// ---------- render ----------
function render() {
  if (currentPage === "dashboard") renderDashboard();
  else if (currentPage === "messages") renderMessages();
  else if (currentPage === "settings") renderSettings();
}

function renderDashboard() {
  const uniqueSenders = new Set(messages.map((m) => m.sender)).size;
  const last = messages[0];
  content.innerHTML = `
    ${pageHead("Dashboard", "Overview of incoming Telegram messages and bot status")}
    <div class="kpis">
      <div class="card kpi"><div class="label">Total Messages</div><div class="value">${messages.length}</div><div class="sub">stored in database</div></div>
      <div class="card kpi"><div class="label">Unique Senders</div><div class="value">${uniqueSenders}</div><div class="sub">distinct people</div></div>
      <div class="card kpi"><div class="label">Last Activity</div><div class="value" style="font-size:15px">${last ? fmtTime(last.date) : "—"}</div><div class="sub">${last ? escapeHtml(last.sender) : "no messages"}</div></div>
      <div class="card kpi"><div class="label">Bot Status</div><div class="value" style="font-size:16px">${messages.length ? "Active" : "Waiting"}</div><div class="sub">Telegram group sync</div></div>
    </div>
    <div class="bottom">
      <div class="card">
        <h3>Recent Messages</h3>
        <div class="feed" id="recentFeed"></div>
      </div>
      <div class="card replybox">
        <h3>Send Reply to Telegram Group</h3>
        <label>Message</label>
        <textarea id="replyText" placeholder="Type a reply to send to the connected Telegram group…"></textarea>
        <div class="replyfoot">
          <button class="btn primary" id="sendReplyBtn">Send</button>
        </div>
      </div>
    </div>
  `;
  const feed = document.getElementById("recentFeed");
  const recent = messages.slice(0, 8);
  feed.innerHTML = recent.length
    ? recent.map(msgCard).join("")
    : `<div class="empty">No messages yet</div>`;
  document.getElementById("sendReplyBtn").addEventListener("click", sendReply);
}

function msgCard(m) {
  return `<div class="msgcard">
    <div class="msghead"><b>${escapeHtml(m.sender)}</b><small>${fmtTime(m.date)}</small></div>
    <div class="msgtext">${escapeHtml(m.text)}</div>
  </div>`;
}

function renderMessages() {
  const list = filteredMessages();
  content.innerHTML = `
    ${pageHead("Messages", "All messages synced from the connected Telegram group")}
    <div class="toolbar">
      <button class="btn" id="refreshBtn">⟳ Refresh</button>
      <span class="muted">${list.length} of ${messages.length} shown</span>
    </div>
    <div class="card">
      <div class="tablewrap">
        <table>
          <thead><tr><th>Sender</th><th>Chat ID</th><th>Message</th><th>Time</th></tr></thead>
          <tbody>
            ${list.length
              ? list.map((m) => `<tr>
                  <td>${escapeHtml(m.sender)}</td>
                  <td>${escapeHtml(m.chatId)}</td>
                  <td style="white-space:normal;max-width:420px">${escapeHtml(m.text)}</td>
                  <td>${fmtTime(m.date)}</td>
                </tr>`).join("")
              : `<tr><td colspan="4"><div class="empty">No messages found</div></td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;
  document.getElementById("refreshBtn").addEventListener("click", loadMessages);
}

function renderSettings() {
  content.innerHTML = `
    ${pageHead("Settings", "Account and connection details")}
    <div class="settingsgrid">
      <div class="card">
        <h3>Account</h3>
        <div class="kv"><span class="muted">Logged in as</span><b>${escapeHtml(getEmail() || "—")}</b></div>
        <div class="kv"><span class="muted">Role</span><b>Super Admin</b></div>
      </div>
      <div class="card">
        <h3>Connection</h3>
        <div class="kv"><span class="muted">API base</span><b>${API_BASE}</b></div>
        <div class="kv"><span class="muted">Stored messages</span><b>${messages.length}</b></div>
      </div>
    </div>
  `;
}

async function sendReply() {
  const textEl = document.getElementById("replyText");
  const text = textEl.value.trim();
  if (!text) {
    toast("Type a message first", true);
    return;
  }
  const btn = document.getElementById("sendReplyBtn");
  btn.disabled = true;
  btn.textContent = "Sending…";
  try {
    await apiRequest("/telegram/reply", {
      method: "POST",
      body: JSON.stringify({ text }),
    });
    toast("Reply sent to Telegram group");
    textEl.value = "";
  } catch (err) {
    toast(err.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = "Send";
  }
}

function tickClock() {
  document.getElementById("clockText").textContent = new Date().toLocaleTimeString();
}
setInterval(tickClock, 1000);
tickClock();

loadMessages();
setInterval(loadMessages, 5000);
