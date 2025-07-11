import { useMemo } from 'react';
import { useBuborRates } from '@/hooks/macro/useBuborRates';

type FlatRate = {
  date: string;
  tenor: string;
  rate: number;
};

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="py-2 px-4 border-b border-gray-200 dark:border-gray-700"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div></td>
    <td className="py-2 px-4 border-b border-gray-200 dark:border-gray-700"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div></td>
    <td className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 text-right"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 ml-auto"></div></td>
  </tr>
);

const MacroRatesTable = () => {
  const { buborData, isLoading, isError, error } = useBuborRates();

  const flattenedRates = useMemo(() => {
    if (!buborData?.rates) return [];
    const flatList: FlatRate[] = [];
    Object.entries(buborData.rates).forEach(([date, tenors]: [string, { [tenor: string]: number }]) => {
      Object.entries(tenors).forEach(([tenor, rate]: [string, number]) => {
        flatList.push({ date, tenor, rate });
      });
    });
    // Sort by date descending, then by tenor
    return flatList.sort((a, b) => {
        if (a.date > b.date) return -1;
        if (a.date < b.date) return 1;
        if (a.tenor > b.tenor) return 1;
        if (a.tenor < b.tenor) return -1;
        return 0;
    });
  }, [buborData]);

  if (isLoading) {
    return (
      <div className="overflow-x-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">BUBOR Rate History</h3>
        <table className="min-w-full bg-white dark:bg-gray-800">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-left text-gray-600 dark:text-gray-300">Date</th>
              <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-left text-gray-600 dark:text-gray-300">Tenor</th>
              <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-right text-gray-600 dark:text-gray-300">Rate (%)</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(10)].map((_, i) => <SkeletonRow key={i} />)}
          </tbody>
        </table>
      </div>
    );
  }

  if (isError) {
    return <div className="text-center p-4 text-red-500 dark:text-red-400">Error fetching BUBOR rates: {error?.message}</div>;
  }

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">BUBOR Rate History</h3>
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-left text-gray-600 dark:text-gray-300">Date</th>
            <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-left text-gray-600 dark:text-gray-300">Tenor</th>
            <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-right text-gray-600 dark:text-gray-300">Rate (%)</th>
          </tr>
        </thead>
        <tbody>
          {flattenedRates.map((rate: FlatRate, index: number) => (
            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200">{rate.date}</td>
              <td className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200">{rate.tenor}</td>
              <td className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 text-right text-gray-800 dark:text-gray-200">{rate.rate.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MacroRatesTable;
