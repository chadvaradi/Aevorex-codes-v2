import { useState, useEffect, useCallback, useRef } from 'react';
import { Message } from '@/contexts/ChatContext';

// --- Lightweight frontend preprocess: type classification & relevance gating ---
type QueryType = 'summary' | 'indicator' | 'news' | 'hybrid';

const KEYWORDS = [
  'stock','price','chart','ohlcv','indicator','sma','ema','rsi','macd','bbands','earnings','revenue','fundamental','valuation','pe','beta','esg','news','headline','forecast','guidance','technical','support','resistance'
];

function classifyQueryType(text: string): QueryType {
  const t = text.toLowerCase();
  if (/(rsi|macd|sma|ema|indicator|technical)/.test(t)) return 'indicator';
  if (/(news|headline|article|press|rumor)/.test(t)) return 'news';
  if (/(overview|summary|explain|what|why)/.test(t)) return 'summary';
  return 'hybrid';
}

function relevanceScore(text: string): number {
  const tokens = Array.from(new Set(text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)));
  const hits = tokens.filter((w) => KEYWORDS.includes(w)).length;
  // Simple bounded score
  const score = Math.min(1, hits / 5);
  return score;
}

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

  // Send a user message using non-streaming endpoint, then append assistant reply
  const sendMessage = useCallback(async (content: string) => {
    if (!ticker || isLoading) return;

    // Basic frontend preprocess per Rule: min length & relevance gating
    const trimmed = content.trim();
    const minLen = Number((import.meta as any).env?.VITE_CHAT_MIN_LEN ?? 5);
    if (trimmed.length < minLen) {
      setError('Prompt too short');
      onError?.('Prompt too short');
      return;
    }
    const threshold = Number((import.meta as any).env?.VITE_CHAT_RELEVANCE_MIN ?? 0.6);
    const score = relevanceScore(trimmed);
    if (score < threshold) {
      setError('Prompt not relevant enough');
      onError?.('Prompt not relevant enough');
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Read selected model from localStorage (set by ChatContext)
      let selectedModelId: string | null = null;
      try {
        selectedModelId = typeof localStorage !== 'undefined' ? localStorage.getItem('chatModelId') : null;
      } catch {}

      const payload = {
        message: trimmed,
        query_type: classifyQueryType(trimmed),
        // Backend végső összeállítás előtt itt csak meta jelzés; a teljes
        // data-blokkot (ohlcv, indicators, fundamentals, news) a szerver
        // állítja össze. Frontend NEM ad mock adatot.
        prompt_template_id: (() => {
          const t = classifyQueryType(trimmed);
          if (t === 'indicator') return 'fh_indicator_v1';
          if (t === 'news') return 'fh_news_v1';
          if (t === 'summary') return 'fh_summary_v1';
          return 'fh_hybrid_v1';
        })(),
        ticker,
        session_id: (typeof localStorage !== 'undefined' ? localStorage.getItem('chatSessionId') : null) || undefined,
        model_id: selectedModelId || undefined,
      } as Record<string, any>;

      const resp = await fetch(`/api/v1/stock/chat/${ticker}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        if (resp.status === 429) {
          setError('Rate limit exceeded. Please wait and try again.');
          onError?.('Rate limited');
          setIsLoading(false);
          return;
        }
        if (resp.status === 403 || resp.status === 402) {
          setError('Your plan does not allow this action.');
          onError?.('Plan restriction');
          setIsLoading(false);
          return;
        }
        throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
      }
      const data = await resp.json();
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data?.content ?? '',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (e) {
      console.error('Error sending message:', e);
      setError('Failed to send message');
      onError?.('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [ticker, isLoading, onError]);

  // Start initial AI summary stream on ticker set using SSE GET endpoint
  useEffect(() => {
    // Cleanup previous stream
    cleanup();
    if (!ticker) return;

    // Create assistant placeholder for streaming summary
    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };
    setMessages([]); // fresh chat per ticker
    setMessages((prev) => [...prev, assistantMessage]);
    currentMessageRef.current = assistantMessage;
    setIsStreaming(true);
    setIsLoading(true);
    setError(null);

    // Ensure EventSource targets the backend origin (fetch() is patched globally, but EventSource is not)
    const apiBaseFromEnv = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
    const resolvedApiBase = (() => {
      if (apiBaseFromEnv && /^https?:\/\//i.test(apiBaseFromEnv)) return apiBaseFromEnv.replace(/\/$/, '');
      if (typeof window !== 'undefined') {
        const { protocol, port } = window.location;
        if (port === '8083') return `${protocol}//localhost:8084`;
        return window.location.origin;
      }
      return '';
    })();
    let token: string | null = null;
    try {
      token = typeof localStorage !== 'undefined' ? localStorage.getItem('sse_token') : null;
    } catch {}
    const sseUrl = token
      ? `${resolvedApiBase}/api/v1/stock/chat/${ticker}/stream?auth=${encodeURIComponent(token)}`
      : `${resolvedApiBase}/api/v1/stock/chat/${ticker}/stream`;
    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    es.onmessage = (evt) => {
      const dataStr = (evt?.data ?? '').toString().trim();
      if (!dataStr) return;
      try {
        const data = JSON.parse(dataStr);
        if (data.type === 'end') {
          setIsStreaming(false);
          setIsLoading(false);
          if (currentMessageRef.current) {
            const id = currentMessageRef.current.id;
            setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isStreaming: false } : m)));
          }
          es.close();
          eventSourceRef.current = null;
          onComplete?.();
          return;
        }
        if (data.type === 'error') {
          throw new Error(data.message || 'Stream error');
        }
        if (currentMessageRef.current && data.token) {
          const updated: Message = {
            ...currentMessageRef.current,
            content: currentMessageRef.current.content + data.token,
          };
          currentMessageRef.current = updated;
          setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
          onMessage?.(updated);
        }
      } catch {
        // Fallback: treat as raw text token
        if (currentMessageRef.current) {
          const updated: Message = {
            ...currentMessageRef.current,
            content: currentMessageRef.current.content + dataStr,
          };
          currentMessageRef.current = updated;
          setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
          onMessage?.(updated);
        }
      }
    };

    es.onerror = () => {
      setError('Streaming unavailable');
      setIsStreaming(false);
      setIsLoading(false);
      es.close();
      eventSourceRef.current = null;
      onError?.('Streaming unavailable');
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [ticker]);

  // Cleanup on unmount
  useEffect(() => cleanup, [cleanup]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  // Optional: seed an assistant message (used by ChatContext for auto-first AI summary)
  const seedAssistantMessage = useCallback((content: string) => {
    if (!content) return;
    const msg: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: Date.now(),
      isStreaming: false,
    };
    setMessages(prev => [...prev, msg]);
  }, []);

  // External streaming helpers (for deep analysis)
  const beginExternalStream = useCallback(() => {
    const assistant: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };
    setMessages(prev => [...prev, assistant]);
    currentMessageRef.current = assistant;
    setIsStreaming(true);
    setIsLoading(true);
    return assistant.id;
  }, []);

  const appendExternalStreamToken = useCallback((token: string) => {
    if (!currentMessageRef.current || !token) return;
    const updated: Message = {
      ...currentMessageRef.current,
      content: currentMessageRef.current.content + token,
    };
    currentMessageRef.current = updated;
    setMessages(prev => prev.map(m => (m.id === updated.id ? updated : m)));
    onMessage?.(updated);
  }, [onMessage]);

  const endExternalStream = useCallback(() => {
    setIsStreaming(false);
    setIsLoading(false);
    if (currentMessageRef.current) {
      const id = currentMessageRef.current.id;
      setMessages(prev => prev.map(m => (m.id === id ? { ...m, isStreaming: false } : m)));
    }
    currentMessageRef.current = null;
    onComplete?.();
  }, [onComplete]);

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
    seedAssistantMessage,
    beginExternalStream,
    appendExternalStreamToken,
    endExternalStream,
    retryLastMessage,
  };
}; 