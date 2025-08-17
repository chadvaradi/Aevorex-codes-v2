import { useState, useEffect, useCallback } from 'react';

export interface HealthMetric {
  id: string;
  title: string;
  value: string;
  unit: string;
  trend: 'positive' | 'negative' | 'neutral';
  trendValue: string;
  subtitle: string;
  isPrimary?: boolean;
}

export interface AIInsight {
  id: string;
  type: 'risk-alert' | 'optimization' | 'trend-analysis';
  title: string;
  description: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  metrics: {
    label: string;
    value: string;
    isWarning?: boolean;
  }[];
}

export interface HealthcareFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  capabilities: string[];
  category: 'population' | 'clinical' | 'operational';
}

export interface ComplianceFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'security' | 'regulatory' | 'certification';
}

const MOCK_HEALTH_METRICS: HealthMetric[] = [
  {
    id: 'health-risk-score',
    title: 'Health Risk Score',
    value: '7.2',
    unit: '/10',
    trend: 'positive',
    trendValue: '12% improvement',
    subtitle: 'Population average (10,847 patients)',
    isPrimary: true
  },
  {
    id: 'preventable-hospitalizations',
    title: 'Preventable Hospitalizations',
    value: '156',
    unit: 'cases',
    trend: 'positive',
    trendValue: '23% reduction',
    subtitle: 'vs. 203 last month'
  },
  {
    id: 'care-adherence',
    title: 'Care Adherence Rate',
    value: '84.3',
    unit: '%',
    trend: 'positive',
    trendValue: '8% increase',
    subtitle: 'Medication & treatment compliance'
  },
  {
    id: 'cost-per-patient',
    title: 'Cost per Patient',
    value: '$3,247',
    unit: 'avg',
    trend: 'positive',
    trendValue: '15% reduction',
    subtitle: 'Monthly healthcare spend'
  }
];

const MOCK_AI_INSIGHTS: AIInsight[] = [
  {
    id: 'diabetes-risk-alert',
    type: 'risk-alert',
    title: 'Diabetes Risk Spike in 45-65 Age Group',
    description: 'Analysis of 2,847 patient records shows 23% increase in pre-diabetic markers. Recommend targeted intervention program for high-risk cohort.',
    confidence: 94,
    priority: 'high',
    metrics: [
      { label: 'Affected Patients', value: '2,847' },
      { label: 'Risk Level', value: 'High', isWarning: true },
      { label: 'Potential Savings', value: '$1.2M' }
    ]
  },
  {
    id: 'telehealth-optimization',
    type: 'optimization',
    title: 'Telehealth Adoption Correlation',
    description: 'Patients using telehealth show 31% better medication adherence and 18% fewer emergency visits.',
    confidence: 87,
    priority: 'medium',
    metrics: [
      { label: 'Adherence Improvement', value: '31%' },
      { label: 'ER Visit Reduction', value: '18%' }
    ]
  },
  {
    id: 'mental-health-screening',
    type: 'trend-analysis',
    title: 'Mental Health Screening Impact',
    description: 'Proactive mental health screenings reduced crisis interventions by 42% in the past quarter.',
    confidence: 92,
    priority: 'medium',
    metrics: [
      { label: 'Crisis Reduction', value: '42%' },
      { label: 'Screenings Completed', value: '1,234' }
    ]
  }
];

const MOCK_HEALTHCARE_FEATURES: HealthcareFeature[] = [
  {
    id: 'population-health',
    title: 'Population Health Analytics',
    description: 'Analyze health patterns across large patient populations. Identify risk factors, track outcomes, and measure intervention effectiveness.',
    icon: 'users',
    capabilities: [
      'Risk stratification models',
      'Cohort analysis tools',
      'Predictive health scoring'
    ],
    category: 'population'
  },
  {
    id: 'clinical-decision',
    title: 'Clinical Decision Support',
    description: 'AI-powered recommendations to support clinical decision-making. Evidence-based insights at the point of care.',
    icon: 'calendar',
    capabilities: [
      'Treatment pathway optimization',
      'Drug interaction alerts',
      'Clinical guideline adherence'
    ],
    category: 'clinical'
  },
  {
    id: 'operational-intelligence',
    title: 'Operational Intelligence',
    description: 'Optimize healthcare operations with data-driven insights. Improve efficiency, reduce costs, and enhance patient satisfaction.',
    icon: 'settings',
    capabilities: [
      'Resource utilization analysis',
      'Patient flow optimization',
      'Quality metrics tracking'
    ],
    category: 'operational'
  }
];

