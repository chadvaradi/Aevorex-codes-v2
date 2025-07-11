# AEVOREX FinanceHub Module v2.1 🚀

State-of-the-art equity research terminal powered by a modular FastAPI backend and a modern React frontend.

## 🎯 Overview

The FinanceHub module provides an institutional-grade research experience by combining a high-performance, asynchronous backend with a responsive and intuitive React-based user interface. It moves beyond monolithic data loading by using a modular, multi-endpoint approach for a faster, more fluid user experience.

-   **Modern Frontend:** A Vite-powered React SPA located in `shared/frontend`.
-   **High-Performance Backend:** An asynchronous FastAPI application with modular endpoints.
-   **Modular API:** Separate, fast endpoints for different data types (chart, fundamentals, news, etc.).
-   **Google Authentication:** Secure sign-in flow using Google OAuth 2.0.
-   **AI-Powered Features:** Ready for `search` and streaming `chat` implementation.

---

## 🏗️ Architecture

The project is a monorepo with a clear separation between the backend, frontend, and shared documentation.

-   **Backend:** `modules/financehub/backend/`
    -   Written in Python using FastAPI.
    -   Handles all data fetching, caching, and business logic.
-   **Frontend:** `shared/frontend/`
    -   A modern React SPA built with Vite and TypeScript.
    -   Uses `pnpm` for package management.
-   **Documentation:** `docs/` and `modules/financehub/docs/`
    -   Contains API documentation, architecture overviews, and changelogs.

---

## 🛠️ Installation & Setup

### Prerequisites

-   Python 3.11+ & Poetry
-   Node.js 18+ & `pnpm`
-   Docker (for Redis cache)

### Full-Stack Setup

1.  **Install Dependencies:**
    From the project root, install both backend and frontend dependencies.

   ```bash
    poetry install
    pnpm install
   ```

2.  **Start Services:**
    The easiest way to run the entire stack is with the `dev-all.sh` script.

   ```bash
    # From the project root
    ./scripts/dev-all.sh
    ```

    This will launch:
    -   **Redis Cache** via Docker
    -   **Backend API** on `http://localhost:8084`
    -   **Frontend App** on `http://localhost:8083`

---

## 🔧 API Endpoints

The backend exposes a set of fast, modular endpoints for different data categories. For a complete and up-to-date list, please refer to the official API documentation:

-   **[FinanceHub API Documentation](../../docs/API_DOCUMENTATION.md)**

This includes details on authentication, stock data, market data, and AI-powered endpoints.

---

## 🧪 Testing

### Frontend Testing

Tests are located in `shared/frontend` and run with Vitest.

```bash
# Navigate to the frontend directory
cd shared/frontend

# Run all tests
pnpm test

To run only accessibility checks (axe-core):
```bash
pnpm test AccessibilityBubbles
```
```

### Backend Testing

Tests are located in `modules/financehub/backend` and run with `pytest`.

```bash
# Navigate to the backend directory
cd modules/financehub/backend

# Run all tests
poetry run pytest
```

---

## 🚀 Deployment

The application is containerized for easy deployment.

   ```bash
# Build and run all services defined in docker-compose.yml
docker-compose up -d --build
   ```

## 📊 Performance Metrics

### Before (v1.0)
- Initial load: 5-10 seconds
- Blocking UI during data fetch
- Single large API response (4.9MB)
- Poor mobile experience

### After (v2.0)
- Phase 1: ~100ms (basic data visible)
- Phase 2: ~200ms (chart renders)
- Phase 3: ~500ms (fundamentals loaded)
- Phase 4: ~1-2s (complete analysis)
- **80% improvement in perceived performance**

## 🔮 Roadmap

### v2.1 - Premium Features
- [ ] Deep Search with AI
- [ ] Document upload and analysis
- [ ] Web search integration
- [ ] Advanced authentication
- [x] Premium analysis bubbles upgrade (badge indicators, skeleton loaders, a11y-complete)

### v2.2 - Collaboration
- [ ] Shared research workspaces
- [ ] Team collaboration tools
- [ ] Report generation
- [ ] Export capabilities

### v2.3 - Advanced Analytics
- [ ] Custom screening tools
- [ ] Portfolio analysis
- [ ] Risk assessment
- [ ] Backtesting capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software owned by AEVOREX. All rights reserved.

## 📞 Support

- **Documentation**: [Internal Wiki]
- **Issues**: [Internal Issue Tracker]
- **Discord**: [Development Channel]
- **Email**: dev@aevorex.com

---

**Built with ❤️ by the AEVOREX Team**

*Transforming equity research with AI and modern technology* 