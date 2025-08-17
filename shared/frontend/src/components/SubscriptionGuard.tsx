import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface SubscriptionStatus {
  user_id: string;
  has_active_subscription: boolean;
  plan: 'free' | 'pro' | 'team' | 'enterprise';
  status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid';
  current_period_end?: string;
  trial_end?: string;
}

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiredPlan?: 'free' | 'pro' | 'team' | 'enterprise';
  fallbackPath?: string;
  showUpgradeBanner?: boolean;
}

const planHierarchy = {
  free: 0,
  pro: 1,
  team: 2,
  enterprise: 3,
};

const checkPlanAccess = (userPlan: string, requiredPlan: string): boolean => {
  const userLevel = planHierarchy[userPlan as keyof typeof planHierarchy] || 0;
  const requiredLevel = planHierarchy[requiredPlan as keyof typeof planHierarchy] || 0;
  return userLevel >= requiredLevel;
};

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
  children,
  requiredPlan = 'free',
  fallbackPath = '/pricing',
  showUpgradeBanner = true,
}) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        // Get auth token from localStorage or context
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        
        if (!token) {
          setError('No authentication token found');
          setIsLoading(false);
          return;
        }

        // Call subscription check endpoint
        const response = await fetch('/api/v1/subscription/check', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError('Authentication required');
          } else if (response.status === 402) {
            setError('Payment required');
          } else {
            setError('Failed to check subscription status');
          }
          setIsLoading(false);
          return;
        }

        const data: SubscriptionStatus = await response.json();
        setSubscriptionStatus(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Subscription check failed:', err);
        setError('Failed to check subscription status');
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Checking subscription...</span>
      </div>
    );
  }

  // Handle errors
  if (error) {
    if (error === 'Authentication required') {
      return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
    }
    if (error === 'Payment required') {
      return <Navigate to={fallbackPath} replace />;
    }
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Subscription Check Failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Check if user has required plan
  if (subscriptionStatus && !checkPlanAccess(subscriptionStatus.plan, requiredPlan)) {
    if (showUpgradeBanner) {
      return (
        <div className="min-h-screen">
          {/* Upgrade Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Upgrade Required</h3>
                <p className="text-blue-100">
                  This feature requires a {requiredPlan} plan or higher.
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 border border-white text-white rounded hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={() => window.location.href = fallbackPath}
                  className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-gray-100 transition-colors"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
          
          {/* Content with overlay */}
          <div className="relative">
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
              <div className="bg-white rounded-lg p-8 max-w-md text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Feature Locked
                </h3>
                <p className="text-gray-600 mb-6">
                  This feature is only available for {requiredPlan} subscribers and above.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => window.location.href = fallbackPath}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    View Plans
                  </button>
                  <button
                    onClick={() => window.history.back()}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
            {children}
          </div>
        </div>
      );
    }
    
    return <Navigate to={fallbackPath} replace />;
  }

  // Check if subscription is active (for non-free plans)
  if (requiredPlan !== 'free' && subscriptionStatus && !subscriptionStatus.has_active_subscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Subscription Required</h2>
          <p className="text-gray-600 mb-6">
            Your subscription is not active. Please check your payment status or contact support.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/account/billing'}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Manage Billing
            </button>
            <button
              onClick={() => window.location.href = fallbackPath}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              View Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  // All checks passed, render children
  return <>{children}</>;
};

// Convenience components for different plan levels
export const ProGuard: React.FC<Omit<SubscriptionGuardProps, 'requiredPlan'>> = (props) => (
  <SubscriptionGuard {...props} requiredPlan="pro" />
);

export const TeamGuard: React.FC<Omit<SubscriptionGuardProps, 'requiredPlan'>> = (props) => (
  <SubscriptionGuard {...props} requiredPlan="team" />
);

export const EnterpriseGuard: React.FC<Omit<SubscriptionGuardProps, 'requiredPlan'>> = (props) => (
  <SubscriptionGuard {...props} requiredPlan="enterprise" />
);

// Hook for subscription status
export const useSubscription = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/v1/subscription/check', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data: SubscriptionStatus = await response.json();
          setSubscriptionStatus(data);
        }
      } catch (err) {
        console.error('Subscription check failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, []);

  return { subscriptionStatus, isLoading };
};
