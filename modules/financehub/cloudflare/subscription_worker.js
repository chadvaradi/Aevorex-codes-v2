// modules/financehub/cloudflare/subscription_worker.js

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  // Define protected paths and API endpoints
  // All /financehub routes (for the frontend SPA)
  // All /api/v1/financehub routes (for the backend API, excluding public ones like /check or auth)
  const protectedPaths = [/^\/financehub\b/, /^\/api\/v1\/financehub\b/];
  const publicApiPaths = ['/api/v1/auth/login', '/api/v1/auth/callback', '/api/v1/auth/refresh', '/api/v1/subscription/check', '/api/v1/subscription/plans']; // Add other public API endpoints if any

  const isProtectedPath = protectedPaths.some(regex => regex.test(url.pathname));
  const isPublicApiPath = publicApiPaths.includes(url.pathname);

  // If it's not a protected path, or it's a public API path, let it pass through
  if (!isProtectedPath || isPublicApiPath) {
    return fetch(request);
  }

  // Get the authentication token from headers or cookies
  let token = request.headers.get('Authorization');
  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7); // Remove 'Bearer ' prefix
  } else {
    // Try to get token from a cookie, if your frontend stores it there
    const cookieHeader = request.headers.get('Cookie');
    const cookies = cookieHeader ? Object.fromEntries(cookieHeader.split('; ').map(c => c.split('='))) : {};
    token = cookies.auth_token || cookies.session_token; // Adjust cookie name as needed
  }

  // If no token, redirect to login
  if (!token) {
    return Response.redirect(`/login?next=${encodeURIComponent(url.pathname)}`, 302);
  }

  // Call the backend /api/v1/subscription/check endpoint to verify token and subscription status
  const checkUrl = `http://localhost:8084/api/v1/subscription/check`; // Or your production backend URL
  
  try {
    const authCheckResponse = await fetch(checkUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (authCheckResponse.status === 401) {
      // Token invalid or expired, redirect to login
      return Response.redirect(`/login?next=${encodeURIComponent(url.pathname)}`, 302);
    }

    const subscriptionData = await authCheckResponse.json();

    if (!subscriptionData.has_active_subscription) {
      // No active subscription, redirect to pricing
      return Response.redirect('/pricing', 302);
    }

    // If authenticated and has active subscription, proceed with the original request
    // Ensure the original headers are passed, especially auth headers
    const newHeaders = new Headers(request.headers);
    newHeaders.set('X-User-ID', subscriptionData.user_id); // Example: pass user ID to backend
    newHeaders.set('X-User-Plan', subscriptionData.plan); // Example: pass user plan to backend
    
    const modifiedRequest = new Request(request, { headers: newHeaders });
    return fetch(modifiedRequest);

  } catch (error) {
    // Log error and redirect to an error page or login
    console.error('Cloudflare Worker subscription check failed:', error);
    return Response.redirect('/error', 302); // Or a generic error page
  }
}
