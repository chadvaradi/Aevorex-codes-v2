import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForexDashboard from '../../macro/ForexDashboard';

// Mock fetch for pair and for list
const originalFetch = global.fetch;

const mockRatesResponse = {
  pairs: ['EUR/USD', 'EUR/GBP', 'EUR/JPY', 'EUR/CHF'],
};
const mockPairResponse = {
  status: 'success',
  pair: 'EUR/USD',
  rate: 1.09,
  timestamp: new Date().toISOString(),
};

describe('FXDetailModal integration', () => {
  beforeEach(() => {
    global.fetch = vi.fn((url: any) => {
      if (typeof url === 'string' && url.includes('/macro/forex/pairs')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockRatesResponse) } as Response);
      }
      if (typeof url === 'string' && url.includes('/macro/forex/EUR/USD')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockPairResponse) } as Response);
      }
      return Promise.reject(new Error('unexpected url'));
    });
  });

  afterEach(() => {
    global.fetch = originalFetch as any;
    vi.resetAllMocks();
  });

  it('opens modal and displays rate when ForexRateCard clicked', async () => {
    render(<ForexDashboard />);

    // Wait until rate cards appear
    const card = await screen.findByRole('button', { name: /USD/i });
    fireEvent.click(card);

    // Modal should appear with loading text, then rate
    await waitFor(() => {
      expect(screen.getByText(/FX Detail – EUR\/USD/i)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText(/Rate:/i)).toBeInTheDocument();
    });
  });
}); 