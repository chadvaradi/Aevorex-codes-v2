import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        {title}
      </h1>
      <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
        {subtitle}
      </p>
    </div>
  );
}; 