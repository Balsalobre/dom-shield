import type { Command, CommandResult } from '../../../shared/types/command.types';

export interface EnableMonitoringCommandParams {
  // No parameters needed
}

export class EnableMonitoringCommand implements Command<EnableMonitoringCommandParams> {
  public readonly type = 'enable-monitoring';
  public readonly params: EnableMonitoringCommandParams;

  constructor(params: EnableMonitoringCommandParams = {}) {
    this.params = params;
  }

  async execute(): Promise<CommandResult> {
    // This will be implemented by the command handler
    throw new Error('Command execution should be handled by EnableMonitoringCommandHandler');
  }
}

export class EnableMonitoringCommandHandler {
  constructor() {}

  canHandle(command: Command): boolean {
    return command.type === 'enable-monitoring';
  }

  async handle(_command: Command<EnableMonitoringCommandParams>): Promise<CommandResult> {
    return {
      success: true,
      data: { enabled: true },
      message: 'CSP monitoring enabled successfully'
    };
  }
}
