#!/bin/bash
set -e

# Crear Laravel en /tmp y copiar al directorio actual (preserva Dockerfile, docker-compose, etc.)
if [ ! -f "artisan" ]; then
  echo ">>> Creando proyecto Laravel..."
  composer create-project laravel/laravel /tmp/laravel --no-interaction
  cp -a /tmp/laravel/. .
  rm -rf /tmp/laravel
  echo ">>> Laravel instalado."
fi

# Instalar Breeze con React (Inertia) si no existe la config de Breeze
if [ ! -d "resources/js/Pages" ]; then
  echo ">>> Instalando paquete Laravel Breeze..."
  composer require laravel/breeze --dev --no-interaction
  echo ">>> Instalando Breeze con React (Inertia)..."
  php artisan breeze:install react --no-interaction
  echo ">>> Breeze + React instalado."
fi

# Dependencias PHP
echo ">>> Instalando dependencias Composer..."
composer install --no-interaction

# Dependencias Node y build
echo ">>> Instalando dependencias npm..."
npm install
npm run build

# Configuración
if [ ! -f ".env" ]; then
  cp .env.example .env
  php artisan key:generate
  echo ">>> .env creado y key generada."
fi

echo ">>> Ejecutando migraciones..."
php artisan migrate --force 2>/dev/null || true

echo ""
echo ">>> Listo. Levanta los servicios con:"
echo "    docker compose up -d"
echo "    (Para Vite en caliente: docker compose --profile dev up -d)"
echo "    App: http://localhost:8001"
