import React from 'react';
import STSSection from '../components/financehub/kpi/STSSection.view';

const HealthHub: React.FC = () => {
  return (
    <div className="px-4 sm:px-6 md:px-8 py-8 space-y-8">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Macro Health Dashboard</h1>
      <STSSection />
    </div>
  );
};

export default HealthHub; 