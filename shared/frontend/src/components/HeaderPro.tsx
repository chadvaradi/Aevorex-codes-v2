import React from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, BellIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { ChatBubbleLeftIcon, SunIcon, MoonIcon, Bars3Icon } from '@heroicons/react/24/solid';
import { useHeaderLogic } from './HeaderPro.logic';
import { TickerDropdown, LanguageDropdown, AvatarDropdown } from './HeaderPro.dropdowns';

interface HeaderProProps {
  onDrawerToggle: () => void;
}

const HeaderPro: React.FC<HeaderProProps> = ({ onDrawerToggle }) => {
  const {
    user,
    showTickerDropdown,
    showLanguageDropdown,
    showAvatarDropdown,
    searchQuery,
    recentTickers,
    isDarkMode,
    handleTickerSelect,
    handleLanguageSelect,
    handleLogout,
    handleChatClick,
    toggleTheme,
    setShowAvatarDropdown,
    setSearchQuery,
  } = useHeaderLogic(onDrawerToggle);

  return (
    <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Section - Logo & Navigation */}
          <div className="flex items-center gap-6">
            <button
              onClick={onDrawerToggle}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors lg:hidden"
            >
              <Bars3Icon className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
            </button>
            
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold text-neutral-900 dark:text-white">
                Aevorex
              </span>
            </Link>
          </div>

          {/* Center Section - Search & Ticker */}
          <div className="flex items-center gap-4 flex-1 max-w-xl mx-8">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search stocks, news, or ask AI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white placeholder-neutral-500"
              />
            </div>
            
            <TickerDropdown
              show={showTickerDropdown}
              recentTickers={recentTickers}
              onTickerSelect={handleTickerSelect}
            />
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleChatClick}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Open Chat"
            >
              <ChatBubbleLeftIcon className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
            </button>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <SunIcon className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
              ) : (
                <MoonIcon className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
              )}
            </button>
            
            <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <BellIcon className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
            </button>
            
            <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <Cog6ToothIcon className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
            </button>
            
            <LanguageDropdown
              show={showLanguageDropdown}
              onLanguageChange={handleLanguageSelect}
            />

            <AvatarDropdown
              show={showAvatarDropdown}
              onLogout={handleLogout}
              onClose={() => setShowAvatarDropdown(false)}
              userName={user?.name}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderPro;
