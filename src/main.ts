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
    if (config.csp) {
      const cspMonitor = createCSPMonitor(config.csp.endpoint);

      if (config.csp.enable) {
        cspMonitor.enableMonitoring();
        console.log("✅ CSP Monitoring enabled");
      } else {
        console.log("⏸️ CSP Monitoring configured but disabled");
      }
    }

    if (config.integrity) {
      runIntegrityRules(config.integrity);
      console.log(`✅ ${config.integrity.length} integrity rules executed`);
    }

    console.log("🛡️ DOM Shield initialized successfully");
  }
};
