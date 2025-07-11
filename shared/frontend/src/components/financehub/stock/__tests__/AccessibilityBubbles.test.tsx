import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import axeCore from 'axe-core';
import { TechnicalAnalysisBubble } from '../AnalysisBubbles/TechnicalAnalysis/TechnicalAnalysisBubble.view';
import { NewsHighlightsBubble } from '../AnalysisBubbles/NewsHighlights/NewsHighlightsBubble.view';

// Mock the useTechnicalAnalysis hook to return stable data for testing
vi.mock('@/hooks/stock/useTechnicalAnalysis', () => ({
  useTechnicalAnalysis: () => ({
    technical: {
      recommendation: 'Buy',
      indicators: {
        rsi: 55.2,
        macd: -0.05,
      },
    },
    loading: false,
    error: null,
  }),
}));

describe('FinanceHub bubbles accessibility', () => {
  it('TechnicalAnalysisBubble should have no a11y violations', async () => {
    const { container } = render(<TechnicalAnalysisBubble ticker="AAPL" />);
    const results = await axeCore.run(container);
    expect(results.violations.length).toBe(0);
  });

  it('NewsHighlightsBubble should have no a11y violations', async () => {
    const mockNews = [
      {
        title: 'Apple releases new product',
        summary: 'Apple unveiled its latest device...',
        published_at: new Date().toISOString(),
      },
    ];
    const { container } = render(<NewsHighlightsBubble news={mockNews} />);
    const results = await axeCore.run(container);
    expect(results.violations.length).toBe(0);
  });
}); 