// Base command interface
export interface CSPCommand<T = any> {
  readonly type: string;
  readonly params: T;
  execute(): Promise<CSPCommandResult> | CSPCommandResult;
}

// Command result interface
export interface CSPCommandResult {
  success: boolean;
  message?: string;
  data?: any;
  error?: Error;
}

// Command handler interface
export interface CSPCommandHandler<T = any> {
  canHandle(command: CSPCommand<T>): boolean;
  handle(command: CSPCommand<T>): Promise<CSPCommandResult> | CSPCommandResult;
}

// Command executor interface
export interface CSPCommandExecutor {
  execute<T>(command: CSPCommand<T>): Promise<CSPCommandResult>;
  registerHandler<T>(handler: CSPCommandHandler<T>): void;
  unregisterHandler(commandType: string): void;
  getRegisteredHandlers(): string[];
}

// CSP Command types
export type CSPCommandType = 
  | 'monitor-violations'
  | 'analyze-directives'
  | 'analyze-domains'
  | 'enable-monitoring'
  | 'disable-monitoring'
  | 'get-status'
  | 'clear-queue'
  | 'send-queued-reports'
  | 'get-queued-reports';

// Command parameters
export interface MonitorViolationsParams {
  endpoint?: string;
  maxQueueSize?: number;
}

export interface AnalyzeDirectivesParams {
  directives?: string[];
  policy?: string;
}

export interface AnalyzeDomainsParams {
  domains?: string[];
  policy?: string;
}

export interface EnableMonitoringParams {
  sendQueued?: boolean;
}

export interface DisableMonitoringParams {
  clearQueue?: boolean;
}

export interface GetStatusParams {
  includeQueue?: boolean;
}

export interface ClearQueueParams {
  confirm?: boolean;
}

export interface SendQueuedReportsParams {
  maxRetries?: number;
}

export interface GetQueuedReportsParams {
  limit?: number;
  offset?: number;
}

// Union type for all command parameters
export type CSPCommandParams = 
  | MonitorViolationsParams
  | AnalyzeDirectivesParams
  | AnalyzeDomainsParams
  | EnableMonitoringParams
  | DisableMonitoringParams
  | GetStatusParams
  | ClearQueueParams
  | SendQueuedReportsParams
  | GetQueuedReportsParams;

// Command factory interface
export interface CSPCommandFactory {
  createMonitorViolationsCommand(params: MonitorViolationsParams): CSPCommand<MonitorViolationsParams>;
  createAnalyzeDirectivesCommand(params: AnalyzeDirectivesParams): CSPCommand<AnalyzeDirectivesParams>;
  createAnalyzeDomainsCommand(params: AnalyzeDomainsParams): CSPCommand<AnalyzeDomainsParams>;
  createEnableMonitoringCommand(params: EnableMonitoringParams): CSPCommand<EnableMonitoringParams>;
  createDisableMonitoringCommand(params: DisableMonitoringParams): CSPCommand<DisableMonitoringParams>;
  createGetStatusCommand(params: GetStatusParams): CSPCommand<GetStatusParams>;
  createClearQueueCommand(params: ClearQueueParams): CSPCommand<ClearQueueParams>;
  createSendQueuedReportsCommand(params: SendQueuedReportsParams): CSPCommand<SendQueuedReportsParams>;
  createGetQueuedReportsCommand(params: GetQueuedReportsParams): CSPCommand<GetQueuedReportsParams>;
}
