#!/usr/bin/env bash
# Installation unique à la création du codespace : pnpm, dépendances, client PostgreSQL 16 (sauvegardes), build.
set -euo pipefail
cd "$(dirname "$0")/../.."

corepack enable
corepack prepare pnpm@10.28.0 --activate
pnpm install --frozen-lockfile

# Client PostgreSQL 16 pour les sauvegardes (échec non bloquant : l'application fonctionne sans).
if ! command -v pg_dump >/dev/null 2>&1 || ! pg_dump --version | grep -q ' 16\.'; then
  (sudo apt-get update -qq \
    && sudo apt-get install -y -qq postgresql-common ca-certificates \
    && sudo /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh -y \
    && sudo apt-get install -y -qq postgresql-client-16) \
    || echo "Avertissement : client PostgreSQL 16 non installé, les sauvegardes seront indisponibles."
fi

pnpm build
mkdir -p .logs backups
