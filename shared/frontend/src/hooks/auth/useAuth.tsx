import { createContext, useState, useEffect, useCallback, ReactNode, useContext } from 'react';
import { setAuthToken } from '../../lib/api';

// 1. Define the User and Auth Context Shape
export interface User {
  email?: string;
  name?: string;
  picture?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  plan: 'free' | 'pro' | 'team' | 'enterprise';
}

// 2. Create the Context with a default value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Create the AuthProvider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [plan, setPlan] = useState<'free' | 'pro' | 'team' | 'enterprise'>('free');
  // Track GIS availability internally; do not export to avoid unused warnings
  const [gisReady, setGisReady] = useState<boolean>(false);
  const [hasIdToken, setHasIdToken] = useState<boolean>(false);
  // Read once to satisfy noUnusedLocals in strict builds where usage can be tree-shaken
  void gisReady;

  const checkStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const apiBase = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
      const base = apiBase ? (apiBase as string).replace(/\/+$/, '') : '';
      const url = base ? `${base}/api/v1/auth/status` : `/api/v1/auth/status`;
      // Include credentials so session cookie set by backend is sent back in dev
      const res = await fetch(url, { credentials: 'include' });
      const response = await res.json();
      if (response.status === 'authenticated' && response.user) {
        setUser({
          name: response.user.name ?? '',
          email: response.user.email ?? '',
          picture: response.user.picture ?? '',
        });
        setPlan(response.plan ?? 'free');
      } else {
        // In IAM/Gateway mode the backend /auth/status may return unauthenticated
        // even when the browser has a valid Google ID token (Authorization header).
        // If we already possess an ID token, keep the client-side identity derived
        // from the token instead of clearing the user.
        if (!hasIdToken) {
          setUser(null);
          setPlan('free');
        }
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [hasIdToken]);

  // Google Identity Services init → One Tap / prompt
  useEffect(() => {
    // Load GIS only in browser
    if (typeof window === 'undefined') return;
    // Rehydrate ID token from sessionStorage (persist across reload)
    try {
      const saved = sessionStorage.getItem('id_token');
      if (saved) {
        setAuthToken(saved);
        setHasIdToken(true);
        try {
          const payload = JSON.parse(atob(saved.split('.')[1] || '')) || {};
          setUser({
            name: payload?.name || payload?.given_name || '',
            email: payload?.email || '',
            picture: payload?.picture || '',
          });
        } catch {}
      }
    } catch {}
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string | undefined;

    // In local dev, disable GIS unless explicitly enabled to avoid GSI origin errors
    const isDev = (import.meta as any).env?.DEV;
    const gisDevEnabled = String((import.meta as any).env?.VITE_GIS_ENABLE_DEV || '')
      .toLowerCase() === 'true';
    if (isDev && !gisDevEnabled) {
      checkStatus();
      setGisReady(false);
      return;
    }

    if (!clientId || !(window as any).google?.accounts?.id) {
      // If GIS script not present or clientId missing, just do status check
      checkStatus();
      setGisReady(false);
      return;
    }

    // Callback invoked by GIS with a credential (ID token)
    const handleCredential = (resp: { credential?: string }) => {
      const token = resp?.credential || null;
      setAuthToken(token);
      setHasIdToken(!!token);
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1] || '')) || {};
          setUser({
            name: payload?.name || payload?.given_name || '',
            email: payload?.email || '',
            picture: payload?.picture || '',
          });
          // Persist token for this session so a reload does not drop Authorization
          sessionStorage.setItem('id_token', token);
        } catch {
          // Silent fail; user state will be reconciled by /status
        }
      } else {
        setUser(null);
      }
      // Do not immediately clear user on unauthenticated /auth/status in Gateway mode.
      // The periodic/status-driven reconciliation will still run on mount.
    };

    try {
      (window as any).google.accounts.id.initialize({ client_id: clientId, callback: handleCredential });
      setGisReady(true);
      // Optional auto-prompt, can be disabled via env for strict redirect-only mode
      const autoPrompt = String((import.meta as any).env?.VITE_GIS_AUTO_PROMPT || '').toLowerCase() === 'true';
      if (autoPrompt) {
        (window as any).google.accounts.id.prompt();
      }
    } catch {
      // Ignore init errors in dev; backend status still runs
      setGisReady(false);
    }

    // Initial status check (in case user already authenticated via cookie/session)
    checkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Revalidate auth status on app focus/visibility changes to reconcile session after redirects
  useEffect(() => {
    const onFocus = () => { void checkStatus(); };
    const onVisibility = () => { if (document.visibilityState === 'visible') void checkStatus(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [checkStatus]);

  const login = async () => {
    // Prefer GIS prompt on user gesture; if not displayed/skipped → immediate redirect
    const g = (window as any).google?.accounts?.id;
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string | undefined;
    const isDev = (import.meta as any).env?.DEV;
    const gisDevEnabled = String((import.meta as any).env?.VITE_GIS_ENABLE_DEV || '').toLowerCase() === 'true';

    const apiBaseEnv = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
    const base = (() => {
      if (apiBaseEnv && /^https?:\/\//i.test(apiBaseEnv)) return apiBaseEnv.replace(/\/+$/, '');
      if (typeof window !== 'undefined') {
        const { protocol, port } = window.location;
        if (port === '8083') return `${protocol}//localhost:8084`;
        return window.location.origin;
      }
      return '';
    })();
    const next = encodeURIComponent(window.location.href);
    const redirectUrl = base ? `${base}/api/v1/auth/login?redirect=1&next=${next}` : `/api/v1/auth/login?redirect=1&next=${next}`;

    if (g && clientId && (!isDev || gisDevEnabled)) {
      try {
        // Ensure initialize exists; attach a lightweight callback to capture token if provided
        try {
          (window as any).google.accounts.id.initialize({
            client_id: clientId,
            callback: (resp: any) => {
              const token = resp?.credential;
              if (token) {
                setAuthToken(token);
                sessionStorage.setItem('id_token', token);
                setHasIdToken(true);
                checkStatus();
              }
            },
          });
        } catch {}

        g.prompt((notification: any) => {
          const notDisplayed = typeof notification?.isNotDisplayed === 'function' && notification.isNotDisplayed();
          const skipped = typeof notification?.isSkippedMoment === 'function' && notification.isSkippedMoment();
          if (notDisplayed || skipped) {
            // Fallback: redirect-based OAuth via gateway
            try { window.location.assign(redirectUrl); } catch { window.location.href = redirectUrl; }
          }
        });
        return;
      } catch {
        // fall through to redirect
      }
    }

    // Redirect-only fallback
    try { window.location.assign(redirectUrl); } catch { window.location.href = redirectUrl; }
  };

  const logout = useCallback(async () => {
    try {
      setAuthToken(null);
      (window as any).google?.accounts?.id?.disableAutoSelect?.();
      const apiBase = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
      const base = apiBase ? (apiBase as string).replace(/\/+$/, '') : '';
      const url = base ? `${base}/api/v1/auth/logout` : `/api/v1/auth/logout`;
      await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      await checkStatus();
    } catch {
      await checkStatus();
    }
  }, [checkStatus]);

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    plan,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 4. Create the custom hook for easy consumption
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider; 