import React from 'react';
import { HeroSection } from '../components/mainpage/HeroSection';
import { LiveDemosSection } from '../components/mainpage/LiveDemosSection';
import { FeaturesSection } from '../components/mainpage/FeaturesSection';
import { CompetitiveSection } from '../components/mainpage/CompetitiveSection';
import { StatsSection } from '../components/mainpage/StatsSection';
import { CTASection } from '../components/mainpage/CTASection';
import { ContactSection } from '../components/mainpage/ContactSection';
import { useMainPageData } from '../hooks/mainpage/useMainPageData';

const MainPage: React.FC = () => {
  const {
    platformMetrics,
    moduleStatuses,
    competitorComparison,
    enterpriseStats,
    isLoading
  } = useMainPageData();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Az AEVOREX platform betöltése...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section - Main value proposition */}
      <HeroSection 
        metrics={platformMetrics}
        moduleStatuses={moduleStatuses}
      />

      {/* Live Demos Section - Interactive module showcase */}
      <LiveDemosSection 
        modules={moduleStatuses}
      />

      {/* Features Section - Platform capabilities */}
      <FeaturesSection />

      {/* Competitive Advantage - Why choose AEVOREX */}
      <CompetitiveSection 
        comparison={competitorComparison}
      />

      {/* Stats Section - Enterprise credibility */}
      <StatsSection 
        stats={enterpriseStats}
      />

      {/* CTA Section - Demo and contact */}
      <CTASection />

      {/* Contact Section - Enterprise sales */}
      <ContactSection />
    </div>
  );
};

export default MainPage; 