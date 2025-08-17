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
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

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

# Rate limiting setup
limiter = Limiter(key_func=get_remote_address)

# Metrics tracking
webhook_metrics = {
    "total_requests": 0,
    "successful_requests": 0,
    "failed_requests": 0,
    "idempotency_conflicts": 0,
    "signature_failures": 0,
    "provider_events": {
        "lemonsqueezy": {},
        "stripe": {},
        "paddle": {}
    }
}

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
    """Verify Lemon Squeezy webhook signature using HMAC-SHA256."""
    try:
        # Lemon Squeezy uses HMAC-SHA256 with the webhook secret
        expected_signature = hmac.new(
            secret.encode('utf-8'),
            payload,
            hashlib.sha256
        ).hexdigest()
        
        # Lemon Squeezy signature format: "sha256=<signature>"
        expected_header = f"sha256={expected_signature}"
        
        # Use constant-time comparison to prevent timing attacks
        return hmac.compare_digest(expected_header, signature)
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
    
    # Enhanced status mapping with comprehensive coverage
    status_mapping = {
        "active": SubscriptionStatus.ACTIVE,
        "trialing": SubscriptionStatus.TRIALING,
        "past_due": SubscriptionStatus.PAST_DUE,
        "cancelled": SubscriptionStatus.CANCELED,
        "unpaid": SubscriptionStatus.UNPAID,
        "paused": SubscriptionStatus.CANCELED,  # Treat paused as cancelled
        "expired": SubscriptionStatus.CANCELED
    }

    plan_mapping = {
        "pro_monthly": SubscriptionPlan.PRO,
        "pro_yearly": SubscriptionPlan.PRO,
        "team_monthly": SubscriptionPlan.TEAM,
        "team_yearly": SubscriptionPlan.TEAM,
        "enterprise_monthly": SubscriptionPlan.ENTERPRISE,
        "enterprise_yearly": SubscriptionPlan.ENTERPRISE,
    }

    # Comprehensive event mapping
    subscription_events = [
        "subscription_created",
        "subscription_updated", 
        "subscription_cancelled",
        "subscription_expired",
        "subscription_payment_succeeded",
        "subscription_resumed",
        "subscription_paused",
        "subscription_unpaused"
    ]
    
    payment_events = [
        "order_created",
        "order_refunded",
        "subscription_payment_success",
        "subscription_payment_failed"
    ]
    
    if event_name in subscription_events:
        subscription = data.get("attributes", {})
        order = data.get("relationships", {}).get("order", {}).get("data", {}).get("attributes", {}) # order data for dates

        ls_status = subscription.get("status")
        mapped_status = status_mapping.get(ls_status, SubscriptionStatus.INCOMPLETE)
        
        variant_id = subscription.get("variant_id")
        # Use config-based plan mapping for flexibility
        ls_config = settings.SUBSCRIPTION.LEMON_SQUEEZY
        plan = ls_config.variant_to_plan_mapping.get(str(variant_id), SubscriptionPlan.PRO)

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
        
    elif event_name in payment_events:
        # Handle payment-related events
        order = data.get("attributes", {})
        subscription_id = order.get("subscription_id")
        
        if event_name == "subscription_payment_failed":
            # Update subscription status to past_due
            await sub_service.update_subscription_status(
                external_id=subscription_id,
                provider=PaymentProvider.LEMON_SQUEEZY,
                status=SubscriptionStatus.PAST_DUE
            )
            logger.info(f"Lemon Squeezy payment failed: {subscription_id}")
            
        elif event_name == "subscription_payment_success":
            # Update subscription status to active
            await sub_service.update_subscription_status(
                external_id=subscription_id,
                provider=PaymentProvider.LEMON_SQUEEZY,
                status=SubscriptionStatus.ACTIVE
            )
            logger.info(f"Lemon Squeezy payment success: {subscription_id}")
        
    else:
        logger.info(f"Unhandled Lemon Squeezy event: {event_name}")
        
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
async def lemonsqueezy_webhook(
    request: Request, 
    sub_service: SubscriptionService = Depends(get_subscription_service)
):
    """Handle Lemon Squeezy webhooks with dynamic rate limiting."""
    # Apply rate limiting from config
    rate_limit = settings.SUBSCRIPTION.WEBHOOK_RATE_LIMIT
    await limiter.check_request_limit(request, rate_limit)
    """Handle Lemon Squeezy webhooks with HMAC signature verification and metrics."""
    global webhook_metrics
    
    # Update metrics
    webhook_metrics["total_requests"] += 1
    
    try:
        # Get raw body for signature verification
        body = await request.body()
        
        # Get signature from headers (Lemon Squeezy uses x-signature)
        signature = request.headers.get("x-signature")
        if not signature:
            logger.error("Lemon Squeezy webhook: Missing x-signature header")
            webhook_metrics["signature_failures"] += 1
            webhook_metrics["failed_requests"] += 1
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing signature")
        
        # Verify HMAC signature
        webhook_secret = settings.SUBSCRIPTION.LEMON_SQUEEZY.LEMON_SQUEEZY_WEBHOOK_SECRET.get_secret_value()
        if not verify_lemonsqueezy_signature(body, signature, webhook_secret):
            logger.error("Lemon Squeezy webhook: Invalid HMAC signature")
            webhook_metrics["signature_failures"] += 1
            webhook_metrics["failed_requests"] += 1
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid signature")
        
        # Parse event data
        event_data = await request.json()
        event_id = event_data.get("id")
        event_name = event_data.get("event_name", "unknown")
        
        # Track event type
        if event_name not in webhook_metrics["provider_events"]["lemonsqueezy"]:
            webhook_metrics["provider_events"]["lemonsqueezy"][event_name] = 0
        webhook_metrics["provider_events"]["lemonsqueezy"][event_name] += 1
        
        logger.info(f"Processing Lemon Squeezy webhook: {event_name} (ID: {event_id})")
        
        # Check idempotency
        if await sub_service.is_webhook_event_processed(event_id):
            logger.info(f"Lemon Squeezy webhook event {event_id} already processed")
            webhook_metrics["idempotency_conflicts"] += 1
            return JSONResponse(content={"status": "already_processed"})
        
        # Process event
        result = await handle_lemonsqueezy_webhook(event_data, sub_service)
        
        # Mark as processed
        await sub_service.mark_webhook_event_processed(
            event_id, 
            PaymentProvider.LEMON_SQUEEZY, 
            event_name
        )
        
        webhook_metrics["successful_requests"] += 1
        logger.info(f"Successfully processed Lemon Squeezy webhook: {event_name}")
        return JSONResponse(content=result)
        
    except HTTPException:
        # Re-raise HTTP exceptions
        webhook_metrics["failed_requests"] += 1
        raise
    except Exception as e:
        logger.error(f"Lemon Squeezy webhook error: {e}")
        webhook_metrics["failed_requests"] += 1
        # Always return 200 to Lemon Squeezy to prevent retries
        return JSONResponse(content={"status": "error", "message": "Internal processing error"})


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


@router.get("/metrics")
async def webhook_metrics_endpoint(request: Request):
    """Get webhook metrics for monitoring (admin only)."""
    # Check for admin API key
    api_key = request.headers.get("X-Admin-API-Key")
    if not api_key or api_key != settings.SUBSCRIPTION.ADMIN_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Admin API key required"
        )
    
    global webhook_metrics
    
    # Calculate success rate
    total = webhook_metrics["total_requests"]
    successful = webhook_metrics["successful_requests"]
    failed = webhook_metrics["failed_requests"]
    
    success_rate = (successful / total * 100) if total > 0 else 0
    
    return {
        "total_requests": total,
        "successful_requests": successful,
        "failed_requests": failed,
        "success_rate_percent": round(success_rate, 2),
        "idempotency_conflicts": webhook_metrics["idempotency_conflicts"],
        "signature_failures": webhook_metrics["signature_failures"],
        "provider_events": webhook_metrics["provider_events"]
    }
