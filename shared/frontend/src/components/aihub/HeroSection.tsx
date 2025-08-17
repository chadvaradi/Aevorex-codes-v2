import React, { useState } from 'react';
import type { APIMetrics } from '../../hooks/aihub/useAIHubData';

interface HeroSectionProps {
  apiMetrics: APIMetrics;
  isChatOpen: boolean;
  toggleChat: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  apiMetrics, 
  isChatOpen, 
  toggleChat 
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [chatInput, setChatInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search:', searchInput);
    // Mock search functionality
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Chat:', chatInput);
    setChatInput('');
    // Mock chat functionality
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-cyan-900 flex items-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700/25 bg-[length:60px_60px] opacity-40"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-cyan-300 to-blue-300 dark:from-cyan-900 dark:to-blue-900 rounded-full blur-3xl opacity-20 transform -translate-x-1/3 -translate-y-1/3"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            {/* Status Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 text-sm font-medium mb-6">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Production Ready • API v2.1 • 99.9% Uptime
            </div>

            {/* Main Headlines */}
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Enterprise AI Infrastructure for{' '}
              <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Production Applications
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Deploy, scale, and monitor machine learning models in production. 
              Built for software teams who need reliable AI infrastructure without vendor lock-in.
            </p>

            {/* AI Search Interface */}
            <div className="mb-8">
              <form onSubmit={handleSearchSubmit} className="flex items-center space-x-3 mb-4">
                <button
                  type="button"
                  onClick={toggleChat}
                  className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center hover:bg-cyan-200 dark:hover:bg-cyan-800/40 transition-colors"
                  title="Toggle AI Assistant"
                >
                  <svg className="w-5 h-5 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
                  </svg>
                </button>
                
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Ask AI anything or search models..."
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  </button>
                </div>
              </form>

              {/* AI Chat Interface */}
              {isChatOpen && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeWidth="2" d="M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 dark:text-gray-200 text-sm">
                        Hello! I'm your AI assistant. I can help you with:
                      </p>
                      <ul className="text-gray-600 dark:text-gray-400 text-sm mt-2 space-y-1">
                        <li>• Model recommendations and comparisons</li>
                        <li>• API documentation and examples</li>
                        <li>• Deployment strategies and best practices</li>
                      </ul>
                    </div>
                  </div>
                  
                  <form onSubmit={handleChatSubmit} className="flex space-x-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask me anything about AI models, APIs, or deployment..."
                      className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3.59l7.457 7.45-1.414 1.42L13 7.41V21h-2V7.41l-5.043 5.05-1.414-1.42L12 3.59z" />
                      </svg>
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-xl hover:bg-cyan-700 transition-colors flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                  <line x1="7" y1="2" x2="7" y2="22" />
                  <line x1="17" y1="2" x2="17" y2="22" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                </svg>
                Launch Playground
              </button>
              <button className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                </svg>
                View Documentation
              </button>
            </div>
          </div>

          {/* Right Column - API Dashboard */}
          <div className="lg:pl-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live API Status</h3>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">All Services Operational</span>
                </div>
              </div>

              {/* API Metrics */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{apiMetrics.responseTime}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{apiMetrics.uptime}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Uptime (30d)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{apiMetrics.requestsPerDay}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Requests/day</div>
                  </div>
                </div>

                {/* API Endpoints */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Active Endpoints</h4>
                  {[
                    { method: 'POST', path: '/api/v2/models/predict', status: 'active' },
                    { method: 'GET', path: '/api/v2/models/status', status: 'active' },
                    { method: 'POST', path: '/api/v2/fine-tune', status: 'active' }
                  ].map((endpoint, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded">
                          {endpoint.method}
                        </span>
                        <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{endpoint.path}</span>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 