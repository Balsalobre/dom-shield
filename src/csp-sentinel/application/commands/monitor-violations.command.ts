import type { Command, CommandResult } from '../../../shared/types/command.types';
import type { MonitorViolationsUseCase } from '../use-cases/monitor-violations.use-case';

export interface MonitorViolationsCommandParams {
  endpoint?: string;
}

export class MonitorViolationsCommand implements Command<MonitorViolationsCommandParams> {
  public readonly type = 'monitor-violations';
  public readonly params: MonitorViolationsCommandParams;

  constructor(params: MonitorViolationsCommandParams) {
    this.params = params;
  }

  async execute(): Promise<CommandResult> {
    // This will be implemented by the command handler
    throw new Error('Command execution should be handled by MonitorViolationsCommandHandler');
  }
}

export class MonitorViolationsCommandHandler {
  constructor(monitorViolationsUseCase: MonitorViolationsUseCase) {
    this.monitorViolationsUseCase = monitorViolationsUseCase;
  }
  
  private readonly monitorViolationsUseCase: MonitorViolationsUseCase;

  canHandle(command: Command): boolean {
    return command.type === 'monitor-violations';
  }

  async handle(command: Command<MonitorViolationsCommandParams>): Promise<CommandResult> {
    const result = await this.monitorViolationsUseCase.execute(command.params.endpoint);
    
    return {
      success: result.success,
      data: result.data,
      message: result.message,
      error: result.error
    };
  }
}
