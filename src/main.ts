import { createCSPMonitor } from "./csp-sentinel/csp";
import { runIntegrityRules, type RuleConfig } from "./dom-integrity/rules";

export type DOMShieldConfig = {
  csp?: {
    endpoint?: string;
    enable?: boolean;
  };
  integrity?: RuleConfig[];
}

export const DOMShield = {
  init(config: DOMShieldConfig): void {
    config.csp && this.setupCSP(config.csp);

    config.integrity && this.setupIntegrity(config.integrity);

    console.log("🛡️ DOM Shield initialized successfully");
  },

  setupCSP(cspConfig: DOMShieldConfig['csp']): void {
    const monitor = createCSPMonitor(cspConfig?.endpoint);
    cspConfig?.enable && monitor.enableMonitoring();
    console.log(cspConfig?.enable ? "✅ CSP Monitoring enabled" : "⏸️ CSP Monitoring configured but disabled");
  },

  setupIntegrity(integrityConfig: RuleConfig[]): void {
    runIntegrityRules(integrityConfig);
    console.log(`✅ ${integrityConfig.length} integrity rules executed`);
  }
};
