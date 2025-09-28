import type { ValueObject } from '../../../shared/types/domain.types';

export class Domain implements ValueObject {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Domain cannot be empty');
    }
    
    const trimmedValue = value.trim();
    if (!this.isValidDomain(trimmedValue)) {
      throw new Error(`Invalid domain format: ${trimmedValue}`);
    }
    
    this._value = trimmedValue;
  }

  get value(): string {
    return this._value;
  }

  equals(valueObject: ValueObject): boolean {
    if (!(valueObject instanceof Domain)) return false;
    return this._value === valueObject._value;
  }

  private isValidDomain(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainRegex.test(domain);
  }

  isSuspicious(suspiciousDomains: string[]): boolean {
    return suspiciousDomains.some(suspiciousDomain => 
      this._value.includes(suspiciousDomain) || 
      suspiciousDomain.includes(this._value)
    );
  }

  toString(): string {
    return this._value;
  }
}
