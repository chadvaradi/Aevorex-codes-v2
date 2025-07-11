import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInput } from '../ChatInput';

describe.skip('ChatInput', () => {
  const mockOnSendMessage = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    mockOnSendMessage.mockClear();
  });

  it('renders with placeholder text', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />);
    
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(
      <ChatInput 
        onSendMessage={mockOnSendMessage} 
        placeholder="Ask about AAPL..." 
      />
    );
    
    expect(screen.getByPlaceholderText('Ask about AAPL...')).toBeInTheDocument();
  });

  it('calls onSendMessage when form is submitted', async () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    await user.type(input, 'Test message');
    await user.click(sendButton);
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
  });

  it('calls onSendMessage when Enter key is pressed', async () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    
    await user.type(input, 'Test message');
    await user.keyboard('{Enter}');
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
  });

  it('does not submit when Shift+Enter is pressed', async () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    
    await user.type(input, 'Test message');
    await user.keyboard('{Shift>}{Enter}{/Shift}');
    
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('clears input after sending message', async () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    
    await user.type(input, 'Test message');
    await user.keyboard('{Enter}');
    
    expect(input).toHaveValue('');
  });

  it('does not send empty messages', async () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    
    await user.type(input, '   '); // Only whitespace
    await user.keyboard('{Enter}');
    
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('disables input when disabled prop is true', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} disabled={true} />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  it('auto-resizes textarea based on content', async () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />);
    
    const textarea = screen.getByPlaceholderText('Type a message...');
    
    // Type multiple lines
    await user.type(textarea, 'Line 1\nLine 2\nLine 3');
    
    // Check that height has increased (auto-resize)
    await waitFor(() => {
      expect(textarea.style.height).not.toBe('auto');
    });
  });

  it('shows character count when typing', async () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    
    await user.type(input, 'Hello');
    
    expect(screen.getByText(/5 • Press Enter to send/)).toBeInTheDocument();
  });

  it('shows keyboard shortcuts hint', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />);
    
    expect(screen.getByText(/Cmd\/Ctrl \+ \/ to open chat/)).toBeInTheDocument();
  });
}); 