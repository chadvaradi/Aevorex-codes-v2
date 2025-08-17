import React from 'react';
import type { GalleryStats } from '../../hooks/anahi/useAnaHiGallery';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GalleryStats;
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, stats }) => {
  if (!isOpen) return null;

  const statItems = [
    {
      icon: 'fas fa-images',
      label: 'Összes Kép',
      value: stats.totalImages,
      color: 'text-blue-600'
    },
    {
      icon: 'fas fa-eye',
      label: 'Megtekintések',
      value: stats.totalViews,
      color: 'text-green-600'
    },
    {
      icon: 'fas fa-heart',
      label: 'Kedvelések',
      value: stats.totalLikes,
      color: 'text-red-600'
    },
    {
      icon: 'fas fa-calendar',
      label: 'Utolsó Feltöltés',
      value: stats.latestUpload,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Galéria Statisztikák
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {statItems.map((item, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className={`${item.color} text-2xl mb-2`}>
                  <i className={item.icon}></i>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {item.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 