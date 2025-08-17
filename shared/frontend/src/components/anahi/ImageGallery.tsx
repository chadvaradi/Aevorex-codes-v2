import React from 'react';
import type { Image } from '../../pages/AnaHi.view';

interface ImageGalleryProps {
  images: Image[];
  onImageClick: (imageId: number) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onImageClick }) => {
  if (images.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <i className="fas fa-images text-6xl text-gray-400 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Nincsenek képek ebben a kategóriában
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Próbálj ki egy másik szűrőt vagy tölts fel képeket.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {images.map((image) => (
        <div
          key={image.id}
          onClick={() => onImageClick(image.id)}
          className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
        >
          <div className="aspect-w-16 aspect-h-12 relative overflow-hidden">
            <img
              src={image.url}
              alt={image.title}
              loading="lazy"
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
              {image.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {image.description}
            </p>
            
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-3">
                <span className="flex items-center">
                  <i className="fas fa-heart mr-1 text-red-500"></i>
                  {image.likes}
                </span>
                <span className="flex items-center">
                  <i className="fas fa-eye mr-1 text-blue-500"></i>
                  {image.views}
                </span>
              </div>
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                {getCategoryLabel(image.category)}
              </span>
            </div>
          </div>
        </div>
      ))}
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