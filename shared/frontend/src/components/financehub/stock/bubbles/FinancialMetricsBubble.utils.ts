export const formatValue = (
  value: number | undefined,
  suffix: string = '',
  prefix: string = ''
): string => {
  if (value === undefined || value === null || Number.isNaN(value)) return 'N/A';
  const abs = Math.abs(value);
  try {
    // Use compact notation for large numbers to avoid UI overflow/overlap
    if (abs >= 10_000) {
      const compact = new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 2,
      }).format(value);
      return `${prefix}${compact}${suffix}`;
    }
    // For smaller numeric ratios use up to 3 fraction digits
    const normal = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 3,
    }).format(value);
    return `${prefix}${normal}${suffix}`;
  } catch {
    return `${prefix}${value}${suffix}`;
  }
};

export const formatPercentage = (value: number | undefined): string => {
    if (value === undefined || value === null) return 'N/A';
    return `${(value * 100).toFixed(2)}%`;
};

export const formatBeta = (beta: number | undefined): string => {
    if (beta === undefined || beta === null) return 'N/A';
    return beta.toFixed(2);
};

export const getESGRiskColor = (riskLevel: string | undefined): string => {
    switch (riskLevel) {
        case 'Low': return 'text-green-600';
        case 'Medium': return 'text-yellow-600';
        case 'High': return 'text-orange-600';
        case 'Severe': return 'text-red-600';
        default: return 'text-gray-500';
    }
}; 