import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import api from '../api/client';
import type { User, LoginForm, RegisterForm } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginForm) => Promise<void>;
  register: (data: RegisterForm) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  requestVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch {
      setUser(null);
    }
  }, []);

  // Check auth on mount
  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  // Listen for forced logout from interceptor
  useEffect(() => {
    const handler = () => setUser(null);
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const login = async (data: LoginForm) => {
    const res = await api.post('/auth/login', data);
    setUser(res.data);
  };

  const register = async (data: RegisterForm) => {
    const res = await api.post('/auth/register', data);
    setUser(res.data);
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  const requestVerification = async () => {
    await api.post('/auth/request-verification');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        requestVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
