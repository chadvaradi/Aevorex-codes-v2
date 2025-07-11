import React from 'react';
import { Dialog } from '@headlessui/react';
import { useFXDetailModal } from './FXDetailModal.logic';

interface FXDetailModalProps {
  controller: ReturnType<typeof useFXDetailModal>;
}

export const FXDetailModal: React.FC<FXDetailModalProps> = ({ controller }) => {
  const { open, closeModal, data, isLoading, error, pair } = controller;

  return (
    <Dialog open={open} onClose={closeModal} className="fixed inset-0 z-50 flex items-center justify-center">
      {/* @ts-expect-error -- headlessui types */}
      <Dialog.Overlay className="fixed inset-0 bg-black/40" />
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-md mx-auto p-6 z-50 relative">
        <Dialog.Title className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
          {pair ? `FX Detail – ${pair}` : 'FX Detail'}
        </Dialog.Title>
        {isLoading && <p className="text-sm text-neutral-500">Loading…</p>}
        {error && <p className="text-sm text-danger-600">Failed to load data.</p>}
        {data && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Rate:</span>
              <span className="font-mono">{data.rate.toFixed(4)}</span>
            </div>
            {data.change !== undefined && (
              <div className="flex justify-between text-sm">
                <span>Change:</span>
                <span className={data.change > 0 ? 'text-success-600' : data.change < 0 ? 'text-danger-600' : ''}>
                  {data.change.toFixed(4)} ({(data.change_percent ?? 0).toFixed(2)}%)
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>Timestamp:</span>
              <span>{new Date(data.timestamp).toLocaleString()}</span>
            </div>
          </div>
        )}
        <button onClick={closeModal} className="absolute top-3 right-3 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">
          ×
        </button>
      </div>
    </Dialog>
  );
}; 