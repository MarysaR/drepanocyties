#!/usr/bin/env bash
# Crée une seule fois .devcontainer/.env avec les secrets techniques générés localement
# (mot de passe de la base, session, chiffrement des contenus). Le fichier est ignoré par Git.
# Les secrets externes (Anthropic, Auth0) ne passent jamais par ici : ce sont des secrets Codespaces.
set -euo pipefail

target="$(dirname "$0")/../../.devcontainer/.env"
if [ -f "$target" ]; then
  echo "Secrets techniques déjà présents : conservés."
  exit 0
fi

umask 077
cat > "$target" <<ENV
POSTGRES_PASSWORD=$(openssl rand -hex 24)
NUXT_SESSION_PASSWORD=$(openssl rand -base64 48 | tr -d '\n=+/')
NUXT_DATA_ENCRYPTION_KEY=$(openssl rand -base64 32)
# Seul le premier compte (le vôtre) peut être créé. Mettre 2, 3… pour autoriser d'autres comptes.
NUXT_REGISTRATION_LIMIT=1
# Durée de la session en secondes (72 h).
NUXT_SESSION_MAX_AGE=259200
NUXT_ANTHROPIC_MODEL=claude-sonnet-5-5
NUXT_ANTHROPIC_MAX_OUTPUT_TOKENS=2000
NUXT_AI_BUDGET_USD=12
NUXT_AI_RATE_LIMIT_PER_MINUTE=6
NUXT_AI_RATE_LIMIT_PER_DAY=100
ENV
echo "Secrets techniques générés dans .devcontainer/.env (ne jamais le versionner)."
