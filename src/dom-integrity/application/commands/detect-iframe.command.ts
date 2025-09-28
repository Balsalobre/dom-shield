import type { Command, CommandResult } from '../../../shared/types/command.types';
import type { DetectIframeUseCase } from '../use-cases/detect-iframe.use-case';

export interface DetectIframeCommandParams {
  // No parameters needed for iframe detection
}

export class DetectIframeCommand implements Command<DetectIframeCommandParams> {
  public readonly type = 'detect-iframe';
  public readonly params: DetectIframeCommandParams;

  constructor(params: DetectIframeCommandParams = {}) {
    this.params = params;
  }

  async execute(): Promise<CommandResult> {
    // This will be implemented by the command handler
    throw new Error('Command execution should be handled by DetectIframeCommandHandler');
  }
}

export class DetectIframeCommandHandler {
  constructor(detectIframeUseCase: DetectIframeUseCase) {
    this.detectIframeUseCase = detectIframeUseCase;
  }
  
  private readonly detectIframeUseCase: DetectIframeUseCase;

  canHandle(command: Command): boolean {
    return command.type === 'detect-iframe';
  }

  async handle(_command: Command<DetectIframeCommandParams>): Promise<CommandResult> {
    const result = await this.detectIframeUseCase.execute();
    
    return {
      success: result.success,
      data: result.data,
      message: result.message,
      error: result.error
    };
  }
}
