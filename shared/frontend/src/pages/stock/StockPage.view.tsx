import React from 'react';
import { useParams } from 'react-router-dom';
import TradingViewChart from '@/components/trading/TradingViewChart';
import StockHeader from '@/components/financehub/stock/StockHeader';
import AnalysisBubblesGrid from '@/components/financehub/stock/AnalysisBubbles/AnalysisBubblesGrid';
import { useStockViewModel } from './StockPage.logic';

const StockPageView: React.FC = () => {
  const { ticker = 'AAPL' } = useParams<{ ticker: string }>();
  const { fundamentals, chart, news, loading, error, openChatForTicker } = useStockViewModel(ticker);

  return (
    <main className="w-full">
      <div className="mx-auto max-w-[1400px] px-4 py-6">
        <StockHeader fundamentals={fundamentals as any} chartData={chart as any} loading={loading} />

        {/* TradingView chart – full width */}
        <div className="mb-6">
          <div className="h-[520px] md:h-[640px] lg:h-[720px]">
            <TradingViewChart
              symbol={ticker}
              height="100%"
              width="100%"
              style={1}
              withDateRanges={true}
              allowSymbolChange={true}
              controlsPreset="full"
              persistUserSettings={true}
            />
          </div>
        </div>

        {/* Analysis bubbles */}
        <section aria-label="Analysis bubbles" className="mb-8">
          <AnalysisBubblesGrid loading={loading} fundamentals={fundamentals as any} news={news as any} ticker={ticker} />
          <div className="mt-4">
            <button
              className="px-4 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-sm"
              onClick={openChatForTicker}
            >
              Open Chat
            </button>
          </div>
        </section>

        {error && (
          <div className="mt-4 text-sm text-red-600">{String(error)}</div>
        )}
      </div>
    </main>
  );
};

export default StockPageView;

 