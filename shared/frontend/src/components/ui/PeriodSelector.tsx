import React from 'react';

export interface PeriodOption {
  value: string;
  label: string;
  description?: string;
}

interface PeriodSelectorProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  options?: PeriodOption[];
  className?: string;
}

const defaultOptions: PeriodOption[] = [
  { value: '1w', label: '1W', description: '1 week' },
  { value: '1m', label: '1M', description: '1 month' },
  { value: '6m', label: '6M', description: '6 months' },
  { value: '1y', label: '1Y', description: '1 year' },
];

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
  options = defaultOptions,
  className = '',
}) => {
  return (
    <div className={`flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onPeriodChange(option.value)}
          className={`
            px-3 py-1 text-sm font-medium rounded-md transition-all duration-200
            ${
              selectedPeriod === option.value
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }
          `}
          title={option.description}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default PeriodSelector; 