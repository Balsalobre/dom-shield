import { BaseCSPCommand } from './base-command';
import type { ClearQueueParams, CSPCommandResult } from '../types/command.types';
import { MonitorViolationsCommand } from './monitor-violations-command';

export class ClearQueueCommand extends BaseCSPCommand<ClearQueueParams> {
  constructor(params: ClearQueueParams) {
    super('clear-queue', params);
  }

  public execute(): CSPCommandResult {
    try {
      // Get the singleton instance of MonitorViolationsCommand
      const monitor = MonitorViolationsCommand.getInstance({});
      
      if (!monitor) {
        return this.createErrorResult('Monitor not initialized', 'CSP monitor not found. Initialize monitoring first.');
      }

      const queuedReports = monitor.getQueuedReports();
      const reportCount = queuedReports.length;

      if (reportCount === 0) {
        this.logInfo('No queued reports to clear');
        return this.createSuccessResult({ clearedCount: 0 }, 'No queued reports to clear');
      }

      // Check if confirmation is required
      if (this.params.confirm === false) {
        return this.createErrorResult('Confirmation required', 'Confirmation required to clear queue. Set confirm: true');
      }

      monitor.clearReportQueue();
      
      this.logSuccess(`Cleared ${reportCount} queued CSP reports`);

      return this.createSuccessResult(
        { clearedCount: reportCount }, 
        `Successfully cleared ${reportCount} queued reports`
      );
    } catch (error) {
      this.logError('Failed to clear report queue', error as Error);
      return this.createErrorResult(error as Error, 'Failed to clear report queue');
    }
  }
}
