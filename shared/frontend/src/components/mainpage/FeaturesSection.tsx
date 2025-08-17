import React from 'react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: 'dollar-sign',
      title: 'Finance HUB',
      description: 'Élő piaci adatok, TradingView integráció, AI-alapú kockázatelemzés és portfólió optimalizálás.',
      highlights: ['Real-time market data', 'Risk analytics', 'Portfolio optimization', 'Trading algorithms']
    },
    {
      icon: 'activity',
      title: 'Health HUB',
      description: 'Intelligens diagnosztikai támogatás, betegadatok elemzése és személyre szabott egészségügyi ajánlások.',
      highlights: ['Medical AI diagnostics', 'Patient monitoring', 'Health analytics', 'Treatment optimization']
    },
    {
      icon: 'file-text',
      title: 'Content HUB',
      description: 'Teljes tartalomkezelő rendszer, SEO optimalizálás, média management és workflow automatizálás.',
      highlights: ['Content management', 'SEO automation', 'Media processing', 'Workflow optimization']
    },
    {
      icon: 'cpu',
      title: 'AI HUB',
      description: 'Fejlett gépi tanulási modellek, természetes nyelvfeldolgozás és prediktív analytics intelligens üzleti automatizáláshoz.',
      highlights: ['Machine learning', 'Natural language processing', 'Computer vision', 'Predictive analytics']
    }
  ];

  return (
    <section id="features" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Négy Modul, Egy Platform
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Az AEVOREX minden üzleti igényt lefed - a pénzügyi analitikától az AI-alapú döntéshozatalig.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
            >
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="2" d={getFeatureIcon(feature.icon)} />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{feature.description}</p>
              
              <ul className="space-y-2">
                {feature.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const getFeatureIcon = (iconName: string) => {
  const icons = {
    'dollar-sign': 'M12 1v6m0 6v6m11-7h-6m-6 0H1m15.5-6.5l-4.24 4.24M7.76 16.24l-4.24 4.24m0-11.31l4.24 4.24m8.48 4.24l4.24 4.24',
    'activity': 'M22 12h-4l-3 9L9 3l-3 9H2',
    'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14,2 L14,8 L20,8 M16,13 L8,13 M16,17 L8,17',
    'cpu': 'M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z'
  };
  return icons[iconName as keyof typeof icons] || icons.cpu;
}; 