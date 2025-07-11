import React from 'react';
import { PageHeader } from '@/components/PageHeader';
import BuborRatesCard from '@/components/financehub/macro/BuborRatesCard';
import ECBPolicyRatesCard from '@/components/financehub/macro/ECBPolicyRatesCard.view';
import ECBYieldCurveCard from '@/components/financehub/macro/ECBYieldCurveCard';
import FxRatesCard from '@/components/financehub/macro/FxRatesCard';
import ECBComprehensiveCard from '@/components/financehub/macro/ECBComprehensiveCard';

const MacroRatesPage: React.FC = () => {
    return (
        <div className="container mx-auto p-4 md:p-6">
            <PageHeader
                title="Makrogazdasági Kamat- és Hozamadatok"
                subtitle="Valós idejű BUBOR, EKB alapkamatok, euró hozamgörbe és devizaárfolyamok."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                <BuborRatesCard />
                <ECBPolicyRatesCard />
                <ECBYieldCurveCard />
                <FxRatesCard />
                <ECBComprehensiveCard />
            </div>
        </div>
    );
};

export default MacroRatesPage; 