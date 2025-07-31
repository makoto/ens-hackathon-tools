import { AnalysisResult, ConfidenceLevel, StarRating, IntegrationType } from '../types/analysis';
import { Evidence } from '../types/evidence';

export class Classifier {
  public classify(repoName: string, repoUrl: string, evidence: Evidence[]): Omit<AnalysisResult, 'timestamp' | 'duration'> {
    const hasENS = evidence.length > 0;
    const confidence = this.calculateOverallConfidence(evidence);
    const integrationTypes = this.extractIntegrationTypes(evidence);
    const rating = this.calculateStarRating(evidence, integrationTypes);
    const summary = this.generateSummary(integrationTypes, rating, evidence);

    return {
      repository: repoName,
      url: repoUrl,
      hasENS,
      confidence,
      rating,
      integrationTypes,
      evidence: evidence.slice(0, 10), // Top 10 evidence items
      summary
    };
  }

  private calculateOverallConfidence(evidence: Evidence[]): ConfidenceLevel {
    if (evidence.length === 0) return 'error';

    const confidenceScores = {
      'very_high': 4,
      'high': 3,
      'medium': 2,
      'low': 1,
      'error': 0
    };

    const averageScore = evidence.reduce((sum, e) => {
      return sum + confidenceScores[e.confidence];
    }, 0) / evidence.length;

    if (averageScore >= 3.5) return 'very_high';
    if (averageScore >= 2.5) return 'high';
    if (averageScore >= 1.5) return 'medium';
    return 'low';
  }

  private extractIntegrationTypes(evidence: Evidence[]): IntegrationType[] {
    const typeSet = new Set<IntegrationType>();

    evidence.forEach(e => {
      switch (e.integrationType) {
        case 'name_resolution':
        case 'ens_domain':
          typeSet.add(IntegrationType.NAME_RESOLUTION);
          break;
        case 'subdomain_mgmt':
        case 'l2_subdomain':
          typeSet.add(IntegrationType.SUBDOMAIN_MGMT);
          break;
        case 'ai_integration':
          typeSet.add(IntegrationType.AI_INTEGRATION);
          break;
        case 'custom_resolver':
          typeSet.add(IntegrationType.CUSTOM_RESOLVER);
          break;
        case 'text_records':
          typeSet.add(IntegrationType.TEXT_RECORDS);
          break;
        case 'smart_contract':
        case 'ens_registry':
        case 'public_resolver':
        case 'name_wrapper':
          typeSet.add(IntegrationType.SMART_CONTRACT);
          break;
        case 'ui_components':
          typeSet.add(IntegrationType.PROFILE_DISPLAY);
          break;
      }
    });

    return Array.from(typeSet);
  }

  private calculateStarRating(evidence: Evidence[], integrationTypes: IntegrationType[]): StarRating {
    const totalScore = evidence.reduce((sum, e) => {
      const multiplier = this.getConfidenceMultiplier(e.confidence);
      return sum + (e.weight * multiplier);
    }, 0);

    const typeCount = integrationTypes.length;
    const hasAdvancedPatterns = this.hasAdvancedPatterns(evidence);
    const hasOfficialLibraries = this.hasOfficialLibraries(evidence);

    // ⭐⭐⭐⭐⭐ Exceptional (5 stars)
    if (hasAdvancedPatterns && 
        evidence.some(e => e.integrationType === 'custom_resolver') &&
        typeCount >= 3) {
      return 5;
    }

    // ⭐⭐⭐⭐ Prize-worthy (4 stars) 
    if ((hasAdvancedPatterns && typeCount >= 3) ||
        (evidence.some(e => e.integrationType === 'ai_integration') && hasOfficialLibraries)) {
      return 4;
    }

    // ⭐⭐⭐ Excellent (3 stars)
    if (typeCount >= 3 && hasOfficialLibraries) {
      return 3;
    }

    // ⭐⭐ Good (2 stars)
    if (typeCount >= 2 && totalScore >= 15) {
      return 2;
    }

    // ⭐ Basic (1 star)
    if (typeCount >= 1 && totalScore >= 5) {
      return 1;
    }

    // No integration
    return 0;
  }

  private getConfidenceMultiplier(confidence: ConfidenceLevel): number {
    switch (confidence) {
      case 'very_high': return 1.0;
      case 'high': return 0.8;
      case 'medium': return 0.6;
      case 'low': return 0.4;
      case 'error': return 0.0;
    }
  }

  private hasAdvancedPatterns(evidence: Evidence[]): boolean {
    const advancedTypes = ['custom_resolver', 'ai_integration', 'l2_subdomain'];
    return evidence.some(e => advancedTypes.includes(e.integrationType));
  }

  private hasOfficialLibraries(evidence: Evidence[]): boolean {
    const officialLibs = ['@ensdomains/ensjs', '@ensdomains/thorin', '@ensdomains/durin'];
    return evidence.some(e => 
      e.type === 'dependency' && officialLibs.includes(e.pattern)
    );
  }

  private generateSummary(
    integrationTypes: IntegrationType[], 
    rating: StarRating, 
    evidence: Evidence[]
  ): string {
    if (rating === 0) {
      return 'No ENS integration detected';
    }

    const features: string[] = [];
    
    if (integrationTypes.includes(IntegrationType.CUSTOM_RESOLVER)) {
      features.push('custom resolver');
    }
    if (integrationTypes.includes(IntegrationType.AI_INTEGRATION)) {
      features.push('AI integration');
    }
    if (integrationTypes.includes(IntegrationType.SUBDOMAIN_MGMT)) {
      features.push('subdomain management');
    }
    if (integrationTypes.includes(IntegrationType.TEXT_RECORDS)) {
      features.push('text records');
    }
    if (integrationTypes.includes(IntegrationType.NAME_RESOLUTION)) {
      features.push('name resolution');
    }

    const ratingDescriptions = {
      1: 'Basic ENS integration',
      2: 'Good ENS integration',
      3: 'Excellent ENS integration',
      4: 'Prize-worthy ENS integration',
      5: 'Exceptional ENS integration'
    };

    const baseDescription = ratingDescriptions[rating as keyof typeof ratingDescriptions];
    
    if (features.length > 0) {
      return `${baseDescription} with ${features.join(', ')}`;
    }
    
    return baseDescription;
  }
}