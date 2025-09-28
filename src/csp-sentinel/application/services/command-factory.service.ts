import { MonitorViolationsCommand } from '../commands/monitor-violations.command';
import type { MonitorViolationsCommandParams } from '../commands/monitor-violations.command';
import { AnalyzeDirectivesCommand } from '../commands/analyze-directives.command';
import type { AnalyzeDirectivesCommandParams } from '../commands/analyze-directives.command';
import { AnalyzeDomainsCommand } from '../commands/analyze-domains.command';
import type { AnalyzeDomainsCommandParams } from '../commands/analyze-domains.command';
import { EnableMonitoringCommand } from '../commands/enable-monitoring.command';
import type { EnableMonitoringCommandParams } from '../commands/enable-monitoring.command';
import { DisableMonitoringCommand } from '../commands/disable-monitoring.command';
import type { DisableMonitoringCommandParams } from '../commands/disable-monitoring.command';
import { GetStatusCommand } from '../commands/get-status.command';
import type { GetStatusCommandParams } from '../commands/get-status.command';

export interface CommandFactory {
  createMonitorViolationsCommand(params: MonitorViolationsCommandParams): MonitorViolationsCommand;
  createAnalyzeDirectivesCommand(params: AnalyzeDirectivesCommandParams): AnalyzeDirectivesCommand;
  createAnalyzeDomainsCommand(params: AnalyzeDomainsCommandParams): AnalyzeDomainsCommand;
  createEnableMonitoringCommand(params: EnableMonitoringCommandParams): EnableMonitoringCommand;
  createDisableMonitoringCommand(params: DisableMonitoringCommandParams): DisableMonitoringCommand;
  createGetStatusCommand(params: GetStatusCommandParams): GetStatusCommand;
}

export class CSPCommandFactoryService implements CommandFactory {
  createMonitorViolationsCommand(params: MonitorViolationsCommandParams): MonitorViolationsCommand {
    return new MonitorViolationsCommand(params);
  }

  createAnalyzeDirectivesCommand(params: AnalyzeDirectivesCommandParams): AnalyzeDirectivesCommand {
    return new AnalyzeDirectivesCommand(params);
  }

  createAnalyzeDomainsCommand(params: AnalyzeDomainsCommandParams): AnalyzeDomainsCommand {
    return new AnalyzeDomainsCommand(params);
  }

  createEnableMonitoringCommand(params: EnableMonitoringCommandParams = {}): EnableMonitoringCommand {
    return new EnableMonitoringCommand(params);
  }

  createDisableMonitoringCommand(params: DisableMonitoringCommandParams = {}): DisableMonitoringCommand {
    return new DisableMonitoringCommand(params);
  }

  createGetStatusCommand(params: GetStatusCommandParams = {}): GetStatusCommand {
    return new GetStatusCommand(params);
  }
}
