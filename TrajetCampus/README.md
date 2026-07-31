# 🚗 TrajetCampus — Guide du débutant

Application de covoiturage pour les étudiants et enseignants de l'ISEP (Sénégal).
Ce README explique **tout ce que nous construisons**, étape par étape, en langage simple.
Chaque fois que nous créons, modifions ou ajoutons quelque chose, nous le documentons ici.

> 🚀 **Prêt à mettre le site en ligne ?** Voir [**DEPLOYEMENT.md**](DEPLOYEMENT.md) —
> procédure complète Netlify (frontend) + Render (backend).

---

## Architecture générale (à comprendre une fois pour toutes)

Notre projet est séparé en 2 parties qui communiquent entre elles :

```
TrajetCampus/
├── backend/     ← Le cerveau (Python + Django) : gère les données, les règles du jeu
│   └── .venv/   ← L'environnement virtuel (les dépendances Python du projet)
└── frontend/    ← Le visage (React) : ce que voit l'utilisateur dans le navigateur
```

- Le **backend** expose une **API** (des adresses web qui renvoient des données JSON).
- Le **frontend React** appelle cette API pour afficher les trajets, les réservations, etc.
- Nous construisons le backend d'abord, puis le frontend.

---

## ÉTAPE 1 — Installation de l'environnement Django ✅ FAIT

### 🧠 Les concepts à comprendre

| Concept | Explication simple | Analogie |
|---|---|---|
| **Python** | Le langage de programmation du backend | La langue dans laquelle on écrit le cerveau |
| **Django** | Un "cadre de travail" (framework) Python qui fournit déjà énormément de code prêt : gestion des utilisateurs, base de données, pages d'administration | Un kit de construction LEGO : les briques de base sont déjà là, on assemble |
| **Django REST Framework (DRF)** | Une extension de Django qui permet de créer des **API** (données en format JSON compréhensibles par React) | Le traducteur entre Django et React |
| **Environnement virtuel (.venv)** | Une "bulle" isolée où sont installées les dépendances du projet, sans polluer le système Linux | Un garage privé : chaque projet a ses propres outils |
| **Base de données SQLite** | Le fichier `db.sqlite3` où sont stockées les données (utilisateurs, trajets...). Zéro configuration requise | Un grand tableau Excel caché, mais bien plus puissant |
| **Migration** | Une commande qui crée/met à jour les tables de la base de données à partir du code | Construire les étagères d'un magasin avant d'y poser les produits |

### 📁 Ce qui a été créé et à quoi ça sert

```
TrajetCampus/backend/
├── manage.py          ← Le chef d'orchestre : toutes les commandes Django passent par lui
│                        (ex: python manage.py runserver → lance le serveur)
├── db.sqlite3         ← Notre base de données SQLite (créée par la commande migrate)
├── .venv/             ← L'environnement virtuel (ne jamais y toucher à la main)
├── config/            ← Le "cœur" du projet : la configuration générale
│   ├── settings.py    ← LES RÉGLAGES : applications installées, base de données, langue...
│   ├── urls.py        ← L'AIGUILLAGE : fait correspondre chaque adresse web à un traitement
│   ├── asgi.py        ← Fichiers techniques pour servir le site sur le web (ne pas modifier)
│   └── wsgi.py        ← Idem
└── users/             ← Notre première application (module) : gérera les comptes utilisateurs
    ├── models.py      ← Définit les données (ex: le modèle Utilisateur) — on modifiera à l'étape 2
    ├── views.py       ← Définit ce qui se passe quand on visite une page — étape suivante
    ├── admin.py       ← Permet de gérer l'app depuis le panneau d'administration Django
    ├── apps.py        ← Configuration technique de l'app (ne pas modifier)
    ├── tests.py       ← Pour écrire des tests automatiques (on apprendra plus tard)
    └── migrations/    ← L'historique des évolutions de la base de données
```

> 💡 **Application vs Projet** : le **projet** `config` est la maison (configuration globale),
> les **applications** (`users`, puis plus tard `trips`, `reservations`...) sont les pièces
> de la maison. Chaque pièce a un rôle précis.

### 🔧 Les commandes à connaître par cœur (à taper à chaque séance)

```bash
# 1. Aller dans le dossier backend
cd /home/dieye_dev/Documents/UML/Projet_Covoiturage/TrajetCampus/backend

# 2. ACTIVER l'environnement virtuel (obligatoire à chaque nouvelle session !)
source .venv/bin/activate
#    → tu dois voir (.venv) apparaître au début de ta ligne de commande

# 3. Lancer le serveur de développement
python manage.py runserver
#    → ouvre http://127.0.0.1:8000 dans le navigateur
#    → arrêter le serveur : Ctrl + C
```

### ✅ Résultat validé
- Django **6.0.7** et Django REST Framework **3.17.1** installés dans `.venv`
- Projet `config` créé, application `users` créée
- Base de données initialisée (`python manage.py migrate` — tables admin/auth créées)
- Test serveur : la page d'accueil répond avec le code `HTTP 200` ✅

---

## Prochaine étape (à venir)

**Étape 2 : le modèle CustomUser** — nous allons personnaliser le modèle d'utilisateur de Django
(numéro de carte étudiant, rôle étudiant/enseignant, vérification de la carte via le système
académique) comme demandé dans le cahier des charges.

---

## ÉTAPE 2 — Le modèle CustomUser ✅ FAIT

### 🧠 Les concepts à comprendre

| Concept | Explication simple |
|---|---|
| **Modèle** | Une classe Python qui décrit une **table** de la base de données : chaque attribut (ex: `role`) devient une **colonne** (ex: `role`), chaque utilisateur créé devient une **ligne**. |
| **AbstractUser** | La classe d'utilisateur de base fournie par Django (nom, email, mot de passe haché, droits admin...). On en **hérite** pour garder tout ce qui fonctionne déjà, et on **ajoute** nos champs personnalisés. |
| **TextChoices** | La façon propre de définir une liste de choix fixes dans un modèle (ici : les rôles `Étudiant` / `Enseignant`). En base, on stocke `"student"` ou `"teacher"` (le code), mais on peut afficher le libellé français grâce à `get_role_display()`. |
| **AUTH_USER_MODEL** | La ligne de réglage (`config/settings.py`) qui annonce à Django : "l'utilisateur officiel de ce projet, c'est `users.CustomUser`". **À définir AVANT la première migration dans un vrai projet** (on verra ce qui arrive sinon plus bas 😅). |
| **Migration** | Un fichier généré par `makemigrations` qui décrit "le plan de construction" d'une table. `migrate` exécute ce plan. Les migrations sont versionnées : c'est l'historique de votre base. |
| **Superuser** | Le compte administrateur tout-puissant. On s'en sert pour se connecter au panneau `/admin` et gérer les données sans écrire une ligne de code. |

### 📝 Ce qui a été modifié/créé

**1. `users/models.py` — le modèle CustomUser**

```python
from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = "student", "Étudiant"
        TEACHER = "teacher", "Enseignant"

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.STUDENT,
        verbose_name="Rôle",
    )
    student_card_number = models.CharField(
        max_length=30,
        unique=True,
        verbose_name="Numéro de carte étudiant",
    )
    phone_number = models.CharField(
        max_length=20,
        blank=True,
        verbose_name="Numéro de téléphone",
    )
```

Explication champ par champ :
- `role` : le type de compte (Étudiant par défaut, ou Enseignant). Le conducteur n'est PAS un rôle séparé : c'est un étudiant ou un enseignant qui propose un trajet (comme dans le diagramme UML — généralisation).
- `student_card_number` : le fameux numéro de carte étudiant du cahier des charges. `unique=True` garantit que deux comptes ne peuvent pas avoir le même numéro.
- `phone_number` : utile plus tard pour les paiements Wave / Orange Money. `blank=True` = facultatif.
- `__str__` : définit comment l'utilisateur s'affiche dans l'admin (ex: `Moustapha (Étudiant)`).

**2. `config/settings.py` — 2 lignes ajoutées**

```python
INSTALLED_APPS = [ ..., 'users', ]   # on déclare notre application au projet

AUTH_USER_MODEL = 'users.CustomUser' # Django utilise NOTRE utilisateur
```

**3. `users/admin.py` — l'utilisateur visible dans le panneau d'administration**

On utilise la classe `UserAdmin` de Django (pour conserver le formulaire de gestion du mot de passe, avec hachage et confirmation) et on ajoute notre section "Informations TrajetCampus" avec nos champs personnalisés.

### 🐛 L'erreur que nous avons rencontrée (et c'est très bien pour apprendre !)

```
InconsistentMigrationHistory: Migration admin.0001_initial is applied
before its dependency users.0001_initial
```

**Pourquoi ?** À l'étape 1, la base avait été créée avec l'utilisateur par défaut de Django. En ajoutant `AUTH_USER_MODEL`, l'app `admin` exige désormais que la table des utilisateurs (la nôtre) soit créée **en premier**. Mais dans notre base, l'ordre était déjà fixé → contradiction.

