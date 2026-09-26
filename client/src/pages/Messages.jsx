import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useMessages } from "../context/MessagesContext.jsx";
import MessageCard from "../components/MessageCard.jsx";

export default function Messages() {
  const { messages, groups, sendReply, sendMedia } = useMessages();

  const [search, setSearch] = useState("");
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [sendingMedia, setSendingMedia] = useState(false);

  const chatMessagesRef = useRef(null);

  const activeChatId = selectedChatId;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    let groupMessages = messages.filter(
      (m) => m.chatId === activeChatId
    );

    if (term) {
      groupMessages = groupMessages.filter(
        (m) =>
          (m.text || "").toLowerCase().includes(term) ||
          (m.sender || "").toLowerCase().includes(term)
      );
    }

    // Oldest → newest
    return [...groupMessages].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [messages, search, activeChatId]);

  // Keep chat at bottom when opening chat / receiving new messages
  useEffect(() => {
    const box = chatMessagesRef.current;

    if (box) {
      requestAnimationFrame(() => {
        box.scrollTop = box.scrollHeight;
      });
    }
  }, [activeChatId, messages.length]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;

    try {
      setSending(true);

      await sendReply(
        replyText,
        selectedMessage.chatId,
        selectedMessage.messageId
      );

      setReplyText("");
      setSelectedMessage(null);
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeChatId) return;

    try {
      setSendingMessage(true);

      await sendReply(messageText, activeChatId, null);

      setMessageText("");
    } catch (error) {
      console.error(error);
    } finally {
      setSendingMessage(false);
    }
  };
  const handleSendMedia = async (e) => {
  const file = e.target.files[0];

  if (!file || !activeChatId) return;

  try {
    setSendingMedia(true);

    await sendMedia(file, activeChatId);

    setSelectedFile(file);
    e.target.value = "";
  } catch (error) {
    console.error(error);
  } finally {
    setSendingMedia(false);
  }
};

  return (
    <div className="chat-layout">

      {/* LEFT — Groups */}
      <div className="chat-list">
        <h2>Chats</h2>

        {groups.map((group) => (
          <div
            key={group.chatId}
            className={`chat-item ${
              activeChatId === group.chatId ? "active" : ""
            }`}
            onClick={() => {
              setSelectedChatId(group.chatId);
              setSelectedMessage(null);
            }}
          >
            {group.title}
          </div>
        ))}
      </div>

      {/* RIGHT — Chat */}
      <div className="chat-window">

        {/* Chat Header */}
        <div className="chat-header">
          <h2>
            {groups.find((g) => g.chatId === activeChatId)?.title ||
              "Select a chat"}
          </h2>
        </div>

        {/* Messages */}
        <div className="chat-messages" ref={chatMessagesRef}>
          {filtered.length ? (
            filtered.map((m) => (
              <Fragment key={`${m.chatId}-${m.messageId}`}>

                <MessageCard
                  message={m}
                  onSelect={() => setSelectedMessage(m)}
                />

                {/* Reply appears directly below selected message */}
                {selectedMessage?.chatId === m.chatId &&
                  selectedMessage?.messageId === m.messageId && (
                    <div className="reply-box inline-reply-box">

                      <div className="reply-preview">
                        Replying to ~{selectedMessage.sender}:{" "}
                        {selectedMessage.text}
                      </div>

                      <div className="reply-input-row">
                        <input
                          type="text"
                          placeholder="Type your reply..."
                          value={replyText}
                          onChange={(e) =>
                            setReplyText(e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSendReply();
                            }
                          }}
                        />

                        <button
                          onClick={handleSendReply}
                          disabled={sending}
                        >
                          {sending ? "Sending..." : "Send"}
                        </button>
                      </div>

                    </div>
                  )}

              </Fragment>
            ))
          ) : (
            <div className="empty">No messages found</div>
          )}
        </div>
<div className="normal-message-box">

  <label className="file-button">
    📎
    <input
      type="file"
      hidden
      disabled={!activeChatId || sendingMedia}
      onChange={handleSendMedia}
    />
  </label>

  {selectedFile && (
    <div className="selected-file">
      📎 {selectedFile.name}
    </div>
  )}

  <input
    type="text"
    placeholder={
      activeChatId
        ? "Type a message..."
        : "Select a chat first"
    }
    value={messageText}
    disabled={!activeChatId || sendingMessage}
    onChange={(e) => setMessageText(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        handleSendMessage();
      }
    }}
  />

  <button
    onClick={handleSendMessage}
    disabled={
      !activeChatId ||
      !messageText.trim() ||
      sendingMessage
    }
  >
    {sendingMessage ? "Sending..." : "Send"}
  </button>

</div>
      </div>
    </div>
  );
}