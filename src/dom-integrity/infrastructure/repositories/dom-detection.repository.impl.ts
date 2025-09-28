import type { DOMDetectionRepository } from '../../domain/repositories/dom-detection.repository';
import { DOMElement } from '../../domain/entities/dom-element.entity';
import { IframeElement } from '../../domain/entities/iframe-element.entity';
import { SuspiciousScript } from '../../domain/entities/suspicious-script.entity';

export class DOMDetectionRepositoryImpl implements DOMDetectionRepository {
  private elements: Map<string, DOMElement> = new Map();
  private iframes: Map<string, IframeElement> = new Map();
  private scripts: Map<string, SuspiciousScript> = new Map();

  async findById(id: string): Promise<DOMElement | null> {
    return this.elements.get(id) || null;
  }

  async save(entity: DOMElement): Promise<void> {
    this.elements.set(entity.id, entity);
  }

  async delete(id: string): Promise<void> {
    this.elements.delete(id);
  }

  async findIframes(): Promise<IframeElement[]> {
    return Array.from(this.iframes.values());
  }

  async findSuspiciousScripts(): Promise<SuspiciousScript[]> {
    return Array.from(this.scripts.values());
  }

  async findBySelector(selector: string): Promise<DOMElement[]> {
    return Array.from(this.elements.values()).filter(
      element => element.selector === selector
    );
  }

  async saveIframe(iframe: IframeElement): Promise<void> {
    this.iframes.set(iframe.id, iframe);
  }

  async saveSuspiciousScript(script: SuspiciousScript): Promise<void> {
    this.scripts.set(script.id, script);
  }
}
