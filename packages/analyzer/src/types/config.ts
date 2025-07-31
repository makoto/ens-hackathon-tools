import { ConfidenceLevel } from './analysis';

export interface AnalyzerConfig {
  maxConcurrent: number;
  timeoutMs: number;
  maxFileSize: number;
  maxFilesPerRepo: number;
  skipBinaryFiles: boolean;
  ignoreDirs: string[];
  enableLogging: boolean;
}

export interface PatternConfig {
  dependencies: Record<string, DependencyPattern>;
  codePatterns: Record<string, CodePattern[]>;
  contractAddresses: Record<string, ContractPattern>;
}

export interface DependencyPattern {
  confidence: ConfidenceLevel;
  type: string;
  weight: number;
  description?: string;
}

export interface CodePattern {
  pattern: RegExp;
  confidence: ConfidenceLevel;
  type: string;
  weight: number;
  description?: string;
}

export interface ContractPattern {
  name: string;
  confidence: ConfidenceLevel;
  type: string;
  weight: number;
  description?: string;
}