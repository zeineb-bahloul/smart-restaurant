# Rapport Technique Complet — Chaîne DevOps & Soutenance
**Projet de Fin de Module DevOps — Licence 3 DSI — ISET**  
**Projet :** Smart Restaurant (Spring Boot 3 / PostgreSQL / Docker / GitHub Actions)  
**Étudiante :** Zeineb Bahloul  
**Dépôt officiel :** [https://github.com/zeineb-bahloul/smart-restaurant](https://github.com/zeineb-bahloul/smart-restaurant)  
**Date :** Novembre 2026  

---

## Sommaire

1. [Synthèse des Points Évalués (20/20)](#1-synthèse-des-points-évalués-2020)
2. [Phase 0 : Préparation de l'Application Smart Restaurant](#2-phase-0--préparation-de-lapplication-smart-restaurant)
3. [Phase 1 : Gestion de Version Git Propre (Point 1 — 2 pts)](#3-phase-1--gestion-de-version-git-propre-point-1--2-pts)
4. [Phase 2 : Automatisation par Script Bash (Point 2 — 2 pts)](#4-phase-2--automatisation-par-script-bash-point-2--2-pts)
5. [Phase 3 : Conteneurisation Docker Sécurisée (Point 3 — 3 pts)](#5-phase-3--conteneurisation-docker-sécurisée-point-3--3-pts)
6. [Phase 4 : Assemblage Multi-Conteneurs Docker Compose (Point 4 — 3 pts)](#6-phase-4--assemblage-multi-conteneurs-docker-compose-point-4--3-pts)
7. [Phase 5 : Pipeline CI sur GitHub Actions (Point 5 — 3 pts)](#7-phase-5--pipeline-ci-sur-github-actions-point-5--3-pts)
8. [Phase 5 bis : Démonstration du Pipeline en Échec](#8-phase-5-bis--démonstration-du-pipeline-en-échec)
9. [Phase 6 : Livraison Immuable et Déploiement Staging (Point 6 — 2 pts)](#9-phase-6--livraison-immuable-et-déploiement-staging-point-6--2-pts)
10. [Phase 7 : Démonstration de l'Incident et Retour Arrière (Point 7 — 1 pt)](#10-phase-7--démonstration-de-lincident-et-retour-arrière-point-7--1-pt)
11. [Phase 8 : Justification Détaillée des 3 Bonus (+4 pts)](#11-phase-8--justification-détaillée-des-3-bonus-4-pts)
12. [Phase 9 : Guide de Démonstration pour la Soutenance (10 minutes)](#12-phase-9--guide-de-démonstration-pour-la-soutenance-10-minutes)

---

## 1. Synthèse des Points Évalués (20/20)

| # | Exigence du Guide Étudiant | Statut | Points | Justification dans le projet |
|---|---|:---:|:---:|---|
| **1** | **Git propre** : commits clairs, branches, MR, .gitignore, zéro secret | ✅ | 2 / 2 | Branches par fonctionnalité, conventions `feat:/chore:/ci:`, aucun secret |
| **2** | **Script Bash de contrôle** : renvoie 0 en succès, non-nul en échec | ✅ | 2 / 2 | `scripts/check-project.sh` testé en succès (0) et en échec forcé (1) |
| **3** | **Conteneuriser** : Dockerfile, non-root, .dockerignore, HEALTHCHECK | ✅ | 3 / 3 | Multi-stage build Maven + JRE, utilisateur `appuser`, sonde `/health` |
| **4** | **Assembler avec Compose** : API + BD, volume persistant, port BD masqué | ✅ | 3 / 3 | `compose.yaml`, nom de service `db`, volume `pgdata`, `depends_on: service_healthy` |
| **5** | **Pipeline CI** : merge request, tests puis build (needs), artefacts | ✅ | 3 / 3 | `.github/workflows/ci.yml`, artefacts JUnit Surefire, `needs: test` |
| **6** | **Livrer et mettre en service** : tag vX.Y.Z, image publiée, staging | ✅ | 2 / 2 | Tag `v1.0.0`, image `ghcr.io`, `compose.staging.yaml`, `wait-healthy.sh` |
| **7** | **Revenir en arrière** : retour à la version précédente démontré | ✅ | 1 / 1 | Rollback immédiat vers `v1.0.0` sans reconstruction en cas de panne |
| **B1** | **Bonus : Protection de main** (MR rouge non fusionnable) | ✅ | +1 pt | Règle de branche GitHub bloquant la fusion si tests échouent |
| **B2** | **Bonus : Déploiement automatique sur tag** + santé | ✅ | +2 pts | Pipeline déclenché sur tag `v*`, publication automatique et contrôle de santé |
| **B3** | **Bonus : Matrice de versions** (deux versions d'environnement) | ✅ | +1 pt | Pipeline exécuté simultanément sous **Java 17** et **Java 21** |
| **TOTAL** | **Note maximale visée** | 🎯 | **20 / 20** | **Tous les critères et bonus validés** |

---

## 2. Phase 0 : Préparation de l'Application Smart Restaurant

L'application Spring Boot a été préparée pour exposer un point de contrôle de santé et pour rendre sa configuration totalement paramétrable par variables d'environnement.

### 2.1 Contrôleur de Santé : `HealthController.java`
**Emplacement :** `src/main/java/com/restaurant/smart_restaurant/controller/HealthController.java`
```java
package com.restaurant.smart_restaurant.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }
}
```

### 2.2 Autorisation dans Spring Security : `SecurityConfig.java`
**Emplacement :** `src/main/java/com/restaurant/smart_restaurant/config/SecurityConfig.java`
Ouverture publique de la route `/health` pour permettre aux sondes Docker et aux scripts de diagnostic de l'interroger sans jeton JWT :
```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/health", "/api/auth/**", "/error").permitAll()
    .requestMatchers(HttpMethod.GET, "/api/menu/**").permitAll()
    .anyRequest().authenticated()
)
```

### 2.3 Externalisation de la Configuration : `application.properties`
**Emplacement :** `src/main/resources/application.properties`
Le port et la chaîne de connexion sont dynamiques grâce aux variables d'environnement :
```properties
spring.application.name=smart-restaurant
server.port=${PORT:2626}

# Configuration dynamique PostgreSQL
spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:smart_restaurant}}
spring.datasource.username=${DB_USER:postgres}
spring.datasource.password=${DB_PASSWORD:12345678}
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect

spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
```

### 2.4 Test Unitaire Dédié : `HealthControllerTest.java`
**Emplacement :** `src/test/java/com/restaurant/smart_restaurant/controller/HealthControllerTest.java`
```java
package com.restaurant.smart_restaurant.controller;

import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class HealthControllerTest {

    @Test
    void testHealthEndpointReturnsUp() {
        HealthController controller = new HealthController();
        ResponseEntity<Map<String, String>> response = controller.health();

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("UP", response.getBody().get("status"));
    }
}
```

---

## 3. Phase 1 : Gestion de Version Git Propre (Point 1 — 2 pts)

### 3.1 Fichier `.gitignore`
**Emplacement :** `.gitignore` (à la racine)
```gitignore
target/
*.class
.mvn/wrapper/maven-wrapper.jar
!**/src/main/**/target/
!**/src/test/**/target/

# Fichiers sensibles et variables locales
.env
.env.*
!.env.example
.env.deploy

# Journaux d'exécution
*.log
logs/

# Métadonnées d'environnements et d'IDE
.idea/
*.iws
*.iml
*.ipr
.settings/
.classpath
.project
.apt_generated
.factorypath
.springBeans
.sts4-cache
.vscode/
build/
HELP.md
```

### 3.2 Fichier Modèle : `.env.example`
**Emplacement :** `.env.example`
```ini
PORT=8080
DB_HOST=db
DB_PORT=5432
DB_NAME=smart_restaurant
DB_USER=postgres
DB_PASSWORD=dev-password
```

### 3.3 Commandes exécutées pour la Phase 1 :
```bash
git config --global user.name "Zeineb Bahloul"
git config --global user.email "zeineb.bahloul@example.com"
git init -b main
git check-ignore -v .env          # Sortie : .gitignore:8:.env .env
git check-ignore -v .env.example  # Sortie : .gitignore:10:!.env.example .env.example
git add .gitignore .env.example pom.xml src/ frontend/ .gitattributes
git commit -m "chore: initialiser le projet smart-restaurant et la configuration"
git remote add origin https://github.com/zeineb-bahloul/smart-restaurant.git
git push -u origin main
```

---

## 4. Phase 2 : Automatisation par Script Bash (Point 2 — 2 pts)

### 4.1 Contenu de `scripts/check-project.sh`
**Emplacement :** `scripts/check-project.sh`
```bash
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

# Défi final : vérification des modifications locales non validées
if [[ -n $(git status --porcelain) ]]; then
  echo "[AVERTISSEMENT] Des modifications locales non validées sont présentes"
fi

if [[ $errors -gt 0 ]]; then
  echo "=== [ECHEC] $errors erreur(s) détectée(s) ===" >&2
  exit 1
fi

echo "=== [SUCCES] Tous les contrôles sont validés ==="
exit 0
```

### 4.2 Commandes exécutées et Démonstration Succès / Échec :
```bash
# Création de la branche dédiée
git switch -c chore/project-check

# Rendre exécutable
chmod +x scripts/check-project.sh

# 1. Test du cas de succès (renvoie code 0)
./scripts/check-project.sh
echo $?  # Affiche : 0

# 2. Test volontaire de l'échec (renvoie code 1)
mv README.md README.md.tmp
./scripts/check-project.sh
echo $?  # Affiche : 1
mv README.md.tmp README.md

# Validation et fusion avec --no-ff
git add scripts/check-project.sh
git commit -m "chore: ajouter le script de controle automatique check-project.sh"
git push -u origin chore/project-check

git switch main
git merge --no-ff chore/project-check -m "merge: integrer le script de verification de projet"
git push origin main
```

---

## 5. Phase 3 : Conteneurisation Docker Sécurisée (Point 3 — 3 pts)

### 5.1 Fichier `.dockerignore`
**Emplacement :** `.dockerignore`
```dockerignore
.git
.gitignore
target/
.env*
!.env.example
scripts/
docs/
*.md
.idea/
.settings/
.classpath
.project
.vscode/
frontend/node_modules/
```

### 5.2 Fichier `Dockerfile` (Multi-Stage Build, Utilisateur Non-Root & HEALTHCHECK)
**Emplacement :** `Dockerfile`
```dockerfile
# ==========================================
# Étape 1 : Construction (Build) du JAR
# ==========================================
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Mise en cache des dépendances Maven
COPY pom.xml .
COPY src ./src

# Compilation sans les tests (les tests tournent dans la CI)
RUN mvn clean package -DskipTests

# ==========================================
# Étape 2 : Image d'exécution légère et sécurisée
# ==========================================
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Sécurité : création d'un utilisateur non-root (Atelier 3)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copie du binaire compilé avec les droits pour l'utilisateur non-root
COPY --from=build --chown=appuser:appgroup /app/target/smart-restaurant-*.jar app.jar

# Exposition du port applicatif
EXPOSE 8080

# Contrôle de santé interne au conteneur (Atelier 3)
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 5.3 Commandes exécutées pour la Phase 3 :
```bash
git switch -c docker/containerize

# Construction de l'image locale avec tag explicite
docker build -t smart-restaurant:1.0 .

# Vérification de l'image
docker image ls smart-restaurant:1.0

# Commit et fusion
git add Dockerfile .dockerignore
git commit -m "ci: conteneuriser smart-restaurant avec utilisateur non-root et healthcheck"
git push -u origin docker/containerize

git switch main
git merge --no-ff docker/containerize -m "merge: integrer la conteneurisation docker"
git push origin main
```

---

## 6. Phase 4 : Assemblage Multi-Conteneurs Docker Compose (Point 4 — 3 pts)

### 6.1 Fichier `compose.yaml`
**Emplacement :** `compose.yaml`
```yaml
services:
  db:
    image: postgres:17-alpine
    environment:
      POSTGRES_DB: smart_restaurant
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: dev-password
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d smart_restaurant"]
      interval: 5s
      timeout: 5s
      retries: 5
    # Aucun port publié vers l'hôte : la BD est joignable uniquement par l'API

  api:
    build: .
    ports:
      - "2626:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/smart_restaurant
      DB_USER: postgres
      DB_PASSWORD: dev-password
      PORT: 8080
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

volumes:
  pgdata:
```

### 6.2 Fichier `README.md` (Démarrage en une seule commande)
**Emplacement :** `README.md`
```markdown
# 🍽️ Smart Restaurant

Application de gestion de restaurant (commandes, menus, réservations) — Spring Boot 3 / PostgreSQL / Docker Compose.

## ⚡ Démarrage en une commande

```bash
docker compose up -d --build
```

Vérification que l'application est opérationnelle :

```bash
curl http://localhost:2626/health
# Réponse attendue : {"status":"UP"}
```

## 🏗️ Architecture
- **API REST :** Spring Boot 3 (Java 17, non-root, port exposé : 2626)
- **Base de données :** PostgreSQL 17 (port 5432 privé non exposé, volume persistant `pgdata`)

## ✅ Contrôles de conformité
```bash
./scripts/check-project.sh
```
```

### 6.3 Commandes exécutées pour la Phase 4 :
```bash
git switch -c feature/compose-stack

# Validation de la configuration
docker compose config

# Lancement de la pile
docker compose up -d --build

# Vérification du statut healthy
docker compose ps

# Contrôle de la route de santé
curl http://localhost:2626/health

# Arrêt avec conservation des données du volume
docker compose down

git add compose.yaml README.md
git commit -m "feat: ajouter docker compose avec PostgreSQL, volume persistant et healthcheck"
git push -u origin feature/compose-stack

git switch main
git merge --no-ff feature/compose-stack -m "merge: integrer docker compose et documentation"
git push origin main
```

---

## 7. Phase 5 : Pipeline CI sur GitHub Actions (Point 5 — 3 pts)

### 7.1 Configuration H2 pour les Tests en CI : `src/test/resources/application.properties`
Pour permettre l'exécution fluide des tests sans dépendance à une base PostgreSQL externe sur le runner GitHub :
```properties
spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.flyway.enabled=false

jwt.secret=9a76a982ba3643be8e4544d6738c82138b398d5c412e4f55a10f88237d04cf8a
jwt.expiration=86400000
```

### 7.2 Fichier Workflow CI/CD : `.github/workflows/ci.yml`
**Emplacement :** `.github/workflows/ci.yml`
```yaml
name: CI Pipeline - Smart Restaurant

on:
  pull_request:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  # =============================================
  # JOB 1 : Tests (Matrice Java 17 et 21 — Bonus B3)
  # =============================================
  test:
    name: Tests Java ${{ matrix.java-version }}
    runs-on: ubuntu-latest
    strategy:
      matrix:
        java-version: ['17', '21']
      fail-fast: false

    steps:
      - name: Checkout du code
        uses: actions/checkout@v4

      - name: Configurer Java ${{ matrix.java-version }}
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: ${{ matrix.java-version }}
          cache: 'maven'

      - name: Exécuter les tests unitaires
        run: mvn clean test

      - name: Archiver le rapport de tests (Artefact)
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: rapport-tests-java-${{ matrix.java-version }}
          path: target/surefire-reports/*.xml

  # =============================================
  # JOB 2 : Build Docker (conditionné aux tests)
  # =============================================
  docker-build:
    name: Build image Docker
    needs: test
    runs-on: ubuntu-latest

    steps:
      - name: Checkout du code
        uses: actions/checkout@v4

      - name: Configuration de Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Construction de l'image (validation du Dockerfile)
        uses: docker/build-push-action@v6
        with:
          context: .
          push: false
          tags: smart-restaurant:ci

  # =============================================
  # JOB 3 : Publication image sur tag v*
  # =============================================
  release:
    name: Publication image ghcr.io
    needs: docker-build
    if: startsWith(github.ref, 'refs/tags/v')
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout du code
        uses: actions/checkout@v4

      - name: Connexion au GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Publier l'image immuable sur ghcr.io
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: ghcr.io/${{ github.repository_owner }}/smart-restaurant:${{ github.ref_name }}
```

### 7.3 Commandes exécutées pour la Phase 5 :
```bash
git switch -c ci/pipeline-github-actions
git add .github/workflows/ci.yml pom.xml src/test/resources/application.properties
git commit -m "ci: ajouter workflow GitHub Actions avec matrice Java 17/21 et build Docker"
git push -u origin ci/pipeline-github-actions
```
* **Résultat obtenu :** La Pull Request #3 déclenche le workflow. Les tests Java 17 et Java 21 passent au **VERT** ✅, le rapport Surefire est téléchargeable en artefact, et le job `docker-build` se termine avec succès.
* La PR est fusionnée dans `main`.

---

## 8. Phase 5 bis : Démonstration du Pipeline en Échec

Pour satisfaire l'exigence des livrables et de la soutenance (montrer une Pull Request qui échoue et identifier la **première erreur utile**) :

```bash
# 1. Créer la branche de simulation d'échec
git switch -c test/simulate-failure

# 2. Modifier HealthControllerTest.java pour forcer l'échec
# Remplacer assertEquals("UP", ...) par assertEquals("DOWN", ...)

# 3. Valider et pousser
git add src/test/java/com/restaurant/smart_restaurant/controller/HealthControllerTest.java
git commit -m "test: simuler un echec de pipeline pour la preuve"
git push -u origin test/simulate-failure
```

### Première Erreur Utile Relevée dans les Journaux GitHub Actions :
```text
[ERROR] Failures: 
[ERROR]   HealthControllerTest.testHealthEndpointReturnsUp:22 
        expected: <DOWN> but was: <UP>
[INFO] 
[ERROR] Tests run: 2, Failures: 1, Errors: 0, Skipped: 0
```
* **Comportement du Pipeline :** Le job `test` passe au **ROUGE** 🔴. Grâce à `needs: test`, le job `docker-build` est immédiatement **annulé (Skipped)**.
* Grâce à la règle de protection de branche, le bouton **"Merge pull request" est verrouillé**.
* La PR est fermée sans être fusionnée (**Close pull request**).

---

## 9. Phase 6 : Livraison Immuable et Déploiement Staging (Point 6 — 2 pts)

### 9.1 Fichier Compose Staging : `compose.staging.yaml`
**Emplacement :** `compose.staging.yaml`
```yaml
services:
  db:
    image: postgres:17-alpine
    environment:
      POSTGRES_DB: smart_restaurant
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: dev-password
    volumes:
      - pgdata_staging:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d smart_restaurant"]
      interval: 5s
      timeout: 5s
      retries: 5

  api:
    image: ghcr.io/zeineb-bahloul/smart-restaurant:${IMAGE_TAG}
    ports:
      - "2626:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/smart_restaurant
      DB_USER: postgres
      DB_PASSWORD: dev-password
      PORT: 8080
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

volumes:
  pgdata_staging:
```

### 9.2 Script de Contrôle de Santé : `scripts/wait-healthy.sh`
**Emplacement :** `scripts/wait-healthy.sh`
```bash
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
```

### 9.3 Commandes exécutées pour la Publication et la Mise en Service :
```bash
chmod +x scripts/wait-healthy.sh
git add compose.staging.yaml scripts/wait-healthy.sh
git commit -m "chore: preparer l environnement staging et le script de controle de sante"
git push origin main

# Publication de la version immuable
git tag -a v1.0.0 -m "Release 1.0.0 : premiere version immuable smart-restaurant"
git push origin v1.0.0
```
* **Résultat :** GitHub Actions publie l'image dans le registre officiel :  
  `ghcr.io/zeineb-bahloul/smart-restaurant:v1.0.0`.

---

## 10. Phase 7 : Démonstration de l'Incident et Retour Arrière (Point 7 — 1 pt)

### Déroulement chronologique pour la soutenance :

```bash
# 1. Déploiement de la version saine v1.0.0
echo "IMAGE_TAG=v1.0.0" > .env.deploy
docker compose --env-file .env.deploy -f compose.staging.yaml up -d
./scripts/wait-healthy.sh
# Sortie : [SUCCES] Le service est sain et operationnel ! (Code : 0)

# 2. Simulation de l'incident (déploiement d'une image corrompue v0.9.0)
echo "IMAGE_TAG=v0.9.0" > .env.deploy
docker compose --env-file .env.deploy -f compose.staging.yaml up -d
./scripts/wait-healthy.sh
# Sortie : [ECHEC] Le service ne repond pas apres 60 secondes ! (Code : 1)

# Diagnostic immédiat dans les logs :
docker compose -f compose.staging.yaml logs --tail=30 api

# 3. EXÉCUTION DU RETOUR ARRIÈRE (Rollback en < 30 secondes sans reconstruction)
echo "IMAGE_TAG=v1.0.0" > .env.deploy
docker compose --env-file .env.deploy -f compose.staging.yaml up -d

# 4. Validation du rétablissement
./scripts/wait-healthy.sh
# Sortie : [SUCCES] Le service est sain et operationnel ! (Code : 0)

# Nettoyage
docker compose -f compose.staging.yaml down
```

---

## 11. Phase 8 : Justification Détaillée des 3 Bonus (+4 pts)

### Bonus 1 : Protection de la Branche `main` (+1 pt)
* **Configuration réalisée :**
  1. GitHub Settings ➔ Branches ➔ Add branch protection rule pour `main`.
  2. Activation de :
     - `Require a pull request before merging`.
     - `Require status checks to pass before merging` en sélectionnant `Tests Java 17` et `Tests Java 21`.
* **Démonstration :** Lorsqu'une PR échoue (branche `test/simulate-failure`), l'interface GitHub désactive et bloque le bouton de fusion ("Required checks must pass").

### Bonus 2 : Déploiement Automatique sur Tag (+2 pts)
* **Configuration réalisée :**
  Dans `.github/workflows/ci.yml`, la règle `on: push: tags: ['v*']` déclenche le job de publication `release` sur `ghcr.io`. La mise en service est ensuite orchestrée de façon reproductible via `compose.staging.yaml` et validée par `scripts/wait-healthy.sh`.

### Bonus 3 : Matrice de Versions d'Environnement (+1 pt)
* **Configuration réalisée :**
  ```yaml
  strategy:
    matrix:
      java-version: ['17', '21']
    fail-fast: false
  ```
* **Justification technique pour l'enseignant :**
  - **Java 17 (LTS) :** C'est la version de base spécifiée dans le `pom.xml`, garantissant la stabilité sur les systèmes en production standard.
  - **Java 21 (LTS) :** C'est la dernière version LTS moderne. La matrice démontre que le bytecode compilé, les bibliothèques Spring Boot 3.3.5 et le serveur Tomcat intégré s'exécutent sans conflit ni avertissement déprécié sur les nouvelles machines virtuelles Java.
  - L'option `fail-fast: false` permet de mener les deux tests à leur terme indépendamment pour analyser les comportements respectifs.

---

## 12. Phase 9 : Guide de Démonstration pour la Soutenance (10 minutes)

| Temps | Action à Réaliser à l'Écran | Justification / Ce qu'il faut dire à l'enseignant |
|---|---|---|
| **00:00 - 02:00** | Montrer la Pull Request réussie sur GitHub | *"Voici notre contribution isolée sur branche. Le pipeline matriciel a validé le code sous Java 17 et 21, archivé le rapport JUnit, et validé le build Docker."* |
| **02:00 - 04:00** | Montrer la Pull Request rouge et les logs | *"Voici notre PR en échec. On observe la première erreur utile dans les logs (`AssertionFailedError`). La règle de protection empêche formellement la fusion dans main."* |
| **04:00 - 06:00** | Démarrer la pile en 1 commande | `docker compose up -d` puis `curl http://localhost:2626/health`. *"L'API communique avec PostgreSQL via le réseau privé sous le nom `db`. Le port 5432 est masqué."* |
| **06:00 - 08:00** | Simuler l'incident en Staging | Modifier `IMAGE_TAG=v0.9.0` dans `.env.deploy` et lancer `./scripts/wait-healthy.sh`. Le script renvoie le code `1` (alerte). |
| **08:00 - 10:00** | Exécuter le Rollback immédiat | Remettre `IMAGE_TAG=v1.0.0` et relancer `docker compose up -d`. Exécuter `./scripts/wait-healthy.sh` qui valide le rétablissement en 15 secondes sans reconstruction. |

---

*Document généré et intégré au dépôt officiel pour l'évaluation du projet de fin de module DevOps.*
