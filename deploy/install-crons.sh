#!/usr/bin/env bash
# =============================================================================
# Poker Winners — installation des tâches planifiées (une fois, depuis le Terminal cPanel)
#   bash ~/poker-winners/deploy/install-crons.sh
# Ajoute à la crontab du compte, entre deux marqueurs (rejouable sans doublon) :
#   - 03:15  purge RGPD (app:gdpr:cleanup : IP > 90 jours, comptes inactifs > 3 ans)
#   - 03:45  sauvegarde de la base (deploy/backup-db.sh, 14 jours conservés)
# Journal : ~/logs/poker-winners-cron.log. Les tâches restent visibles et modifiables
# dans cPanel > Tâches Cron. Pour les retirer : install-crons.sh --remove
# =============================================================================
set -euo pipefail

APP_DIR="${HOME}/poker-winners"
BACK="${APP_DIR}/backPoker"
# Un cron n'a pas le PATH du Terminal : on fige le chemin complet du PHP utilisé ici
PHP_BIN="$(command -v "${PHP_BIN:-php}")"
LOG="${HOME}/logs/poker-winners-cron.log"
BEGIN="# >>> poker-winners (install-crons.sh)"
END="# <<< poker-winners"

CURRENT="$(crontab -l 2>/dev/null | sed "/^${BEGIN}\$/,/^${END}\$/d" || true)"

if [ "${1:-}" = "--remove" ]; then
  printf '%s\n' "${CURRENT}" | sed '/./,$!d' | crontab -
  echo "♠ Tâches planifiées Poker Winners retirées."
  exit 0
fi

[ -d "${BACK}" ] || { echo "Dépôt introuvable : ${APP_DIR}"; exit 1; }
mkdir -p "$(dirname "${LOG}")"

# Vérification avant installation (aucune modification)
echo "♠ Test de la purge RGPD (simulation)"
(cd "${BACK}" && "${PHP_BIN}" bin/console app:gdpr:cleanup --dry-run --env=prod --no-debug)

LOCK="flock -n ${HOME}/.poker-winners"
{
  [ -n "${CURRENT}" ] && printf '%s\n' "${CURRENT}"
  echo "${BEGIN}"
  echo "15 3 * * * ${LOCK}-gdpr.lock sh -c 'cd ${BACK} && ${PHP_BIN} bin/console app:gdpr:cleanup --env=prod --no-debug' >> ${LOG} 2>&1"
  echo "45 3 * * * ${LOCK}-backup.lock bash ${APP_DIR}/deploy/backup-db.sh >> ${LOG} 2>&1"
  echo "${END}"
} | crontab -

echo "♠ Tâches planifiées installées (PHP : ${PHP_BIN}) :"
crontab -l | sed -n "/^${BEGIN}\$/,/^${END}\$/p"
echo "  Première sauvegarde maintenant : bash ${APP_DIR}/deploy/backup-db.sh"
