import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { authApi } from './api';

interface AuthCtx {
  token: string | null;
  fullName: string | null;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [fullName, setFullName] = useState<string | null>(() => localStorage.getItem('fullName'));

  const login = useCallback(async (phone: string, password: string) => {
    const { data } = await authApi.login({ phone, password });
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('fullName', data.fullName);
    setToken(data.accessToken);
    setFullName(data.fullName);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('fullName');
    setToken(null);
    setFullName(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, fullName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
