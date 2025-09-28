import { BaseCSPCommand } from './base-command';
import type { AnalyzeDirectivesParams, CSPCommandResult } from '../types/command.types';
import type { CSPDirectiveAnalysisResult } from '../types/csp';

export class AnalyzeDirectivesCommand extends BaseCSPCommand<AnalyzeDirectivesParams> {
  constructor(params: AnalyzeDirectivesParams) {
    super('analyze-directives', params);
  }

  public execute(): CSPCommandResult {
    try {
      const policy = this.getCurrentCSPPolicy();
      const analysisResult = this.analyzeCSPDirectives(policy);
      
      this.logInfo(`Analyzed CSP policy: ${policy.substring(0, 100)}...`);
      
      if (analysisResult.isCompliant) {
        this.logSuccess('CSP directive analysis passed - policy is compliant');
      } else {
        this.logWarn(`CSP directive analysis found ${analysisResult.violations.length} issues`);
      }

      return this.createSuccessResult(analysisResult, 'Directive analysis completed');
    } catch (error) {
      this.logError('Failed to analyze CSP directives', error as Error);
      return this.createErrorResult(error as Error, 'Failed to analyze CSP directives');
    }
  }

  private getCurrentCSPPolicy(): string {
    const metaTag = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (metaTag) {
      return metaTag.getAttribute('content') || '';
    }

    // Try to get from response headers (this would need to be implemented server-side)
    return '';
  }

  private analyzeCSPDirectives(policy: string): CSPDirectiveAnalysisResult {
    if (!policy) {
      return {
        violations: ['No CSP policy found'],
        recommendations: ['Add a Content Security Policy'],
        policy: '',
        isCompliant: false,
      };
    }

    const violations = this.checkDirectiveCompliance(policy);
    const recommendations = this.getDirectiveRecommendations(policy);
    
    return {
      violations,
      recommendations,
      policy,
      isCompliant: violations.length === 0,
    };
  }

  private checkDirectiveCompliance(policy: string): string[] {
    const violations: string[] = [];
    const directives = policy.split(';').map(d => d.trim());

    // Check for required directives
    const requiredDirectives = this.params.directives?.length > 0 
      ? this.params.directives 
      : ['default-src', 'script-src', 'style-src', 'img-src'];

    for (const required of requiredDirectives) {
      const hasDirective = directives.some(d => d.startsWith(required));
      if (!hasDirective) {
        violations.push(`Missing required directive: ${required}`);
      }
    }

    // Check for unsafe directives
    const unsafePatterns = [
      /unsafe-inline/,
      /unsafe-eval/,
      /\*'/
    ];

    for (const directive of directives) {
      for (const pattern of unsafePatterns) {
        if (pattern.test(directive)) {
          violations.push(`Potentially unsafe directive found: ${directive}`);
        }
      }
    }

    return violations;
  }

  private getDirectiveRecommendations(policy: string): string[] {
    const recommendations: string[] = [];
    const directives = policy.split(';').map(d => d.trim());

    if (!directives.some(d => d.startsWith('default-src'))) {
      recommendations.push("Add 'default-src' directive as fallback");
    }

    if (!directives.some(d => d.startsWith('script-src'))) {
      recommendations.push("Add 'script-src' directive to control script execution");
    }

    if (!directives.some(d => d.startsWith('object-src'))) {
      recommendations.push("Add 'object-src' directive to prevent object/embed/applet execution");
    }

    if (directives.some(d => d.includes('unsafe-inline'))) {
      recommendations.push("Consider removing 'unsafe-inline' for better security");
    }

    if (directives.some(d => d.includes('unsafe-eval'))) {
      recommendations.push("Consider removing 'unsafe-eval' for better security");
    }

    if (!directives.some(d => d.startsWith('base-uri'))) {
      recommendations.push("Add 'base-uri' directive to control base element");
    }

    if (!directives.some(d => d.startsWith('form-action'))) {
      recommendations.push("Add 'form-action' directive to control form submissions");
    }

    return recommendations;
  }
}
