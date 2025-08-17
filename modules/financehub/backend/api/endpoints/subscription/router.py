"""
Subscription API Endpoints for FinanceHub
=========================================

Handles subscription-related operations like checking status, managing plans, and trials.
"""

import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Request, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta

from ....models.subscription import (
    SubscriptionCheckResponse,
    SubscriptionPlan,
    PaymentProvider,
    UserWithSubscription,
    SubscriptionCreate,
    SubscriptionStatus
)
from ....middleware.subscription_middleware import (
    get_subscription_middleware, 
    require_active_subscription, 
    require_pro_plan,
    SubscriptionMiddleware
)
from ....core.services.subscription_service import get_subscription_service, SubscriptionService
from ....core.security.jwt_middleware import get_current_user
from ....config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/subscription", tags=["Subscription"])


@router.get(
    "/check", 
    response_model=SubscriptionCheckResponse,
    summary="Check User Subscription Status",
    description="Returns the current subscription status of the authenticated user."
)
async def check_user_subscription(
    request: Request,
    current_user: dict = Depends(get_current_user),
    sub_service: SubscriptionService = Depends(get_subscription_service),
    sub_middleware: SubscriptionMiddleware = Depends(get_subscription_middleware)
):
    """Check the subscription status for the authenticated user."""
    user_id = current_user.get("user_id")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not authenticated")
    
    response = await sub_middleware.check_subscription_status(user_id)
    return response


@router.get(
    "/plans",
    summary="Get Available Subscription Plans",
    description="Returns a list of all available subscription plans and their details."
)
async def get_subscription_plans():
    """Get a list of available subscription plans."""
    # This should ideally come from a database or a configuration service
    # For now, hardcoding as an example
    plans = [
        {
            "id": "free",
            "name": "Free Plan",
            "price_monthly": 0,
            "price_yearly": 0,
            "features": [
                "Limited access to financial data",
                "Basic AI summaries",
                f"{settings.SUBSCRIPTION.FREE_PLAN_DAILY_REQUESTS} daily requests"
            ]
        },
        {
            "id": "pro",
            "name": "Pro Plan",
            "price_monthly": 29,
            "price_yearly": 290,
            "features": [
                "Full access to financial data",
                "Advanced AI insights",
                "Deep analysis",
                f"{settings.SUBSCRIPTION.PRO_PLAN_DAILY_REQUESTS} daily requests"
            ],
            "stripe_price_id_monthly": settings.SUBSCRIPTION.STRIPE.STRIPE_PRO_MONTHLY_PRICE_ID,
            "stripe_price_id_yearly": settings.SUBSCRIPTION.STRIPE.STRIPE_PRO_YEARLY_PRICE_ID,
            "lemonsqueezy_variant_id_monthly": settings.SUBSCRIPTION.LEMON_SQUEEZY.LEMON_SQUEEZY_PRO_MONTHLY_VARIANT_ID,
            "lemonsqueezy_variant_id_yearly": settings.SUBSCRIPTION.LEMON_SQUEEZY.LEMON_SQUEEZY_PRO_YEARLY_VARIANT_ID,
            "paddle_plan_id_monthly": settings.SUBSCRIPTION.PADDLE.PADDLE_PRO_MONTHLY_PLAN_ID,
            "paddle_plan_id_yearly": settings.SUBSCRIPTION.PADDLE.PADDLE_PRO_YEARLY_PLAN_ID,
        },
        {
            "id": "team",
            "name": "Team Plan",
            "price_monthly": 99,
            "price_yearly": 990,
            "features": [
                "All Pro features",
                "Multi-user access",
                "Dedicated support",
                f"{settings.SUBSCRIPTION.TEAM_PLAN_DAILY_REQUESTS} daily requests"
            ],
            "stripe_price_id_monthly": settings.SUBSCRIPTION.STRIPE.STRIPE_TEAM_MONTHLY_PRICE_ID,
            "stripe_price_id_yearly": settings.SUBSCRIPTION.STRIPE.STRIPE_TEAM_YEARLY_PRICE_ID,
            "lemonsqueezy_variant_id_monthly": settings.SUBSCRIPTION.LEMON_SQUEEZY.LEMON_SQUEEZY_TEAM_MONTHLY_VARIANT_ID,
            "lemonsqueezy_variant_id_yearly": settings.SUBSCRIPTION.LEMON_SQUEEZY.LEMON_SQUEEZY_TEAM_YEARLY_VARIANT_ID,
            "paddle_plan_id_monthly": settings.SUBSCRIPTION.PADDLE.PADDLE_TEAM_MONTHLY_PLAN_ID,
            "paddle_plan_id_yearly": settings.SUBSCRIPTION.PADDLE.PADDLE_TEAM_YEARLY_PLAN_ID,
        },
        {
            "id": "enterprise",
            "name": "Enterprise Plan",
            "price_monthly": None,
            "price_yearly": None,
            "features": [
                "Custom features",
                "Unlimited requests",
                "On-premise deployment options"
            ],
            "stripe_price_id_monthly": settings.SUBSCRIPTION.STRIPE.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
            "stripe_price_id_yearly": settings.SUBSCRIPTION.STRIPE.STRIPE_ENTERPRISE_YEARLY_PRICE_ID,
            "lemonsqueezy_variant_id_monthly": settings.SUBSCRIPTION.LEMON_SQUEEZY.LEMON_SQUEEZY_ENTERPRISE_MONTHLY_VARIANT_ID,
            "lemonsqueezy_variant_id_yearly": settings.SUBSCRIPTION.LEMON_SQUEEZY.LEMON_SQUEEZY_ENTERPRISE_YEARLY_VARIANT_ID,
            "paddle_plan_id_monthly": settings.SUBSCRIPTION.PADDLE.PADDLE_ENTERPRISE_MONTHLY_PLAN_ID,
            "paddle_plan_id_yearly": settings.SUBSCRIPTION.PADDLE.PADDLE_ENTERPRISE_YEARLY_PLAN_ID,
        }
    ]
    return JSONResponse(content=plans)


