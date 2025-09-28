import type { DomainEntity } from '../../../shared/types/domain.types';

export interface IframeData {
  readonly src: string;
  readonly sandbox: string;
  readonly allow: string;
  readonly loading: string;
  readonly width: string;
  readonly height: string;
}

export class IframeElement implements DomainEntity {
  public readonly id: string;
  public readonly iframeData: IframeData | null;
  public readonly found: boolean;
  public readonly detectedAt: Date;

  constructor(
    id: string,
    iframeData: IframeData | null,
    found: boolean,
    detectedAt: Date = new Date()
  ) {
    this.id = id;
    this.iframeData = iframeData;
    this.found = found;
    this.detectedAt = detectedAt;
  }

  equals(entity: DomainEntity): boolean {
    if (!(entity instanceof IframeElement)) return false;
    return this.id === entity.id;
  }

  isSuspicious(): boolean {
    if (!this.found || !this.iframeData) return false;
    
    // Check for suspicious iframe attributes
    return (
      !this.iframeData.sandbox ||
      this.iframeData.src.includes('javascript:') ||
      this.iframeData.src.startsWith('data:')
    );
  }

  getSecurityInfo(): string {
    if (!this.found || !this.iframeData) {
      return 'No iframes detected';
    }
    
    return `Iframe found with src="${this.iframeData.src}" and sandbox="${this.iframeData.sandbox}"`;
  }
}
