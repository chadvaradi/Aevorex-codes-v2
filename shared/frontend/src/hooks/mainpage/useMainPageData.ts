import { useState, useEffect, useCallback } from 'react';

export interface PlatformMetrics {
  uptime: number;
  responseTime: string;
  securityGrade: string;
  supportAvailability: string;
}

export interface ModuleStatus {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  icon: string;
  status: 'online' | 'maintenance' | 'offline';
  url: string;
  port: number;
  features: string[];
  metrics: {
    value: string | number;
    label: string;
  }[];
}

export interface CompetitorComparison {
  aevorex: {
    features: string[];
    pricing: {
      min: number;
      max: number;
      currency: string;
    };
    advantages: string[];
  };
  competitors: {
    features: string[];
    pricing: {
      min: number;
      max: number;
      currency: string;
    };
    disadvantages: string[];
  };
}

export interface EnterpriseStats {
  activeUsers: string;
  uptime: string;
  processedData: string;
  support: string;
}

const MOCK_PLATFORM_METRICS: PlatformMetrics = {
  uptime: 99.9,
  responseTime: '< 100ms',
  securityGrade: 'Enterprise',
  supportAvailability: '24/7'
};

const MOCK_MODULE_STATUSES: ModuleStatus[] = [
  {
    id: 'finance',
    name: 'FinanceHub',
    title: 'Finance HUB',
    subtitle: 'Pénzügyi Intelligencia',
    icon: 'dollar-sign',
    status: 'online',
    url: '/stock/AAPL',
    port: 8083,
    features: ['Real-time Data', 'AI Analytics', 'Risk Management'],
    metrics: [
      { value: 500, label: 'Active Trades' },
      { value: '99.8%', label: 'Accuracy' }
    ]
  },
  {
    id: 'health',
    name: 'HealthHub',
    title: 'Health HUB',
    subtitle: 'Egészségügyi AI',
    icon: 'activity',
    status: 'online',
    url: '/healthhub',
    port: 8083,
    features: ['Medical AI', 'Diagnostic Support', 'Patient Monitoring'],
    metrics: [
      { value: '98%', label: 'Accuracy' },
      { value: '24/7', label: 'Monitoring' }
    ]
  },
  {
    id: 'content',
    name: 'ContentHub',
    title: 'Content HUB',
    subtitle: 'Tartalomkezelés',
    icon: 'file-text',
    status: 'online',
    url: '/content-hub',
    port: 8083,
    features: ['CMS', 'SEO Optimization', 'Multi-media Management'],
    metrics: [
      { value: 1200, label: 'Assets' },
      { value: '95%', label: 'SEO Score' }
    ]
  },
  {
    id: 'ai',
    name: 'AIHub',
    title: 'AI HUB',
    subtitle: 'Mesterséges Intelligencia',
    icon: 'cpu',
    status: 'online',
    url: '/ai-hub',
    port: 8083,
    features: ['ML Models', 'NLP', 'Computer Vision'],
    metrics: [
      { value: '50+', label: 'AI Models' },
      { value: '99.9%', label: 'Uptime' }
    ]
  }
];

const MOCK_COMPETITOR_COMPARISON: CompetitorComparison = {
  aevorex: {
    features: [
      '4 modul 1 platformon - azonnal integrálva',
      'Egy bejelentkezés, egy felület, egy számla',
      'Magyar fejlesztés, helyi support',
      'Teljes költség: €2,000-5,000/hó',
      '2 hét alatt éles, nincs integrációs pokol'
    ],
    pricing: { min: 2000, max: 5000, currency: 'EUR' },
    advantages: ['Azonnali ROI', '10x Olcsóbb', 'Magyar Csapat']
  },
  competitors: {
    features: [
      '4 külön szolgáltatás, nincs integráció',
      '4 különböző bejelentkezés és felület',
      'Csak angol support, időzóna problémák',
      'Teljes költség: €15,000-50,000/hó',
      '6-12 hónap integráció, dev team kell'
    ],
    pricing: { min: 15000, max: 50000, currency: 'EUR' },
    disadvantages: ['Complex Setup', 'Hidden Costs', 'Long Implementation']
  }
};

const MOCK_ENTERPRISE_STATS: EnterpriseStats = {
  activeUsers: '10,000+',
  uptime: '99.9%',
  processedData: '50PB+',
  support: '24/7'
};

export const useMainPageData = () => {
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics>(MOCK_PLATFORM_METRICS);
  const [moduleStatuses, setModuleStatuses] = useState<ModuleStatus[]>(MOCK_MODULE_STATUSES);
  const [competitorComparison, setCompetitorComparison] = useState<CompetitorComparison>(MOCK_COMPETITOR_COMPARISON);
  const [enterpriseStats, setEnterpriseStats] = useState<EnterpriseStats>(MOCK_ENTERPRISE_STATS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchPlatformData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Simulate API calls - in real implementation, these would be actual endpoints
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Platform metrics would come from monitoring API
      // const metricsResponse = await fetch('/api/v1/platform/metrics');
      // const metrics = await metricsResponse.json();
      
      // Module statuses would come from health check API
      // const statusResponse = await fetch('/api/v1/modules/status');
      // const statuses = await statusResponse.json();
      
      // Use mock data for now
      setPlatformMetrics(MOCK_PLATFORM_METRICS);
      setModuleStatuses(MOCK_MODULE_STATUSES);
      setCompetitorComparison(MOCK_COMPETITOR_COMPARISON);
      setEnterpriseStats(MOCK_ENTERPRISE_STATS);
      
    } catch (error) {
      console.error('Failed to fetch platform data:', error);
      // Keep mock data as fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlatformData();
  }, [fetchPlatformData]);

  return {
    platformMetrics,
    moduleStatuses,
    competitorComparison,
    enterpriseStats,
    isLoading,
    refetchData: fetchPlatformData
  };
}; 