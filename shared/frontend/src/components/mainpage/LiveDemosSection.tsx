import React from 'react';
import { Link } from 'react-router-dom';
import type { ModuleStatus } from '../../hooks/mainpage/useMainPageData';

interface LiveDemosSectionProps {
  modules: ModuleStatus[];
}

export const LiveDemosSection: React.FC<LiveDemosSectionProps> = ({ modules }) => {
  return (
    <section id="live-demos" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Próbálja Ki Élőben - Működő Modulok
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Minden modul élő és működőképes. Kattintson és fedezze fel az AEVOREX platform teljes funkcionalitását.
          </p>
        </div>

        {/* Demo Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {modules.map((module) => (
            <Link
              key={module.id}
              to={module.url}
              className="group bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-4 transition-all duration-300 border border-gray-200 dark:border-gray-700"
            >
              {/* Status Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Live & Ready</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">localhost:{module.port}</div>
              </div>

              {/* Module Info */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{module.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {getModuleDescription(module.id)}
                </p>
              </div>

              {/* Feature Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {module.features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded-full"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* Launch Button */}
              <div className="group-hover:bg-indigo-600 bg-indigo-500 text-white p-3 rounded-lg transition-colors duration-200 flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 17l10-10M17 7H7v10" />
                </svg>
                <span className="font-medium">{module.title} Megnyitása</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Összes modul egyszerre elérhető egyetlen platformon
          </p>
          <Link
            to="/stock/AAPL"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            Indítsa El a Teljes Platformot
          </Link>
        </div>
      </div>
    </section>
  );
};

const getModuleDescription = (moduleId: string): string => {
  const descriptions = {
    finance: 'Komplex pénzügyi elemzések, élő piaci adatok, TradingView integráció és AI-alapú előrejelzések.',
    health: 'Intelligens egészségügyi analitika, diagnosztikai támogatás és betegmonitorozó rendszerek.',
    content: 'Teljes tartalomkezelő rendszer SEO optimalizálással, média kezeléssel és workflow automatizálással.',
    ai: 'Fejlett gépi tanulási modellek, természetes nyelvfeldolgozás és prediktív analytics.'
  };
  return descriptions[moduleId as keyof typeof descriptions] || 'Enterprise szintű megoldás üzleti folyamatok optimalizálásához.';
}; 