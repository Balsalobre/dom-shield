import type { CSPMonitoringService } from '../../domain/services/csp-monitoring.service';
import type { CSPMonitoringRepository } from '../../domain/repositories/csp-monitoring.repository';
import { CSPMonitoringServiceImpl } from '../services/csp-monitoring.service.impl';
import { CSPMonitoringRepositoryImpl } from '../repositories/csp-monitoring.repository.impl';

import type { MonitorViolationsUseCase } from '../../application/use-cases/monitor-violations.use-case';
import { MonitorViolationsUseCaseImpl } from '../../application/use-cases/monitor-violations.use-case';
import type { AnalyzeDirectivesUseCase } from '../../application/use-cases/analyze-directives.use-case';
import { AnalyzeDirectivesUseCaseImpl } from '../../application/use-cases/analyze-directives.use-case';

import { CSPCommandExecutorService } from '../../application/services/command-executor.service';
import { CSPCommandFactoryService } from '../../application/services/command-factory.service';
import { MonitorViolationsCommandHandler } from '../../application/commands/monitor-violations.command';
import { AnalyzeDirectivesCommandHandler } from '../../application/commands/analyze-directives.command';
import { AnalyzeDomainsCommandHandler } from '../../application/commands/analyze-domains.command';
import { EnableMonitoringCommandHandler } from '../../application/commands/enable-monitoring.command';
import { DisableMonitoringCommandHandler } from '../../application/commands/disable-monitoring.command';
import { GetStatusCommandHandler } from '../../application/commands/get-status.command';

export class CSPSentinelAdapter {
  private static instance: CSPSentinelAdapter | null = null;
  
  // Domain layer
  private readonly repository: CSPMonitoringRepository;
  private readonly cspMonitoringService: CSPMonitoringService;
  
  // Application layer
  private readonly monitorViolationsUseCase: MonitorViolationsUseCase;
  private readonly analyzeDirectivesUseCase: AnalyzeDirectivesUseCase;
  
  // Command layer
  private readonly commandExecutor: CSPCommandExecutorService;
  private readonly commandFactory: CSPCommandFactoryService;

  private constructor() {
    // Initialize infrastructure layer
    this.repository = new CSPMonitoringRepositoryImpl();
    this.cspMonitoringService = new CSPMonitoringServiceImpl(this.repository);
    
    // Initialize application layer
    this.monitorViolationsUseCase = new MonitorViolationsUseCaseImpl(this.cspMonitoringService);
    this.analyzeDirectivesUseCase = new AnalyzeDirectivesUseCaseImpl(this.cspMonitoringService);
    
    // Initialize command handlers
    const monitorViolationsCommandHandler = new MonitorViolationsCommandHandler(this.monitorViolationsUseCase);
    const analyzeDirectivesCommandHandler = new AnalyzeDirectivesCommandHandler(this.analyzeDirectivesUseCase);
    const analyzeDomainsCommandHandler = new AnalyzeDomainsCommandHandler();
    const enableMonitoringCommandHandler = new EnableMonitoringCommandHandler();
    const disableMonitoringCommandHandler = new DisableMonitoringCommandHandler();
    const getStatusCommandHandler = new GetStatusCommandHandler();
    
    // Initialize command layer
    this.commandExecutor = new CSPCommandExecutorService(
      monitorViolationsCommandHandler,
      analyzeDirectivesCommandHandler,
      analyzeDomainsCommandHandler,
      enableMonitoringCommandHandler,
      disableMonitoringCommandHandler,
      getStatusCommandHandler
    );
    this.commandFactory = new CSPCommandFactoryService();
  }

  static getInstance(): CSPSentinelAdapter {
    if (!CSPSentinelAdapter.instance) {
      CSPSentinelAdapter.instance = new CSPSentinelAdapter();
    }
    return CSPSentinelAdapter.instance;
  }

  getCommandExecutor(): CSPCommandExecutorService {
    return this.commandExecutor;
  }

  getCommandFactory(): CSPCommandFactoryService {
    return this.commandFactory;
  }

  getMonitorViolationsUseCase(): MonitorViolationsUseCase {
    return this.monitorViolationsUseCase;
  }

  getAnalyzeDirectivesUseCase(): AnalyzeDirectivesUseCase {
    return this.analyzeDirectivesUseCase;
  }
}
