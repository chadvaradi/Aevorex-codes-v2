import React from 'react';
import { useDebtEquityStats } from '../../../../hooks/macro/useDebtEquityStats';
import { Card } from '../../../ui/Card';

const DebtEquityMiniChart: React.FC = () => {
  const { stats, isLoading, error } = useDebtEquityStats();

  if (isLoading) {
    return <Card className="animate-pulse h-24" />;
  }
  if (error || !stats) {
    return <Card className="text-red-500 p-4">Debt vs Equity unavailable</Card>;
  }

  const total = stats.debt_total + stats.equity_total;
  const debtPct = total ? (stats.debt_total / total) * 100 : 0;
  const equityPct = 100 - debtPct;

  return (
    <Card className="p-4 flex flex-col gap-2 bg-white dark:bg-neutral-800">
      <h3 className="text-sm font-semibold">Debt vs Equity issuance</h3>
      <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded overflow-hidden">
        <div
          className="bg-indigo-600 h-full"
          style={{ width: `${debtPct}%` }}
          title={`Debt ${debtPct.toFixed(1)}%`}
        />
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-indigo-600">Debt {debtPct.toFixed(1)}%</span>
        <span className="text-emerald-500">Equity {equityPct.toFixed(1)}%</span>
      </div>
    </Card>
  );
};

export default DebtEquityMiniChart; 