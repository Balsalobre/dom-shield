import type { DOMDetectionService } from '../../domain/services/dom-detection.service';
import { IframeElement } from '../../domain/entities/iframe-element.entity';

export interface DetectIframeUseCase {
  execute(): Promise<{
    success: boolean;
    data?: IframeElement;
    message?: string;
    error?: Error;
  }>;
}

export class DetectIframeUseCaseImpl implements DetectIframeUseCase {
  constructor(domDetectionService: DOMDetectionService) {
    this.domDetectionService = domDetectionService;
  }
  
  private readonly domDetectionService: DOMDetectionService;

  async execute(): Promise<{
    success: boolean;
    data?: IframeElement;
    message?: string;
    error?: Error;
  }> {
    try {
      const iframeElement = await this.domDetectionService.detectIframe();
      
      return {
        success: true,
        data: iframeElement,
        message: iframeElement.isSuspicious() 
          ? 'Suspicious iframe detected' 
          : 'Iframe check completed'
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
        message: 'Failed to detect iframe'
      };
    }
  }
}
