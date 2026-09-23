import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiRequest } from "../api.js";

const MessagesContext = createContext(null);

export function MessagesProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(null); // null = checking, true/false after first attempt

  const refresh = useCallback(async () => {
    try {
      const data = await apiRequest("/telegram/messages");
      setMessages(data.messages || []);
      setConnected(true);
    } catch (err) {
      setConnected(false);
    }
  }, []);

  const sendReply = useCallback(async (text) => {
    await apiRequest("/telegram/reply", {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <MessagesContext.Provider value={{ messages, connected, refresh, sendReply }}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  return useContext(MessagesContext);
}
