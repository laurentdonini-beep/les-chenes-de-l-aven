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

## Synchronisation automatique (pull auto)

Scripts fournis : `scripts/sync-pull.sh` (Mac/Linux) et `scripts/sync-pull.bat` (Windows).
Ils font `git fetch` + `git pull --ff-only` : **rien n'est jamais écrasé** — si tu as des
modifications locales non publiées, le pull est simplement refusé (publie-les d'abord avec
Commit + Push dans GitHub Desktop, puis relance). La commande `git` en ligne de commande
réutilise la connexion de GitHub Desktop, donc aucun mot de passe à ressaisir.

**Windows** (Planificateur de tâches) : créer une tâche « Sync les-chenes-de-l-aven »,
déclencheur « toutes les 15 minutes », action = exécuter
`<dossier du dépôt>\scripts\sync-pull.bat` avec « Démarrer dans » = le dossier du dépôt.

**Mac / Linux** (cron) :
```bash
crontab -e
# ajouter cette ligne (adapter le chemin) :
*/15 * * * * cd "$HOME/Documents/GitHub/les-chenes-de-l-aven" && git pull --ff-only origin main >> "$HOME/les-chenes-sync.log" 2>&1
```

Alternative sans rien installer : GitHub Desktop récupère automatiquement les nouveautés
quand il est ouvert — il ne reste plus qu'un clic sur **Pull origin**.

## Administration (pour ta tante)

### En local (pour tester)

Le CMS est embarqué dans le site (`src/admin/vendor/`), donc `/admin` s'affiche **sans connexion Internet**.

```bash
npm start          # terminal 1 : le site sur http://localhost:8080
npm run cms:local  # terminal 2 : le proxy local du CMS sur http://localhost:8081
```

Puis ouvrir **http://localhost:8080/admin** — les modifications sont enregistrées dans le dépôt git local (faire ensuite `git add -A && git commit && git push` pour les publier).

### En production (Netlify, gratuit)

1. Déployer le site sur Netlify et activer **Identity** (Site settings → Identity → Enable, mode « Invite only »).
2. Ouvrir `https://<site>/admin` → se connecter avec l'invitation → modifier :
   - **Paramètres du site** : téléphone, email, tarifs, horaires, texte du spa.
   - **Chambres** : ajouter/modifier une chambre, changer sa photo.
   - **Pages** : accueil, la maison, spa, activités, galerie, contact.
3. Chaque modification publie automatiquement le site (quelques minutes).

> Note : avant le déploiement Netlify, passer `local_backend: true` à `false` dans `src/admin/config.yml` (le backend local ne sert qu'en développement).

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

Les vraies photos de l'ancien site WordPress ont été récupérées et intégrées dans `src/assets/img/photos/` (optimisées : max 1920 px, JPEG qualité 82) : hero, maison, piscine, terrasse, pièce commune, petit-déjeuner, spa, les 4 chambres, Aven d'Orgnac, Pont d'Arc, gorges, village.

Pour en ajouter/changer via l'admin : `/admin` → collection « Chambres » (champ Photo) ou « Pages » → uploader dans `uploads` (servi sous `/assets/img/uploads/`).

## Mise en ligne

1. Créer un dépôt GitHub et y pousser ce dossier.
2. Sur Netlify : "Add new site → Import from Git", branche `main`, commande `npm run build`, dossier `_site`.
3. Activer Identity, inviter ta tante par email.
4. Faire pointer le nom de domaine `leschenesdelaven.com` vers Netlify (DNS) — ou garder le .fr.
