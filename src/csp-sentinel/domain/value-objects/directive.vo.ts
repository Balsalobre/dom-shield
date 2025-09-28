import type { ValueObject } from '../../../shared/types/domain.types';

export class Directive implements ValueObject {
  private readonly _name: string;
  private readonly _value: string;

  constructor(name: string, value: string) {
    if (!name || name.trim().length === 0) {
      throw new Error('Directive name cannot be empty');
    }
    
    this._name = name.trim();
    this._value = value || '';
  }

  get name(): string {
    return this._name;
  }

  get value(): string {
    return this._value;
  }

  equals(valueObject: ValueObject): boolean {
    if (!(valueObject instanceof Directive)) return false;
    return this._name === valueObject._name && this._value === valueObject._value;
  }

  isRequired(): boolean {
    const requiredDirectives = ['default-src', 'script-src'];
    return requiredDirectives.includes(this._name);
  }

  isSecure(): boolean {
    if (this._name === 'script-src') {
      return !this._value.includes('unsafe-inline') && !this._value.includes('unsafe-eval');
    }
    if (this._name === 'object-src') {
      return this._value === "'none'";
    }
    return true;
  }

  getSecurityRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this._name === 'script-src' && this._value.includes('unsafe-inline')) {
      recommendations.push('Avoid unsafe-inline in script-src for better security');
    }
    
    if (this._name === 'script-src' && this._value.includes('unsafe-eval')) {
      recommendations.push('Avoid unsafe-eval in script-src for better security');
    }
    
    if (this._name === 'object-src' && this._value !== "'none'") {
      recommendations.push('Consider setting object-src to none');
    }
    
    return recommendations;
  }

  toString(): string {
    return `${this._name} ${this._value}`.trim();
  }
}
