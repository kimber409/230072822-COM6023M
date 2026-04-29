import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import type { Session, User } from '../types/domain';

type AuthContextValue = {
  token: string;
  user: User | null;
  isAuthenticated: boolean;
  signIn: (session: Session) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Stores auth state in localStorage so refreshes keep the user signed in.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem('recruitflow_token') ?? '');
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('recruitflow_user');
    return raw ? JSON.parse(raw) as User : null;
  });

  const value = useMemo<AuthContextValue>(() => ({
    token,
    user,
    isAuthenticated: Boolean(token),
    signIn: (session) => {
      localStorage.setItem('recruitflow_token', session.token);
      localStorage.setItem('recruitflow_user', JSON.stringify(session.user));
      setToken(session.token);
      setUser(session.user);
    },
    signOut: () => {
      localStorage.removeItem('recruitflow_token');
      localStorage.removeItem('recruitflow_user');
      setToken('');
      setUser(null);
    }
  }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Small hook avoids importing the context directly in every component.
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
