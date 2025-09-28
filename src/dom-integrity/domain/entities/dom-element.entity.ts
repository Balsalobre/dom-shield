import type { DomainEntity } from '../../../shared/types/domain.types';

export interface DOMElementAttributes {
  readonly [key: string]: string;
}

export interface DOMElementData {
  readonly tagName: string;
  readonly className: string;
  readonly id: string;
  readonly attributes: DOMElementAttributes;
}

export class DOMElement implements DomainEntity {
  public readonly id: string;
  public readonly selector: string;
  public readonly elementData: DOMElementData | null;
  public readonly found: boolean;
  public readonly detectedAt: Date;

  constructor(
    id: string,
    selector: string,
    elementData: DOMElementData | null,
    found: boolean,
    detectedAt: Date = new Date()
  ) {
    this.id = id;
    this.selector = selector;
    this.elementData = elementData;
    this.found = found;
    this.detectedAt = detectedAt;
  }

  equals(entity: DomainEntity): boolean {
    if (!(entity instanceof DOMElement)) return false;
    return this.id === entity.id;
  }

  isSuspicious(): boolean {
    return this.found;
  }

  getElementInfo(): string {
    if (!this.found || !this.elementData) {
      return `Element not found for selector: ${this.selector}`;
    }
    
    return `Found ${this.elementData.tagName} with id="${this.elementData.id}" and class="${this.elementData.className}"`;
  }
}
