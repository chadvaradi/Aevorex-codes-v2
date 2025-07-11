/**
 * DrawerPro - Modular drawer component for FinanceHub
 * Refactored to comply with FinanceHub rules (<200 lines per file)
 */
import React from 'react';
import { DrawerProvider } from './DrawerProvider';
import { DrawerContent } from './DrawerContent';
import { DrawerTrigger } from './DrawerTrigger';
import type { DrawerProProps, DrawerTriggerProps, DrawerContentProps } from './types';

interface DrawerProComponent extends React.FC<DrawerProProps> {
  Trigger: React.FC<DrawerTriggerProps>;
  Content: React.FC<DrawerContentProps>;
}

const DrawerProBase: React.FC<DrawerProProps> = ({
  children,
  className,
  size = 'default',
  position = 'right',
  overlay = true,
  onOpenChange,
  defaultOpen = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  const open = React.useCallback(() => {
    setIsOpen(true);
    onOpenChange?.(true);
  }, [onOpenChange]);

  const close = React.useCallback(() => {
    setIsOpen(false);
    onOpenChange?.(false);
  }, [onOpenChange]);

  const toggle = React.useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  const contextValue = React.useMemo(() => ({
    isOpen,
    open,
    close,
    toggle,
    size,
    position,
    overlay
  }), [isOpen, open, close, toggle, size, position, overlay]);

  return (
    <DrawerProvider value={contextValue}>
      <div className={className} {...props}>
        {children}
      </div>
    </DrawerProvider>
  );
};

const DrawerPro = DrawerProBase as DrawerProComponent;

// Export sub-components for compound pattern
DrawerPro.Trigger = DrawerTrigger;
DrawerPro.Content = DrawerContent;

export default DrawerPro;
export { DrawerProvider, DrawerContent, DrawerTrigger };
export type { DrawerProProps } from './types'; 