# Aevorex FinanceHub Előfizetési Rendszer Terv és Implementáció

Ez a dokumentum részletezi az Aevorex FinanceHub moduljának előfizetési és hozzáférés-kezelési rendszerét, a Grok 4 által javasolt háromszintű védelmi modell alapján. Kiemelt figyelmet fordítunk a **Lemon Squeezy** integrációjára mint elsődleges fizetési szolgáltatóra.

## 1. Célkitűzés

A `aevorex.com` főoldal (marketing tartalom) publikus marad, de a prémium funkciók (pl. FinanceHub modul, trial indítása, mélyanalitika API-k) kizárólag aktív előfizetéssel vagy triallal rendelkező felhasználók számára elérhetők. Minimalista, prémium UX és jogi megfelelőség (különösen az EU ÁFA kezelése) a cél.

## 2. Architektúra és Védelmi Szintek

A rendszer három fő védelmi szinten érvényesíti a hozzáférést:

### 2.1. Frontend Védelem (Vite SPA / React)

*   **Leírás:** A felhasználói felületen (SPA) a nem jogosult felhasználók számára tiltjuk a védett oldalak megjelenítését vagy funkciók elérését, átirányítva őket a login/pricing oldalra.
*   **Fájl:** `shared/frontend/src/components/SubscriptionGuard.tsx`
    *   Ez a React komponens a `react-router-dom` `Navigate` komponensét használja az átirányításhoz. Lekérdezi a backend `/api/v1/subscription/check` endpointot a felhasználó státuszáról.
    *   Külön `ProGuard`, `TeamGuard`, `EnterpriseGuard` exportok állnak rendelkezésre a különböző szintű hozzáférésekhez.
*   **Módosítás:** `shared/frontend/src/components/mainpage/CTASection.tsx`
    *   Az "Ingyenes Demo Indítása" gomb most a `ProGuard` komponens alá került, és egy `handleStartTrial` függvénnyel hívja meg a backend `/api/v1/subscription/trial/start` endpointot.

### 2.2. Backend API Védelem (FastAPI)

*   **Leírás:** Minden védett API végponton (pl. FinanceHub adatok, AI analitika) ellenőrizzük a felhasználó autentikációját és az aktív előfizetés státuszát.
*   **Fájlok és funkciók:**
    *   **Modell:** `modules/financehub/backend/models/subscription.py`
        *   Definiálja a `User`, `Subscription`, `WebhookEvent` Pydantic modelleket, valamint az `SubscriptionStatus`, `SubscriptionPlan`, `PaymentProvider` Enumokat.
    *   **Middleware:** `modules/financehub/backend/middleware/subscription_middleware.py`
        *   Tartalmazza a `SubscriptionMiddleware` osztályt, amely FastAPI függőségként használható (`Depends`). Metódusai: `require_active_subscription`, `require_pro_plan`, `check_subscription_status`.
    *   **Szolgáltatás:** `modules/financehub/backend/core/services/subscription_service.py`
        *   Kezeli az adatbázis interakciókat (felhasználók lekérdezése/létrehozása, előfizetések CRUD, webhook események kezelése).
    *   **Endpointok:** `modules/financehub/backend/api/endpoints/subscription/router.py`
        *   `/api/v1/subscription/check` (GET): Ellenőrzi a felhasználó előfizetési státuszát.
        *   `/api/v1/subscription/plans` (GET): Listázza az elérhető előfizetési csomagokat.
        *   `/api/v1/subscription/create-checkout` (POST): Placeholder a fizetési szolgáltató checkout session létrehozására. **Ezt kell majd Lemon Squeezy API hívásokkal kiegészíteni!**
        *   `/api/v1/subscription/trial/start` (POST): Lehetővé teszi egy új felhasználónak, hogy ingyenes trialt indítson.
    *   **Webhookok:** `modules/financehub/backend/api/endpoints/subscription/webhooks.py`
        *   `POST /api/v1/webhooks/lemonsqueezy`: Kezeli a Lemon Squeezy webhook eseményeket (pl. `subscription_created`, `subscription_updated`, `subscription_cancelled`). **A `handle_lemonsqueezy_webhook` függvényben kell elmenteni/frissíteni az előfizetést az adatbázisban a `SubscriptionService` segítségével.**
