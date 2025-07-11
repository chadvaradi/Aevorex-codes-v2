export interface DataPoint {
  label: string;
  value: number;
  unit: string;
  change?: number;
}

export interface ECBDataCategory {
  [seriesName: string]: Record<string, number>;
}

export interface ECBComprehensiveData {
  monetary_aggregates?: ECBDataCategory;
  inflation?: ECBDataCategory;
  employment?: ECBDataCategory;
  growth?: ECBDataCategory;
  business?: ECBDataCategory;
}

export const formatValue = (value: number, unit: string): string => {
  if (unit === '%') {
    return `${value.toFixed(2)}%`;
  } else if (unit === 'billion EUR') {
    return `€${(value / 1000).toFixed(1)}B`;
  } else {
    return value.toFixed(2);
  }
};

export const getLatestValue = (categoryData: ECBDataCategory, seriesName: string): number | null => {
  if (!categoryData || !categoryData[seriesName]) return null;
  const dates = Object.keys(categoryData[seriesName]).sort();
  if (dates.length === 0) return null;
  return categoryData[seriesName][dates[dates.length - 1]];
};

export const extractDataPoints = (data: ECBComprehensiveData): DataPoint[] => {
  const dataPoints: DataPoint[] = [];

  // Monetary Aggregates
  if (data.monetary_aggregates) {
    const m1 = getLatestValue(data.monetary_aggregates, 'M1');
    const m2 = getLatestValue(data.monetary_aggregates, 'M2');
    const m3 = getLatestValue(data.monetary_aggregates, 'M3');
    
    if (m1) dataPoints.push({ label: 'M1 Money Supply', value: m1, unit: 'billion EUR' });
    if (m2) dataPoints.push({ label: 'M2 Money Supply', value: m2, unit: 'billion EUR' });
    if (m3) dataPoints.push({ label: 'M3 Money Supply', value: m3, unit: 'billion EUR' });
  }

  // Inflation Indicators
  if (data.inflation) {
    const hicp = getLatestValue(data.inflation, 'HICP_Overall');
    const core = getLatestValue(data.inflation, 'HICP_Core');
    const energy = getLatestValue(data.inflation, 'HICP_Energy');
    
    if (hicp) dataPoints.push({ label: 'HICP Inflation', value: hicp, unit: '%' });
    if (core) dataPoints.push({ label: 'Core HICP', value: core, unit: '%' });
    if (energy) dataPoints.push({ label: 'Energy HICP', value: energy, unit: '%' });
  }

  // Employment Indicators
  if (data.employment) {
    const unemployment = getLatestValue(data.employment, 'Unemployment_Rate');
    const employment = getLatestValue(data.employment, 'Employment_Rate');
    
    if (unemployment) dataPoints.push({ label: 'Unemployment Rate', value: unemployment, unit: '%' });
    if (employment) dataPoints.push({ label: 'Employment Rate', value: employment, unit: '%' });
  }

  // GDP Growth
  if (data.growth) {
    const gdp = getLatestValue(data.growth, 'GDP_Growth');
    if (gdp) dataPoints.push({ label: 'GDP Growth', value: gdp, unit: '%' });
  }

  // Business Confidence
  if (data.business) {
    const confidence = getLatestValue(data.business, 'Business_Confidence');
    if (confidence) dataPoints.push({ label: 'Business Confidence', value: confidence, unit: 'index' });
  }

  return dataPoints;
}; 