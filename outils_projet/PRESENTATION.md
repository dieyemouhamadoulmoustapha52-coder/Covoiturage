# TrajetCampus — Présentation du projet

## 1. Contexte & problème
- L'ISEP de Dakar accueille des étudiants venant de toute la région (Dakar, Thiès, Rufisque, etc.).
- Les transports publics sont chers, peu adaptés aux horaires de cours, et les covoiturages existants ne sont pas conçus pour le campus.
- **Problème** : comment permettre aux étudiants et enseignants de partager leurs trajets vers le campus, en toute confiance ?

## 2. Solution
**TrajetCampus** : application web de covoiturage dédiée au campus ISEP.
- Les **conducteurs** publient leurs trajets (départ, arrivée, date/heure, places, prix).
- Les **passagers** cherchent, réservent, suivent le trajet en temps réel (GPS) et paient à l'arrivée.
- Les **modérateurs** garantissent la confiance : vérification des cartes étudiant, signalements, suspensions.

## 3. Fonctionnalités (par rôles)

**Tout utilisateur**
- Inscription avec **carte étudiant** + numéro (photo téléversée)
- Recherche de trajets par région (départ/arrivée/date)
- Profil avec carte à vérifier, note moyenne ⭐

**Passager**
- Réservation d'une place (acceptée/refusée par le conducteur)
- Suivi GPS du conducteur pendant le trajet
- Paiement mobile (Wave / Orange Money) à l'arrivée
- Notation du conducteur (étoiles + commentaire)
- Signalement d'un incident (harcèlement, retard, etc.)

**Conducteur**
- Publication de trajets (réservé aux comptes vérifiés)
- Gestion des réservations (accepter/refuser)
- Démarrage/terminaison du trajet, partage GPS
- Tableau de bord : « total reçu », passagers, historique
- Notation des passagers, réponses aux signalements

**Modérateur**
- Vérification des cartes étudiant
- Traitement des alertes (clôturer, suspendre un compte, réactiver)

## 4. Règles métier mises en avant
- 🔒 **Confiance** : impossible de publier un trajet sans carte vérifiée (contrôle serveur).
- 🛡️ **Anti-abus** : un passager qui annule moins de 30 jours après une annulation ne peut plus réserver (403/400 côté API).
- 🚫 **Suspension** : un compte suspendu ne peut plus se connecter.
- 💰 **Paiement** : génération de référence unique, total reçu/dépensé par utilisateur.

## 5. Architecture technique

```
Navigateur (React + Vite, port 5173)
        │  fetch /api/...  (proxy en dev)
        ▼
API REST Django REST Framework (port 8000)
  users | trips | reservations | payments | moderation
        │ ORM
        ▼
Base SQLite
```

- **Backend** : Python, Django 6, Django REST Framework, Pillow (images), tokens DRF.
- **Frontend** : JavaScript, React 18, Vite (démarrage rapide, images bundlées), CSS maison « Terracotta & Crème » (mobile-first, responsive).
- **API** : ~25 endpoints REST (auth, profil, trajets, réservations, GPS, paiements, notations, signalements, modération).
- **Sécurité** : permissions par rôle, contrôles serveur (pas seulement côté interface), fichiers média servis en debug.

## 6. Démo en 3 minutes (script)
1. **Fatou / Secret12345** (conductrice vérifiée) → Recherche : trajets Dakar→ISEP visibles.
2. **Ousmane / Test12345!** (nouveau compte) → Profil : « carte en attente » → il ne peut pas publier (message d'avertissement).
3. **modo / Modo12345!** → Modération : section « Cartes étudiant » → vérifier la carte d'Ousmane.
4. **Ousmane** → publie un trajet → **Fatou** ou **Awa** réserve → trajet démarre → GPS partagé → terminé → paiement → notation ⭐.

## 7. Chiffres clés
- 10 comptes de test (admin, Fatou, modo, Moustapha, Aminata, Ibrahima, Ali, Awa, Ousmane, Mariama)
- Parcours complet testé en 9 étapes pour la vérification des cartes
- 2+ serveurs de test orphelins… et un vrai bug corrigé (Content-Type 415) 💪

## 8. Ce que le projet m'a appris
- Concevoir un backend REST structuré (apps séparées, sérialiseurs, permissions)
- Créer une SPA React communiquant avec l'API (tokens, FormData, proxying)
- Penser sécurité métier : règle anti-abus, vérification de documents, modération
- Déboguer de bout en bout : navigateur ↔ proxy ↔ serveur ↔ base
