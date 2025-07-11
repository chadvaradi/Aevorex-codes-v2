import { useParams } from 'react-router-dom';
import StockHeader from '@/components/financehub/stock/StockHeader';
import AnalysisBubblesGrid from '@/components/financehub/stock/AnalysisBubbles/AnalysisBubblesGrid';
import { TradingViewChart } from '@/components/financehub/stock/TradingViewChart.view';
import { useStockPageData } from '../hooks/stock/useStockPageData';
import { useChatContext } from '../contexts/ChatContext';
import { post } from '@/lib/api';

const StockPage = () => {
  const { ticker = 'AAPL' } = useParams<{ ticker: string }>();
  const { openChat } = useChatContext();

  const {
    fundamentals,
    chart,
    news,
    isLoading,
    error,
  } = useStockPageData(ticker);

  if (error) return <div className="p-4 text-red-500">Error loading stock data: {error}</div>;

  const handleDeepDive = async () => {
    if (!ticker) return;
    try {
      // Immediately open chat overlay
      openChat(ticker);
      // Fire off deep analysis request (no blocking)
      await post(`/api/v1/stock/chat/${ticker}/deep`, { prompt: "deep-dive" });
    } catch (err) {
      console.error("Deep dive request failed", err);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <StockHeader
        fundamentals={fundamentals}
        chartData={chart}
        loading={isLoading}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <TradingViewChart symbol={ticker} height={350} />

          <AnalysisBubblesGrid
            fundamentals={fundamentals}
            news={news}
            loading={isLoading}
            ticker={ticker}
          />
          {/* TradingViewChart will be integrated here later */}
        </div>
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-surface-default rounded-lg border border-border-default p-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-content-primary">
                AI Chat Assistant
              </h3>
              <p className="text-sm text-content-secondary">
                Get AI-powered insights about {ticker}
              </p>
              <button
                onClick={() => openChat(ticker)}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
              >
                Start Chat
              </button>
              <button
                onClick={handleDeepDive}
                className="w-full px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm"
              >
                Deep Dive AI
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockPage; 