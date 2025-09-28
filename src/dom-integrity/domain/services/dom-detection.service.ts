import { DOMElement } from '../entities/dom-element.entity';
import type { DOMElementData } from '../entities/dom-element.entity';
import { IframeElement } from '../entities/iframe-element.entity';
import type { IframeData } from '../entities/iframe-element.entity';
import { SuspiciousScript } from '../entities/suspicious-script.entity';
import type { ScriptData } from '../entities/suspicious-script.entity';
import { Selector } from '../value-objects/selector.vo';
import { Domain } from '../value-objects/domain.vo';

export interface DOMDetectionService {
  detectElement(selector: Selector): Promise<DOMElement>;
  detectIframe(): Promise<IframeElement>;
  detectSuspiciousScripts(suspiciousDomains: Domain[]): Promise<SuspiciousScript[]>;
  detectLiveElement(selector: Selector): Promise<DOMElement>;
}

export class DOMDetectionServiceImpl implements DOMDetectionService {
  async detectElement(selector: Selector): Promise<DOMElement> {
    const element = document.querySelector(selector.value);
    const found = element !== null;
    
    let elementData: DOMElementData | null = null;
    if (found && element) {
      elementData = {
        tagName: element.tagName,
        className: element.className,
        id: element.id,
        attributes: this.getElementAttributes(element),
      };
    }

    return new DOMElement(
      this.generateId(),
      selector.value,
      elementData,
      found
    );
  }

  async detectIframe(): Promise<IframeElement> {
    const iframe = document.querySelector('iframe');
    const found = iframe !== null;
    
    let iframeData: IframeData | null = null;
    if (found && iframe) {
      iframeData = {
        src: iframe.src || '',
        sandbox: iframe.sandbox?.value || '',
        allow: iframe.allow || '',
        loading: iframe.loading || '',
        width: iframe.width || '',
        height: iframe.height || '',
      };
    }

    return new IframeElement(
      this.generateId(),
      iframeData,
      found
    );
  }

  async detectSuspiciousScripts(suspiciousDomains: Domain[]): Promise<SuspiciousScript[]> {
    const scripts = document.querySelectorAll('script[src]');
    const suspiciousScripts: SuspiciousScript[] = [];
    const suspiciousDomainStrings = suspiciousDomains.map(d => d.value);

    scripts.forEach((script) => {
      const scriptElement = script as HTMLScriptElement;
      const scriptData: ScriptData = {
        src: scriptElement.src || '',
        type: scriptElement.type || '',
        async: scriptElement.async,
        defer: scriptElement.defer,
        integrity: scriptElement.integrity || '',
        crossorigin: scriptElement.crossOrigin || '',
      };

      const suspiciousScript = new SuspiciousScript(
        this.generateId(),
        scriptData,
        suspiciousDomainStrings
      );

      if (suspiciousScript.isSuspicious()) {
        suspiciousScripts.push(suspiciousScript);
      }
    });

    return suspiciousScripts;
  }

  async detectLiveElement(selector: Selector): Promise<DOMElement> {
    // For live elements, we use MutationObserver to detect changes
    return new Promise((resolve) => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            const element = document.querySelector(selector.value);
            if (element) {
              observer.disconnect();
              const found = true;
              const elementData: DOMElementData = {
                tagName: element.tagName,
                className: element.className,
                id: element.id,
                attributes: this.getElementAttributes(element),
              };
              resolve(new DOMElement(
                this.generateId(),
                selector.value,
                elementData,
                found
              ));
            }
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        observer.disconnect();
        resolve(new DOMElement(
          this.generateId(),
          selector.value,
          null,
          false
        ));
      }, 5000);
    });
  }

  private getElementAttributes(element: Element): Record<string, string> {
    const attributes: Record<string, string> = {};
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      attributes[attr.name] = attr.value;
    }
    return attributes;
  }

  private generateId(): string {
    return `dom-shield-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
