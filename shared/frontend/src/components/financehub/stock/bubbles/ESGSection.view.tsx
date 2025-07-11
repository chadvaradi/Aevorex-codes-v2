import React from 'react';
import { getESGRiskColor } from './FinancialMetricsBubble.utils';

interface Overview {
  esg_score?: number;
  esg_rating?: string;
  esg_risk_level?: string;
  environmental_score?: number;
  social_score?: number;
  governance_score?: number;
}

/**
 * NOTE: ESG data (rating/score) is OPTIONAL in current UI. The backend can
 * supply it, **BUT** our external data source requires a separate API key
 * that we don't yet have in non-production environments. Therefore this
 * component gracefully hides when the values are missing. Keep the section
 * for future enablement – do NOT remove.  (See FinanceHub rule set.)
 */
const ESGSection: React.FC<{ overview: Overview }> = ({ overview }) => {
  if (!overview?.esg_score && !overview?.esg_rating) return null;

  const score = overview.esg_score ?? 0;
  const progressWidth = `${Math.min(Math.max(score, 0), 100)}%`;

  return (
    <div className="space-y-3 mb-4">
      <h4 className="text-sm font-medium text-content-secondary border-b border-border-subtle pb-1 flex items-center gap-2">
        ESG Metrics
        {overview.esg_rating && (
          <span
            className="inline-flex items-center rounded-md bg-success-600/10 px-1.5 py-0.5 text-xxs font-semibold text-success-700 uppercase tracking-wider"
            aria-label={`ESG rating ${overview.esg_rating}`}
          >
            {overview.esg_rating}
          </span>
        )}
      </h4>

      <div className="space-y-2" role="group" aria-label="ESG Scores">
        {overview.esg_score !== undefined && (
          <div className="w-full" aria-label="Overall ESG score">
            <div className="flex justify-between text-xxs leading-none text-content-tertiary">
              <span>0</span>
              <span>100</span>
            </div>
            <div
              className="h-2 rounded bg-surface-subtle mt-1"
              role="progressbar"
              aria-valuenow={score}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-full rounded bg-success-600" style={{ width: progressWidth }} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-sm mt-2">
          {overview.esg_risk_level && (
            <div>
              <span className="text-content-tertiary">Risk Level:</span>
              <span className={`ml-2 font-medium ${getESGRiskColor(overview.esg_risk_level)}`}>{overview.esg_risk_level}</span>
            </div>
          )}
          {overview.environmental_score && (
            <div>
              <span className="text-content-tertiary">Environmental:</span>
              <span className="ml-2 text-content-primary font-medium">{overview.environmental_score}/100</span>
            </div>
          )}
          {overview.social_score && (
            <div>
              <span className="text-content-tertiary">Social:</span>
              <span className="ml-2 text-content-primary font-medium">{overview.social_score}/100</span>
            </div>
          )}
          {overview.governance_score && (
            <div>
              <span className="text-content-tertiary">Governance:</span>
              <span className="ml-2 text-content-primary font-medium">{overview.governance_score}/100</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ESGSection; 