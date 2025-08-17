import React from 'react';
import type { AIModel } from '../../hooks/aihub/useAIHubData';

interface ModelsSectionProps {
  models: AIModel[];
  getModelsByCategory: (category: AIModel['category']) => AIModel[];
  selectModel: (modelId: string) => void;
}

export const ModelsSection: React.FC<ModelsSectionProps> = ({ 
  models, 
  getModelsByCategory, 
  selectModel 
}) => {
  const getModelIcon = (category: AIModel['category']) => {
    const icons = {
      'nlp': 'M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z',
      'vision': 'M3 3h18v18H3z M9 9h1v1H9z M21 15l-5-5L5 21',
      'forecasting': 'M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z',
      'custom': 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5'
    };
    return icons[category];
  };

  const getStatusColor = (status: AIModel['status']) => {
    switch (status) {
      case 'production': return 'text-green-500 bg-green-100 dark:bg-green-900/30';
      case 'beta': return 'text-orange-500 bg-orange-100 dark:bg-orange-900/30';
      case 'experimental': return 'text-gray-500 bg-gray-100 dark:bg-gray-900/30';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getStatusText = (status: AIModel['status']) => {
    switch (status) {
      case 'production': return 'Production';
      case 'beta': return 'Beta';
      case 'experimental': return 'Experimental';
      default: return 'Unknown';
    }
  };

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Pre-trained Models & Custom Training
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Production-ready models for common use cases, plus infrastructure for training custom models.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {models.map((model) => (
            <div
              key={model.id}
              className="group bg-white dark:bg-gray-900 rounded-2xl p-8 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-200 dark:border-gray-700 cursor-pointer"
              onClick={() => selectModel(model.id)}
            >
              {/* Model Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" d={getModelIcon(model.category)} />
                  </svg>
                </div>
                
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(model.status)}`}>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-current rounded-full mr-2"></div>
                    {getStatusText(model.status)}
                  </div>
                </span>
              </div>

              {/* Model Info */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{model.name}</h3>
                <div className="text-sm text-cyan-600 dark:text-cyan-400 font-medium mb-3">{model.type}</div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                  {model.description}
                </p>
              </div>

              {/* Model Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{model.accuracy}%</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{model.latency}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Latency</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{model.additionalMetric.value}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{model.additionalMetric.label}</div>
                </div>
              </div>

              {/* Model Actions */}
              <div className="flex space-x-3">
                <button className="flex-1 py-2 px-4 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors">
                  Try API
                </button>
                <button className="flex-1 py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  View Docs
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Models by Category Summary */}
        <div className="mt-16 grid md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">
              {getModelsByCategory('nlp').length}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">NLP Models</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">
              {getModelsByCategory('vision').length}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">Vision Models</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">
              {getModelsByCategory('forecasting').length}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">Forecasting</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">
              {models.filter(m => m.status === 'production').length}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">Production Ready</div>
          </div>
        </div>
      </div>
    </section>
  );
}; 