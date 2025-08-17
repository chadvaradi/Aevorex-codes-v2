import React from 'react';
import { Link } from 'react-router-dom';
import type { StudioTool } from '../../hooks/contenthub/useContentHubData';

interface ToolsSectionProps {
  studios: StudioTool[];
  getStudiosByCategory: (category: StudioTool['category']) => StudioTool[];
}

export const ToolsSection: React.FC<ToolsSectionProps> = ({ studios, getStudiosByCategory }) => {
  const getStudioIcon = (iconName: string) => {
    const icons = {
      'paintbrush-2': 'M12 19l7-7 3 3-7 7-3-3z M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z',
      'mail': 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22,6 L12,13 L2,6',
      'image': 'M3 3h18v18H3z M9 9h1v1H9z M21 15l-5-5L5 21',
      'video': 'M23 7l-7 5 7 5V7z M1 5h15v14H1z',
      'trending-up': 'M22 12h-4l-3 9L9 3l-3 9H2',
      'cpu': 'M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z'
    };
    return icons[iconName as keyof typeof icons] || icons.cpu;
  };

  const getStatusColor = (status: StudioTool['status']) => {
    switch (status) {
      case 'live': return 'text-green-500 bg-green-100 dark:bg-green-900/30';
      case 'beta': return 'text-orange-500 bg-orange-100 dark:bg-orange-900/30';
      case 'coming-soon': return 'text-gray-500 bg-gray-100 dark:bg-gray-900/30';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getStatusText = (status: StudioTool['status']) => {
    switch (status) {
      case 'live': return 'Live';
      case 'beta': return 'Beta';
      case 'coming-soon': return 'Soon';
      default: return 'Status';
    }
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Professzionális Tartalomkészítő Stúdiók
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Minden eszköz, amire szüksége van a teljes content workflow kezelésére - AI-támogatással és automatizálással.
          </p>
        </div>

        {/* Studios Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {studios.map((studio) => (
            <div
              key={studio.id}
              className="group bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 hover:bg-white dark:hover:bg-gray-700 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700"
            >
              {/* Studio Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" d={getStudioIcon(studio.icon)} />
                  </svg>
                </div>
                
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(studio.status)}`}>
                  {getStatusText(studio.status)}
                </span>
              </div>

              {/* Studio Info */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{studio.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                  {studio.description}
                </p>
              </div>

              {/* Feature Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {studio.features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-600 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* Launch Button */}
              <Link
                to={studio.url}
                className="block w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-center transition-colors duration-200 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-indigo-600"
              >
                {studio.title.split(' ')[0]} Megnyitása
                <svg className="inline-block w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 17l10-10M17 7H7v10" />
                </svg>
              </Link>
            </div>
          ))}
        </div>

        {/* Category Overview */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {getStudiosByCategory('creation').length} Creation Studios
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Social media, newsletter, visual és audio/video content készítés
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {getStudiosByCategory('analysis').length} Analytics Hub
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Teljesítmény elemzés, insights és performance tracking
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V5a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {getStudiosByCategory('optimization').length} Optimization Tools
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              AI prompt engineering és content optimalizálás
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}; 