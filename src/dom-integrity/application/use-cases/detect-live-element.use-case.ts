import type { DOMDetectionService } from '../../domain/services/dom-detection.service';
import { Selector } from '../../domain/value-objects/selector.vo';
import { DOMElement } from '../../domain/entities/dom-element.entity';

export interface DetectLiveElementUseCase {
  execute(selector: string): Promise<{
    success: boolean;
    data?: DOMElement;
    message?: string;
    error?: Error;
  }>;
}

export class DetectLiveElementUseCaseImpl implements DetectLiveElementUseCase {
  constructor(domDetectionService: DOMDetectionService) {
    this.domDetectionService = domDetectionService;
  }
  
  private readonly domDetectionService: DOMDetectionService;

  async execute(selector: string): Promise<{
    success: boolean;
    data?: DOMElement;
    message?: string;
    error?: Error;
  }> {
    try {
      const selectorVO = new Selector(selector);
      const domElement = await this.domDetectionService.detectLiveElement(selectorVO);
      
      return {
        success: true,
        data: domElement,
        message: domElement.isSuspicious() 
          ? `Live element detected: ${selector}` 
          : `Live element check completed for selector: ${selector}`
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
        message: `Failed to detect live element: ${selector}`
      };
    }
  }
}
