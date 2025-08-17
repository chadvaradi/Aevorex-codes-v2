import React, { useState } from 'react';
import type { AIModel, PlaygroundSession } from '../../hooks/aihub/useAIHubData';

interface PlaygroundSectionProps {
  models: AIModel[];
  playgroundSession: PlaygroundSession;
  activeModel: string;
  selectModel: (modelId: string) => void;
  runInference: (input: string, modelId: string) => Promise<void>;
}

export const PlaygroundSection: React.FC<PlaygroundSectionProps> = ({ 
  models, 
  playgroundSession, 
  activeModel, 
  selectModel, 
  runInference 
}) => {
  const [input, setInput] = useState(playgroundSession.input);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunInference = async () => {
    setIsRunning(true);
    await runInference(input, activeModel);
    setIsRunning(false);
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Interactive AI Playground
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Test models, experiment with APIs, and prototype solutions before implementing in production.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Model Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Available Models</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">{models.length} models loaded</div>
              </div>

              <div className="space-y-3">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => selectModel(model.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                      model.id === activeModel
                        ? 'bg-cyan-100 dark:bg-cyan-900/30 border-2 border-cyan-200 dark:border-cyan-700'
                        : 'bg-white dark:bg-gray-700 border-2 border-transparent hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                        model.id === activeModel 
                          ? 'bg-cyan-200 dark:bg-cyan-800' 
                          : 'bg-gray-200 dark:bg-gray-600'
                      }`}>
                        <svg className={`w-4 h-4 ${
                          model.id === activeModel 
                            ? 'text-cyan-600 dark:text-cyan-400' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeWidth="2" d="M12 2L2 7l10 5 10-5-10-5z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${
                          model.id === activeModel 
                            ? 'text-cyan-900 dark:text-cyan-100' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {model.id}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Ready</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Playground */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden">
              {/* Toolbar */}
              <div className="bg-white dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <select className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-sm">
                      <option>Text Generation</option>
                      <option>Image Analysis</option>
                      <option>Time Series Prediction</option>
                    </select>
                    <button className="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors text-sm flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                      </svg>
                      Load Example
                    </button>
                  </div>
                  <button 
                    onClick={handleRunInference}
                    disabled={isRunning}
                    className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    {isRunning ? 'Running...' : 'Run Inference'}
                  </button>
                </div>
              </div>

              {/* Workspace */}
              <div className="p-6 space-y-6">
                {/* Input Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">Input</h4>
                    <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">Text</span>
                  </div>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full h-32 p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Enter your prompt or data here..."
                  />
                </div>

                {/* Output Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">Output</h4>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Ready</span>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 h-48 overflow-auto">
                    <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">
                      {playgroundSession.output}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Request Inspector */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-6">Request Inspector</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Model</label>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{playgroundSession.modelName}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Latency</label>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{playgroundSession.requestDetails.latency}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Tokens</label>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{playgroundSession.requestDetails.tokens}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Cost</label>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{playgroundSession.requestDetails.cost}</div>
                </div>
              </div>

              {/* Code Example */}
              <div className="mt-6">
                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Code Example</h5>
                <div className="bg-gray-900 rounded-lg p-3 text-xs">
                  <div className="flex space-x-1 mb-2">
                    <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs">Python</button>
                    <button className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">JavaScript</button>
                    <button className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">cURL</button>
                  </div>
                  <pre className="text-green-400">
{`import aevorex

client = aevorex.Client(
  api_key="your_api_key"
)

response = client.models.predict(
  model="${activeModel}",
  prompt="Your prompt here",
  max_tokens=100
)`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 