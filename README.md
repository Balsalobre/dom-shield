# 🛡️ DOM Shield

> **⚠️ Proyecto Piloto / Spike**  
> Este proyecto ha sido generado con un agente de IA como prueba de concepto para explorar funcionalidades de seguridad web.

## 📋 Descripción

DOM Shield es una librería de seguridad web que proporciona monitoreo en tiempo real del DOM y detección de violaciones CSP (Content Security Policy). El proyecto incluye:

- **🛡️ Observador de Seguridad DOM**: Detecta elementos sospechosos y cambios en el DOM
- **🔍 Reglas Configurables**: Sistema de reglas personalizables para diferentes tipos de amenazas
- **📊 Monitor CSP**: Detección y reporte automático de violaciones de Content Security Policy
- **🎯 Detección Específica**: Identificación de elementos como `.gemini-box` e iframes sospechosos

## 🚀 Despliegue Rápido

### Prerrequisitos
- **Docker** y **Docker Compose** instalados
- **pnpm** (gestor de paquetes)

### Ejecutar el Deploy

```bash
# Ejecutar el script de despliegue completo
./deploy.sh
```

El script `deploy.sh` realiza automáticamente:
1. 📦 Construcción de la librería (`pnpm build`)
2. 📋 Copia de archivos necesarios
3. 🐳 Construcción de la imagen Docker
4. 🚀 Inicio del contenedor

### Acceso
Una vez desplegado, accede a: **http://localhost:8080**

### Comandos Útiles
```bash
# Ver logs del contenedor
docker compose logs -f

# Detener el servicio
docker compose stop

# Detener y eliminar contenedores
docker compose down
```

## 🛠️ Desarrollo

### Scripts Disponibles
```bash
pnpm dev          # Servidor de desarrollo
pnpm build        # Construir librería
pnpm preview      # Vista previa de la build
pnpm demo:build   # Construir y preparar demo
pnpm demo:docker  # Ejecutar deploy.sh
```

## 📦 Funcionalidades

### Reglas de Seguridad Implementadas
- **ParanaUserScript**: Detecta elementos con clase `.gemini-box`
- **SuspiciousScripts**: Analiza scripts de dominios sospechosos
- **IframeDetection**: Lista y monitorea iframes en la página

### Monitor CSP
- Detección en tiempo real de violaciones CSP
- Reportes automáticos a endpoint `/csp-violations`
- Estado del monitor accesible programáticamente

## 🏗️ Arquitectura

- **Frontend**: TypeScript + Vite
- **Servidor**: nginx (Alpine Linux)
- **Contenedorización**: Docker + Docker Compose
- **Distribución**: UMD, ES Modules, CommonJS

## ⚠️ Nota Importante

Este es un **proyecto piloto/spike** generado con IA para explorar conceptos de seguridad web. No debe utilizarse en producción sin una revisión exhaustiva de seguridad y funcionalidad.
