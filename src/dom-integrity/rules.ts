import type { Rule } from './types';

// Observer específico para .gemini-box
class GeminiBoxObserver {
    private observer: MutationObserver | null = null;
    private isStarted: boolean = false;

    start() {
        if (this.isStarted) {
            console.log('🔍 GeminiBoxObserver: Ya está iniciado');
            return;
        }

        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const element = node as Element;
                            if (element.classList.contains('gemini-box')) {
                                console.log('🚨 DOM Shield: Elemento .gemini-box detectado por MutationObserver!');
                                console.warn('Elemento sospechoso añadido al DOM:', element);
                            }
                        }
                    });
                }
            });
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false
        });

        this.isStarted = true;
        console.log('🔍 GeminiBoxObserver: Iniciado para detectar elementos .gemini-box');
    }

    stop() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
            this.isStarted = false;
            console.log('🛑 GeminiBoxObserver: Detenido');
        }
    }
}

// Instancia global del observer
const geminiBoxObserver = new GeminiBoxObserver();

// Security rules for DOM Shield
export const securityRules: Rule[] = [
    {
        name: 'GeminiBoxObserver',
        description: 'Observer que detecta elementos .gemini-box añadidos dinámicamente al DOM',
        execute: () => {
            geminiBoxObserver.start();
        }
    },
    {
        name: 'ParanaUserScript',
        description: 'Detecta elementos con clase .gemini-box (posible contenido sospechoso)',
        execute: () => {
            if (document.querySelector('.gemini-box')) {
                console.log('🚨 DOM Shield: ParanaUserScript detected!');
                console.warn('Potentially suspicious element found: .gemini-box');
            } else {
                console.log('✅ DOM Shield: ParanaUserScript check passed');
            }
        },
        shouldRunOnMutation: (mutation) => {
            return Array.from(mutation.addedNodes).some(node => 
                node.nodeType === Node.ELEMENT_NODE && 
                (node as Element).classList.contains('gemini-box')
            );
        }
    },
    {
        name: 'SuspiciousScripts',
        description: 'Analiza scripts externos de dominios sospechosos',
        execute: () => {
            const scripts = document.querySelectorAll('script[src]');
            const suspiciousDomains = ['suspicious-site.com', 'malware.example'];

            scripts.forEach((script: Element) => {
                const src = (script as HTMLScriptElement).src;
                if (suspiciousDomains.some(domain => src.includes(domain))) {
                    console.warn('🚨 DOM Shield: Suspicious script detected:', src);
                }
            });
        },
        shouldRunOnMutation: (mutation) => {
            return Array.from(mutation.addedNodes).some(node => 
                node.nodeType === Node.ELEMENT_NODE && 
                (node as Element).tagName === 'SCRIPT'
            );
        }
    },
    {
        name: 'IframeDetection',
        description: 'Detecta y lista todos los iframes en el documento',
        execute: () => {
            const iframes = document.querySelectorAll('iframe');
            if (iframes.length > 0) {
                console.log(`🔍 DOM Shield: Found ${iframes.length} iframe(s)`);
                iframes.forEach((iframe: Element, index) => {
                    const src = (iframe as HTMLIFrameElement).src;
                    console.log(`  Iframe ${index + 1}: ${src || 'No src attribute'}`);
                });
            }
        },
        shouldRunOnMutation: (mutation) => {
            return Array.from(mutation.addedNodes).some(node => 
                node.nodeType === Node.ELEMENT_NODE && 
                (node as Element).tagName === 'IFRAME'
            );
        }
    }
];

// DOM Shield Security Observer
export class DOMShieldSecurityObserver {
    private observer: MutationObserver | null = null;
    private rules: Rule[];

    constructor(rules: Rule[] = securityRules) {
        this.rules = rules;
    }

    // Iniciar el observador de seguridad
    start() {
        console.log('🛡️ DOM Shield: Iniciando observador de seguridad...');
        
        // Ejecutar reglas iniciales
        this.executeRules();
        
        // Configurar MutationObserver
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // Ejecutar solo las reglas que deben ejecutarse en esta mutación
                    this.executeRulesForMutation(mutation);
                }
            });
        });

        // Observar cambios en el documento
        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false
        });

        console.log('✅ DOM Shield: Observador de seguridad activado');
    }

    // Detener el observador
    stop() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
            console.log('🛑 DOM Shield: Observador de seguridad detenido');
        }
    }

    // Ejecutar todas las reglas
    private executeRules() {
        this.rules.forEach(rule => {
            try {
                rule.execute();
            } catch (error) {
                console.error(`❌ DOM Shield: Error ejecutando regla ${rule.name}:`, error);
            }
        });
    }

    // Ejecutar reglas específicas para una mutación
    private executeRulesForMutation(mutation: MutationRecord) {
        this.rules.forEach(rule => {
            try {
                // Si la regla tiene una función shouldRunOnMutation, verificar si debe ejecutarse
                if (rule.shouldRunOnMutation && rule.shouldRunOnMutation(mutation)) {
                    rule.execute();
                }
            } catch (error) {
                console.error(`❌ DOM Shield: Error ejecutando regla ${rule.name}:`, error);
            }
        });
    }

    // Obtener configuración de reglas
    getRulesConfig() {
        return this.rules.map(rule => ({
            name: rule.name,
            description: rule.description
        }));
    }
}


// Funciones de utilidad para la demo
export function testSecurityObserver() {
    console.log('%c🛡️ DOM Shield Demo - Security Observer Test', 'color: #4ECDC4; font-size: 18px; font-weight: bold;');
    
    const securityObserver = new DOMShieldSecurityObserver();
    securityObserver.start();
    
    console.log('%c✅ Observador de seguridad iniciado', 'color: #28a745; font-weight: bold;');
    console.log('🔍 El observador detectará automáticamente cambios en el DOM');
    console.log('⚠️ Prueba añadir contenido sospechoso para ver la detección en acción');
    
    // Guardar referencia global para poder detenerlo después
    (window as any).domShieldObserver = securityObserver;
}

export function testGeminiBoxObserver() {
    console.log('%c🔍 GeminiBox Observer Test - Solo detecta .gemini-box', 'color: #FF6B6B; font-size: 18px; font-weight: bold;');
    
    geminiBoxObserver.start();
    
    console.log('%c✅ GeminiBox Observer iniciado', 'color: #28a745; font-weight: bold;');
    console.log('🔍 Este observer solo detectará elementos con clase .gemini-box');
    console.log('⚠️ Prueba añadir un elemento .gemini-box para ver la detección');
    console.log('💡 Usa: const div = document.createElement("div"); div.className = "gemini-box"; document.body.appendChild(div);');
    
    // Guardar referencia global para poder detenerlo después
    (window as any).geminiBoxObserver = geminiBoxObserver;
}


export function testSpecificRules() {
    console.log('%c🔍 DOM Shield Demo - Specific Rules Configuration', 'color: #FFD93D; font-size: 18px; font-weight: bold;');
    
    const securityObserver = new DOMShieldSecurityObserver();
    const rulesConfig = securityObserver.getRulesConfig();
    
    console.log('%c📋 Configuración de Reglas de Seguridad:', 'color: #FFD93D; font-weight: bold;');
    console.table(rulesConfig);
    
    console.log('%c🔧 Ejecutando reglas manualmente...', 'color: #4ECDC4; font-weight: bold;');
    securityRules.forEach(rule => {
        console.log(`\n🔍 Ejecutando regla: ${rule.name}`);
        rule.execute();
    });
}
