# Fiche de Synthèse — Projet DevOps L3 DSI
**Projet :** Smart Restaurant  
**Étudiant :** Zeineb Bahloul  
**Établissement :** ISET  

---

## 1. Schéma d'Architecture & Flux de Livraison

### 1.1 Architecture Multi-Conteneurs (Environnement Staging)

```text
               MACHINE HÔTE (Navigateur / Testeur)
                                │
                      http://localhost:2626
                                │
                                ▼
         ┌──────────────────────────────────────────────┐
         │         RÉSEAU PRIVÉ DOCKER COMPOSE          │
         │                                              │
         │   ┌──────────────────────────────────────┐   │
         │   │ Service "api"                        │   │
         │   │ Image: ghcr.io/.../smart-restaurant  │   │
         │   │ Utilisateur : appuser (non-root)     │   │
         │   │ Port interne : 8080                  │   │
         │   │ Contrôle santé : GET /health         │   │
         │   └──────────────────┬───────────────────┘   │
         │                      │                       │
         │               db:5432│(PostgreSQL privé)     │
         │                      ▼                       │
         │   ┌──────────────────────────────────────┐   │
         │   │ Service "db"                         │   │
         │   │ Image: postgres:17-alpine            │   │
         │   │ Port 5432 : NON PUBLIÉ sur l'hôte    │   │
         │   │ Santé : pg_isready                   │   │
         │   └──────────────────┬───────────────────┘   │
         │                      │                       │
         │                      ▼                       │
         │              Volume "pgdata"                 │
         │          (Persistance aux arrêts)            │
         └──────────────────────────────────────────────┘
```

### 1.2 Chaîne CI/CD (GitHub Actions)
1. **Pull Request / Push** ➔ Déclenchement automatique du pipeline.
2. **Job Test (Matrice)** ➔ Exécution des tests sous **Java 17** et **Java 21** via H2 en mémoire + archive des rapports JUnit en artefacts.
3. **Job Docker Build** ➔ Déclenché uniquement si les tests sont verts (`needs: test`).
4. **Push de Tag (`v*`)** ➔ Publication de l'image immuable dans le registre `ghcr.io`.

---

## 2. Version Mise en Service

- **Identifiant de Version :** `v1.0.0`
- **Image Immuable Publiée :**  
  `ghcr.io/zeineb-bahloul/smart-restaurant:v1.0.0`
- **Port d'accès public :** `http://localhost:2626`
- **Route de contrôle de santé :** `http://localhost:2626/health` (réponse attendue : `{"status":"UP"}`)
- **Principe d'immutabilité :** L'image n'est **jamais reconstruite** lors du déploiement. Le numéro de version est injecté dynamiquement via le fichier d'environnement `.env.deploy` sans toucher aux fichiers Compose.

---

## 3. Déroulé du Retour Arrière (Rollback)

En production ou en staging, **on ne reconstruit jamais pendant un incident**. Le retour arrière consiste à réappliquer immédiatement l'image de la dernière version saine déjà validée.

### Chronologie des événements :

1. **Déploiement initial sain (`v1.0.0`) :**
   ```bash
   echo "IMAGE_TAG=v1.0.0" > .env.deploy
   docker compose --env-file .env.deploy -f compose.staging.yaml up -d
   ./scripts/wait-healthy.sh   # [SUCCES] Code retour : 0
   ```

2. **Incident détecté sur mise en service d'une version instable (`v0.9.0`) :**
   ```bash
   echo "IMAGE_TAG=v0.9.0" > .env.deploy
   docker compose --env-file .env.deploy -f compose.staging.yaml up -d
   ./scripts/wait-healthy.sh   # [ECHEC] Service indisponible ! Code retour : 1
   ```
   - **Diagnostic :** Consultation des journaux ciblés :
     `docker compose -f compose.staging.yaml logs --tail=50 api`

3. **Exécution du retour arrière (Durée : < 30 secondes) :**
   Rétablissement de la variable vers la version stable précédente et relance immédiate sans recompilation :
   ```bash
   echo "IMAGE_TAG=v1.0.0" > .env.deploy
   docker compose --env-file .env.deploy -f compose.staging.yaml up -d
   ```

4. **Validation du rétablissement :**
   ```bash
   ./scripts/wait-healthy.sh   # [SUCCES] Le service est sain et opérationnel ! Code : 0
   ```

---

## 4. Bilan & Adresses des Preuves

| Élément | Preuve / URL |
|---|---|
| **Dépôt Git** | `https://github.com/zeineb-bahloul/smart-restaurant` |
| **Pipeline Vert (Réussi)** | *(Coller ici l'URL de votre run réussi GitHub Actions)* |
| **Pipeline Rouge (Échec)** | *(Coller ici l'URL de la PR test/simulate-failure)* |
| **Première erreur utile** | `AssertionFailedError: expected: <DOWN> but was: <UP>` |
