import React, { useEffect, useState } from 'react';
import { useForexPairs } from '@/hooks/macro/useForexPairs';
import { useForexPairRate } from '@/hooks/macro/useForexPairRate';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui';
import ForexPairModal from '@/components/financehub/macro/ForexPairModal';

const ForexPairsDropdown: React.FC = () => {
  const { pairs, isLoading: pairsLoading, isError: pairsError, mutate: mutatePairs } = useForexPairs();
  const [selectedPair, setSelectedPair] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);

  // Update default pair when pairs first load
  useEffect(() => {
    if (!pairsLoading && pairs.length && !selectedPair) {
      setSelectedPair(pairs[0]);
    }
  }, [pairsLoading, pairs, selectedPair]);

  const { rateData, isLoading: rateLoading, isError: rateError, mutate: mutateRate } =
    useForexPairRate(selectedPair);

  const handleRetry = () => {
    mutatePairs();
    mutateRate();
  };

  const renderContent = () => {
    if (pairsLoading || rateLoading) {
      return <Skeleton className="h-10 w-full" />;
    }

    if (pairsError || rateError) {
      return <ErrorState message="Failed to load FX rate." retryFn={handleRetry} />;
    }

    if (!rateData) {
      return <div className="text-sm text-content-secondary">No data.</div>;
    }

    return (
      <div className="flex flex-col space-y-2">
        <select
          value={selectedPair}
          onChange={(e) => {
            setSelectedPair(e.target.value);
            mutateRate();
          }}
          className="border rounded px-2 py-1 dark:bg-gray-800 dark:text-gray-100"
        >
          {pairs.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <button
          onClick={() => setModalOpen(true)}
          className="text-primary text-sm underline self-end"
        >
          Details
        </button>
        <div className="flex justify-between text-lg font-medium">
          <span>{rateData.pair}</span>
          <span>{rateData.rate.toFixed(4)}</span>
        </div>
        <p className="text-xs text-content-secondary">{new Date(rateData.timestamp).toLocaleString()} ・ {rateData.source}</p>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>FX Rate</CardTitle>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
      <ForexPairModal isOpen={modalOpen} pair={selectedPair} onClose={() => setModalOpen(false)} />
    </Card>
  );
};

export default ForexPairsDropdown; 