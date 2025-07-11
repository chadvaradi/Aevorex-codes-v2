/**
 * Type definitions for DrawerPro component
 */
import { ReactNode } from 'react';

export interface DrawerProProps {
  children?: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  size?: 'small' | 'default' | 'large' | 'full';
  position?: 'left' | 'right' | 'top' | 'bottom';
  overlay?: boolean;
  closeOnOutsideClick?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}

export interface DrawerContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  size: DrawerProProps['size'];
  position: DrawerProProps['position'];
  overlay: boolean;
}

export interface DrawerTriggerProps {
  children: ReactNode;
  className?: string;
  asChild?: boolean;
}

export interface DrawerContentProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  showCloseButton?: boolean;
} 