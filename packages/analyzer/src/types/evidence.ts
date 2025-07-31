import { ConfidenceLevel } from './analysis';

export interface Evidence {
  type: EvidenceType;
  pattern: string;
  file: string;
  line: number;
  confidence: ConfidenceLevel;
  integrationType: string;
  weight: number;
  context: string;
  matchedText?: string;
  githubUrl?: string;
}

export type EvidenceType = 'dependency' | 'code' | 'contract' | 'ui' | 'config';

export interface PatternMatch {
  pattern: RegExp;
  confidence: ConfidenceLevel;
  type: string;
  weight: number;
  description: string;
}

export interface FileInfo {
  path: string;
  content: string;
  size: number;
  extension: string;
}