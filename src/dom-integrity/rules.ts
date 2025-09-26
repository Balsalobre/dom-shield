import { executeElementDetectionRule } from "./rules/ElementDetectionRule";
import { executeIframeDetection } from "./rules/IframeDetectionRule";
import { executeSuspiciousScriptsRule } from "./rules/SuspiciousScriptsRule";
import { executeLiveElementDetectionRule } from "./rules/LiveElementDetectionRule";

export type RuleConfig =
  | { type: "element"; selector: string }
  | { type: "iframe" }
  | { type: "scripts"; domains: string[] }
  | { type: "live-element"; selector: string };

export const runIntegrityRules = (config: RuleConfig[]) => {
  for (const rule of config) {
    switch (rule.type) {
      case "element":
        executeElementDetectionRule({ selector: rule.selector });
        break;
      case "iframe":
        executeIframeDetection();
        break;
      case "scripts":
        executeSuspiciousScriptsRule({ domains: rule.domains });
        break;
      case "live-element":
        executeLiveElementDetectionRule({ selector: rule.selector });
        break;
    }
  }
};
