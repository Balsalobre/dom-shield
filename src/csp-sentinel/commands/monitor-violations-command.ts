import { BaseCSPCommand } from './base-command';
import type { MonitorViolationsParams, CSPCommandResult } from '../types/command.types';
import type { CSPReportData, CSPViolationReport } from '../types/csp';

export class MonitorViolationsCommand extends BaseCSPCommand<MonitorViolationsParams> {
  private static instance: MonitorViolationsCommand | null = null;
  private reportQueue: readonly CSPReportData[] = [];
  private isEnabled: boolean = false;
  private endpoint: string;
  private maxQueueSize: number;
  private eventHandler: ((event: Event) => Promise<void>) | null = null;

  constructor(params: MonitorViolationsParams) {
    super('monitor-violations', params);
    this.endpoint = params.endpoint || '/csp-violations';
    this.maxQueueSize = params.maxQueueSize || 100;
  }

  public static getInstance(params: MonitorViolationsParams): MonitorViolationsCommand {
    if (!MonitorViolationsCommand.instance) {
      MonitorViolationsCommand.instance = new MonitorViolationsCommand(params);
    }
    return MonitorViolationsCommand.instance;
  }

  public execute(): CSPCommandResult {
    try {
      this.initializeSecurityMonitoring();
      this.logSuccess(`Violation monitoring initialized with endpoint: ${this.endpoint}`);
      
      return this.createSuccessResult({
        endpoint: this.endpoint,
        maxQueueSize: this.maxQueueSize,
        isEnabled: this.isEnabled,
      }, 'Violation monitoring initialized successfully');
    } catch (error) {
      this.logError('Failed to initialize violation monitoring', error as Error);
      return this.createErrorResult(error as Error, 'Failed to initialize violation monitoring');
    }
  }

  private initializeSecurityMonitoring(): void {
    if (this.eventHandler) {
      document.removeEventListener('securitypolicyviolation', this.eventHandler);
    }

    this.eventHandler = this.handleSecurityPolicyViolation.bind(this);
    document.addEventListener('securitypolicyviolation', this.eventHandler);
  }

  private async handleSecurityPolicyViolation(event: Event): Promise<void> {
    const violationEvent = event as SecurityPolicyViolationEvent;
    const violationReport = this.createViolationReport(violationEvent);

    this.logWarn(`CSP Violation detected: ${violationReport.violation['violated-directive']}`);
    this.queueReport(violationReport);

    if (this.isEnabled) {
      await this.sendReportToEndpoint(violationReport);
    }
  }

  private createViolationReport(event: SecurityPolicyViolationEvent): CSPReportData {
    const violation: CSPViolationReport = Object.freeze({
      "blocked-uri": event.blockedURI || "",
      "document-uri": event.documentURI || "",
      "effective-directive": event.effectiveDirective || "",
      "original-policy": event.originalPolicy || "",
      referrer: event.referrer || "",
      "script-sample": event.sample || "",
      "status-code": event.statusCode || 0,
      "violated-directive": event.violatedDirective || "",
    });

    return Object.freeze({
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      violation,
      additionalInfo: {
        lineNumber: event.lineNumber,
        columnNumber: event.columnNumber,
        sourceFile: event.sourceFile,
      },
    });
  }

  private queueReport(report: CSPReportData): void {
    const updatedQueue = [...this.reportQueue, report];

    this.reportQueue = Object.freeze(
      updatedQueue.length > this.maxQueueSize
        ? updatedQueue.slice(1)
        : updatedQueue
    );
  }

  private async sendReportToEndpoint(report: CSPReportData): Promise<boolean> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });

      if (response.ok) {
        this.logSuccess('CSP violation report sent successfully');
        return true;
      }

      this.logError(`Failed to send CSP report: ${response.status}`);
      return false;
    } catch (error) {
      this.logError('Error sending CSP report', error as Error);
      return false;
    }
  }

  public enableMonitoring(): void {
    this.isEnabled = true;
    this.logSuccess('CSP monitoring enabled');
  }

  public disableMonitoring(): void {
    this.isEnabled = false;
    this.logInfo('CSP monitoring disabled');
  }

  public getQueuedReports(): readonly CSPReportData[] {
    return this.reportQueue;
  }

  public clearReportQueue(): void {
    const clearedCount = this.reportQueue.length;
    this.reportQueue = Object.freeze([]);
    this.logInfo(`Cleared ${clearedCount} queued CSP reports`);
  }

  public async sendQueuedReports(): Promise<void> {
    if (this.reportQueue.length === 0) {
      this.logInfo('No queued reports to send');
      return;
    }

    this.logInfo(`Sending ${this.reportQueue.length} queued reports...`);
    const remainingReports: CSPReportData[] = [];

    for (const report of this.reportQueue) {
      const wasSentSuccessfully = await this.sendReportToEndpoint(report);
      if (!wasSentSuccessfully) {
        remainingReports.push(report);
      }
    }

    this.reportQueue = Object.freeze(remainingReports);
  }

  public getStatus() {
    return {
      enabled: this.isEnabled,
      endpoint: this.endpoint,
      queuedReports: this.reportQueue.length,
      maxQueueSize: this.maxQueueSize,
    };
  }

  public destroy(): void {
    if (this.eventHandler) {
      document.removeEventListener('securitypolicyviolation', this.eventHandler);
      this.eventHandler = null;
    }
    MonitorViolationsCommand.instance = null;
  }
}
