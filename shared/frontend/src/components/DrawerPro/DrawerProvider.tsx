/**
 * DrawerProvider - Context provider for drawer state
 */
import React, { createContext, useContext } from 'react';
import type { DrawerContextValue } from './types';

const DrawerContext = createContext<DrawerContextValue | null>(null);

interface DrawerProviderProps {
  children: React.ReactNode;
  value: DrawerContextValue;
}

export const DrawerProvider: React.FC<DrawerProviderProps> = ({ 
  children, 
  value 
}) => {
  return (
    <DrawerContext.Provider value={value}>
      {children}
    </DrawerContext.Provider>
  );
};

export const useDrawerContext = (): DrawerContextValue => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawerContext must be used within a DrawerProvider');
  }
  return context;
}; 