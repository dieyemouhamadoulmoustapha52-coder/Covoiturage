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
   - Build command : `pip install -r requirements.txt`
   - Start command : `gunicorn config.wsgi:application --chdir backend` 
     (si le backend est dans un sous-dossier `backend/`, Root Directory = `backend`)
   - Root Directory : `backend` (dans Advanced, ou via le champ dédié)
5. **Environment** → ajoute :
   - `SECRET_KEY` = clé forte générée (ex. `python -c "import secrets; print(secrets.token_urlsafe(50))"`)
   - `DEBUG` = `False`
   - `ALLOWED_HOSTS` = `trajetcampus-api.onrender.com`
   - `CORS_ALLOWED_ORIGINS` = l'URL Netlify (étape 3)
6. **Créer la base de données** : Render → **New → PostgreSQL** (gratuit) →
   note l'URL interne. Puis ajoute la variable `DATABASE_URL` et modifie
   `settings.py` si besoin (SQLite est non persistant sur Render :
   chaque redéploiement la réinitialise).
   → Sinon, pour une **simple démo**, SQLite suffit mais les données
   disparaîtront au redéploiement.
7. Crée le superuser : onglet **Shell** du service → `python manage.py createsuperuser`
   puis recrée les comptes de test (ou importe `db.sqlite3`).
8. Clique **Deploy**. À la fin, Render te donne l'URL :
   `https://trajetcampus-api.onrender.com` → **note-la**.

### Fichiers médias (photos des cartes étudiant)
- En `DEBUG=False`, Django ne sert plus `/media/` : les téléversements de
  cartes seront enregistrés mais pas affichables.
- Solutions pour la démo : `DEBUG=True` temporairement (à éviter), ou utiliser
  un stockage externe (Cloudinary, AWS S3).
- Les fichiers statiques (admin Django) sont servis par WhiteNoise :
  lance `python manage.py collectstatic --noinput` au déploiement
  (ajoute-le en fin de Build command si besoin).

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
   - **Netlify** → Deploys → logs du build (erreur de build / env manquante).
   - **Render** → Logs du service (trace Django, ex. `ALLOWED_HOSTS` manquant).
   - **CORS** → dans la console du navigateur : `Access-Control-Allow-Origin`
     manquant → vérifie `CORS_ALLOWED_ORIGINS` (URL exacte, sans `/` final).

---

## Rappel des variables (récap)

**Render (backend)** : `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`
**Netlify (frontend)** : `VITE_API_URL`
