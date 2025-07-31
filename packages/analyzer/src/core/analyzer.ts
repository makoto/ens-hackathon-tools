import { promises as fs } from 'fs';
import * as path from 'path';
import { GitUtils } from '../utils/git-utils';
import { FileScanner } from '../utils/file-scanner';
import { DependencyDetector } from '../detectors/dependency-detector';
import { CodeDetector } from '../detectors/code-detector';
import { ContractDetector } from '../detectors/contract-detector';
import { Classifier } from './classifier';
import { ReportGenerator } from './report-generator';
import { Logger } from '../utils/logger';
import { 
  AnalysisResult, 
  BatchResult, 
  BatchSummary,
  IntegrationType 
} from '../types/analysis';
import { Evidence } from '../types/evidence';
import { AnalyzerConfig } from '../types/config';

export class ENSHackathonAnalyzer {
  private config: AnalyzerConfig = {
    maxConcurrent: 10,
    timeoutMs: 30000,
    maxFileSize: 100 * 1024, // 100KB
    maxFilesPerRepo: 50,
    skipBinaryFiles: true,
    ignoreDirs: ['node_modules', 'target', '.git', 'dist', 'build'],
    enableLogging: true
  };

  constructor(
    private readonly gitUtils = new GitUtils(),
    private readonly fileScanner = new FileScanner(),
    private readonly dependencyDetector = new DependencyDetector(),
    private readonly codeDetector = new CodeDetector(),
    private readonly contractDetector = new ContractDetector(),
    private readonly classifier = new Classifier(),
    private readonly reportGenerator = new ReportGenerator(),
    private readonly logger = new Logger()
  ) {}

