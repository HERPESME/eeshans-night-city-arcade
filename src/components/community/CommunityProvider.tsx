import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { useLocation } from 'react-router-dom';

type CommunityContext = {
  user: User | null;
  ready: boolean;
  openLogin: () => void;
  loginOpen: boolean;
  setLoginOpen: (open: boolean) => void;
  authError: string;
};
const Context = createContext<CommunityContext | null>(null);

export function CommunityProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [authError, setAuthError] = useState('');
  useEffect(() => {
    if (!pathname.startsWith('/blogs') && !loginOpen) return;
    let disposed = false;
    let unsubscribe: (() => void) | undefined;
    Promise.all([import('@/lib/community-auth'), import('firebase/auth')]).then(([{ communityAuth }, sdk]) => {
      if (disposed) return;
      unsubscribe = sdk.onAuthStateChanged(communityAuth, current => { setUser(current); setReady(true); }, () => {
        setAuthError('Account connection unavailable. Please try again.'); setReady(true);
      });
    }).catch(() => { if (!disposed) { setAuthError('Account connection unavailable. Please try again.'); setReady(true); } });
    return () => { disposed = true; unsubscribe?.(); };
  }, [pathname, loginOpen]);
  const openLogin = useCallback(() => setLoginOpen(true), []);
  return <Context.Provider value={{ user, ready, loginOpen, setLoginOpen, openLogin, authError }}>{children}</Context.Provider>;
}

export function useCommunity() {
  const value = useContext(Context);
  if (!value) throw new Error('CommunityProvider is required');
  return value;
}
