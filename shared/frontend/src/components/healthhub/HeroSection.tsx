import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-900 flex items-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700/25 bg-[length:60px_60px] opacity-40"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-red-300 to-pink-300 dark:from-red-900 dark:to-pink-900 rounded-full blur-3xl opacity-20 transform -translate-x-1/3 -translate-y-1/3"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-sm font-medium mb-6">
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
            Prototype - Research Platform
          </div>

          {/* Main Headlines */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Transform Healthcare Data Into{' '}
            <span className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              Actionable Insights
            </span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-4xl mx-auto">
            Enterprise-grade health analytics platform for hospitals, insurers, and healthcare organizations. 
            Improve patient outcomes with AI-driven population health intelligence.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button className="px-8 py-4 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center">
              <span>View Analytics Demo</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7,7 17,7 17,17" />
              </svg>
            </button>
            <button className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Schedule Enterprise Demo
            </button>
          </div>

          {/* HIPAA Compliance Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg mb-8">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">HIPAA Compliant</span>
          </div>

          {/* Medical Disclaimer */}
          <div className="max-w-3xl mx-auto bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="text-left">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium mb-1">
                  <strong>Research Prototype:</strong>
                </p>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  This platform is for demonstration purposes. Not intended for medical diagnosis or treatment decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 