import { useState, useCallback, useMemo } from 'react';
import type { Image } from '../../pages/AnaHi.view';

export interface GalleryStats {
  totalImages: number;
  totalViews: number;
  totalLikes: number;
  latestUpload: string;
}

// Mock data - in real implementation this would come from API
const MOCK_IMAGES: Image[] = [
  {
    id: 1,
    title: "Naplemente a hegyekben",
    description: "Gyönyörű naplemente a Kárpátokban",
    category: "nature",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
    likes: 24,
    views: 156,
    uploadDate: "2024-12-15"
  },
  {
    id: 2,
    title: "Városi élet",
    description: "Éjszakai városképek fényekkel",
    category: "travel",
    url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400",
    likes: 18,
    views: 89,
    uploadDate: "2024-12-10"
  },
  {
    id: 3,
    title: "Portré tanulmány",
    description: "Fekete-fehér portré természetes fényben",
    category: "portrait",
    url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400",
    likes: 31,
    views: 203,
    uploadDate: "2024-12-08"
  },
  {
    id: 4,
    title: "Tengerpart",
    description: "Kristálytiszta víz és fehér homok",
    category: "nature",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
    likes: 42,
    views: 287,
    uploadDate: "2024-12-05"
  },
  {
    id: 5,
    title: "Születésnapi ünneplés",
    description: "Családi összejövetel és vidámság",
    category: "events",
    url: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400",
    likes: 15,
    views: 67,
    uploadDate: "2024-12-01"
  }
];

export const useAnaHiGallery = () => {
  const [images, setImages] = useState<Image[]>(MOCK_IMAGES);
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const filteredImages = useMemo(() => {
    if (currentFilter === 'all') {
      return images;
    }
    return images.filter(img => img.category === currentFilter);
  }, [images, currentFilter]);

  const filterImages = useCallback((filter: string) => {
    setCurrentFilter(filter);
  }, []);

  const openImageViewer = useCallback((imageId: number) => {
    const index = images.findIndex(img => img.id === imageId);
    if (index !== -1) {
      setCurrentImageIndex(index);
      // Increment view count
      setImages(prev => prev.map(img => 
        img.id === imageId ? { ...img, views: img.views + 1 } : img
      ));
    }
  }, [images]);

  const showPreviousImage = useCallback(() => {
    setCurrentImageIndex(prev => 
      prev > 0 ? prev - 1 : images.length - 1
    );
  }, [images.length]);

  const showNextImage = useCallback(() => {
    setCurrentImageIndex(prev => 
      prev < images.length - 1 ? prev + 1 : 0
    );
  }, [images.length]);

  const addImage = useCallback(async (imageData: Omit<Image, 'id' | 'likes' | 'views' | 'uploadDate'>) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newImage: Image = {
      ...imageData,
      id: Math.max(...images.map(img => img.id)) + 1,
      likes: 0,
      views: 0,
      uploadDate: new Date().toISOString().split('T')[0]
    };

    setImages(prev => [newImage, ...prev]);
    setIsLoading(false);
  }, [images]);

  const updateImageStats = useCallback((imageId: number, action: 'like' | 'view') => {
    setImages(prev => prev.map(img => {
      if (img.id === imageId) {
        if (action === 'like') {
          return { ...img, likes: img.likes + 1 };
        } else if (action === 'view') {
          return { ...img, views: img.views + 1 };
        }
      }
      return img;
    }));
  }, []);

  const getStats = useCallback((): GalleryStats => {
    return {
      totalImages: images.length,
      totalViews: images.reduce((sum, img) => sum + img.views, 0),
      totalLikes: images.reduce((sum, img) => sum + img.likes, 0),
      latestUpload: images.length > 0 
        ? new Date(images[0].uploadDate).toLocaleDateString('hu-HU')
        : '-'
    };
  }, [images]);

  return {
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
  };
}; 