import type { DOMDetectionService } from '../../domain/services/dom-detection.service';
import type { DOMDetectionRepository } from '../../domain/repositories/dom-detection.repository';
import { DOMElement } from '../../domain/entities/dom-element.entity';
import { IframeElement } from '../../domain/entities/iframe-element.entity';
import { SuspiciousScript } from '../../domain/entities/suspicious-script.entity';
import { Selector } from '../../domain/value-objects/selector.vo';
import { Domain } from '../../domain/value-objects/domain.vo';

export class DOMDetectionServiceImpl implements DOMDetectionService {
  constructor(repository: DOMDetectionRepository) {
    this.repository = repository;
  }
  
  private readonly repository: DOMDetectionRepository;
  private endpoint: string | null = null;

  setEndpoint(endpoint: string) {
    this.endpoint = endpoint;
  }

  async detectElement(selector: Selector): Promise<DOMElement> {
    console.log(`🔍 DOM Sentinel: Buscando elemento con selector "${selector.value}"`);
    
    const element = document.querySelector(selector.value);
    const found = element !== null;
    
    let elementData: any = null;
    if (found && element) {
      elementData = {
        tagName: element.tagName,
        className: element.className,
        id: element.id,
        attributes: this.getElementAttributes(element),
      };
      console.log(`✅ DOM Sentinel: Elemento encontrado`, elementData);
    } else {
      console.log(`❌ DOM Sentinel: Elemento no encontrado para selector "${selector.value}"`);
    }

    const domElement = new DOMElement(
      this.generateId(),
      selector.value,
      elementData,
      found
    );

    await this.repository.save(domElement);
    
    // Enviar reporte al endpoint si se encontró algo sospechoso
    if (found) {
      await this.sendDetectionReport('element', {
        selector: selector.value,
        element: elementData,
        timestamp: new Date().toISOString()
      });
    }
    
    return domElement;
  }

  async detectIframe(): Promise<IframeElement> {
    console.log(`🔍 DOM Sentinel: Buscando iframes en el documento`);
    
    const iframe = document.querySelector('iframe');
    const found = iframe !== null;
    
    let iframeData: any = null;
    if (found && iframe) {
      iframeData = {
        src: iframe.src || '',
        sandbox: iframe.sandbox?.value || '',
        allow: iframe.allow || '',
        loading: iframe.loading || '',
        width: iframe.width || '',
        height: iframe.height || '',
      };
      console.log(`✅ DOM Sentinel: Iframe encontrado`, iframeData);
    } else {
      console.log(`❌ DOM Sentinel: No se encontraron iframes`);
    }

    const iframeElement = new IframeElement(
      this.generateId(),
      iframeData,
      found
    );

    await this.repository.saveIframe(iframeElement);
    
    // Enviar reporte al endpoint si se encontró un iframe
    if (found) {
      await this.sendDetectionReport('iframe', {
        iframe: iframeData,
        timestamp: new Date().toISOString()
      });
    }
    
    return iframeElement;
  }

  async detectSuspiciousScripts(suspiciousDomains: Domain[]): Promise<SuspiciousScript[]> {
    console.log(`🔍 DOM Sentinel: Buscando scripts sospechosos con dominios:`, suspiciousDomains.map(d => d.value));
    
    const scripts = document.querySelectorAll('script[src]');
    const suspiciousScripts: SuspiciousScript[] = [];
    const suspiciousDomainStrings = suspiciousDomains.map(d => d.value);

    scripts.forEach((script) => {
      const scriptElement = script as HTMLScriptElement;
      const scriptData = {
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
        console.log(`⚠️ DOM Sentinel: Script sospechoso detectado`, scriptData);
        suspiciousScripts.push(suspiciousScript);
        this.repository.saveSuspiciousScript(suspiciousScript);
      }
    });

    if (suspiciousScripts.length === 0) {
      console.log(`✅ DOM Sentinel: No se encontraron scripts sospechosos`);
    } else {
      console.log(`🚨 DOM Sentinel: Se encontraron ${suspiciousScripts.length} scripts sospechosos`);
      
      // Enviar reporte al endpoint
      await this.sendDetectionReport('suspicious-scripts', {
        scripts: suspiciousScripts.map(s => s.getSuspiciousReason()),
        count: suspiciousScripts.length,
        timestamp: new Date().toISOString()
      });
    }

    return suspiciousScripts;
  }

  async detectLiveElement(selector: Selector): Promise<DOMElement> {
    console.log(`🔍 DOM Sentinel: Iniciando monitoreo en vivo para selector "${selector.value}"`);
    
    // Verificar si ya existe un elemento con este selector
    const existingElement = document.querySelector(selector.value);
    if (existingElement) {
      console.log(`✅ DOM Sentinel: Elemento ya existe para selector "${selector.value}"`);
      const elementData = {
        tagName: existingElement.tagName,
        className: existingElement.className,
        id: existingElement.id,
        attributes: this.getElementAttributes(existingElement),
      };
      const domElement = new DOMElement(
        this.generateId(),
        selector.value,
        elementData,
        true
      );
      this.repository.save(domElement);
      
      // Enviar reporte al endpoint
      await this.sendDetectionReport('live-element', {
        selector: selector.value,
        element: elementData,
        timestamp: new Date().toISOString()
      });
      
      return domElement;
    }
    
    return new Promise((resolve) => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            const element = document.querySelector(selector.value);
            if (element) {
              console.log(`⚡ DOM Sentinel: Elemento detectado en vivo`, {
                selector: selector.value,
                tagName: element.tagName,
                className: element.className
              });
              
              const found = true;
              const elementData = {
                tagName: element.tagName,
                className: element.className,
                id: element.id,
                attributes: this.getElementAttributes(element),
              };
              const domElement = new DOMElement(
                this.generateId(),
                selector.value,
                elementData,
                found
              );
              this.repository.save(domElement);
              
              // Enviar reporte al endpoint
              this.sendDetectionReport('live-element', {
                selector: selector.value,
                element: elementData,
                timestamp: new Date().toISOString()
              });
              
              // NO desconectar el observer para monitoreo continuo
              resolve(domElement);
            }
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // No poner timeout para monitoreo continuo
      console.log(`👁️ DOM Sentinel: Monitoreo continuo activado para selector "${selector.value}"`);
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

  private async sendDetectionReport(type: string, data: any): Promise<void> {
    if (!this.endpoint) {
      console.log(`📤 DOM Sentinel: No endpoint configurado, saltando envío de reporte`);
      return;
    }

    try {
      const report = {
        type: 'dom-detection',
        detectionType: type,
        data: data,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      };

      console.log(`📤 DOM Sentinel: Enviando reporte al endpoint`, report);

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report)
      });

      if (response.ok) {
        console.log(`✅ DOM Sentinel: Reporte enviado exitosamente`);
      } else {
        console.error(`❌ DOM Sentinel: Error al enviar reporte: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ DOM Sentinel: Error al enviar reporte:`, error);
    }
  }
}
