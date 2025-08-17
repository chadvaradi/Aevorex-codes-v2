import React from 'react';
import STSSection from '../components/financehub/kpi/STSSection.view';
import { AIInsightsSection } from '../components/healthhub/AIInsightsSection';
import { ComplianceSection } from '../components/healthhub/ComplianceSection';
import { useHealthHubData } from '../hooks/healthhub/useHealthHubData';

const HealthHub: React.FC = () => {
  const {
    aiInsights,
    complianceFeatures,
    getInsightsByPriority,
  } = useHealthHubData();

  return (
    <div className="px-4 sm:px-6 md:px-8 py-8 space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Health Hub</h1>
        <a href="/archive/healthhub/" className="text-sm text-primary hover:underline">View archive version</a>
      </div>

      {/* Analytics (ECBx/STS) */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Analytics</h2>
        <STSSection />
      </section>

      {/* AI Insights */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">AI Insights</h2>
        <AIInsightsSection
          viewInsightDetails={() => {}}
          getInsightsByPriority={getInsightsByPriority}
          aiInsights={aiInsights}
        />
      </section>

      {/* Compliance */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Compliance</h2>
        <ComplianceSection complianceFeatures={complianceFeatures} />
      </section>
    </div>
  );
};

export default HealthHub; 