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
};

export type CSPMonitorConfig = {
  readonly endpoint: string;
  readonly maxQueueSize: number;
};

export type CSPMonitorStatus = {
  readonly enabled: boolean;
  readonly endpoint: string;
  readonly queuedReports: number;
  readonly maxQueueSize: number;
};

// New types for command handler pattern
export type CSPDirectiveAnalysisResult = {
  violations: string[];
  recommendations: string[];
  policy: string;
  isCompliant: boolean;
};

export type CSPDomainAnalysisResult = {
  suspiciousDomains: string[];
  recommendations: string[];
  domains: string[];
  isSecure: boolean;
};

export type CSPViolationAnalysisResult = {
  totalViolations: number;
  recentViolations: CSPReportData[];
  topViolatedDirectives: Array<{ directive: string; count: number }>;
  riskLevel: 'low' | 'medium' | 'high';
};

export type CSPComprehensiveStatus = {
  monitoring: CSPMonitorStatus;
  violations: CSPViolationAnalysisResult;
  directives: CSPDirectiveAnalysisResult;
  domains: CSPDomainAnalysisResult;
  lastUpdated: string;
};
