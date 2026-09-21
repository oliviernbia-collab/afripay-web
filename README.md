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

L'application est servie sur `http://localhost:5173`. Elle appelle
l'API sur `http://localhost:4000/api` (URL codée en dur dans
`src/api/client.js` — adapter cette constante si le backend tourne
ailleurs).

## Compte super admin

```
Email        : olivier@gmail.com
Mot de passe : olivier1999
```

(compte seed du backend — à changer avant toute mise en production).

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
  components/           Layout (sidebar/topbar), badges de statut, cartes stat, bannières, Icon (Font Awesome)
  pages/                Login, Dashboard, Utilisateurs (+détail), Marchands (+détail), Transactions
  utils/format.js       Formatage FCFA / dates / pourcentages
```

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
- **Utilisateurs / Marchands** : recherche, filtre par statut
  KYC/KYB, fiche détail avec documents soumis (images), actions
  Valider / Rejeter / Suspendre (motif obligatoire pour rejet et
  suspension).
- **Transactions** : filtres type/statut, pagination "Charger plus".

## Limitations connues / choix pris

- L'URL de base de l'API (`http://localhost:4000`) est codée en dur
  plutôt que lue depuis une variable d'environnement Vite (`import.meta.env`),
  pour rester simple — à extraire dans un `.env` si l'app doit un jour
  pointer vers un autre environnement.
- Les actions "Rejeter" / "Suspendre" utilisent `window.prompt()` pour
  saisir le motif (au lieu d'une modale dédiée) afin de rester simple ;
  fonctionnellement équivalent, esthétiquement plus sommaire.
- Le logo officiel (`assets/Logo-AfriPay.png`) a été redimensionné/compressé
  (400×400 pour l'UI, 64×64 pour le favicon) pour éviter d'expédier un
  PNG de ~800 Ko à chaque chargement.
