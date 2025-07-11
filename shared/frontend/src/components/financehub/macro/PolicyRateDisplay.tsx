import React from 'react';
import { PolicyRate, formatRate } from './ECBPolicyRatesCard.logic';

export const PolicyRateDisplay: React.FC<{ rate: PolicyRate }> = ({ rate }) => (
  <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/20">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center space-x-2">
        <span className="text-lg">{rate.icon}</span>
        <p className="text-sm font-medium text-content-secondary">
          {rate.name}
        </p>
      </div>
    </div>
    <p className="text-2xl font-bold text-primary mb-1">
      {formatRate(rate.value)}
    </p>
    <p className="text-xs text-content-tertiary">
      {rate.description}
    </p>
  </div>
); 