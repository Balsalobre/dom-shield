import type { Command, CommandResult } from '../../../shared/types/command.types';
import type { DetectLiveElementUseCase } from '../use-cases/detect-live-element.use-case';

export interface DetectLiveElementCommandParams {
  selector: string;
}

export class DetectLiveElementCommand implements Command<DetectLiveElementCommandParams> {
  public readonly type = 'detect-live-element';
  public readonly params: DetectLiveElementCommandParams;

  constructor(params: DetectLiveElementCommandParams) {
    this.params = params;
  }

  async execute(): Promise<CommandResult> {
    // This will be implemented by the command handler
    throw new Error('Command execution should be handled by DetectLiveElementCommandHandler');
  }
}

export class DetectLiveElementCommandHandler {
  constructor(detectLiveElementUseCase: DetectLiveElementUseCase) {
    this.detectLiveElementUseCase = detectLiveElementUseCase;
  }
  
  private readonly detectLiveElementUseCase: DetectLiveElementUseCase;

  canHandle(command: Command): boolean {
    return command.type === 'detect-live-element';
  }

  async handle(command: Command<DetectLiveElementCommandParams>): Promise<CommandResult> {
    const result = await this.detectLiveElementUseCase.execute(command.params.selector);
    
    return {
      success: result.success,
      data: result.data,
      message: result.message,
      error: result.error
    };
  }
}
