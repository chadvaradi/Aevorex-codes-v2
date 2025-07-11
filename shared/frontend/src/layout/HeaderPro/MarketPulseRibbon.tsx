import React from 'react';
import { useMarketPulse } from '../../hooks/market/useMarketPulse';

const MarketPulseRibbon: React.FC = () => {
  const { indices, isLoading } = useMarketPulse();

  if (isLoading || indices.length === 0) return null;

  return (
    <div className="w-full bg-neutral-100 dark:bg-neutral-900 text-xs py-1 px-3 flex gap-4 overflow-x-auto scrollbar-hide">
      {indices.map((idx) => (
        <span key={idx.symbol} className="whitespace-nowrap">
          <span className="font-medium mr-1">{idx.symbol}</span>
          <span>{idx.price.toFixed(2)}</span>
          <span
            className={
              idx.change_pct >= 0 ? 'text-emerald-500 ml-1' : 'text-red-500 ml-1'
            }
          >
            {idx.change_pct >= 0 ? '+' : ''}
            {idx.change_pct.toFixed(2)}%
          </span>
        </span>
      ))}
    </div>
  );
};

export default MarketPulseRibbon; 