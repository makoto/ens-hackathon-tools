export interface AnalysisResult {
  repository: string;
  url: string;
  hasENS: boolean;
  confidence: ConfidenceLevel;
  rating: StarRating;
  integrationTypes: IntegrationType[];
  evidence: Evidence[];
  summary: string;
  timestamp: string;
  duration: number; // milliseconds
  error?: string;
}

export interface BatchResult {
  results: AnalysisResult[];
  summary: BatchSummary;
  duration: number; // seconds
  processed: number;
  total: number;
  timestamp: string;
}

export interface BatchSummary {
  ensProjects: number;
  ensPercentage: number;
  averageRating: number;
  topProject?: AnalysisResult;
  ratingDistribution: Record<StarRating, number>;
  integrationTypeBreakdown: Record<IntegrationType, number>;
  mostCommonLibraries: LibraryUsage[];
}

export interface LibraryUsage {
  name: string;
  count: number;
  percentage: number;
}

export type ConfidenceLevel = 'error' | 'low' | 'medium' | 'high' | 'very_high';
export type StarRating = 0 | 1 | 2 | 3 | 4 | 5;

export enum IntegrationType {
  NAME_RESOLUTION = 'name_resolution',
  SUBDOMAIN_MGMT = 'subdomain_mgmt', 
  PROFILE_DISPLAY = 'profile_display',
  AUTHENTICATION = 'authentication',
  SMART_CONTRACT = 'smart_contract',
  CROSS_CHAIN = 'cross_chain',
  CONTENT_HOSTING = 'content_hosting',
  TEXT_RECORDS = 'text_records',
  AI_INTEGRATION = 'ai_integration',
  CUSTOM_RESOLVER = 'custom_resolver',
  L2_SUBDOMAIN = 'l2_subdomain'
}

import { Evidence } from './evidence';