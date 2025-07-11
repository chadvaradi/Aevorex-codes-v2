import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import { MacroRatesPage, StockPage } from './pages';

// FinanceHub oldalak lazy-loading importálása
const AIHub = lazy(() => import('./pages/AIHub.view'));
const HealthHubPage = lazy(() => import('./pages/HealthHub.view'));
const ContentHub = lazy(() => import('./pages/ContentHub.view'));

const AppRouter: React.FC = () => {
    return (
        <Router>
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path="/" element={<AppLayout />}>
                        <Route index element={<Navigate to="/stock/AAPL" replace />} />
                        <Route path="stock/:ticker" element={<StockPage />} />
                        <Route path="macro-rates" element={<MacroRatesPage />} />
                        <Route path="macro" element={<MacroRatesPage />} />
                        <Route path="ai-hub" element={<AIHub />} />
                        <Route path="healthhub" element={<HealthHubPage />} />
                        <Route path="content-hub" element={<ContentHub />} />
                    </Route>
                </Routes>
            </Suspense>
        </Router>
    );
};

export default AppRouter; 