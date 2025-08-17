/**
 * TradingView Advanced Chart Component for FinanceHub
 * 
 * Based on official TradingView widget with our custom UDF data feed.
 * Supports official ECB/MNB data sources: €STR, Euribor HSTA, BUBOR, Yield Curve, Policy Rates, FX.
 * 
 * References:
 * - https://www.tradingview.com/widget-docs/widgets/charts/advanced-chart/
 * - https://github.com/birdeye-so/tradingview-example-js-api
 */
import { useEffect, useRef, memo } from 'react';

interface TradingViewChartProps {
  /** Primary symbol to display (e.g., "EURIBOR_3M", "BUBOR_3M", "YC_SR_10Y") */
  symbol: string;
  /** Chart container height */
  height?: string | number;
  /** Chart container width */
  width?: string | number;
  /** Chart theme (light/dark) */
  theme?: 'light' | 'dark';
  /** Chart style (1=Candles, 2=Hollow Candles, 3=Heikin Ashi, 8=Line, 9=Area) */
  style?: 1 | 2 | 3 | 8 | 9;
  /** Chart interval (use 'D' for daily – TradingView expects 'D', not '1D') */
  interval?: string;
  /** Time zone (exchange/UTC/Europe/Frankfurt/Europe/Budapest) */
  timezone?: string;
  /** Enable date ranges toolbar */
  withDateRanges?: boolean;
  /** Allow symbol change within widget */
  allowSymbolChange?: boolean;
  /** Enable save image functionality */
  saveImage?: boolean;
  /** Optional watchlist of symbols to show in sidebar */
  watchlist?: string[];
  /** Custom data feed URL (defaults to our backend) */
  datafeedUrl?: string;
  /** Additional widget properties */
  extraProps?: Record<string, any>;
  /** Preset for UI controls: 'minimal' (clean) or 'full' (show toolbars, resolutions) */
  controlsPreset?: 'minimal' | 'full';
  /** When true, let TradingView persist user settings (style, resolution) in localStorage */
  persistUserSettings?: boolean;
  /** When true, force Line style and purge any persisted template that could switch to candles */
  lockLine?: boolean;
}

/**
 * Re-usable TradingView Advanced Chart component for FinanceHub.
 * 
 * Uses our backend UDF endpoints at /api/v1/tv/ for official ECB/MNB data.
 * Optimized for financial rates visualization (interest rates, yield curves, FX).
 */
