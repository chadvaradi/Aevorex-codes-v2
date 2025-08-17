import React from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../../hooks/ui/useNotification';

export const CTASection: React.FC = () => {
  const { showNotification } = useNotification();

  const handleDemoRequest = () => {
    // Mock demo request
    showNotification('Demo kérés elküldve! Hamarosan felvesszük Önnel a kapcsolatot.', 'success');
  };

  const handleEnterpriseContact = () => {
    // Mock enterprise contact
    showNotification('Enterprise kapcsolat iniciált! Sales csapatunk jelentkezni fog.', 'info');
  };

  return (
    <section className="py-20 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-white/10 to-transparent rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Kezdje el AI-vezérelt tartalomgyártását
          </h2>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto leading-relaxed">
            Csatlakozzon több ezer vállalkozáshoz, akik már a ContentHub-bal forradalmasítják content stratégiájukat
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Start Trial Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Ingyenes próba</h3>
              <p className="text-purple-100">
                Próbálja ki minden funkciót 14 napig, fizetési kötelezettség nélkül
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Minden Content Studio hozzáférés</span>
              </div>
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>AI-generált tartalom korlátlan</span>
              </div>
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>12 platform integráció</span>
              </div>
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Premium support & onboarding</span>
              </div>
            </div>

            <button 
              onClick={handleDemoRequest}
              className="w-full py-4 px-6 bg-white text-purple-600 font-bold rounded-xl hover:bg-gray-100 transition-colors transform hover:scale-105 duration-200"
            >
              14 napos próba indítása
              <svg className="inline-block w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5-5 5m-6-5h11" />
              </svg>
            </button>
          </div>

          {/* Enterprise Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Enterprise csomag</h3>
              <p className="text-purple-100">
                Testreszabott megoldások nagyvállalatoknak és ügynökségeknek
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Minden Pro funkció + custom fejlesztés</span>
              </div>
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Dedikált account manager</span>
              </div>
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>API integráció & white-label</span>
              </div>
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>SLA garancia & 24/7 support</span>
              </div>
            </div>

            <button 
              onClick={handleEnterpriseContact}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-colors transform hover:scale-105 duration-200 border border-white/20"
            >
              Sales csapat elérése
              <svg className="inline-block w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="mt-16 text-center">
          <p className="text-purple-100 mb-6">
            Vagy fedezze fel a különböző stúdiókat egyenként
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/content-hub/social-media" 
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              Social Media Studio
            </Link>
            <Link 
              to="/content-hub/newsletter" 
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              Newsletter Creator
            </Link>
            <Link 
              to="/content-hub/visual" 
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              Visual Studio
            </Link>
            <Link 
              to="/content-hub/analytics" 
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              Analytics Hub
            </Link>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-white mb-1">99.9%</div>
            <div className="text-purple-200 text-sm">Uptime</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-1">8,000+</div>
            <div className="text-purple-200 text-sm">Active Users</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-1">1.2M</div>
            <div className="text-purple-200 text-sm">Content Generated</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-1">12</div>
            <div className="text-purple-200 text-sm">Platform Integrations</div>
          </div>
        </div>
      </div>
    </section>
  );
}; 