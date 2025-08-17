import React, { useState, useCallback } from 'react';
import { ImageGallery } from '../components/anahi/ImageGallery';
import { UploadModal } from '../components/anahi/UploadModal';
import { StatsModal } from '../components/anahi/StatsModal';
import { ImageViewer } from '../components/anahi/ImageViewer';
import { FilterBar } from '../components/anahi/FilterBar';
import { useAnaHiGallery } from '../hooks/anahi/useAnaHiGallery';
import { useNotification } from '../hooks/ui/useNotification';

export interface Image {
  id: number;
  title: string;
  description: string;
  category: 'nature' | 'portrait' | 'travel' | 'events';
  url: string;
  likes: number;
  views: number;
  uploadDate: string;
}

const AnaHi: React.FC = () => {
  const {
    images,
    currentFilter,
    currentImageIndex,
    isLoading,
    filteredImages,
    filterImages,
    openImageViewer,
    showPreviousImage,
    showNextImage,
    addImage,
    updateImageStats,
    getStats
  } = useAnaHiGallery();

  const { showNotification } = useNotification();

  const [modals, setModals] = useState({
    upload: false,
    stats: false,
    viewer: false
  });

  const openModal = useCallback((modalType: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalType]: true }));
  }, []);

  const closeModal = useCallback((modalType: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalType]: false }));
  }, []);

  const handleImageClick = useCallback((imageId: number) => {
    openImageViewer(imageId);
    openModal('viewer');
  }, [openImageViewer, openModal]);

  const handleUpload = useCallback(async (imageData: Omit<Image, 'id' | 'likes' | 'views' | 'uploadDate'>) => {
    try {
      await addImage(imageData);
      closeModal('upload');
      showNotification('Kép sikeresen feltöltve!', 'success');
    } catch (error) {
      showNotification('Hiba történt a feltöltés során!', 'error');
    }
  }, [addImage, closeModal, showNotification]);

  const handleLike = useCallback((imageId: number) => {
    updateImageStats(imageId, 'like');
  }, [updateImageStats]);

  const currentImage = images[currentImageIndex];
  const stats = getStats();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <i className="fas fa-camera-retro"></i>
                  AnaHí
                </h1>
                <span className="text-sm text-gray-600 dark:text-gray-400">Személyes Galéria</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => openModal('upload')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <i className="fas fa-upload mr-2"></i>
                Kép Feltöltés
              </button>
              <button
                onClick={() => openModal('stats')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <i className="fas fa-chart-bar mr-2"></i>
                Statisztikák
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Üdvözöllek a személyes galériámban!
          </h2>
          <p className="text-xl opacity-90">
            Itt találod kedvenc fényképeimet és emlékezetes pillanataimat.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <FilterBar 
        currentFilter={currentFilter} 
        onFilterChange={filterImages}
      />

      {/* Gallery Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ImageGallery 
          images={filteredImages}
          onImageClick={handleImageClick}
        />
      </main>

      {/* Modals */}
      <UploadModal
        isOpen={modals.upload}
        onClose={() => closeModal('upload')}
        onUpload={handleUpload}
      />

      <StatsModal
        isOpen={modals.stats}
        onClose={() => closeModal('stats')}
        stats={stats}
      />

      <ImageViewer
        isOpen={modals.viewer}
        onClose={() => closeModal('viewer')}
        image={currentImage}
        onPrevious={showPreviousImage}
        onNext={showNextImage}
        onLike={handleLike}
      />
    </div>
  );
};

export default AnaHi; 