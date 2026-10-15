#!/usr/bin/env bash
# Sauvegarde compressée de la base dans backups/ (les contenus personnels y sont déjà chiffrés).
# Elle n'est exploitable qu'avec la clé NUXT_DATA_ENCRYPTION_KEY (dans .devcontainer/.env) : conservez les deux ensemble, hors du dépôt.
set -euo pipefail
cd "$(dirname "$0")/../.."
mkdir -p backups
file="backups/drepa-$(date -u +%Y%m%dT%H%M%SZ).sql.gz"
umask 077
pg_dump --no-owner --no-privileges "$DATABASE_URL" | gzip > "$file"
echo "Sauvegarde créée : $file"
