import React from 'react';
import type { CompetitorComparison } from '../../hooks/mainpage/useMainPageData';

interface CompetitiveSectionProps {
  comparison: CompetitorComparison;
}

export const CompetitiveSection: React.FC<CompetitiveSectionProps> = ({ comparison }) => {
  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-indigo-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Miért AEVOREX, és Nem OpenAI + Salesforce + AWS?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            A nagy technológiai cégek szétosztott megoldásaival szemben mi teljes integrációt kínálunk.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* AEVOREX Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl border-2 border-green-200 dark:border-green-800 relative">
            <div className="absolute -top-4 left-8 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold">
              Recommended
            </div>
            
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">AEVOREX Platform</h3>
                <p className="text-gray-600 dark:text-gray-400">Integrált Enterprise Megoldás</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {comparison.aevorex.features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  €{comparison.aevorex.pricing.min.toLocaleString()}-{comparison.aevorex.pricing.max.toLocaleString()}
                  <span className="text-lg text-gray-500">/month</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Minden benne, transzparens ár</p>
              </div>
            </div>
          </div>

          {/* Competitors Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 relative opacity-90">
            <div className="absolute -top-4 left-8 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">
              Complex Setup
            </div>
            
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mr-4">
                <div className="text-xs text-gray-600 dark:text-gray-400 text-center font-mono">
                  <div>OpenAI</div>
                  <div>+Others</div>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Hagyományos Megközelítés</h3>
                <p className="text-gray-600 dark:text-gray-400">Több szolgáltató, széttöredezett</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {comparison.competitors.features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                  €{comparison.competitors.pricing.min.toLocaleString()}-{comparison.competitors.pricing.max.toLocaleString()}
                  <span className="text-lg text-gray-500">/month</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-2">+ integrációs költségek, rejtett díjak</p>
              </div>
            </div>
          </div>
        </div>

        {/* Value Propositions */}
        <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
          {comparison.aevorex.advantages.map((advantage, index) => (
            <div key={index} className="text-center bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{advantage}</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{getAdvantageDescription(advantage)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const getAdvantageDescription = (advantage: string): string => {
  const descriptions = {
    'Azonnali ROI': 'Míg a versenytársak 6-12 hónapos projektet jelentenek, mi 2 hét alatt élesben használható rendszert adunk.',
    '10x Olcsóbb': 'A hagyományos enterprise stack évi €180k-600k helyett nálunk €24k-60k - ugyanazzal a funkcionalitással.',
    'Magyar Csapat': 'Helyi időzóna, magyar nyelvű support, EU GDPR compliance és valódi partnerség egy phone call-ra.'
  };
  return descriptions[advantage as keyof typeof descriptions] || 'Versenyelőny az AEVOREX platformmal.';
}; 