  public setConfig(config: Partial<AnalyzerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public async analyzeBatch(repoUrls: string[]): Promise<BatchResult> {
    const startTime = Date.now();
    this.logger.info(`🚀 Starting analysis of ${repoUrls.length} repositories...`);
    
    const chunks = this.chunkArray(repoUrls, this.config.maxConcurrent);
    const results: AnalysisResult[] = [];
    
    for (const [index, chunk] of chunks.entries()) {
      this.logger.info(`📦 Processing chunk ${index + 1}/${chunks.length} (${chunk.length} repos)`);
      
      const chunkResults = await Promise.allSettled(
        chunk.map((url: string) => this.analyzeWithTimeout(url))
      );
      
      const successfulResults = chunkResults
        .filter((result): result is PromiseFulfilledResult<AnalysisResult> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value);
      
      results.push(...successfulResults);
      
      // Log failed analyses
      const failedCount = chunkResults.length - successfulResults.length;
      if (failedCount > 0) {
        this.logger.warn(`⚠️  ${failedCount} analyses failed in this chunk`);
      }
    }
    
    const duration = (Date.now() - startTime) / 1000;
    const summary = this.generateBatchSummary(results);
    
    this.logger.info(`✅ Completed ${results.length}/${repoUrls.length} analyses in ${duration.toFixed(1)}s`);
    
    return {
      results,
      summary,
      duration,
      processed: results.length,
      total: repoUrls.length,
      timestamp: new Date().toISOString()
    };
  }

  public async analyzeSingle(repoUrl: string): Promise<AnalysisResult> {
    const startTime = Date.now();
    const repoName = this.extractRepoName(repoUrl);
    
    this.logger.info(`🔍 Analyzing ${repoName}...`);
    
    try {
      // 1. Clone repository
      const tempDir = await this.createTempDir();
      await this.gitUtils.quickClone(repoUrl, tempDir);
      
      // 2. Scan files in parallel
      const [packageFiles, codeFiles, contractFiles] = await Promise.all([
        this.fileScanner.findPackageFiles(tempDir),
        this.fileScanner.findCodeFiles(tempDir, this.config),
        this.fileScanner.findContractFiles(tempDir)
      ]);
      
      // 3. Detect patterns with GitHub URLs
      const evidence: Evidence[] = [
        ...this.dependencyDetector.detect(packageFiles).map(e => this.addGitHubUrl(e, repoUrl, tempDir)),
        ...this.codeDetector.detect(codeFiles).map(e => this.addGitHubUrl(e, repoUrl, tempDir)),
        ...this.contractDetector.detect(contractFiles).map(e => this.addGitHubUrl(e, repoUrl, tempDir))
      ];
      
      // 4. Cleanup
      await fs.rmdir(tempDir, { recursive: true });
      
      // 5. Classify results
      const result = this.classifier.classify(repoName, repoUrl, evidence);
      
      const duration = Date.now() - startTime;
      this.logger.info(`✓ ${repoName}: ${result.hasENS ? `${result.rating}⭐` : 'No ENS'} (${duration}ms)`);
      
      return {
        ...result,
        timestamp: new Date().toISOString(),
        duration
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`✗ ${repoName}: ${errorMessage} (${duration}ms)`);
      
      return {
        repository: repoName,
        url: repoUrl,
        hasENS: false,
        confidence: 'error',
        rating: 0,
        integrationTypes: [],
        evidence: [],
        summary: `Analysis failed: ${errorMessage}`,
        timestamp: new Date().toISOString(),
        duration,
        error: errorMessage
      };
    }
  }

  private async analyzeWithTimeout(repoUrl: string): Promise<AnalysisResult> {
    return Promise.race([
      this.analyzeSingle(repoUrl),
      new Promise<AnalysisResult>((_, reject) =>
        setTimeout(() => reject(new Error('Analysis timeout')), this.config.timeoutMs)
      )
    ]);
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private async createTempDir(): Promise<string> {
    const tempDir = path.join(
      process.cwd(), 
      'tmp', 
      `ens-analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    );
    await fs.mkdir(tempDir, { recursive: true });
    return tempDir;
  }

  private extractRepoName(url: string): string {
    const match = url.match(/github\.com\/([^\/]+\/[^\/]+)/);
    return match ? match[1] : url;
  }

  private addGitHubUrl(evidence: Evidence, repoUrl: string, tempDir: string): Evidence {
    if (!evidence.file) return evidence;
    
    // Convert local file path to relative path from repo root
    const relativePath = evidence.file.replace(tempDir + '/', '');
    
    // Convert GitHub URL to raw file URL with line number
    const baseUrl = repoUrl.replace('.git', '');
    const githubUrl = evidence.line 
      ? `${baseUrl}/blob/main/${relativePath}#L${evidence.line}`
      : `${baseUrl}/blob/main/${relativePath}`;
    
    return {
      ...evidence,
      githubUrl,
      file: relativePath // Keep relative path instead of temp path
    };
  }

  private generateBatchSummary(results: AnalysisResult[]): BatchSummary {
    const ensResults = results.filter(r => r.hasENS);
    const totalRating = ensResults.reduce((sum, r) => sum + r.rating, 0);
    
    // Rating distribution
    const ratingDistribution = results.reduce((dist, result) => {
      dist[result.rating] = (dist[result.rating] || 0) + 1;
      return dist;
    }, {} as Record<number, number>);
    
    // Integration type breakdown
    const integrationTypeBreakdown = ensResults.reduce((breakdown, result) => {
      result.integrationTypes.forEach(type => {
        breakdown[type] = (breakdown[type] || 0) + 1;
      });
      return breakdown;
    }, {} as Record<IntegrationType, number>);
    
    // Most common libraries
    const libraryCount = new Map<string, number>();
    ensResults.forEach(result => {
      result.evidence
        .filter(e => e.type === 'dependency')
        .forEach(e => {
          libraryCount.set(e.pattern, (libraryCount.get(e.pattern) || 0) + 1);
        });
    });
    
    const mostCommonLibraries = Array.from(libraryCount.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / ensResults.length) * 100)
      }));
    
    return {
      ensProjects: ensResults.length,
      ensPercentage: Math.round((ensResults.length / results.length) * 100),
      averageRating: ensResults.length > 0 ? totalRating / ensResults.length : 0,
      topProject: ensResults.sort((a, b) => b.rating - a.rating)[0],
      ratingDistribution: ratingDistribution as Record<number, number>,
      integrationTypeBreakdown,
      mostCommonLibraries
    };
  }

  public generateReport(batchResult: BatchResult): string {
    return this.reportGenerator.generate(batchResult);
  }
}