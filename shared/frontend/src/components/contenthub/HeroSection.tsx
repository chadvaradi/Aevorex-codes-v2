import React from 'react';
import type { ContentMetrics } from '../../hooks/contenthub/useContentHubData';

interface HeroSectionProps {
  metrics: ContentMetrics;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ metrics }) => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700/25 bg-[length:60px_60px] opacity-40"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-purple-300 to-indigo-300 dark:from-purple-900 dark:to-indigo-900 rounded-full blur-3xl opacity-20 transform -translate-x-1/3 -translate-y-1/3"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Brand Message */}
          <div className="text-center lg:text-left">
            {/* Content Hub Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm font-medium mb-6">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></div>
              AI Content Platform v2.0 - Live & Creative
            </div>

            {/* Main Headlines */}
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              AI-Vezérelt{' '}
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Tartalomgyártás
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Komplett social media workflow, newsletter eszközök, vizuális tartalom készítés és teljesítmény elemzés, 
              mind egy platformon.
            </p>

            {/* Hero Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center justify-center lg:justify-start">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" d="M12 19l7-7 3 3-7 7-3-3z M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                  </svg>
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">Social Media Studio</span>
              </div>
              
              <div className="flex items-center justify-center lg:justify-start">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">Content Analytics</span>
              </div>
              
              <div className="flex items-center justify-center lg:justify-start">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">Visual Creator</span>
              </div>
            </div>

            {/* Platform Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{metrics.contentGenerated}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Content Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{metrics.seoScoreAvg}/100</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg SEO Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{metrics.activeUsers}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{metrics.platformsConnected}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Platforms</div>
              </div>
            </div>
          </div>

          {/* Right Column - Content Preview */}
          <div className="lg:pl-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Editor Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <div className="flex space-x-2">
                  <span className="px-3 py-1 bg-purple-600 text-white text-sm rounded-md">Blog Post</span>
                  <span className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-md">Social Media</span>
                  <span className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-md">Newsletter</span>
                </div>
                <button className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors">
                  AI Generate
                </button>
              </div>

              {/* Editor Content */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    How AI is Revolutionizing Content Creation
                  </h3>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                    AI enhanced
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  In today's digital landscape, content creators are constantly seeking...
                </p>
                
                <div className="flex items-center text-gray-500 dark:text-gray-500 text-sm">
                  <div className="animate-pulse flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    <span>AI writing...</span>
                  </div>
                </div>
              </div>

              {/* SEO Panel */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">Content Score</h4>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{metrics.seoScoreAvg}/100</div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Engagement</span>
                    <span className="text-green-600 dark:text-green-400">✓</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Visual Impact</span>
                    <span className="text-green-600 dark:text-green-400">✓</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Scheduling</span>
                    <span className="text-yellow-600 dark:text-yellow-400">!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 