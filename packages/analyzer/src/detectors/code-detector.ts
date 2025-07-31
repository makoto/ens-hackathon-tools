import { Evidence } from '../types/evidence';
import { ENS_PATTERNS } from '../config/patterns';
import { FileInfo } from '../utils/file-scanner';

interface CompiledPattern {
  regex: RegExp;
  originalPattern: string;
  confidence: string;
  type: string;
  weight: number;
}

export class CodeDetector {
  private compiledPatterns: CompiledPattern[];

  constructor() {
    this.compiledPatterns = this.compilePatterns();
  }

  detect(codeFiles: FileInfo[]): Evidence[] {
    const evidence: Evidence[] = [];

    for (const file of codeFiles) {
      // Skip binary files and very large files
      if (this.isBinaryFile(file.path) || file.content.length > 500000) {
        continue;
      }

      evidence.push(...this.scanFileForPatterns(file));
    }

    return evidence;
  }

  private scanFileForPatterns(file: FileInfo): Evidence[] {
    const evidence: Evidence[] = [];
    const lines = file.content.split('\n');

    for (const compiledPattern of this.compiledPatterns) {
      lines.forEach((line, index) => {
        const matches = line.match(compiledPattern.regex);
        if (matches && this.isValidMatch(matches[0], line, compiledPattern.originalPattern)) {
          evidence.push({
            type: 'code',
            pattern: compiledPattern.originalPattern,
            file: file.path,
            line: index + 1,
            confidence: compiledPattern.confidence as any,
            integrationType: compiledPattern.type,
            weight: compiledPattern.weight,
            context: line.trim().substring(0, 100),
            matchedText: matches[0]
          });
        }
      });
    }

    return evidence;
  }

  private compilePatterns(): CompiledPattern[] {
    const compiled: CompiledPattern[] = [];
    
    Object.values(ENS_PATTERNS.codePatterns).flat().forEach(pattern => {
      compiled.push({
        regex: pattern.pattern,
        originalPattern: pattern.pattern.source,
        confidence: pattern.confidence,
        type: pattern.type,
        weight: pattern.weight
      });
    });

    return compiled;
  }

  private isBinaryFile(path: string): boolean {
    const binaryExtensions = ['.jpg', '.png', '.gif', '.pdf', '.zip', '.tar', '.gz'];
    return binaryExtensions.some(ext => path.toLowerCase().endsWith(ext));
  }

  private isValidMatch(match: string, line: string, originalPattern: string): boolean {
    // Skip matches in comments (simple heuristic)
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || trimmedLine.startsWith('*')) {
      return false;
    }

    // Special validation for "durin" pattern to avoid "during" false positives
    if (originalPattern.includes('durin')) {
      const lowerMatch = match.toLowerCase();
      const lowerLine = line.toLowerCase();
      
      // If it's part of a larger word like "during", "enduring", etc., skip it
      if (lowerMatch === 'durin') {
        const matchIndex = lowerLine.indexOf(lowerMatch);
        const beforeChar = matchIndex > 0 ? line.charAt(matchIndex - 1) : '';
        const afterChar = matchIndex + lowerMatch.length < line.length ? line.charAt(matchIndex + lowerMatch.length) : '';
        
        // Check if it's a word boundary (not alphanumeric)
        if (/[a-z0-9]/i.test(beforeChar) || /[a-z0-9]/i.test(afterChar)) {
          return false;
        }
      }
    }

    return true;
  }
}