*   **Konfiguráció:** `modules/financehub/backend/config/subscription.py`
    *   Definiálja a `StripeSettings`, `LemonSqueezySettings`, `PaddleSettings` és a fő `SubscriptionSettings` osztályokat a kulcsok, ID-k és feature flag-ek tárolására. Ezeket környezeti változókból (`.env.local`) olvassa be.

### 2.3. Edge Védelem (Cloudflare Worker)

*   **Leírás:** A Cloudflare hálózatán futó Worker még a kérések backendre való elérése előtt ellenőrzi az autentikációt és az előfizetést, így optimalizálja a forgalmat és fokozza a biztonságot.
*   **Fájl:** `modules/financehub/cloudflare/subscription_worker.js`
    *   **Deployment:** Ezt a fájlt kell feltölteni és konfigurálni a Cloudflare Workers szolgáltatásban. A `checkUrl` változót (jelenleg `http://localhost:8084`) **produkciós környezetben a tényleges backend URL-re kell cserélni!**

## 3. Adatbázis Séma (PostgreSQL)

*   **Fájl:** `modules/financehub/backend/database/sql/create_subscription_tables.sql`
*   **Fontos:** Ezt az SQL fájlt manuálisan kell lefuttatni a PostgreSQL adatbázison a táblák létrehozásához. Példa: `psql -d your_database -f modules/financehub/backend/database/sql/create_subscription_tables.sql`

## 4. Lemon Squeezy Integráció - Készülj fel!

Most, hogy az alapok megvannak, specifikusan a Lemon Squeezy-re fókuszálunk. A következő lépések a Lemon Squeezy konfigurálásához és teszteléséhez szükségesek.

### 4.1. Lemon Squeezy API kulcsok és termék ID-k beállítása

Győződj meg róla, hogy az alábbi környezeti változók definiálva vannak a `.env.local` fájlodban (vagy a produkciós környezeti változókban):

```env
LEMON_SQUEEZY_API_KEY="your_lemon_squeezy_api_key"
LEMON_SQUEEZY_WEBHOOK_SECRET="your_lemon_squeezy_webhook_secret"
LEMON_SQUEEZY_STORE_ID="your_lemon_squeezy_store_id" # Pl. 12345

# Variant ID-k a termékeidhez (ezeket a Lemon Squeezy dashboardon találod)
LEMON_SQUEEZY_PRO_MONTHLY_VARIANT_ID="your_pro_monthly_variant_id"
LEMON_SQUEEZY_PRO_YEARLY_VARIANT_ID="your_pro_yearly_variant_id"
LEMON_SQUEEZY_TEAM_MONTHLY_VARIANT_ID="your_team_monthly_variant_id"
LEMON_SQUEEZY_TEAM_YEARLY_VARIANT_ID="your_team_yearly_variant_id"
LEMON_SQUEEZY_ENTERPRISE_MONTHLY_VARIANT_ID="your_enterprise_monthly_variant_id"
LEMON_SQUEEZY_ENTERPRISE_YEARLY_VARIANT_ID="your_enterprise_yearly_variant_id"

# Általános előfizetési beállítások (modules/financehub/backend/config/subscription.py)
SUBSCRIPTION_ENABLED=true
SUBSCRIPTION_DEFAULT_PROVIDER="lemonsqueezy"
SUBSCRIPTION_TRIAL_DAYS=14 # Ingyenes trial napok száma
SUBSCRIPTION_GRACE_PERIOD_DAYS=3 # Türelmi idő past_due esetén

# API kérések limitek
SUBSCRIPTION_FREE_PLAN_DAILY_REQUESTS=100
SUBSCRIPTION_PRO_PLAN_DAILY_REQUESTS=1000
SUBSCRIPTION_TEAM_PLAN_DAILY_REQUESTS=5000
SUBSCRIPTION_ENTERPRISE_PLAN_DAILY_REQUESTS=50000
```

