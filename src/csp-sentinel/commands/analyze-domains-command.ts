import { BaseCSPCommand } from './base-command';
import type { AnalyzeDomainsParams, CSPCommandResult } from '../types/command.types';
import type { CSPDomainAnalysisResult } from '../types/csp';

export class AnalyzeDomainsCommand extends BaseCSPCommand<AnalyzeDomainsParams> {
  constructor(params: AnalyzeDomainsParams) {
    super('analyze-domains', params);
  }

  public execute(): CSPCommandResult {
    try {
      const policy = this.getCurrentCSPPolicy();
      const analysisResult = this.analyzeCSPDomains(policy);
      
      this.logInfo(`Analyzed domains in CSP policy: ${policy.substring(0, 100)}...`);
      
      if (analysisResult.isSecure) {
        this.logSuccess('CSP domain analysis passed - no suspicious domains found');
      } else {
        this.logWarn(`CSP domain analysis found ${analysisResult.suspiciousDomains.length} suspicious domains`);
      }

      return this.createSuccessResult(analysisResult, 'Domain analysis completed');
    } catch (error) {
      this.logError('Failed to analyze CSP domains', error as Error);
      return this.createErrorResult(error as Error, 'Failed to analyze CSP domains');
    }
  }

  private getCurrentCSPPolicy(): string {
    const metaTag = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    return metaTag?.getAttribute('content') || '';
  }

  private analyzeCSPDomains(policy: string): CSPDomainAnalysisResult {
    if (!policy) {
      return {
        suspiciousDomains: [],
        recommendations: ['No CSP policy found for domain analysis'],
        domains: [],
        isSecure: true,
      };
    }

    const domains = this.extractDomainsFromPolicy(policy);
    const suspiciousDomains = this.findSuspiciousDomains(domains);
    const recommendations = this.getDomainRecommendations(domains);
    
    return {
      suspiciousDomains,
      recommendations,
      domains,
      isSecure: suspiciousDomains.length === 0,
    };
  }

  private extractDomainsFromPolicy(policy: string): string[] {
    const domains: string[] = [];
    const directives = policy.split(';').map(d => d.trim());
    
    for (const directive of directives) {
      const parts = directive.split(/\s+/);
      for (const part of parts) {
        if (this.isValidDomain(part)) {
          domains.push(part);
        }
      }
    }
    
    return domains;
  }

  private isValidDomain(domain: string): boolean {
    // Skip CSP keywords and wildcards
    const skipPatterns = [
      /^'self'$/,
      /^'unsafe-inline'$/,
      /^'unsafe-eval'$/,
      /^'none'$/,
      /^\*$/,
      /^data:$/,
      /^blob:$/,
      /^'strict-dynamic'$/,
      /^'unsafe-hashes'$/,
    ];
    
    return !skipPatterns.some(pattern => pattern.test(domain)) && 
           (domain.includes('.') || domain.startsWith('http'));
  }

  private findSuspiciousDomains(domains: string[]): string[] {
    const suspicious: string[] = [];
    
    for (const domain of domains) {
      if (this.isSuspiciousDomain(domain)) {
        suspicious.push(domain);
      }
    }
    
    return suspicious;
  }

  private isSuspiciousDomain(domain: string): boolean {
    // Check against allowed domains if provided
    if (this.params.domains && this.params.domains.length > 0) {
      return !this.params.domains.some(allowed => 
        domain.includes(allowed) || allowed.includes(domain)
      );
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /\.tk$/,
      /\.ml$/,
      /\.ga$/,
      /\.cf$/,
      /bit\.ly/,
      /tinyurl/,
      /goo\.gl/,
      /t\.co/,
      /short\.link/,
      /is\.gd/,
      /v\.gd/,
      /ow\.ly/,
      /buff\.ly/,
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(domain));
  }

  private getDomainRecommendations(domains: string[]): string[] {
    const recommendations: string[] = [];
    
    if (domains.length === 0) {
      recommendations.push('No domains found in CSP policy');
      return recommendations;
    }
    
    const wildcardDomains = domains.filter(d => d.includes('*'));
    if (wildcardDomains.length > 0) {
      recommendations.push(`Consider restricting wildcard domains: ${wildcardDomains.join(', ')}`);
    }
    
    const httpDomains = domains.filter(d => d.startsWith('http://'));
    if (httpDomains.length > 0) {
      recommendations.push(`Consider using HTTPS for: ${httpDomains.join(', ')}`);
    }

    const ipAddresses = domains.filter(d => /^\d+\.\d+\.\d+\.\d+/.test(d));
    if (ipAddresses.length > 0) {
      recommendations.push(`Consider using domain names instead of IP addresses: ${ipAddresses.join(', ')}`);
    }

    const localhostDomains = domains.filter(d => d.includes('localhost') || d.includes('127.0.0.1'));
    if (localhostDomains.length > 0) {
      recommendations.push(`Remove localhost domains from production CSP: ${localhostDomains.join(', ')}`);
    }
    
    return recommendations;
  }
}
