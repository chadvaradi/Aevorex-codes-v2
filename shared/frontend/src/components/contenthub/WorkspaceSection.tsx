import React from 'react';
import type { WorkspaceProject } from '../../hooks/contenthub/useContentHubData';

interface WorkspaceSectionProps {
  projects: WorkspaceProject[];
  activeProject: string;
  setProjectActive: (projectId: string) => void;
}

export const WorkspaceSection: React.FC<WorkspaceSectionProps> = ({ 
  projects, 
  setProjectActive 
}) => {
  const getProjectIcon = (type: WorkspaceProject['type']) => {
    const icons = {
      social: 'M12 19l7-7 3 3-7 7-3-3z M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z',
      newsletter: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22,6 L12,13 L2,6',
      visual: 'M3 3h18v18H3z M9 9h1v1H9z M21 15l-5-5L5 21',
      video: 'M23 7l-7 5 7 5V7z M1 5h15v14H1z',
      analytics: 'M22 12h-4l-3 9L9 3l-3 9H2',
      prompt: 'M9 12l2 2 4-4'
    };
    return icons[type] || icons.social;
  };

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Kreatív Munkaterület
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Projektjeit egy helyen kezelheti, és az AI-támogatott szerkesztőben dolgozhat
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Project Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Projektek</h3>
                <button className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center hover:bg-purple-200 dark:hover:bg-purple-800/40 transition-colors">
                  <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => setProjectActive(project.id)}
                    className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                      project.isActive
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-700'
                        : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                        project.isActive 
                          ? 'bg-purple-100 dark:bg-purple-900/30' 
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        <svg className={`w-4 h-4 ${
                          project.isActive 
                            ? 'text-purple-600 dark:text-purple-400' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeWidth="2" d={getProjectIcon(project.type)} />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${
                          project.isActive 
                            ? 'text-purple-900 dark:text-purple-100' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {project.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {project.status}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Editor */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
              {/* Editor Toolbar */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-3">
                    <button className="flex items-center px-3 py-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                      <svg className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Generate</span>
                    </button>
                    
                    <button className="flex items-center px-3 py-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                      <svg className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">SEO Check</span>
                    </button>
                    
                    <button className="flex items-center px-3 py-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                      <svg className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Template</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">1,247 szó</span>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      Publish
                    </button>
                  </div>
                </div>
              </div>

              {/* Editor Area */}
              <div className="p-8 min-h-96 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Kezdj egy új tartalmat
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Válassz egy template-et, vagy kezdj írni és hagyd, hogy az AI segítsen
                  </p>
                  <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors">
                    AI Generálás Indítása
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 