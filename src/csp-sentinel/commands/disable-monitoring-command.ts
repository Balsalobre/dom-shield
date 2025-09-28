import { BaseCSPCommand } from './base-command';
import type { DisableMonitoringParams, CSPCommandResult } from '../types/command.types';
import { MonitorViolationsCommand } from './monitor-violations-command';

export class DisableMonitoringCommand extends BaseCSPCommand<DisableMonitoringParams> {
  constructor(params: DisableMonitoringParams) {
    super('disable-monitoring', params);
  }

  public execute(): CSPCommandResult {
    try {
      // Get the singleton instance of MonitorViolationsCommand
      const monitor = MonitorViolationsCommand.getInstance({});
      
      if (!monitor) {
        return this.createErrorResult('Monitor not initialized', 'CSP monitor not found. Initialize monitoring first.');
      }

      monitor.disableMonitoring();

      // Clear queue if requested
      if (this.params.clearQueue) {
        monitor.clearReportQueue();
        this.logInfo('Report queue cleared as requested');
      }

      const status = monitor.getStatus();
      this.logSuccess(`CSP monitoring disabled. Status: ${JSON.stringify(status)}`);

      return this.createSuccessResult(status, 'CSP monitoring disabled successfully');
    } catch (error) {
      this.logError('Failed to disable CSP monitoring', error as Error);
      return this.createErrorResult(error as Error, 'Failed to disable CSP monitoring');
    }
  }
}
