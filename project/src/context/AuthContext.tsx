import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('vconnect_user');
    const storedToken = localStorage.getItem('vconnect_token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('vconnect_user');
        localStorage.removeItem('vconnect_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem('vconnect_user', JSON.stringify(userData));
    localStorage.setItem('vconnect_token', token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('vconnect_user');
    localStorage.removeItem('vconnect_token');
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem('vconnect_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
