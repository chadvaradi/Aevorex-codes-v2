import React from 'react';

interface ErrorStateProps {
  message?: string;
  retryFn?: () => void;
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  message = "Failed to load data", 
  retryFn,
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-6 text-center ${className}`}>
      <div className="text-red-500 mb-2">
        <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{message}</p>
      {retryFn && (
        <button
          onClick={retryFn}
          className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState; 