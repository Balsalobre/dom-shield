import type { Command, CommandResult } from '../../../shared/types/command.types';

export interface AnalyzeDomainsCommandParams {
  domains?: string[];
  policy?: string;
}

export class AnalyzeDomainsCommand implements Command<AnalyzeDomainsCommandParams> {
  public readonly type = 'analyze-domains';
  public readonly params: AnalyzeDomainsCommandParams;

  constructor(params: AnalyzeDomainsCommandParams) {
    this.params = params;
  }

  async execute(): Promise<CommandResult> {
    // This will be implemented by the command handler
    throw new Error('Command execution should be handled by AnalyzeDomainsCommandHandler');
  }
}

export class AnalyzeDomainsCommandHandler {
  constructor() {}

  canHandle(command: Command): boolean {
    return command.type === 'analyze-domains';
  }

  async handle(command: Command<AnalyzeDomainsCommandParams>): Promise<CommandResult> {
    const domains = command.params.domains || [];
    const suspiciousDomains: string[] = [];
    
    domains.forEach(domain => {
      if (this.isSuspiciousDomain(domain)) {
        suspiciousDomains.push(domain);
      }
    });

    return {
      success: true,
      data: {
        domains,
        suspiciousDomains,
        isSecure: suspiciousDomains.length === 0,
        recommendations: suspiciousDomains.length > 0 
          ? ['Consider blocking suspicious domains in your CSP policy'] 
          : ['All domains appear to be secure']
      },
      message: 'Domain analysis completed'
    };
  }

  private isSuspiciousDomain(domain: string): boolean {
    const suspiciousPatterns = [
      'malicious',
      'evil',
      'hack',
      'phish',
      'scam',
      'fake',
      'suspicious'
    ];
    
    return suspiciousPatterns.some(pattern => 
      domain.toLowerCase().includes(pattern)
    );
  }
}
