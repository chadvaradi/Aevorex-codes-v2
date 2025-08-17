import { useState } from 'react';
import { useAuth } from '../hooks/auth/useAuth';
import { useTheme } from '../hooks/ui/useTheme';

export const useHeaderLogic = (onDrawerToggle: () => void) => {
  const { user, logout } = useAuth();
  const { toggleTheme, theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const [showTickerDropdown, setShowTickerDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Recent tickers pulled from localStorage (persisted by ticker interactions). No mock data.
  const recentTickers = (() => {
    try {
      const raw = localStorage.getItem('recent_tickers');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter((t: unknown) => typeof t === 'string') : [];
    } catch {
      return [];
    }
  })();
  
  const handleTickerSelect = (ticker: string) => {
    setShowTickerDropdown(false);
    window.location.href = `/stock/${ticker}`;
  };
  
  const handleTickerClick = (symbol: string) => {
    window.location.href = `/stock/${symbol}`;
  };
  
  const handleLanguageSelect = (lang: string) => {
    setShowLanguageDropdown(false);
    console.log('Language changed to:', lang);
  };
  
  const handleLogout = () => {
    setShowAvatarDropdown(false);
    logout();
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/stock/${searchQuery.toUpperCase()}`;
    }
  };

  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
    onDrawerToggle();
  };

  // Chat gomb - scrollol le a chat section-höz
  const handleChatClick = () => {
    const chatSection = document.getElementById('chat-section');
    if (chatSection) {
      chatSection.scrollIntoView({ behavior: 'smooth' });
      // Dispatch custom event for chat section to handle
      document.dispatchEvent(new CustomEvent('chat:open'));
    }
  };

  return {
    user,
    logout,
    toggleTheme,
    isDarkMode,
    showTickerDropdown,
    setShowTickerDropdown,
    showLanguageDropdown,
    setShowLanguageDropdown,
    showAvatarDropdown,
    setShowAvatarDropdown,
    searchQuery,
    setSearchQuery,
    isDrawerOpen,
    recentTickers,
    handleTickerSelect,
    handleTickerClick,
    handleLanguageSelect,
    handleLogout,
    handleChatClick,
    handleSearch,
    handleDrawerToggle,
  };
}; 