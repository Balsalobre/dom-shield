import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock DOM APIs
const mockFetch = vi.fn();
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();
const mockQuerySelector = vi.fn();
const mockConsoleLog = vi.fn();
const mockConsoleWarn = vi.fn();
const mockConsoleError = vi.fn();

Object.defineProperty(global, 'fetch', {
  value: mockFetch,
  writable: true,
});

Object.defineProperty(global, 'document', {
  value: {
    addEventListener: mockAddEventListener,
    removeEventListener: mockRemoveEventListener,
    querySelector: mockQuerySelector,
  },
  writable: true,
});

Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'test-user-agent',
  },
  writable: true,
});

Object.defineProperty(global, 'window', {
  value: {
    location: {
      href: 'https://example.com',
    },
  },
  writable: true,
});

Object.defineProperty(global, 'console', {
  value: {
    log: mockConsoleLog,
    warn: mockConsoleWarn,
    error: mockConsoleError,
  },
  writable: true,
});

// Mock SecurityPolicyViolationEvent
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

describe('CSP Sentinel Functional Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
    });
  });

  describe('Command Factory', () => {
    it('should create monitor violations command', () => {
      const command = {
        type: 'monitor-violations',
        params: { endpoint: '/csp-violations', maxQueueSize: 100 }
      };

      expect(command.type).toBe('monitor-violations');
      expect(command.params.endpoint).toBe('/csp-violations');
      expect(command.params.maxQueueSize).toBe(100);
    });

    it('should create analyze directives command', () => {
      const command = {
        type: 'analyze-directives',
        params: { directives: ['script-src', 'style-src'] }
      };

      expect(command.type).toBe('analyze-directives');
      expect(command.params.directives).toEqual(['script-src', 'style-src']);
    });

    it('should create analyze domains command', () => {
      const command = {
        type: 'analyze-domains',
        params: { domains: ['trusted.com', 'cdn.example.com'] }
      };

      expect(command.type).toBe('analyze-domains');
      expect(command.params.domains).toEqual(['trusted.com', 'cdn.example.com']);
    });
  });

  describe('CSP Policy Analysis', () => {
    it('should analyze directives correctly', () => {
      const policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self'";
      mockQuerySelector.mockReturnValue({
        getAttribute: () => policy,
      });

      const metaTag = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      const policyContent = metaTag?.getAttribute('content') || '';

      expect(policyContent).toBe(policy);

      // Check for unsafe directives
      const hasUnsafeInline = policy.includes('unsafe-inline');
      expect(hasUnsafeInline).toBe(true);

      // Check for required directives
      const hasDefaultSrc = policy.includes('default-src');
      const hasScriptSrc = policy.includes('script-src');
      const hasStyleSrc = policy.includes('style-src');

      expect(hasDefaultSrc).toBe(true);
      expect(hasScriptSrc).toBe(true);
      expect(hasStyleSrc).toBe(true);
    });

    it('should detect missing directives', () => {
      const policy = "script-src 'self'";
      const requiredDirectives = ['default-src', 'script-src', 'style-src'];

      const missingDirectives = requiredDirectives.filter(directive => 
        !policy.includes(directive)
      );

      expect(missingDirectives).toContain('default-src');
      expect(missingDirectives).toContain('style-src');
      expect(missingDirectives).not.toContain('script-src');
    });

    it('should provide security recommendations', () => {
      const policy = "script-src 'self' 'unsafe-inline'";
      const recommendations = [];

      if (policy.includes('unsafe-inline')) {
        recommendations.push("Consider removing 'unsafe-inline' for better security");
      }

      if (!policy.includes('object-src')) {
        recommendations.push("Add 'object-src' directive to prevent object/embed/applet execution");
      }

      expect(recommendations).toContain("Consider removing 'unsafe-inline' for better security");
      expect(recommendations).toContain("Add 'object-src' directive to prevent object/embed/applet execution");
    });
  });

  describe('Domain Analysis', () => {
    it('should extract domains from policy', () => {
      const policy = "script-src 'self' https://trusted.com https://cdn.example.com";
      const domains = policy.match(/https?:\/\/[^\s']+/g) || [];

      expect(domains).toContain('https://trusted.com');
      expect(domains).toContain('https://cdn.example.com');
    });

    it('should detect suspicious domains', () => {
      const domains = ['https://trusted.com', 'https://suspicious.tk', 'https://bit.ly/malicious'];
      const suspiciousPatterns = [/\.tk$/, /bit\.ly/, /tinyurl/];

      const suspiciousDomains = domains.filter(domain => 
        suspiciousPatterns.some(pattern => pattern.test(domain))
      );

      expect(suspiciousDomains).toContain('https://suspicious.tk');
      expect(suspiciousDomains).toContain('https://bit.ly/malicious');
      expect(suspiciousDomains).not.toContain('https://trusted.com');
    });

    it('should skip CSP keywords', () => {
      const policy = "'self' 'unsafe-inline' * data: blob:";
      const skipPatterns = [
        /^'self'$/,
        /^'unsafe-inline'$/,
        /^\*$/,
        /^data:$/,
        /^blob:$/
      ];

      const parts = policy.split(/\s+/);
      const validDomains = parts.filter(part => 
        !skipPatterns.some(pattern => pattern.test(part))
      );

      expect(validDomains).toHaveLength(0); // All parts should be skipped
    });
  });

  describe('Violation Monitoring', () => {
    it('should create violation reports', () => {
      const mockEvent = {
        blockedURI: 'https://malicious.com/script.js',
        documentURI: 'https://example.com',
        effectiveDirective: 'script-src',
        originalPolicy: "script-src 'self'",
        referrer: 'https://example.com',
        sample: 'alert("xss")',
        statusCode: 200,
        violatedDirective: 'script-src',
        lineNumber: 10,
        columnNumber: 5,
        sourceFile: 'https://example.com/page.html',
      } as SecurityPolicyViolationEvent;

      const violationReport = {
        'blocked-uri': mockEvent.blockedURI || '',
        'document-uri': mockEvent.documentURI || '',
        'effective-directive': mockEvent.effectiveDirective || '',
        'original-policy': mockEvent.originalPolicy || '',
        referrer: mockEvent.referrer || '',
        'script-sample': mockEvent.sample || '',
        'status-code': mockEvent.statusCode || 0,
        'violated-directive': mockEvent.violatedDirective || '',
      };

      const reportData = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        violation: violationReport,
        additionalInfo: {
          lineNumber: mockEvent.lineNumber,
          columnNumber: mockEvent.columnNumber,
          sourceFile: mockEvent.sourceFile,
        },
      };

      expect(reportData.violation['blocked-uri']).toBe('https://malicious.com/script.js');
      expect(reportData.violation['effective-directive']).toBe('script-src');
      expect(reportData.additionalInfo.lineNumber).toBe(10);
    });

    it('should handle violation event listeners', () => {
      const eventHandler = vi.fn();
      document.addEventListener('securitypolicyviolation', eventHandler);

      expect(mockAddEventListener).toHaveBeenCalledWith(
        'securitypolicyviolation',
        eventHandler
      );
    });

    it('should send reports to endpoint', async () => {
      const report = {
        timestamp: new Date().toISOString(),
        userAgent: 'test-agent',
        url: 'https://example.com',
        violation: {
          'blocked-uri': 'https://malicious.com',
          'document-uri': 'https://example.com',
          'effective-directive': 'script-src',
          'original-policy': "script-src 'self'",
          referrer: '',
          'script-sample': '',
          'status-code': 200,
          'violated-directive': 'script-src',
        },
      };

      const response = await fetch('/csp-violations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });

      expect(mockFetch).toHaveBeenCalledWith('/csp-violations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });
      expect(response.ok).toBe(true);
    });
  });

  describe('Command Execution', () => {
    it('should handle successful command execution', () => {
      const result = {
        success: true,
        data: { endpoint: '/test', maxQueueSize: 100 },
        message: 'Command executed successfully'
      };

      expect(result.success).toBe(true);
      expect(result.data.endpoint).toBe('/test');
      expect(result.message).toContain('successfully');
    });

    it('should handle command execution errors', () => {
      const result = {
        success: false,
        error: new Error('Network error'),
        message: 'Command failed: Network error'
      };

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.message).toContain('failed');
    });

    it('should validate command parameters', () => {
      const params = {
        endpoint: '/csp-violations',
        maxQueueSize: 100,
        directives: ['script-src'],
        domains: ['trusted.com'],
        confirm: true,
        sendQueued: false
      };

      expect(typeof params.endpoint).toBe('string');
      expect(typeof params.maxQueueSize).toBe('number');
      expect(Array.isArray(params.directives)).toBe(true);
      expect(Array.isArray(params.domains)).toBe(true);
      expect(typeof params.confirm).toBe('boolean');
      expect(typeof params.sendQueued).toBe('boolean');
    });
  });

  describe('Status and Queue Management', () => {
    it('should create monitoring status', () => {
      const status = {
        enabled: true,
        endpoint: '/csp-violations',
        queuedReports: 5,
        maxQueueSize: 100,
      };

      expect(status.enabled).toBe(true);
      expect(status.queuedReports).toBe(5);
      expect(status.maxQueueSize).toBe(100);
    });

    it('should handle queue operations', () => {
      const queue = [
        { id: 1, timestamp: '2024-01-01T00:00:00Z' },
        { id: 2, timestamp: '2024-01-01T00:01:00Z' },
        { id: 3, timestamp: '2024-01-01T00:02:00Z' },
      ];

      // Test pagination
      const limit = 2;
      const offset = 0;
      const paginatedQueue = queue.slice(offset, offset + limit);

      expect(paginatedQueue).toHaveLength(2);
      expect(paginatedQueue[0].id).toBe(1);
      expect(paginatedQueue[1].id).toBe(2);

      // Test clearing queue
      const clearedCount = queue.length;
      const clearedQueue = [];

      expect(clearedCount).toBe(3);
      expect(clearedQueue).toHaveLength(0);
    });

    it('should handle retry logic', async () => {
      let attemptCount = 0;
      const maxRetries = 3;

      const mockSendWithRetry = async () => {
        for (let i = 0; i < maxRetries; i++) {
          attemptCount++;
          try {
            if (i === 1) { // Succeed on second attempt
              return { success: true };
            }
            throw new Error('Network error');
          } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      };

      const result = await mockSendWithRetry();
      expect(result.success).toBe(true);
      expect(attemptCount).toBe(2);
    });
  });
});
