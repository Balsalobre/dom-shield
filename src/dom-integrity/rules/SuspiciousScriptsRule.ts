import type { Rule } from "../../core/types/rules";
import type { SuspiciousScriptsParams } from "../types/dom-integrity-params.types";

class SuspiciousScriptsRule implements Rule<SuspiciousScriptsParams> {
  public readonly rule: string;
  private readonly suspiciousDomains: readonly string[];

  private constructor(domains: readonly string[] = []) {
    this.rule = this.buildRuleName(domains);
    this.suspiciousDomains = domains;
  }

  public static executeSuspiciousScriptsRule({
    domains,
  }: SuspiciousScriptsParams) {
    const suspiciousScriptsWatcher = new SuspiciousScriptsRule(domains);
    suspiciousScriptsWatcher.execute();
  }

  public execute(): void {
    const scripts = this.getAllScriptsWithSrc();
    scripts.forEach(script => this.checkScriptSecurity(script));
  }

  private buildRuleName(domains: readonly string[]): string {
    return domains.length > 0
      ? `SuspiciousScripts:${domains.join(",")}`
      : "SuspiciousScripts";
  }

  private getAllScriptsWithSrc(): NodeListOf<HTMLScriptElement> {
    return document.querySelectorAll("script[src]");
  }

  private checkScriptSecurity(script: HTMLScriptElement): void {
    if (this.suspiciousDomains.some(domain => script.src.includes(domain))) {
      console.warn("🚨 DOM Shield: Suspicious script detected:", script.src);
    }
  }
}

export const { executeSuspiciousScriptsRule } = SuspiciousScriptsRule;
