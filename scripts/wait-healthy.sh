#!/usr/bin/env bash
set -euo pipefail

URL="http://localhost:2626/health"
MAX=15
echo "=== En attente de la disponibilite du service sur $URL ==="

for i in $(seq 1 $MAX); do
  if curl -fsS "$URL" > /dev/null 2>&1; then
    echo "[SUCCES] Le service est sain et operationnel apres $i tentative(s) !"
    exit 0
  fi
  echo "Tentative $i/$MAX : le service demarre..."
  sleep 4
done

echo "[ECHEC] Le service ne repond pas apres $((MAX * 4)) secondes !" >&2
exit 1
