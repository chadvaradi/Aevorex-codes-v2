import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useLLMStream } from '../hooks/stock/useLLMStream';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
  isStreaming?: boolean;
}

interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  ticker: string | null;
  chatOpen: boolean;
  sendMessage: (content: string) => void;
  openChat: (ticker: string, opts?: { inline?: boolean }) => void;
  closeChat: () => void;
  clearMessages: () => void;
  sendDeepAnalysis: (prompt?: string) => Promise<void>;
  selectedModelId: string | null;
  setSelectedModelId: (modelId: string | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [ticker, setTicker] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedModelId, setSelectedModelIdState] = useState<string | null>(null);

  // Initialise selected model from localStorage
  React.useEffect(() => {
    try {
      const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('chatModelId') : null;
      if (stored) setSelectedModelIdState(stored);
    } catch {}
  }, []);

  const setSelectedModelId = useCallback((modelId: string | null) => {
    setSelectedModelIdState(modelId);
    try {
      if (typeof localStorage !== 'undefined') {
        if (modelId) localStorage.setItem('chatModelId', modelId);
        else localStorage.removeItem('chatModelId');
      }
    } catch {}
  }, []);

  // Bootstrap an SSE token once per session (used by gateway SSE)
  React.useEffect(() => {
    const ensureSseToken = async () => {
      try {
        // Avoid in tests
        if (typeof window === 'undefined') return;
        const existing = localStorage.getItem('sse_token');
        if (existing) return;
        const res = await fetch('/api/v1/config/model', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
        const data = await res.json().catch(() => ({}));
        if (data && data.sse_token) {
          localStorage.setItem('sse_token', data.sse_token as string);
        }
      } catch {}
    };
    ensureSseToken();
  }, []);

  const {
    messages,
    isLoading,
    sendMessage: streamSendMessage,
    clearMessages: streamClearMessages,
    beginExternalStream,
    appendExternalStreamToken,
    endExternalStream,
    // seedAssistantMessage,
  } = useLLMStream(ticker, {
    onMessage: (message) => {
      // Handle individual message updates if needed
      console.log('Received message update:', message);
    },
    onError: (error) => {
      console.error('Stream error:', error);
    },
    onComplete: () => {
      console.log('Stream completed');
    },
  });

  const sendMessage = useCallback((content: string) => {
    streamSendMessage(content);
  }, [streamSendMessage]);

  const openChat = useCallback((newTicker: string, opts?: { inline?: boolean }) => {
    setTicker(newTicker);
    // Clear messages when switching tickers
    if (ticker !== newTicker) {
      streamClearMessages();
    }
    // Overlay only when not inline
    if (!opts?.inline) {
      setChatOpen(true);
    }
  }, [ticker, streamClearMessages]);

  const closeChat = useCallback(() => {
    setChatOpen(false);
  }, []);

  const clearMessages = useCallback(() => {
    streamClearMessages();
  }, [streamClearMessages]);

  const sendDeepAnalysis = useCallback(async (prompt: string = `Deep dive analysis for ${ticker}`) => {
    if (!ticker || isLoading) return;

    beginExternalStream();

    try {
      const response = await fetch(`/api/v1/stock/chat/${ticker}/deep`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({ prompt, model_id: selectedModelId || undefined }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (!dataStr) continue;
            if (dataStr === '[DONE]') break;
            try {
              const payload = JSON.parse(dataStr);
              if (payload.type === 'end') {
                // handled after loop
              } else if (payload.type === 'token' && payload.token) {
                appendExternalStreamToken(payload.token as string);
              }
            } catch {
              appendExternalStreamToken(dataStr);
            }
          }
        }
      }
      endExternalStream();
    } catch (err) {
      console.error('Deep analysis stream failed', err);
    } finally {
      // flags handled by endExternalStream
    }
  }, [ticker, isLoading, selectedModelId, beginExternalStream, appendExternalStreamToken, endExternalStream]);

  const value: ChatContextType = {
    messages,
    isLoading,
    ticker,
    chatOpen,
    sendMessage,
    openChat,
    closeChat,
    clearMessages,
    sendDeepAnalysis,
    selectedModelId,
    setSelectedModelId,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}; 