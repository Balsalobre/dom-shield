import { CSPSentinelAdapter } from './infrastructure/adapters/csp-sentinel.adapter';
import type { CommandResult } from '../shared/types/command.types';

export interface CSPSentinelConfig {
  endpoint?: string;
  enableMonitoring?: boolean;
  runAnalysis?: boolean;
  directives?: string[];
  domains?: string[];
}

export class CSPSentinel {
  private adapter = CSPSentinelAdapter.getInstance();

  async startMonitoring(params: { endpoint?: string }): Promise<CommandResult> {
    const command = this.adapter.getCommandFactory().createMonitorViolationsCommand(params);
    return this.adapter.getCommandExecutor().execute(command);
  }

  async enableMonitoring(): Promise<CommandResult> {
    const command = this.adapter.getCommandFactory().createEnableMonitoringCommand({});
    return this.adapter.getCommandExecutor().execute(command);
  }

  async disableMonitoring(): Promise<CommandResult> {
    const command = this.adapter.getCommandFactory().createDisableMonitoringCommand({});
    return this.adapter.getCommandExecutor().execute(command);
  }

  async analyzeDirectives(params: { directives?: string[]; policy?: string } = {}): Promise<CommandResult> {
    const command = this.adapter.getCommandFactory().createAnalyzeDirectivesCommand(params);
    return this.adapter.getCommandExecutor().execute(command);
  }

  async analyzeDomains(params: { domains?: string[]; policy?: string } = {}): Promise<CommandResult> {
    const command = this.adapter.getCommandFactory().createAnalyzeDomainsCommand(params);
    return this.adapter.getCommandExecutor().execute(command);
  }

  async getStatus(): Promise<CommandResult> {
    const command = this.adapter.getCommandFactory().createGetStatusCommand({});
    return this.adapter.getCommandExecutor().execute(command);
  }

  async runFullAnalysis(params: CSPSentinelConfig = {}): Promise<CommandResult> {
    const results = await Promise.allSettled([
      this.analyzeDirectives({ directives: params.directives }),
      this.analyzeDomains({ domains: params.domains }),
      this.getStatus(),
    ]);

    return {
      success: true,
      data: {
        directives: results[0].status === 'fulfilled' ? results[0].value : null,
        domains: results[1].status === 'fulfilled' ? results[1].value : null,
        status: results[2].status === 'fulfilled' ? results[2].value : null,
        errors: results.filter(r => r.status === 'rejected').map(r => (r as PromiseRejectedResult).reason),
      },
      message: 'CSP analysis completed'
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

export async function setupCSPSentinel(config: CSPSentinelConfig) {
  const sentinel = getCSPSentinel();
  
  // Start monitoring
  await sentinel.startMonitoring({
    endpoint: config.endpoint,
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
