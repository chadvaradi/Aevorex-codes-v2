import { createContext, useState, useEffect, useCallback, ReactNode, useContext } from 'react';
import api from '../../lib/api';

// 1. Define the User and Auth Context Shape
export interface User {
  email?: string;
  name?: string;
  picture?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// 2. Create the Context with a default value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Create the AuthProvider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.get<{ authenticated: boolean; user: User }>('/api/v1/auth/status');
      if (data.authenticated && data.user) {
        setUser({
          name: data.user.name ?? '',
          email: data.user.email ?? '',
          picture: data.user.picture ?? '',
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const login = () => {
    window.location.href = '/api/v1/auth/login';
  };

  const logout = useCallback(async () => {
    try {
      await api.post('/api/v1/auth/logout', {});
      // After successful logout, re-check the status to update the UI
      await checkStatus();
    } catch {
      // Even if logout fails, try to sync state
      await checkStatus();
    }
  }, [checkStatus]);

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
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