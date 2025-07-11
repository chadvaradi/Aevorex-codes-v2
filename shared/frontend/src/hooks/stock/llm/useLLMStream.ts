import { useState, useEffect, useCallback, useRef } from 'react';
import { Message } from '@/contexts/ChatContext';

interface UseLLMStreamOptions {
  onMessage?: (message: Message) => void;
  onError?: (error: string) => void;
  onComplete?: () => void;
}

export const useLLMStream = (
  ticker: string | null,
  options: UseLLMStreamOptions = {}
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const currentMessageRef = useRef<Message | null>(null);

  const { onMessage, onError, onComplete } = options;

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
    setIsLoading(false);
    currentMessageRef.current = null;
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!ticker || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Create initial assistant message for streaming
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
      };

      setMessages(prev => [...prev, assistantMessage]);
      currentMessageRef.current = assistantMessage;
      setIsStreaming(true);

      // Use fetch for POST streaming
      const response = await fetch(`/api/v1/stock/chat/${ticker}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({ message: content })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (!dataStr) continue;

              try {
                const data = JSON.parse(dataStr);

                if (data.type === 'end') {
                  // Stream completed
                  setIsStreaming(false);
                  setIsLoading(false);
                  
                  if (currentMessageRef.current) {
                    setMessages(prev => 
                      prev.map(msg => 
                        msg.id === currentMessageRef.current?.id
                          ? { ...msg, isStreaming: false }
                          : msg
                      )
                    );
                  }

                  cleanup();
                  onComplete?.();
                  return;
                }

                if (data.type === 'error') {
                  throw new Error(data.message || 'Stream error');
                }

                // Append token to current message
                if (currentMessageRef.current && data.token) {
                  const updatedMessage: Message = {
                    ...currentMessageRef.current,
                    content: currentMessageRef.current.content + data.token,
                  };
                  
                  currentMessageRef.current = updatedMessage;
                  
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === updatedMessage.id ? updatedMessage : msg
                    )
                  );

                  onMessage?.(updatedMessage);
                }
              } catch (parseError) {
                console.error('Error parsing SSE message:', parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      onError?.('Failed to send message');
      setIsLoading(false);
      cleanup();
    }
  }, [ticker, isLoading, cleanup, onMessage, onError, onComplete]);

  // Cleanup on unmount or ticker change
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Clear messages when ticker changes
  useEffect(() => {
    if (ticker) {
      setMessages([]);
      setError(null);
    }
  }, [ticker]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const retryLastMessage = useCallback(() => {
    const lastUserMessage = messages
      .filter(msg => msg.role === 'user')
      .pop();
    
    if (lastUserMessage) {
      sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    clearMessages,
    retryLastMessage,
  };
}; 