### 4.2. Lemon Squeezy Webhook beállítása

1.  **Hozd létre a Webhookot a Lemon Squeezy Dashboardon:**
    *   Menj a Lemon Squeezy fiókodba.
    *   Navigálj a **Settings > Webhooks** menüpontra.
    *   Kattints az **+ Add webhook** gombra.
    *   **URL:** Add meg a backend webhook endpointodat. Produkcióban ez valami ilyesmi lesz: `https://your-domain.com/api/v1/webhooks/lemonsqueezy` (fejlesztéshez ngrok vagy hasonló is használható).
    *   **Secret:** Generálj egy titkos kulcsot, és mentsd el a `.env.local` fájlba `LEMON_SQUEEZY_WEBHOOK_SECRET` néven.
    *   **Events:** Válaszd ki az összes `Subscription` eseményt (`Subscription Created`, `Subscription Updated`, `Subscription Cancelled`, `Subscription Paused`, `Subscription Unpaused`, `Subscription Expired`, `Subscription Payment Succeeded`, `Subscription Payment Failed`). Szintén válaszd ki a `Order Created` és `Order Refunded` eseményeket.
    *   Mentsd el a webhookot.

2.  **Frissítsd a backend webhook handler-t:**
    *   A `modules/financehub/backend/api/endpoints/subscription/webhooks.py` fájlban a `handle_lemonsqueezy_webhook` függvényben még `TODO` kommentek vannak.
    *   Implementáld a `SubscriptionService` `upsert_subscription` metódusának hívását itt, hogy az adatbázis frissüljön az események alapján.

    ```python
    # modules/financehub/backend/api/endpoints/subscription/webhooks.py (részlet)
    # ...
    async def handle_lemonsqueezy_webhook(event_data: Dict[str, Any], sub_service: SubscriptionService) -> Dict[str, str]:
        event_name = event_data.get("event_name")
        data = event_data.get("data", {})
        
        # Fontos: itt kell a user_id-t lekérdezni Lemon Squeezy specifikus adatokból
        # Pl. a checkout során átadott custom[user_id] mezőből
        user_id = data.get("meta", {}).get("custom_user_id") # Ha a checkout URL-ben átadtad
        if not user_id:
            logger.error(f"Lemon Squeezy webhook error: user_id not found in meta.custom_user_id for event {event_name}")
            return {"status": "failed", "message": "user_id missing"}

        if event_name in ["subscription_created", "subscription_updated", "subscription_cancelled", "subscription_expired", "subscription_payment_succeeded"]:
            subscription = data.get("attributes", {})
            order = data.get("relationships", {}).get("order", {}).get("data", {}).get("attributes", {}) # order data for dates

            ls_status = subscription.get("status")
            mapped_status = status_mapping.get(ls_status, SubscriptionStatus.INCOMPLETE)
            
            variant_id = subscription.get("variant_id")
            plan = plan_mapping.get(str(variant_id), SubscriptionPlan.PRO)

            # Convert dates
            period_start = datetime.fromisoformat(order.get("created_at").replace("Z", "+00:00")) if order.get("created_at") else datetime.utcnow()
            period_end = datetime.fromisoformat(subscription.get("ends_at").replace("Z", "+00:00")) if subscription.get("ends_at") else (datetime.utcnow() + timedelta(days=30)) # Fallback
            trial_start = datetime.fromisoformat(subscription.get("trial_starts_at").replace("Z", "+00:00")) if subscription.get("trial_starts_at") else None
            trial_end = datetime.fromisoformat(subscription.get("trial_ends_at").replace("Z", "+00:00")) if subscription.get("trial_ends_at") else None

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
            logger.info(f"Lemon Squeezy subscription {event_name}: {subscription.get('id')} - {mapped_status}")
            
        return {"status": "processed"}
    ```

### 4.3. Checkout Session Létrehozása (Backend)

