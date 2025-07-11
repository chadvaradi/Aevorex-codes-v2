import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLLMStream } from '../../../hooks/stock/useLLMStream';

// Mock EventSource
class MockEventSource {
  url: string;
  readyState: number = 0;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    this.readyState = 1; // OPEN
  }

  close() {
    this.readyState = 2; // CLOSED
  }

  // Helper methods for testing
  mockMessage(data: unknown) {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(data) } as MessageEvent);
    }
  }

  mockError() {
    if (this.onerror) {
      this.onerror(new Event('error'));
    }
  }

  mockOpen() {
    if (this.onopen) {
      this.onopen(new Event('open'));
    }
  }
}

// Mock global EventSource
global.EventSource = MockEventSource as any;

describe.skip('useLLMStream', () => {
  let mockEventSource: MockEventSource;
  const mockOptions = {
    onMessage: vi.fn(),
    onError: vi.fn(),
    onComplete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Intercept EventSource creation
    vi.spyOn(global, 'EventSource').mockImplementation((url: string | URL) => {
      mockEventSource = new MockEventSource(url.toString());
      return mockEventSource as any;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with empty messages and loading false', () => {
    const { result } = renderHook(() => useLLMStream('AAPL', mockOptions));

    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('clears messages when ticker changes', () => {
    const { result, rerender } = renderHook(
      ({ ticker }) => useLLMStream(ticker, mockOptions),
      { initialProps: { ticker: 'AAPL' } }
    );

    // Add a message
    act(() => {
      result.current.sendMessage('Test message');
    });

    expect(result.current.messages).toHaveLength(2); // User + empty assistant

    // Change ticker
    rerender({ ticker: 'MSFT' });

    expect(result.current.messages).toEqual([]);
  });

  it('sends message and creates user message', async () => {
    const { result } = renderHook(() => useLLMStream('AAPL', mockOptions));

    act(() => {
      result.current.sendMessage('What is the stock price?');
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toMatchObject({
      role: 'user',
      content: 'What is the stock price?',
    });
    expect(result.current.messages[1]).toMatchObject({
      role: 'assistant',
      content: '',
      isStreaming: true,
    });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isStreaming).toBe(true);
  });

  it('handles streaming tokens', async () => {
    const { result } = renderHook(() => useLLMStream('AAPL', mockOptions));

    act(() => {
      result.current.sendMessage('Test message');
    });

    // Mock streaming tokens
    act(() => {
      mockEventSource.mockMessage({ type: 'token', token: 'Hello' });
    });

    act(() => {
      mockEventSource.mockMessage({ type: 'token', token: ' world' });
    });

    expect(result.current.messages[1].content).toBe('Hello world');
    expect(mockOptions.onMessage).toHaveBeenCalledTimes(2);
  });

  it('handles stream completion', async () => {
    const { result } = renderHook(() => useLLMStream('AAPL', mockOptions));

    act(() => {
      result.current.sendMessage('Test message');
    });

    // Send some tokens
    act(() => {
      mockEventSource.mockMessage({ type: 'token', token: 'Complete response' });
    });

    // End stream
    act(() => {
      mockEventSource.mockMessage({ type: 'end' });
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.messages[1].isStreaming).toBe(false);
    expect(mockOptions.onComplete).toHaveBeenCalledTimes(1);
  });

  it('handles stream errors', async () => {
    const { result } = renderHook(() => useLLMStream('AAPL', mockOptions));

    act(() => {
      result.current.sendMessage('Test message');
    });

    // Mock error message
    act(() => {
      mockEventSource.mockMessage({ 
        type: 'error', 
        message: 'Connection failed' 
      });
    });

    expect(result.current.error).toBe('Connection failed');
    expect(mockOptions.onError).toHaveBeenCalledWith('Connection failed');
  });

  it('handles EventSource connection errors', async () => {
    const { result } = renderHook(() => useLLMStream('AAPL', mockOptions));

    act(() => {
      result.current.sendMessage('Test message');
    });

    // Mock connection error
    act(() => {
      mockEventSource.mockError();
    });

    expect(result.current.error).toBe('Connection error');
    expect(mockOptions.onError).toHaveBeenCalledWith('Connection error');
  });

  it('prevents sending message when already loading', () => {
    const { result } = renderHook(() => useLLMStream('AAPL', mockOptions));

    act(() => {
      result.current.sendMessage('First message');
    });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.sendMessage('Second message');
    });

    // Should still only have messages from first call
    expect(result.current.messages).toHaveLength(2);
  });

  it('clears messages when clearMessages is called', () => {
    const { result } = renderHook(() => useLLMStream('AAPL', mockOptions));

    act(() => {
      result.current.sendMessage('Test message');
    });

    expect(result.current.messages).toHaveLength(2);

    act(() => {
      result.current.clearMessages();
    });

    expect(result.current.messages).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  it('retries last user message', () => {
    const { result } = renderHook(() => useLLMStream('AAPL', mockOptions));

    act(() => {
      result.current.sendMessage('First message');
    });

    // Complete the stream
    act(() => {
      mockEventSource.mockMessage({ type: 'end' });
    });

    // Send another message
    act(() => {
      result.current.sendMessage('Second message');
    });

    // Complete the stream
    act(() => {
      mockEventSource.mockMessage({ type: 'end' });
    });

    // Retry should resend the last user message
    act(() => {
      result.current.retryLastMessage();
    });

    // Should have: 2 user messages + 3 assistant messages (2 completed + 1 new)
    expect(result.current.messages).toHaveLength(5);
    expect(result.current.messages[4].content).toBe('');
    expect(result.current.messages[4].isStreaming).toBe(true);
  });

  it('creates correct SSE URL', () => {
    const { result } = renderHook(() => useLLMStream('AAPL', mockOptions));

    act(() => {
      result.current.sendMessage('Test message');
    });

    expect(global.EventSource).toHaveBeenCalledWith('/api/v1/stock/chat/AAPL/stream');
  });

  it('does not send message when ticker is null', () => {
    const { result } = renderHook(() => useLLMStream(null, mockOptions));

    act(() => {
      result.current.sendMessage('Test message');
    });

    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });
}); 