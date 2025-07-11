import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export interface Tab {
  label: string;
  path: string;
  icon?: string;
  badge?: string;
  disabled?: boolean;
}

export const useSubHeaderLogic = (ticker?: string) => {
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // FinanceHub module-level static tabs
  const tabs = useMemo<Tab[]>(() => {
    return [
      { label: 'Stocks', path: ticker ? `/stock/${ticker}` : '/stock/AAPL' },
      { label: 'Macro Rates', path: '/macro-rates' },
      { label: 'News', path: '/content-hub' },
      { label: 'AI Hub', path: '/ai-hub' },
      { label: 'Health', path: '/healthhub' },
    ];
  }, [ticker]);

  // Active tab detection – module-level (prefix match)
  const isActiveTab = useCallback(
    (path: string) => location.pathname.startsWith(path),
    [location.pathname],
  );

  // Update indicator position
  const updateIndicatorPosition = useCallback((tabIndex: number) => {
    const tabElement = document.querySelector<HTMLElement>(`[data-tab-index="${tabIndex}"]`);
    if (!tabElement) return;

    const rect = tabElement.getBoundingClientRect();
    const containerRect = tabElement.parentElement?.getBoundingClientRect();
    if (!containerRect) return;

    const next = {
      left: rect.left - containerRect.left,
      width: rect.width,
    };

    // Avoid unnecessary re-renders: only update when values change
    setIndicatorStyle((prev) =>
      prev.left === next.left && prev.width === next.width ? prev : next,
    );
  }, []);

  // Update active index and indicator position
  useEffect(() => {
    const activeIdx = tabs.findIndex(tab => isActiveTab(tab.path));
    if (activeIdx !== -1) {
      setActiveIndex(activeIdx);
      updateIndicatorPosition(activeIdx);
    }
  }, [tabs, isActiveTab, updateIndicatorPosition]);

  // Handle tab hover for preview
  const handleTabHover = useCallback((index: number) => {
    updateIndicatorPosition(index);
  }, [updateIndicatorPosition]);

  const handleTabLeave = useCallback(() => {
    updateIndicatorPosition(activeIndex);
  }, [activeIndex, updateIndicatorPosition]);

  return {
    tabs,
    activeIndex,
    indicatorStyle,
    isActiveTab,
    handleTabHover,
    handleTabLeave,
  };
}; 