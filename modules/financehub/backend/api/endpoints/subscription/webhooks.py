"""
Webhook Endpoints for Subscription Management
============================================

Handles webhooks from payment providers (Stripe, Lemon Squeezy, Paddle).
"""

import logging
import hashlib
import hmac
from typing import Dict, Any
from fastapi import APIRouter, Request, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta

from ....models.subscription import (
    PaymentProvider, 
    SubscriptionStatus, 
    SubscriptionPlan,
    WebhookEvent
)
from ....middleware.subscription_middleware import get_subscription_middleware
from ....config import settings
from ....core.services.subscription_service import get_subscription_service, SubscriptionService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


def verify_stripe_signature(payload: bytes, signature: str, secret: str) -> bool:
    """Verify Stripe webhook signature."""
    try:
        expected_signature = hmac.new(
            secret.encode('utf-8'),
            payload,
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(f"whsec_{expected_signature}", signature)
    except Exception as e:
        logger.error(f"Stripe signature verification failed: {e}")
        return False


def verify_lemonsqueezy_signature(payload: bytes, signature: str, secret: str) -> bool:
    """Verify Lemon Squeezy webhook signature."""
    try:
        expected_signature = hmac.new(
            secret.encode('utf-8'),
            payload,
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(signature, expected_signature)
    except Exception as e:
        logger.error(f"Lemon Squeezy signature verification failed: {e}")
        return False


def verify_paddle_signature(payload: bytes, signature: str, secret: str) -> bool:
    """Verify Paddle webhook signature."""
    try:
        expected_signature = hmac.new(
            secret.encode('utf-8'),
            payload,
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(signature, expected_signature)
    except Exception as e:
        logger.error(f"Paddle signature verification failed: {e}")
        return False


async def handle_stripe_webhook(event_data: Dict[str, Any]) -> Dict[str, str]:
    """Handle Stripe webhook events."""
    event_type = event_data.get("type")
    data = event_data.get("data", {})
    
    if event_type in ["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"]:
        subscription = data.get("object", {})
        
        # Map Stripe status to our enum
        status_mapping = {
            "active": SubscriptionStatus.ACTIVE,
            "trialing": SubscriptionStatus.TRIALING,
            "past_due": SubscriptionStatus.PAST_DUE,
            "canceled": SubscriptionStatus.CANCELED,
            "incomplete": SubscriptionStatus.INCOMPLETE,
            "incomplete_expired": SubscriptionStatus.INCOMPLETE_EXPIRED,
            "unpaid": SubscriptionStatus.UNPAID
        }
        
        stripe_status = subscription.get("status")
        mapped_status = status_mapping.get(stripe_status, SubscriptionStatus.INCOMPLETE)
        
        # Map plan from Stripe price ID
        price_id = subscription.get("items", {}).get("data", [{}])[0].get("price", {}).get("id")
        plan_mapping = {
            "price_pro_monthly": SubscriptionPlan.PRO,
            "price_pro_yearly": SubscriptionPlan.PRO,
            "price_team_monthly": SubscriptionPlan.TEAM,
            "price_team_yearly": SubscriptionPlan.TEAM,
            "price_enterprise_monthly": SubscriptionPlan.ENTERPRISE,
            "price_enterprise_yearly": SubscriptionPlan.ENTERPRISE,
        }
        plan = plan_mapping.get(price_id, SubscriptionPlan.PRO)
        
        # TODO: Update subscription in database
        logger.info(f"Stripe subscription {event_type}: {subscription.get('id')} - {mapped_status}")
        
    return {"status": "processed"}


async def handle_lemonsqueezy_webhook(event_data: Dict[str, Any], sub_service: SubscriptionService) -> Dict[str, str]:
    """Handle Lemon Squeezy webhook events."""
    event_name = event_data.get("event_name")
    data = event_data.get("data", {})
    
    status_mapping = {
        "active": SubscriptionStatus.ACTIVE,
        "trialing": SubscriptionStatus.TRIALING,
        "past_due": SubscriptionStatus.PAST_DUE,
        "cancelled": SubscriptionStatus.CANCELED,
        "unpaid": SubscriptionStatus.UNPAID
    }

    plan_mapping = {
        "pro_monthly": SubscriptionPlan.PRO,
        "pro_yearly": SubscriptionPlan.PRO,
        "team_monthly": SubscriptionPlan.TEAM,
        "team_yearly": SubscriptionPlan.TEAM,
        "enterprise_monthly": SubscriptionPlan.ENTERPRISE,
        "enterprise_yearly": SubscriptionPlan.ENTERPRISE,
    }

    if event_name in ["subscription_created", "subscription_updated", "subscription_cancelled", "subscription_expired", "subscription_payment_succeeded"]:
        subscription = data.get("attributes", {})
        order = data.get("relationships", {}).get("order", {}).get("data", {}).get("attributes", {}) # order data for dates

        ls_status = subscription.get("status")
        mapped_status = status_mapping.get(ls_status, SubscriptionStatus.INCOMPLETE)
        
        variant_id = subscription.get("variant_id")
        plan = plan_mapping.get(str(variant_id), SubscriptionPlan.PRO)

        # Convert dates
        # Lemon Squeezy dates are ISO 8601 strings with Z for UTC, datetime.fromisoformat handles it
        period_start = datetime.fromisoformat(order.get("created_at").replace("Z", "+00:00")) if order.get("created_at") else datetime.utcnow()
        period_end = datetime.fromisoformat(subscription.get("ends_at").replace("Z", "+00:00")) if subscription.get("ends_at") else (datetime.utcnow() + timedelta(days=30)) # Fallback for non-ending plans
        trial_start = datetime.fromisoformat(subscription.get("trial_starts_at").replace("Z", "+00:00")) if subscription.get("trial_starts_at") else None
        trial_end = datetime.fromisoformat(subscription.get("trial_ends_at").replace("Z", "+00:00")) if subscription.get("trial_ends_at") else None

        # Fetch the user based on the custom user_id passed during checkout
        user_id = data.get("meta", {}).get("custom_user_id")
        if not user_id:
            logger.error(f"Lemon Squeezy webhook error: user_id not found in meta.custom_user_id for event {event_name}. Event ID: {event_data.get('id')}")
            return {"status": "failed", "message": "user_id missing"}

        # Ensure user exists or create them (optional, depends on your auth flow)
        user = await sub_service.get_user_by_id(user_id)
        if not user:
            # If user not found, try by email from webhook payload
            user_email = data.get("attributes", {}).get("user_email")
            if user_email:
                user = await sub_service.get_user_by_email(user_email)
                if not user:
                    user = await sub_service.create_user(email=user_email, auth_provider_id=user_id) # auth_provider_id is our internal user_id
                user_id = str(user.id)
            else:
                logger.error(f"Lemon Squeezy webhook error: user not found by custom_user_id or email for event {event_name}. Event ID: {event_data.get('id')}")
                return {"status": "failed", "message": "user not found"}

        # Upsert subscription
        await sub_service.upsert_subscription(
            user_id=user_id,
            provider=PaymentProvider.LEMON_SQUEEZY,
            external_id=str(subscription.get("id")),
            plan=plan,
            status=mapped_status,
            current_period_start=period_start,
            current_period_end=period_end,
            trial_start=trial_start,
            trial_end=trial_end
        )
        logger.info(f"Lemon Squeezy subscription {event_name}: {subscription.get('id')} for user {user_id} - {mapped_status}")
        
    return {"status": "processed"}


async def handle_paddle_webhook(event_data: Dict[str, Any]) -> Dict[str, str]:
    """Handle Paddle webhook events."""
    event_type = event_data.get("event_type")
    data = event_data.get("data", {})
    
    if event_type in ["subscription.created", "subscription.updated", "subscription.cancelled"]:
        subscription = data.get("subscription", {})
        
        # Map Paddle status
        status_mapping = {
            "active": SubscriptionStatus.ACTIVE,
            "trialing": SubscriptionStatus.TRIALING,
            "past_due": SubscriptionStatus.PAST_DUE,
            "cancelled": SubscriptionStatus.CANCELED,
            "deleted": SubscriptionStatus.CANCELED
        }
        
        paddle_status = subscription.get("status")
        mapped_status = status_mapping.get(paddle_status, SubscriptionStatus.INCOMPLETE)
        
        # Map plan from plan ID
        plan_id = subscription.get("plan_id")
        plan_mapping = {
            "pro_monthly": SubscriptionPlan.PRO,
            "pro_yearly": SubscriptionPlan.PRO,
            "team_monthly": SubscriptionPlan.TEAM,
            "team_yearly": SubscriptionPlan.TEAM,
            "enterprise_monthly": SubscriptionPlan.ENTERPRISE,
            "enterprise_yearly": SubscriptionPlan.ENTERPRISE,
        }
        plan = plan_mapping.get(plan_id, SubscriptionPlan.PRO)
        
        # TODO: Update subscription in database
        logger.info(f"Paddle subscription {event_type}: {subscription.get('subscription_id')} - {mapped_status}")
        
    return {"status": "processed"}


@router.post("/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks."""
    try:
        # Get raw body
        body = await request.body()
        signature = request.headers.get("stripe-signature", "")
        
        # Verify signature
        if not verify_stripe_signature(body, signature, settings.STRIPE_WEBHOOK_SECRET):
            raise HTTPException(status_code=400, detail="Invalid signature")
        
        # Parse event
        import json
        event_data = json.loads(body)
        
        # Process event
        result = await handle_stripe_webhook(event_data)
        
        return JSONResponse(content=result)
        
    except Exception as e:
        logger.error(f"Stripe webhook error: {e}")
        raise HTTPException(status_code=400, detail="Webhook processing failed")


@router.post("/lemonsqueezy")
async def lemonsqueezy_webhook(request: Request, sub_service: SubscriptionService = Depends(get_subscription_service)):
    """Handle Lemon Squeezy webhooks."""
    try:
        # Get raw body
        body = await request.body()
        signature = request.headers.get("x-signature", "")
        
        # Verify signature
        if not verify_lemonsqueezy_signature(body, signature, settings.LEMON_SQUEEZY_WEBHOOK_SECRET):
            raise HTTPException(status_code=400, detail="Invalid signature")
        
        # Parse event
        import json
        event_data = json.loads(body)
        
        # Process event
        result = await handle_lemonsqueezy_webhook(event_data, sub_service)
        
        return JSONResponse(content=result)
        
    except Exception as e:
        logger.error(f"Lemon Squeezy webhook error: {e}")
        raise HTTPException(status_code=400, detail="Webhook processing failed")


@router.post("/paddle")
async def paddle_webhook(request: Request):
    """Handle Paddle webhooks."""
    try:
        # Get raw body
        body = await request.body()
        signature = request.headers.get("paddle-signature", "")
        
        # Verify signature
        if not verify_paddle_signature(body, signature, settings.PADDLE_WEBHOOK_SECRET):
            raise HTTPException(status_code=400, detail="Invalid signature")
        
        # Parse event
        import json
        event_data = json.loads(body)
        
        # Process event
        result = await handle_paddle_webhook(event_data)
        
        return JSONResponse(content=result)
        
    except Exception as e:
        logger.error(f"Paddle webhook error: {e}")
        raise HTTPException(status_code=400, detail="Webhook processing failed")


@router.get("/health")
async def webhook_health():
    """Health check for webhook endpoints."""
    return {"status": "healthy", "endpoints": ["stripe", "lemonsqueezy", "paddle"]}
