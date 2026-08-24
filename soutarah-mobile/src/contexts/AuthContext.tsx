import React, { createContext, useContext, useCallback, useEffect, useState, useMemo } from 'react';
import { api, clearToken, getToken, setToken } from '../api/client';
import { AuthResponse, Client, User, LoginPayload, RegisterPayload } from '../types';

interface AuthContextValue {
  user: User | null;
  client: Client | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaurer la session au démarrage
  useEffect(() => {
    (async () => {
      try {
        const stored = await getToken();
        if (stored) {
          setTokenState(stored);
          try {
            const data = await api.get<{ user: User; client: Client }>('/auth/me');
            setUser(data.user);
            setClient(data.client);
          } catch {
            await clearToken();
            setTokenState(null);
          }
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const data = await api.post<AuthResponse>('/auth/login', payload, false);
    await setToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
    setClient(data.client || null);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const data = await api.post<AuthResponse>('/auth/register', payload, false);
    await setToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
    setClient(data.client || null);
  }, []);

  const logout = useCallback(async () => {
    await clearToken();
    setTokenState(null);
    setUser(null);
    setClient(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    const data = await api.get<{ user: User; client: Client }>('/auth/me');
    setUser(data.user);
    setClient(data.client);
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      client,
      token,
      isLoading,
      isAuthenticated: !!token && !!user,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, client, token, isLoading, login, register, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
}