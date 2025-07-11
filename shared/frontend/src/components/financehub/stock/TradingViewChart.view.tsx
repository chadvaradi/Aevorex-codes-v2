import React, { useEffect, useRef } from 'react'

interface TradingViewChartProps {
  symbol: string
  height?: number
}

// Uses TradingView Lightweight Widget (public script) – no API key required
export const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol, height = 400 }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return;

    const mountWidget = () => {
      if (!containerRef.current) return;
      containerRef.current.innerHTML = '';
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = JSON.stringify({
        symbol: symbol.toUpperCase(),
        width: '100%',
        height,
        dateRange: '12M',
        colorTheme: 'light',
        locale: 'en',
        trendLineColor: '#2563eb',
        underLineColor: 'rgba(37, 99, 235, 0.3)',
        isTransparent: false,
        autosize: true,
      });
      containerRef.current.appendChild(script);
    };

    // Lazy-load: wait until element visible
    const el = containerRef.current;
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(mountWidget);
        } else {
          setTimeout(mountWidget, 200);
        }
        io.disconnect();
      }
    });
    io.observe(el);

    return () => io.disconnect();
  }, [symbol, height]);

  return <div ref={containerRef} className="w-full" style={{ height }} />
} 