import type { ElementDetectionParams, Rule } from "../types/rules";

class ElementDetectionRule implements Rule<ElementDetectionParams> {
  public readonly rule: string;
  private readonly selector: string;

  private constructor(selector: string) {
    this.selector = selector;
    this.rule = `ElementDetection:${selector}`;
  }

  public static executeElementDetectionRule({
    selector,
  }: ElementDetectionParams) {
    const rule = new ElementDetectionRule(selector);
    rule.execute();
  }

  public execute(): void {
    const element = this.findTargetElement();
    this.logDetectionResult(element);
  }

  private findTargetElement(): Element | null {
    return document.querySelector(this.selector);
  }

  private logDetectionResult(element: Element | null): void {
    if (element) {
      this.logSuspiciousElement();
    } else {
      this.logCheckPassed();
    }
  }

  private logSuspiciousElement(): void {
    console.log(`🚨 DOM Shield: ${this.rule} detected!`);
    console.warn(`Potentially suspicious element found: ${this.selector}`);
  }

  private logCheckPassed(): void {
    console.log(`✅ DOM Shield: ${this.rule} check passed`);
  }
}

export const { executeElementDetectionRule } = ElementDetectionRule;
