import { useState } from 'react';
import { useTickerTapeData, TickerTapeItemWithColor } from '../../hooks/stock/useTickerTapeData';
import { TICKER_CONFIG } from '../../config/tickers';

export interface TickerTapeProLogicProps {
  onTickerClick?: (symbol: string) => void;
}

export interface TickerTapeProLogicReturn {
  tickers: TickerTapeItemWithColor[];
  loading: boolean;
  error: string | null;
  isPaused: boolean;
  showMobileModal: boolean;
  duplicatedTickers: TickerTapeItemWithColor[];
  mobileDisplayTickers: TickerTapeItemWithColor[];
  remainingCount: number;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  handleTickerClick: (symbol: string) => void;
  handleMobileModalOpen: () => void;
  handleMobileModalClose: () => void;
  formatPrice: (price: number) => string;
  formatChangePercent: (changePercent: number) => string;
}

export const useTickerTapeProLogic = ({ onTickerClick }: TickerTapeProLogicProps = {}): TickerTapeProLogicReturn => {
  const [isPaused, setIsPaused] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const { tickers, loading, error } = useTickerTapeData();

  // Duplicate tickers for seamless loop
  const duplicatedTickers = [...tickers, ...tickers];

  // Mobile breakpoint: show first 10 + "more" button
  const mobileDisplayTickers = tickers.slice(0, TICKER_CONFIG.MOBILE_DISPLAY_LIMIT);
  const remainingCount = tickers.length - TICKER_CONFIG.MOBILE_DISPLAY_LIMIT;

  // Event handlers
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);
  
  const handleTickerClick = (symbol: string) => {
    onTickerClick?.(symbol);
  };

  const handleMobileModalOpen = () => setShowMobileModal(true);
  const handleMobileModalClose = () => setShowMobileModal(false);

  // Formatters
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatChangePercent = (changePercent: number): string => {
    const sign = changePercent >= 0 ? '+' : '';
    return `${sign}${changePercent.toFixed(2)}%`;
  };

  return {
    tickers,
    loading,
    error,
    isPaused,
    showMobileModal,
    duplicatedTickers,
    mobileDisplayTickers,
    remainingCount,
    handleMouseEnter,
    handleMouseLeave,
    handleTickerClick,
    handleMobileModalOpen,
    handleMobileModalClose,
    formatPrice,
    formatChangePercent,
  };
}; 