**La solution (valable ici car nous n'avions AUCUNE donnée réelle à perdre) :** supprimer `db.sqlite3` et la recréer dans le bon ordre :
```bash
rm db.sqlite3
rm users/migrations/0001_initial.py
python manage.py makemigrations users   # recrée la migration
python manage.py migrate                # recrée la base dans le bon ordre
```
> ⚠️ **Leçon à retenir :** dans un projet réel, on fixe `AUTH_USER_MODEL` **tout de suite**, au tout début, pour ne jamais avoir à reconstruire la base.

### ✅ Résultat validé
- Table `users_customuser` créée avec les champs `role`, `student_card_number`, `phone_number`
- Superuser créé : **admin** / **Admin123!** (à changer plus tard 😉)
- Test en base : utilisateur `Moustapha (Étudiant)` créé et relu avec succès ✅
- Page `/admin/` répond correctement (redirection `302` vers la page de connexion, comportement normal)

### 🔧 À tester toi-même

```bash
cd /home/dieye_dev/Documents/UML/Projet_Covoiturage/TrajetCampus/backend
source .venv/bin/activate
python manage.py runserver
```
- Ouvre `http://127.0.0.1:8000/admin` et connecte-toi avec **admin** / **Admin123!**
- Clique sur "Utilisateurs" : tu verras le superuser admin et l'étudiant de test `Moustapha (Étudiant)`
- Essaie de créer un utilisateur via le bouton "AJOUTER UTILISATEUR" : tu verras nos champs personnalisés

---

## ÉTAPE 3 — L'API d'inscription et de connexion ✅ FAIT

### 🧠 Les concepts à comprendre

| Concept | Explication simple |
|---|---|
| **API endpoint** | Une adresse web qui renvoie des **données JSON** (et non une page HTML). Ex: `POST /api/auth/register/`. React parlera uniquement à ce genre d'adresses. |
| **Serializer** | Le **traducteur officiel** entre le JSON (ce qui arrive d'Internet) et notre modèle. Il valide aussi : champ manquant → erreur `400`, mot de passe trop court → erreur. |
| **View (APIView)** | Le **traitement** déclenché quand on appelle l'endpoint : `RegisterView.post()` = "crée l'utilisateur". Une classe APIView porte une méthode par verbe HTTP (`post`, `get`...). |
| **URL / route** | Le **panneau d'aiguillage** : `path("auth/register/", RegisterView.as_view())` relie l'adresse à la view. Toutes les routes sont regroupées sous le préfixe `api/` dans `config/urls.py`. |
| **Token** | Un **laissez-passer secret** généré à l'inscription/connexion. Le client (React) le stocke et le montre à chaque requête pour dire "c'est bien moi". `rest_framework.authtoken` gère leur stockage en base. |
| **Verbes HTTP** | `POST` = envoyer/demander la création d'une ressource. `GET` = récupérer. (On verra `PATCH`/`DELETE` plus tard.) |
| **Statuts HTTP** | `201` créé · `200` OK · `400` données invalides · `401` identifiants refusés |

**Le chemin d'une requête :** URL → View → Serializer → Modèle → Base de données.

### 📝 Ce qui a été créé/modifié

**1. `config/settings.py`** — activation de DRF et de son système de tokens
```python
INSTALLED_APPS = [ ..., 'rest_framework', 'rest_framework.authtoken', 'users', ]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',  # le laissez-passer par token
    ],
}
```

**2. `users/serializers.py`** (nouveau) — deux traducteurs :
- `RegisterSerializer` : traduit le JSON d'inscription → objet `CustomUser`. `password` est `write_only=True` (jamais renvoyé en réponse !) et `min_length=8`. `create()` utilise `create_user` qui **hache** le mot de passe (stockage sécurisé).
- `UserSerializer` : traduit le modèle → JSON lisible (id, username, email, rôle...). `role_display` affiche le libellé français ("Étudiant") au lieu du code (`student`).

**3. `users/views.py`** — deux views :
- `RegisterView` : valide les données → crée l'utilisateur → crée son token → répond `201` avec le token + les infos.
- `LoginView` : vérifie username/password via `authenticate()` → répond `200` avec le token (même token à chaque connexion) ou `401`.

**4. `users/urls.py`** (nouveau) + **`config/urls.py`** — l'aiguillage :
```python
# users/urls.py
path("auth/register/", RegisterView.as_view(), name="register"),
path("auth/login/", LoginView.as_view(), name="login")

# config/urls.py
path('api/', include('users.urls'))   # → les adresses complètes deviennent /api/auth/...
```

### ✅ Résultat validé (tests avec curl)
| Test | Réponse attendue | Réponse obtenue |
|---|---|---|
| Inscription de `Fatou` | `201` + token + infos | ✅ `{"token": "...", "user": {...}}` |
| Connexion avec bons identifiants | `200` + token | ✅ même token qu'à l'inscription |
| Connexion avec mauvais mot de passe | `401` | ✅ `{"detail": "Identifiants incorrects."}` |
| Inscription sans numéro de carte | `400` + message d'erreur | ✅ `{"student_card_number": ["This field is required."]}` |

### 🔧 À tester toi-même

```bash
cd /home/dieye_dev/Documents/UML/Projet_Covoiturage/TrajetCampus/backend
source .venv/bin/activate
python manage.py runserver
```
Dans un **second terminal** (pendant que le serveur tourne) :
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ -H "Content-Type: application/json" -d '{"username":"ali","email":"ali@isep.sn","password":"MonMotDePasse9","role":"teacher","student_card_number":"CARTE-2026-003"}'
curl -X POST http://127.0.0.1:8000/api/auth/login/ -H "Content-Type: application/json" -d '{"username":"ali","password":"MonMotDePasse9"}'
```
> 💡 Si `curl` n'est pas installé, tape `sudo dnf install curl` (ou `sudo apt install curl`).

---

## ÉTAPE 4 — Le modèle Trajet et son API (publier / rechercher) ✅ FAIT

### 🧠 Les concepts à comprendre

| Concept | Explication simple |
|---|---|
| **ForeignKey (clé étrangère)** | Une **relation entre 2 tables** : ici "un trajet appartient à un conducteur". En base, on stocke l'id du conducteur dans la colonne `driver_id`. `related_name="trips"` permet l'usage inverse : `conducteur.trips.all()` = tous les trajets d'un conducteur. `on_delete=models.CASCADE` = si le conducteur est supprimé, ses trajets disparaissent aussi (logique : un trajet sans conducteur n'a pas de sens). |
| **Generic views** | Des vues **déjà prêtes** de DRF pour les cas courants : `ListCreateAPIView` = "liste + création" en une classe. On ne définit que 2 choses : `serializer_class` (le traducteur) et `get_queryset()` (quelles lignes montrer). DRF s'occupe du reste : pagination, erreur 400 automatique, méthodes GET/POST branchées. |
| **Pagination** | Découper les résultats en pages (10 par page ici, comme demandé dans le cahier des charges). La réponse devient : `{"count": total, "next": url page 2, "previous": ..., "results": [les trajets]}`. React utilisera `next` pour afficher "Voir plus". |
| **Paramètres d'URL (query params)** | Les critères après le `?` : `?departure_region=Dakar`. La view les lit avec `self.request.query_params.get(...)` et filtre la liste. C'est la base de notre barre de recherche ! |
| **Permissions** | `AllowAny` = tout le monde · `IsAuthenticated` = il faut présenter un token. `get_permissions()` nous permet d'avoir des règles différentes selon la méthode (GET = recherche publique, POST = publication réservée aux connectés). |
| **get_queryset vs queryset** | `queryset` en attribut = liste fixe. `get_queryset()` en méthode = liste calculée à la volée, indispensable pour appliquer les filtres. |

### 📝 Ce qui a été créé

**1. Application `trips`** (`python manage.py startapp trips`)

**2. `trips/models.py` — le modèle Trip**
- `driver` : ForeignKey vers `CustomUser` (le conducteur publie le trajet)
- `departure_region` / `arrival_region` : choix parmi les **14 régions du Sénégal** (Dakar, Thiès, Ziguinchor...) → recherche par région directement au niveau de la base
- `departure_time` : date et heure de départ
- `available_seats` : nombre de places (PositiveIntegerField = jamais négatif)
- `price_per_seat` : prix par place en FCFA
- `status` : Planifié / En cours / Terminé / Annulé — le statut servira pour "Démarrer un trajet" (étape GPS) et la règle anti-abus (trajets annulés sur 30 jours)
- `created_at` : horodatage automatique à la création

**3. `trips/serializers.py`** — `TripSerializer` : traduit trajet ↔ JSON, ajoute `driver_username` (le nom du conducteur sans faire de requête supplémentaire), et bloque la modification de `driver`/`status` par le client (`read_only_fields`).

**4. `trips/views.py` — `TripListCreateView(generics.ListCreateAPIView)`**
- `GET /api/trips/` : liste les trajets **Planifiés** (le plus tôt d'abord), filtrable par `?departure_region=` et `?arrival_region=`, paginée (10/page)
- `POST /api/trips/` : crée un trajet (connecté requis), le conducteur = l'utilisateur du token

**5. `trips/admin.py`** — gestion des trajets dans le panneau admin (filtres par statut/région).

**6. `config/settings.py`** — app `trips` déclarée + pagination DRF activée (`PAGE_SIZE = 10`).

### 🐛 Deux pièges rencontrés (et déjoués !)

1. **`DisallowedHost: 'testserver'`** : le client de test de Django se présente comme `testserver`, refusé par `ALLOWED_HOSTS = []`. Solution : `ALLOWED_HOSTS = ['*']` (à restreindre en production — le README le rappellera).
2. **La pagination ne s'appliquait pas** : j'utilisais une `APIView` brute, or la pagination est livrée par les **generic views**. Refactor en `ListCreateAPIView` → pagination et gestion d'erreurs offertes, et le code est même plus court !

### ✅ Résultat validé (tests via le client de test DRF)
| Test | Résultat |
|---|---|
| Publier sans connexion | `401` refusé ✅ |
| Publier connecté (Fatou) | `201` + trajet créé ✅ |
| Publier sans places/prix | `400` avec la liste des champs manquants ✅ |
| Liste paginée | structure `count/next/previous/results` ✅ |
| Filtre `?departure_region=Dakar` | 2 trajets sur 4 ✅ |
| Filtre `?arrival_region=Dakar` | 2 trajets sur 4 ✅ |

### 🔧 À tester toi-même

```bash
cd /home/dieye_dev/Documents/UML/Projet_Covoiturage/TrajetCampus/backend
source .venv/bin/activate
python manage.py runserver
```
Dans un second terminal (récupère un token en te connectant d'abord) :
```bash
# 1. Se connecter et récupérer le token (remplace XXX par le token reçu)
curl -X POST http://127.0.0.1:8000/api/auth/login/ -H "Content-Type: application/json" -d '{"username":"Fatou","password":"Secret12345"}'

# 2. Publier un trajet (avec ton token)
curl -X POST http://127.0.0.1:8000/api/trips/ -H "Content-Type: application/json" -H "Authorization: Token XXX" -d '{"departure_region":"Dakar","arrival_region":"Thiès","departure_time":"2026-08-15T08:00:00Z","available_seats":3,"price_per_seat":1500}'

# 3. Rechercher des trajets (sans connexion)
curl "http://127.0.0.1:8000/api/trips/?departure_region=Dakar"
```

---

## ÉTAPE 5 — Les réservations et la règle anti-abus ✅ FAIT

### 🧠 Les concepts à comprendre

| Concept | Explication simple |
|---|---|
| **Réservation** | Une **demande** du passager au conducteur, avec son propre cycle de vie : `pending` (en attente) → `accepted` / `refused` / `cancelled`. |
| **Contrainte d'unicité** | `UniqueConstraint(trip, passenger)` : dans la base, une **ligne interdite en double** (trip+passager). C'est la garantie "un passager ne peut pas réserver 2 fois le même trajet", au niveau de la base elle-même. |
| **Règle anti-abus** | Le cahier des charges : avant **validation**, vérifier que le passager n'a **aucun** trajet annulé sans justification dans les **30 derniers jours**. Implémentation : à l'instant où le conducteur clique "Accepter", on compte les réservations `cancelled` du passager dont `created_at` est dans les 30 derniers jours → si > 0, refus `400`. `timedelta(days=30)` + `timezone.now()` = la fenêtre glissante. |
| **Permissions par rôle** | Chaque action est vérifiée dans la view : accepter/refuser → `trip.driver == request.user` sinon `403` ; annuler → `passenger == request.user` sinon `403`. |
| **Places occupées** | Les places occupées = réservations **en attente + acceptées** (un "en attente" retient une place le temps que le conducteur décide). Vérifié à la demande ET à l'acceptation (double sécurité, voir le piège ci-dessous). |
| **403 Forbidden** | "Interdit" : la requête est valide mais vous n'avez pas le droit (mauvais rôle). Différent de `401` (non connecté) et `400` (données invalides). |

### 📝 Ce qui a été créé

**1. Application `reservations`** avec le modèle `Reservation` : `passenger` (FK), `trip` (FK), `status`, `created_at` + la contrainte d'unicité (trip, passager).

**2. `reservations/views.py` — 3 views :**
- `POST /api/trips/<id>/reservations/` : le passager demande une place. Contrôles en cascade : trajet planifié ? pas son propre trajet ? pas déjà réservé ? places libres ? → sinon `201` avec la réservation `pending`.
- `GET /api/reservations/` : liste les réservations **où je suis passager OU conducteur** (via `Q(passenger=...) | Q(trip__driver=...)` — le `Q` permet de combiner 2 conditions avec OU).
- `PATCH /api/reservations/<id>/` : change le statut (`accepted`/`refused`/`cancelled`) avec contrôle du rôle et, à l'acceptation, **la règle anti-abus** + le contrôle des places.

**3. `reservations/admin.py`** — gestion des réservations dans le panneau admin.

### 🐛 Le piège que nous avons corrigé (overbooking !)

Au départ, à l'acceptation, je ne comptais que les réservations **acceptées** : un trajet à 1 place pouvait finir avec 2 passagers (1 en attente + 1 acceptée). La correction : à l'acceptation, on compte **en attente + acceptées** (moins la réservation en cours). Le test a permis de le découvrir : créer une 2e réservation "en direct" puis l'accepter → `400 Plus de places disponibles`.

### ✅ Résultat validé (scénario complet)
| Test | Résultat |
|---|---|
| Aminata réserve trip1 | `201` pending ✅ |
| Réserve à nouveau le même trajet | `400` (unicité) ✅ |
| Fatou réserve son propre trajet | `400` ✅ |
| Moustapha tente d'accepter (pas conducteur) | `403` ✅ |
| Fatou accepte | `200` accepted ✅ |
| Aminata annule sa réservation (trip2) | `200` cancelled ✅ |
| Fatou accepte la suivante → **ANTI-ABUS !** | `400` "a annulé dans les 30 derniers jours" ✅ |
| Trajet plein → nouvelle demande | `400` "plus de places" ✅ |
| Accepter malgré une place retenue en attente | `400` (correction overbooking) ✅ |
| Refuser une demande puis accepter l'autre | `200`/`200` ✅ |

### 🔧 À tester toi-même

```bash
cd /home/dieye_dev/Documents/UML/Projet_Covoiturage/TrajetCampus/backend
source .venv/bin/activate
python manage.py runserver
```
Dans un second terminal (remplace XXX par ton token, et ID par un id de trajet) :
```bash
# 1. Demander une réservation (connecté requis)
curl -X POST http://127.0.0.1:8000/api/trips/ID/reservations/ -H "Authorization: Token XXX"

# 2. Voir mes réservations (reçues + envoyées)
curl http://127.0.0.1:8000/api/reservations/ -H "Authorization: Token XXX"

# 3. Accepter (conducteur uniquement) — RID = id de la réservation
curl -X PATCH http://127.0.0.1:8000/api/reservations/RID/ -H "Content-Type: application/json" -H "Authorization: Token XXX" -d '{"status":"accepted"}'
```

---

## ÉTAPE 6 — Démarrer le trajet + partage GPS en temps réel ✅ FAIT

### 🧠 Les concepts à comprendre

| Concept | Explication simple |
|---|---|
| **Relation `<<include>>` (UML)** | Dans le diagramme, `Démarrer un trajet ..> Partager la localisation : <<include>>` signifie : démarrer **déclenche obligatoirement** le partage GPS. Implémentation : le trajet passe à `ongoing`, et l'API de position **refuse** toute lecture/écriture en dehors d'un trajet en cours. |
| **Machine à états** | Le statut du trajet évolue dans un ordre strict : `Planifié → En cours → Terminé` (ou Annulé). Chaque transition est vérifiée : on ne peut démarrer qu'un trajet *planifié*, on ne peut terminer qu'un trajet *en cours*. |
| **Coordonnées GPS** | Latitude/longitude en `DecimalField(max_digits=9, decimal_places=6)` : 6 décimales ≈ 11 cm de précision, largement suffisant pour le suivi. Exemple : Dakar ≈ `14.716677, -17.467686`. |
| **Horodatage** | `auto_now_add` : la date/heure est posée automatiquement à l'enregistrement. Chaque position = une ligne de plus → on pourra afficher la **trajectoire complète** (le frontend React le fera avec une carte). |
| **Rôle des passagers** | Les passagers **acceptés** peuvent *lire* la dernière position (`locations/latest/`), mais seul le **conducteur** peut en *écrire*. Vérification : `Reservation.objects.filter(trip, passenger, status=ACCEPTED)`. |

### 📝 Ce qui a été créé/modifié

**1. `trips/models.py` — modèle `TripLocation`** : `trip` (FK), `latitude`, `longitude`, `recorded_at` (auto). Une nouvelle position ne remplace pas l'ancienne : c'est un **historique**.

**2. `trips/views.py` — 4 nouvelles views :**
- `POST /api/trips/<id>/start/` : conducteur uniquement, trajet planifié uniquement → `ongoing` (le GPS devient actif)
- `POST /api/trips/<id>/finish/` : conducteur uniquement, trajet en cours uniquement → `finished` (préparera le paiement à l'étape 7)
- `POST /api/trips/<id>/locations/` : conducteur **et trajet en cours obligatoire** → enregistre une position (`201`)
- `GET /api/trips/<id>/locations/latest/` : conducteur ou passager **accepté** → la dernière position

**3. `trips/serializers.py`** : `TripLocationSerializer` (lecture seule : `trip`, `recorded_at`).

**4. `trips/admin.py`** : `TripLocation` visible dans le panneau admin.

### ✅ Résultat validé (cycle de vie complet)
| Test | Résultat |
|---|---|
| Démarrer en tant que non-conducteur | `403` ✅ |
| Démarrer (planifié → en cours) | `200` `ongoing` ✅ |
| Redémarrer un trajet déjà en cours | `400` ✅ |
| Partager une position en tant que passager | `403` ✅ |
| Partager 2 positions en tant que conducteur | `201` + `201` ✅ |
| Passager accepté lit la **dernière** position | `200` (la plus récente) ✅ |
| Personne extérieure lit la position | `403` ✅ |
| Terminer (en cours → terminé) | `200` `finished` ✅ |
| Partager une position après la fin du trajet | `400` (GPS éteint) ✅ |

### 🔧 À tester toi-même

```bash
# Démarrer le trajet (conducteur, token requis)
curl -X POST http://127.0.0.1:8000/api/trips/ID/start/ -H "Authorization: Token XXX"

# Partager une position (conducteur, trajet en cours)
curl -X POST http://127.0.0.1:8000/api/trips/ID/locations/ -H "Content-Type: application/json" -H "Authorization: Token XXX" -d '{"latitude":14.716677,"longitude":-17.467686}'

# Lire la dernière position (conducteur ou passager accepté)
curl http://127.0.0.1:8000/api/trips/ID/locations/latest/ -H "Authorization: Token XXX"

# Terminer le trajet (conducteur)
curl -X POST http://127.0.0.1:8000/api/trips/ID/finish/ -H "Authorization: Token XXX"
```

---

## ÉTAPE 7 — Paiement mobile, notation et signalement ✅ FAIT

### 🧠 Les concepts à comprendre

| Concept | Explication simple |
|---|---|
| **OneToOneField vs ForeignKey + UniqueConstraint** | `OneToOneField` = "au plus un" (1 réservation → 1 paiement). Pour les **notes**, il fallait 2 notes possibles par réservation (passager ET conducteur), donc `ForeignKey` + contrainte d'unicité `(réservation, noté_par)` : au plus **une note par personne et par réservation**. C'est le piège que le test 8 a révélé ! |
| **Simulation du paiement externe** | Le cahier des charges impose un paiement via Wave/Orange. Sans les vraies API (payantes, réservées à la production), on **simule** l'appel : le système génère une référence unique (`TC-9-B115BD57`), comme le ferait un serveur Wave. L'intégration réelle (asynchrone avec Celery, recommandée par le cahier des charges) sera documentée à la fin du projet. |
| **Règles métier de fin de trajet** | Paiement : réservation **acceptée** + trajet **terminé** + pas déjà payé + méthode valide (wave/orange) → montant = prix du trajet. Notation : passager ou conducteur, trajet terminé, une note par personne. Signalement : passager **accepté**, trajet en cours ou terminé. |
| **Montant automatique** | Le passager ne saisit PAS le montant : il est calculé par le système (`reservation.trip.price_per_seat`) — impossible de payer un autre montant. |

### 📝 Ce qui a été créé

**1. Application `payments`** : modèle `Payment` (réservation OneToOne, méthode Wave/Orange, montant, statut, référence externe, `paid_at`) + 2 views :
- `POST /api/reservations/<id>/payments/` : le passager paie (avec les règles ci-dessus) → `201` avec la référence
- `GET /api/payments/` : paiements où je suis passager **ou** conducteur

**2. `reservations` — modèle `Rating`** : note 1-5, commentaire, qui a noté + contrainte d'unicité par personne.

**3. `reservations` — modèle `Report`** : signalement (motif : conduite dangereuse, harcèlement, fraude, autre), description, `resolved` (sera utilisé par le modérateur à l'étape 8).

**4. Views** : `POST /api/reservations/<id>/rating/` (notation) et `POST /api/trips/<id>/reports/` (signalement).

**5. Admin** : Paiements (filtres méthode/statut), Notes, Signalements (filtres motif/traité).

### 🐛 Le piège de conception corrigé
Au départ, `Rating.reservation` était en `OneToOneField` : une seule note par réservation. Mais le cahier des charges veut que **passagers ET conducteurs** notent → 2 notes par réservation. Correction : `ForeignKey` + `UniqueConstraint(reservation, rated_by)`. C'est exactement pour ça qu'on teste !

### ✅ Résultat validé (cycle de fin de trajet complet)
| Test | Résultat |
|---|---|
| Payer avant la fin du trajet | `400` ✅ |
| Un tiers paie à la place du passager | `403` ✅ |
| Payer après le trajet (wave) | `201` · 2500 FCFA · `paid` · réf `TC-9-B115BD57` ✅ |
| Re-payer | `400` déjà payé ✅ |
| Méthode invalide (visa) | `400` ✅ |
| Passager note 5/5 | `201` ✅ |
| Passager re-note | `400` ✅ |
| Conductrice note 4/5 | `201` (après correction !) ✅ |
| Personne non concernée note | `403` ✅ |
| Non-passager signale un incident | `403` ✅ |
| Passager accepté signale (conduite dangereuse) | `201` ✅ |
| Conductrice voit les paiements reçus | `200` · 1 paiement · 2500 FCFA ✅ |

### 🔧 À tester toi-même

```bash
# Payer (passager, trajet terminé) — méthode: wave ou orange
curl -X POST http://127.0.0.1:8000/api/reservations/RID/payments/ -H "Content-Type: application/json" -H "Authorization: Token XXX" -d '{"method":"wave"}'

# Noter (passager ou conducteur, trajet terminé)
curl -X POST http://127.0.0.1:8000/api/reservations/RID/rating/ -H "Content-Type: application/json" -H "Authorization: Token XXX" -d '{"rating":5,"comment":"Excellent trajet !"}'

# Signaler un incident (passager accepté)
curl -X POST http://127.0.0.1:8000/api/trips/ID/reports/ -H "Content-Type: application/json" -H "Authorization: Token XXX" -d '{"reason":"dangerous_driving","description":"Excès de vitesse"}'
```

---

## ÉTAPE 8 — La modération : alertes automatiques et suspension ✅ FAIT

### 🧠 Les concepts à comprendre

| Concept | Explication simple |
|---|---|
| **Signal Django (signals)** | Une **alarme automatique** du framework : `post_save` se déclenche à chaque création d'un `Report` → notre fonction branchée crée alors une `ModerationAlert`. C'est exactement "l'alerte automatique au modérateur" du cahier des charges, SANS modifier le code du signalement. ⚠️ Les signaux ne s'appliquent qu'aux **nouveaux** objets : les signalements créés avant l'app `moderation` ont nécessité un **rattrapage** (backfill) à la main. |
| **Permission personnalisée** | `IsModerator(BasePermission)` : une garde faite maison — l'utilisateur doit être connecté **et** avoir `is_moderator=True`. On l'utilise comme les permissions intégrées : `permission_classes = [IsModerator]`. |
| **Suspension temporaire** | 2 effets : `is_active=False` → DRF refuse **tous** ses tokens (401), et le login renvoie `403` avec la date de fin (`suspended_until`). La réactivation automatique se fait via la commande `python manage.py lift_suspensions` (dans la vraie vie : une tâche planifiée Celery, comme le recommande le cahier des charges). |
| **Relation `<<extend>>` (UML)** | Suspendre **étend** examiner : on ne peut clôturer un signalement qu'après l'avoir examiné (`is_read`), et la suspension est réservée au modérateur qui gère le dossier. |

### 📝 Ce qui a été créé

**1. `users`** : 2 nouveaux champs sur `CustomUser` — `is_moderator` (booléen) et `suspended_until` (date) + affichage dans l'admin + **blocage du login** avec message explicite.

**2. Application `moderation`** :
- `ModerationAlert` : `report` (OneToOne), `is_read`, `created_at`
- `signals.py` : l'alerte automatique branchée sur la création d'un signalement
- `permissions.py` : `IsModerator`
- 5 endpoints : alertes (`GET /api/moderation/alerts/`), examen (`GET .../reports/<id>/` marque la lecture), clôture (`POST .../reports/<id>/resolve/`), suspension (`POST .../users/<id>/suspend/` avec `days` 1-30), réactivation (`POST .../users/<id>/reinstate/`)
- Commande de maintenance `lift_suspensions` : réactive les comptes dont la suspension a expiré

### ✅ Résultat validé (parcours complet)
| Test | Résultat |
|---|---|
| Alerte automatique à chaque nouveau signalement | ✅ créée non lue |
| Non-modérateur consulte les alertes | `403` ✅ |
| Modérateur liste les alertes (motif, rapporteur, trajet) | `200` ✅ |
| Examen du dossier | `200` + alerte marquée lue ✅ |
| Suspension par un non-modérateur | `403` ✅ |
| Suspension 7 jours | `200` "suspendu jusqu'au 07/08/2026" ✅ |
| Login du compte suspendu | `403` avec la date ✅ |
| Token du compte suspendu | `401` refusé ✅ |
| Re-suspendre un compte déjà suspendu | `400` ✅ |
| Clôturer SANS examen préalable | `400` ✅ |
| Clôturer APRÈS examen | `200` `resolved=True` ✅ |
| Réactivation puis reconnexion | `200` + `200` ✅ |
| Suspendre un modérateur | `400` ✅ |

### 🔧 À tester toi-même

```bash
# 1. Crée un modérateur dans l'admin (utilisateur → coche "Modérateur")
# 2. Les alertes (connecté en tant que modérateur)
curl http://127.0.0.1:8000/api/moderation/alerts/ -H "Authorization: Token MODO_TOKEN"

# 3. Examiner puis clôturer (RID = id du signalement)
curl http://127.0.0.1:8000/api/moderation/reports/RID/ -H "Authorization: Token MODO_TOKEN"
curl -X POST http://127.0.0.1:8000/api/moderation/reports/RID/resolve/ -H "Authorization: Token MODO_TOKEN"

# 4. Suspendre un compte 7 jours (UID = id de l'utilisateur)
curl -X POST http://127.0.0.1:8000/api/moderation/users/UID/suspend/ -H "Content-Type: application/json" -H "Authorization: Token MODO_TOKEN" -d '{"days":7}'

# 5. Réactiver quand la sanction est terminée
curl -X POST http://127.0.0.1:8000/api/moderation/users/UID/reinstate/ -H "Authorization: Token MODO_TOKEN"

# 6. Réactivation automatique des suspensions expirées
python manage.py lift_suspensions
```

---

## ✅ LE BACKEND EST TERMINÉ !

Tous les cas d'utilisation du diagramme UML sont couverts côté API :
comptes, trajets, réservations (anti-abus), GPS, paiement, notation, signalement, modération.

---

## ÉTAPE 9 — Le frontend React : connexion et inscription ✅ FAIT

### 🧠 Les concepts à comprendre

| Concept | Explication simple |
|---|---|
| **React** | Une bibliothèque JavaScript pour construire des interfaces. L'app est un arbre de **composants** (des fonctions qui renvoient du JSX) : `App` contient `LoginPage` ou `HomePage`... |
| **JSX** | Du HTML écrit dans du JavaScript : `return <h1>Bonjour</h1>`. Avec `{variable}`, on injecte une valeur : `<h1>{user.username}</h1>`. |
| **useState** | La **mémoire** d'un composant. `const [username, setUsername] = useState('')` : quand `setUsername(...)` change la valeur, React **redessine** le composant. Toute l'interactivité repose là-dessus. |
| **Props** | Les "paramètres" passés d'un composant parent à un enfant : `<LoginPage onAuth={handleAuth} />` → dans LoginPage, `onAuth` est une prop (ici, une fonction à appeler quand la connexion réussit). |
| **localStorage** | La petite **mémoire du navigateur** qui survit au rechargement : on y stocke le token + l'utilisateur. Au prochain chargement, React lit le localStorage et affiche direct la page d'accueil (pas besoin de se reconnecter). |
| **fetch** | La fonction JavaScript pour appeler l'API (le curl du navigateur). `request()` dans `api.js` gère les en-têtes JSON, transforme les réponses en erreurs lisibles en français. |
| **Proxy Vite** | `vite.config.js` : `'/api': 'http://127.0.0.1:8000'`. Le navigateur appelle `localhost:5173/api/...` et Vite transmet à Django → **aucun CORS à gérer en développement**. |
| **`event.preventDefault()`** | Dans un formulaire HTML, le rechargement automatique de la page ; on l'annule pour laisser React gérer l'envoi. |

### 📝 Ce qui a été créé

```
frontend/
├── vite.config.js     ← le proxy vers Django (5173 → 8000)
├── index.html         ← le point d'entrée (titre "TrajetCampus")
└── src/
    ├── main.jsx       ← le démarrage de l'app (généré par Vite)
    ├── index.css      ← le style épuré (cartes, boutons, couleurs)
    ├── api.js         ← LE carnet d'adresses : login(), register()
    ├── App.jsx        ← le chef d'orchestre : quel écran montrer ?
    └── pages/
        ├── LoginPage.jsx    ← formulaire de connexion
        ├── RegisterPage.jsx ← formulaire d'inscription
        └── HomePage.jsx     ← page d'accueil (infos + déconnexion)
```

Le flux de connexion : le formulaire envoie le login → `api.js` appelle `/api/auth/login/` (via le proxy) → Django répond avec le token → `App.handleAuth` stocke token + utilisateur dans le localStorage → `setToken` déclenche le redessin → `HomePage` s'affiche. Déconnexion = on vide le localStorage.

### ✅ Résultat validé (test de bout en bout)
| Test | Résultat |
|---|---|
| Vite répond sur `localhost:5173` | `200` ✅ |
| Proxy : `GET /api/trips/` via Vite | `200` ✅ |
| Proxy : `POST /api/auth/login/` (Fatou) | token + utilisateur reçus ✅ |

### 🔧 À tester toi-même — lancer les 2 serveurs

**Terminal 1 — le backend :**
```bash
cd /home/dieye_dev/Documents/UML/Projet_Covoiturage/TrajetCampus/backend
source .venv/bin/activate
python manage.py runserver
```

**Terminal 2 — le frontend :**
```bash
cd /home/dieye_dev/Documents/UML/Projet_Covoiturage/TrajetCampus/frontend
npm run dev
```

Ouvre **http://localhost:5173** dans le navigateur :
1. Connecte-toi avec **Fatou** / **Secret12345** (ou crée un compte via "Créer un compte")
2. Tu arrives sur la page d'accueil avec tes infos (rôle, carte, téléphone)
3. Bouton "Se déconnecter" → retour à la connexion

---

## ÉTAPE 10 — La recherche et la publication de trajets ✅ FAIT

### 🧠 Les concepts à comprendre

| Concept | Explication simple |
|---|---|
| **useEffect** | "Fais ça au chargement" : `useEffect(() => { loadTrips() }, [])` charge la liste **automatiquement** à l'ouverture de l'écran. Le `[]` = une seule fois (sans lui, ça rechargerait en boucle !). |
| **`.map()`** | La boucle de React : `trips.map(trip => <TripCard key={trip.id} trip={trip} />)` transforme le tableau de trajets en une liste de cartes. Le `key` permet à React d'identifier chaque carte (obligatoire !). |
| **Recherche côté serveur** | Les filtres ne trient pas la liste affichée : ils reconstruisent l'URL `?departure_region=Dakar` et **re-appellent Django**, qui ne renvoie que les résultats correspondants. C'est plus propre et déjà paginé. |
| **`URLSearchParams`** | La fonction JS qui construit proprement la partie `?...` de l'URL. |
| **Formulaire contrôlé** | Chaque champ du formulaire est lié au `useState` (`value={form.departure_region}` + `onChange`) : React est l'unique source de vérité du formulaire. |
| **`datetime-local`** | Le champ HTML de date/heure locale — Vite/Django convertissent automatiquement en format ISO. |
| **État "réservé"** | `reservedIds` (un tableau d'ids) : dès qu'une demande est envoyée, le bouton devient "Demande envoyée ✓" et se désactive (l'unicité côté Django fait barrage de toute façon). |

### 📝 Ce qui a été créé

```
frontend/src/
├── regions.js            ← les 14 régions du Sénégal (utilisées par la recherche ET le formulaire)
├── components/
│   └── TripCard.jsx      ← la carte d'un trajet (route, heure, places, prix, bouton Réserver)
└── pages/
    └── TripsPage.jsx     ← LA page principale : recherche + liste + publication
```

**Le flux de `TripsPage` :**
1. Ouverture de l'écran → `useEffect` → `GET /api/trips/` → les cartes s'affichent
2. Recherche : choix départ/arrivée → `GET /api/trips/?departure_region=...` → nouvelle liste
3. "Réserver" → `POST /api/trips/<id>/reservations/` → message "Demande envoyée à ..." + bouton désactivé
4. "＋ Publier un trajet" → formulaire (régions, date/heure, places, prix) → `POST /api/trips/` → la liste se recharge avec le nouveau trajet

### 🐛 Le piège corrigé : l'ordre du spread dans `api.js`

Le bug : `{ headers: { 'Content-Type': ... }, ...options }` — quand `options` contenait
`headers: { Authorization: ... }` (publication, réservation), le spread **écrasait** tout
l'objet headers → le `Content-Type` disparaissait → Django refusait le JSON (`415`).

La correction : `...options` d'abord, puis `headers` qui **fusionne** le `Content-Type`
avec les en-têtes fournis :
```js
headers: {
  'Content-Type': 'application/json',
  ...(options.headers || {}),
}
```
Leçon : l'ordre des objets dans un spread compte — le dernier écrase les précédents !

### ✅ Résultat validé (test de bout en bout via le proxy)
| Test | Résultat |
|---|---|
| Page web `localhost:5173` | `200` ✅ |
| Recherche `?departure_region=Dakar` via proxy | 3 trajets (Dakar→Thiès, Dakar→Saint-Louis, Dakar→Kaolack) ✅ |
| Réserver un trajet déjà réservé | `400` "Vous avez déjà une réservation" ✅ |
| Réserver un trajet non planifiable | `404` ✅ |
| Publier un trajet (Louga→Dakar, 3000 FCFA) | `201` ✅ |
| Réserver le nouveau trajet | `201` pending ✅ |

### 🔧 À tester toi-même (2 terminaux)

```bash
# Terminal 1 — backend
cd /home/dieye_dev/Documents/UML/Projet_Covoiturage/TrajetCampus/backend && source .venv/bin/activate && python manage.py runserver

# Terminal 2 — frontend
cd /home/dieye_dev/Documents/UML/Projet_Covoiturage/TrajetCampus/frontend && npm run dev
```

Ouvre **http://localhost:5173** :
1. Connecte-toi avec **Fatou** / **Secret12345** → tu arrives directement sur la liste des trajets
2. Joue avec la **recherche** (ex: départ Dakar)
3. Clique **"＋ Publier un trajet"** → publie un trajet → il apparaît dans la liste
4. **"Réserver"** → message de confirmation (teste avec un compte qui n'est pas le conducteur)

---

## ÉTAPE 11 — Le tableau de bord : réservations, GPS et paiements ✅ FAIT

### 🧠 Les concepts à comprendre

| Concept | Explication simple |
|---|---|
| **`Promise.all`** | Exécute plusieurs requêtes en parallèle et n'attend que la plus lente : `const [res, pays] = await Promise.all([fetchReservations(token), fetchPayments(token)])`. Plus rapide que deux `await` à la suite. |
| **Rendu conditionnel** | Le bouton affiché dépend du rôle ET du statut : une réservation `pending` → "Accepter/Refuser" **seulement si je suis le conducteur** (`res.driver_username === user.username`), "Annuler" si je suis le passager ; `accepted` + trajet `scheduled` → "▶ Démarrer" ; trajet `ongoing` → partage GPS ; trajet `finished` → paiement. |
| **Faire remonter les infos du trajet** | Le front n'a pas le détail du trajet dans sa liste → on **enrichit le serializer** côté Django : `trip_status = serializers.CharField(source="trip.status")` ajoute le statut (et les régions, l'heure) directement dans la réponse des réservations. |
| **Composant `Navbar`** | La barre de navigation commune aux deux pages (recherche / tableau de bord). `active` + `onNavigate` : la page active décide quels onglets sont sélectionnés. |

### 📝 Ce qui a été créé/modifié

```
backend/reservations/serializers.py   ← + trip_status, trip_departure, trip_arrival, trip_time
frontend/src/api.js                   ← + fetchReservations, updateReservation, startTrip,
                                        finishTrip, shareLocation, fetchLatestLocation, fetchPayments
frontend/src/components/Navbar.jsx    ← nouveau : barre de navigation à 2 onglets
frontend/src/pages/DashboardPage.jsx  ← nouveau : réservations + actions + GPS + paiements
frontend/src/App.jsx                  ← + état view ('trips' / 'dashboard') pour naviguer
frontend/src/pages/TripsPage.jsx      ← navbar remplacée par le composant Navbar
```

**Le flux du tableau de bord :**
1. Ouverture de l'écran → `Promise.all` → réservations + paiements chargés ensemble
2. Conducteur : accepter / refuser une demande (la règle anti-abus s'applique encore côté Django !)
3. Trajet `scheduled` → "▶ Démarrer le trajet" → statut `ongoing`
4. Trajet `ongoing` → "📡 Partager ma position" (latitude/longitude) pour le conducteur,
   "📍 Voir la position du conducteur" pour le passager accepté
5. "⏹ Terminer le trajet" → statut `finished` → le passager peut payer
6. Paiements : liste + total reçu (conducteur) / total payé (passager)

### ✅ Résultat validé (test de bout en bout via le proxy)

| Test | Résultat |
|---|---|
| `GET /api/reservations/` (Fatou) | 10 réservations avec `trip_status`, régions, heure ✅ |
| Accepter une réservation d'Aminata (qui a annulé il y a < 30 jours) | `400` règle anti-abus — la protection continue de marcher côté API ✅ |
| Position GPS d'un passager non accepté | `403` "Seul le conducteur ou un passager accepté..." ✅ |
| Paiement sur réservation non acceptée | `400` "Seule une réservation acceptée peut être payée." ✅ |
| Flux complet (Ibrahima) : réserve → acceptée → démarrer → GPS partagé → suivi passager → terminer → payer | `accepted → ongoing → 15.1,-16.5 → finished → 2000 FCFA #TC-12-...` ✅ |
| Dashboard paiements (Ibrahima) | 2 paiements, avec nom du conducteur ✅ |
| Build Vite | `✓ built` sans erreur ✅ |

### 🔧 À tester toi-même (2 terminaux)

```bash
# Terminal 1 — backend
cd /home/dieye_dev/Documents/UML/Projet_Covoiturage/TrajetCampus/backend && source .venv/bin/activate && python manage.py runserver

# Terminal 2 — frontend
cd /home/dieye_dev/Documents/UML/Projet_Covoiturage/TrajetCampus/frontend && npm run dev
```

Ouvre **http://localhost:5173** :
1. Connecte-toi avec **Fatou** / **Secret12345** → clique **"🎛️ Mon tableau de bord"**
2. Tu vois ses 10 réservations : les boutons **Accepter/Refuser** n'apparaissent que sur les demandes `pending`
3. Connecte-toi avec **Ibrahima** → son tableau de bord affiche ses réservations en tant que passager et ses paiements
4. Avec **Aminata** : ses demandes ne peuvent plus être acceptées (règle anti-abus) — c'est voulu !

---

## ÉTAPE 12 — La notation : étoiles et note moyenne ✅ FAIT

### 🧠 Les concepts à comprendre

| Concept | Explication simple |
|---|---|
| **`SerializerMethodField`** | Un champ **calculé à la volée** côté serveur : il n'est pas stocké en base, mais Django le fabrique dans chaque réponse (ex. `driver_rating` sur chaque trajet). |
| **`aggregate()` + `Avg()`** | « Calcule la moyenne **dans la base** » : une seule requête SQL, fiable pour tout le monde. On ne calcule jamais une moyenne côté front (chacun aurait un résultat différent selon les données qu'il possède). |
| **Note reçue vs note donnée** | `Rating.rated_by` = celui qui **note**. La note reçue par un utilisateur, c'est la note donnée par **l'autre partie** du trajet : `exclude(rated_by=moi)`. |
| **`rated_by_me`** | Le serveur dit au front « tu as déjà noté cette réservation ? » — impossible à deviner côté client (l'autre partie aurait pu noter aussi). |
| **Étoiles cliquables** | Deux états : `hover` (souris dessus) et `value` (note choisie). `n <= (hover \|\| value)` allume l'étoile n en orange. Au clic → envoi de la note. |

### 📝 Ce qui a été créé/modifié

```
backend/trips/serializers.py          ← + driver_rating (moyenne + nombre d'avis) sur chaque trajet
backend/reservations/serializers.py   ← + rated_by_me (ai-je déjà noté cette réservation ?)
backend/reservations/views.py         ← + UserRatingView : GET /api/users/<id>/rating/ (ma moyenne reçue)
backend/reservations/urls.py          ← + route users/<int:user_id>/rating/
frontend/src/api.js                   ← + createRating, fetchUserRating
frontend/src/components/TripCard.jsx  ← + badge "⭐ 4.8 (12)" ou "⭐ nouveau" sur chaque carte
frontend/src/pages/DashboardPage.jsx  ← + composant StarPicker, bloc "⭐ Noter" (trajet fini), ma moyenne
frontend/src/index.css                ← + étoiles, badge de note, bloc de notation
```

**Le flux de notation :**
1. Chaque carte de trajet affiche la **moyenne du conducteur** (calculée en base, toujours à jour)
2. Trajet terminé + réservation acceptée → bouton **"⭐ Noter"** (sauf si `rated_by_me`)
3. Clic → étoiles 1 à 5 (hover orange) + commentaire optionnel → `POST /api/reservations/<id>/rating/`
4. Le serveur refuse : pas concerné (403), réservation non acceptée, trajet pas fini, ou **déjà noté** (400)
5. En haut du tableau de bord : **"⭐ Ma note moyenne"** (les notes reçues de mes passagers/conducteurs)

### ✅ Résultat validé (test de bout en bout via le proxy)

| Test | Résultat |
|---|---|
| `GET /api/trips/` | chaque trajet a `driver_rating: {average, count}` ✅ |
| Carte du trajet 6 (Dakar→Thiès) | `⭐ 5.0 (3 avis)` ✅ |
| `rated_by_me` pour Ibrahima sur réservations finies | `False` ✅ |
| Ibrahima note Fatou 5/5 + commentaire | `201` « Super conductrice, ponctuelle ! » ✅ |
| Re-noter la même réservation | `400` « Vous avez déjà noté cette réservation. » ✅ |
| `GET /api/users/<id>/rating/` (Fatou) | `{average: 5.0, count: 3}` ✅ |
| Build Vite | `✓ built` sans erreur ✅ |

### 🔧 À tester toi-même (2 terminaux)

```bash
# Terminal 1 — backend
cd /home/dieye_dev/Documents/UML/Projet_Covoiturage/TrajetCampus/backend && source .venv/bin/activate && python manage.py runserver

# Terminal 2 — frontend
cd /home/dieye_dev/Documents/UML/Projet_Covoiturage/TrajetCampus/frontend && npm run dev
```

Ouvre **http://localhost:5173** :
1. Les cartes de trajets affichent maintenant **"⭐ 5.0 (3 avis)"** pour les trajets de Fatou
2. Connecte-toi avec **Ibrahima** → tableau de bord : en haut **"⭐ Ma note moyenne"**, et sur le trajet Louga→Thiès terminé → **"⭐ Noter"** → choisis des étoiles → envoie
3. Reconnecte-toi en tant que **Fatou** → sa moyenne a peut-être changé, et tu peux noter Ibrahima sur ce même trajet (chacun note l'autre !)

### 🐛 Le piège de cette étape (deux fois !)

1. **Import oublié** : en ajoutant `Rating` à l'import de `serializers.py`, j'ai oublié `Report` (utilisé plus bas par `ReportSerializer`) → `NameError` au démarrage de Django. Leçon : quand on modifie un import, on vérifie **tout** ce que le fichier utilise.
2. **Les serveurs orphelins** : plusieurs Vite/Django de séances précédentes tournaient encore → port 8000 occupé (le nouveau Django n'a pas pu démarrer) et un vieux Vite sans backend renvoyait `502`. Leçon : avant de tester, vérifier qu'un seul serveur de chaque type écoute (`ss -tlnp`). Le `502` du proxy = le backend est mort, pas forcément le front !

---

## ÉTAPE 13 — Le signalement d'incident ✅ FAIT

### 🧠 Les concepts à comprendre

| Concept | Explication simple |
|---|---|
| **Boutons radio** | Plusieurs choix, un seul sélectionnable : chaque `<input type="radio">` a une `value`, et le state `reportForm.reason` ne garde que la valeur cochée. |
| **Le serveur fait la suite** | Le front envoie juste `POST /api/trips/<id>/reports/`. Le signal `post_save` de l'étape 8 crée **tout seul** l'alerte de modération : zéro logique côté client. |
| **État "Signalé ✓"** | Un tableau `reportedTripIds` : dès qu'un signalement part, le bouton de ce trajet devient un texte "🛡️ Incident signalé" — pas de spam. |
| **403 côté serveur** | Le front cache le bouton aux non-passagers, mais le serveur vérifie quand même (`is_passenger` + trajet ongoing/finished) : la sécurité ne dépend jamais du front. |

### 📝 Ce qui a été créé/modifié

```
frontend/src/api.js                   ← + createReport(tripId, reason, description, token)
frontend/src/pages/DashboardPage.jsx  ← + REPORT_REASONS (4 motifs), bouton "⚠️ Signaler un incident",
                                        formulaire radio + description, état "Incident signalé"
frontend/src/index.css                ← + radios en pastilles cliquables, badge "🛡️ signalé"
```

**Le flux de signalement :**
1. Réservation **acceptée** + trajet **en cours ou terminé** → bouton "⚠️ Signaler un incident"
2. Choix du motif (conduite dangereuse / harcèlement / fraude / autre) + description optionnelle
3. `POST /api/trips/<id>/reports/` → `201` → l'alerte apparaît côté modérateur
4. Le bouton est remplacé par "🛡️ Incident signalé — le modérateur va examiner"

### ✅ Résultat validé (test de bout en bout via le proxy)

| Test | Résultat |
|---|---|
| Ibrahima (passager accepté, trajet 17 terminé) signale "harassment" | `201` + alerte créée ✅ |
| Signalement sur un trajet avec réservation `pending` | `403` « Seul un passager accepté peut signaler un incident. » ✅ |
| Alertes côté modérateur (`modo`) | l'alerte apparaît avec motif, description, signaleur, trajet ✅ |
| Build Vite | `✓ built` sans erreur ✅ |

> Note : le mot de passe du compte `modo` a été réinitialisé à **`Modo12345!`** (il avait été perdu).

### 🔧 À tester toi-même (2 terminaux)

```bash
# Terminal 1 — backend
cd /home/dieye_dev/Documents/UML/Projet_Covoiturage/TrajetCampus/backend && source .venv/bin/activate && python manage.py runserver

# Terminal 2 — frontend
cd /home/dieye_dev/Documents/UML/Projet_Covoiturage/TrajetCampus/frontend && npm run dev
```

Ouvre **http://localhost:5173** :
1. Connecte-toi avec **Ibrahima** / **Test12345!** → tableau de bord → trajet Louga→Thiès terminé → **"⚠️ Signaler un incident"** → choisis un motif → envoie → le bouton devient "🛡️ Incident signalé"
2. Connecte-toi avec **modo** / **Modo12345!** → `http://127.0.0.1:8000/admin` ou l'API `/api/moderation/alerts/` pour voir l'alerte
3. Regarde aussi le badge ⭐ des cartes et la notation si tu veux revoir l'étape 12

---

## ÉTAPE 14 — Le dashboard modérateur ✅ FAIT

### 🧠 Les concepts à comprendre

| Concept | Explication simple |
|---|---|
| **Exposer `is_moderator`** | Le serializer utilisateur renvoie maintenant `is_moderator` → le front n'affiche l'onglet "🛡️ Modération" **que** pour les modos. Mais la vraie protection reste côté serveur : `IsModerator` renvoie `403` à tout autre compte. |
| **Panneau détail** | `selectedId` = quelle alerte est ouverte ; au clic on fait un `GET` du détail qui alimente le panneau de droite. |
| **Action = POST puis rechargement** | Clôturer / suspendre / réactiver font leur `POST`, puis on **recharge le détail + la liste** : l'écran reflète toujours l'état réel du serveur. |
| **`reporter_id` et `reporter_suspended`** | Ajoutés au serializer : le front a besoin de l'**id du signaleur** pour le suspendre, et de sa date de suspension pour afficher "Suspendre" ou "Réactiver". |

### 📝 Ce qui a été créé/modifié

```
backend/users/serializers.py         ← + is_moderator dans UserSerializer
backend/moderation/serializers.py    ← + reporter_id, reporter_suspended (Alert + Detail)
frontend/src/api.js                  ← + fetchAlerts, fetchReport, resolveReport, suspendUser, reinstateUser
frontend/src/components/Navbar.jsx   ← + onglet "🛡️ Modération" si is_moderator
frontend/src/pages/ModerationPage.jsx ← nouveau : liste d'alertes + panneau détail + actions
frontend/src/App.jsx                 ← + view 'moderation' (réservée aux modos)
frontend/src/index.css               ← + liste d'alertes, pastille non lue, panneau détail
```

**Le flux du modérateur :**
1. Onglet "🛡️ Modération" → liste des alertes (non lues en premier, avec pastille rouge)
2. Clic sur une alerte → détail : motif, description, signaleur, trajet, conducteur
3. **"✔ Clôturer le signalement"** → le signalement est marqué traité
4. **"⛔ Suspendre le compte (7 jours)"** → l'utilisateur ne peut plus se connecter (message avec la date)
5. **"✅ Réactiver le compte"** → accès rétabli immédiatement

### ✅ Résultat validé (test de bout en bout via le proxy)

| Test | Résultat |
|---|---|
| Login `modo` | `is_moderator: true` dans la réponse ✅ |
| Login `Fatou` | `is_moderator: false` ✅ |
| `GET /api/moderation/alerts/` (modo) | 5 alertes avec `reporter_id` ✅ |
| `GET /api/moderation/alerts/` (Fatou) | `403` « Réservé au modérateur. » ✅ |
| Détail signalement 4 | harcèlement, description, Ibrahima (id 6), trajet ✅ |
| Clôturer le signalement 4 | `resolved: true`, `is_read: true` ✅ |
| Suspendre Ibrahima | « suspendu jusqu'au 07/08/2026 » ✅ |
| Login d'Ibrahima pendant la suspension | `403` « Compte suspendu... jusqu'au 07/08/2026 » ✅ |
| Réactiver Ibrahima | « Compte réactivé » + login `200` ✅ |
| Build Vite | `✓ built` sans erreur ✅ |

### 🔧 À tester toi-même (2 terminaux)

```bash
# Terminal 1 — backend
cd /home/dieye_dev/Documents/UML/Projet_Covoiturage/TrajetCampus/backend && source .venv/bin/activate && python manage.py runserver

# Terminal 2 — frontend
cd /home/dieye_dev/Documents/UML/Projet_Covoiturage/TrajetCampus/frontend && npm run dev
```

Ouvre **http://localhost:5173** :
1. Connecte-toi avec **modo** / **Modo12345!** → l'onglet **"🛡️ Modération"** apparaît dans la navbar
2. Clique une alerte → panneau de détail à droite → **"✔ Clôturer le signalement"**
3. Sur un signalement non clôturé → **"⛔ Suspendre le compte"** → déconnecte-toi → essaie de te connecter avec le compte suspendu → message d'erreur avec la date
4. Reconnecte-toi en modo → **"✅ Réactiver le compte"**
5. Connecte-toi avec **Fatou** → l'onglet Modération n'apparaît **pas** (et l'API répondrait 403)

---

## ✅ RÉVISION GÉNÉRALE — le parcours complet de A à Z

### 🧠 Le but

Vérifier que **toutes** les briques (étapes 1 à 14) fonctionnent ensemble, comme un utilisateur réel
le ferait, et corriger les détails d'affichage imparfaits.

### ✅ Le grand test (deux comptes créés pour l'occasion : `Awa` conducteur, `Ousmane` passager)

| # | Étape du parcours | Résultat |
|---|---|---|
| 1 | Inscription des deux comptes | `201` + token ✅ |
| 2 | `Awa` publie un trajet Dakar→Thiès | `201` ✅ |
| 3 | `Ousmane` réserve | `201` pending ✅ |
| 4 | `Awa` accepte | `accepted` ✅ |
| 5 | `Awa` démarre le trajet | `ongoing` ✅ |
| 6 | `Awa` partage sa position GPS | `14.73, -17.49` ✅ |
| 7 | `Ousmane` suit la position | dernière position ✅ |
| 8 | `Awa` termine | `finished` ✅ |
| 9 | `Ousmane` paie (wave) | `1500 FCFA` + référence ✅ |
| 10 | `Ousmane` note `Awa` 4/5 | `201` ✅ |
| 11 | `Awa` note `Ousmane` 5/5 | `201` ✅ |
| 12 | `Ousmane` signale un incident | `201` + alerte créée ✅ |
| 13 | Note moyenne de `Awa` | `⭐ 4.0 (1 avis)` ✅ |
| 14 | Alerte visible côté modérateur | première de la liste ✅ |

Vérifications complémentaires :
- `python manage.py check` → aucun problème ; aucune migration manquante ✅
- La recherche de trajets ne montre que les trajets `scheduled` (un trajet terminé disparaît, c'est voulu) ✅
- Les comptes de test `Awa` / `Ousmane` (mot de passe `Test12345!`) restent en base pour tes essais ✅

### 🐛 Le seul défaut trouvé (et corrigé)

**« Total reçu : 0 FCFA » chez un passager** — la ligne de total était affichée pour tout le monde
avec le calcul « reçu ». Corrigé : le tableau de bord affiche maintenant **« Total reçu »** pour un
conducteur et **« Total payé »** pour un passager (les deux peuvent même coexister si on est les deux).

---

## 🎨 Charte graphique « Terracotta & Crème »

La refonte visuelle finale a remplacé l'ancien thème (vert/violet) par une palette chaleureuse,
sans mode sombre forcé et sans blanc pur en fond.

| Rôle | Couleur | Usage |
|---|---|---|
| Fond global | `#FBF9F5` (crème) | fond de toutes les pages |
| Texte principal | `#2C2A29` | textes, titres |
| **Boutons / CTA** | `#C85A32` (terracotta) | boutons principaux, prix, onglet actif |
| **Accents / Badges** | `#2F5D62` (bleu pétrole) | liens, flèches, focus, badges réussite |
| Conteneurs / Cartes | `#FFFDF9` + bordure `#EFECE6` | cartes et conteneurs, **aucune ombre** |

Le CSS utilise des **variables** (`:root`) : changer une couleur modifie toute l'application.
Les variantes claires des accents (`--primary-tint`, `--accent-tint`) servent aux fonds de badges
(« En attente », « Acceptée », « Résolue »...).

### 🖼️ Fonds d'écran des pages

Les images (placées dans `frontend/src/assets/`) sont **bundlées par Vite** (url() dans le CSS →
fichiers hachés dans `dist/assets/`). Chaque page applique son fond via une classe dédiée,
toujours avec un **calque crème semi-transparent** (88 %) par-dessus l'image pour garder le
texte ultra-lisible :

| Image (asset) | Page |
|---|---|
| `login-bg.jpg` | Connexion (LoginPage) |
| `trips-bg.jpg` | Recherche de trajets (TripsPage) |
| `dashboard-bg.jpg` | Mes réservations (DashboardPage) |
| `profile-bg.jpg` | Mon profil (ProfilePage) |
| `moderation-bg.jpg` | Espace Modérateur (ModerationPage) |
| `publish-bg.jpg` | Formulaire de publication (carte "Publier un trajet") |
| `hero-isep.jpg` | Bannière "Hero" en haut de la page d'accueil (photo ISEP) |

Le calque crème est réalisé avec deux fonds empilés :
`linear-gradient(rgba(251, 249, 245, 0.88), ...)` + `url(...) center / cover`.
L'effet `fixed` (image fixe au défilement) n'est appliqué qu'à partir de **1024px** :
les navigateurs mobiles ne le gèrent pas bien, ils gardent le défilement normal.

### 📱 Responsivité (Mobile First)Le CSS est écrit **mobile d'abord** : le style de base cible les smartphones, puis deux paliers
élargissent la mise en page :

| Paliers | Changements |
|---|---|
| **Base (smartphone)** | navbar en 2 rangées (marque + connexion, onglets dessous), formulaires et listes en 1 colonne, grille GPS en colonne, boutons pleine largeur |
| **≥ 640px (tablette)** | navbar sur 1 rangée, recherche en ligne, trajets en 2 colonnes, détail de réservation en ligne, modération en 2 colonnes |
| **≥ 1024px (écran large)** | trajets en colonnes adaptatives (`auto-fill`), panneau modération 380px + contenu |

Champs de formulaire en `16px` minimum (pas de zoom intempestif iOS), conteneurs sans débordement
(`min-width: 0`, `flex-wrap`, `overflow-x` sur les onglets), et favicon remplacé par une voiture
aux couleurs de la charte.

---

## 🪪 ÉTAPE 16 — Vérification des cartes étudiant ✅ FAIT

### 🧠 Les concepts à comprendre

| Concept | Explication simple |
|---|---|
| **`ImageField`** | Le fichier est stocké sur le disque (`MEDIA_ROOT` = `backend/media/`) et exposé par une URL (`MEDIA_URL` = `/media/`). Django gère le nom de fichier, la validation d'image et la suppression du remplacement. |
| **`multipart/form-data`** | JSON ne peut pas transporter un fichier → le navigateur envoie le formulaire « en plusieurs parties » (`FormData`) avec une frontière (`boundary`). Le front ne fixe **pas** `Content-Type` : le navigateur le fait automatiquement. |
| **`PermissionDenied` → 403** | La règle métier est **imposée côté serveur** (`perform_create`) : le front affiche un avertissement, mais même un appel API direct ne peut pas publier sans carte vérifiée. |
| **Toggle** | `is_verified = not is_verified` : un seul endpoint retourne la nouvelle valeur. |

### 📝 Ce qui a été créé/modifié

```
backend/users/models.py         ← + student_card (ImageField), is_verified (bool, défaut False)
backend/users/migrations/       ← 0003 (les 2 champs)
backend/config/settings.py      ← + MEDIA_URL, MEDIA_ROOT
backend/config/urls.py          ← + serveur des fichiers media (en développement)
backend/users/serializers.py    ← + student_card (inscription), is_verified (login/profil), ProfileUpdateSerializer
backend/users/views.py          ← + ProfileView (GET / PATCH /api/auth/profile/)
backend/users/urls.py           ← + auth/profile/
backend/users/admin.py          ← + is_verified et student_card dans l'admin
backend/moderation/serializers.py ← + UserCardSerializer (liste des comptes pour le modérateur)
backend/moderation/views.py     ← + UserCardListView, UserVerifyToggleView
backend/moderation/urls.py      ← + moderation/users/ et moderation/users/<id>/verify/
backend/trips/views.py          ← règle : publication interdite si is_verified = False (403)
frontend/src/api.js             ← FormData géré + fetchProfile, updateProfile, fetchModerationUsers, toggleVerify
frontend/src/pages/ProfilePage.jsx  ← nouveau : profil, statut, téléversement/remplacement de la carte
frontend/src/pages/ModerationPage.jsx ← + section "Cartes étudiant" (miniature + bouton Vérifier)
frontend/src/pages/TripsPage.jsx ← avertissement clair si non vérifié au clic sur "Publier"
frontend/src/components/Navbar.jsx ← + onglet "👤 Mon profil"
frontend/src/App.jsx            ← + view 'profile' et mise à jour de l'utilisateur
```

**Le flux complet :**
1. L'utilisateur téléverse la photo de sa carte depuis **"👤 Mon profil"** (aperçu avant envoi)
2. Le modérateur voit les comptes dans l'onglet Modération → section **"Cartes étudiant"** → clique sur **"Vérifier"** (ou "Retirer la vérification")
3. Tant que `is_verified` est `False` : le clic sur "＋ Publier un trajet" affiche un **avertissement clair** et l'API renvoie `403`
4. Une fois vérifié : publication possible immédiatement

### ✅ Résultat validé (test de bout en bout via le proxy)

| Test | Résultat |
|---|---|
| Inscription de `Mariama` (sans carte) | `201` ✅ |
| `Mariama` publie un trajet | `403` « Votre carte étudiant n'a pas encore été vérifiée... » ✅ |
| Téléversement de la carte (multipart) | `student_card: /media/student_cards/carte_rev3.png` ✅ |
| Image servie via le proxy | `HTTP 200` ✅ |
| Liste modérateur `GET /moderation/users/` | Mariama avec sa carte, `is_verified: false` ✅ |
| Bascule Vérifier (modo) | `is_verified: true` ✅ |
| `Mariama` publie | `201` ✅ |
| Bascule Retirer (modo) | `is_verified: false` → publication `403` ✅ |
| Build Vite | `✓ built` sans erreur ✅ |

> Les comptes de démonstration `Fatou`, `Awa` et `Mariama` sont marqués **vérifiés** pour garder la démo fluide.
> Les nouveaux champs (`student_card`, `is_verified`) sont aussi visibles dans l'admin Django (`/admin`).

### 🔧 À tester toi-même (2 terminaux)

```bash
# Terminal 1 — backend
cd /home/dieye_dev/Documents/UML/Projet_Covoiturage/TrajetCampus/backend && source .venv/bin/activate && python manage.py runserver

# Terminal 2 — frontend
cd /home/dieye_dev/Documents/UML/Projet_Covoiturage/TrajetCampus/frontend && npm run dev
```

Ouvre **http://localhost:5173** :
1. Connecte-toi avec **Ousmane** / **Test12345!** → onglet **"👤 Mon profil"** → téléverse une image de carte (n'importe quelle photo) → « En attente de vérification »
2. Va sur les trajets → clique **"＋ Publier un trajet"** → l'avertissement s'affiche (et l'API bloquerait de toute façon)
3. Connecte-toi avec **modo** / **Modo12345!** → onglet Modération → section **"Cartes étudiant"** → la carte de Ousmane est visible → **"Vérifier"**
4. Reconnecte-toi avec **Ousmane** → le profil affiche "✅ Carte vérifiée" → il peut publier !

---

## 📚 Règles d'or du projet (d'après le cahier des charges)

1. Backend : Python + Django + Django REST Framework
2. Frontend : React (avec un CSS simple et épuré)
3. Base de données : **SQLite (choix définitif)**
4. Paiement : Wave / Orange Money (systèmes externes)
5. Géolocalisation GPS : suivi en temps réel quand le conducteur démarre un trajet
6. Modération : signalements → alertes → suspension de comptes via Django Admin
