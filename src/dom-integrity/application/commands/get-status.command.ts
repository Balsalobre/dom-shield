import type { Command, CommandResult } from '../../../shared/types/command.types';

export interface GetStatusCommandParams {
  // No parameters needed for status
}

export class GetStatusCommand implements Command<GetStatusCommandParams> {
  public readonly type = 'get-status';
  public readonly params: GetStatusCommandParams;

  constructor(params: GetStatusCommandParams = {}) {
    this.params = params;
  }

  async execute(): Promise<CommandResult> {
    // This will be implemented by the command handler
    throw new Error('Command execution should be handled by GetStatusCommandHandler');
  }
}

export class GetStatusCommandHandler {
  constructor() {}

  canHandle(command: Command): boolean {
    return command.type === 'get-status';
  }

  async handle(_command: Command<GetStatusCommandParams>): Promise<CommandResult> {
    return {
      success: true,
      data: {
        enabled: true,
        lastCheck: new Date().toISOString(),
        version: '1.0.0'
      },
      message: 'DOM Sentinel status retrieved successfully'
    };
  }
}
