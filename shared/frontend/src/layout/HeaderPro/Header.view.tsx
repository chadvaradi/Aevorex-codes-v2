import { Link } from 'react-router-dom';
import { useDrawer } from '../../hooks/ui/useDrawer';
import { useAuth } from '../../hooks/auth/useAuth';
import { useTheme } from '../../hooks/ui/useTheme';
import { SearchBarPro } from './SearchBar/SearchBar.view';
import { TickerDropdown } from './TickerDropdown/TickerDropdown.view';
import { useHealthStatus } from '../../hooks/system/useHealthStatus';
import { LanguageSwitch } from './LanguageSwitch/LanguageSwitch.view';
import { AvatarMenu } from './AvatarMenu/AvatarMenu.view';
import MarketPulseRibbon from './MarketPulseRibbon';

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
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { status: healthStatus } = useHealthStatus();

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

  return (
    <header className="sticky top-0 z-[50] glass-surface transition-all duration-300">
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

          {/* Center Search */}
          <div className="relative max-w-md flex-1 mx-8">
            <SearchBarPro />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <TickerDropdown />
            <HealthIndicator />
            <LanguageSwitch />
            
            {user && <AvatarMenu user={user} />}
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-neutral-600 hover:text-primary-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-primary-400 dark:hover:bg-neutral-800 transition-smooth scale-on-press"
              aria-label="Toggle theme"
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

      {/* Global Market Pulse ribbon */}
      {/* <MarketPulseRibbon /> */}
    </header>
  );
}; 