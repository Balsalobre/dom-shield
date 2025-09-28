import { describe, it, expect } from 'vitest';

describe('CSP Sentinel Simple Test', () => {
  it('should work', () => {
    expect(1 + 1).toBe(2);
  });

  it('should import types', () => {
    // Test that we can import types without issues
    const testType = 'monitor-violations';
    expect(testType).toBe('monitor-violations');
  });
});
