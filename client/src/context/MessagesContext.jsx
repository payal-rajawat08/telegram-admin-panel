import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { io } from "socket.io-client";
import { apiRequest } from "../api.js";

const MessagesContext = createContext(null);

export function MessagesProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [connected, setConnected] = useState(null);
  const { userId } = useAuth();

  // Load messages from API
  const refresh = useCallback(async () => {
    try {
      const data = await apiRequest("/telegram/messages");
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  }, []);

  // Load groups from API
  const refreshGroups = useCallback(async () => {
    try {
      const data = await apiRequest("/telegram/groups");
      setGroups(data.groups || []);
    } catch (err) {
      console.error("Failed to load groups", err);
    }
  }, []);

  // Send Telegram message / reply
  const sendReply = useCallback(async (text, chatId, messageId) => {
    await apiRequest("/telegram/reply", {
      method: "POST",
      body: JSON.stringify({
        text,
        chatId,
        messageId,
      }),
    });
  }, []);
  const sendMedia = useCallback(async (file, chatId) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("chatId", chatId);

  await apiRequest("/telegram/media", {
    method: "POST",
    body: formData,
  });
}, []);

useEffect(() => {
    // Initial data
    refresh();
    refreshGroups();

// Socket connection
const socket = io(import.meta.env.VITE_SERVER_URL, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  query: { userId },
});

socket.on("connect", () => {
  console.log("Socket connected");
  setConnected(true);
});

    // New Telegram message
    socket.on("newMessage", (message) => {
      setMessages((prev) => {
        const exists = prev.some(
          (m) =>
            m.chatId === message.chatId &&
            m.messageId === message.messageId
        );

        if (exists) return prev;

        return [...prev, message];
      });
    });

    // New Telegram group
    socket.on("newGroup", (group) => {
      setGroups((prev) => {
        const exists = prev.some(
          (g) => g.chatId === group.chatId
        );

        if (exists) {
          return prev.map((g) =>
            g.chatId === group.chatId ? group : g
          );
        }

        return [...prev, group];
      });
    });
    socket.on("groupDeleted", (chatId) => {
    setGroups((prev) =>
    prev.filter((group) => group.chatId !== chatId)
  );
});

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [refresh, refreshGroups]);

  return (
    <MessagesContext.Provider
      value={{
        messages,
        groups,
        connected,
        refresh,
        refreshGroups,
        sendReply,
        sendMedia,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  return useContext(MessagesContext);
}