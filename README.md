# AEVOREX

AEVOREX is a modular AI-assistant framework designed for real-world problem solving in finance, healthcare, and education.

## Current Focus: FinBot Alpha

The first module, FinBot Alpha, is a lightweight insight engine that helps users analyze stock portfolios, summarize financial news, and generate personalized investment strategies using LLMs and public APIs.

## 🆕 Subscription System (Latest Update)

**FinanceHub now includes a complete subscription management system:**

- **Three-tier Protection**: Edge (Cloudflare Worker), Backend (FastAPI middleware), Frontend (React guards)
- **Payment Integration**: Lemon Squeezy (Merchant of Record) with webhook support
- **Free Trial Support**: 14-day trial with automatic subscription creation
- **Plan-based Access**: Free, Pro, Team, Enterprise tiers with different feature limits
- **Grace Period**: 3-day buffer for past_due subscriptions
- **Idempotent Webhooks**: Prevents duplicate processing of payment events

### Key Features:
- ✅ **Subscription Models**: User, Subscription, WebhookEvent with Pydantic validation
- ✅ **API Endpoints**: `/api/v1/subscription/check`, `/plans`, `/create-checkout`, `/trial/start`
- ✅ **Frontend Guards**: `SubscriptionGuard` component with plan-based routing
- ✅ **Database Schema**: PostgreSQL tables for users, subscriptions, webhook events
- ✅ **Cloudflare Worker**: Edge-level access control for protected routes
- ✅ **Complete Documentation**: See `modules/financehub/docs/SUBSCRIPTION_SYSTEM_DESIGN.md`

### Quick Start:
1. Set up PostgreSQL database and run schema: `modules/financehub/backend/database/sql/create_subscription_tables.sql`
2. Configure Lemon Squeezy API keys in `.env.local`
3. Start backend: `poetry run uvicorn modules.financehub.backend.main:app --reload --port 8084`
4. Deploy Cloudflare Worker for edge protection

---

## Tech Stack (WIP)
- For the up-to-date, canonical technology overview please read **[docs/tech_stack.md](docs/tech_stack.md)**.

*(This section is intentionally brief to avoid duplication.)*

## Development Note
All frontend code now lives under `shared/frontend`.
