import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import BrandHeader from './BrandHeader';
import BrandFooter from './BrandFooter';
// Modern header / subheader implementations
import { HeaderPro } from './HeaderPro/Header.view';
import SubHeaderPro from '../components/SubHeaderPro';

// UI utilities
import TickerTapePro from '../components/financehub/TickerTapePro.view';
import { ChatOverlayLazy } from '../components/chat/ChatOverlay.lazy';
import { useChatContext } from '../contexts/ChatContext';
import Footer from './Footer';
import ErrorBoundary from '../components/ui/ErrorBoundary';

// Drawer context
import { DrawerContext, useDrawerProvider } from '../hooks/ui/useDrawer';

const AppLayout: React.FC = () => {
  // Initialise drawer state/context
  const drawer = useDrawerProvider();
  const navigate = useNavigate();
  const location = useLocation();
  const { chatOpen, closeChat } = useChatContext();

  return (
    <DrawerContext.Provider value={drawer}>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col" style={{ '--header-h': '64px', '--subheader-h': '48px' } as React.CSSProperties}>
        {/* Header & sub-navigation (branding vs app) */}
        {location.pathname === '/' ? (
          <BrandHeader />
        ) : (
          <>
            <HeaderPro />
            <SubHeaderPro />
          </>
        )}

        {/* Market ticker tape – branding oldalon NE jelenjen meg */}
        {location.pathname === '/' ? null : (
          <TickerTapePro
            className="sticky top-[calc(var(--header-h)+var(--subheader-h))] z-40"
            onTickerClick={(symbol) => navigate(`/stock/${symbol}`)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 relative">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>

        {location.pathname === '/' ? <BrandFooter /> : <Footer />}

        {/* Global Chat Overlay */}
        <ChatOverlayLazy isOpen={chatOpen} onClose={closeChat} />

        {/* Sidebar drawer */}
        <aside
          className={`fixed top-0 right-0 h-full w-72 bg-white dark:bg-neutral-900 shadow-lg transform transition-transform duration-300 z-[60] ${drawer.isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Close button */}
          <button
            onClick={drawer.closeDrawer}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Close sidebar"
          >
            ×
          </button>

          {/* Navigation */}
          <nav className="mt-16 px-6 flex flex-col gap-4 text-neutral-700 dark:text-neutral-200">
            <a onClick={() => drawer.navigateToModule('/', 'Mainpage')} className="hover:text-primary-600 cursor-pointer font-semibold">Mainpage</a>
            <a onClick={() => drawer.navigateToModule('/stock/AAPL', 'Finance Hub')} className="hover:text-primary-600 cursor-pointer font-semibold">Finance Hub</a>
            <div className="ml-3 flex flex-col gap-2 text-sm">
              <a onClick={() => drawer.navigateToModule('/stock/AAPL', 'Stocks')} className="hover:text-primary-600 cursor-pointer">Stocks</a>
              <a onClick={() => drawer.navigateToModule('/macro', 'Macro Rates')} className="hover:text-primary-600 cursor-pointer">Macro Rates</a>
              <a onClick={() => drawer.navigateToModule('/news', 'News')} className="hover:text-primary-600 cursor-pointer">News</a>
            </div>

            <a onClick={() => drawer.navigateToModule('/ai-hub', 'AI Hub')} className="hover:text-primary-600 cursor-pointer mt-4">AI Hub</a>
            <div className="ml-3 flex flex-col gap-2 text-sm">
              <a onClick={() => drawer.navigateToModule('/ai-hub', 'Overview')} className="hover:text-primary-600 cursor-pointer">Overview</a>
            </div>
            <a onClick={() => drawer.navigateToModule('/healthhub', 'Health Hub')} className="hover:text-primary-600 cursor-pointer">Health Hub</a>
            <div className="ml-3 flex flex-col gap-2 text-sm">
              <a onClick={() => drawer.navigateToModule('/healthhub', 'Overview')} className="hover:text-primary-600 cursor-pointer">Overview</a>
            </div>
            <a onClick={() => drawer.navigateToModule('/content-hub', 'ContentHub')} className="hover:text-primary-600 cursor-pointer mt-4">ContentHub</a>
            <div className="ml-3 flex flex-col gap-2 text-sm">
              <a onClick={() => drawer.navigateToModule('/content-hub', 'Overview')} className="hover:text-primary-600 cursor-pointer">Overview</a>
            </div>
          </nav>
        </aside>
      </div>
    </DrawerContext.Provider>
  );
};

export default AppLayout; 