import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AutoScrollIndicator } from '../AutoScrollIndicator';

// Mock querySelector to return a mock container
const mockContainer = {
  scrollTop: 0,
  scrollHeight: 1000,
  clientHeight: 400,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  scrollTo: vi.fn(),
};

describe.skip('AutoScrollIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock document.querySelector to return our mock container
    vi.spyOn(document, 'querySelector').mockReturnValue(mockContainer as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    render(<AutoScrollIndicator />);
    // Component should render but indicator should be hidden initially
  });

  it('shows indicator when not at bottom', () => {
    render(<AutoScrollIndicator />);
    
    // Simulate scroll event - not at bottom
    mockContainer.scrollTop = 100; // Not at bottom
    
    // Trigger scroll event
    const scrollHandler = mockContainer.addEventListener.mock.calls
      .find(call => call[0] === 'scroll')?.[1];
    
    if (scrollHandler) {
      scrollHandler();
    }

    // Should show the indicator
    expect(screen.queryByRole('button')).toBeInTheDocument();
  });

  it('hides indicator when at bottom', () => {
    render(<AutoScrollIndicator />);
    
    // Simulate scroll event - at bottom
    mockContainer.scrollTop = 550; // At bottom (scrollHeight - clientHeight - threshold)
    
    // Trigger scroll event
    const scrollHandler = mockContainer.addEventListener.mock.calls
      .find(call => call[0] === 'scroll')?.[1];
    
    if (scrollHandler) {
      scrollHandler();
    }

    // Should hide the indicator
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('scrolls to bottom when clicked', () => {
    render(<AutoScrollIndicator />);
    
    // Make indicator visible
    mockContainer.scrollTop = 100;
    const scrollHandler = mockContainer.addEventListener.mock.calls
      .find(call => call[0] === 'scroll')?.[1];
    
    if (scrollHandler) {
      scrollHandler();
    }

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockContainer.scrollTo).toHaveBeenCalledWith({
      top: mockContainer.scrollHeight,
      behavior: 'smooth',
    });
  });

  it('adds and removes scroll event listener', () => {
    const { unmount } = render(<AutoScrollIndicator />);

    // Should add scroll listener
    expect(mockContainer.addEventListener).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    );

    unmount();

    // Should remove scroll listener
    expect(mockContainer.removeEventListener).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    );
  });

  it('handles missing container gracefully', () => {
    // Mock querySelector to return null
    vi.spyOn(document, 'querySelector').mockReturnValue(null);

    expect(() => {
      render(<AutoScrollIndicator />);
    }).not.toThrow();
  });

  it('displays correct icon and text', () => {
    render(<AutoScrollIndicator />);
    
    // Make indicator visible
    mockContainer.scrollTop = 100;
    const scrollHandler = mockContainer.addEventListener.mock.calls
      .find(call => call[0] === 'scroll')?.[1];
    
    if (scrollHandler) {
      scrollHandler();
    }

    expect(screen.getByText('Scroll to bottom')).toBeInTheDocument();
    // Check for ChevronDownIcon (via SVG)
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('uses correct CSS classes for styling', () => {
    render(<AutoScrollIndicator />);
    
    // Make indicator visible
    mockContainer.scrollTop = 100;
    const scrollHandler = mockContainer.addEventListener.mock.calls
      .find(call => call[0] === 'scroll')?.[1];
    
    if (scrollHandler) {
      scrollHandler();
    }

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('text-white');
    expect(button).toHaveClass('rounded-full');
  });
}); 