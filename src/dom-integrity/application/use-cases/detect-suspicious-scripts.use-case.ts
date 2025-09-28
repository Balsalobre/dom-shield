import type { DOMDetectionService } from '../../domain/services/dom-detection.service';
import { Domain } from '../../domain/value-objects/domain.vo';
import { SuspiciousScript } from '../../domain/entities/suspicious-script.entity';

export interface DetectSuspiciousScriptsUseCase {
  execute(suspiciousDomains: string[]): Promise<{
    success: boolean;
    data?: SuspiciousScript[];
    message?: string;
    error?: Error;
  }>;
}

export class DetectSuspiciousScriptsUseCaseImpl implements DetectSuspiciousScriptsUseCase {
  constructor(domDetectionService: DOMDetectionService) {
    this.domDetectionService = domDetectionService;
  }
  
  private readonly domDetectionService: DOMDetectionService;

  async execute(suspiciousDomains: string[]): Promise<{
    success: boolean;
    data?: SuspiciousScript[];
    message?: string;
    error?: Error;
  }> {
    try {
      const domainVOs = suspiciousDomains.map(domain => new Domain(domain));
      const suspiciousScripts = await this.domDetectionService.detectSuspiciousScripts(domainVOs);
      
      return {
        success: true,
        data: suspiciousScripts,
        message: suspiciousScripts.length > 0 
          ? `Found ${suspiciousScripts.length} suspicious script(s)` 
          : 'No suspicious scripts detected'
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
        message: 'Failed to detect suspicious scripts'
      };
    }
  }
}
