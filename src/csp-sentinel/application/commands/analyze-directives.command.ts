import type { Command, CommandResult } from '../../../shared/types/command.types';
import type { AnalyzeDirectivesUseCase } from '../use-cases/analyze-directives.use-case';

export interface AnalyzeDirectivesCommandParams {
  directives?: string[];
  policy?: string;
}

export class AnalyzeDirectivesCommand implements Command<AnalyzeDirectivesCommandParams> {
  public readonly type = 'analyze-directives';
  public readonly params: AnalyzeDirectivesCommandParams;

  constructor(params: AnalyzeDirectivesCommandParams) {
    this.params = params;
  }

  async execute(): Promise<CommandResult> {
    // This will be implemented by the command handler
    throw new Error('Command execution should be handled by AnalyzeDirectivesCommandHandler');
  }
}

export class AnalyzeDirectivesCommandHandler {
  constructor(analyzeDirectivesUseCase: AnalyzeDirectivesUseCase) {
    this.analyzeDirectivesUseCase = analyzeDirectivesUseCase;
  }
  
  private readonly analyzeDirectivesUseCase: AnalyzeDirectivesUseCase;

  canHandle(command: Command): boolean {
    return command.type === 'analyze-directives';
  }

  async handle(command: Command<AnalyzeDirectivesCommandParams>): Promise<CommandResult> {
    const result = await this.analyzeDirectivesUseCase.execute(
      command.params.directives,
      command.params.policy
    );
    
    return {
      success: result.success,
      data: result.data,
      message: result.message,
      error: result.error
    };
  }
}
