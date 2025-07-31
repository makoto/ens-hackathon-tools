import { Evidence } from '../types/evidence';
import { ENS_PATTERNS } from '../config/patterns';
import { FileInfo } from '../utils/file-scanner';

export class DependencyDetector {
  detect(packageFiles: FileInfo[]): Evidence[] {
    const evidence: Evidence[] = [];

    for (const file of packageFiles) {
      try {
        if (file.path.endsWith('package.json')) {
          evidence.push(...this.analyzePackageJson(file));
        } else if (file.path.endsWith('requirements.txt')) {
          evidence.push(...this.analyzeRequirementsTxt(file));
        } else if (file.path.endsWith('Cargo.toml')) {
          evidence.push(...this.analyzeCargoToml(file));
        }
      } catch (error) {
        // Skip malformed files
        continue;
      }
    }

    return evidence;
  }

  private analyzePackageJson(file: FileInfo): Evidence[] {
    const evidence: Evidence[] = [];
    const pkg = JSON.parse(file.content);
    const allDeps = {
      ...pkg.dependencies || {},
      ...pkg.devDependencies || {},
      ...pkg.peerDependencies || {}
    };

    for (const [depName, version] of Object.entries(allDeps)) {
      const pattern = ENS_PATTERNS.dependencies[depName as keyof typeof ENS_PATTERNS.dependencies];
      if (pattern) {
        evidence.push({
          type: 'dependency',
          pattern: depName,
          file: file.path,
          line: 0,
          confidence: pattern.confidence,
          integrationType: pattern.type,
          weight: pattern.weight,
          context: `${depName}: ${version}`
        });
      }
    }

    return evidence;
  }

  private analyzeRequirementsTxt(file: FileInfo): Evidence[] {
    // Check for Python ENS libraries
    const pythonENSLibs = ['ens', 'web3', 'eth-ens'];
    const evidence: Evidence[] = [];
    
    for (const lib of pythonENSLibs) {
      if (file.content.includes(lib)) {
        evidence.push({
          type: 'dependency',
          pattern: lib,
          file: file.path,
          line: 0,
          confidence: 'medium',
          integrationType: 'python_library',
          weight: 5,
          context: `Python dependency: ${lib}`
        });
      }
    }

    return evidence;
  }

  private analyzeCargoToml(file: FileInfo): Evidence[] {
    // Check for Rust ENS libraries
    const rustENSLibs = ['ethers', 'web3'];
    const evidence: Evidence[] = [];
    
    for (const lib of rustENSLibs) {
      if (file.content.includes(lib)) {
        evidence.push({
          type: 'dependency',
          pattern: lib,
          file: file.path,
          line: 0,
          confidence: 'medium',
          integrationType: 'rust_library',
          weight: 5,
          context: `Rust dependency: ${lib}`
        });
      }
    }

    return evidence;
  }
}