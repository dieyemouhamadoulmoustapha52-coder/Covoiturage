# 🚀 Déploiement — TrajetCampus

## Principe important
**Netlify n'héberge que des sites statiques** : il ne peut PAS exécuter Django.
Le projet se déploie donc en deux parties :

| Partie | Techno | Hébergeur |
|---|---|---|
| Frontend (React) | `frontend/` | **Netlify** (gratuit) |
| Backend (API Django) | `backend/` | **Render** (gratuit) |

Sans backend déployé, le site Netlify s'affiche mais la connexion et toutes
les données échouent.

---

## 1. Préparer le code (déjà fait ✅)

- `frontend/src/api.js` : `BASE_URL = import.meta.env.VITE_API_URL || '/api'`
  — en dev, le proxy Vite continue de fonctionner ; en prod, l'URL de l'API
  est injectée au build.
- `backend/config/settings.py` : lecture de `SECRET_KEY`, `DEBUG`,
  `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` via variables d'environnement,
  CORS activé, WhiteNoise pour les fichiers statiques.
- `backend/requirements.txt` : Django, DRF, Pillow, cors-headers, WhiteNoise,
  gunicorn.
- `backend/.env.example` : modèle des variables à définir.

### Variables du backend
| Variable | Exemple | Rôle |
|---|---|---|
| `SECRET_KEY` | une clé forte (ex. générée) | signature des sessions/tokens |
| `DEBUG` | `False` | jamais à `True` en production |
| `ALLOWED_HOSTS` | `trajetcampus-api.onrender.com` | domaines autorisés (séparés par des virgules) |
| `CORS_ALLOWED_ORIGINS` | `https://ton-site.netlify.app` | frontend autorisé à appeler l'API |

### Variables du frontend
| Variable | Exemple | Rôle |
|---|---|---|
| `VITE_API_URL` | `https://trajetcampus-api.onrender.com/api` | URL de l'API (sans `/` final) |

> ⚠️ `VITE_API_URL` est **embarquée dans le code JS du site** : c'est normal
> et public (elle sert à localiser l'API), n'y mets jamais de secret.

---

## 2. Déployer le backend sur Render (gratuit)

1. Crée un compte sur https://render.com.
2. Mets le projet sur GitHub (dossier `TrajetCampus/` à la racine du dépôt).
3. Render → **New → Web Service** → connecte le dépôt GitHub.
4. Paramètres du service :
   - Name : `trajetcampus-api`
   - Runtime : `Python 3`
   - Build command :
     `pip install -r requirements.txt && python manage.py migrate --noinput && python manage.py collectstatic --noinput`
   - Start command : `gunicorn config.wsgi:application`
   - Root Directory : `backend`
5. **Environment** → ajoute :
   - `SECRET_KEY` = clé forte générée (ex. `python -c "import secrets; print(secrets.token_urlsafe(50))"`)
   - `DEBUG` = `False`
   - `ALLOWED_HOSTS` = `trajetcampus-api.onrender.com`
   - `CORS_ALLOWED_ORIGINS` = l'URL Netlify (étape 3)
   - `DATABASE_URL` = l'URL du PostgreSQL créé ci-dessous
6. **Créer la base de données (recommandé)** : Render → **New → PostgreSQL**
   (gratuit) → copie la « Internal Database URL » dans `DATABASE_URL`.
   Le code lit `DATABASE_URL` automatiquement (`dj-database-url`).
   ⚠️ Sans cela, Render utilise SQLite qui est **réinitialisée à chaque
   redéploiement**.
7. Après le déploiement, onglet **Shell** du service → :
   ```bash
   python manage.py seed_demo
   ```
   Cela crée les **10 comptes de démonstration** (admin, Fatou, modo, Awa,
   Ousmane, Mariama…) et des données d'exemple (trajets, réservations,
   paiement). Le script est idempotent : relançable sans doublonner.
8. Clique **Deploy**. À la fin, Render te donne l'URL :
   `https://trajetcampus-api.onrender.com` → **note-la**.

