# CSP Sentinel - Command Handler Pattern

CSP Sentinel es un sistema unificado de monitoreo y análisis de Content Security Policy (CSP) que implementa el patrón Command Handler para proporcionar una API extensible y testeable.

## 🏗️ Arquitectura

### Patrón Command Handler
- **Comandos**: Cada operación CSP es un comando independiente
- **Handlers**: Cada comando tiene su propio handler especializado
- **Executor**: Orquesta la ejecución de comandos y maneja errores
- **Factory**: Crea comandos de forma tipada y consistente

### Estructura del Módulo
```
csp-sentinel/
├── commands/                    # Comandos individuales
│   ├── base-command.ts         # Clase base para comandos
│   ├── monitor-violations-command.ts
│   ├── analyze-directives-command.ts
│   ├── analyze-domains-command.ts
│   ├── enable-monitoring-command.ts
│   ├── disable-monitoring-command.ts
│   ├── get-status-command.ts
│   ├── clear-queue-command.ts
│   ├── send-queued-reports-command.ts
│   └── get-queued-reports-command.ts
├── types/
│   ├── command.types.ts        # Tipos para comandos
│   └── csp.d.ts               # Tipos CSP
├── __tests__/                  # Tests completos
├── command-executor.ts         # Ejecutor principal
├── index.ts                   # API pública
└── csp.ts                     # Legacy (deprecated)
```

## 🚀 Uso

### API de Alto Nivel (Recomendada)

```typescript
import { getCSPSentinel, setupCSPSentinel } from './csp-sentinel';

// Configuración rápida
const sentinel = await setupCSPSentinel({
  endpoint: '/csp-violations',
  maxQueueSize: 100,
  enableMonitoring: true,
  runAnalysis: true,
  directives: ['script-src', 'style-src'],
  domains: ['trusted.com']
});

// Uso individual
const sentinel = getCSPSentinel();

// Monitoreo
await sentinel.startMonitoring({ endpoint: '/csp-violations' });
await sentinel.enableMonitoring();
await sentinel.disableMonitoring();

// Análisis
await sentinel.analyzeDirectives({ directives: ['script-src'] });
await sentinel.analyzeDomains({ domains: ['trusted.com'] });

// Estado y gestión
const status = await sentinel.getStatus();
const reports = await sentinel.getQueuedReports();
await sentinel.clearQueue({ confirm: true });
await sentinel.sendQueuedReports();

// Análisis completo
const analysis = await sentinel.runFullAnalysis({
  directives: ['script-src'],
  domains: ['trusted.com'],
  includeQueue: true
});
```

### API de Bajo Nivel (Command Handler)

```typescript
import { getCSPCommandExecutor, CSPCommandFactory } from './csp-sentinel';

const executor = getCSPCommandExecutor();

// Crear y ejecutar comandos
const command = CSPCommandFactory.createMonitorViolationsCommand({
  endpoint: '/csp-violations',
  maxQueueSize: 100
});

const result = await executor.execute(command);
```

## 📋 Comandos Disponibles

### 1. Monitoreo de Violaciones
- **Tipo**: `monitor-violations`
- **Función**: Inicializa el monitoreo de violaciones CSP
- **Parámetros**: `endpoint`, `maxQueueSize`

### 2. Análisis de Directivas
- **Tipo**: `analyze-directives`
- **Función**: Analiza directivas CSP para detectar configuraciones inseguras
- **Parámetros**: `directives`, `policy`

### 3. Análisis de Dominios
- **Tipo**: `analyze-domains`
- **Función**: Analiza dominios permitidos en la política CSP
- **Parámetros**: `domains`, `policy`

### 4. Control del Monitor
- **Tipo**: `enable-monitoring` / `disable-monitoring`
- **Función**: Habilita/deshabilita el monitoreo
- **Parámetros**: `sendQueued`, `clearQueue`

### 5. Estado y Gestión
- **Tipo**: `get-status` / `get-queued-reports`
- **Función**: Obtiene estado del sistema y reportes encolados
- **Parámetros**: `includeQueue`, `limit`, `offset`

### 6. Gestión de Cola
- **Tipo**: `clear-queue` / `send-queued-reports`
- **Función**: Limpia cola y envía reportes encolados
- **Parámetros**: `confirm`, `maxRetries`

## 🧪 Testing

### Ejecutar Tests
```bash
npm run test
npm run test:ui
npm run test:run
```

### Cobertura de Tests
- ✅ Command Executor
- ✅ Todos los comandos individuales
- ✅ API de alto nivel
- ✅ Integración completa
- ✅ Manejo de errores
- ✅ Casos edge

## 🔧 Extensibilidad

### Agregar Nuevo Comando

1. **Crear el comando**:
```typescript
export class NewAnalysisCommand extends BaseCSPCommand<NewAnalysisParams> {
  constructor(params: NewAnalysisParams) {
    super('new-analysis', params);
  }

  public execute(): CSPCommandResult {
    // Implementar lógica del comando
    return this.createSuccessResult(data);
  }
}
```

2. **Crear el handler**:
```typescript
class NewAnalysisHandler implements CSPCommandHandler {
  canHandle(command: CSPCommand): boolean {
    return command.type === 'new-analysis';
  }

  async handle(command: CSPCommand): Promise<CSPCommandResult> {
    const cmd = new NewAnalysisCommand(command.params);
    return cmd.execute();
  }
}
```

3. **Registrar en el executor**:
```typescript
executor.registerHandler(new NewAnalysisHandler());
```

## 🎯 Ventajas del Patrón

1. **🔧 Extensibilidad**: Fácil agregar nuevos comandos sin modificar código existente
2. **🧪 Testabilidad**: Cada comando se puede testear de forma aislada
3. **🔗 Composición**: Los comandos se pueden combinar y ejecutar en secuencia
4. **📝 Mantenibilidad**: Código organizado y bien tipado
5. **♻️ Reutilización**: Los comandos se pueden usar independientemente
6. **🛡️ Robustez**: Manejo centralizado de errores y logging
7. **📊 Observabilidad**: Logging detallado de todas las operaciones

## 🔄 Migración desde csp-integrity

El módulo `csp-integrity` ha sido unificado en `csp-sentinel`. Para migrar:

**Antes**:
```typescript
import { runCSPIntegrityRules } from './csp-integrity/rules';

runCSPIntegrityRules([
  { type: 'violation-monitor', endpoint: '/csp-violations' },
  { type: 'directive-analysis', directives: ['script-src'] }
]);
```

**Después**:
```typescript
import { getCSPSentinel } from './csp-sentinel';

const sentinel = getCSPSentinel();
await sentinel.startMonitoring({ endpoint: '/csp-violations' });
await sentinel.analyzeDirectives({ directives: ['script-src'] });
```

## 📚 Documentación Adicional

- [Tipos de Comandos](./types/command.types.ts)
- [Tests de Ejemplo](./__tests__/)
- [API de Alto Nivel](./index.ts)
