import type { Command, CommandResult, CommandHandler, CommandExecutor } from '../../../shared/types/command.types';
import { DetectElementCommandHandler } from '../commands/detect-element.command';
import { DetectIframeCommandHandler } from '../commands/detect-iframe.command';
import { DetectSuspiciousScriptsCommandHandler } from '../commands/detect-suspicious-scripts.command';
import { DetectLiveElementCommandHandler } from '../commands/detect-live-element.command';
import { GetStatusCommandHandler } from '../commands/get-status.command';

export class DOMCommandExecutorService implements CommandExecutor {
  private handlers: Map<string, CommandHandler> = new Map();
  private isInitialized: boolean = false;
  private readonly detectElementCommandHandler: DetectElementCommandHandler;
  private readonly detectIframeCommandHandler: DetectIframeCommandHandler;
  private readonly detectSuspiciousScriptsCommandHandler: DetectSuspiciousScriptsCommandHandler;
  private readonly detectLiveElementCommandHandler: DetectLiveElementCommandHandler;
  private readonly getStatusCommandHandler: GetStatusCommandHandler;

  constructor(
    detectElementCommandHandler: DetectElementCommandHandler,
    detectIframeCommandHandler: DetectIframeCommandHandler,
    detectSuspiciousScriptsCommandHandler: DetectSuspiciousScriptsCommandHandler,
    detectLiveElementCommandHandler: DetectLiveElementCommandHandler,
    getStatusCommandHandler: GetStatusCommandHandler
  ) {
    this.detectElementCommandHandler = detectElementCommandHandler;
    this.detectIframeCommandHandler = detectIframeCommandHandler;
    this.detectSuspiciousScriptsCommandHandler = detectSuspiciousScriptsCommandHandler;
    this.detectLiveElementCommandHandler = detectLiveElementCommandHandler;
    this.getStatusCommandHandler = getStatusCommandHandler;
    this.initializeHandlers();
  }

  private initializeHandlers(): void {
    this.registerHandler(this.detectElementCommandHandler);
    this.registerHandler(this.detectIframeCommandHandler);
    this.registerHandler(this.detectSuspiciousScriptsCommandHandler);
    this.registerHandler(this.detectLiveElementCommandHandler);
    this.registerHandler(this.getStatusCommandHandler);
    
    this.isInitialized = true;
    console.log('🛡️ DOM Command Executor Service initialized with', this.handlers.size, 'handlers');
  }

  async execute<T>(command: Command<T>): Promise<CommandResult> {
    if (!this.isInitialized) {
      return {
        success: false,
        error: new Error('DOM Command Executor Service not initialized'),
        message: 'DOM Command Executor Service not initialized',
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
      'DetectElementCommandHandler': 'detect-element',
      'DetectIframeCommandHandler': 'detect-iframe',
      'DetectSuspiciousScriptsCommandHandler': 'detect-suspicious-scripts',
      'DetectLiveElementCommandHandler': 'detect-live-element',
      'GetStatusCommandHandler': 'get-status',
    };

    return handlerToCommandType[className] || className.toLowerCase().replace('handler', '');
  }
}
