import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Types
interface DrawerState {
  isOpen: boolean;
  activeModule: string | null;
  recentPages: Array<{
    path: string;
    label: string;
    timestamp: number;
  }>;
}

interface DrawerContextType extends DrawerState {
  toggleDrawer: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  navigateToModule: (path: string, label: string) => void;
  setActiveModule: (module: string | null) => void;
}

// Context
export const DrawerContext = createContext<DrawerContextType | null>(null);

// Hook
export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within a DrawerProvider');
  }
  return context;
};

// Provider hook
export const useDrawerProvider = (): DrawerContextType => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [state, setState] = useState<DrawerState>({
    isOpen: false,
    activeModule: null,
    recentPages: []
  });

  // Toggle drawer
  const toggleDrawer = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  // Open drawer
  const openDrawer = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: true }));
  }, []);

  // Close drawer
  const closeDrawer = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Navigate and track recent pages
  const navigateToModule = useCallback((path: string, label: string) => {
    navigate(path);
    
    setState(prev => ({
      ...prev,
      isOpen: false,
      recentPages: [
        { path, label, timestamp: Date.now() },
        ...prev.recentPages.filter(p => p.path !== path).slice(0, 4)
      ]
    }));
  }, [navigate]);

  // Set active module
  const setActiveModule = useCallback((module: string | null) => {
    setState(prev => ({ ...prev, activeModule: module }));
  }, []);

  // Auto-detect active module based on current route
  useEffect(() => {
    const pathname = location.pathname;
    let activeModule = null;
    
    if (pathname.startsWith('/ai-hub') || pathname.startsWith('/ai')) activeModule = 'AI Hub';
    else if (pathname.startsWith('/stock') || pathname.startsWith('/macro')) activeModule = 'Finance Hub';
    else if (pathname.startsWith('/healthhub') || pathname.startsWith('/health')) activeModule = 'Health Hub';
    
    setActiveModule(activeModule);
  }, [location.pathname, setActiveModule]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC to close drawer
      if (e.key === 'Escape' && state.isOpen) {
        closeDrawer();
      }
      
      // Cmd/Ctrl + K to toggle drawer
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleDrawer();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.isOpen, closeDrawer, toggleDrawer]);

  return {
    ...state,
    toggleDrawer,
    openDrawer,
    closeDrawer,
    navigateToModule,
    setActiveModule
  };
}; 