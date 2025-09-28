import type { CSPMonitoringService } from '../../domain/services/csp-monitoring.service';
import type { CSPMonitoringRepository } from '../../domain/repositories/csp-monitoring.repository';
import { CSPViolation } from '../../domain/entities/csp-violation.entity';
import { CSPPolicy } from '../../domain/entities/csp-policy.entity';
import { Endpoint } from '../../domain/value-objects/endpoint.vo';
import { Directive } from '../../domain/value-objects/directive.vo';

export class CSPMonitoringServiceImpl implements CSPMonitoringService {
  private isEnabled: boolean = false;
  private endpoint: Endpoint | null = null;
  private eventHandler: ((event: Event) => Promise<void>) | null = null;
  private violations: CSPViolation[] = [];

  constructor(repository: CSPMonitoringRepository) {
    this.repository = repository;
  }
  
  private readonly repository: CSPMonitoringRepository;

  async startMonitoring(endpoint: Endpoint): Promise<CSPViolation[]> {
    this.endpoint = endpoint;
    this.initializeSecurityMonitoring();
    return this.violations;
  }

  async stopMonitoring(): Promise<void> {
    if (this.eventHandler) {
      document.removeEventListener('securitypolicyviolation', this.eventHandler);
      this.eventHandler = null;
    }
    this.isEnabled = false;
  }

  async enableMonitoring(): Promise<void> {
    this.isEnabled = true;
  }

  async disableMonitoring(): Promise<void> {
    this.isEnabled = false;
  }

  async getStatus(): Promise<{ enabled: boolean; endpoint: string }> {
    return {
      enabled: this.isEnabled,
      endpoint: this.endpoint?.value || ''
    };
  }

  async analyzeDirectives(directives: Directive[]): Promise<CSPPolicy> {
    const violations: string[] = [];
    const recommendations: string[] = [];
    
    directives.forEach(directive => {
      const directiveRecommendations = directive.getSecurityRecommendations();
      recommendations.push(...directiveRecommendations);
      
      if (!directive.isSecure()) {
        violations.push(`Insecure directive: ${directive.toString()}`);
      }
    });

    const isCompliant = violations.length === 0;
    const policyData = {
      directives: directives.map(d => ({
        name: d.name,
        value: d.value,
        isRequired: d.isRequired()
      })),
      isCompliant,
      violations,
      recommendations
    };

    const policy = new CSPPolicy(
      this.generateId(),
      policyData
    );

    await this.repository.savePolicy(policy);
    return policy;
  }

  async analyzeDomains(domains: string[]): Promise<{ suspiciousDomains: string[]; isSecure: boolean }> {
    const suspiciousDomains: string[] = [];
    
    domains.forEach(domain => {
      if (this.isSuspiciousDomain(domain)) {
        suspiciousDomains.push(domain);
      }
    });

    return {
      suspiciousDomains,
      isSecure: suspiciousDomains.length === 0
    };
  }

  private initializeSecurityMonitoring(): void {
    if (this.eventHandler) {
      document.removeEventListener('securitypolicyviolation', this.eventHandler);
    }

    this.eventHandler = this.handleSecurityPolicyViolation.bind(this);
    document.addEventListener('securitypolicyviolation', this.eventHandler);
  }

  private async handleSecurityPolicyViolation(event: Event): Promise<void> {
    const violationEvent = event as SecurityPolicyViolationEvent;
    const violationData = {
      blockedUri: violationEvent.blockedURI || '',
      documentUri: violationEvent.documentURI || '',
      effectiveDirective: violationEvent.effectiveDirective || '',
      originalPolicy: violationEvent.originalPolicy || '',
      referrer: violationEvent.referrer || '',
      scriptSample: violationEvent.sample || '',
      statusCode: violationEvent.statusCode || 0,
      violatedDirective: violationEvent.violatedDirective || '',
    };

    const violation = new CSPViolation(
      this.generateId(),
      violationData,
      new Date(),
      navigator.userAgent,
      window.location.href,
      {
        lineNumber: violationEvent.lineNumber,
        columnNumber: violationEvent.columnNumber,
        sourceFile: violationEvent.sourceFile,
      }
    );

    this.violations.push(violation);
    await this.repository.save(violation);

    if (this.isEnabled && this.endpoint) {
      await this.sendReportToEndpoint(violation);
    }
  }

  private async sendReportToEndpoint(violation: CSPViolation): Promise<boolean> {
    if (!this.endpoint) {
      console.log('📤 CSP Sentinel: No endpoint configurado, saltando envío de reporte');
      return false;
    }

    try {
      const report = {
        type: 'csp-violation',
        timestamp: violation.timestamp.toISOString(),
        userAgent: violation.userAgent,
        url: violation.url,
        violation: violation.violationData,
        additionalInfo: violation.additionalInfo,
      };

      console.log(`📤 CSP Sentinel: Enviando reporte de violación al endpoint ${this.endpoint.value}`, report);

      const response = await fetch(this.endpoint.value, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });

      if (response.ok) {
        console.log(`✅ CSP Sentinel: Reporte enviado exitosamente`);
        return true;
      } else {
        console.error(`❌ CSP Sentinel: Error al enviar reporte: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.error('❌ CSP Sentinel: Error al enviar reporte:', error);
      return false;
    }
  }

  private isSuspiciousDomain(domain: string): boolean {
    const suspiciousPatterns = [
      'malicious',
      'evil',
      'hack',
      'phish',
      'scam',
      'fake',
      'suspicious'
    ];
    
    return suspiciousPatterns.some(pattern => 
      domain.toLowerCase().includes(pattern)
    );
  }

  private generateId(): string {
    return `csp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
