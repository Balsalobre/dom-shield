import { BaseCSPCommand } from './base-command';
import type { GetQueuedReportsParams, CSPCommandResult } from '../types/command.types';
import type { CSPReportData } from '../types/csp';
import { MonitorViolationsCommand } from './monitor-violations-command';

export class GetQueuedReportsCommand extends BaseCSPCommand<GetQueuedReportsParams> {
  constructor(params: GetQueuedReportsParams) {
    super('get-queued-reports', params);
  }

  public execute(): CSPCommandResult {
    try {
      // Get the singleton instance of MonitorViolationsCommand
      const monitor = MonitorViolationsCommand.getInstance({});
      
      if (!monitor) {
        return this.createErrorResult('Monitor not initialized', 'CSP monitor not found. Initialize monitoring first.');
      }

      const allQueuedReports = monitor.getQueuedReports();
      const paginatedReports = this.paginateReports(allQueuedReports);
      
      this.logInfo(`Retrieved ${paginatedReports.length} queued reports (${allQueuedReports.length} total)`);

      return this.createSuccessResult({
        reports: paginatedReports,
        total: allQueuedReports.length,
        limit: this.params.limit || allQueuedReports.length,
        offset: this.params.offset || 0,
      }, 'Queued reports retrieved successfully');
    } catch (error) {
      this.logError('Failed to get queued reports', error as Error);
      return this.createErrorResult(error as Error, 'Failed to get queued reports');
    }
  }

  private paginateReports(reports: readonly CSPReportData[]): CSPReportData[] {
    const limit = this.params.limit || reports.length;
    const offset = this.params.offset || 0;
    
    return reports.slice(offset, offset + limit);
  }
}
