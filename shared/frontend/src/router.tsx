import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { ArchiveWrapper } from './components/ArchiveWrapper';
import AppLayout from './layout/AppLayout';
import { MacroRatesPage, MarketNewsPage, StockPage, ContactPage } from './pages';
import BrandingPage from './pages/BrandingPage.view';
import UXCardsCatalog from './pages/financehub/ux/UXCardsCatalog.view';

// FinanceHub oldalak lazy-loading importálása
const AIHub = lazy(() => import('./pages/AIHub.view'));
const HealthHubPage = lazy(() => import('./pages/HealthHub.view'));
const ContentHub = lazy(() => import('./pages/ContentHub.view'));

const AppRouter: React.FC = () => {
    const LegacyBridge: React.FC = () => {
        const location = useLocation();
        useEffect(() => {
            const enabled = (import.meta.env.VITE_ENABLE_LEGACY_BRIDGE ?? 'true') === 'true';
            if (!enabled) {
                // Kill switch: route home if bridge disabled
                window.location.replace('/');
                return;
            }
            // Pass-through to static asset under /legacy/** served from public/
            const target = location.pathname + location.search + location.hash;
            window.location.replace(target);
        }, [location]);
        return null;
    };

    // Archive fallback route element (no new files)
    const ArchiveRouteElement: React.FC = () => {
        const { module } = useParams();
        const valid = module && ['aihub', 'contenthub', 'healthhub', 'anahi'].includes(module);
        if (!valid) return <div className="p-6 text-red-600">Unknown archive module</div>;
        return <ArchiveWrapper moduleName={module!} title={`${module} Archive`} />;
    };

    return (
        <Router>
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path="/" element={<AppLayout />}>
                        <Route index element={<BrandingPage />} />
                        <Route path="mainpage" element={<BrandingPage />} />
                        <Route path="stock/:ticker" element={<StockPage />} />
                        <Route path="macro-rates" element={<MacroRatesPage />} />
                        <Route path="macro" element={<MacroRatesPage />} />
                        <Route path="news" element={<MarketNewsPage />} />
                        <Route path="ai-hub" element={<AIHub />} />
                        <Route path="healthhub" element={<HealthHubPage />} />
                        <Route path="content-hub" element={<ContentHub />} />
                        <Route path="contact" element={<ContactPage />} />
                        <Route path="financehub/ux-cards" element={<UXCardsCatalog />} />
                        {/* Archive fallback route */}
                        <Route path="archive/:module/*" element={<ArchiveRouteElement />} />
                        {/* Aliases for legacy paths */}
                        <Route path="ai/*" element={<Navigate to="/ai-hub" replace />} />
                        <Route path="health/*" element={<Navigate to="/healthhub" replace />} />
                        {/* LegacyBridge: native serving of static legacy HTML/CSS/JS without iframe */}
                        <Route path="legacy/*" element={<LegacyBridge />} />
                    </Route>
                </Routes>
            </Suspense>
        </Router>
    );
};

export default AppRouter; 