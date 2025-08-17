import React from 'react';
import { TickerTapeItemWithColor } from '../../hooks/stock/useTickerTapeData';
import { useTickerTapeProLogic } from './TickerTapePro.logic';
import TickerTapeMobileModal from './TickerTapeMobileModal';

interface TickerTapeProProps {
  className?: string;
  onTickerClick?: (symbol: string) => void;
}

interface TickerItemProps {
  ticker: TickerTapeItemWithColor;
  onClick: (symbol: string) => void;
  formatPrice: (price: number) => string;
  formatChangePercent: (changePercent: number) => string;
}

const TickerItem: React.FC<TickerItemProps> = ({ ticker, onClick, formatPrice, formatChangePercent }) => {
  const handleClick = () => onClick(ticker.symbol);

  return (
    <li 
      className="flex items-center gap-1 px-3 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-150"
      onClick={handleClick}
      aria-label={`${ticker.symbol} ${formatPrice(ticker.price)} ${ticker.changeColor === 'positive' ? 'up' : ticker.changeColor === 'negative' ? 'down' : 'unchanged'} ${Math.abs(ticker.change_percent).toFixed(2)} percent`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <span className="font-medium text-neutral-700 dark:text-neutral-300">{ticker.symbol}</span>
      <span className="text-neutral-900 dark:text-neutral-100">${formatPrice(ticker.price)}</span>
      <span className={`inline-flex items-center justify-center min-w-[48px] px-2 py-0.5 text-xs font-medium rounded-full ${ticker.changeBadgeClass}`}>
        {formatChangePercent(ticker.change_percent)}
      </span>
    </li>
  );
};

const TickerTapePro: React.FC<TickerTapeProProps> = ({ className = '', onTickerClick }) => {
  const {
    tickers, loading, error, isPaused, showMobileModal, duplicatedTickers, mobileDisplayTickers, remainingCount,
    handleMouseEnter, handleMouseLeave, handleTickerClick, handleMobileModalOpen, handleMobileModalClose,
    formatPrice, formatChangePercent,
  } = useTickerTapeProLogic({ onTickerClick });

  // Handle loading state
  if (loading && tickers.length === 0) {
    return (
      <div className={`h-[26px] bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 ${className}`}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-sm text-neutral-500 dark:text-neutral-400">Loading market data...</div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className={`h-[26px] bg-danger-50 dark:bg-danger-900/20 border-b border-danger-200 dark:border-danger-700 ${className}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-sm text-danger-600 dark:text-danger-400">Failed to load ticker data</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`h-[26px] overflow-hidden bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 ${className}`}
        onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {/* Desktop: Full marquee – 0. pillanattól teljes szélesség */}
        <div className="hidden md:block h-full overflow-hidden">
          <ul className={`flex items-center h-full whitespace-nowrap will-change-transform ${isPaused ? 'animate-marquee-pause' : 'animate-marquee'}`}
            style={{ paddingLeft: '100vw' }}>
            {duplicatedTickers.map((ticker, index) => (
              <TickerItem key={`${ticker.symbol}-${index}`} ticker={ticker} onClick={handleTickerClick}
                formatPrice={formatPrice} formatChangePercent={formatChangePercent} />
            ))}
          </ul>
        </div>

        {/* Mobile: Limited display with "more" button */}
        <div className="md:hidden h-full">
          <div className="flex items-center h-full px-2 gap-2 overflow-x-auto">
            {mobileDisplayTickers.map((ticker) => (
              <div key={ticker.symbol} className="flex items-center gap-1 flex-shrink-0">
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{ticker.symbol}</span>
                <span className="text-xs text-neutral-900 dark:text-neutral-100">${ticker.price.toFixed(2)}</span>
                <span className={`text-xs px-1 py-0.5 rounded ${ticker.changeBadgeClass}`}>
                  {ticker.change_percent >= 0 ? '+' : ''}{ticker.change_percent.toFixed(2)}%
                </span>
              </div>
            ))}
            {remainingCount > 0 && (
              <button onClick={handleMobileModalOpen}
                className="flex-shrink-0 px-2 py-0.5 text-xs bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-full hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                aria-label={`Show ${remainingCount} more tickers`}>
                ⋯ +{remainingCount} more
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Modal */}
      <TickerTapeMobileModal show={showMobileModal} tickers={tickers} onClose={handleMobileModalClose} onTickerClick={handleTickerClick} />
    </>
  );
};

export default TickerTapePro; 