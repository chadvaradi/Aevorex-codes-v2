import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChatInput } from './ChatInput';
import { useModelList } from '@/hooks/ai/useModelList';
import { UserMessage } from './UserMessage';
import { StreamingMessage } from './StreamingMessage';
import { AutoScrollIndicator } from './AutoScrollIndicator';
import { ChatErrorBoundary } from './ChatErrorBoundary';
import { useChatContext } from '../../contexts/ChatContext';

interface ChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatOverlay: React.FC<ChatOverlayProps> = ({ isOpen, onClose }) => {
  const { messages, sendMessage, isLoading, ticker, sendDeepAnalysis, selectedModelId, setSelectedModelId } = useChatContext();
  const { models, loading: modelsLoading, error: modelsError } = useModelList();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle backdrop click to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const overlayContent = (
    <ChatErrorBoundary>
      <div
        ref={overlayRef}
        onClick={handleBackdropClick}
        className="fixed inset-0 z-[90] flex flex-col bg-white dark:bg-neutral-900 chat-safe-area"
      >
        {/* Messages - flex-1 with centered content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 pt-8 pb-32">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) =>
              message.role === 'user' ? (
                <UserMessage key={message.id} message={message} />
              ) : (
                <StreamingMessage key={message.id} message={message} />
              )
            )}

            {isLoading && (
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <div className="typing-cursor" />
                <span className="text-sm">AI is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Auto-scroll indicator */}
        <AutoScrollIndicator />

        {/* Input Panel - sticky bottom, centered, floating glass effect */}
        <div className="sticky bottom-4 w-full px-4 sm:px-6 md:px-8 space-y-3">
          {/* Model selector */}
          <div className="w-full sm:w-10/12 md:w-8/12 lg:w-2/3 max-w-2xl mx-auto">
            <div className="flex items-center justify-between gap-3 text-xs text-neutral-600 dark:text-neutral-300">
              <label htmlFor="model-select" className="whitespace-nowrap">Model</label>
              <select
                id="model-select"
                className="flex-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                disabled={modelsLoading || !!modelsError || (models?.length ?? 0) === 0}
                value={selectedModelId ?? ''}
                onChange={(e) => setSelectedModelId(e.target.value || null)}
              >
                <option value="">Auto</option>
                {models.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.id} · {m.strength} · ${'{'}m.price_in{'}'}/{'{'}m.price_out{'}'}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Deep-Dive CTA */}
          {ticker && (
            <button
              onClick={() => sendDeepAnalysis()}
              disabled={isLoading}
              className="w-full sm:w-10/12 md:w-8/12 lg:w-2/3 max-w-2xl mx-auto py-2 px-4 text-sm font-medium rounded-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Deep-Dive AI Analysis
            </button>
          )}

          <div className="w-full sm:w-10/12 md:w-8/12 lg:w-2/3 max-w-2xl mx-auto">
            <div className="bg-white/80 dark:bg-neutral-800/60 backdrop-blur-xl rounded-full shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <ChatInput
                onSendMessage={sendMessage}
                disabled={isLoading}
                placeholder={`Ask about ${ticker}…`}
              />
            </div>
          </div>
        </div>
      </div>
    </ChatErrorBoundary>
  );

  return createPortal(overlayContent, document.body);
};

// Add keyboard shortcut to open chat (Cmd/Ctrl + /)
export const useChatKeyboardShortcut = () => {
  const { openChat } = useChatContext();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        openChat('AAPL');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openChat]);
}; 