import { useMacroRates } from './useMacroRates';
import { useHistoricalYieldCurve } from './useHistoricalYieldCurve';
import { useBuborRates } from './useBuborRates';

export const useMacroRatesPage = () => {
  const macroRatesData = useMacroRates();
  const historicalYieldCurveData = useHistoricalYieldCurve();
  const buborRatesData = useBuborRates();

  const isLoading = macroRatesData.loading || historicalYieldCurveData.isLoading || buborRatesData.isLoading;
  const error = macroRatesData.error || historicalYieldCurveData.error || (buborRatesData.isError ? 'Error fetching BUBOR rates' : null);

  return {
    macroRates: macroRatesData.rates,
    yieldCurveData: historicalYieldCurveData.yieldCurveData,
    buborRates: buborRatesData.latestBuborRates,
    buborMetadata: buborRatesData.buborData?.metadata,
    isLoading,
    error,
  };
}; 