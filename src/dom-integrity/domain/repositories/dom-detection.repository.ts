import type { Repository } from '../../../shared/types/domain.types';
import { DOMElement } from '../entities/dom-element.entity';
import { IframeElement } from '../entities/iframe-element.entity';
import { SuspiciousScript } from '../entities/suspicious-script.entity';

export interface DOMDetectionRepository extends Repository<DOMElement> {
  findIframes(): Promise<IframeElement[]>;
  findSuspiciousScripts(): Promise<SuspiciousScript[]>;
  findBySelector(selector: string): Promise<DOMElement[]>;
  saveIframe(iframe: IframeElement): Promise<void>;
  saveSuspiciousScript(script: SuspiciousScript): Promise<void>;
}
