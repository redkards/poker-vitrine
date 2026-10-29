#!/usr/bin/env bash
# =============================================================================
# Poker Winners — mise à jour complète depuis le Terminal cPanel (sans SSH) :
#   bash ~/poker-winners/deploy/update.sh            # API + bêta (beta.redkards-dev.fr)
#   bash ~/poker-winners/deploy/update.sh --public   # API + site public (v1.0, après confirmation)
# Met à jour l'API (deploy.sh) puis copie le front compilé (branche front-beta / front-public).
# La version précédente du front est gardée dans <dossier>.previous pour un retour arrière.
# =============================================================================
set -euo pipefail
export PATH="${HOME}/bin:${PATH}"

MODE="beta"; [ "${1:-}" = "--public" ] && MODE="public"
DOMAIN="redkards-dev.fr"
HOST="$([ "${MODE}" = "beta" ] && echo "beta.${DOMAIN}" || echo "${DOMAIN}")"
APP_DIR="${HOME}/poker-winners"
REPO="$(git -C "${APP_DIR}" remote get-url origin)"
STAGE="${HOME}/.poker-winners-front"

bash "${APP_DIR}/deploy/deploy.sh"

WEB_DIR="$(uapi DomainInfo single_domain_data domain="${HOST}" | awk '/documentroot:/{print $2}')"
[ -n "${WEB_DIR}" ] && [ -d "${WEB_DIR}" ] || { echo "Dossier web introuvable pour ${HOST}"; exit 1; }

echo "♠ Récupération du front (${MODE}) vers ${WEB_DIR}"
rm -rf "${STAGE}"
git clone -q --depth 1 --branch "front-${MODE}" "${REPO}" "${STAGE}"
[ -f "${STAGE}/index.html" ] || { echo "Front incomplet sur la branche front-${MODE}"; exit 1; }

# .well-known (certificats HTTPS) et cgi-bin appartiennent à cPanel : on n'y touche pas
EXCLUDES=(--exclude .git --exclude .well-known --exclude cgi-bin)
mkdir -p "${WEB_DIR}.previous"
rsync -a --delete "${EXCLUDES[@]}" "${WEB_DIR}/" "${WEB_DIR}.previous/"
rsync -a --delete --chmod=D755,F644 "${EXCLUDES[@]}" "${STAGE}/" "${WEB_DIR}/"
rm -rf "${STAGE}"

echo "♠ Terminé : https://${HOST} (front $(git ls-remote "${REPO}" "front-${MODE}" | cut -c1-7))"
