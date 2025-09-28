import type { CSPCommand, CSPCommandResult, CSPCommandParams } from '../types/command.types';

export abstract class BaseCSPCommand<T extends CSPCommandParams> implements CSPCommand<T> {
  public readonly type: string;
  public readonly params: T;

  constructor(type: string, params: T) {
    this.type = type;
    this.params = params;
  }

  abstract execute(): Promise<CSPCommandResult> | CSPCommandResult;

  protected createSuccessResult(data?: any, message?: string): CSPCommandResult {
    return {
      success: true,
      data,
      message: message || `${this.type} command executed successfully`,
    };
  }

  protected createErrorResult(error: Error | string, message?: string): CSPCommandResult {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(error),
      message: message || `${this.type} command failed`,
    };
  }

  protected logInfo(message: string): void {
    console.log(`ℹ️ CSP Sentinel [${this.type}]: ${message}`);
  }

  protected logWarn(message: string): void {
    console.warn(`⚠️ CSP Sentinel [${this.type}]: ${message}`);
  }

  protected logError(message: string, error?: Error): void {
    console.error(`❌ CSP Sentinel [${this.type}]: ${message}`, error);
  }

  protected logSuccess(message: string): void {
    console.log(`✅ CSP Sentinel [${this.type}]: ${message}`);
  }
}
