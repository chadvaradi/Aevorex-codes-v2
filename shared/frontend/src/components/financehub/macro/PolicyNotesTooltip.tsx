import React, { useState } from 'react';
import { useECBPolicyNotes, PolicyNote } from '@/hooks/macro/useECBPolicyNotes';

interface PolicyNotesTooltipProps {
  endpoint: string;
  dataPoint: string;
  children: React.ReactNode;
  className?: string;
}

const PolicyNotesTooltip: React.FC<PolicyNotesTooltipProps> = ({ 
  endpoint, 
  dataPoint, 
  children, 
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { data: policyNotes, loading, error } = useECBPolicyNotes();

  // Find relevant policy note for this data point
  const relevantNote = policyNotes?.data?.find((note: PolicyNote) => 
    note.note.toLowerCase().includes(dataPoint.toLowerCase()) ||
    note.note.toLowerCase().includes(endpoint.toLowerCase())
  );

  const handleMouseEnter = () => setIsVisible(true);
  const handleMouseLeave = () => setIsVisible(false);
  const handleClick = () => setIsVisible(!isVisible);

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="cursor-help"
      >
        {children}
      </div>

      {/* Tooltip */}
      {isVisible && (
        <div className="absolute z-50 w-80 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 -top-2 left-full ml-2 transform -translate-y-1/2">
          {/* Arrow */}
          <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 rotate-45"></div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                AI Magyarázat
              </h4>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loading && (
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-500">
                Hiba a magyarázat betöltésekor
              </p>
            )}

            {relevantNote && !loading && !error && (
              <div className="space-y-2">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {relevantNote.note}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Forrás: {relevantNote.source}</span>
                  <span>{relevantNote.date}</span>
                </div>
              </div>
            )}

            {!relevantNote && !loading && !error && (
              <div className="space-y-2">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Ez a {dataPoint} adatpont a legfrissebb EKB policy irányelvek alapján értelmezhető. 
                  A kamatpolitika és a monetáris aggregátumok közötti kapcsolat komplex, 
                  és a piaci várakozások befolyásolják a hozamgörbe alakját.
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <p>• Kamatpolitika: EKB alapkamatok befolyásolják</p>
                  <p>• Infláció: HICP adatok fontosak</p>
                  <p>• Gazdasági növekedés: GDP prognózisok</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyNotesTooltip; 