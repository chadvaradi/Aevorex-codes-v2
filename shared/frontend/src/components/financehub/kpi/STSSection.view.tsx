import React from 'react';
import { useSTSSectionLogic } from './STSSection.logic';
import { STSCard } from './STSCard.view';

const STSSection: React.FC = () => {
  const { stsData, isLoading, isError, indicators, metadata } = useSTSSectionLogic();

  if (isLoading) {
    return <div className="text-sm text-neutral-500">Loading STS data…</div>;
  }
  if (isError) {
    return <div className="text-sm text-red-600">Error loading STS data.</div>;
  }
  if (!stsData || Object.keys(stsData).length === 0) {
    return <div className="text-sm text-neutral-500">No STS data available.</div>;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          ECB Short-Term Statistics
        </h2>
        {metadata?.end_date && (
          <span className="text-xs text-neutral-500">Last update: {metadata.end_date}</span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {indicators.map((ind) => (
          <STSCard key={ind.key} title={ind.title} indicatorKey={ind.key} stsData={stsData} />
        ))}
      </div>
    </section>
  );
};

export default STSSection; 