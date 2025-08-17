import React from 'react';
import { Link } from 'react-router-dom';
import type { PlatformMetrics, ModuleStatus } from '../../hooks/mainpage/useMainPageData';

interface HeroSectionProps {
  metrics: PlatformMetrics;
  moduleStatuses: ModuleStatus[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({ metrics, moduleStatuses }) => {
  const getStatusIcon = (status: ModuleStatus['status']) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'maintenance': return 'text-yellow-500';
      case 'offline': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getModuleIcon = (iconName: string) => {
    const iconMap = {
      'dollar-sign': 'M12 1v6m0 6v6m11-7h-6m-6 0H1m15.5-6.5l-4.24 4.24M7.76 16.24l-4.24 4.24m0-11.31l4.24 4.24m8.48 4.24l4.24 4.24',
      'activity': 'M22 12h-4l-3 9L9 3l-3 9H2',
      'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14,2 L14,8 L20,8 M16,13 L8,13 M16,17 L8,17 M10,9 L9,9 L8,9',
      'cpu': 'M4 16v-2.38C4 11.5 2.97 10.5 3 9c.03-1.5 1-2.5 3-2.5h8c2 0 2.97 1 3 2.5.03 1.5-1 2.5-1 4.12V16c0 .55-.45 1-1 1H5c-.55 0-1-.45-1-1z'
    };
    return iconMap[iconName as keyof typeof iconMap] || iconMap['cpu'];
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700/25 bg-[length:60px_60px] opacity-40"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-purple-300 to-indigo-300 dark:from-purple-900 dark:to-indigo-900 rounded-full blur-3xl opacity-20 transform translate-x-1/3 -translate-y-1/3"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Brand Message */}
          <div className="text-center lg:text-left">
            {/* Status Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium mb-6">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Enterprise Intelligence Platform v2.0 - Live & Operational
            </div>

            {/* Main Headlines */}
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Az Egyetlen Platform, Amire{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Szüksége Van
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Míg mások külön szolgáltatásokat árulnak milliárdos árakért, mi egy helyen adjuk a teljes megoldást: 
              Finance, Health, Content és AI - integrálva, optimalizálva, azonnal használható.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link
                to="/stock/AAPL"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                Kezdje Interaktív Demóval
              </Link>
              
              <a
                href="#live-demos"
                className="inline-flex items-center px-8 py-4 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200"
              >
                Élő Modulok Megtekintése
              </a>
            </div>

            {/* Platform Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{metrics.uptime}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Uptime SLA</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{metrics.responseTime}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">API Response</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{metrics.securityGrade}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Grade Security</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{metrics.supportAvailability}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Support</div>
              </div>
            </div>
          </div>

          {/* Right Column - Module Preview Grid */}
          <div className="lg:pl-8">
            <div className="grid grid-cols-2 gap-4">
              {moduleStatuses.map((module) => (
                <Link
                  key={module.id}
                  to={module.url}
                  className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-200 dark:border-gray-700"
                >
                  {/* Module Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-2 h-2 rounded-full ${getStatusIcon(module.status)}`}></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Online</span>
                  </div>

                  {/* Module Icon & Title */}
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mr-3">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path d={getModuleIcon(module.icon)} />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{module.title}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{module.subtitle}</p>
                    </div>
                  </div>

                  {/* Module Metrics */}
                  <div className="space-y-2">
                    {module.metrics.slice(0, 2).map((metric, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">{metric.label}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{metric.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Hover Arrow */}
                  <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 17l10-10M17 7H7v10" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 