import type { DOMDetectionService } from '../../domain/services/dom-detection.service';
import type { DOMDetectionRepository } from '../../domain/repositories/dom-detection.repository';
import { DOMDetectionServiceImpl } from '../services/dom-detection.service.impl';
import { DOMDetectionRepositoryImpl } from '../repositories/dom-detection.repository.impl';

import type { DetectElementUseCase } from '../../application/use-cases/detect-element.use-case';
import { DetectElementUseCaseImpl } from '../../application/use-cases/detect-element.use-case';
import type { DetectIframeUseCase } from '../../application/use-cases/detect-iframe.use-case';
import { DetectIframeUseCaseImpl } from '../../application/use-cases/detect-iframe.use-case';
import type { DetectSuspiciousScriptsUseCase } from '../../application/use-cases/detect-suspicious-scripts.use-case';
import { DetectSuspiciousScriptsUseCaseImpl } from '../../application/use-cases/detect-suspicious-scripts.use-case';
import type { DetectLiveElementUseCase } from '../../application/use-cases/detect-live-element.use-case';
import { DetectLiveElementUseCaseImpl } from '../../application/use-cases/detect-live-element.use-case';

import { DOMCommandExecutorService } from '../../application/services/command-executor.service';
import { DOMCommandFactoryService } from '../../application/services/command-factory.service';
import { DetectElementCommandHandler } from '../../application/commands/detect-element.command';
import { DetectIframeCommandHandler } from '../../application/commands/detect-iframe.command';
import { DetectSuspiciousScriptsCommandHandler } from '../../application/commands/detect-suspicious-scripts.command';
import { DetectLiveElementCommandHandler } from '../../application/commands/detect-live-element.command';
import { GetStatusCommandHandler } from '../../application/commands/get-status.command';

export class DOMShieldAdapter {
  private static instance: DOMShieldAdapter | null = null;
  
  // Domain layer
  private readonly repository: DOMDetectionRepository;
  private readonly domDetectionService: DOMDetectionService;
  
  // Application layer
  private readonly detectElementUseCase: DetectElementUseCase;
  private readonly detectIframeUseCase: DetectIframeUseCase;
  private readonly detectSuspiciousScriptsUseCase: DetectSuspiciousScriptsUseCase;
  private readonly detectLiveElementUseCase: DetectLiveElementUseCase;
  
  // Command layer
  private readonly commandExecutor: DOMCommandExecutorService;
  private readonly commandFactory: DOMCommandFactoryService;

  private constructor() {
    // Initialize infrastructure layer
    this.repository = new DOMDetectionRepositoryImpl();
    this.domDetectionService = new DOMDetectionServiceImpl(this.repository);
    
    // Initialize application layer
    this.detectElementUseCase = new DetectElementUseCaseImpl(this.domDetectionService);
    this.detectIframeUseCase = new DetectIframeUseCaseImpl(this.domDetectionService);
    this.detectSuspiciousScriptsUseCase = new DetectSuspiciousScriptsUseCaseImpl(this.domDetectionService);
    this.detectLiveElementUseCase = new DetectLiveElementUseCaseImpl(this.domDetectionService);
    
    // Initialize command handlers
    const detectElementCommandHandler = new DetectElementCommandHandler(this.detectElementUseCase);
    const detectIframeCommandHandler = new DetectIframeCommandHandler(this.detectIframeUseCase);
    const detectSuspiciousScriptsCommandHandler = new DetectSuspiciousScriptsCommandHandler(this.detectSuspiciousScriptsUseCase);
    const detectLiveElementCommandHandler = new DetectLiveElementCommandHandler(this.detectLiveElementUseCase);
    const getStatusCommandHandler = new GetStatusCommandHandler();
    
    // Initialize command layer
    this.commandExecutor = new DOMCommandExecutorService(
      detectElementCommandHandler,
      detectIframeCommandHandler,
      detectSuspiciousScriptsCommandHandler,
      detectLiveElementCommandHandler,
      getStatusCommandHandler
    );
    this.commandFactory = new DOMCommandFactoryService();
  }

  static getInstance(): DOMShieldAdapter {
    if (!DOMShieldAdapter.instance) {
      DOMShieldAdapter.instance = new DOMShieldAdapter();
    }
    return DOMShieldAdapter.instance;
  }

  getCommandExecutor(): DOMCommandExecutorService {
    return this.commandExecutor;
  }

  getCommandFactory(): DOMCommandFactoryService {
    return this.commandFactory;
  }

  getDetectElementUseCase(): DetectElementUseCase {
    return this.detectElementUseCase;
  }

  getDetectIframeUseCase(): DetectIframeUseCase {
    return this.detectIframeUseCase;
  }

  getDetectSuspiciousScriptsUseCase(): DetectSuspiciousScriptsUseCase {
    return this.detectSuspiciousScriptsUseCase;
  }

  getDetectLiveElementUseCase(): DetectLiveElementUseCase {
    return this.detectLiveElementUseCase;
  }

  setEndpoint(endpoint: string): void {
    if (this.domDetectionService instanceof DOMDetectionServiceImpl) {
      this.domDetectionService.setEndpoint(endpoint);
    }
  }
}