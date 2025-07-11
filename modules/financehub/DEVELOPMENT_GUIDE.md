# 🛠️ FINANCEHUB DEVELOPMENT GUIDE (Vite + React)

**🎯 Cél:** Modern, enterprise-grade fejlesztési folyamat a `shared/frontend` SPA-hoz.  
**📅 Utolsó frissítés:** 2025-01-22

---

## 🚀 Architecture Overview

The entire FinanceHub frontend is a **Vite-powered React Single-Page Application (SPA)** located in the `shared/frontend` directory. The legacy `modules/financehub/frontend` path is **deprecated** and should not be used for new development.

- **Source of Truth:** `shared/frontend/`
- **Build Tool:** Vite
- **Package Manager:** pnpm
- **Language:** TypeScript
- **Styling:** Tailwind CSS with CSS Modules

---

## 🎨 Premium UX Components

### TickerTapePro Component

The **TickerTapePro** component delivers an IBKR-grade ticker tape experience with enterprise-level performance and accessibility.

#### Design Specifications

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Height | 26px (24px mobile) | Matches IBKR Mosaic watchlist row height |
| Animation | CSS `marquee` (linear, 40s full-loop) | ~2.5 char/sec readable speed, no vibration |
| Padding | 12px left-right per element | Optically "removable" modules |
| Colors | Success: `#27AE60`, Danger: `#C2332B` | WCAG-AA compliant contrast |

#### Information Layout

```
<SYMBOL> <PRICE> <Δ%> → Δ% as right-aligned "pill-badge" (min-width 48px)
```

#### Color System

```typescript
// Tailwind tokens
success: {
  600: '#27AE60', // WCAG-AA green
  // bg-success/10 text-success-600
}
danger: {
  600: '#C2332B', // WCAG-AA red  
  // bg-danger/10 text-danger-600
}
neutral: {
  500: '#737373', // Neutral state
  // bg-neutral/10 text-neutral-500
}
```

#### Performance Features

- **GPU Acceleration:** `will-change: transform` for 60fps animation
- **Hover Pause:** `animation-play-state: paused` on mouse enter
- **Duplicate Loop:** Seamless continuous marquee without gaps
- **SWR Caching:** 30s refresh interval with stale-while-revalidate

#### Accessibility

- **ARIA Labels:** `"AAPL 150.25 up 1.45 percent"` for screen readers
- **Keyboard Navigation:** Enter/Space key support
- **Focus Management:** Proper tabindex and focus indicators
- **Color Independence:** Icons/symbols supplement color coding

#### Responsive Behavior

- **Desktop (≥768px):** Full marquee with all 29 symbols
- **Mobile (<768px):** First 10 symbols + "⋯ +19 more" modal trigger
- **Touch Targets:** Minimum 44px touch target size

#### Implementation

```typescript
// Usage
<TickerTapePro 
  onTickerClick={(symbol) => navigate(`/stock/${symbol}`)}
  className="custom-styling"
/>

// Configuration
import { TICKER_CONFIG } from '@/config/tickers';
// TICKER_CONFIG.TOTAL_SYMBOLS = 29
// TICKER_CONFIG.MARQUEE_DURATION_SECONDS = 40
// TICKER_CONFIG.MOBILE_DISPLAY_LIMIT = 10
```

---

## 🔄 Development Workflow

### 1. Initial Setup

Navigate to the project root and install all dependencies for the workspace using `pnpm`.

```bash
# From the repository root
pnpm install
```

### 2. Running the Full-Stack Environment

The easiest way to run the entire stack (backend + frontend) is to use the provided script from the project root.

```bash
# From the repository root
./scripts/dev-all.sh
```

This will start:
- **Backend API:** `http://localhost:8084`
- **Frontend App:** `http://localhost:8083`

Alternatively, you can run them in separate terminals:

**Terminal 1: Start Backend**
```bash
# From project root
poetry install
poetry run uvicorn modules.financehub.backend.main:app --reload --port 8084
```

**Terminal 2: Start Frontend**
```bash
# From project root
cd shared/frontend
pnpm dev
```

### 3. Creating New Components

Follow the established structure:

- **Pages:** Responsible for layout and data fetching orchestration. Reside in `shared/frontend/src/pages`.
- **Components:** Reusable UI elements. Reside in `shared/frontend/src/components`.
- **Hooks:** Contain business logic, state management, and API calls. Reside in `shared/frontend/src/hooks`.

New components should be modular and follow the Single Responsibility Principle.

#### Component Size Limits (Rule #008)

- **Maximum 160 lines per component file**
- **Split into `.view.tsx` and `.logic.ts` if exceeded**
- **Use custom hooks for complex state management**

#### Example Structure

```
src/components/financehub/
├── TickerTapePro.view.tsx      # UI component (≤160 lines)
├── __tests__/
│   └── TickerTapePro.test.tsx  # Unit tests
└── types.ts                    # TypeScript interfaces
```

---

## 🎯 Data Configuration

