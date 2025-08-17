import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useDrawer } from '../../hooks/ui/useDrawer';
import { useAuth } from '../../hooks/auth/useAuth';
import { useTheme } from '../../hooks/ui/useTheme';
import { SearchBarPro } from './SearchBar/SearchBar.view';
import { TickerDropdown } from './TickerDropdown/TickerDropdown.view';
import { useHealthStatus } from '../../hooks/system/useHealthStatus';
import { LanguageSwitch } from './LanguageSwitch/LanguageSwitch.view';
import { AvatarMenu } from './AvatarMenu/AvatarMenu.view';


// SVG Icons
const AELogo = () => (
  <svg viewBox="0 0 24 24" className="h-8 w-8" role="img" aria-label="Aevorex logo">
    <circle cx="12" cy="12" r="12" fill="#1E3A8A"/>
    <text x="12" y="16" textAnchor="middle" fontFamily="Inter" fontSize="10" fontWeight="700" fill="#fff">
      AE
    </text>
  </svg>
);

const HamburgerIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const SunMoonIcon = ({ isDark }: { isDark: boolean }) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" fill="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <mask id="moon-mask">
      <rect x="0" y="0" width="24" height="24" fill="white"/>
      <circle cx="16" cy="8" r="9" fill="black"/>
    </mask>
    <circle cx="12" cy="12" r="5" mask={isDark ? "url(#moon-mask)" : undefined}/>
    {!isDark && (
      <g stroke="currentColor">
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </g>
    )}
  </svg>
);

