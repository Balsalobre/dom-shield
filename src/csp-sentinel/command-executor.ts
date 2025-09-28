import type { 
  CSPCommand, 
  CSPCommandResult, 
  CSPCommandExecutor, 
  CSPCommandHandler,
  CSPCommandType,
  CSPCommandParams
} from './types/command.types';

import { MonitorViolationsCommand } from './commands/monitor-violations-command';
import { AnalyzeDirectivesCommand } from './commands/analyze-directives-command';
import { AnalyzeDomainsCommand } from './commands/analyze-domains-command';
import { EnableMonitoringCommand } from './commands/enable-monitoring-command';
import { DisableMonitoringCommand } from './commands/disable-monitoring-command';
import { GetStatusCommand } from './commands/get-status-command';
import { ClearQueueCommand } from './commands/clear-queue-command';
import { SendQueuedReportsCommand } from './commands/send-queued-reports-command';
import { GetQueuedReportsCommand } from './commands/get-queued-reports-command';

export class CSPSentinelCommandExecutor implements CSPCommandExecutor {
  private handlers: Map<string, CSPCommandHandler> = new Map();
  private isInitialized: boolean = false;

  constructor() {
    this.initializeHandlers();
  }

  private initializeHandlers(): void {
    // Register all command handlers
    this.registerHandler(new MonitorViolationsHandler());
    this.registerHandler(new AnalyzeDirectivesHandler());
    this.registerHandler(new AnalyzeDomainsHandler());
    this.registerHandler(new EnableMonitoringHandler());
    this.registerHandler(new DisableMonitoringHandler());
    this.registerHandler(new GetStatusHandler());
    this.registerHandler(new ClearQueueHandler());
    this.registerHandler(new SendQueuedReportsHandler());
    this.registerHandler(new GetQueuedReportsHandler());
    
    this.isInitialized = true;
    console.log('🛡️ CSP Sentinel Command Executor initialized with', this.handlers.size, 'handlers');
  }

  public async execute<T extends CSPCommandParams>(command: CSPCommand<T>): Promise<CSPCommandResult> {
    try {
      if (!this.isInitialized) {
        throw new Error('Command executor not initialized');
      }

      const handler = this.handlers.get(command.type);
      if (!handler) {
        throw new Error(`No handler found for command type: ${command.type}`);
      }

      if (!handler.canHandle(command)) {
        throw new Error(`Handler cannot handle command type: ${command.type}`);
      }

      console.log(`🔄 Executing CSP command: ${command.type}`);
      const result = await handler.handle(command);
      
      if (result.success) {
        console.log(`✅ CSP command ${command.type} executed successfully`);
      } else {
        console.warn(`⚠️ CSP command ${command.type} completed with warnings:`, result.message);
      }

      return result;
    } catch (error) {
      console.error(`❌ CSP command ${command.type} failed:`, error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        message: `Command ${command.type} failed: ${error}`,
      };
    }
  }

  public registerHandler<T extends CSPCommandParams>(handler: CSPCommandHandler<T>): void {
    // Extract command type from handler class name
    const commandType = this.extractCommandTypeFromHandler(handler);
    this.handlers.set(commandType, handler);
    console.log(`📝 Registered handler for command type: ${commandType}`);
  }

  public unregisterHandler(commandType: string): void {
    const removed = this.handlers.delete(commandType);
    if (removed) {
      console.log(`🗑️ Unregistered handler for command type: ${commandType}`);
    } else {
      console.warn(`⚠️ No handler found for command type: ${commandType}`);
    }
  }

  public getRegisteredHandlers(): string[] {
    return Array.from(this.handlers.keys());
  }

  private extractCommandTypeFromHandler(handler: CSPCommandHandler): string {
    // Extract command type from handler class name
    const className = handler.constructor.name;
    
    // Map handler class names to command types
    const handlerToCommandType: Record<string, string> = {
      'MonitorViolationsHandler': 'monitor-violations',
      'AnalyzeDirectivesHandler': 'analyze-directives',
      'AnalyzeDomainsHandler': 'analyze-domains',
      'EnableMonitoringHandler': 'enable-monitoring',
      'DisableMonitoringHandler': 'disable-monitoring',
      'GetStatusHandler': 'get-status',
      'ClearQueueHandler': 'clear-queue',
      'SendQueuedReportsHandler': 'send-queued-reports',
      'GetQueuedReportsHandler': 'get-queued-reports',
    };

    return handlerToCommandType[className] || className.toLowerCase().replace('handler', '');
  }
}

