#!/usr/bin/env bash
# =============================================================================
# Poker Winners — mise à jour du backend sur o2switch (à chaque nouvelle version)
#   ssh bopu6118@redkards-dev.fr 'bash ~/poker-winners/deploy/deploy.sh'
# =============================================================================
set -euo pipefail

APP_DIR="${HOME}/poker-winners"
BACK="${APP_DIR}/backPoker"
PHP_BIN="${PHP_BIN:-php}"
COMPOSER="${COMPOSER_BIN:-composer}"

cd "${APP_DIR}"
echo "♠ Récupération du code (branche main)"
git fetch --quiet origin main
git reset --hard --quiet origin/main
git log --oneline -1

cd "${BACK}"
[ -f .env.local ] || { echo ".env.local absent : lancez d'abord deploy/server-setup.sh"; exit 1; }

echo "♠ Dépendances (sans outils de développement)"
APP_ENV=prod "${COMPOSER}" install --no-dev --optimize-autoloader --classmap-authoritative --no-interaction --no-progress

echo "♠ Configuration compilée (.env.local.php, droits 600)"
APP_ENV=prod "${COMPOSER}" dump-env prod
chmod 600 .env.local.php

echo "♠ Migrations de la base"
"${PHP_BIN}" bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration --env=prod

echo "♠ Cache"
"${PHP_BIN}" bin/console cache:clear --env=prod --no-debug
"${PHP_BIN}" bin/console cache:warmup --env=prod --no-debug
"${PHP_BIN}" bin/console assets:install public --env=prod --no-debug >/dev/null

echo "♠ Vérification de sécurité des dépendances"
"${COMPOSER}" audit --no-dev || echo "⚠ composer audit signale un problème : à traiter avant la mise en ligne publique"

echo "♠ Backend à jour."
