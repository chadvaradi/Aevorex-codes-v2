/**
 * DrawerTrigger - Component that triggers drawer open/close
 */
import React from 'react';
import { useDrawerContext } from './DrawerProvider';
import type { DrawerTriggerProps } from './types';

export const DrawerTrigger: React.FC<DrawerTriggerProps> = ({ 
  children, 
  className,
  asChild = false 
}) => {
  const { toggle } = useDrawerContext();

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    toggle();
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
      onClick: handleClick,
      className: `${(children.props as React.HTMLAttributes<HTMLElement>).className || ''} ${className || ''}`.trim()
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${className || ''}`}
    >
      {children}
    </button>
  );
}; 