function TradingViewChart({
  symbol,
  height = "500px",
  width = "100%",
  theme = "light",
  style = 8, // Default to Line (clean FX view) – overridden for stocks via props
  interval = "D",
  timezone = "Europe/Frankfurt",
  withDateRanges = true,
  allowSymbolChange = true,
  saveImage = false,
  watchlist = [],
  datafeedUrl = "/api/v1/tv",
  extraProps = {},
  controlsPreset = 'minimal',
  persistUserSettings = false,
  lockLine = true,
}: TradingViewChartProps) {
  // Disable TradingView in test/CI to avoid cross-origin script errors in Cypress
  const disableForTests =
    ((import.meta as any).env?.VITE_DISABLE_TV_IN_TEST === 'true') ||
    (typeof window !== 'undefined' && (window as any).Cypress);

  // Hooks must be declared unconditionally to satisfy the Rules of Hooks
  const container = useRef<HTMLDivElement>(null);
  const widgetContainerIdRef = useRef<string>(`tv_widget_${Math.random().toString(36).slice(2)}`);
  const initializedRef = useRef<boolean>(false);

  useEffect(() => {
    // In test/CI, skip all side-effects but keep hooks order consistent
    if (disableForTests) return;
    if (!container.current) return;
    // Extra guard to prevent duplicate mounts
    if (container.current.getAttribute('data-tv-mounted') === '1') return;

    // Avoid double-initialization in React 18 StrictMode and during fast route flips
    try {
      const existing = container.current.querySelector('iframe[src*="tradingview"], script[src*="tradingview"]');
      if (existing) return;
      if (initializedRef.current) return;
      initializedRef.current = true;
    } catch {}

    // Optionally purge persisted settings to avoid unexpected candle/Heikin Ashi carry‑over
    const shouldPurge = lockLine || !persistUserSettings;
    if (shouldPurge) {
      try {
        const keys = Object.keys(localStorage).filter(
          (k) => k.startsWith('tradingview') || k.startsWith('tv.') || k.includes('chartProperties') || k.includes('chartStyle')
        );
        keys.forEach((k) => {
          try { localStorage.removeItem(k); } catch {}
        });
      } catch {}
    }

    // Prepare script element with config payload, and append exactly per TradingView spec
    const script = document.createElement("script");
    script.type = "text/javascript";
    // Load synchronously to avoid race where embed reads config before it's set
    script.async = false;
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    
    // Resolve symbol: map FX pairs to FX_IDC:<PAIR>, pass-through for stocks/indices
    const resolvedSymbol = (
      typeof symbol === 'string' && symbol.includes('_')
    )
      ? (symbol === 'EUR_HUF' ? 'FX_IDC:EURHUF'
        : symbol === 'USD_HUF' ? 'FX_IDC:USDHUF'
        : symbol === 'EUR_USD' ? 'FX_IDC:EURUSD'
        : `FX_IDC:${symbol.replace('_', '')}`)
      : symbol;

    const isFx = typeof resolvedSymbol === 'string' && resolvedSymbol.startsWith('FX_IDC:');
    // TradingView widget configuration
    const widgetConfig = {
      // Chart appearance
      // NOTE: When autosize is true, do NOT pass width/height in config – the
      // widget will read the parent container size. We control size via wrapper CSS.
      autosize: true,
      theme,
      locale: 'en',
      style: isFx ? 8 : (style ?? 1),
      
      // Symbol selection
      symbol: resolvedSymbol,
      interval,
      timezone,
      // container_id intentionally omitted for embed widget to avoid race conditions

      // UI features
      withdateranges: withDateRanges,
      allow_symbol_change: allowSymbolChange,
      save_image: saveImage,
      hide_side_toolbar: controlsPreset === 'minimal',
      hide_top_toolbar: controlsPreset === 'minimal' ? true : false,
      toolbar_bg: "#ffffff",
      enable_publishing: false,
      hide_legend: false,
      hide_volume: isFx ? true : false,
      
      // Watchlist disabled for clean look
      watchlist: [],
      // Sensible defaults: FX → clean line; Stocks → Volume/MACD/RSI
      studies: isFx ? [] : [
        "Volume@tv-basicstudies",
        "MACD@tv-basicstudies",
        "RSI@tv-basicstudies",
      ],

      // Better FX chart styling – default clean blue line
      overrides: {
        // Enforce style based on asset class
        "mainSeriesProperties.style": isFx ? 8 : (style ?? 1),
        "paneProperties.background": "#ffffff",
        "paneProperties.vertGridProperties.color": "#f0f0f0",
        "paneProperties.horzGridProperties.color": "#f0f0f0",
        "symbolWatermarkProperties.transparency": 90,
        "scalesProperties.textColor": "#363a45",
        ...(isFx ? {
          "mainSeriesProperties.lineStyle.color": "#2196F3",
          "mainSeriesProperties.lineStyle.linewidth": 2,
        } : {}),
      },
      // Feature toggles
      disabled_features: (() => {
        const base = controlsPreset === 'minimal'
          ? [
              "header_resolutions",
              "timeframes_toolbar",
              "header_symbol_search",
              "header_saveload",
              "header_fullscreen_button",
              "left_toolbar",
              "pane_context_menu",
              "legend_context_menu",
              "header_compare",
              "header_undo_redo",
              "header_indicators"
            ]
          : [] as string[];
        if (shouldPurge) base.push("use_localstorage_for_settings");
        return base;
      })(),
      studies_overrides: {},
      
      // Use TradingView's own datafeed for FX pairs
      // No custom datafeed needed for major currency pairs
      
      // Merge any additional properties (sanitized to primitives/objects/arrays only)
      ...(() => {
        try {
          return JSON.parse(JSON.stringify(extraProps || {}));
        } catch { return {}; }
      })()
    };

    // Serialize safely (drop functions/undefined) and write as inline JSON (must be raw JSON)
    const safeConfig = JSON.parse(JSON.stringify(widgetConfig));
    // Write as plain text content (TradingView expects raw JSON in the same tag)
    // Ensure pure JSON without trailing commas or functions – already enforced above
    script.textContent = JSON.stringify(safeConfig);
    // Clean previous embeds/scripts in this container to avoid multiple charts
    try {
      const host = container.current?.querySelector(`#${widgetContainerIdRef.current}`) as HTMLDivElement | null;
      if (host) host.innerHTML = '';
      container.current?.querySelectorAll('iframe[src*="tradingview"], script[src*="tradingview"]')
        .forEach((el) => el.parentNode?.removeChild(el));
    } catch {}

    // Insert script AFTER the widget div; use rAF to ensure DOM is painted first
    try {
      const widgetDiv = container.current?.querySelector(`#${widgetContainerIdRef.current}`);
      const insert = () => {
        try {
          if (widgetDiv && widgetDiv.parentNode) {
            (widgetDiv.parentNode as HTMLElement).insertBefore(script, (widgetDiv as HTMLElement).nextSibling);
          } else {
            container.current?.appendChild(script);
          }
          container.current?.setAttribute('data-tv-mounted', '1');
        } catch {}
      };
      if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
        requestAnimationFrame(insert);
      } else {
        setTimeout(insert, 0);
      }
    } catch {}

    // Prevent accidental double embed: guard with a data attribute
    setTimeout(() => {
      try {
        const mounted = container.current?.getAttribute('data-tv-mounted');
        const hasIframe = !!container.current?.querySelector('iframe[src*="tradingview"]');
        if (!mounted && !hasIframe) {
          container.current?.setAttribute('data-tv-mounted', '1');
        }
      } catch {}
    }, 0);

    // Last-resort fallback: if iframe did not appear shortly after insertion, render a subtle placeholder
    const fallbackTimer = setTimeout(() => {
      try {
        const hasIframe = !!container.current?.querySelector('iframe[src*="tradingview"]');
        if (!hasIframe && container.current) {
          const placeholderId = `${widgetContainerIdRef.current}_fallback`;
          if (!container.current.querySelector(`#${placeholderId}`)) {
            const box = document.createElement('div');
            box.id = placeholderId;
            box.setAttribute('role', 'status');
            box.style.cssText = 'display:flex;align-items:center;justify-content:center;height:100%;width:100%;border:1px solid rgba(0,0,0,0.06);color:#64748b;font:14px system-ui,-apple-system,Segoe UI,Roboto,sans-serif';
            box.textContent = 'Chart unavailable';
            container.current.appendChild(box);
          }
        }
      } catch {}
    }, 1000);

    // Cleanup: remove only the injected script to preserve required widget container div
    return () => {
      try {
        if (script && script.parentNode) script.parentNode.removeChild(script);
        container.current?.querySelectorAll('iframe[src*="tradingview"], script[src*="tradingview"]').forEach((el) => {
          try { el.parentNode?.removeChild(el); } catch {}
        });
        initializedRef.current = false;
        container.current?.removeAttribute('data-tv-mounted');
      } catch {}
      try { clearTimeout(fallbackTimer); } catch {}
    };
  }, [
    symbol, 
    height, 
    width, 
    theme, 
    style, 
    interval, 
    timezone, 
    withDateRanges, 
    allowSymbolChange, 
    saveImage, 
    watchlist, 
    datafeedUrl,
    extraProps
  ]);

  // Render placeholder in tests to avoid loading external widget
  if (disableForTests) {
    return (
      <div
        className="tradingview-widget-container"
        style={{
          height: typeof height === 'string' ? height : `${height}px`,
          width: typeof width === 'string' ? width : `${width}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(0,0,0,0.06)'
        }}
        aria-label="TradingView chart disabled in test environment"
      >
        <span className="text-sm text-gray-500">Chart disabled in tests</span>
      </div>
    );
  }

  return (
    <div
      className="tradingview-widget-container"
      ref={container}
      style={{
        height: typeof height === 'string' ? height : `${height}px`,
        width: typeof width === 'string' ? width : `${width}px`
      }}
    >
      <div
        id={widgetContainerIdRef.current}
        className="tradingview-widget-container__widget"
        style={{
          height: '100%',
          width: '100%'
        }}
      />
      <div className="tradingview-widget-copyright">
        <a
          href="https://www.tradingview.com/"
          rel="noopener nofollow"
          target="_blank"
          className="text-blue-600 text-sm"
        >
          <span>Track markets on TradingView</span>
        </a>
      </div>
    </div>
  );
}

export default memo(TradingViewChart);

// Predefined symbol configurations for common use cases
export const SYMBOL_PRESETS = {
  // Fixing Rates
  FIXING_RATES: {
    primary: "ESTR_ON",
    watchlist: ["ESTR_ON", "EURIBOR_1W", "EURIBOR_1M", "EURIBOR_3M", "EURIBOR_6M", "EURIBOR_12M"]
  },
  
  // BUBOR
  BUBOR: {
    primary: "BUBOR_3M",
    watchlist: ["BUBOR_ON", "BUBOR_1W", "BUBOR_1M", "BUBOR_3M", "BUBOR_6M", "BUBOR_12M"]
  },
  
  // Yield Curve
  YIELD_CURVE: {
    primary: "YC_SR_10Y",
    watchlist: ["YC_SR_1Y", "YC_SR_2Y", "YC_SR_5Y", "YC_SR_10Y", "YC_SR_30Y"]
  },
  
  // Policy Rates
  POLICY_RATES: {
    primary: "ECB_DFR",
    watchlist: ["ECB_DFR", "ECB_MRO", "ECB_MSF"]
  },
  
  // FX Rates
  FX_RATES: {
    primary: "EUR_USD",
    watchlist: ["EUR_USD", "EUR_HUF", "EUR_GBP"]
  }
};