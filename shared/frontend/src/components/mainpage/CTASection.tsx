import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProGuard } from '../SubscriptionGuard'; // Import ProGuard

export const CTASection: React.FC = () => {
  const navigate = useNavigate();
  const [isStartingTrial, setIsStartingTrial] = useState(false);
  const [trialError, setTrialError] = useState<string | null>(null);

  const handleStartTrial = async () => {
    setIsStartingTrial(true);
    setTrialError(null);
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (!token) {
        navigate('/login?next=/financehub'); // Redirect to login if no token
        return;
      }

      const response = await fetch('/api/v1/subscription/trial/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Trial started:', data);
        navigate('/financehub'); // Redirect to FinanceHub after trial starts
      } else {
        const errorData = await response.json();
        setTrialError(errorData.detail || 'Failed to start trial');
        console.error('Failed to start trial:', errorData);
      }
    } catch (error) {
      setTrialError('Network error or unexpected issue.');
      console.error('Error starting trial:', error);
    } finally {
      setIsStartingTrial(false);
    }
  };

  return (
    <section id="demo" className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Készen Áll a Következő Szintre?
          </h2>
          <p className="text-xl opacity-90 mb-12 leading-relaxed">
            Csatlakozzon több ezer enterprise ügyfélhez, akik már az AEVOREX platformmal 
            optimalizálják üzleti folyamataikat és növelik hatékonyságukat.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <ProGuard
              fallbackPath="/pricing"
              showUpgradeBanner={true}
            >
              <button
                onClick={handleStartTrial}
                disabled={isStartingTrial}
                className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-xl"
              >
                {isStartingTrial ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-2"></div>
                ) : (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                )}
                {isStartingTrial ? 'Indítás folyamatban...' : 'Ingyenes Demo Indítása'}
              </button>
            </ProGuard>
            
            {trialError && <p className="text-red-300 mt-4 text-sm">{trialError}</p>}

            <a
              href="#contact"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-indigo-600 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Kapcsolat Felvétel
            </a>
          </div>

          {/* Platform Access Preview */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-4">Mit kap azonnal?</h3>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Teljes platform hozzáférés</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Élő piaci adatok</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>AI analitikai szolgáltatások</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Magyar nyelvű támogatás</span>
              </div>
            </div>
          </div>

          {/* Trust Indicators (emoji-free, premium look) */}
          <div className="mt-12 text-center opacity-80">
            <p className="text-sm mb-4">Biztonságos és megbízható</p>
            <div className="flex justify-center items-center space-x-8 text-xs">
              <span className="inline-flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 11V7a4 4 0 0 1 8 0v4M6 11h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2z"/>
                </svg>
                SSL Titkosítás
              </span>
              <span className="inline-flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V7l-8-5-8 5v5c0 6 8 10 8 10z"/>
                </svg>
                GDPR Compliant
              </span>
              <span className="inline-flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5"/>
                </svg>
                ISO 27001
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 