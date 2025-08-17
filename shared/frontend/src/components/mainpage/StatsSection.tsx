import React from 'react';
import type { EnterpriseStats } from '../../hooks/mainpage/useMainPageData';

interface StatsSectionProps {
  stats: EnterpriseStats;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
  const statItems = [
    {
      value: stats.activeUsers,
      label: 'Aktív Felhasználó',
      description: 'Enterprise ügyfelek világszerte',
      icon: 'users'
    },
    {
      value: stats.uptime,
      label: 'Uptime SLA',
      description: 'Guaranteed szolgáltatás rendelkezésre állás',
      icon: 'activity'
    },
    {
      value: stats.processedData,
      label: 'Feldolgozott Adat',
      description: 'AI modellek által elemezve',
      icon: 'database'
    },
    {
      value: stats.support,
      label: 'Enterprise Support',
      description: 'Dedikált szakember csapat',
      icon: 'headphones'
    }
  ];

  return (
    <section className="py-20 bg-gray-900 dark:bg-black text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Számok, Amelyek Beszélnek
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Több ezer vállalat bízik az AEVOREX platformban kritikus üzleti folyamataik kezelésében.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {statItems.map((item, index) => (
            <div
              key={index}
              className="text-center bg-gray-800 dark:bg-gray-900 rounded-xl p-8 hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors duration-300 border border-gray-700"
            >
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="2" d={getStatIcon(item.icon)} />
                </svg>
              </div>
              
              <div className="text-4xl font-bold text-white mb-2">{item.value}</div>
              <div className="text-lg font-semibold text-indigo-400 mb-2">{item.label}</div>
              <p className="text-gray-400 text-sm">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Credibility Badges */}
        <div className="mt-16 pt-16 border-t border-gray-700">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Tanúsítványok és Megfelelőség</h3>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
            <div className="bg-gray-800 px-6 py-3 rounded-lg border border-gray-600">
              <span className="text-sm font-semibold">ISO 27001</span>
            </div>
            <div className="bg-gray-800 px-6 py-3 rounded-lg border border-gray-600">
              <span className="text-sm font-semibold">GDPR Compliant</span>
            </div>
            <div className="bg-gray-800 px-6 py-3 rounded-lg border border-gray-600">
              <span className="text-sm font-semibold">SOC 2 Type II</span>
            </div>
            <div className="bg-gray-800 px-6 py-3 rounded-lg border border-gray-600">
              <span className="text-sm font-semibold">Enterprise Ready</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const getStatIcon = (iconName: string) => {
  const icons = {
    users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z',
    activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
    database: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4',
    headphones: 'M18 11a6 6 0 00-12 0v5h2a2 2 0 002-2v-3a2 2 0 00-2-2 6 6 0 1112 0 2 2 0 00-2 2v3a2 2 0 002 2h2v-5z'
  };
  return icons[iconName as keyof typeof icons] || icons.activity;
}; 