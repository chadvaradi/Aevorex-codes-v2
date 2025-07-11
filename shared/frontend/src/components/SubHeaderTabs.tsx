import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface Tab {
  label: string;
  path: string;
  isActive?: boolean;
}

interface SubHeaderTabsProps {
  ticker?: string; // For stock-specific tabs
}

const SubHeaderTabs: React.FC<SubHeaderTabsProps> = ({ ticker }) => {
  const location = useLocation();
  
  // Define tabs based on context
  const tabs: Tab[] = [
    { label: 'Overview', path: ticker ? `/stock/${ticker}` : '/' },
    { label: 'Macro', path: '/macro' },
    { label: 'News', path: '/news' },
    { label: 'Technical', path: '/technical' },
    { label: 'Financials', path: '/financials' }
  ];
  
  const isActiveTab = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div 
      className="sticky bg-neutral-50/80 dark:bg-gray-900/80 backdrop-blur border-b border-neutral-200 dark:border-gray-700"
      style={{ top: 'var(--header-h, 64px)', zIndex: 45 }}
    >
      <div className="flex gap-6 px-8 h-10 items-center">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            to={tab.path}
            className={`cursor-pointer text-sm h-full flex items-center border-b-2 rounded-md px-2 py-1 transition-all duration-200 ${
              isActiveTab(tab.path)
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-primary/5'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SubHeaderTabs; 