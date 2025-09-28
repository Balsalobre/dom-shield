// Base command interface
export interface Command<T = any> {
  readonly type: string;
  readonly params: T;
  execute(): Promise<CommandResult> | CommandResult;
}

// Command result interface
export interface CommandResult {
  success: boolean;
  message?: string;
  data?: any;
  error?: Error;
}

// Command handler interface
export interface CommandHandler<T = any> {
  canHandle(command: Command<T>): boolean;
  handle(command: Command<T>): Promise<CommandResult> | CommandResult;
}

// Command executor interface
export interface CommandExecutor {
  execute<T>(command: Command<T>): Promise<CommandResult>;
  registerHandler<T>(handler: CommandHandler<T>): void;
  unregisterHandler(commandType: string): void;
  getRegisteredHandlers(): string[];
}
