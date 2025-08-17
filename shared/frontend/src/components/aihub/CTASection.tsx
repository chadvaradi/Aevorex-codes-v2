import React from 'react';
import { useNotification } from '../../hooks/ui/useNotification';

export const CTASection: React.FC = () => {
  const { showNotification } = useNotification();

  const handleDeveloperSignup = () => {
    showNotification('Developer account létrehozva! API kulcsot emailben küldtük.', 'success');
  };

  const handleEnterpriseContact = () => {
    showNotification('Enterprise kapcsolat iniciált! Solutions csapatunk jelentkezni fog.', 'info');
  };

  return (
    <section className="py-20 bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-white/10 to-transparent rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Start Building with Enterprise AI
          </h2>
          <p className="text-xl text-cyan-100 max-w-3xl mx-auto leading-relaxed">
            Join thousands of developers who trust our AI infrastructure for mission-critical applications
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Developer Plan */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Developer Platform</h3>
              <p className="text-cyan-100">
                Get started with our comprehensive AI infrastructure platform
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Production-ready API endpoints</span>
              </div>
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>3 pre-trained AI models</span>
              </div>
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Interactive playground access</span>
              </div>
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Complete documentation & SDKs</span>
              </div>
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Community support & tutorials</span>
              </div>
            </div>

            <button 
              onClick={handleDeveloperSignup}
              className="w-full py-4 px-6 bg-white text-cyan-600 font-bold rounded-xl hover:bg-gray-100 transition-colors transform hover:scale-105 duration-200"
            >
              Start Free Development
              <svg className="inline-block w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5-5 5m-6-5h11" />
              </svg>
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Enterprise Solutions</h3>
              <p className="text-cyan-100">
                Custom AI infrastructure for large-scale production deployments
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Custom model training & fine-tuning</span>
              </div>
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Dedicated infrastructure & SLA</span>
              </div>
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Advanced monitoring & analytics</span>
              </div>
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>24/7 dedicated support team</span>
              </div>
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Security compliance & audit trails</span>
              </div>
            </div>

            <button 
              onClick={handleEnterpriseContact}
              className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-colors transform hover:scale-105 duration-200 border border-white/20"
            >
              Contact Enterprise Sales
              <svg className="inline-block w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Developer Resources */}
        <div className="mt-16 text-center">
          <p className="text-cyan-100 mb-6">
            Explore our developer resources and get started quickly
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20">
              📚 API Documentation
            </button>
            <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20">
              🐍 Python SDK
            </button>
            <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20">
              ⚡ JavaScript SDK
            </button>
            <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20">
              🎮 Interactive Playground
            </button>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-white mb-1">99.94%</div>
            <div className="text-cyan-200 text-sm">API Uptime</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-1">147ms</div>
            <div className="text-cyan-200 text-sm">Avg Response</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-1">2.4M</div>
            <div className="text-cyan-200 text-sm">Daily Requests</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-1">15K+</div>
            <div className="text-cyan-200 text-sm">Developers</div>
          </div>
        </div>
      </div>
    </section>
  );
}; 