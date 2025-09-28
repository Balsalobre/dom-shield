// Test setup file for Vitest
// This file is used to configure the test environment

// Mock SecurityPolicyViolationEvent for tests
declare global {
  interface SecurityPolicyViolationEvent extends Event {
    readonly blockedURI: string;
    readonly documentURI: string;
    readonly effectiveDirective: string;
    readonly originalPolicy: string;
    readonly referrer: string;
    readonly sample: string;
    readonly statusCode: number;
    readonly violatedDirective: string;
    readonly lineNumber?: number;
    readonly columnNumber?: number;
    readonly sourceFile?: string;
  }
}

// Mock the SecurityPolicyViolationEvent constructor
if (typeof globalThis.SecurityPolicyViolationEvent === 'undefined') {
  globalThis.SecurityPolicyViolationEvent = class SecurityPolicyViolationEvent extends Event {
    constructor(
      type: string,
      eventInitDict: {
        blockedURI?: string;
        documentURI?: string;
        effectiveDirective?: string;
        originalPolicy?: string;
        referrer?: string;
        sample?: string;
        statusCode?: number;
        violatedDirective?: string;
        lineNumber?: number;
        columnNumber?: number;
        sourceFile?: string;
      } = {}
    ) {
      super(type);
      Object.assign(this, eventInitDict);
    }
  } as any;
}
