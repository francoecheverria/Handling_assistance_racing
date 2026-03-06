#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

FRESH=false
RUN_NODE=true
RUN_BUILD=false

usage() {
  echo "Uso: ./up.sh [opciones]"
  echo
  echo "Opciones:"
  echo "  --fresh     Reinicia DB con migrate:fresh --seed"
  echo "  --no-node   No levanta el contenedor node (vite dev)"
  echo "  --build     Corre npm run build en app"
  echo "  -h, --help  Muestra esta ayuda"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --fresh)
      FRESH=true
      shift
      ;;
    --no-node)
      RUN_NODE=false
      shift
      ;;
    --build)
      RUN_BUILD=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Opcion no reconocida: $1"
      usage
      exit 1
      ;;
  esac
done

echo "==> Levantando app + mysql..."
docker compose up -d app mysql

if [[ "$FRESH" == "true" ]]; then
  echo "==> Reiniciando base (migrate:fresh --seed)..."
  docker compose exec app php artisan migrate:fresh --seed --force
else
  echo "==> Ejecutando migraciones..."
  docker compose exec app php artisan migrate --force
fi

if [[ "$RUN_NODE" == "true" ]]; then
  echo "==> Levantando node (vite dev)..."
  docker compose --profile dev up -d node
fi

if [[ "$RUN_BUILD" == "true" ]]; then
  echo "==> Build frontend..."
  docker compose exec app npm run build
fi

echo
echo "Listo."
echo "- App:  http://localhost:8002"
if [[ "$RUN_NODE" == "true" ]]; then
  echo "- Vite: http://localhost:5173"
fi
echo "- MySQL host: localhost:3310"
