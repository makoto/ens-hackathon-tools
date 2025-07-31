import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';
import { AnalyzerConfig } from '../types/config';

export interface FileInfo {
  path: string;
  content: string;
  size: number;
  extension: string;
}

export class FileScanner {
  async findPackageFiles(dir: string): Promise<FileInfo[]> {
    const patterns = [
      'package.json',
      '**/package.json',
      'requirements.txt',
      '**/requirements.txt',
      'Cargo.toml',
      '**/Cargo.toml',
      'go.mod',
      '**/go.mod'
    ];

    const files = await this.globFiles(dir, patterns, {
      ignore: ['**/node_modules/**', '**/target/**', '**/.git/**']
    });

    return this.readFiles(files);
  }

  async findCodeFiles(dir: string, config: AnalyzerConfig): Promise<FileInfo[]> {
    const patterns = [
      '**/*.{ts,tsx,js,jsx}',
      '**/*.{py,sol,go,rs}',
      '**/*.{vue,svelte}'
    ];

    const files = await this.globFiles(dir, patterns, {
      ignore: config.ignoreDirs.map(d => `**/${d}/**`)
    });

    // Limit files for performance
    const limitedFiles = files
      .filter(file => this.getFileSize(file) < config.maxFileSize)
      .slice(0, config.maxFilesPerRepo);

    return this.readFiles(limitedFiles);
  }

  async findContractFiles(dir: string): Promise<FileInfo[]> {
    const patterns = [
      '**/*.sol',
      '**/*.vy',
      '**/contracts/**/*.{js,ts}'
    ];

    const files = await this.globFiles(dir, patterns, {
      ignore: ['**/node_modules/**', '**/.git/**']
    });

    return this.readFiles(files);
  }

  private async globFiles(dir: string, patterns: string[], options: any): Promise<string[]> {
    const allFiles: string[] = [];
    
    for (const pattern of patterns) {
      const files = await glob(pattern, {
        cwd: dir,
        absolute: true,
        ...options
      });
      allFiles.push(...files);
    }

    return [...new Set(allFiles)]; // Remove duplicates
  }

  private async readFiles(filePaths: string[]): Promise<FileInfo[]> {
    const fileInfos: FileInfo[] = [];

    await Promise.allSettled(
      filePaths.map(async (filePath) => {
        try {
          const content = await fs.readFile(filePath, 'utf8');
          const stats = await fs.stat(filePath);
          fileInfos.push({ 
            path: filePath, 
            content,
            size: stats.size,
            extension: path.extname(filePath)
          });
        } catch (error) {
          // Skip unreadable files
        }
      })
    );

    return fileInfos;
  }

  private getFileSize(filePath: string): number {
    try {
      const stats = require('fs').statSync(filePath);
      return stats.size;
    } catch {
      return 0;
    }
  }
}