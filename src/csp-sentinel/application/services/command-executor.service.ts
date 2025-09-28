import type { Command, CommandResult, CommandHandler, CommandExecutor } from '../../../shared/types/command.types';
import { MonitorViolationsCommandHandler } from '../commands/monitor-violations.command';
import { AnalyzeDirectivesCommandHandler } from '../commands/analyze-directives.command';
import { AnalyzeDomainsCommandHandler } from '../commands/analyze-domains.command';
import { EnableMonitoringCommandHandler } from '../commands/enable-monitoring.command';
import { DisableMonitoringCommandHandler } from '../commands/disable-monitoring.command';
import { GetStatusCommandHandler } from '../commands/get-status.command';

export class CSPCommandExecutorService implements CommandExecutor {
  private handlers: Map<string, CommandHandler> = new Map();
  private isInitialized: boolean = false;
  private readonly monitorViolationsCommandHandler: MonitorViolationsCommandHandler;
  private readonly analyzeDirectivesCommandHandler: AnalyzeDirectivesCommandHandler;
  private readonly analyzeDomainsCommandHandler: AnalyzeDomainsCommandHandler;
  private readonly enableMonitoringCommandHandler: EnableMonitoringCommandHandler;
  private readonly disableMonitoringCommandHandler: DisableMonitoringCommandHandler;
  private readonly getStatusCommandHandler: GetStatusCommandHandler;

  constructor(
    monitorViolationsCommandHandler: MonitorViolationsCommandHandler,
    analyzeDirectivesCommandHandler: AnalyzeDirectivesCommandHandler,
    analyzeDomainsCommandHandler: AnalyzeDomainsCommandHandler,
    enableMonitoringCommandHandler: EnableMonitoringCommandHandler,
    disableMonitoringCommandHandler: DisableMonitoringCommandHandler,
    getStatusCommandHandler: GetStatusCommandHandler
  ) {
    this.monitorViolationsCommandHandler = monitorViolationsCommandHandler;
    this.analyzeDirectivesCommandHandler = analyzeDirectivesCommandHandler;
    this.analyzeDomainsCommandHandler = analyzeDomainsCommandHandler;
    this.enableMonitoringCommandHandler = enableMonitoringCommandHandler;
    this.disableMonitoringCommandHandler = disableMonitoringCommandHandler;
    this.getStatusCommandHandler = getStatusCommandHandler;
    this.initializeHandlers();
  }

  private initializeHandlers(): void {
    this.registerHandler(this.monitorViolationsCommandHandler);
    this.registerHandler(this.analyzeDirectivesCommandHandler);
    this.registerHandler(this.analyzeDomainsCommandHandler);
    this.registerHandler(this.enableMonitoringCommandHandler);
    this.registerHandler(this.disableMonitoringCommandHandler);
    this.registerHandler(this.getStatusCommandHandler);
    
    this.isInitialized = true;
    console.log('🛡️ CSP Command Executor Service initialized with', this.handlers.size, 'handlers');
  }

  async execute<T>(command: Command<T>): Promise<CommandResult> {
    if (!this.isInitialized) {
      return {
        success: false,
        error: new Error('CSP Command Executor Service not initialized'),
        message: 'CSP Command Executor Service not initialized',
      };
    }

    const handler = this.findHandler(command);
    if (!handler) {
      return {
        success: false,
        error: new Error(`No handler found for command type: ${command.type}`),
        message: `No handler found for command type: ${command.type}`,
      };
    }

    try {
      return await handler.handle(command);
    } catch (error) {
      return {
        success: false,
        error: error as Error,
        message: `Error executing command: ${command.type}`,
      };
    }
  }

  registerHandler<T>(handler: CommandHandler<T>): void {
    const commandType = this.extractCommandTypeFromHandler(handler);
    this.handlers.set(commandType, handler);
  }

  unregisterHandler(commandType: string): void {
    this.handlers.delete(commandType);
  }

  getRegisteredHandlers(): string[] {
    return Array.from(this.handlers.keys());
  }

  private findHandler(command: Command): CommandHandler | undefined {
    return this.handlers.get(command.type);
  }

  private extractCommandTypeFromHandler(handler: CommandHandler): string {
    const className = handler.constructor.name;
    
    const handlerToCommandType: Record<string, string> = {
      'MonitorViolationsCommandHandler': 'monitor-violations',
      'AnalyzeDirectivesCommandHandler': 'analyze-directives',
      'AnalyzeDomainsCommandHandler': 'analyze-domains',
      'EnableMonitoringCommandHandler': 'enable-monitoring',
      'DisableMonitoringCommandHandler': 'disable-monitoring',
      'GetStatusCommandHandler': 'get-status',
    };

    return handlerToCommandType[className] || className.toLowerCase().replace('handler', '');
  }
}
