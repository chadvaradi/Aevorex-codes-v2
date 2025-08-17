import useSWR from 'swr';
import api from '@/lib/api';

const API_ENDPOINT = '/api/v1/macro/fixing-rates/';

// Enhanced metadata structure from backend
interface DataSources {
    ecb_estr: string;
    euribor: string;
    bubor: string;
}

interface ReferenceDates {
    ecb_estr: string;
    euribor: string;
    bubor: string;
}

interface DataFreshness {
    last_updated: string;
    cache_status: string;
    sla_warning?: string;
}

interface DataQuality {
    decimal_precision: number;
    ecb_availability: boolean;
    bubor_availability: boolean;
    complete_dataset: boolean;
}

interface Licensing {
    ecb_estr: string;
    euribor: string;
    bubor: string;
}

// Backend fixing-rates endpoint response structure with enhanced metadata
export interface FixingRatesBackendResponse {
    status: string;
    date: string;
    data: {
        ecb_euribor: { [period: string]: number };  // ON: €STR, others: Euribor
        bubor: { [period: string]: number | null };
    };
    metadata: {
        sources: DataSources;
        reference_dates: ReferenceDates;
        data_freshness: DataFreshness;
        data_quality: DataQuality;
        licensing: Licensing;
        aliases: { [key: string]: string };
    };
}

// Frontend compatible structure for components
export interface DailyFixingRates {
    ecb_rate: number | null;
    bubor_rate: number | null;
}

export interface RawFixingRatesData {
    [date: string]: DailyFixingRates;
}

export interface FixingRatesMetadata {
    sources: DataSources;
    reference_dates: ReferenceDates;
    data_freshness: DataFreshness;
    data_quality: DataQuality;
    licensing: Licensing;
    aliases: { [key: string]: string };
}

const fetcher = async (url: string): Promise<FixingRatesBackendResponse> => {
    const response = await api.get<FixingRatesBackendResponse>(url);
    // API returns the data directly for this endpoint
    return response as unknown as FixingRatesBackendResponse;
};

export const useFixingRates = () => {
    // Always fetch live data - no mock/fallback allowed
    const params = new URLSearchParams();
    params.set('force_live', 'true');
    
    const { data, error, isLoading } = useSWR<FixingRatesBackendResponse>(
        `${API_ENDPOINT}?${params.toString()}`, 
        fetcher,
        {
            // Always refresh frequently for real-time data
            refreshInterval: 15000, // 15 seconds refresh
            // No deduping for always-fresh data
            dedupingInterval: 0,
            // Disable cache for live data
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
        }
    );

    // Transform backend data to the format expected by components
    const transformedData = data?.data ? {
        [data.date]: {
            'ON': {
                ecb_rate: data.data.ecb_euribor?.['ON'] || null,
                bubor_rate: data.data.bubor?.['O/N'] || null
            },
            '1W': {
                ecb_rate: data.data.ecb_euribor?.['1W'] || null,
                bubor_rate: data.data.bubor?.['1W'] || null
            },
            '1M': {
                ecb_rate: data.data.ecb_euribor?.['1M'] || null,
                bubor_rate: data.data.bubor?.['1M'] || null
            },
            '3M': {
                ecb_rate: data.data.ecb_euribor?.['3M'] || null,
                bubor_rate: data.data.bubor?.['3M'] || null
            },
            '6M': {
                ecb_rate: data.data.ecb_euribor?.['6M'] || null,
                bubor_rate: data.data.bubor?.['6M'] || null
            },
            '12M': {
                ecb_rate: data.data.ecb_euribor?.['12M'] || null,
                bubor_rate: data.data.bubor?.['12M'] || null
            }
        }
    } : {};

    return {
        fixingRatesData: transformedData,
        rawBackendData: data, // Direct access to backend response
        metadata: data?.metadata || null,
        isLoading,
        error: error ? error.message : null,
    };
};
