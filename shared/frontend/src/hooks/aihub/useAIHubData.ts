import { useState, useEffect, useCallback } from 'react';
import { get } from '../../lib/api';

export interface AIModel {
  id: string;
  name: string;
  type: string;
  category: 'nlp' | 'vision' | 'forecasting' | 'custom';
  status: 'production' | 'beta' | 'experimental';
  description: string;
  accuracy: number;
  latency: string;
  additionalMetric: {
    label: string;
    value: string;
  };
  apiUrl: string;
  isActive?: boolean;
}

export interface PlatformCapability {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  techStack: string[];
  category: 'deployment' | 'management' | 'monitoring';
}

export interface APIMetrics {
  responseTime: string;
  uptime: string;
  requestsPerDay: string;
  systemStatus: 'operational' | 'maintenance' | 'issues';
}

export interface PlaygroundSession {
  id: string;
  modelName: string;
  taskType: string;
  input: string;
  output: string;
  requestDetails: {
    latency: string;
    tokens: string;
    cost: string;
  };
}

export const useAIHubData = () => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [capabilities] = useState<PlatformCapability[]>([]);
  const [apiMetrics, setApiMetrics] = useState<APIMetrics>({
    responseTime: '0ms',
    uptime: '',
    requestsPerDay: '',
    systemStatus: 'operational',
  });
  const [playgroundSession] = useState<PlaygroundSession | null>(null);
  const [activeModel, setActiveModel] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const fetchAIHubData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      const resp = await get<any>('/api/v1/ai/models');
      const t1 = (typeof performance !== 'undefined' ? performance.now() : Date.now());

      const list = (resp as any)?.data ?? (Array.isArray(resp) ? resp : []);

      const mapped: AIModel[] = Array.isArray(list)
        ? list.map((m: any) => ({
            id: String(m.id ?? ''),
            name: String(m.ux_hint ?? m.id ?? ''),
            type: String(m.strength ?? 'General'),
            category: 'nlp',
            status: 'production',
            description: String(m.notes ?? ''),
            accuracy: 0,
            latency: 'n/a',
            additionalMetric: { label: 'ctx', value: String(m.ctx ?? '') },
            apiUrl: `/api/v1/ai/models`,
            isActive: false,
          }))
        : [];

      setModels(mapped);
      setActiveModel(mapped[0]?.id ?? '');
      setApiMetrics({
        responseTime: `${Math.max(0, Math.round((t1 as number) - (t0 as number)))}ms`,
        uptime: '',
        requestsPerDay: '',
        systemStatus: 'operational',
      });
      
    } catch (error) {
      console.error('Failed to fetch AI Hub data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectModel = useCallback((modelId: string) => {
    setActiveModel(modelId);
    setModels(prev => prev.map(model => ({
      ...model,
      isActive: model.id === modelId
    })));
  }, []);

  const toggleChat = useCallback(() => {
    setIsChatOpen(prev => !prev);
  }, []);

  const runInference = useCallback(async (_input: string, _modelId: string) => {
    // Not implemented – generic inference endpoint is not part of FinanceHub scope.
    // This hook intentionally avoids any mock output per no-mock policy.
    return;
  }, []);

  const getModelsByCategory = useCallback((category: AIModel['category']) => {
    return models.filter(model => model.category === category);
  }, [models]);

  const getCapabilitiesByCategory = useCallback((category: PlatformCapability['category']) => {
    return capabilities.filter(capability => capability.category === category);
  }, [capabilities]);

  useEffect(() => {
    fetchAIHubData();
  }, [fetchAIHubData]);

  return {
    models,
    capabilities,
    apiMetrics,
    playgroundSession,
    activeModel,
    isLoading,
    isChatOpen,
    selectModel,
    toggleChat,
    runInference,
    getModelsByCategory,
    getCapabilitiesByCategory,
    refetchData: fetchAIHubData
  };
}; 