@router.post(
    "/create-checkout",
    summary="Create Checkout Session",
    description="Creates a checkout session for a given plan. Requires active subscription to be 'free' or user to be new."
)
async def create_checkout_session(
    request: Request,
    plan_id: str,
    current_user: dict = Depends(get_current_user),
    sub_service: SubscriptionService = Depends(get_subscription_service)
):
    """Creates a checkout session with the selected payment provider."""
    user_id = current_user.get("user_id")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not authenticated")

    # Check if user already has an active subscription (can't create new checkout if already subscribed)
    user_with_sub = await sub_service.get_user_with_subscription(user_id)
    if user_with_sub and user_with_sub.has_active_subscription and user_with_sub.plan != SubscriptionPlan.FREE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already has an active subscription.")

    # Create a new user if not exists (should be handled by auth, but as a fallback)
    if not user_with_sub or not user_with_sub.user:
        user = await sub_service.create_user(email=current_user.get('email'), auth_provider_id=user_id) # Using user_id as auth_provider_id for now
        user_id = str(user.id) # Ensure user_id is the UUID from DB
    else:
        user = user_with_sub.user

    # Lemon Squeezy Checkout URL generálása
    if settings.SUBSCRIPTION.DEFAULT_PROVIDER == PaymentProvider.LEMON_SQUEEZY.value:
        # plan_id itt a Lemon Squeezy Variant ID lesz
        checkout_url = (
            f"https://{settings.SUBSCRIPTION.LEMON_SQUEEZY.LEMON_SQUEEZY_STORE_ID}.lemonsqueezy.com/checkout/buy/{plan_id}"
            f"?checkout[email]={current_user.get('email')}"
            f"&checkout[custom][user_id]={user_id}" # Fontos! Ezt használjuk a webhookban
            f"&embed=1" # Embedding (ha pop-up-ot használsz)
        )
        return {"checkout_url": checkout_url}
    elif settings.SUBSCRIPTION.DEFAULT_PROVIDER == PaymentProvider.STRIPE.value:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Stripe checkout not implemented yet.")
    elif settings.SUBSCRIPTION.DEFAULT_PROVIDER == PaymentProvider.PADDLE.value:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Paddle checkout not implemented yet.")
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payment provider configured.")


@router.post(
    "/trial/start",
    summary="Start Free Trial",
    description="Allows a new user to start a free trial. Requires authentication and no existing active subscription.",
    dependencies=[Depends(require_active_subscription(min_plan=SubscriptionPlan.FREE))] # Ensures user is authenticated but can be free plan
)
async def start_free_trial(
    request: Request,
    current_user: dict = Depends(get_current_user),
    sub_service: SubscriptionService = Depends(get_subscription_service),
    sub_middleware: SubscriptionMiddleware = Depends(get_subscription_middleware)
):
    """Start a free trial for the authenticated user."""
    user_id = current_user.get("user_id")
    user_email = current_user.get("email")

    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not authenticated")
    
    user_with_sub = await sub_service.get_user_with_subscription(user_id)
    
    if user_with_sub and user_with_sub.subscription:
        # Check if they already have an active/trialing subscription
        if user_with_sub.has_active_subscription:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already has an active or trialing subscription.")
        
        # If they have a past subscription, ensure it's not a current trial
        if user_with_sub.subscription.status == SubscriptionStatus.TRIALING and user_with_sub.subscription.trial_end > datetime.utcnow():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Trial already active.")

    # Create a new user if not exists (should be handled by auth, but as a fallback)
    if not user_with_sub or not user_with_sub.user:
        user = await sub_service.create_user(email=user_email, auth_provider_id=user_id) # Using user_id as auth_provider_id for now
        user_id = str(user.id) # Ensure user_id is the UUID from DB
    else:
        user = user_with_sub.user

    # Calculate trial period
    trial_start = datetime.utcnow()
    trial_end = trial_start + timedelta(days=settings.SUBSCRIPTION.TRIAL_DAYS)

    # Create a new trial subscription record
    sub_create = SubscriptionCreate(
        user_id=user_id,
        external_id=f"trial_{user_id}_{int(trial_start.timestamp())}", # Unique ID for trial
        provider=PaymentProvider.STRIPE, # Or any default, as trial is internal
        plan=SubscriptionPlan.PRO, # Trial for Pro features
        status=SubscriptionStatus.TRIALING,
        current_period_start=trial_start,
        current_period_end=trial_end,
        trial_start=trial_start,
        trial_end=trial_end
    )
    await sub_service.create_subscription(sub_create)

    logger.info(f"User {user_id} started a new trial until {trial_end}")
    return JSONResponse(status_code=status.HTTP_200_OK, content={
        "message": "Trial started successfully",
        "trial_end": trial_end.isoformat()
    })
