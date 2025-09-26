#!/bin/bash

echo "🛡️  DOM Shield - Deploy Script"
echo "================================"

echo "📦 Construyendo la librería..."
pnpm build

echo "📋 Copiando archivos..."
cp dist/dom-shield.umd.js demo/

echo "🐳 Construyendo imagen Docker..."
docker compose build

echo "🚀 Iniciando contenedor..."
docker compose up -d

echo ""
echo "✅ ¡Demo desplegada correctamente!"
echo "🌐 Accede a: http://localhost:8080"
echo ""
echo "📋 Comandos útiles:"
echo "   docker compose logs -f    # Ver logs"
echo "   docker compose stop       # Detener"
echo "   docker compose down       # Detener y eliminar"
