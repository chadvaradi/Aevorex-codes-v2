import React from 'react';
import type { PlatformCapability } from '../../hooks/aihub/useAIHubData';

interface CapabilitiesSectionProps {
  capabilities: PlatformCapability[];
  getCapabilitiesByCategory: (category: PlatformCapability['category']) => PlatformCapability[];
}

export const CapabilitiesSection: React.FC<CapabilitiesSectionProps> = ({ 
  capabilities, 
  getCapabilitiesByCategory 
}) => {
  const getCapabilityIcon = (iconName: string) => {
    const icons = {
      'deployment': 'M2 2h20v20H2V2z M7 2v20 M17 2v20 M2 12h20 M2 7h5 M2 17h5 M17 17h5 M17 7h5',
      'api': 'M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1',
      'monitoring': 'M22 12h-4l-3 9L9 3l-3 9H2'
    };
    return icons[iconName as keyof typeof icons] || icons.monitoring;
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Production-Ready AI Infrastructure
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Deploy machine learning models at scale with enterprise-grade security, monitoring, and performance.
          </p>
        </div>

        {/* Capabilities Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {capabilities.map((capability) => (
            <div
              key={capability.id}
              className="group bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 hover:bg-white dark:hover:bg-gray-700 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-cyan-200 dark:hover:border-cyan-700"
            >
              {/* Capability Icon */}
              <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:bg-cyan-600 group-hover:text-white transition-colors duration-300">
                <svg className="w-8 h-8 text-cyan-600 dark:text-cyan-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="2" d={getCapabilityIcon(capability.icon)} />
                </svg>
              </div>

              {/* Capability Info */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{capability.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {capability.description}
                </p>
              </div>

              {/* Features List */}
              <div className="mb-6">
                <ul className="space-y-2">
                  {capability.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700 dark:text-gray-300 text-sm">
                      <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tech Stack */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Technology Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {capability.techStack.map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-600 group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/20 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors duration-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Capabilities Summary */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" d="M5 3l14 9-14 9V3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {getCapabilitiesByCategory('deployment').length} Deployment Solutions
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Container-based, auto-scaling deployment with zero downtime
            </p>
          </div>

          <div>
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {getCapabilitiesByCategory('management').length} API Management
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              RESTful APIs with authentication, versioning, and documentation
            </p>
          </div>

          <div>
            <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {getCapabilitiesByCategory('monitoring').length} Monitoring Tools
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Real-time metrics, model drift detection, and performance alerts
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}; 