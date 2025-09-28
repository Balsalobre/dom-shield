import type { CSPMonitoringService } from '../../domain/services/csp-monitoring.service';
import { Directive } from '../../domain/value-objects/directive.vo';

export interface AnalyzeDirectivesUseCase {
  execute(directives?: string[], policy?: string): Promise<{
    success: boolean;
    data?: any;
    message?: string;
    error?: Error;
  }>;
}

export class AnalyzeDirectivesUseCaseImpl implements AnalyzeDirectivesUseCase {
  constructor(cspMonitoringService: CSPMonitoringService) {
    this.cspMonitoringService = cspMonitoringService;
  }
  
  private readonly cspMonitoringService: CSPMonitoringService;

  async execute(directives?: string[], _policy?: string): Promise<{
    success: boolean;
    data?: any;
    message?: string;
    error?: Error;
  }> {
    try {
      let directiveVOs: Directive[] = [];
      
      if (directives && directives.length > 0) {
        directiveVOs = directives.map(directiveStr => {
          const [name, ...valueParts] = directiveStr.split(' ');
          return new Directive(name, valueParts.join(' '));
        });
      } else if (_policy) {
        // Parse policy string into directives
        directiveVOs = this.parsePolicyString(_policy);
      } else {
        // Use current page's CSP policy
        directiveVOs = this.getCurrentPageDirectives();
      }

      const cspPolicy = await this.cspMonitoringService.analyzeDirectives(directiveVOs);
      
      return {
        success: true,
        data: {
          isCompliant: cspPolicy.policyData.isCompliant,
          violations: cspPolicy.policyData.violations,
          recommendations: cspPolicy.policyData.recommendations,
          securityScore: cspPolicy.getSecurityScore(),
          directives: cspPolicy.policyData.directives
        },
        message: 'CSP directives analysis completed'
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
        message: 'Failed to analyze CSP directives'
      };
    }
  }

  private parsePolicyString(policyStr: string): Directive[] {
    const directives: Directive[] = [];
    const directiveStrings = policyStr.split(';').filter(d => d.trim());
    
    directiveStrings.forEach(directiveStr => {
      const [name, ...valueParts] = directiveStr.trim().split(' ');
      if (name) {
        directives.push(new Directive(name, valueParts.join(' ')));
      }
    });
    
    return directives;
  }

  private getCurrentPageDirectives(): Directive[] {
    
    // Try to get CSP from meta tag
    const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (metaCSP) {
      const content = metaCSP.getAttribute('content');
      if (content) {
        return this.parsePolicyString(content);
      }
    }
    
    // Try to get CSP from response headers (this would need to be implemented differently in a real app)
    // For now, return some default directives
    return [
      new Directive('default-src', "'self'"),
      new Directive('script-src', "'self' 'unsafe-inline'"),
      new Directive('style-src', "'self' 'unsafe-inline'"),
      new Directive('img-src', "'self' data:")
    ];
  }
}