### Fichiers médias (photos des cartes étudiant)
- En `DEBUG=False`, Django ne sert plus `/media/` : les téléversements de
  cartes seront enregistrés mais pas affichables.
- Solutions pour la démo : `DEBUG=True` temporairement (à éviter), ou utiliser
  un stockage externe (Cloudinary, AWS S3).
- Les fichiers statiques (admin Django) sont servis par WhiteNoise :
  `collectstatic` est déjà dans la Build command ci-dessus.

---

## 3. Déployer le frontend sur Netlify

### Méthode A — Git (recommandée)
1. Sur https://app.netlify.com → **Add new site → Import an existing project**.
2. Sélectionne le dépôt GitHub du projet.
3. Paramètres :
   - Build command : `cd frontend && npm run build`
   - Publish directory : `frontend/dist`
4. **Site settings → Environment variables** → ajoute :
   - `VITE_API_URL` = `https://trajetcampus-api.onrender.com/api`
5. **Deploy** → après ~1 min, ton site est en ligne :
   `https://xxxxxx.netlify.app` → **note-là**.
6. À chaque `git push` sur la branche, le site est redéployé automatiquement.

### Méthode B — Drag & drop (essai rapide, sans Git)
1. Construis localement avec l'URL de l'API :
   ```bash
   cd frontend
   VITE_API_URL=https://trajetcampus-api.onrender.com/api npm run build
   ```
2. Va sur https://app.netlify.com/drop et glisse le dossier `frontend/dist`.
3. L'URL est générée immédiatement (⚠️ pas de redéploiement automatique).

---

## 4. Raccorder les deux

Retourne sur **Render** et complète :
- `CORS_ALLOWED_ORIGINS` = `https://xxxxxx.netlify.app` (l'URL Netlify obtenue)
- `ALLOWED_HOSTS` = `trajetcampus-api.onrender.com` (inchangé)

Puis **Deploy** à nouveau sur Render (ou attends le redéploiement auto).

---

## 5. Vérifications finales
1. Ouvre l'URL Netlify → connecte-toi avec `Fatou` / `Secret12345`.
2. Teste le parcours : recherche de trajets → réservation → dashboard.
3. Teste le téléversement de carte (point le plus fragile : média + CORS).
4. En cas d'erreur :
   - **Page blanche sans erreur console** → vérifie qu'il n'y a **pas de fichier
     `frontend/public/_headers`** : une règle globale du type
     `Content-Type: application/javascript` casse `index.html`
     (le navigateur ne le parse plus comme HTML, `#root` reste vide, zéro erreur).
     Supprime le fichier et redéploie. ⚠️ Ce bug nous a coûté cher !
   - **Erreur 404 sur tous les appels API (`/api/auth/login/`…)** → vérifie la
     valeur de `VITE_API_URL` : elle doit être `https://trajetcampus-api.onrender.com/api`
     — **sans `/` final** (sinon l'URL devient `/api//auth/login/` → 404 Django)
     et **avec le préfixe `/api`** (sinon `/auth/login/` → 404 Django).
     Le code frontend tolère maintenant les slashes en trop
     (`api.js` normalise l'URL), mais `/api` reste obligatoire.
     Vérifie aussi côté Render : service bien démarré
     (`gunicorn config.wsgi:application` avec Root Directory = `backend`),
     `ALLOWED_HOSTS` = le domaine onrender.com, et code à jour (redéployé).
   - **Netlify** → Deploys → logs du build (erreur de build / env manquante).
   - **Render** → Logs du service (trace Django, ex. `ALLOWED_HOSTS` manquant).
   - **CORS** → dans la console du navigateur : `Access-Control-Allow-Origin`
     manquant → vérifie `CORS_ALLOWED_ORIGINS` (URL exacte, sans `/` final).

---

## Rappel des variables (récap)

**Render (backend)** : `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`
**Netlify (frontend)** : `VITE_API_URL`
