import type { DomainEntity } from '../../../shared/types/domain.types';

export interface CSPDirective {
  readonly name: string;
  readonly value: string;
  readonly isRequired: boolean;
}

export interface CSPPolicyData {
  readonly directives: CSPDirective[];
  readonly isCompliant: boolean;
  readonly violations: string[];
  readonly recommendations: string[];
}

export class CSPPolicy implements DomainEntity {
  public readonly id: string;
  public readonly policyData: CSPPolicyData;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(
    id: string,
    policyData: CSPPolicyData,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.policyData = policyData;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  equals(entity: DomainEntity): boolean {
    if (!(entity instanceof CSPPolicy)) return false;
    return this.id === entity.id;
  }

  hasDirective(directiveName: string): boolean {
    return this.policyData.directives.some(d => d.name === directiveName);
  }

  getDirectiveValue(directiveName: string): string | undefined {
    const directive = this.policyData.directives.find(d => d.name === directiveName);
    return directive?.value;
  }

  isSecure(): boolean {
    return this.policyData.isCompliant && 
           this.hasDirective('default-src') && 
           this.hasDirective('script-src');
  }

  getSecurityScore(): number {
    let score = 0;
    const requiredDirectives = ['default-src', 'script-src', 'style-src', 'img-src'];
    
    requiredDirectives.forEach(directive => {
      if (this.hasDirective(directive)) score += 25;
    });
    
    if (this.policyData.isCompliant) score += 10;
    
    return Math.min(score, 100);
  }
}
