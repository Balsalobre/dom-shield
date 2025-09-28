import { runIntegrityRules, type RuleConfig } from "./dom-integrity/rules";
import { setupCSPSentinel } from "./csp-sentinel";

let cspSentinelInstance: any = null;
let isInitialized: boolean = false;

export type DOMShieldConfig = {
  csp?: {
    endpoint?: string;
    enable?: boolean;
    maxQueueSize?: number;
    runAnalysis?: boolean;
    directives?: string[];
    domains?: string[];
  };
  integrity?: RuleConfig[];
};

async function setupCSP(cspConfig: DOMShieldConfig['csp']): Promise<void> {
  if (!cspConfig) return;

  if (cspSentinelInstance) {
    console.warn("⚠️ CSP Sentinel instance already exists. Using existing instance.");
    return;
  }

  try {
    cspSentinelInstance = await setupCSPSentinel({
      endpoint: cspConfig.endpoint,
      maxQueueSize: cspConfig.maxQueueSize,
      enableMonitoring: cspConfig.enable,
      runAnalysis: cspConfig.runAnalysis,
      directives: cspConfig.directives,
      domains: cspConfig.domains,
    });
    
    console.log("✅ CSP Sentinel initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize CSP Sentinel:", error);
  }
}

function setupIntegrity(integrityConfig: RuleConfig[]): void {
  if (!integrityConfig) return;

  runIntegrityRules(integrityConfig);
  console.log(`✅ ${integrityConfig.length} integrity rules executed`);
}


export default {
  async init(config: DOMShieldConfig): Promise<void> {
    if (isInitialized) {
      console.warn("⚠️ DOM Shield already initialized. Skipping re-initialization.");
      return;
    }

    if (config.csp) await setupCSP(config.csp);
    if (config.integrity) setupIntegrity(config.integrity);

    isInitialized = true;
    console.log("🛡️ DOM Shield initialized successfully");
  },

  getCSPSentinel() {
    return cspSentinelInstance;
  },

  reset(): void {
    cspSentinelInstance = null;
    isInitialized = false;
    console.log("🔄 DOM Shield reset");
  },

  isInitialized(): boolean {
    return isInitialized;
  }
};