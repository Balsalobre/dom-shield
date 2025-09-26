export type CSPViolationReport = {
  "blocked-uri": string;
  "document-uri": string;
  "effective-directive": string;
  "original-policy": string;
  referrer: string;
  "script-sample": string;
  "status-code": number;
  "violated-directive": string;
};

export type CSPReportData = {
  timestamp: string;
  userAgent: string;
  url: string;
  violation: CSPViolationReport;
  additionalInfo?: Record<string, any>;
}

export type CSPMonitorConfig = {
  readonly endpoint: string;
  readonly maxQueueSize: number;
}

export type CSPMonitorStatus = {
  readonly enabled: boolean;
  readonly endpoint: string;
  readonly queuedReports: number;
  readonly maxQueueSize: number;
}
