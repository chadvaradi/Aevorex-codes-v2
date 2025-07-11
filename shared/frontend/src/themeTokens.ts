export const themeTokens = {
  colors: {
    background: 'var(--background)',
    foreground: 'var(--foreground)',
    primary: 'var(--primary)',
    secondary: 'var(--secondary)',
    gain: 'var(--fh-gain-emerald)',
    loss: 'var(--fh-loss-crimson)',
  },
  spacing: {
    xs: 'var(--space-1)',
    sm: 'var(--space-2)',
    md: 'var(--space-4)',
    lg: 'var(--space-8)',
  },
} as const;

export type ThemeTokens = typeof themeTokens; 