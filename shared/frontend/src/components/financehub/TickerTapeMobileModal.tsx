import React from 'react';
import { TickerTapeItemWithColor } from '../../hooks/stock/useTickerTapeData';

interface TickerTapeMobileModalProps {
  show: boolean;
  tickers: TickerTapeItemWithColor[];
  onClose: () => void;
  onTickerClick: (symbol: string) => void;
}

const TickerTapeMobileModal: React.FC<TickerTapeMobileModalProps> = ({
  show,
  tickers,
  onClose,
  onTickerClick,
}) => {
  if (!show) return null;

  const handleTickerClick = (symbol: string) => {
    onTickerClick(symbol);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 md:hidden">
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 rounded-t-lg max-h-[70vh] overflow-y-auto">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Market Overview
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {tickers.map((ticker) => (
              <div
                key={ticker.symbol}
                className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                onClick={() => handleTickerClick(ticker.symbol)}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {ticker.symbol}
                  </span>
                  <span className="text-neutral-600 dark:text-neutral-400">
                    ${ticker.price.toFixed(2)}
                  </span>
                </div>
                <span className={`px-2 py-1 text-sm font-medium rounded-full ${ticker.changeBadgeClass}`}>
                  {ticker.change_percent >= 0 ? '+' : ''}{ticker.change_percent.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TickerTapeMobileModal; 