#!/bin/sh
set -e

echo "Executando migrations..."

if [ "$NODE_ENV" = "production" ]; then
  npm run migration:run:prod
  echo "Iniciando NestJS em modo produção..."
  exec npm run start:prod
else
  npm run migration:run
  echo "Iniciando NestJS em modo desenvolvimento..."
  exec npm run start:dev
fi
