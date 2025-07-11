import { useState } from 'react';
import { useLocation } from 'react-router-dom';

// Chevron Down Icon
const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

export const TickerDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Extract current ticker from URL
  const getCurrentTicker = () => {
    const match = location.pathname.match(/\/stock\/([A-Z]+)/);
    return match ? match[1] : null;
  };

  const currentTicker = getCurrentTicker();

  // Mock recent tickers - in real app, this would come from localStorage or context
  const recentTickers = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX'];

  if (!currentTicker) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium 
                   text-neutral-600 dark:text-neutral-400 
                   hover:text-primary-600 dark:hover:text-primary-400
                   hover:bg-neutral-100 dark:hover:bg-neutral-800
                   rounded-lg transition-smooth"
      >
        <span>Current: {currentTicker}</span>
        <ChevronDownIcon />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-1 w-48 z-20
                          bg-white dark:bg-neutral-800 
                          border border-neutral-200 dark:border-neutral-700
                          rounded-lg shadow-lg py-2">
            <div className="px-3 py-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
              Recent Tickers
            </div>
            
            {recentTickers.map((ticker) => (
              <a
                key={ticker}
                href={`/stock/${ticker}`}
                className="block px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300
                           hover:bg-neutral-50 dark:hover:bg-neutral-700
                           hover:text-primary-600 dark:hover:text-primary-400
                           transition-colors duration-150"
                onClick={() => setIsOpen(false)}
              >
                {ticker}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}; 