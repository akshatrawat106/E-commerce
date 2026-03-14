import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { api } from "@/lib/api";

interface AuthData {
  token: string;
  role: string;
  userId: string;
  name: string;
  email: string;
}

interface AuthContextType {
  auth: AuthData | null;
  handleAuth: (data: AuthData) => void;
  handleLogout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthData | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("vortex_auth");
    if (saved) {
      const p = JSON.parse(saved);
      api.setToken(p.token);
      setAuth(p);
    }
  }, []);

  const handleAuth = useCallback((data: AuthData) => {
    sessionStorage.setItem("vortex_auth", JSON.stringify(data));
    api.setToken(data.token);
    setAuth(data);
  }, []);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("vortex_auth");
    api.clearToken();
    setAuth(null);
  }, []);

  return (
    <AuthContext.Provider value={{ auth, handleAuth, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};
