import type { ValueObject } from '../../../shared/types/domain.types';

export class Endpoint implements ValueObject {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Endpoint cannot be empty');
    }
    
    const trimmedValue = value.trim();
    if (!this.isValidEndpoint(trimmedValue)) {
      throw new Error(`Invalid endpoint format: ${trimmedValue}`);
    }
    
    this._value = trimmedValue;
  }

  get value(): string {
    return this._value;
  }

  equals(valueObject: ValueObject): boolean {
    if (!(valueObject instanceof Endpoint)) return false;
    return this._value === valueObject._value;
  }

  private isValidEndpoint(endpoint: string): boolean {
    // Basic validation for endpoint URL
    try {
      new URL(endpoint, window.location.origin);
      return true;
    } catch {
      // If it's a relative path, it should start with /
      return endpoint.startsWith('/');
    }
  }

  isRelative(): boolean {
    return this._value.startsWith('/');
  }

  isAbsolute(): boolean {
    return this._value.startsWith('http://') || this._value.startsWith('https://');
  }

  toString(): string {
    return this._value;
  }
}
