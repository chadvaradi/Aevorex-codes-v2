import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTheme } from './useTheme.tsx';

interface UserPreferencesContextValue {
  favoriteIndicators: string[];
  toggleFavoriteIndicator: (id: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextValue | undefined>(undefined);

interface UserPreferencesProviderProps { children: ReactNode; }

export const UserPreferencesProvider: React.FC<UserPreferencesProviderProps> = ({ children }) => {
  const { theme, toggleTheme } = useTheme();
  const [favoriteIndicators, setFavoriteIndicators] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('favoriteIndicators');
        return stored ? (JSON.parse(stored) as string[]) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('favoriteIndicators', JSON.stringify(favoriteIndicators));
    }
  }, [favoriteIndicators]);

  const toggleFavoriteIndicator = (id: string) => {
    setFavoriteIndicators((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  return (
    <UserPreferencesContext.Provider
      value={{ favoriteIndicators, toggleFavoriteIndicator, theme, toggleTheme }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within UserPreferencesProvider');
  }
  return context;
}; 