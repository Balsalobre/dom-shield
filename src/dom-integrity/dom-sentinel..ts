import { DOMShieldAdapter } from './infrastructure/adapters/dom-shield.adapter';
import type { CommandResult } from '../shared/types/command.types';

export interface DOMSentinelConfig {
  selectors?: string[];
  suspiciousDomains?: string[];
  liveSelectors?: string[];
  endpoint?: string;
}

export class DOMSentinel {
  private adapter = DOMShieldAdapter.getInstance();

  setEndpoint(endpoint: string): void {
    this.adapter.setEndpoint(endpoint);
  }

  async detectElement(params: { selector: string }): Promise<CommandResult> {
    const command = this.adapter.getCommandFactory().createDetectElementCommand(params);
    return this.adapter.getCommandExecutor().execute(command);
  }

  async detectIframe(): Promise<CommandResult> {
    const command = this.adapter.getCommandFactory().createDetectIframeCommand({});
    return this.adapter.getCommandExecutor().execute(command);
  }

  async detectSuspiciousScripts(params: { domains: string[] }): Promise<CommandResult> {
    const command = this.adapter.getCommandFactory().createDetectSuspiciousScriptsCommand(params);
    return this.adapter.getCommandExecutor().execute(command);
  }

  async detectLiveElement(params: { selector: string }): Promise<CommandResult> {
    const command = this.adapter.getCommandFactory().createDetectLiveElementCommand(params);
    return this.adapter.getCommandExecutor().execute(command);
  }

  async getStatus(): Promise<CommandResult> {
    const command = this.adapter.getCommandFactory().createGetStatusCommand({});
    return this.adapter.getCommandExecutor().execute(command);
  }

  async runFullAnalysis(params: DOMSentinelConfig = {}): Promise<CommandResult> {
    const results = [];

    if (params.selectors) {
      for (const selector of params.selectors) {
        const result = await this.detectElement({ selector });
        results.push({ type: 'element', selector, result });
      }
    }

    const iframeResult = await this.detectIframe();
    results.push({ type: 'iframe', result: iframeResult });

    if (params.suspiciousDomains && params.suspiciousDomains.length > 0) {
      const scriptsResult = await this.detectSuspiciousScripts({ domains: params.suspiciousDomains });
      results.push({ type: 'scripts', domains: params.suspiciousDomains, result: scriptsResult });
    }

    if (params.liveSelectors) {
      for (const selector of params.liveSelectors) {
        const result = await this.detectLiveElement({ selector });
        results.push({ type: 'live-element', selector, result });
      }
    }

    return {
      success: true,
      message: 'Full analysis completed',
      data: results
    };
  }
}

// Singleton instance
let domSentinelInstance: DOMSentinel | null = null;

export function getDOMSentinel(): DOMSentinel {
  if (!domSentinelInstance) {
    domSentinelInstance = new DOMSentinel();
  }
  return domSentinelInstance;
}

export async function setupDOMSentinel(config: DOMSentinelConfig) {
  const sentinel = getDOMSentinel();
  
  // Configurar endpoint si se proporciona
  if (config.endpoint) {
    sentinel.setEndpoint(config.endpoint);
  }
  
  // Ejecutar análisis inicial
  await sentinel.runFullAnalysis({
    selectors: config.selectors,
    suspiciousDomains: config.suspiciousDomains,
    liveSelectors: config.liveSelectors,
  });

  // Iniciar monitoreo continuo para live selectors
  if (config.liveSelectors && config.liveSelectors.length > 0) {
    console.log(`👁️ DOM Sentinel: Iniciando monitoreo continuo para ${config.liveSelectors.length} selectores`);
    for (const selector of config.liveSelectors) {
      // Iniciar monitoreo en background (no esperar)
      sentinel.detectLiveElement({ selector }).catch(error => {
        console.error(`❌ DOM Sentinel: Error en monitoreo de selector "${selector}":`, error);
      });
    }
  }

  return sentinel;
}