export const HeaderPro = () => {
  const { toggleDrawer } = useDrawer();
  const { user, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { status: healthStatus } = useHealthStatus();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [showProviders, setShowProviders] = useState(false);
  const lastYRef = useRef<number>(0);
  const tickingRef = useRef<boolean>(false);

  const HealthIndicator = () => {
    const color =
      healthStatus === 'healthy'
        ? 'bg-emerald-500'
        : healthStatus === 'degraded'
        ? 'bg-yellow-500'
        : healthStatus === 'unhealthy'
        ? 'bg-red-600'
        : 'bg-neutral-400';

    return (
      <div className="relative group" aria-label={`Backend ${healthStatus}`}>
        <span
          className={`inline-block w-2 h-2 rounded-full ${color}`}
        />
        <span className="absolute -left-1/2 translate-x-[-25%] top-4 opacity-0 group-hover:opacity-100 px-2 py-1 text-xs rounded bg-neutral-800 text-white whitespace-nowrap">
          Backend {healthStatus}
        </span>
      </div>
    );
  };

  // Compute a hard navigation href for login, so even ha minimal JS issues occur, link works
  const loginHref = (() => {
    const apiBaseEnv = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
    let base = '';
    if (apiBaseEnv && /^https?:\/\//i.test(apiBaseEnv)) base = apiBaseEnv.replace(/\/+$/, '');
    else if (typeof window !== 'undefined') {
      const { protocol, port } = window.location;
      base = port === '8083' ? `${protocol}//localhost:8084` : window.location.origin;
    }
    const next = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '%2F';
    return `${base}/api/v1/auth/login?redirect=1&next=${next}`;
  })();

  const microsoftLoginHref = (() => {
    const apiBaseEnv = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
    let base = '';
    if (apiBaseEnv && /^https?:\/\//i.test(apiBaseEnv)) base = apiBaseEnv.replace(/\/+$/, '');
    else if (typeof window !== 'undefined') {
      const { protocol, port } = window.location;
      base = port === '8083' ? `${protocol}//localhost:8084` : window.location.origin;
    }
    const next = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '%2F';
    return `${base}/api/v1/auth/microsoft/login?redirect=1&next=${next}`;
  })();

  const azureEnabled = !!(import.meta as any).env?.VITE_AZURE_AD_CLIENT_ID;
  const customEnabled = String((import.meta as any).env?.VITE_CUSTOM_AUTH_ENABLED || '').toLowerCase() === 'true';

  // TEMP classic OAuth – force /auth/login?redirect=1 (gateway-stable)
  const classicLoginHref = (() => {
    const apiBaseEnv = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
    let base = '';
    if (apiBaseEnv && /^https?:\/\//i.test(apiBaseEnv)) base = apiBaseEnv.replace(/\/+$/, '');
    else if (typeof window !== 'undefined') {
      const { protocol, port } = window.location;
      base = port === '8083' ? `${protocol}//localhost:8084` : window.location.origin;
    }
    const next = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '%2F';
    return `${base}/api/v1/auth/login?redirect=1&next=${next}`;
  })();

  const GuestAvatar = ({ onClick }: { onClick: () => void }) => (
    <a
      href={loginHref}
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-smooth"
      aria-label="Bejelentkezés Google-fiókkal"
      title="Bejelentkezés Google-fiókkal"
      role="button"
    >
      <span
        className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 font-semibold"
        aria-hidden
      >
        G
      </span>
      <span className="hidden sm:inline">Guest</span>
    </a>
  );
  
  // Partial-sticky behavior: add shadow when scrolled; hide on scroll down, reveal on up
  useEffect(() => {
    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        setIsScrolled(y > 4);
        const last = lastYRef.current;
        if (y > last && y > 64) setIsHidden(true);
        else setIsHidden(false);
        lastYRef.current = y;
        tickingRef.current = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-[50] bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 transition-all duration-300 will-change-transform ${isHidden ? '-translate-y-2 opacity-95' : 'translate-y-0'} ${isScrolled ? 'shadow-sm' : ''}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 hover-lift">
              <div className="relative">
                <AELogo />
                <div className="absolute inset-0 rounded-full bg-primary-500/20 blur-lg -z-10" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                FinanceHub
              </span>
            </Link>
          </div>

          {/* Center Search – karcsúbb, TradingView-hoz hasonló méret */}
          <div className="relative flex-1 mx-4 max-w-sm">
            <SearchBarPro />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 w-auto">
            <TickerDropdown />
            <HealthIndicator />
            <LanguageSwitch />

            {/* TEMP classic trigger docked to far right (ideiglenes teszt) */}
            <div className="ml-2 flex items-center">
              <a
                href={classicLoginHref}
                onClick={() => { /* classic only, do not preventDefault */ }}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-amber-400 text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700 text-xs"
                title="Ideiglenes – klasszikus bejelentkezés (teszt)"
                aria-label="Ideiglenes – klasszikus bejelentkezés (teszt)"
              >
                <span className="inline-flex w-4 h-4 items-center justify-center rounded bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 text-[10px]">T</span>
                <span>Classic (teszt)</span>
              </a>
            </div>

            {user ? <AvatarMenu user={user} /> : (
              <div className="relative">
                <GuestAvatar
                  onClick={() => {
                    const hasMoreProviders = azureEnabled || customEnabled;
                    if (!hasMoreProviders) {
                      try { login(); } finally { /* no-op */ }
                    } else {
                      setShowProviders((v) => !v);
                    }
                  }}
                />
                {(azureEnabled || customEnabled) && showProviders && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg p-2 z-[60]">
                    <button
                      onClick={() => { try { login(); } finally { setShowProviders(false); } }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm"
                    >
                      <span className="inline-flex w-5 h-5 items-center justify-center rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 font-semibold">G</span>
                      Continue with Google
                    </button>
                    {azureEnabled && (
                      <a
                        href={microsoftLoginHref}
                        className="mt-1 w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm"
                      >
                        <span className="inline-flex w-5 h-5 items-center justify-center rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 font-semibold">M</span>
                        Continue with Microsoft
                      </a>
                    )}
                    {customEnabled && (
                      <a
                        href="/auth/custom/login"
                        className="mt-1 w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm"
                      >
                        <span className="inline-flex w-5 h-5 items-center justify-center rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 font-semibold">E</span>
                        Continue with Enterprise SSO
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-neutral-600 hover:text-primary-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-primary-400 dark:hover:bg-neutral-800 transition-smooth scale-on-press"
              aria-label="Toggle theme"
              aria-pressed={theme === 'dark'}
              title="Toggle theme"
            >
              <SunMoonIcon isDark={theme === 'dark'} />
            </button>

            <button
              onClick={toggleDrawer}
              className="ml-4 p-2 rounded-lg text-neutral-600 hover:text-primary-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-primary-400 dark:hover:bg-neutral-800 transition-smooth scale-on-press"
              aria-label="Open navigation menu"
            >
              <HamburgerIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Inline status ribbon based on backend health */}
      {(healthStatus === 'degraded' || healthStatus === 'unhealthy') && (
        <div
          role="status"
          className={`border-t ${
            healthStatus === 'unhealthy'
              ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
              : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800'
          }`}
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-2 text-sm flex items-center gap-3">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                healthStatus === 'unhealthy' ? 'bg-red-600' : 'bg-amber-500'
              }`}
            />
            <span>
              {healthStatus === 'unhealthy'
                ? 'Service instability detected. Some market features may be unavailable.'
                : 'Degraded performance detected. You may experience slower updates.'}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}; 