### Ticker Symbol Configuration

The master ticker list is defined in `src/config/tickers.ts`:

```typescript
// 29-symbol IBKR-grade master list
export const TICKER_CATEGORIES = [
  {
    id: 'us_equities',
    name: 'US Equities',
    symbols: ['NVDA', 'AAPL', 'MSFT', ...], // Magnificent 7 + volume leaders
  },
  {
    id: 'index_etfs', 
    name: 'Index ETFs',
    symbols: ['SPY', 'QQQ', 'DIA', 'IWM'], // Major index trackers
  },
  // ... forex, crypto, commodities
];
```

### API Integration

```typescript
// Hook usage with SWR
const { tickers, loading, error, refresh } = useTickerTapeData(29);

// Response format
interface TickerTapeAPIResponse {
  status: string;
  data: TickerTapeItem[];
  metadata: {
    total_symbols: number;
    cache_hit: boolean;
    data_source: 'real_api' | 'cache';
  };
}
```

---

## ✅ Quality Assurance

### Linting

Check for code style and potential errors using ESLint.

```bash
# From the shared/frontend directory
pnpm lint

# To automatically fix issues
pnpm lint:fix
```

### Testing

Run unit and integration tests using Vitest.

```bash
# From the shared/frontend directory
pnpm test

# Run specific component tests
pnpm test TickerTapePro
```

### Performance Testing

```bash
# Lighthouse CI (requires dev server running)
pnpm lhci:autorun

# Build optimization check
pnpm build
# Check dist/ bundle sizes
```

### Accessibility Testing

Run axe-core based tests to ensure no violations:

```bash
pnpm test AccessibilityBubbles
```

---

## 🚀 Deployment Checklist

### Pre-deployment Validation

1. **Component Size Audit:** All components ≤160 lines
2. **Lighthouse Score:** Performance, Accessibility, Best Practices ≥90
3. **Test Coverage:** Unit tests for all interactive components
4. **ARIA Compliance:** Screen reader compatibility verified
5. **Mobile Responsiveness:** <768px breakpoint tested

### Build Process

```bash
# Production build
pnpm build

# Type checking
pnpm typecheck

# Lint validation
pnpm lint

# Test suite
pnpm test
```

---

## 📚 Additional Resources

- **Tailwind Config:** `tailwind.config.js` - Custom tokens and animations
- **API Documentation:** `modules/financehub/backend/API_DOCUMENTATION.md`
- **Component Library:** Storybook integration (future roadmap)
- **Performance Monitoring:** Lighthouse CI integration

---

## 💬 Chat Integration

### New Chat Overlay Architecture (2024)
- **Component**: `ChatOverlay.tsx` - Full-screen glassmorphism chat interface
- **Hook**: `useLLMStream.ts` - Advanced SSE streaming with error handling
- **Context**: `ChatContext.tsx` - Global chat state management
- **Backend**: `/api/v1/stock/chat/{ticker}/stream` - SSE endpoint

### Key Features
- **Glassmorphism Design**: Modern backdrop-blur with shadow-glass tokens
- **Mobile-First**: Responsive design with safe-area padding
- **Keyboard Shortcuts**: Cmd/Ctrl + / to open, Enter to send, Shift+Enter for new line
- **Error Boundaries**: Chat-specific error handling with retry logic
- **Auto-scroll**: Smart scrolling with indicator when not at bottom
- **Streaming**: Real-time SSE with typing cursor animation

### Usage
```tsx
import { useChatContext } from '../contexts/ChatContext';

const { openChat, closeChat, chatOpen } = useChatContext();

// Open chat for specific ticker
<button onClick={() => openChat('AAPL')}>
  Open AI Chat
</button>

// Chat overlay is automatically mounted in AppLayout
```

### Components Structure
```
src/components/chat/
├── ChatOverlay.tsx          # Main overlay with portal mounting
├── ChatInput.tsx            # Auto-resizing input with shortcuts
├── UserMessage.tsx          # User message bubble
├── StreamingMessage.tsx     # AI message with typing animation
├── AutoScrollIndicator.tsx  # Scroll-to-bottom indicator
├── ChatErrorBoundary.tsx    # Error boundary with retry
└── index.ts                 # Exports
```

### Backend Integration
- Streams responses using Server-Sent Events (SSE)
- Endpoint: `GET /api/v1/stock/chat/{ticker}/stream`
- Returns JSON chunks with `token` and `type` fields
- Enhanced error handling for connection issues

### CSS Tokens
```css
/* Chat-specific tokens in globals.css */
--glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
--glass-border: rgba(255, 255, 255, 0.18);
--glass-backdrop: rgba(255, 255, 255, 0.25);
--chat-overlay-z: 90;
--chat-input-height: 60px;
--chat-safe-area-bottom: env(safe-area-inset-bottom, 0px);
```

---

**Built with ❤️ by the AEVOREX Team**  
*Premium equity research experience powered by modern web technologies* 