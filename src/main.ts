import { setupCSPSentinel } from "./csp-sentinel/csp-sentinel";
import { setupDOMSentinel } from "./dom-integrity/dom-sentinel.";

let cspSentinelInstance: any = null;
let domSentinelInstance: any = null;
let isInitialized: boolean = false;

export type DOMShieldConfig = {
  csp?: {
    endpoint?: string;
    enable?: boolean;
    runAnalysis?: boolean;
    directives?: string[];
    domains?: string[];
  };
  integrity?: {
    selectors?: string[];
    suspiciousDomains?: string[];
    liveSelectors?: string[];
  };
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

async function setupIntegrity(integrityConfig: DOMShieldConfig['integrity'], cspEndpoint?: string): Promise<void> {
  if (!integrityConfig) return;

  if (domSentinelInstance) {
    console.warn("⚠️ DOM Sentinel instance already exists. Using existing instance.");
    return;
  }

  try {
    // Usar el endpoint de CSP si está disponible, o un endpoint por defecto
    const endpoint = cspEndpoint || '/dom-shield-report';
    
    domSentinelInstance = await setupDOMSentinel({
      ...integrityConfig,
      endpoint: endpoint
    });
    
    console.log("✅ DOM Sentinel initialized with command-based analysis");
  } catch (error) {
    console.error("❌ Failed to initialize DOM Sentinel:", error);
  }
}


const DOMShield = {
  async init(config: DOMShieldConfig): Promise<void> {
    if (isInitialized) {
      console.warn("⚠️ DOM Shield already initialized. Skipping re-initialization.");
      return;
    }

    const cspEndpoint = config.csp?.endpoint;
    
    if (config.csp) await setupCSP(config.csp);
    if (config.integrity) await setupIntegrity(config.integrity, cspEndpoint);

    isInitialized = true;
    console.log("🛡️ DOM Shield initialized successfully");
  },

  getCSPSentinel() {
    return cspSentinelInstance;
  },

  getDOMSentinel() {
    return domSentinelInstance;
  },

  reset(): void {
    cspSentinelInstance = null;
    domSentinelInstance = null;
    isInitialized = false;
    console.log("🔄 DOM Shield reset");
  },

  isInitialized(): boolean {
    return isInitialized;
  }
};

export default DOMShield;
export { DOMShield };
export const getDOMShield = () => domSentinelInstance;
export const getCSPSentinel = () => cspSentinelInstance;
export const getDOMSentinel = () => domSentinelInstance;
export const init = DOMShield.init;
export const reset = DOMShield.reset;
export const getInitializationStatus = () => isInitialized;