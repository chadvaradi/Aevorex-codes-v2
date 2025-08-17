import React from 'react';

interface FilterBarProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { id: 'all', label: 'Összes', icon: 'fas fa-th' },
  { id: 'nature', label: 'Természet', icon: 'fas fa-tree' },
  { id: 'portrait', label: 'Portré', icon: 'fas fa-user' },
  { id: 'travel', label: 'Utazás', icon: 'fas fa-plane' },
  { id: 'events', label: 'Események', icon: 'fas fa-calendar' },
];

export const FilterBar: React.FC<FilterBarProps> = ({ currentFilter, onFilterChange }) => {
  return (
    <section className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-3 justify-center">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`
                inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${currentFilter === filter.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-600'
                }
              `}
            >
              <i className={`${filter.icon} mr-2`}></i>
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}; 