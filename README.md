# AfriPay — Back-office Admin (Web)

Application web d'administration (React + Vite) utilisée par l'équipe
conformité d'AfriPay pour valider les dossiers KYC (clients) / KYB
(marchands) et suivre l'activité de la plateforme.

## Prérequis

- Node.js 18+ et npm
- Le backend AfriPay démarré et accessible sur `http://localhost:4000`
  (voir `../backend/README.md`) :
  ```bash
  cd ../backend
  npm run dev
  ```

## Installation

```bash
npm install
```

## Lancer en développement

```bash
npm run dev
```

L'application est servie sur `http://localhost:5173`. Elle appelle l'API sur l'URL définie par la
variable d'environnement `VITE_API_URL` (voir `.env.example` — copier en `.env` et adapter si le
backend tourne ailleurs) ; par défaut `http://localhost:4000`. En production, cette variable doit
pointer vers une URL HTTPS.

## Compte super admin

Créé par `npm run db:init` côté backend (voir `backend/README.md`) : le mot de passe est généré
aléatoirement et affiché **une seule fois** en console à la création (ou fixé via
`ADMIN_SEED_EMAIL`/`ADMIN_SEED_PASSWORD` dans `backend/.env`). Aucun identifiant n'est committé
dans le dépôt. Changez-le dès la première connexion (Profil > Mot de passe).

## Build de production

```bash
npm run build   # sortie dans dist/
npm run preview # pour prévisualiser le build localement
```

## Structure

```
src/
  api/client.js        Client HTTP (fetch) : base URL, token, enveloppe {success,data}
  context/AuthContext.jsx  Session admin (login/logout, vérification du token au chargement)
  components/           Layout (sidebar fixe/responsive + topbar), badges de statut, cartes stat, bannières, filtre par plage de dates, Icon (Font Awesome)
  pages/                Login, Dashboard, Clients (+détail), Marchands (+détail), KYC, KYB, Transactions,
                        Wallets, Recharges, Biométrie, Fraude, Notifications, Internes, AuditLogs
  utils/format.js       Formatage FCFA / dates / pourcentages
```

## Filtre par date

Toutes les listes principales (Clients, Marchands, KYC, KYB, Transactions, Wallets, Recharges,
Biométrie, Notifications, Audit Logs) disposent d'un filtre "Du / Au" (`src/components/DateRangeFilter.jsx`),
en plus de leurs filtres existants (statut, type, recherche). Un bouton "Effacer" apparaît dès qu'une
borne est renseignée.

## Sections du back-office

La sidebar reflète l'organisation complète de l'admin AfriPay : Dashboard, Clients, Marchands, KYC, KYB,
Transactions, Wallets, Recharges, Biométrie, Fraude, Notifications, Utilisateurs internes, Audit Logs.

**Contrôle d'accès par rôle** (le rôle vient du compte admin, voir `backend/src/middleware/auth.js` `requireRole`) :
- **Fraude** et **Audit Logs** : visibles par `super_admin` et `conformite` uniquement.
- **Utilisateurs internes** (gestion des comptes admin) : visible par `super_admin` uniquement.
- Tout le reste : visible par tout compte admin actif.

La sidebar masque automatiquement les entrées non autorisées (`Layout.jsx` filtre `NAV_ITEMS` sur `admin.role`) ;
le backend applique la même règle côté API, donc un accès direct par URL à une section non autorisée échoue avec `403`.

## Icônes

Toutes les icônes de l'interface utilisent [Font Awesome](https://fontawesome.com/)
(style solid) via `@fortawesome/react-fontawesome`,
`@fortawesome/fontawesome-svg-core` et `@fortawesome/free-solid-svg-icons`.
Le reste du code n'importe jamais la librairie directement : il passe par
le composant `src/components/Icon.jsx` (`<Icon icon={faXxx} />`), qui
hérite la couleur du texte parent par défaut. Voir `../ICON_MIGRATION.md`
à la racine du repo pour le mapping sémantique partagé entre les 3 apps
AfriPay (web / mobileclient / mobilepro).

## Fonctionnalités

- **Connexion admin** (`POST /admin/login`), session persistée en
  `localStorage`, déconnexion automatique sur 401.
- **Dashboard** : indicateurs clés (utilisateurs, marchands, volumes,
  dossiers en attente) avec bandeau d'alerte cliquable vers les listes
  filtrées "en attente".
- **Clients / Marchands** : recherche, filtre par statut
  KYC/KYB, fiche détail avec documents soumis (images), actions
  Valider / Rejeter / Suspendre (motif obligatoire pour rejet et
  suspension).
- **KYC / KYB** : files d'attente documentaires transverses (tous
  dossiers, tous statuts), qui renvoient vers la fiche Client/Marchand
  pour la décision.
- **Transactions** : filtres type/statut, pagination "Charger plus".
- **Wallets** : soldes consolidés (totaux Clients/Marchands), recherche,
  filtre par type de portefeuille.
- **Recharges** : journal des recharges par fournisseur (Wave, Orange
  Money, Moov Money, MTN Money, Djamo, Visa) et statut.
- **Biométrie** : indicateurs d'enrôlement/tentatives, derniers
  enrôlements actifs, journal des tentatives de reconnaissance.
- **Fraude** : échecs biométriques récents, IP avec échecs répétés,
  transactions échouées, comptes suspendus avec réactivation en un
  clic.
- **Notifications** : historique des notifications envoyées + formulaire
  d'envoi manuel à un client/marchand par numéro de téléphone.
- **Utilisateurs internes** : création de comptes admin, changement de
  rôle, activation/désactivation (impossible de retirer le dernier
  `super_admin` actif).
- **Audit Logs** : journal des actions sensibles effectuées depuis le
  back-office (décisions KYC/KYB, envoi de notification, gestion des
  comptes internes).
- **Mon profil** (accessible en cliquant sur son nom/avatar dans la
  topbar) : photo de profil (upload/remplacement/suppression, JPEG/PNG/WebP
  4 Mo max, via le petit bouton caméra sur l'avatar — affichée aussi dans
  la topbar), modification du nom/email, changement de mot de passe
  (avec vérification du mot de passe actuel), et fil d'activité
  personnel (ses propres entrées du journal d'audit, visible quel
  que soit son rôle).

## Limitations connues / choix pris

- L'URL de base de l'API (`http://localhost:4000`) est codée en dur
  plutôt que lue depuis une variable d'environnement Vite (`import.meta.env`),
  pour rester simple — à extraire dans un `.env` si l'app doit un jour
  pointer vers un autre environnement.
- Les actions "Rejeter" / "Suspendre" utilisent `window.prompt()` pour
  saisir le motif (au lieu d'une modale dédiée) afin de rester simple ;
  fonctionnellement équivalent, esthétiquement plus sommaire.
- Le logo officiel (`assets/logo.png`) a été redimensionné/compressé
  (400×400 pour l'UI, 64×64 pour le favicon) pour éviter d'expédier un
  PNG de ~800 Ko à chaque chargement.
