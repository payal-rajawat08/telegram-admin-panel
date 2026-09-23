import { createContext, useContext, useState, useCallback } from "react";
import { apiRequest, getToken, getEmail, setSession, clearSession } from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken());
  const [email, setEmail] = useState(getEmail());

  const login = useCallback(async (loginEmail, password) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: loginEmail, password }),
    });
    setSession(data.token, loginEmail);
    setToken(data.token);
    setEmail(loginEmail);
  }, []);

  const register = useCallback(async (regEmail, password) => {
    await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email: regEmail, password }),
    });
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setEmail(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, email, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
