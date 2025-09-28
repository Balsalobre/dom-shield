// Main CSP Sentinel module with Command Handler pattern
export { getCSPCommandExecutor, CSPCommandFactory } from './command-executor';
export { CSPSentinelCommandExecutor } from './command-executor';

// Export command types
export type {
  CSPCommand,
  CSPCommandResult,
  CSPCommandHandler,
  CSPCommandExecutor,
  CSPCommandType,
  CSPCommandParams,
  MonitorViolationsParams,
  AnalyzeDirectivesParams,
  AnalyzeDomainsParams,
  EnableMonitoringParams,
  DisableMonitoringParams,
  GetStatusParams,
  ClearQueueParams,
  SendQueuedReportsParams,
  GetQueuedReportsParams,
} from './types/command.types';

// Export CSP types
export type {
  CSPViolationReport,
  CSPReportData,
  CSPMonitorConfig,
  CSPMonitorStatus,
  CSPDirectiveAnalysisResult,
  CSPDomainAnalysisResult,
  CSPViolationAnalysisResult,
  CSPComprehensiveStatus,
} from './types/csp';

// Export individual commands for direct usage
export { MonitorViolationsCommand } from './commands/monitor-violations-command';
export { AnalyzeDirectivesCommand } from './commands/analyze-directives-command';
export { AnalyzeDomainsCommand } from './commands/analyze-domains-command';
export { EnableMonitoringCommand } from './commands/enable-monitoring-command';
export { DisableMonitoringCommand } from './commands/disable-monitoring-command';
export { GetStatusCommand } from './commands/get-status-command';
export { ClearQueueCommand } from './commands/clear-queue-command';
export { SendQueuedReportsCommand } from './commands/send-queued-reports-command';
export { GetQueuedReportsCommand } from './commands/get-queued-reports-command';

// High-level API for easy usage
export class CSPSentinel {
  private executor = getCSPCommandExecutor();

  // Monitoring commands
  async startMonitoring(params: { endpoint?: string; maxQueueSize?: number }) {
    return this.executor.execute(CSPCommandFactory.createMonitorViolationsCommand(params));
  }

  async enableMonitoring(params: { sendQueued?: boolean } = {}) {
    return this.executor.execute(CSPCommandFactory.createEnableMonitoringCommand(params));
  }

  async disableMonitoring(params: { clearQueue?: boolean } = {}) {
    return this.executor.execute(CSPCommandFactory.createDisableMonitoringCommand(params));
  }

  // Analysis commands
  async analyzeDirectives(params: { directives?: string[]; policy?: string } = {}) {
    return this.executor.execute(CSPCommandFactory.createAnalyzeDirectivesCommand(params));
  }

  async analyzeDomains(params: { domains?: string[]; policy?: string } = {}) {
    return this.executor.execute(CSPCommandFactory.createAnalyzeDomainsCommand(params));
  }

  // Status and management commands
  async getStatus(params: { includeQueue?: boolean } = {}) {
    return this.executor.execute(CSPCommandFactory.createGetStatusCommand(params));
  }

  async getQueuedReports(params: { limit?: number; offset?: number } = {}) {
    return this.executor.execute(CSPCommandFactory.createGetQueuedReportsCommand(params));
  }

  async clearQueue(params: { confirm?: boolean } = {}) {
    return this.executor.execute(CSPCommandFactory.createClearQueueCommand(params));
  }

  async sendQueuedReports(params: { maxRetries?: number } = {}) {
    return this.executor.execute(CSPCommandFactory.createSendQueuedReportsCommand(params));
  }

  // Comprehensive analysis
  async runFullAnalysis(params: {
    directives?: string[];
    domains?: string[];
    includeQueue?: boolean;
  } = {}) {
    const results = await Promise.allSettled([
      this.analyzeDirectives({ directives: params.directives }),
      this.analyzeDomains({ domains: params.domains }),
      this.getStatus({ includeQueue: params.includeQueue }),
    ]);

    return {
      directives: results[0].status === 'fulfilled' ? results[0].value : null,
      domains: results[1].status === 'fulfilled' ? results[1].value : null,
      status: results[2].status === 'fulfilled' ? results[2].value : null,
      errors: results.filter(r => r.status === 'rejected').map(r => (r as PromiseRejectedResult).reason),
    };
  }
}

// Singleton instance
let cspSentinelInstance: CSPSentinel | null = null;

export function getCSPSentinel(): CSPSentinel {
  if (!cspSentinelInstance) {
    cspSentinelInstance = new CSPSentinel();
  }
  return cspSentinelInstance;
}

// Convenience function for quick setup
export async function setupCSPSentinel(config: {
  endpoint?: string;
  maxQueueSize?: number;
  enableMonitoring?: boolean;
  runAnalysis?: boolean;
  directives?: string[];
  domains?: string[];
}) {
  const sentinel = getCSPSentinel();
  
  // Start monitoring
  await sentinel.startMonitoring({
    endpoint: config.endpoint,
    maxQueueSize: config.maxQueueSize,
  });

  // Enable monitoring if requested
  if (config.enableMonitoring) {
    await sentinel.enableMonitoring();
  }

  // Run analysis if requested
  if (config.runAnalysis) {
    await sentinel.runFullAnalysis({
      directives: config.directives,
      domains: config.domains,
    });
  }

  return sentinel;
}
