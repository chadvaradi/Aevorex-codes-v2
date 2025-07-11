import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useLLMStream } from '../hooks/stock/useLLMStream';
import { v4 as uuidv4 } from 'uuid';

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
  openChat: (ticker: string) => void;
  closeChat: () => void;
  clearMessages: () => void;
  sendDeepAnalysis: (prompt?: string) => Promise<void>;
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

  const {
    messages,
    isLoading,
    sendMessage: streamSendMessage,
    clearMessages: streamClearMessages,
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

  const openChat = useCallback((newTicker: string) => {
    setTicker(newTicker);
    setChatOpen(true);
    
    // Clear messages when switching tickers
    if (ticker !== newTicker) {
      streamClearMessages();
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

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    };
    // setMessages((prev) => [...prev, userMessage]); // This line was removed from the original file

    // setIsLoading(true); // This line was removed from the original file
    // setError(null); // This line was removed from the original file

    const assistantId = uuidv4();
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };
    // setMessages((prev) => [...prev, assistantMessage]); // This line was removed from the original file
    // setIsStreaming(true); // This line was removed from the original file

    try {
      const response = await fetch(`/api/v1/stock/chat/${ticker}/deep`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let content = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            content += data;
            // setMessages((prev) => prev.map((msg) => msg.id === assistantId ? { ...msg, content } : msg)); // This line was removed from the original file
          }
        }
      }
      // setMessages((prev) => prev.map((msg) => msg.id === assistantId ? { ...msg, isStreaming: false } : msg)); // This line was removed from the original file
    } catch (err) {
      // setError(err.message); // This line was removed from the original file
    } finally {
      // setIsLoading(false); // This line was removed from the original file
      // setIsStreaming(false); // This line was removed from the original file
    }
  }, [ticker, isLoading]);

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
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}; 