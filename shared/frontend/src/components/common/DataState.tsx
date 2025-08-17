import React from 'react';

interface StateProps {
  className?: string;
  message?: string;
}

export const LoadingState: React.FC<StateProps> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
    <div className="animate-[pulse_0.12s_ease-in-out_infinite] space-y-3">
      <div className="h-6 bg-gray-300 rounded w-1/2 mb-2" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-300 rounded" />
      ))}
    </div>
  </div>
);

export const ErrorState: React.FC<StateProps> = ({ className = '', message = 'Hiba történt az adatok betöltésekor.' }) => (
  <div className={`bg-red-50 dark:bg-red-900 rounded-lg shadow-sm border border-red-200 dark:border-red-700 p-6 text-red-700 dark:text-red-200 ${className}`}>
    {message}
  </div>
);

export const EmptyState: React.FC<StateProps> = ({ className = '', message = 'Nincs megjeleníthető adat.' }) => (
  <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-gray-500 dark:text-gray-400 ${className}`}>
    {message}
  </div>
); 