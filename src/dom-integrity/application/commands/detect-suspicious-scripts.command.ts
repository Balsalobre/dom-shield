import type { Command, CommandResult } from '../../../shared/types/command.types';
import type { DetectSuspiciousScriptsUseCase } from '../use-cases/detect-suspicious-scripts.use-case';

export interface DetectSuspiciousScriptsCommandParams {
  domains: string[];
}

export class DetectSuspiciousScriptsCommand implements Command<DetectSuspiciousScriptsCommandParams> {
  public readonly type = 'detect-suspicious-scripts';
  public readonly params: DetectSuspiciousScriptsCommandParams;

  constructor(params: DetectSuspiciousScriptsCommandParams) {
    this.params = params;
  }

  async execute(): Promise<CommandResult> {
    // This will be implemented by the command handler
    throw new Error('Command execution should be handled by DetectSuspiciousScriptsCommandHandler');
  }
}

export class DetectSuspiciousScriptsCommandHandler {
  constructor(detectSuspiciousScriptsUseCase: DetectSuspiciousScriptsUseCase) {
    this.detectSuspiciousScriptsUseCase = detectSuspiciousScriptsUseCase;
  }
  
  private readonly detectSuspiciousScriptsUseCase: DetectSuspiciousScriptsUseCase;

  canHandle(command: Command): boolean {
    return command.type === 'detect-suspicious-scripts';
  }

  async handle(command: Command<DetectSuspiciousScriptsCommandParams>): Promise<CommandResult> {
    const result = await this.detectSuspiciousScriptsUseCase.execute(command.params.domains);
    
    return {
      success: result.success,
      data: result.data,
      message: result.message,
      error: result.error
    };
  }
}
