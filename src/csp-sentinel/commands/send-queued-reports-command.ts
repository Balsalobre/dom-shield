import { BaseCSPCommand } from './base-command';
import type { SendQueuedReportsParams, CSPCommandResult } from '../types/command.types';
import { MonitorViolationsCommand } from './monitor-violations-command';

export class SendQueuedReportsCommand extends BaseCSPCommand<SendQueuedReportsParams> {
  constructor(params: SendQueuedReportsParams) {
    super('send-queued-reports', params);
  }

  public execute(): Promise<CSPCommandResult> {
    return this.executeAsync();
  }

  private async executeAsync(): Promise<CSPCommandResult> {
    try {
      // Get the singleton instance of MonitorViolationsCommand
      const monitor = MonitorViolationsCommand.getInstance({});
      
      if (!monitor) {
        return this.createErrorResult('Monitor not initialized', 'CSP monitor not found. Initialize monitoring first.');
      }

      const queuedReports = monitor.getQueuedReports();
      const reportCount = queuedReports.length;

      if (reportCount === 0) {
        this.logInfo('No queued reports to send');
        return this.createSuccessResult({ sentCount: 0, failedCount: 0 }, 'No queued reports to send');
      }

      this.logInfo(`Sending ${reportCount} queued reports...`);
      
      // Store initial count for reporting
      const initialCount = reportCount;
      
      // Send queued reports with retry logic
      await this.sendWithRetry(monitor, this.params.maxRetries || 3);
      
      // Get final count after sending
      const remainingReports = monitor.getQueuedReports();
      const sentCount = initialCount - remainingReports.length;
      const failedCount = remainingReports.length;

      this.logSuccess(`Sent ${sentCount} reports, ${failedCount} failed`);

      return this.createSuccessResult(
        { sentCount, failedCount, totalAttempted: initialCount }, 
        `Successfully sent ${sentCount} out of ${initialCount} queued reports`
      );
    } catch (error) {
      this.logError('Failed to send queued reports', error as Error);
      return this.createErrorResult(error as Error, 'Failed to send queued reports');
    }
  }

  private async sendWithRetry(monitor: MonitorViolationsCommand, maxRetries: number): Promise<void> {
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        await monitor.sendQueuedReports();
        
        // Check if all reports were sent successfully
        const remainingReports = monitor.getQueuedReports();
        if (remainingReports.length === 0) {
          this.logSuccess('All queued reports sent successfully');
          return;
        }
        
        retryCount++;
        if (retryCount < maxRetries) {
          this.logInfo(`Retry ${retryCount}/${maxRetries} - ${remainingReports.length} reports still queued`);
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }
      } catch (error) {
        retryCount++;
        this.logWarn(`Send attempt ${retryCount} failed: ${error}`);
        
        if (retryCount >= maxRetries) {
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }
  }
}
