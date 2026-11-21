#!/usr/bin/env bash
set -u

errors=0
required=(README.md .gitignore .env.example compose.yaml Dockerfile)

echo "=== [CHECK] Smart Restaurant - Contrôles de conformité ==="

for file in "${required[@]}"; do
  if [[ -f "$file" ]]; then
    echo "[OK] Fichier présent : $file"
  else
    echo "[ERREUR] Fichier obligatoire manquant : $file" >&2
    errors=$((errors + 1))
  fi
done

# Vérification qu'aucun .env n'est indexé par Git
if git ls-files | grep -Eq '(^|/)\.env$'; then
  echo "[ERREUR] Un fichier .env avec des secrets potentiels est suivi par Git !" >&2
  errors=$((errors + 1))
else
  echo "[OK] Aucun fichier .env suivi par Git"
fi

# Vérification de l'état du working tree
if [[ -n $(git status --porcelain) ]]; then
  echo "[AVERTISSEMENT] Des modifications locales non validées sont présentes"
fi

if [[ $errors -gt 0 ]]; then
  echo "=== [ECHEC] $errors erreur(s) détectée(s) ===" >&2
  exit 1
fi

echo "=== [SUCCES] Tous les contrôles sont validés ==="
exit 0