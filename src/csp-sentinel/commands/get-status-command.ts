import { BaseCSPCommand } from './base-command';
import type { GetStatusParams, CSPCommandResult } from '../types/command.types';
import type { CSPComprehensiveStatus, CSPViolationAnalysisResult } from '../types/csp';
import { MonitorViolationsCommand } from './monitor-violations-command';
import { AnalyzeDirectivesCommand } from './analyze-directives-command';
import { AnalyzeDomainsCommand } from './analyze-domains-command';

export class GetStatusCommand extends BaseCSPCommand<GetStatusParams> {
  constructor(params: GetStatusParams) {
    super('get-status', params);
  }

  public execute(): CSPCommandResult {
    try {
      const status = this.getComprehensiveStatus();
      
      this.logInfo(`Retrieved comprehensive CSP status with ${status.monitoring.queuedReports} queued reports`);
      
      return this.createSuccessResult(status, 'CSP status retrieved successfully');
    } catch (error) {
      this.logError('Failed to get CSP status', error as Error);
      return this.createErrorResult(error as Error, 'Failed to get CSP status');
    }
  }

  private getComprehensiveStatus(): CSPComprehensiveStatus {
    // Get monitoring status
    const monitor = MonitorViolationsCommand.getInstance({});
    const monitoringStatus = monitor ? monitor.getStatus() : {
      enabled: false,
      endpoint: '',
      queuedReports: 0,
      maxQueueSize: 100,
    };

    // Get violation analysis
    const violationAnalysis = this.getViolationAnalysis(monitor);

    // Get directive analysis
    const directiveAnalysis = this.getDirectiveAnalysis();

    // Get domain analysis
    const domainAnalysis = this.getDomainAnalysis();

    return {
      monitoring: monitoringStatus,
      violations: violationAnalysis,
      directives: directiveAnalysis,
      domains: domainAnalysis,
      lastUpdated: new Date().toISOString(),
    };
  }

  private getViolationAnalysis(monitor: MonitorViolationsCommand | null): CSPViolationAnalysisResult {
    if (!monitor) {
      return {
        totalViolations: 0,
        recentViolations: [],
        topViolatedDirectives: [],
        riskLevel: 'low',
      };
    }

    const queuedReports = monitor.getQueuedReports();
    const recentViolations = this.params.includeQueue ? queuedReports.slice(-10) : [];
    
    // Analyze top violated directives
    const directiveCounts = new Map<string, number>();
    queuedReports.forEach(report => {
      const directive = report.violation['violated-directive'];
      directiveCounts.set(directive, (directiveCounts.get(directive) || 0) + 1);
    });

    const topViolatedDirectives = Array.from(directiveCounts.entries())
      .map(([directive, count]) => ({ directive, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (queuedReports.length > 50) {
      riskLevel = 'high';
    } else if (queuedReports.length > 10) {
      riskLevel = 'medium';
    }

    return {
      totalViolations: queuedReports.length,
      recentViolations,
      topViolatedDirectives,
      riskLevel,
    };
  }

  private getDirectiveAnalysis() {
    const command = new AnalyzeDirectivesCommand({});
    const result = command.execute();
    return result.data || {
      violations: [],
      recommendations: [],
      policy: '',
      isCompliant: true,
    };
  }

  private getDomainAnalysis() {
    const command = new AnalyzeDomainsCommand({});
    const result = command.execute();
    return result.data || {
      suspiciousDomains: [],
      recommendations: [],
      domains: [],
      isSecure: true,
    };
  }
}
