import { Evidence } from '../types/evidence';
import { ENS_PATTERNS } from '../config/patterns';
import { FileInfo } from '../utils/file-scanner';

export class ContractDetector {
  detect(codeFiles: FileInfo[]): Evidence[] {
    const evidence: Evidence[] = [];

    for (const file of codeFiles) {
      evidence.push(...this.scanForContractAddresses(file));
    }

    return evidence;
  }

  private scanForContractAddresses(file: FileInfo): Evidence[] {
    const evidence: Evidence[] = [];
    
    Object.entries(ENS_PATTERNS.contractAddresses).forEach(([address, info]) => {
      if (file.content.includes(address)) {
        const lines = file.content.split('\n');
        const lineIndex = lines.findIndex(line => line.includes(address));
        
        evidence.push({
          type: 'contract',
          pattern: address,
          file: file.path,
          line: lineIndex + 1,
          confidence: info.confidence,
          integrationType: info.type,
          weight: info.weight,
          context: info.name,
          matchedText: address
        });
      }
    });

    return evidence;
  }
}