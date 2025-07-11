import { useECBSts } from '../../../hooks/macro/useECBSts';

export interface IndicatorConfig {
  key: string;
  title: string;
}

const INDICATORS: IndicatorConfig[] = [
  { key: 'GDP_YOY', title: 'GDP YoY' },
  { key: 'EMPLOYMENT_YOY', title: 'Employment YoY' },
  { key: 'PMI_COMPOSITE', title: 'PMI Composite' },
];

export const useSTSSectionLogic = () => {
  const indicatorKeys = INDICATORS.map((i) => i.key);
  const { data: stsData, metadata, isLoading, error } = useECBSts(indicatorKeys);

  return {
    stsData,
    metadata,
    isLoading,
    isError: Boolean(error),
    indicators: INDICATORS,
  };
}; 