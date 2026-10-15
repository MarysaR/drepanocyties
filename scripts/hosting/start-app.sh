#!/usr/bin/env bash
# Lancé à chaque démarrage du codespace : migrations (sans jamais recréer la base) puis serveur.
set -euo pipefail
cd "$(dirname "$0")/../.."
mkdir -p .logs

if [ -n "${CODESPACE_NAME:-}" ]; then
  export NUXT_SITE_URL="https://${CODESPACE_NAME}-3000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"
fi
export NUXT_SITE_URL="${NUXT_SITE_URL:-http://localhost:3000}"
export PORT=3000 HOST=0.0.0.0 NODE_ENV=production

node scripts/hosting/wait-for-db.mjs
pnpm exec prisma migrate deploy

if [ -f .logs/app.pid ] && kill -0 "$(cat .logs/app.pid)" 2>/dev/null; then
  kill "$(cat .logs/app.pid)"; sleep 1
fi
[ -d .output ] || pnpm build
nohup node .output/server/index.mjs >> .logs/app.log 2>&1 &
echo $! > .logs/app.pid

echo "Drepa démarré : ${NUXT_SITE_URL}"
echo "Callback Auth0 à autoriser : ${NUXT_SITE_URL}/auth/auth0"
