import React from 'react';
import BuborRatesCard from '@/components/financehub/macro/BuborRatesCard';
import ECBPolicyRatesCard from '@/components/financehub/macro/ECBPolicyRatesCard.view';
import ECBYieldCurveCard from '@/components/financehub/macro/ECBYieldCurveCard';
import ECBComprehensiveCard from '@/components/financehub/macro/ECBComprehensiveCard';
import FxRatesCard from '@/components/financehub/macro/FxRatesCard';
import ForexPairsDropdown from '@/components/financehub/macro/ForexPairsDropdown';
import HistoricalYieldCurveChart from '@/components/financehub/macro/HistoricalYieldCurveChart';
import USTYieldCurveChart from '@/components/financehub/macro/USTYieldCurveChart.view';
import ECBPropertyPricesCard from '@/components/financehub/macro/ECBPropertyPricesCard';
import ECBCBDCard from '@/components/financehub/macro/ECBCBDCard';
import ECBIVFCard from '@/components/financehub/macro/ECBIVFCard';
import ECBSECCard from '@/components/financehub/macro/ECBSECCard';
import STSSection from '@/components/financehub/kpi/STSSection.view';

const MacroRatesPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-content-primary">
          Macro Rates
        </h1>
        <p className="mt-2 text-lg text-content-secondary">
          European Central Bank and Hungarian National Bank monetary policy rates
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BuborRatesCard />
        <ECBPolicyRatesCard />
        <ECBYieldCurveCard />
        <ECBComprehensiveCard />
        <FxRatesCard />
        <ForexPairsDropdown />
        <ECBPropertyPricesCard />
        <ECBCBDCard />
        <ECBIVFCard />
        <ECBSECCard />
        <div className="lg:col-span-2">
          <HistoricalYieldCurveChart />
          <USTYieldCurveChart />
        </div>
      </div>

      {/* Short-Term Statistics KPI Section */}
      <STSSection />
    </div>
  );
};

export default MacroRatesPage; 