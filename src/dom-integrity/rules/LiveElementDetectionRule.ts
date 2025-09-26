import type { LiveElementDetectionParams, Rule } from "../types/rules";

class LiveElementDetectionRule implements Rule<LiveElementDetectionParams> {
  public readonly rule: string;
  private readonly selector: string;
  private observer: MutationObserver | null = null;

  private constructor(selector: string) {
    this.selector = selector;
    this.rule = `LiveElementDetection:${selector}`;
  }

  public static executeLiveElementDetectionRule({
    selector,
  }: LiveElementDetectionParams) {
    const rule = new LiveElementDetectionRule(selector);
    rule.execute();
  }

  public execute(): void {
    this.observer = new MutationObserver(this.handleMutations);
    this.observer.observe(document.body, { childList: true, subtree: true });
    console.log(
      `✅ DOM Shield: Started real-time monitoring for '${this.selector}'`
    );
  }

  private handleMutations = (mutationsList: MutationRecord[]): void => {
    for (const mutation of mutationsList) {
      if (mutation.type !== "childList") continue;
      mutation.addedNodes.forEach((node) => this.checkNode(node));
    }
  };

  private checkNode(node: Node): void {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const element = node as Element;
    if (
      element.matches(this.selector) ||
      element.querySelector(this.selector)
    ) {
      this.logSuspiciousElement();
      // this.disconnect();
    }
  }

  private logSuspiciousElement(): void {
    console.log(`🚨 DOM Shield: ${this.rule} detected!`);
    console.warn(`Suspicious element added to the DOM: ${this.selector}`);
  }

  public disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
      console.log(
        `✅ DOM Shield: Stopped real-time monitoring for '${this.selector}'`
      );
    }
  }
}

export const { executeLiveElementDetectionRule } = LiveElementDetectionRule;
