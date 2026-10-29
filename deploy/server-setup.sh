#!/usr/bin/env bash
# =============================================================================
# Poker Winners — installation initiale sur o2switch (à lancer UNE FOIS, sur le serveur)
#   ssh bopu6118@redkards-dev.fr 'bash ~/poker-winners/deploy/server-setup.sh'
#
# Crée via l'API cPanel (uapi) : base MariaDB + utilisateur aux droits limités,
# boîte mail d'envoi, sous-domaine api. ; génère sur place tous les secrets
# (.env.local en 600, clés JWT chiffrées) et le mot de passe de la bêta.
# Aucun secret ne quitte le serveur, à part le mot de passe bêta affiché à la fin.
# Rejouable : ce qui existe déjà est conservé.
# =============================================================================
set -euo pipefail
umask 077

DOMAIN="redkards-dev.fr"
API_HOST="api.${DOMAIN}"
BETA_HOST="beta.${DOMAIN}"
BETA_DIR="beta.${DOMAIN}"           # racine web de la bêta (dans le HOME)
CPANEL_USER="$(whoami)"
APP_DIR="${HOME}/poker-winners"
BACK="${APP_DIR}/backPoker"
DB_NAME="${CPANEL_USER}_poker"
DB_USER="${CPANEL_USER}_poker"
MAIL_USER="no-reply"
PHP_BIN="${PHP_BIN:-php}"
SECRETS="${HOME}/.poker-winners-secrets"   # hors de toute racine web

log() { printf '\n\033[1;31m♠\033[0m %s\n' "$*"; }
rand() { "${PHP_BIN}" -r 'echo bin2hex(random_bytes(24));'; }

[ -d "${BACK}" ] || { echo "Dépôt introuvable : ${APP_DIR} (git clone d'abord)"; exit 1; }
mkdir -p "${SECRETS}" && chmod 700 "${SECRETS}"

# --- Base de données ----------------------------------------------------------
if [ ! -f "${SECRETS}/db_password" ]; then
  log "Création de la base ${DB_NAME}"
  rand > "${SECRETS}/db_password"
  uapi Mysql create_database name="${DB_NAME}" >/dev/null
  uapi Mysql create_user name="${DB_USER}" password="$(cat "${SECRETS}/db_password")" >/dev/null
  # Droits limités à cette base (pas de GRANT, pas d'accès aux autres bases)
  uapi Mysql set_privileges_on_database user="${DB_USER}" database="${DB_NAME}" \
    privileges="SELECT,INSERT,UPDATE,DELETE,CREATE,ALTER,INDEX,DROP,REFERENCES,LOCK TABLES" >/dev/null
fi
MARIADB_VERSION="$(mysql -V 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+-MariaDB' | head -1 || true)"
MARIADB_VERSION="${MARIADB_VERSION:-10.6.0-MariaDB}"

# --- Boîte mail d'envoi -------------------------------------------------------
if [ ! -f "${SECRETS}/mail_password" ]; then
  log "Création de ${MAIL_USER}@${DOMAIN}"
  rand > "${SECRETS}/mail_password"
  uapi Email add_pop email="${MAIL_USER}" domain="${DOMAIN}" password="$(cat "${SECRETS}/mail_password")" quota=200 >/dev/null
fi

# --- Sous-domaine API -----------------------------------------------------------
if ! uapi SubDomain listsubdomains 2>/dev/null | grep -q "domain: ${API_HOST}"; then
  log "Création du sous-domaine ${API_HOST} -> ${BACK}/public"
  uapi SubDomain addsubdomain domain=api rootdomain="${DOMAIN}" dir="poker-winners/backPoker/public" disallowdot=0 >/dev/null
fi

