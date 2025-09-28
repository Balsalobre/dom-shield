import type { Command, CommandResult } from '../../../shared/types/command.types';

export interface DisableMonitoringCommandParams {
  // No parameters needed
}

export class DisableMonitoringCommand implements Command<DisableMonitoringCommandParams> {
  public readonly type = 'disable-monitoring';
  public readonly params: DisableMonitoringCommandParams;

  constructor(params: DisableMonitoringCommandParams = {}) {
    this.params = params;
  }

  async execute(): Promise<CommandResult> {
    // This will be implemented by the command handler
    throw new Error('Command execution should be handled by DisableMonitoringCommandHandler');
  }
}

export class DisableMonitoringCommandHandler {
  constructor() {}

  canHandle(command: Command): boolean {
    return command.type === 'disable-monitoring';
  }

  async handle(_command: Command<DisableMonitoringCommandParams>): Promise<CommandResult> {
    return {
      success: true,
      data: { enabled: false },
      message: 'CSP monitoring disabled successfully'
    };
  }
}
