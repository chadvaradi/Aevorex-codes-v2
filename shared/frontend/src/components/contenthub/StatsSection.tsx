import React from 'react';
import type { ContentHubStats, ContentMetrics } from '../../hooks/contenthub/useContentHubData';

interface StatsSectionProps {
  stats: ContentHubStats;
  metrics: ContentMetrics;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ stats, metrics }) => {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Teljesítmény & Eredmények
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Valós idejű analytics és performance insights az összes content platformon
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-8 text-center border border-purple-100 dark:border-purple-800">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {stats.totalProjects}
            </div>
            <div className="text-gray-600 dark:text-gray-400 font-medium">Aktív projektek</div>
            <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">minden stúdióban</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 text-center border border-green-100 dark:border-green-800">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {stats.publishedContent}
            </div>
            <div className="text-gray-600 dark:text-gray-400 font-medium">Publikált tartalom</div>
            <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">ez a hónapban</div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 text-center border border-blue-100 dark:border-blue-800">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {stats.engagementRate}%
            </div>
            <div className="text-gray-600 dark:text-gray-400 font-medium">Engagement rate</div>
            <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">átlag a platformokon</div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl p-8 text-center border border-orange-100 dark:border-orange-800">
            <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              {stats.seoOptimization}/100
            </div>
            <div className="text-gray-600 dark:text-gray-400 font-medium">SEO optimalizáció</div>
            <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">átlag score</div>
          </div>
        </div>

        {/* Platform Metrics */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Platform Összesítők
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {metrics.contentGenerated}
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Content Generated</div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">összes platform</div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {metrics.activeUsers}
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Active Users</div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">havi unique</div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {metrics.platformsConnected}
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Platforms</div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">integráció</div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                99.9%
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Uptime</div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">szolgáltatás</div>
            </div>
          </div>
        </div>

        {/* Performance Trends */}
        <div className="grid md:grid-cols-2 gap-8 mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Content Performance</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Social Media</span>
                <div className="flex items-center">
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-3">
                    <div className="w-20 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">85%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Newsletter</span>
                <div className="flex items-center">
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-3">
                    <div className="w-22 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">92%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Visual Content</span>
                <div className="flex items-center">
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-3">
                    <div className="w-18 h-2 bg-purple-500 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium text-purple-600 dark:text-purple-400">78%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">AI Enhancement Usage</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Content Generation</span>
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">94%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">SEO Optimization</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">89%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Auto-scheduling</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">76%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Performance Analytics</span>
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">82%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 