*   **Fájl:** `modules/financehub/backend/api/endpoints/subscription/router.py`
*   **Módosítás:** Implementáld a `create_checkout_session` endpointban a Lemon Squeezy checkout URL generálását.

    ```python
    # modules/financehub/backend/api/endpoints/subscription/router.py (részlet)
    # ...
    @router.post(
        "/create-checkout",
        summary="Create Checkout Session",
        description="Creates a checkout session for a given plan. Requires active subscription to be 'free' or user to be new."
    )
    async def create_checkout_session(
        request: Request,
        plan_id: str, # Ez most a Lemon Squeezy Variant ID
        current_user: dict = Depends(get_current_user),
        sub_service: SubscriptionService = Depends(get_subscription_service)
    ):
        user_id = current_user.get("user_id")
        user_email = current_user.get("email")

        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not authenticated")

        user_with_sub = await sub_service.get_user_with_subscription(user_id)
        if user_with_sub and user_with_sub.has_active_subscription and user_with_sub.plan != SubscriptionPlan.FREE:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already has an active subscription.")

        # Create a new user if not exists (should be handled by auth, but as a fallback)
        if not user_with_sub or not user_with_sub.user:
            user = await sub_service.create_user(email=user_email, auth_provider_id=user_id) # Using user_id as auth_provider_id for now
            user_id = str(user.id) # Ensure user_id is the UUID from DB
        else:
            user = user_with_sub.user

        # Lemon Squeezy Checkout URL generálása
        if settings.SUBSCRIPTION.DEFAULT_PROVIDER == PaymentProvider.LEMON_SQUEEZY.value:
            # plan_id itt a Lemon Squeezy Variant ID lesz
            checkout_url = (
                f"https://{settings.SUBSCRIPTION.LEMON_SQUEEZY.LEMON_SQUEEZY_STORE_ID}.lemonsqueezy.com/checkout/buy/{plan_id}"
                f"?checkout[email]={user_email}"
                f"&checkout[custom][user_id]={user_id}" # Fontos! Ezt használjuk a webhookban
                f"&embed=1" # Embedding (ha pop-up-ot használsz)
            )
            return {"checkout_url": checkout_url}
        else:
            raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail=f"Payment provider {settings.SUBSCRIPTION.DEFAULT_PROVIDER} not fully implemented yet.")

    ```

## 5. Tesztelés

1.  **Adatbázis**: Ellenőrizd, hogy az `users`, `subscriptions`, `webhook_events` táblák létrejöttek (`psql` vagy DBeaver).
2.  **Backend indulás**: Győződj meg róla, hogy a backend hibátlanul indul a frissített konfigurációval és service-ekkel.
3.  **Frontend**: Teszteld a főoldali "Ingyenes Demo Indítása" gombot. Bejelentkezés után el kell indulnia a trialnak, vagy a pricing oldalra kell irányítania.
4.  **Lemon Squeezy Webhook**: Indíts egy test előfizetést a Lemon Squeezy-ben, és ellenőrizd a backend logokat, hogy a webhook esemény sikeresen feldolgozásra került, és az adatbázisban létrejött/frissült az előfizetés. Használj Ngrok-ot fejlesztéshez a webhook URL teszteléséhez.
5.  **Edge Worker**: Telepítsd a Cloudflare Worker-t teszt környezetbe, és ellenőrizd, hogy a védett útvonalak (`/financehub`, `/api/v1/financehub`) valóban csak aktív előfizetéssel érhetők el.

## 6. Hibaelhárítás

*   **Környezeti változók**: Győződj meg róla, hogy az összes `LEMON_SQUEEZY_` kezdetű környezeti változó helyesen van beállítva a `.env.local` fájlban (és produkcióban is).
*   **Webhook Signature Verification**: Ha a webhookok nem működnek, ellenőrizd a secret key-t és a signature verification logikát a `webhooks.py`-ban.
*   **Database connection**: Ellenőrizd a `DATABASE_URL` beállítást és a PostgreSQL szerver elérhetőségét.

Ez a dokumentum élő, és az implementáció előrehaladtával frissülni fog.
