#!/usr/bin/env bash
# =============================================================================
# Poker Winners — compile le site Angular sur le PC et le pousse sur la branche
# GitHub « front-beta » (ou « front-public »), récupérée ensuite par le serveur
# avec deploy/update.sh. Aucun SSH nécessaire. À lancer depuis Git Bash :
#   bash deploy/build-front.sh            # bêta privée (mot de passe + noindex)
#   bash deploy/build-front.sh --public   # version publique (v1.0, après confirmation)
# =============================================================================
set -euo pipefail

MODE="beta"; [ "${1:-}" = "--public" ] && MODE="public"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REMOTE="$(git -C "${ROOT}" remote get-url origin)"
REV="$(git -C "${ROOT}" rev-parse --short HEAD)"

echo "♠ Compilation de production (${MODE}, commit ${REV})"
cd "${ROOT}/frontPoker"
rm -rf dist
# OneDrive verrouille parfois un fichier copié (EBUSY) : une seconde tentative suffit
CONF="$([ "${MODE}" = "beta" ] && echo beta || echo production)"
npx ng build --configuration="${CONF}" || { sleep 3; rm -rf dist; npx ng build --configuration="${CONF}"; }
OUT="dist/front-poker/browser"
[ -f "${OUT}/index.html" ] && [ -f "${OUT}/.htaccess" ] || { echo "Build incomplet (index.html ou .htaccess manquant)"; exit 1; }

if [ "${MODE}" = "beta" ]; then
  { printf 'AuthType Basic\nAuthName "Poker Winners - beta privee"\nAuthUserFile /home/bopu6118/.htpasswds/poker-winners-beta\nRequire valid-user\nHeader always set X-Robots-Tag "noindex, nofollow"\n\n'; cat "${OUT}/.htaccess"; } > "${OUT}/.htaccess.tmp"
  mv "${OUT}/.htaccess.tmp" "${OUT}/.htaccess"
fi

# Branche sans historique, remplacée à chaque publication (le code source reste sur main)
STAGE="$(mktemp -d)"
trap 'rm -rf "${STAGE}"' EXIT
cp -r "${OUT}/." "${STAGE}/"
cd "${STAGE}"
git init -q
git checkout -q -b "front-${MODE}"
git add -A
git -c user.name="$(git -C "${ROOT}" config user.name)" -c user.email="$(git -C "${ROOT}" config user.email)" \
  commit -qm "Front ${MODE} compilé depuis ${REV}"
git push -qf "${REMOTE}" "front-${MODE}"

echo "♠ Branche front-${MODE} publiée. Sur le serveur (Terminal cPanel) :"
echo "    bash ~/poker-winners/deploy/update.sh $([ "${MODE}" = "public" ] && echo "--public")"
