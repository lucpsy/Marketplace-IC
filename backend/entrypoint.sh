#!/bin/sh

echo "Executando migrations..."

npm run migration:run

if [ $? -ne 0 ]; then
    echo "Falha ao executar migrations!"
    exit 1
fi

echo "Iniciando NestJS..."

exec npm run start:dev