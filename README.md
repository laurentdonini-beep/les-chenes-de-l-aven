# Les Chênes de l'Aven — nouveau site

Site vitrine des chambres d'hôtes **Les Chênes de l'Aven** (Orgnac-l'Aven, Ardèche).

## Stack (100 % gratuit, aucun module payant)

- **Eleventy (11ty)** : générateur de site statique — rapide, sûr, gratuit.
- **Contenus en Markdown** (`src/*.md`, `src/_chambres/*.md`) : faciles à relire/modifier.
- **Decap CMS** (`/admin`) : interface d'administration graphique, open-source et gratuite. Ta tante modifie textes, tarifs, chambres et photos sans toucher au code.
- **Formulaire de contact** : ouvre directement la messagerie du visiteur (mailto), aucun service payant.
- **Carte** : OpenStreetMap, aucune clé API requise.
- **Hébergement** : Netlify (ou GitHub Pages / Cloudflare Pages), plan gratuit suffisant.

## Commandes

```bash
npm install        # dépendances (une seule fois)
npm run build      # génère le site dans _site/
npm start          # serveur local sur http://localhost:8080
```

## Administration (pour ta tante)

1. Déployer le site sur Netlify (gratuit) et activer **Identity**.
2. Ouvrir `https://<site>/admin` → se connecter → modifier :
   - **Paramètres du site** : téléphone, email, tarifs, horaires, texte du spa.
   - **Chambres** : ajouter/modifier une chambre, changer sa photo.
   - **Pages** : accueil, la maison, spa, activités, galerie, contact.
3. Chaque modification publie automatiquement le site (quelques minutes).

## Structure

```
src/
├── _data/site.json      # coordonnées, tarifs, menu (éditable via /admin)
├── _chambres/*.md       # une fiche par chambre
├── _includes/           # gabarits (base.njk, chambre.njk)
├── *.md                 # pages : accueil, la-maison, spa, activites, galerie, contact
├── admin/               # Decap CMS (config.yml + index.html)
└── assets/              # css, js, images (les vraies photos iront dans assets/img)
```

## Photos

Les images actuelles (`src/assets/img/*.svg`) sont des **placeholders** : à remplacer par les vraies photos de la maison (via l'admin `/admin`, dossier `uploads`, ou en déposant les fichiers dans `src/assets/img/`).

## Mise en ligne

1. Créer un dépôt GitHub et y pousser ce dossier.
2. Sur Netlify : "Add new site → Import from Git", branche `main`, commande `npm run build`, dossier `_site`.
3. Activer Identity, inviter ta tante par email.
4. Faire pointer le nom de domaine `leschenesdelaven.com` vers Netlify (DNS) — ou garder le .fr.
