import React from 'react';
import { Outlet } from 'react-router-dom';
// Modern header / subheader implementations
import { HeaderPro } from './HeaderPro/Header.view';
import SubHeaderPro from '../components/SubHeaderPro';

// UI utilities
import TickerTapePro from '../components/financehub/TickerTapePro.view';
import Footer from './Footer';
import ErrorBoundary from '../components/ui/ErrorBoundary';

// Drawer context
import { DrawerContext, useDrawerProvider } from '../hooks/ui/useDrawer';

const AppLayout: React.FC = () => {
  // Initialise drawer state/context
  const drawer = useDrawerProvider();

  return (
    <DrawerContext.Provider value={drawer}>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col" style={{ '--header-h': '64px', '--subheader-h': '48px' } as React.CSSProperties}>
        {/* Header & sub-navigation */}
        <HeaderPro />
        <SubHeaderPro />

        {/* Market ticker tape – fixed just below sub-header */}
        <TickerTapePro className="sticky top-[calc(var(--header-h)+var(--subheader-h))] z-40" />

        {/* Main content */}
        <main className="flex-1 relative">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>

        <Footer />

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
            <a onClick={() => drawer.navigateToModule('/', 'Dashboard')} className="hover:text-primary-600 cursor-pointer">Dashboard</a>
            <a onClick={() => drawer.navigateToModule('/stock/AAPL', 'Finance Hub')} className="hover:text-primary-600 cursor-pointer">Finance Hub</a>
            <a onClick={() => drawer.navigateToModule('/macro', 'Macro Hub')} className="hover:text-primary-600 cursor-pointer">Macro Hub</a>
            <a onClick={() => drawer.navigateToModule('/ai', 'AI Hub')} className="hover:text-primary-600 cursor-pointer">AI Hub</a>
            <a onClick={() => drawer.navigateToModule('/health', 'Health Hub')} className="hover:text-primary-600 cursor-pointer">Health Hub</a>
          </nav>
        </aside>
      </div>
    </DrawerContext.Provider>
  );
};

export default AppLayout; 