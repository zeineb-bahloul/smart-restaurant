# 🍽️ Smart Restaurant

Application de gestion de restaurant (commandes, menus, réservations, chatbot IA) — Spring Boot 3 / PostgreSQL / Docker.

## ⚡ Démarrage en une commande

```bash
docker compose up -d --build
```

Vérification que l'application est opérationnelle :

```bash
curl http://localhost:8080/health
# {"status":"UP"}
```

## 🏗️ Architecture

| Composant | Technologie | Port |
|-----------|-------------|------|
| API REST  | Spring Boot 3 (Java 17) | 8080 |
| Base de données | PostgreSQL 15 | interne (non exposé) |

## 🔧 Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ≥ 24
- Git

## ⚙️ Variables d'environnement

Copier `.env.example` en `.env` et adapter les valeurs :

```bash
cp .env.example .env
```

| Variable | Description | Défaut |
|----------|-------------|--------|
| `PORT` | Port de l'API | `8080` |
| `DB_HOST` | Hôte PostgreSQL | `db` |
| `DB_NAME` | Nom de la base | `smart_restaurant` |
| `DB_USER` | Utilisateur PostgreSQL | `postgres` |
| `DB_PASSWORD` | Mot de passe PostgreSQL | `dev-password` |

## ✅ Contrôles de conformité

```bash
./scripts/check-project.sh
```

## 🔄 Pipeline CI/CD

Le pipeline GitHub Actions :
1. Exécute les tests sous **Java 17 et Java 21**
2. Archive les rapports de tests en artefacts
3. Build l'image Docker si les tests sont verts
4. Publie l'image sur `ghcr.io` lors d'un tag `v*`

## 🔁 Retour arrière (Rollback)

```bash
# Déployer une version précédente sans reconstruire
echo "IMAGE_TAG=v1.0.0" > .env.deploy
docker compose --env-file .env.deploy -f compose.staging.yaml up -d
./scripts/wait-healthy.sh
```