const MOCK_COMPLIANCE_FEATURES: ComplianceFeature[] = [
  {
    id: 'hipaa-compliance',
    title: 'HIPAA Compliant',
    description: 'End-to-end encryption and access controls',
    icon: 'lock',
    type: 'security'
  },
  {
    id: 'soc2-certification',
    title: 'SOC 2 Type II',
    description: 'Annual security audits and certifications',
    icon: 'shield',
    type: 'certification'
  },
  {
    id: 'fda-guidelines',
    title: 'FDA Guidelines',
    description: 'AI/ML model validation and documentation',
    icon: 'check-square',
    type: 'regulatory'
  }
];

export const useHealthHubData = () => {
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>(MOCK_HEALTH_METRICS);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>(MOCK_AI_INSIGHTS);
  const [healthcareFeatures, setHealthcareFeatures] = useState<HealthcareFeature[]>(MOCK_HEALTHCARE_FEATURES);
  const [complianceFeatures, setComplianceFeatures] = useState<ComplianceFeature[]>(MOCK_COMPLIANCE_FEATURES);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('30-days');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchHealthHubData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Simulate API calls - in real implementation, these would be actual endpoints
      await new Promise(resolve => setTimeout(resolve, 900));
      
      // Health metrics would come from API
      // const metricsResponse = await fetch('/api/v1/health/metrics');
      // const healthMetrics = await metricsResponse.json();
      
      // AI insights would come from API
      // const insightsResponse = await fetch('/api/v1/health/insights');
      // const aiInsights = await insightsResponse.json();
      
      // Healthcare features would come from API
      // const featuresResponse = await fetch('/api/v1/health/features');
      // const healthcareFeatures = await featuresResponse.json();
      
      // Use mock data for now
      setHealthMetrics(MOCK_HEALTH_METRICS);
      setAIInsights(MOCK_AI_INSIGHTS);
      setHealthcareFeatures(MOCK_HEALTHCARE_FEATURES);
      setComplianceFeatures(MOCK_COMPLIANCE_FEATURES);
      
    } catch (error) {
      console.error('Failed to fetch HealthHub data:', error);
      // Keep mock data as fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTimeframe = useCallback((timeframe: string) => {
    setSelectedTimeframe(timeframe);
    // In real implementation, this would trigger a data refresh
    console.log('Timeframe updated to:', timeframe);
  }, []);

  const exportReport = useCallback(async () => {
    // Mock report export
    console.log('Exporting health analytics report...');
    // In real implementation, this would generate and download a report
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Report exported successfully');
  }, []);

  const viewInsightDetails = useCallback((insightId: string) => {
    const insight = aiInsights.find(i => i.id === insightId);
    console.log('Viewing insight details:', insight);
    // In real implementation, this would navigate to detailed insight view
  }, [aiInsights]);

  const getMetricsByType = useCallback((isPrimary: boolean) => {
    return healthMetrics.filter(metric => metric.isPrimary === isPrimary);
  }, [healthMetrics]);

  const getInsightsByPriority = useCallback((priority: AIInsight['priority']) => {
    return aiInsights.filter(insight => insight.priority === priority);
  }, [aiInsights]);

  const getFeaturesByCategory = useCallback((category: HealthcareFeature['category']) => {
    return healthcareFeatures.filter(feature => feature.category === category);
  }, [healthcareFeatures]);

  const getComplianceByType = useCallback((type: ComplianceFeature['type']) => {
    return complianceFeatures.filter(feature => feature.type === type);
  }, [complianceFeatures]);

  useEffect(() => {
    fetchHealthHubData();
  }, [fetchHealthHubData]);

  return {
    healthMetrics,
    aiInsights,
    healthcareFeatures,
    complianceFeatures,
    selectedTimeframe,
    isLoading,
    updateTimeframe,
    exportReport,
    viewInsightDetails,
    getMetricsByType,
    getInsightsByPriority,
    getFeaturesByCategory,
    getComplianceByType,
    refetchData: fetchHealthHubData
  };
}; 