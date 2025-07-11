/**
 * DrawerContent - The actual drawer content with animations and positioning
 */
import React, { useRef, useEffect } from 'react';
import { useDrawerContext } from './DrawerProvider';
import type { DrawerContentProps } from './types';

export const DrawerContent: React.FC<DrawerContentProps> = ({
  children,
  title,
  description,
  className,
  showCloseButton = true
}) => {
  const { isOpen, close, position, overlay } = useDrawerContext();
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        isOpen &&
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  const getPositionClasses = () => {
    switch (position) {
      case 'left':
        return 'left-0 top-0 h-full transform -translate-x-full data-[state=open]:translate-x-0';
      case 'right':
        return 'right-0 top-0 h-full transform translate-x-full data-[state=open]:translate-x-0';
      case 'top':
        return 'top-0 left-0 w-full transform -translate-y-full data-[state=open]:translate-y-0';
      case 'bottom':
        return 'bottom-0 left-0 w-full transform translate-y-full data-[state=open]:translate-y-0';
      default:
        return 'right-0 top-0 h-full transform translate-x-full data-[state=open]:translate-x-0';
    }
  };

  return (
    <>
      {/* Overlay */}
      {overlay && (
        <div
          className="fixed inset-0 z-50 bg-black/50 transition-opacity data-[state=open]:opacity-100 data-[state=closed]:opacity-0"
          data-state={isOpen ? 'open' : 'closed'}
          onClick={close}
        />
      )}

      {/* Drawer Content */}
      <div
        ref={contentRef}
        className={`fixed z-50 bg-white shadow-lg transition-transform duration-300 ease-in-out ${getPositionClasses()} ${className || ''}`}
        data-state={isOpen ? 'open' : 'closed'}
      >
        {/* Header */}
        {(title || description || showCloseButton) && (
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-gray-900">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-gray-600">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={close}
                className="rounded-md p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {children}
        </div>
      </div>
    </>
  );
}; 