# --- Sous-domaine bêta (le domaine principal reste libre pour la v1.0) ----------
if ! uapi SubDomain listsubdomains 2>/dev/null | grep -q "domain: ${BETA_HOST}"; then
  log "Création du sous-domaine ${BETA_HOST} -> ~/${BETA_DIR}"
  uapi SubDomain addsubdomain domain=beta rootdomain="${DOMAIN}" dir="${BETA_DIR}" disallowdot=0 >/dev/null
fi

# --- Secrets applicatifs --------------------------------------------------------
[ -f "${SECRETS}/jwt_passphrase" ] || rand > "${SECRETS}/jwt_passphrase"
[ -f "${SECRETS}/app_secret" ] || rand > "${SECRETS}/app_secret"

urlenc() { "${PHP_BIN}" -r 'echo rawurlencode($argv[1]);' "$1"; }
log "Écriture de ${BACK}/.env.local (droits 600)"
cat > "${BACK}/.env.local" <<EOF
APP_ENV=prod
APP_DEBUG=0
APP_SECRET=$(cat "${SECRETS}/app_secret")
DATABASE_URL="mysql://${DB_USER}:$(urlenc "$(cat "${SECRETS}/db_password")")@localhost:3306/${DB_NAME}?serverVersion=${MARIADB_VERSION}&charset=utf8mb4"
JWT_PASSPHRASE=$(cat "${SECRETS}/jwt_passphrase")
MAILER_DSN="smtp://$(urlenc "${MAIL_USER}@${DOMAIN}"):$(urlenc "$(cat "${SECRETS}/mail_password")")@$(hostname -f):465"
MAILER_FROM=${MAIL_USER}@${DOMAIN}
FRONTEND_URL=https://${BETA_HOST}
DEFAULT_URI=https://${API_HOST}
CORS_ALLOW_ORIGIN='^https://(beta\.)?redkards-dev\.fr$'
TRUSTED_HOSTS='^api\.redkards-dev\.fr$'
EOF
chmod 600 "${BACK}/.env.local"

# --- Clés JWT (chiffrées par la passphrase) --------------------------------------
if [ ! -f "${BACK}/config/jwt/private.pem" ]; then
  log "Génération des clés JWT"
  mkdir -p "${BACK}/config/jwt"
  openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:4096 -aes256 \
    -pass "file:${SECRETS}/jwt_passphrase" -out "${BACK}/config/jwt/private.pem"
  openssl pkey -in "${BACK}/config/jwt/private.pem" -passin "file:${SECRETS}/jwt_passphrase" \
    -pubout -out "${BACK}/config/jwt/public.pem"
  chmod 600 "${BACK}/config/jwt/private.pem"; chmod 644 "${BACK}/config/jwt/public.pem"
fi

# --- Mot de passe de la bêta privée (protection HTTP du site) ---------------------
HTPASS="${HOME}/.htpasswds/poker-winners-beta"
if [ ! -f "${HTPASS}" ]; then
  log "Création de l'accès bêta"
  mkdir -p "$(dirname "${HTPASS}")"
  BETA_PASS="$(rand | cut -c1-20)"
  printf 'beta:%s\n' "$(openssl passwd -apr1 "${BETA_PASS}")" > "${HTPASS}"
  chmod 640 "${HTPASS}"
  echo "${BETA_PASS}" > "${SECRETS}/beta_password"
fi

# --- Premier déploiement -----------------------------------------------------------
bash "${APP_DIR}/deploy/deploy.sh"

log "Installation terminée."
echo "  Site (bêta)  : https://${BETA_HOST}   identifiant : beta   mot de passe : $(cat "${SECRETS}/beta_password")"
echo "  API          : https://${API_HOST}/api"
echo "  À faire dans le cPanel : vérifier le certificat HTTPS de ${BETA_HOST} et ${API_HOST} (Let's Encrypt SSL)."
echo "  Compte admin : inscrivez-vous sur le site, confirmez l'email, puis :"
echo "    cd ${BACK} && ${PHP_BIN} bin/console app:user:promote votre@email --role=ROLE_ADMIN"
