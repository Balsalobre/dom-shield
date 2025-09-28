import type { CSPMonitoringService } from '../../domain/services/csp-monitoring.service';
import { Endpoint } from '../../domain/value-objects/endpoint.vo';

export interface MonitorViolationsUseCase {
  execute(endpoint?: string): Promise<{
    success: boolean;
    data?: any;
    message?: string;
    error?: Error;
  }>;
}

export class MonitorViolationsUseCaseImpl implements MonitorViolationsUseCase {
  constructor(cspMonitoringService: CSPMonitoringService) {
    this.cspMonitoringService = cspMonitoringService;
  }
  
  private readonly cspMonitoringService: CSPMonitoringService;

  async execute(endpoint?: string): Promise<{
    success: boolean;
    data?: any;
    message?: string;
    error?: Error;
  }> {
    try {
      const endpointVO = new Endpoint(endpoint || '/csp-violations');
      const violations = await this.cspMonitoringService.startMonitoring(endpointVO);
      
      // Enable monitoring after starting
      await this.cspMonitoringService.enableMonitoring();
      
      console.log(`🔒 CSP Sentinel: Monitoreo iniciado en endpoint ${endpointVO.value}`);
      
      return {
        success: true,
        data: {
          endpoint: endpointVO.value,
          violations: violations.length,
          isEnabled: true
        },
        message: 'CSP violation monitoring started successfully'
      };
    } catch (error) {
      console.error('❌ CSP Sentinel: Error al iniciar monitoreo:', error);
      return {
        success: false,
        error: error as Error,
        message: 'Failed to start CSP violation monitoring'
      };
    }
  }
}
