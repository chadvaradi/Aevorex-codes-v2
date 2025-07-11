import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForexPairRate } from '@/hooks/macro/useForexPairRate';

interface ForexPairModalProps {
  isOpen: boolean;
  pair?: string;
  onClose: () => void;
}

const ForexPairModal: React.FC<ForexPairModalProps> = ({ isOpen, pair = 'EURUSD', onClose }) => {
  const { rateData, isLoading, isError, mutate } = useForexPairRate(pair);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-surface-default rounded-lg shadow-lg w-11/12 max-w-md p-6 space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-neutral-500 hover:text-neutral-700"
        >
          ✕
        </button>
        <h3 className="text-lg font-semibold text-content-primary">{pair} Details</h3>
        {isLoading && <p className="text-sm text-content-secondary">Loading…</p>}
        {isError && (
          <p className="text-sm text-red-600">Error loading FX rate. <button onClick={() => mutate()}>Retry</button></p>
        )}
        {rateData && (
          <div className="space-y-2">
            <div className="flex justify-between text-lg font-medium">
              <span>Rate</span>
              <span>{rateData.rate.toFixed(6)}</span>
            </div>
            <p className="text-sm text-content-secondary">
              Updated {new Date(rateData.timestamp).toLocaleString()} ・ {rateData.source}
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ForexPairModal; 