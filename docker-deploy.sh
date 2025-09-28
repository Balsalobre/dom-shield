#!/bin/bash

echo "🛡️  DOM Shield - Docker Deploy Script"
echo "====================================="

echo "🐳 Construyendo imagen Docker (incluye build automático)..."
docker compose build --no-cache

echo "🚀 Iniciando contenedor..."
docker compose up -d

echo ""
echo "✅ ¡Demo desplegada correctamente!"
echo "🌐 Accede a: http://localhost:8080"
echo ""
echo "📋 Comandos útiles:"
echo "   docker compose logs -f    # Ver logs"
echo "   docker compose ps         # Ver estado"
echo "   docker compose stop       # Detener"
echo "   docker compose down       # Detener y eliminar"
echo "   docker compose restart    # Reiniciar"
echo ""
echo "🔍 Verificando estado del contenedor..."
sleep 5
docker compose ps
