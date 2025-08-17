"""
Subscription Service for FinanceHub Backend
===========================================

Handles all database operations related to users, subscriptions, and webhook events.
"""

import logging
from typing import Optional, Dict, Any
from datetime import datetime
import asyncpg

from modules.financehub.backend.models.subscription import (
    User, 
    Subscription, 
    SubscriptionCreate, 
    SubscriptionUpdate,
    PaymentProvider,
    WebhookEvent,
    UserWithSubscription
)
from modules.financehub.backend.core.performance.database_pool import main_db_pool

logger = logging.getLogger(__name__)


class SubscriptionService:
    """Manages user and subscription data in the database."""

    def __init__(self, db_pool: asyncpg.Pool = main_db_pool):
        self.db_pool = db_pool

    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Retrieve a user by their email address."""
        query = "SELECT * FROM users WHERE email = $1;"
        async with self.db_pool.get_connection() as conn:
            record = await conn.fetchrow(query, email)
        return User(**record) if record else None

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Retrieve a user by their ID."""
        query = "SELECT * FROM users WHERE id = $1;"
        async with self.db_pool.get_connection() as conn:
            record = await conn.fetchrow(query, user_id)
        return User(**record) if record else None

    async def get_user_by_auth_provider_id(self, auth_provider_id: str) -> Optional[User]:
        """Retrieve a user by their authentication provider ID."""
        query = "SELECT * FROM users WHERE auth_provider_id = $1;"
        async with self.db_pool.get_connection() as conn:
            record = await conn.fetchrow(query, auth_provider_id)
        return User(**record) if record else None

    async def create_user(self, email: str, auth_provider_id: Optional[str] = None) -> User:
        """Create a new user in the database."""
        query = "INSERT INTO users (email, auth_provider_id) VALUES ($1, $2) RETURNING *;"
        async with self.db_pool.get_connection() as conn:
            record = await conn.fetchrow(query, email, auth_provider_id)
        return User(**record)

    async def get_subscription_by_user_id(self, user_id: str) -> Optional[Subscription]:
        """Retrieve a user's active subscription."""
        query = "SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY current_period_end DESC LIMIT 1;"
        async with self.db_pool.get_connection() as conn:
            record = await conn.fetchrow(query, user_id)
        return Subscription(**record) if record else None

    async def get_subscription_by_external_id(self, provider: PaymentProvider, external_id: str) -> Optional[Subscription]:
        """Retrieve a subscription by its external provider ID."""
        query = "SELECT * FROM subscriptions WHERE provider = $1 AND external_id = $2;"
        async with self.db_pool.get_connection() as conn:
            record = await conn.fetchrow(query, provider.value, external_id)
        return Subscription(**record) if record else None

    async def create_subscription(self, sub_data: SubscriptionCreate) -> Subscription:
        """Create a new subscription."""
        query = """INSERT INTO subscriptions (
            user_id, external_id, provider, plan, status,
            current_period_start, current_period_end, trial_start, trial_end
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;"""
        async with self.db_pool.get_connection() as conn:
            record = await conn.fetchrow(
                query, 
                str(sub_data.user_id), 
                sub_data.external_id, 
                sub_data.provider.value, 
                sub_data.plan.value, 
                sub_data.status.value,
                sub_data.current_period_start, 
                sub_data.current_period_end, 
                sub_data.trial_start, 
                sub_data.trial_end
            )
        return Subscription(**record)

    async def update_subscription(self, sub_id: str, sub_data: SubscriptionUpdate) -> Optional[Subscription]:
        """Update an existing subscription."""
        updates = []
        values = []
        i = 1
        
        if sub_data.status:
            updates.append(f"status = ${i}")
            values.append(sub_data.status.value)
            i += 1
        if sub_data.current_period_start:
            updates.append(f"current_period_start = ${i}")
            values.append(sub_data.current_period_start)
            i += 1
        if sub_data.current_period_end:
            updates.append(f"current_period_end = ${i}")
            values.append(sub_data.current_period_end)
            i += 1
        if sub_data.trial_start:
            updates.append(f"trial_start = ${i}")
            values.append(sub_data.trial_start)
            i += 1
        if sub_data.trial_end:
            updates.append(f"trial_end = ${i}")
            values.append(sub_data.trial_end)
            i += 1
        
        if not updates:
            return await self.get_subscription_by_external_id(sub_id) # Return current state if no updates

        updates.append(f"updated_at = ${i}")
        values.append(datetime.utcnow())
        i += 1

        query = f"UPDATE subscriptions SET {", ".join(updates)} WHERE id = ${i} RETURNING *;"
        values.append(sub_id)

        async with self.db_pool.get_connection() as conn:
            record = await conn.fetchrow(query, *values)
        return Subscription(**record) if record else None

    async def upsert_subscription(self, user_id: str, provider: PaymentProvider, external_id: str, plan: str, status: str, period_start: datetime, period_end: datetime, trial_start: Optional[datetime] = None, trial_end: Optional[datetime] = None) -> Subscription:
        """Create or update a subscription, linking to a user."""
        existing_sub = await self.get_subscription_by_external_id(provider, external_id)
        if existing_sub:
            # Update existing subscription
            sub_update = SubscriptionUpdate(
                status=SubscriptionStatus(status), 
                current_period_start=period_start, 
                current_period_end=period_end, 
                trial_start=trial_start, 
                trial_end=trial_end
            )
            updated_sub = await self.update_subscription(str(existing_sub.id), sub_update)
            logger.info(f"Updated subscription {external_id} for user {user_id}")
            return updated_sub or existing_sub # Return updated or original if update failed
        else:
            # Create new subscription
            sub_create = SubscriptionCreate(
                user_id=user_id, 
                external_id=external_id, 
                provider=provider, 
                plan=plan, 
                status=SubscriptionStatus(status),
                current_period_start=period_start, 
                current_period_end=period_end, 
                trial_start=trial_start, 
                trial_end=trial_end
            )
            new_sub = await self.create_subscription(sub_create)
            logger.info(f"Created new subscription {external_id} for user {user_id}")
            return new_sub

    async def get_user_with_subscription(self, user_id: str) -> Optional[UserWithSubscription]:
        """Get a user and their latest subscription information."""
        user = await self.get_user_by_id(user_id)
        if not user:
            return None

        subscription = await self.get_subscription_by_user_id(user_id)
        return UserWithSubscription(user=user, subscription=subscription)

    async def mark_webhook_event_processed(self, event_id: str, provider: PaymentProvider, event_type: str) -> None:
        """Mark a webhook event as processed for idempotency."""
        query = "INSERT INTO webhook_events (id, provider, event_type) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING;"
        async with self.db_pool.get_connection() as conn:
            await conn.execute(query, event_id, provider.value, event_type)
        logger.info(f"Webhook event {event_id} ({event_type}) from {provider.value} marked as processed.")

    async def is_webhook_event_processed(self, event_id: str) -> bool:
        """Check if a webhook event has already been processed."""
        query = "SELECT id FROM webhook_events WHERE id = $1;"
        async with self.db_pool.get_connection() as conn:
            record = await conn.fetchrow(query, event_id)
        return record is not None

# Instantiate the service for dependency injection
subscription_service = SubscriptionService()

async def get_subscription_service() -> SubscriptionService:
    """Dependency injector for SubscriptionService."""
    return subscription_service
