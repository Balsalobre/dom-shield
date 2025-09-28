import type { Command, CommandResult } from '../../../shared/types/command.types';
import type { DetectElementUseCase } from '../use-cases/detect-element.use-case';

export interface DetectElementCommandParams {
  selector: string;
}

export class DetectElementCommand implements Command<DetectElementCommandParams> {
  public readonly type = 'detect-element';
  public readonly params: DetectElementCommandParams;

  constructor(params: DetectElementCommandParams) {
    this.params = params;
  }

  async execute(): Promise<CommandResult> {
    // This will be implemented by the command handler
    throw new Error('Command execution should be handled by DetectElementCommandHandler');
  }
}

export class DetectElementCommandHandler {
  constructor(detectElementUseCase: DetectElementUseCase) {
    this.detectElementUseCase = detectElementUseCase;
  }
  
  private readonly detectElementUseCase: DetectElementUseCase;

  canHandle(command: Command): boolean {
    return command.type === 'detect-element';
  }

  async handle(command: Command<DetectElementCommandParams>): Promise<CommandResult> {
    const result = await this.detectElementUseCase.execute(command.params.selector);
    
    return {
      success: result.success,
      data: result.data,
      message: result.message,
      error: result.error
    };
  }
}
