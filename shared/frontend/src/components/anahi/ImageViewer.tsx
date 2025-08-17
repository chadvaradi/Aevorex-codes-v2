import React from 'react';
import type { Image } from '../../pages/AnaHi.view';

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  image?: Image;
  onPrevious: () => void;
  onNext: () => void;
  onLike: (imageId: number) => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  isOpen,
  onClose,
  image,
  onPrevious,
  onNext,
  onLike
}) => {
  if (!isOpen || !image) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="relative w-full h-full max-w-6xl max-h-full p-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all"
        >
          <i className="fas fa-times"></i>
        </button>

        {/* Navigation buttons */}
        <button
          onClick={onPrevious}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all"
        >
          <i className="fas fa-chevron-left"></i>
        </button>

        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all"
        >
          <i className="fas fa-chevron-right"></i>
        </button>

        {/* Image container */}
        <div className="flex flex-col h-full">
          <div className="flex-1 flex items-center justify-center mb-4">
            <img
              src={image.url}
              alt={image.title}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>

          {/* Image info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-2xl mx-auto w-full">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {image.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {image.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center">
                  <i className="fas fa-eye mr-1 text-blue-500"></i>
                  {image.views} megtekintés
                </span>
                <span className="flex items-center">
                  <i className="fas fa-heart mr-1 text-red-500"></i>
                  {image.likes} kedvelés
                </span>
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                  {getCategoryLabel(image.category)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onLike(image.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                >
                  <i className="fas fa-heart mr-1"></i>
                  Kedvelés
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                  <i className="fas fa-share mr-1"></i>
                  Megosztás
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getCategoryLabel = (category: string): string => {
  const labels = {
    nature: 'Természet',
    portrait: 'Portré',
    travel: 'Utazás',
    events: 'Események'
  };
  return labels[category as keyof typeof labels] || category;
}; 