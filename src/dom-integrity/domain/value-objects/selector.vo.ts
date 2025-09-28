import type { ValueObject } from '../../../shared/types/domain.types';

export class Selector implements ValueObject {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Selector cannot be empty');
    }
    this._value = value.trim();
  }

  get value(): string {
    return this._value;
  }

  equals(valueObject: ValueObject): boolean {
    if (!(valueObject instanceof Selector)) return false;
    return this._value === valueObject._value;
  }

  isValid(): boolean {
    try {
      // Basic validation - check if it's a valid CSS selector
      document.querySelector(this._value);
      return true;
    } catch {
      return false;
    }
  }

  toString(): string {
    return this._value;
  }
}