// Command Handlers
class MonitorViolationsHandler implements CSPCommandHandler {
  canHandle(command: CSPCommand): boolean {
    return command.type === 'monitor-violations';
  }

  async handle(command: CSPCommand): Promise<CSPCommandResult> {
    const cmd = new MonitorViolationsCommand(command.params);
    return cmd.execute();
  }
}

class AnalyzeDirectivesHandler implements CSPCommandHandler {
  canHandle(command: CSPCommand): boolean {
    return command.type === 'analyze-directives';
  }

  async handle(command: CSPCommand): Promise<CSPCommandResult> {
    const cmd = new AnalyzeDirectivesCommand(command.params);
    return cmd.execute();
  }
}

class AnalyzeDomainsHandler implements CSPCommandHandler {
  canHandle(command: CSPCommand): boolean {
    return command.type === 'analyze-domains';
  }

  async handle(command: CSPCommand): Promise<CSPCommandResult> {
    const cmd = new AnalyzeDomainsCommand(command.params);
    return cmd.execute();
  }
}

class EnableMonitoringHandler implements CSPCommandHandler {
  canHandle(command: CSPCommand): boolean {
    return command.type === 'enable-monitoring';
  }

  async handle(command: CSPCommand): Promise<CSPCommandResult> {
    const cmd = new EnableMonitoringCommand(command.params);
    return cmd.execute();
  }
}

class DisableMonitoringHandler implements CSPCommandHandler {
  canHandle(command: CSPCommand): boolean {
    return command.type === 'disable-monitoring';
  }

  async handle(command: CSPCommand): Promise<CSPCommandResult> {
    const cmd = new DisableMonitoringCommand(command.params);
    return cmd.execute();
  }
}

class GetStatusHandler implements CSPCommandHandler {
  canHandle(command: CSPCommand): boolean {
    return command.type === 'get-status';
  }

  async handle(command: CSPCommand): Promise<CSPCommandResult> {
    const cmd = new GetStatusCommand(command.params);
    return cmd.execute();
  }
}

class ClearQueueHandler implements CSPCommandHandler {
  canHandle(command: CSPCommand): boolean {
    return command.type === 'clear-queue';
  }

  async handle(command: CSPCommand): Promise<CSPCommandResult> {
    const cmd = new ClearQueueCommand(command.params);
    return cmd.execute();
  }
}

class SendQueuedReportsHandler implements CSPCommandHandler {
  canHandle(command: CSPCommand): boolean {
    return command.type === 'send-queued-reports';
  }

  async handle(command: CSPCommand): Promise<CSPCommandResult> {
    const cmd = new SendQueuedReportsCommand(command.params);
    return cmd.execute();
  }
}

class GetQueuedReportsHandler implements CSPCommandHandler {
  canHandle(command: CSPCommand): boolean {
    return command.type === 'get-queued-reports';
  }

  async handle(command: CSPCommand): Promise<CSPCommandResult> {
    const cmd = new GetQueuedReportsCommand(command.params);
    return cmd.execute();
  }
}

// Factory for creating commands
export class CSPCommandFactory {
  static createMonitorViolationsCommand(params: any) {
    return { type: 'monitor-violations', params };
  }

  static createAnalyzeDirectivesCommand(params: any) {
    return { type: 'analyze-directives', params };
  }

  static createAnalyzeDomainsCommand(params: any) {
    return { type: 'analyze-domains', params };
  }

  static createEnableMonitoringCommand(params: any) {
    return { type: 'enable-monitoring', params };
  }

  static createDisableMonitoringCommand(params: any) {
    return { type: 'disable-monitoring', params };
  }

  static createGetStatusCommand(params: any) {
    return { type: 'get-status', params };
  }

  static createClearQueueCommand(params: any) {
    return { type: 'clear-queue', params };
  }

  static createSendQueuedReportsCommand(params: any) {
    return { type: 'send-queued-reports', params };
  }

  static createGetQueuedReportsCommand(params: any) {
    return { type: 'get-queued-reports', params };
  }
}

// Singleton instance
let commandExecutorInstance: CSPSentinelCommandExecutor | null = null;

export function getCSPCommandExecutor(): CSPSentinelCommandExecutor {
  if (!commandExecutorInstance) {
    commandExecutorInstance = new CSPSentinelCommandExecutor();
  }
  return commandExecutorInstance;
}
