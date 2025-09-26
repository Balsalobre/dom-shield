import type {
  CSPMonitorConfig,
  CSPMonitorStatus,
  CSPReportData,
  CSPViolationReport,
} from "./types/csp";

class CSPMonitor {
  private readonly config: CSPMonitorConfig;
  private isEnabled: boolean = false;
  private reportQueue: readonly CSPReportData[] = [];

  private constructor(endpoint: string = "/csp-violations") {
    this.config = Object.freeze({
      endpoint,
      maxQueueSize: 100,
    });
    this.initializeSecurityMonitoring();
  }

  public static createCSPMonitor(
    endpoint: string = "/csp-violations"
  ): CSPMonitor {
    return new CSPMonitor(endpoint);
  }

  private initializeSecurityMonitoring(): void {
    document.addEventListener(
      "securitypolicyviolation",
      this.handleSecurityPolicyViolation
    );
    console.log("🛡️ DOM Shield CSP Monitor initialized");
    console.log(`📍 Reports will be sent to: ${this.config.endpoint}`);
  }

  private handleSecurityPolicyViolation = async (
    event: Event
  ): Promise<void> => {
    const violationEvent = event as SecurityPolicyViolationEvent;
    const violationReport = this.createViolationReport(violationEvent);

    console.warn("🚨 CSP Violation detected:", violationReport);
    this.queueReport(violationReport);

    if (this.isEnabled) {
      await this.sendReportToEndpoint(violationReport);
    }
  };

  private createViolationReport(
    event: SecurityPolicyViolationEvent
  ): CSPReportData {
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
      updatedQueue.length > this.config.maxQueueSize
        ? updatedQueue.slice(1)
        : updatedQueue
    );
  }

  private async sendReportToEndpoint(report: CSPReportData): Promise<boolean> {
    try {
      const response = await fetch(this.config.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report),
      });

      if (response.ok) {
        console.log("✅ CSP violation report sent successfully");
        return true;
      }

      console.error("❌ Failed to send CSP report:", response.status);
      return false;
    } catch (error) {
      console.error("❌ Error sending CSP report:", error);
      return false;
    }
  }

  private async processQueuedReportsForSending(): Promise<void> {
    if (this.reportQueue.length === 0) {
      console.log("📭 No queued reports to send");
      return;
    }

    console.log(`📤 Sending ${this.reportQueue.length} queued reports...`);
    const remainingReports: CSPReportData[] = [];

    for (const report of this.reportQueue) {
      const wasSentSuccessfully = await this.sendReportToEndpoint(report);
      if (!wasSentSuccessfully) {
        remainingReports.push(report);
      }
    }

    this.reportQueue = Object.freeze(remainingReports);
  }

  public enableMonitoring(): void {
    this.isEnabled = true;
    console.log("✅ CSP monitoring enabled");

    if (this.reportQueue.length > 0) {
      console.log(`📤 Sending ${this.reportQueue.length} queued reports...`);
      this.reportQueue.forEach((report) => this.sendReportToEndpoint(report));
    }
  }

  public disableMonitoring(): void {
    this.isEnabled = false;
    console.log("⏸️ CSP monitoring disabled");
  }

  public getQueuedReports(): readonly CSPReportData[] {
    return this.reportQueue;
  }

  public clearReportQueue(): void {
    const clearedCount = this.reportQueue.length;
    this.reportQueue = Object.freeze([]);
    console.log(`🗑️ Cleared ${clearedCount} queued CSP reports`);
  }

  public async sendQueuedReports(): Promise<void> {
    await this.processQueuedReportsForSending();
  }

  public getMonitoringStatus(): CSPMonitorStatus {
    return Object.freeze({
      enabled: this.isEnabled,
      endpoint: this.config.endpoint,
      queuedReports: this.reportQueue.length,
      maxQueueSize: this.config.maxQueueSize,
    });
  }
}

export const { createCSPMonitor } = CSPMonitor;
