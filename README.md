# 🚗 Covoiturage

Application web de **covoiturage** dédiée à la communauté universitaire de l'**ISEP** (Dakar, Sénégal).

Elle permet aux étudiants et enseignants de **partager leurs trajets vers le campus** :
un conducteur publie un trajet (départ, arrivée, heure, places, prix), un passager le réserve,
paie à l'arrivée et les deux se notent. Une équipe de modération garantit la confiance
(vérification des cartes étudiant, signalements, suspensions).

> 📄 **Cahier des charges** : `cahier_de_charge.odt` · **Diagramme UML** : `diagramme_covoiturage.png`
> 🎞️ **Présentation** : `outils_projet/PRESENTATION.md` · **Déploiement** : `outils_projet/DEPLOYEMENT.md`

---

## 📋 Sommaire

1. [Fonctionnalités](#-fonctionnalités)
2. [Pile technologique](#-pile-technologique)
3. [Architecture du projet](#-architecture-du-projet)
4. [Prérequis](#-prérequis)
5. [Installation](#-installation)
6. [Démarrage rapide](#-démarrage-rapide)
7. [Données de démonstration](#-données-de-démonstration)
8. [Règles métier](#-règles-métier)
9. [Aperçu de l'API](#-aperçu-de-lapi)
10. [Modèle de données](#-modèle-de-données)
11. [Frontend (React)](#-frontend-react)
12. [Déploiement](#-déploiement)
13. [Commandes utiles](#-commandes-utiles)

---

## 🎯 Fonctionnalités

### Tout utilisateur
- Inscription avec **carte étudiant** (numéro + photo à téléverser) et rôle **Étudiant** ou **Enseignant**.
- Recherche de trajets par **région de départ** et **région d'arrivée** (les 14 régions du Sénégal).
- Consultation du **profil** et de la **note moyenne**.

### Passager
- Réserve une place sur un trajet (demande **en attente**, puis **acceptée** ou **refusée** par le conducteur).
- **Suit la position GPS** du conducteur en temps réel pendant le trajet.
- **Paie** à l'arrivée (Wave ou Orange Money — paiement simulé, cf. [Règles métier](#-règles-métier)).
- **Note** le conducteur (1 à 5 étoiles + commentaire).
- **Signale** un incident (conduite dangereuse, harcèlement, fraude, autre).

### Conducteur
- **Publie** un trajet (réservé aux comptes à **carte vérifiée**).
- **Gère** les demandes de réservation (accepter / refuser).
- **Démarre** et **termine** le trajet, **partage** sa position GPS.
- Voit son **tableau de bord** (réservations reçues, total d'argent reçu).
- **Note** ses passagers.

### Modérateur
- **Vérifie** les cartes étudiant (ou retire la vérification).
- Consulte les **alertes** générées automatiquement par les signalements.
- **Clôture** un signalement, **suspend** un compte (1 à 30 jours) ou le **réactive**.

---

## 🛠️ Pile technologique

| Partie | Technologie | Détail |
|--------|-------------|--------|
| **Backend** | Python + **Django 6** | Framework web (gestion des données, admin, sécurité) |
| **API** | **Django REST Framework** | Expose l'API en JSON, authentification par **token** |
| **Base de données** | **SQLite** en développement | Fichier `db.sqlite3` (zéro configuration) |
| **Base (production)** | PostgreSQL (optionnel) | Via `DATABASE_URL` (ex. sur Render) |
| **Frontend** | **React 19** + **Vite 8** | Interface utilisateur, JavaScript (JSX) |
| **Fichiers** | Pillow | Validation/upload des images (cartes étudiant) |
| **Statiques** | WhiteNoise | Sert les fichiers statiques en production |
| **Production** | Gunicorn | Serveur WSGI pour Django |

---

## 🏗️ Architecture du projet

Le projet est découpé en **deux parties indépendantes** qui communiquent par **API** :

```
Navigateur  ──(fetch /api/...)──▶  Frontend React (Vite, port 5173)
   ▲                                        │
   │                                        │  proxy /api → 127.0.0.1:8000
   │                                        ▼
   └──────────(JSON)────────────  Backend Django (port 8000)
                                          │
                                          ▼
                                    Base SQLite (db.sqlite3)
```

- Le **backend** (`TrajetCampus/backend/`) est le « cerveau » : il gère les règles, les données et
  l'authentification. Il expose une **API REST** (des adresses web qui renvoient du JSON).
- Le **frontend** (`TrajetCampus/frontend/`) est le « visage » : l'interface React qui appelle cette API.
- En **développement**, Vite sert le site sur le port **5173** et **redirige** automatiquement
  les adresses `/api/...` vers Django (port **8000**) — aucun problème de CORS à gérer.

### Arborescence

```
.
├── cahier_de_charge.odt            # Cahier des charges (texte)
├── diagramme_covoiturage.png       # Diagramme UML du projet
├── outils_projet/                  # Présentation + guide de déploiement
│   ├── PRESENTATION.md
│   └── DEPLOYEMENT.md
└── TrajetCampus/                   # ← le code de l'application
    ├── render.yaml                 # Config de déploiement backend (Render)
    ├── backend/                    # API Django (Python)
    │   ├── manage.py               # Point d'entrée des commandes Django
    │   ├── requirements.txt        # Dépendances Python
    │   ├── config/                 # Réglages généraux (settings, urls)
    │   ├── users/                  # Comptes, inscription, connexion, profil
    │   ├── trips/                  # Trajets + positions GPS
    │   ├── reservations/           # Réservations, notes, signalements
    │   ├── payments/               # Paiements (Wave / Orange Money)
    │   └── moderation/             # Alertes, suspensions, vérification cartes
    └── frontend/                   # Interface React (Vite)
        ├── netlify.toml            # Config de déploiement frontend (Netlify)
        ├── vite.config.js          # Réglages Vite + proxy API
        └── src/
            ├── api.js              # Toutes les appels à l'API
            ├── App.jsx             # Chef d'orchestre : quelle page afficher
            ├── regions.js          # Les 14 régions du Sénégal
            ├── components/         # Navbar, TripCard...
            ├── pages/              # Login, Register, Trips, Dashboard, Profile, Moderation
            └── assets/             # Images (fonds d'écran)
```

---

## ✅ Prérequis

| Outil | Version conseillée | Vérification |
|-------|--------------------|--------------|
| **Python** | 3.10+ (3.14 testé) | `python --version` |
| **pip** | avec Python | `pip --version` |
| **Node.js** | 18+ (20+ conseillé) | `node --version` |
| **npm** | avec Node | `npm --version` |
| **Git** | n'importe laquelle | `git --version` |

---

## ⚙️ Installation

### 1. Récupérer le code

```bash
git clone https://github.com/dieyemouhamadoulmoustapha52-coder/TrajetCampus.git
cd TrajetCampus
```

### 2. Installer le backend (Django)

```bash
cd backend

# Créer un environnement virtuel (« bulle » isolée pour les dépendances Python)
python -m venv .venv

# L'activer
source .venv/bin/activate        # Linux / macOS
# .venv\Scripts\activate         # Windows (PowerShell)

# Installer les dépendances
pip install -r requirements.txt

# Créer la base de données
python manage.py migrate
```

### 3. Installer le frontend (React)

Dans un **second terminal** :

```bash
cd frontend
npm install
```

---

## 🚀 Démarrage rapide

L'application a besoin de **deux serveurs** qui tournent **en même temps**, chacun dans son terminal.

**Terminal 1 — le backend (Django) :**

```bash
cd backend
source .venv/bin/activate
python manage.py runserver
# → API disponible sur http://127.0.0.1:8000
```

**Terminal 2 — le frontend (React) :**

```bash
cd frontend
npm run dev
# → Site disponible sur http://localhost:5173
```

Ouvre ensuite **http://localhost:5173** dans votre navigateur.

> 💡 **Panier d'administration Django** : une fois un compte superuser créé
> (`python manage.py createsuperuser`), rendez-vous sur **http://127.0.0.1:8000/admin/**.

---

## 🌱 Données de démonstration

Pour ne pas repartir d'une base vide, une commande crée des **comptes de test** et des
**données d'exemple** (trajets, réservations, paiements) :

```bash
cd backend
source .venv/bin/activate
python manage.py migrate
python manage.py seed_demo
```

Cette commande est **idempotente** : vous pouvez la relancer sans risquer de créer de doublons.
Elle crée notamment un compte **modérateur** et plusieurs comptes étudiants/enseignants.
Le détail des identifiants générés se trouve dans
`backend/users/management/commands/seed_demo.py`.

Pour réactiver automatiquement les comptes dont la suspension est expirée :

```bash
python manage.py lift_suspensions
```

---

## 📏 Règles métier

Ces règles sont **imposées côté serveur** (même un appel API direct ne peut pas les contourner) :

| Règle | Explication |
|-------|-------------|
| 🪪 **Carte vérifiée pour publier** | Un utilisateur **ne peut pas publier** de trajet tant que son n'a pas vérifié sa carte étudiant (→ erreur `403`). |
| 🚫 **Anti-abus (30 jours)** | Un passager qui a **annulé** une réservation dans les **30 derniers jours** ne peut plus être accepté par un conducteur. |
| 🔁 **Une seule réservation par trajet** | Un passager ne peut réserver **qu'une seule fois** le même trajet (contrainte d'unicité en base). |
| 💺 **Pas de surréservation** | Les places sont comptées (réservations **en attente + acceptées**) pour éviter de vendre plus de places que disponibles. |
| 📡 **GPS lié au trajet** | La position **ne peut être partagée** que par le conducteur, et **uniquement pendant** un trajet « en cours ». |
| 💰 **Paiement après le trajet** | Le paiement n'est possible que pour une réservation **acceptée** sur un trajet **terminé**, et **une seule fois**. Le montant est **calculé automatiquement** (prix de la place). |
| ⭐ **Une note par personne** | Chaque partie (passager **et** conducteur) peut noter **une seule fois** une réservation, une fois le trajet terminé. |
| 🛡️ **Suspension** | Un compte suspendu **ne peut plus se connecter** ; son token est refusé. La suspension dure de **1 à 30 jours**. |

> 💡 Le paiement **Wave / Orange Money est simulé** : le système génère une référence unique
> au lieu d'appeler les vraies API (qui sont payantes et réservées à la production).
> L'intégration réelle passerait par un appel asynchrone (ex. Celery).

---

## 🔌 Aperçu de l'API

Toutes les adresses commencent par **`/api/`**. L'authentification se fait avec un **token**
à ajouter dans l'en-tête : `Authorization: Token <votre_token>`.

### Authentification & profil
| Méthode | Adresse | Description | Auth |
|---------|---------|-------------|------|
| `POST` | `/api/auth/register/` | Créer un compte | — |
| `POST` | `/api/auth/login/` | Se connecter, récupérer le token | — |
| `GET` / `PATCH` | `/api/auth/profile/` | Consulter / modifier son profil | ✔ |

### Trajets
| Méthode | Adresse | Description | Auth |
|---------|---------|-------------|------|
| `GET` | `/api/trips/` | Liste des trajets (filtres `?departure_region=`, `?arrival_region=`) | — |
| `POST` | `/api/trips/` | Publier un trajet | ✔ |
| `POST` | `/api/trips/<id>/start/` | Démarrer un trajet (conducteur) | ✔ |
| `POST` | `/api/trips/<id>/finish/` | Terminer un trajet (conducteur) | ✔ |
| `POST` | `/api/trips/<id>/locations/` | Partager sa position GPS (conducteur) | ✔ |
| `GET` | `/api/trips/<id>/locations/latest/` | Dernière position (conducteur ou passager accepté) | ✔ |

### Réservations, notes, signalements
| Méthode | Adresse | Description | Auth |
|---------|---------|-------------|------|
| `POST` | `/api/trips/<id>/reservations/` | Demander une place | ✔ |
| `GET` | `/api/reservations/` | Mes réservations (envoyées + reçues) | ✔ |
| `PATCH` | `/api/reservations/<id>/` | Accepter / refuser / annuler | ✔ |
| `POST` | `/api/reservations/<id>/rating/` | Noter (passager ou conducteur) | ✔ |
| `GET` | `/api/users/<id>/rating/` | Note moyenne d'un utilisateur | ✔ |
| `POST` | `/api/trips/<id>/reports/` | Signaler un incident | ✔ |

### Paiements
| Méthode | Adresse | Description | Auth |
|---------|---------|-------------|------|
| `POST` | `/api/reservations/<id>/payments/` | Payer une réservation (wave / orange) | ✔ |
| `GET` | `/api/payments/` | Mes paiements (payés + reçus) | ✔ |

### Modération (réservé aux modérateurs)
| Méthode | Adresse | Description |
|---------|---------|-------------|
| `GET` | `/api/moderation/alerts/` | Liste des alertes |
| `GET` | `/api/moderation/reports/<id>/` | Détail d'un signalement (marque comme lu) |
| `POST` | `/api/moderation/reports/<id>/resolve/` | Clôturer un signalement |
| `GET` | `/api/moderation/users/` | Comptes + cartes étudiant |
| `POST` | `/api/moderation/users/<id>/verify/` | Vérifier / retirer la vérification d'une carte |
| `POST` | `/api/moderation/users/<id>/suspend/` | Suspendre un compte (`{"days": 7}`) |
| `POST` | `/api/moderation/users/<id>/reinstate/` | Réactiver un compte |

> Les réponses de liste sont **paginées** (10 éléments par page) avec la structure
> `{ "count", "next", "previous", "results" }`.

---

## 🗃️ Modèle de données

```
CustomUser (users)          Utilisateur personnalisé
 ├─ role            student / teacher
 ├─ student_card_number  Numéro de carte (unique)
 ├─ student_card    Photo de la carte (fichier)
 ├─ is_verified     Carte vérifiée par un modérateur
 ├─ phone_number    Téléphone (optionnel)
 ├─ is_moderator    Rôle modérateur
 └─ suspended_until Date de fin de suspension

Trip (trips)                Un trajet proposé
 ├─ driver          → CustomUser (conducteur)
 ├─ departure_region / arrival_region   Région (14 régions)
 ├─ departure_time  Date et heure
 ├─ available_seats Nombre de places
 ├─ price_per_seat  Prix par place (FCFA)
 └─ status          scheduled → ongoing → finished (ou cancelled)

TripLocation (trips)        Une position GPS
 ├─ trip            → Trip
 ├─ latitude / longitude
 └─ recorded_at     Horodatage

Reservation (reservations)  Une demande de place
 ├─ passenger       → CustomUser (passager)
 ├─ trip            → Trip
 └─ status          pending → accepted / refused / cancelled
    ⚠ une seule réservation par (trip, passenger)

Rating (reservations)       Une note
 ├─ reservation     → Reservation
 ├─ rating          1 à 5
 ├─ comment         Commentaire
 └─ rated_by        → CustomUser
    ⚠ une seule note par (reservation, rated_by)

Report (reservations)       Un signalement
 ├─ trip            → Trip
 ├─ reporter        → CustomUser
 ├─ reason          dangerous_driving / harassment / fraud / other
 └─ resolved        Traité par le modérateur

Payment (payments)          Un paiement
 ├─ reservation     → Reservation (1 à 1)
 ├─ method          wave / orange
 ├─ amount          Montant (FCFA)
 ├─ status          pending / paid
 └─ reference       Référence externe (unique)

ModerationAlert (moderation) Alerte automatique
 └─ report          → Report (1 à 1) — créée dès qu'un signalement est fait
```

---

## ⚛️ Frontend (React)

L'interface est une **Single Page Application** : `App.jsx` choisit la page à afficher selon
l'état (connecté ou non, rôle de l'utilisateur).

| Page | Rôle |
|------|------|
| `LoginPage` / `RegisterPage` | Connexion et inscription (stockées dans le `localStorage`) |
| `TripsPage` | Recherche + liste des trajets + publication |
| `DashboardPage` | Réservations, actions (accepter/démarrer/GPS/payer/noter/signaler) |
| `ProfilePage` | Profil, statut de la carte, téléversement de la carte |
| `ModerationPage` | Espace modérateur (alertes + vérification des cartes) |

**Points clés du code :**
- `src/api.js` : **toutes** les fonctions d'appel à l'API (une fonction par endpoint).
- `src/regions.js` : la liste des 14 régions, utilisée par la recherche et la publication.
- L'authentification est gérée avec le **`localStorage`** (token + infos utilisateur).
- Le style est un **CSS simple et épuré** (pas de framework), écrit **mobile d'abord**.

---

## 🚀 Déploiement

L'application se déploie en **deux parties** (un hébergeur ne peut pas faire les deux) :

| Partie | Hébergeur | Config |
|--------|-----------|--------|
| Backend (API Django) | **Render** | `TrajetCampus/render.yaml` |
| Frontend (React) | **Netlify** | `TrajetCampus/frontend/netlify.toml` |

Le guide **pas à pas** se trouve dans **[`outils_projet/DEPLOYEMENT.md`](outils_projet/DEPLOYEMENT.md)**.

### Variables d'environnement

**Backend (Render)** :
| Variable | Rôle |
|----------|------|
| `SECRET_KEY` | Clé secrète de signature (générée automatiquement sur Render) |
| `DEBUG` | `False` en production |
| `ALLOWED_HOSTS` | Domaines autorisés (ex. `trajetcampus-api.onrender.com`) |
| `CORS_ALLOWED_ORIGINS` | URL du frontend autorisé (ex. `https://votre-site.netlify.app`) |
| `DATABASE_URL` | *(optionnel)* URL PostgreSQL — sans elle, Render utilise un SQLite **réinitialisé à chaque redéploiement** |

**Frontend (Netlify)** :
| Variable | Rôle |
|----------|------|
| `VITE_API_URL` | URL de l'API, **avec** le préfixe `/api` et **sans** `/` final (ex. `https://trajetcampus-api.onrender.com/api`) |

> ⚠️ `VITE_API_URL` est **embarquée dans le JavaScript** livré au navigateur : c'est normal
> et public (elle sert à localiser l'API). **N'y placez jamais de secret.**

---

## 🧰 Commandes utiles

### Backend (Django)
```bash
cd backend && source .venv/bin/activate

python manage.py runserver             # Lancer le serveur de dev
python manage.py migrate               # Appliquer les migrations (créer/mettre à jour les tables)
python manage.py makemigrations        # Générer une migration après changement d'un modèle
python manage.py createsuperuser       # Créer un compte administrateur
python manage.py seed_demo             # Peupler la base avec des données de démo
python manage.py lift_suspensions      # Réactiver les comptes suspendus expirés
python manage.py check                 # Vérifier la configuration (sans rien changer)
```

### Frontend (React)
```bash
cd frontend

npm run dev        # Lancer le serveur de développement (avec hot-reload)
npm run build      # Construire la version de production (dans dist/)
npm run lint       # Vérifier le code (Oxlint)
npm run preview    # Prévisualiser le build de production
```

---

## ❓ Pour aller plus loin

- **Ajouter une fonctionnalité ?** Crée/branche une *view* Django dans l'app concernée, ajoutez
  la route dans `urls.py`, et une fonction correspondante dans `frontend/src/api.js`.
- **Comprendre le fonctionnement ?** Le trajet d'une requête est :
  `URL → view → serializer → modèle → base de données`, puis le JSON revient vers React.
- **Concepts Django** : les *models* décrivent les tables, les *serializers* traduisent en JSON,
  les *views* traitent les requêtes, les *urls* font l'aiguillage.

---

## 📄 Licence

Projet réalisé dans le cadre académique. Tous droits réservés.
