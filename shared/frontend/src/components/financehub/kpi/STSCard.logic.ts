export interface KPIProps {
  title: string;
  indicatorKey: string;
  stsData: Record<string, Record<string, number>>; // date→indicator→value
}

export const useKpiValue = ({ indicatorKey, stsData }: { indicatorKey: string; stsData: KPIProps['stsData']; }) => {
  const dates = Object.keys(stsData).sort();
  const latestDate = dates[dates.length - 1];
  const prevDate = dates[dates.length - 2];

  const latestVal = latestDate ? stsData[latestDate]?.[indicatorKey] : undefined;
  const prevVal = prevDate ? stsData[prevDate]?.[indicatorKey] : undefined;

  let delta: number | undefined;
  if (latestVal !== undefined && prevVal !== undefined) {
    delta = latestVal - prevVal;
  }

  return {
    latestVal,
    delta,
    latestDate,
  };
}; 