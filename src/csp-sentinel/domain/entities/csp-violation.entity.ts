import type { DomainEntity } from '../../../shared/types/domain.types';

export interface CSPViolationData {
  readonly blockedUri: string;
  readonly documentUri: string;
  readonly effectiveDirective: string;
  readonly originalPolicy: string;
  readonly referrer: string;
  readonly scriptSample: string;
  readonly statusCode: number;
  readonly violatedDirective: string;
}

export class CSPViolation implements DomainEntity {
  public readonly id: string;
  public readonly violationData: CSPViolationData;
  public readonly timestamp: Date;
  public readonly userAgent: string;
  public readonly url: string;
  public readonly additionalInfo: Record<string, any>;

  constructor(
    id: string,
    violationData: CSPViolationData,
    timestamp: Date = new Date(),
    userAgent: string = navigator.userAgent,
    url: string = window.location.href,
    additionalInfo: Record<string, any> = {}
  ) {
    this.id = id;
    this.violationData = violationData;
    this.timestamp = timestamp;
    this.userAgent = userAgent;
    this.url = url;
    this.additionalInfo = additionalInfo;
  }

  equals(entity: DomainEntity): boolean {
    if (!(entity instanceof CSPViolation)) return false;
    return this.id === entity.id;
  }

  isHighRisk(): boolean {
    return (
      this.violationData.violatedDirective.includes('script-src') ||
      this.violationData.violatedDirective.includes('object-src') ||
      this.violationData.violatedDirective.includes('base-uri')
    );
  }

  getRiskLevel(): 'low' | 'medium' | 'high' {
    if (this.isHighRisk()) return 'high';
    if (this.violationData.violatedDirective.includes('style-src') || 
        this.violationData.violatedDirective.includes('img-src')) return 'medium';
    return 'low';
  }

  getViolationSummary(): string {
    return `Violation: ${this.violationData.violatedDirective} - Blocked: ${this.violationData.blockedUri}`;
  }
}
