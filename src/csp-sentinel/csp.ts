// CSP (Content Security Policy) monitoring for DOM Shield

export interface CSPViolationReport {
    'blocked-uri': string;
    'document-uri': string;
    'effective-directive': string;
    'original-policy': string;
    referrer: string;
    'script-sample': string;
    'status-code': number;
    'violated-directive': string;
}

export interface CSPReportData {
    timestamp: string;
    userAgent: string;
    url: string;
    violation: CSPViolationReport;
    additionalInfo?: Record<string, any>;
}

export class CSPMonitor {
    private endpoint: string;
    private isEnabled: boolean = false;
    private reportQueue: CSPReportData[] = [];
    private maxQueueSize: number = 100;

    constructor(endpoint: string = '/csp-violations') {
        this.endpoint = endpoint;
        this.init();
    }

    private init() {
        // Listen for CSP violations
        document.addEventListener('securitypolicyviolation', (event) => {
            this.handleCSPViolation(event as SecurityPolicyViolationEvent);
        });

        console.log('🛡️ DOM Shield CSP Monitor initialized');
        console.log(`📍 Reports will be sent to: ${this.endpoint}`);
    }

    private async handleCSPViolation(event: SecurityPolicyViolationEvent) {
        const report: CSPReportData = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            violation: {
                'blocked-uri': event.blockedURI || '',
                'document-uri': event.documentURI || '',
                'effective-directive': event.effectiveDirective || '',
                'original-policy': event.originalPolicy || '',
                'referrer': event.referrer || '',
                'script-sample': event.sample || '',
                'status-code': event.statusCode || 0,
                'violated-directive': event.violatedDirective || ''
            },
            additionalInfo: {
                lineNumber: event.lineNumber,
                columnNumber: event.columnNumber,
                sourceFile: event.sourceFile
            }
        };

        // Log locally first
        console.warn('🚨 CSP Violation detected:', report);

        // Add to queue
        this.addToQueue(report);

        // Send if monitoring is enabled
        if (this.isEnabled) {
            await this.sendReport(report);
        }
    }

    private addToQueue(report: CSPReportData) {
        this.reportQueue.push(report);

        // Keep queue size manageable
        if (this.reportQueue.length > this.maxQueueSize) {
            this.reportQueue.shift(); // Remove oldest report
        }
    }

    private async sendReport(report: CSPReportData): Promise<boolean> {
        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(report)
            });

            if (response.ok) {
                console.log('✅ CSP violation report sent successfully');
                return true;
            } else {
                console.error('❌ Failed to send CSP report:', response.status);
                return false;
            }
        } catch (error) {
            console.error('❌ Error sending CSP report:', error);
            return false;
        }
    }

    // Public methods
    public enable() {
        this.isEnabled = true;
        console.log('✅ CSP monitoring enabled');

        // Send queued reports
        if (this.reportQueue.length > 0) {
            console.log(`📤 Sending ${this.reportQueue.length} queued reports...`);
            this.reportQueue.forEach(report => this.sendReport(report));
        }
    }

    public disable() {
        this.isEnabled = false;
        console.log('⏸️ CSP monitoring disabled');
    }

    public getQueuedReports(): CSPReportData[] {
        return [...this.reportQueue];
    }

    public clearQueue() {
        const count = this.reportQueue.length;
        this.reportQueue = [];
        console.log(`🗑️ Cleared ${count} queued CSP reports`);
    }

    public async sendQueuedReports(): Promise<void> {
        if (this.reportQueue.length === 0) {
            console.log('📭 No queued reports to send');
            return;
        }

        console.log(`📤 Sending ${this.reportQueue.length} queued reports...`);

        for (const report of this.reportQueue) {
            const success = await this.sendReport(report);
            if (success) {
                // Remove sent report from queue
                const index = this.reportQueue.indexOf(report);
                if (index > -1) {
                    this.reportQueue.splice(index, 1);
                }
            }
        }
    }

    public getStatus() {
        return {
            enabled: this.isEnabled,
            endpoint: this.endpoint,
            queuedReports: this.reportQueue.length,
            maxQueueSize: this.maxQueueSize
        };
    }
}
