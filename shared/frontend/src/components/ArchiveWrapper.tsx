import React, { useEffect, useRef, useState } from 'react';

interface ArchiveWrapperProps {
  moduleName: string;
  title: string;
  className?: string;
}

export const ArchiveWrapper: React.FC<ArchiveWrapperProps> = ({ 
  moduleName, 
  title, 
  className = '' 
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      setIsLoading(false);
      
      // ✅ BIZTONSÁGOS dark mode sync
      if (iframe.contentWindow) {
        const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        iframe.contentWindow.postMessage(
          { type: 'THEME_UPDATE', theme }, 
          window.location.origin // ✅ Explicit origin megadása biztonsági okokból
        );
      }
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
    };
  }, [moduleName]);

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {title} nem elérhető
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Archive modul betöltési hiba
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* ✅ Premium loading skeleton - <200ms shimmer effect */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 rounded-lg z-10">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              {title} betöltése...
            </span>
          </div>
        </div>
      )}
      
      {/* ✅ iframe sandbox biztonság */}
      <iframe
        ref={iframeRef}
        src={`/legacy/${moduleName}/index.html`}
        className="w-full h-screen border-0 rounded-lg shadow-sm bg-white dark:bg-gray-900"
        title={title}
        sandbox="allow-scripts allow-same-origin allow-forms"
        loading="lazy"
      />
    </div>
  );
}; 