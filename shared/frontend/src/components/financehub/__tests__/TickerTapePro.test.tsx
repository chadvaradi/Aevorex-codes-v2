import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TickerTapePro from '../TickerTapePro.view';
import { useTickerTapeData } from '../../../hooks/stock/useTickerTapeData';

// Mock the hook
vi.mock('../../../hooks/stock/useTickerTapeData');

const mockUseTickerTapeData = vi.mocked(useTickerTapeData);

const mockTickerData = [
  {
    symbol: 'AAPL',
    price: 150.25,
    change: 2.15,
    change_percent: 1.45,
    changeColor: 'positive' as const,
    changeBadgeClass: 'bg-success/10 text-success-600',
  },
  {
    symbol: 'MSFT',
    price: 280.50,
    change: -1.25,
    change_percent: -0.44,
    changeColor: 'negative' as const,
    changeBadgeClass: 'bg-danger/10 text-danger-600',
  },
  {
    symbol: 'GOOGL',
    price: 2750.00,
    change: 0.00,
    change_percent: 0.00,
    changeColor: 'neutral' as const,
    changeBadgeClass: 'bg-neutral/10 text-neutral-500',
  },
];

describe('TickerTapePro', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('displays loading state when data is loading', () => {
      mockUseTickerTapeData.mockReturnValue({
        tickers: [],
        loading: true,
        error: null,
        metadata: undefined,
        refresh: vi.fn(),
        totalSymbols: 0,
        cacheHit: false,
        dataSource: 'unknown',
      });

      render(<TickerTapePro />);
      
      expect(screen.getByText('Loading market data...')).toBeInTheDocument();
      expect(screen.getByText('Loading market data...')).toHaveClass('animate-pulse');
    });
  });

  describe('Error State', () => {
    it('displays error state when there is an error', () => {
      mockUseTickerTapeData.mockReturnValue({
        tickers: [],
        loading: false,
        error: 'Network error',
        metadata: undefined,
        refresh: vi.fn(),
        totalSymbols: 0,
        cacheHit: false,
        dataSource: 'unknown',
      });

      render(<TickerTapePro />);
      
      expect(screen.getByText('Failed to load ticker data')).toBeInTheDocument();
      expect(screen.getByText('Failed to load ticker data')).toHaveClass('text-danger-600');
    });
  });

  describe('Data Display', () => {
    beforeEach(() => {
      mockUseTickerTapeData.mockReturnValue({
        tickers: mockTickerData,
        loading: false,
        error: null,
        metadata: {
          total_symbols: 3,
          requested_limit: 29,
          data_source: 'real_api',
          last_updated: '2025-01-01T00:00:00Z',
        },
        refresh: vi.fn(),
        totalSymbols: 3,
        cacheHit: false,
        dataSource: 'real_api',
      });
    });

    it('renders ticker symbols correctly', () => {
      render(<TickerTapePro />);
      
      expect(screen.getAllByText('AAPL').length).toBeGreaterThan(0);
      expect(screen.getAllByText('MSFT').length).toBeGreaterThan(0);
      expect(screen.getAllByText('GOOGL').length).toBeGreaterThan(0);
    });

    it('formats prices correctly', () => {
      render(<TickerTapePro />);
      
      expect(screen.getAllByText('$150.25').length).toBeGreaterThan(0);
      expect(screen.getAllByText('$280.50').length).toBeGreaterThan(0);
      expect(screen.getAllByText('$2,750.00').length).toBeGreaterThan(0);
    });

    it('displays change percentages with correct formatting', () => {
      render(<TickerTapePro />);
      
      expect(screen.getAllByText('+1.45%').length).toBeGreaterThan(0);
      expect(screen.getAllByText('-0.44%').length).toBeGreaterThan(0);
      expect(screen.getAllByText('+0.00%').length).toBeGreaterThan(0);
    });
  });

  describe('Color Tokens', () => {
    beforeEach(() => {
      mockUseTickerTapeData.mockReturnValue({
        tickers: mockTickerData,
        loading: false,
        error: null,
        metadata: {
          total_symbols: 3,
          requested_limit: 29,
          data_source: 'real_api',
          last_updated: '2025-01-01T00:00:00Z',
        },
        refresh: vi.fn(),
        totalSymbols: 3,
        cacheHit: false,
        dataSource: 'real_api',
      });
    });

    it('applies correct color classes for positive change', () => {
      render(<TickerTapePro />);
      
      const positiveChange = screen.getAllByText('+1.45%')[0];
      expect(positiveChange).toHaveClass('bg-success/10', 'text-success-600');
    });

    it('applies correct color classes for negative change', () => {
      render(<TickerTapePro />);
      
      const negativeChange = screen.getAllByText('-0.44%')[0];
      expect(negativeChange).toHaveClass('bg-danger/10', 'text-danger-600');
    });

    it('applies correct color classes for neutral change', () => {
      render(<TickerTapePro />);
      
      const neutralChange = screen.getAllByText('+0.00%')[0];
      expect(neutralChange).toHaveClass('bg-neutral/10', 'text-neutral-500');
    });
  });

  describe('Fixed-Width Badge', () => {
    beforeEach(() => {
      mockUseTickerTapeData.mockReturnValue({
        tickers: mockTickerData,
        loading: false,
        error: null,
        metadata: {
          total_symbols: 3,
          requested_limit: 29,
          data_source: 'real_api',
          last_updated: '2025-01-01T00:00:00Z',
        },
        refresh: vi.fn(),
        totalSymbols: 3,
        cacheHit: false,
        dataSource: 'real_api',
      });
    });

    it('applies minimum width constraint to change percentage badges', () => {
      render(<TickerTapePro />);
      
      const badges = screen.getAllByText(/[+-]?\d+\.\d+%/).filter(el => el.className.includes('min-w'));
      expect(badges.length).toBeGreaterThan(0);
      badges.forEach(badge => {
        expect(badge).toHaveClass('min-w-[48px]');
        expect(badge).toHaveClass('inline-flex', 'items-center', 'justify-center');
      });
    });
  });

  describe('Hover Pause Animation', () => {
    beforeEach(() => {
      mockUseTickerTapeData.mockReturnValue({
        tickers: mockTickerData,
        loading: false,
        error: null,
        metadata: {
          total_symbols: 3,
          requested_limit: 29,
          data_source: 'real_api',
          last_updated: '2025-01-01T00:00:00Z',
        },
        refresh: vi.fn(),
        totalSymbols: 3,
        cacheHit: false,
        dataSource: 'real_api',
      });
    });

    it('applies marquee animation by default', () => {
      render(<TickerTapePro />);
      
      const marqueeContainer = screen.getByRole('list');
      expect(marqueeContainer).toHaveClass('animate-marquee');
      expect(marqueeContainer).not.toHaveClass('animate-marquee-pause');
    });

    it('pauses animation on hover', async () => {
      const user = userEvent.setup();
      render(<TickerTapePro />);
      
      const tickerContainer = screen.getByRole('list').parentElement?.parentElement;
      expect(tickerContainer).toBeInTheDocument();
      
      if (tickerContainer) {
        await user.hover(tickerContainer);
        
        await waitFor(() => {
          const marqueeContainer = screen.getByRole('list');
          expect(marqueeContainer).toHaveClass('animate-marquee-pause');
          expect(marqueeContainer).not.toHaveClass('animate-marquee');
        });
      }
    });

    it('resumes animation when hover ends', async () => {
      const user = userEvent.setup();
      render(<TickerTapePro />);
      
      const tickerContainer = screen.getByRole('list').parentElement?.parentElement;
      expect(tickerContainer).toBeInTheDocument();
      
      if (tickerContainer) {
        // Hover first
        await user.hover(tickerContainer);
        
        await waitFor(() => {
          const marqueeContainer = screen.getByRole('list');
          expect(marqueeContainer).toHaveClass('animate-marquee-pause');
        });
        
        // Then unhover
        await user.unhover(tickerContainer);
        
        await waitFor(() => {
          const marqueeContainer = screen.getByRole('list');
          expect(marqueeContainer).toHaveClass('animate-marquee');
          expect(marqueeContainer).not.toHaveClass('animate-marquee-pause');
        });
      }
    });
  });

  describe('ARIA Accessibility', () => {
    beforeEach(() => {
      mockUseTickerTapeData.mockReturnValue({
        tickers: mockTickerData,
        loading: false,
        error: null,
        metadata: {
          total_symbols: 3,
          requested_limit: 29,
          data_source: 'real_api',
          last_updated: '2025-01-01T00:00:00Z',
        },
        refresh: vi.fn(),
        totalSymbols: 3,
        cacheHit: false,
        dataSource: 'real_api',
      });
    });

    it('provides proper ARIA labels for ticker items', () => {
      render(<TickerTapePro />);
      
      expect(screen.getAllByLabelText('AAPL 150.25 up 1.45 percent').length).toBeGreaterThan(0);
      expect(screen.getAllByLabelText('MSFT 280.50 down 0.44 percent').length).toBeGreaterThan(0);
      expect(screen.getAllByLabelText('GOOGL 2,750.00 unchanged 0.00 percent').length).toBeGreaterThan(0);
    });

    it('sets proper role attributes for ticker items', () => {
      render(<TickerTapePro />);
      
      const tickerItems = screen.getAllByRole('button');
      expect(tickerItems).toHaveLength(6); // 3 tickers × 2 (duplicated for seamless loop)
    });

    it('makes ticker items keyboard accessible', async () => {
      const user = userEvent.setup();
      const mockOnTickerClick = vi.fn();
      
      render(<TickerTapePro onTickerClick={mockOnTickerClick} />);
      
      const appleButton = screen.getAllByLabelText('AAPL 150.25 up 1.45 percent')[0];
      
      // Test Enter key
      await user.click(appleButton);
      await user.keyboard('{Enter}');
      
      expect(mockOnTickerClick).toHaveBeenCalledWith('AAPL');
    });

    it('handles space key for ticker item activation', async () => {
      const user = userEvent.setup();
      const mockOnTickerClick = vi.fn();
      
      render(<TickerTapePro onTickerClick={mockOnTickerClick} />);
      
      const appleButton = screen.getAllByLabelText('AAPL 150.25 up 1.45 percent')[0];
      appleButton.focus();
      
      await user.keyboard(' ');
      
      expect(mockOnTickerClick).toHaveBeenCalledWith('AAPL');
    });
  });

  describe('Click Handlers', () => {
    beforeEach(() => {
      mockUseTickerTapeData.mockReturnValue({
        tickers: mockTickerData,
        loading: false,
        error: null,
        metadata: {
          total_symbols: 3,
          requested_limit: 29,
          data_source: 'real_api',
          last_updated: '2025-01-01T00:00:00Z',
        },
        refresh: vi.fn(),
        totalSymbols: 3,
        cacheHit: false,
        dataSource: 'real_api',
      });
    });

    it('calls onTickerClick when ticker item is clicked', async () => {
      const user = userEvent.setup();
      const mockOnTickerClick = vi.fn();
      
      render(<TickerTapePro onTickerClick={mockOnTickerClick} />);
      
      const appleButton = screen.getAllByLabelText('AAPL 150.25 up 1.45 percent')[0];
      await user.click(appleButton);
      
      expect(mockOnTickerClick).toHaveBeenCalledWith('AAPL');
    });

    it('does not call onTickerClick when no handler is provided', async () => {
      const user = userEvent.setup();
      
      render(<TickerTapePro />);
      
      const appleButton = screen.getAllByLabelText('AAPL 150.25 up 1.45 percent')[0];
      
      // Should not throw error
      await user.click(appleButton);
      
      expect(true).toBe(true); // Test passes if no error thrown
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      // Mock window.innerWidth for mobile testing
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
    });

    it('shows mobile display for small screens', () => {
      // Mock many tickers to trigger mobile "more" button
      const manyTickers = Array.from({ length: 15 }, (_, i) => ({
        symbol: `TICK${i}`,
        price: 100 + i,
        change: i % 2 === 0 ? 1 : -1,
        change_percent: i % 2 === 0 ? 1.5 : -1.5,
        changeColor: (i % 2 === 0 ? 'positive' : 'negative') as 'positive' | 'negative',
        changeBadgeClass: i % 2 === 0 ? 'bg-success/10 text-success-600' : 'bg-danger/10 text-danger-600',
      }));

      mockUseTickerTapeData.mockReturnValue({
        tickers: manyTickers,
        loading: false,
        error: null,
        metadata: {
          total_symbols: 15,
          requested_limit: 29,
          data_source: 'real_api',
          last_updated: '2025-01-01T00:00:00Z',
        },
        refresh: vi.fn(),
        totalSymbols: 15,
        cacheHit: false,
        dataSource: 'real_api',
      });

      render(<TickerTapePro />);
      
      // Should show "more" button for mobile
      expect(screen.getByText(/\+\d+ more/)).toBeInTheDocument();
    });
  });

  describe('GPU Optimization', () => {
    beforeEach(() => {
      mockUseTickerTapeData.mockReturnValue({
        tickers: mockTickerData,
        loading: false,
        error: null,
        metadata: {
          total_symbols: 3,
          requested_limit: 29,
          data_source: 'real_api',
          last_updated: '2025-01-01T00:00:00Z',
        },
        refresh: vi.fn(),
        totalSymbols: 3,
        cacheHit: false,
        dataSource: 'real_api',
      });
    });

    it('applies GPU optimization class for smooth animations', () => {
      render(<TickerTapePro />);
      
      const marqueeContainer = screen.getByRole('list');
      expect(marqueeContainer).toHaveClass('will-change-transform');
    });
  });
}); 