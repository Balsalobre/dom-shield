import type { Rule } from "../../core/types/rules";

class IframeDetectionRule implements Rule {
  public readonly rule = "IframeDetection";

  private constructor() {}

  public static executeIframeDetection(): void {
    new IframeDetectionRule().execute();
  }

  public execute(): void {
    const iframes = this.getAllIframes();
    this.logIframeResults(iframes);
  }

  private getAllIframes(): NodeListOf<HTMLIFrameElement> {
    return document.querySelectorAll("iframe");
  }

  private logIframeResults(iframes: NodeListOf<HTMLIFrameElement>): void {
    if (iframes.length > 0) {
      console.log(`🔍 DOM Shield: Found ${iframes.length} iframe(s)`);
      iframes.forEach((iframe, index) => this.logIframeInfo(iframe, index));
    }
  }

  private logIframeInfo(iframe: HTMLIFrameElement, index: number): void {
    const src = iframe.src || "No src attribute";
    console.log(`  Iframe ${index + 1}: ${src}`);
  }
}

export const { executeIframeDetection } = IframeDetectionRule;
