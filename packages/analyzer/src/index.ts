// Main exports for the package
export { ENSHackathonAnalyzer } from './core/analyzer';
export { Classifier } from './core/classifier';
export { ReportGenerator } from './core/report-generator';

// Detector exports
export { DependencyDetector } from './detectors/dependency-detector';
export { CodeDetector } from './detectors/code-detector';
export { ContractDetector } from './detectors/contract-detector';

// Utility exports
export { FileScanner } from './utils/file-scanner';
export { GitUtils } from './utils/git-utils';
export { Logger } from './utils/logger';

// Type exports
export * from './types/analysis';
export * from './types/evidence';
export * from './types/config';

// Configuration exports
export { ENS_PATTERNS } from './config/patterns';