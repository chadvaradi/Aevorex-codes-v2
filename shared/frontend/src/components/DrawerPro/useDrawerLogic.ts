/**
 * Custom hook for drawer logic
 */
import { useState, useEffect, useCallback } from 'react';
import type { DrawerContextValue } from './types';

export interface UseDrawerLogicProps {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const useDrawerLogic = ({
  defaultOpen = false,
  onOpenChange
}: UseDrawerLogicProps): DrawerContextValue => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = useCallback(() => {
    setIsOpen(true);
    onOpenChange?.(true);
  }, [onOpenChange]);

  const close = useCallback(() => {
    setIsOpen(false);
    onOpenChange?.(false);
  }, [onOpenChange]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        close();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, close]);

  return {
    isOpen,
    open,
    close,
    toggle,
    size: 'default',
    position: 'right',
    overlay: true
  };
}; 