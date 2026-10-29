#!/usr/bin/env bash
# =============================================================================
# Poker Winners — compile le site Angular sur le PC et l'envoie dans public_html
# (à lancer depuis Git Bash, à la racine du dépôt) :
#   bash deploy/publish-front.sh          # bêta privée (mot de passe + noindex)
#   bash deploy/publish-front.sh --public # mise en ligne publique (v1.0, après confirmation)
# =============================================================================
set -euo pipefail

SSH_TARGET="${SSH_TARGET:-bopu6118@redkards-dev.fr}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_o2switch}"
MODE="beta"; [ "${1:-}" = "--public" ] && MODE="public"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ssh_() { ssh -i "${SSH_KEY}" -o BatchMode=yes "${SSH_TARGET}" "$@"; }

echo "♠ Compilation de production"
cd "${ROOT}/frontPoker"
rm -rf dist
npx ng build
OUT="dist/front-poker/browser"
[ -f "${OUT}/index.html" ] && [ -f "${OUT}/.htaccess" ] || { echo "Build incomplet (index.html ou .htaccess manquant)"; exit 1; }

echo "♠ Envoi (${MODE})"
tar -C "${OUT}" -czf - . | ssh_ "set -e
  STAGE=\$HOME/.poker-winners-front-new
  rm -rf \"\$STAGE\" && mkdir -p \"\$STAGE\" && tar -xzf - -C \"\$STAGE\"
  if [ '${MODE}' = 'beta' ]; then
    { printf 'AuthType Basic\nAuthName \"Poker Winners - beta privee\"\nAuthUserFile %s/.htpasswds/poker-winners-beta\nRequire valid-user\nHeader always set X-Robots-Tag \"noindex, nofollow\"\n\n' \"\$HOME\"; cat \"\$STAGE/.htaccess\"; } > \"\$STAGE/.htaccess.tmp\" && mv \"\$STAGE/.htaccess.tmp\" \"\$STAGE/.htaccess\"
  fi
  # On garde le dossier public_html (permissions cPanel) et on synchronise son contenu ;
  # la version précédente est copiée pour un retour arrière rapide.
  mkdir -p \$HOME/public_html.previous
  rsync -a --delete \$HOME/public_html/ \$HOME/public_html.previous/
  rsync -a --delete --chmod=D755,F644 \"\$STAGE\"/ \$HOME/public_html/
  rm -rf \"\$STAGE\"
  echo 'Site publié dans public_html'"

echo "♠ Terminé : https://redkards-dev.fr (${MODE})"
