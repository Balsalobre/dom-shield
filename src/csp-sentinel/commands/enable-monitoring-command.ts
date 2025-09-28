import { BaseCSPCommand } from './base-command';
import type { EnableMonitoringParams, CSPCommandResult } from '../types/command.types';
import { MonitorViolationsCommand } from './monitor-violations-command';

export class EnableMonitoringCommand extends BaseCSPCommand<EnableMonitoringParams> {
  constructor(params: EnableMonitoringParams) {
    super('enable-monitoring', params);
  }

  public execute(): CSPCommandResult {
    try {
      // Get the singleton instance of MonitorViolationsCommand
      const monitor = MonitorViolationsCommand.getInstance({});
      
      if (!monitor) {
        return this.createErrorResult('Monitor not initialized', 'CSP monitor not found. Initialize monitoring first.');
      }

      monitor.enableMonitoring();

      // Send queued reports if requested
      if (this.params.sendQueued) {
        monitor.sendQueuedReports();
        this.logInfo('Sending queued reports as requested');
      }

      const status = monitor.getStatus();
      this.logSuccess(`CSP monitoring enabled. Status: ${JSON.stringify(status)}`);

      return this.createSuccessResult(status, 'CSP monitoring enabled successfully');
    } catch (error) {
      this.logError('Failed to enable CSP monitoring', error as Error);
      return this.createErrorResult(error as Error, 'Failed to enable CSP monitoring');
    }
  }
}
