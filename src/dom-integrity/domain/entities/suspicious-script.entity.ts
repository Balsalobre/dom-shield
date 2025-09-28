import type { DomainEntity } from '../../../shared/types/domain.types';

export interface ScriptData {
  readonly src: string;
  readonly type: string;
  readonly async: boolean;
  readonly defer: boolean;
  readonly integrity: string;
  readonly crossorigin: string;
}

export class SuspiciousScript implements DomainEntity {
  public readonly id: string;
  public readonly scriptData: ScriptData;
  public readonly suspiciousDomains: string[];
  public readonly detectedAt: Date;

  constructor(
    id: string,
    scriptData: ScriptData,
    suspiciousDomains: string[],
    detectedAt: Date = new Date()
  ) {
    this.id = id;
    this.scriptData = scriptData;
    this.suspiciousDomains = suspiciousDomains;
    this.detectedAt = detectedAt;
  }

  equals(entity: DomainEntity): boolean {
    if (!(entity instanceof SuspiciousScript)) return false;
    return this.id === entity.id;
  }

  isSuspicious(): boolean {
    if (!this.scriptData.src) return false;
    
    return this.suspiciousDomains.some(domain => 
      this.scriptData.src.includes(domain)
    );
  }

  getSuspiciousReason(): string {
    if (!this.isSuspicious()) return 'Script is not suspicious';
    
    const matchingDomains = this.suspiciousDomains.filter(domain => 
      this.scriptData.src.includes(domain)
    );
    
    return `Script loaded from suspicious domain(s): ${matchingDomains.join(', ')}`;
  }
}
