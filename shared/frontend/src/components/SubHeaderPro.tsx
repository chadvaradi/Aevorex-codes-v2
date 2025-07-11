import React from 'react';
import { Link } from 'react-router-dom';
import { useSubHeaderLogic } from './SubHeaderPro.logic';

interface SubHeaderProProps {
  ticker?: string;
  className?: string;
}

const SubHeaderPro: React.FC<SubHeaderProProps> = ({ ticker, className }) => {
  const {
    tabs,
    indicatorStyle,
    isActiveTab,
    handleTabHover,
    handleTabLeave,
  } = useSubHeaderLogic(ticker);

  if (tabs.length === 0) return null;

  return (
    <div 
      className={`sticky glass-effect border-b border-neutral-200/60 dark:border-neutral-700/60 ${className || ''}`}
      style={{ 
        top: 'var(--header-height)', 
        zIndex: 'var(--z-sticky)',
        height: 'var(--subheader-height)',
      }}
    >
      <div className="relative flex items-center h-full px-6 lg:px-8 max-w-content mx-auto">
        <nav className="relative flex gap-8 items-center h-full">
          {tabs.map((tab, index) => (
            <Link
              key={tab.path}
              to={tab.path}
              data-tab-index={index}
              onMouseEnter={() => handleTabHover(index)}
              onMouseLeave={handleTabLeave}
              className={`
                relative flex items-center gap-2 px-4 py-3 text-sm font-medium
                transition-all duration-normal ease-out
                hover:text-primary-600 dark:hover:text-primary-400
                focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2
                ${isActiveTab(tab.path) 
                  ? 'text-primary-700 dark:text-primary-300' 
                  : 'text-neutral-600 dark:text-neutral-400'
                }
                ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              onClick={(e) => tab.disabled && e.preventDefault()}
            >
              <span className="tracking-tight">{tab.label}</span>
              
              {tab.badge && (
                <span className="
                  ml-2 px-2 py-0.5 text-xs font-medium rounded-full
                  bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300
                  animate-pulse
                ">
                  {tab.badge}
                </span>
              )}
            </Link>
          ))}
          
          {/* Animated indicator */}
          <div
            className="
              absolute bottom-0 h-0.5 bg-primary-500 dark:bg-primary-400
              transition-all duration-normal ease-spring
              rounded-full
            "
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
            }}
          />
        </nav>
        
        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-4">
          {ticker && (
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <span className="font-medium">{ticker}</span>
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
              <span className="text-xs">Live</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubHeaderPro; 