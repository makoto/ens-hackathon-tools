import * as fs from 'fs';
import * as path from 'path';

export class InputParser {
  async parseCSV(filePath: string): Promise<string[]> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Input file not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error('Input file is empty');
    }

    const repoUrls: string[] = [];
    
    // Skip header row if it exists
    const startIndex = this.hasHeader(lines) ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const url = this.extractRepoUrl(line);
      if (url) {
        repoUrls.push(url);
      }
    }
    
    if (repoUrls.length === 0) {
      throw new Error('No valid GitHub repository URLs found in input file');
    }
    
    return repoUrls;
  }

  private hasHeader(lines: string[]): boolean {
    const firstLine = lines[0].toLowerCase();
    return firstLine.includes('repository') || 
           firstLine.includes('github') || 
           firstLine.includes('url') ||
           firstLine.includes('project');
  }

  private extractRepoUrl(line: string): string | null {
    // Split by comma and look for GitHub URLs
    const parts = line.split(',').map(part => part.trim().replace(/['"]/g, ''));
    
    for (const part of parts) {
      if (this.isValidGitHubUrl(part)) {
        return this.normalizeGitHubUrl(part);
      }
    }
    
    return null;
  }

  private isValidGitHubUrl(url: string): boolean {
    const githubPattern = /^https?:\/\/github\.com\/[^\/]+\/[^\/]+/;
    return githubPattern.test(url);
  }

  private normalizeGitHubUrl(url: string): string {
    // Remove .git suffix if present
    url = url.replace(/\.git$/, '');
    
    // Remove trailing slash
    url = url.replace(/\/$/, '');
    
    // Ensure https protocol
    url = url.replace(/^http:/, 'https:');
    
    return url;
  }

  async parseJSON(filePath: string): Promise<string[]> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Input file not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    try {
      const data = JSON.parse(content);
      
      if (Array.isArray(data)) {
        // Array of URLs
        return data.filter(url => this.isValidGitHubUrl(url));
      } else if (data.repositories && Array.isArray(data.repositories)) {
        // Object with repositories array
        return data.repositories.filter((url: string) => this.isValidGitHubUrl(url));
      } else {
        throw new Error('Invalid JSON structure. Expected array of URLs or object with repositories array.');
      }
    } catch (error) {
      throw new Error(`Failed to parse JSON file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}