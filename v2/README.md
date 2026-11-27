# v2 — Site Angular + Spring Boot (remplace le site statique Eleventy)

Même design que le site v1, mais architecture « vraie app » :

```
Navigateur ──► Angular 19 (SPA, dans v2/frontend)
                  │  appels REST (/api/...)
                  ▼
            Spring Boot 3 + Java 21 (v2/backend)
                  │  H2 embarquée (fichier data/leschenes.mv.db)
                  ├─ /api/public/**   : site, chambres, disponibilités, saison, contact (public)
                  ├─ /api/auth/**     : login / me / logout (session + cookie, CSRF XSRF-TOKEN)
                  └─ /api/admin/**    : CRUD disponibilités + paramètres (réservé au compte admin)
                  └─ sert aussi le build Angular (v2/frontend/dist) + les photos
```

Le backoffice `/bo` (login + gestion des disponibilités + saison) remplace l'ancien `/bo/` statique et Decap CMS.

## Lancer en local (le plus simple)

Prérequis : **Node.js 22+** et **Java 21+** (JDK Temurin), rien d'autre (le Maven Wrapper `mvnw` est fourni).

**Windows** : double-clic sur `v2\start-local.bat`
**Linux/Mac** : `./v2/start-local.sh`

Puis ouvrir **http://localhost:8080** — le site complet (front Angular buildé servi par Spring).
Backoffice : **http://localhost:8080/bo** — email `admin@leschenesdelaven.fr`, mot de passe = variable
`ADMIN_PASSWORD` (défaut `change-me` ; pour le changer : `set ADMIN_PASSWORD=...` avant le `.bat`, ou
`ADMIN_PASSWORD=... ./start-local.sh`).

La base de données H2 est un fichier dans `v2/backend/data/` : elle persiste entre les lancements
(les réservations ajoutées dans `/bo` restent). Pour repartir à zéro : supprimer ce dossier.

### Mode développement (rechargement à chaud du front)

```bash
# Terminal 1 — le backend
cd v2/backend && ./mvnw spring-boot:run        # API sur http://localhost:8080

# Terminal 2 — le front en dev (proxy /api -> 8080)
cd v2/frontend && npm install && npx ng serve  # http://localhost:4200
```

### Commandes à la main (équivalent)

```bash
cd v2/frontend && npm install && npx ng build   # -> dist/frontend/browser
cd v2/backend  && ./mvnw -DskipTests package     # -> target/api-1.0.0.jar (Maven n'est pas requis : mvnw suffit)
cd v2/backend  && ./mvnw spring-boot:run         # sert API + front sur http://localhost:8080
```

Au premier démarrage, le backend peuple la base H2 depuis `src/main/resources/seed/`
(généré depuis l'ancien site : chambres, paramètres, disponibilités).

## Build de production

```bash
cd v2/frontend && npx ng build          # -> v2/frontend/dist/frontend/browser
cd v2/backend  && mvn -DskipTests package # -> v2/backend/target/api-1.0.0.jar
```

Le backend sert le dossier du front via la variable `FRONTEND_DIR`
(défaut : `../frontend/dist/frontend/browser`).

## Déploiement sur un VPS (Hetzner CX22 ~ 4,5 €/mois, Ubuntu 24.04)

1. **Créer le VPS**, noter son IP publique. Chez le registrar du domaine
   (leschenesdelaven.com), faire pointer un enregistrement **A** `@` vers cette IP
   (laisser l'ancien site en place tant que le nouveau n'est pas validé).
2. **Installer Java 21** : `apt update && apt install -y openjdk-21-jre-headless nginx certbot python3-certbot-nginx`
3. **Déployer l'app** :
   ```bash
   mkdir -p /opt/leschenes/frontend
   # copier target/api-1.0.0.jar -> /opt/leschenes/api.jar
   # copier dist/frontend/browser/* -> /opt/leschenes/frontend/
   ```
4. **Service systemd** `/etc/systemd/system/leschenes.service` :
   ```ini
   [Unit]
   Description=Les Chenes de l'Aven (API + front)
   After=network.target

   [Service]
   WorkingDirectory=/opt/leschenes
   Environment=PORT=8080
   Environment=APP_DATA_DIR=/opt/leschenes/data
   Environment=FRONTEND_DIR=/opt/leschenes/frontend
   Environment=ADMIN_EMAIL=contact@leschenesdelaven.fr
   Environment=ADMIN_PASSWORD=<mot de passe choisi pour le backoffice>
   # Optionnel, pour recevoir les messages du formulaire par mail :
   # Environment=SMTP_HOST=smtp.exemple.fr SMTP_USER=... SMTP_PASSWORD=... MAIL_TO=contact@leschenesdelaven.fr
   ExecStart=/usr/bin/java -jar /opt/leschenes/api.jar
   Restart=always
   User=www-data

   [Install]
   WantedBy=multi-user.target
   ```
   ```bash
   systemctl daemon-reload && systemctl enable --now leschenes
   # la base H2 se crée dans /opt/leschenes/data (sauvegarder ce dossier)
   ```
5. **Nginx + HTTPS** `/etc/nginx/sites-available/leschenes` :
   ```nginx
   server {
       listen 80;
       server_name leschenesdelaven.com www.leschenesdelaven.com;
       location / { proxy_pass http://127.0.0.1:8080; proxy_set_header Host $host; proxy_set_header X-Forwarded-Proto $scheme; }
   }
   ```
   ```bash
   ln -s /etc/nginx/sites-available/leschenes /etc/nginx/sites-enabled/
   nginx -t && systemctl reload nginx
   certbot --nginx -d leschenesdelaven.com -d www.leschenesdelaven.com   # HTTPS auto
   ```
6. **Vérifier** : `https://leschenesdelaven.com` (site), `/bo` (login avec
   ADMIN_EMAIL / ADMIN_PASSWORD), calendriers des chambres, formulaire de contact.
7. **Mise à jour** : copier le nouveau jar + le nouveau build front, puis
   `systemctl restart leschenes`.
8. **SEO après mise en ligne** : Google Search Console → propriété
   `https://www.leschenesdelaven.com` → soumettre `/sitemap.xml`.

## Sécurité

- Compte admin du `/bo` défini par les variables d'environnement `ADMIN_EMAIL` / `ADMIN_PASSWORD` (mot de passe hashé en BCrypt en mémoire).
- Session côté serveur (cookie `JSESSIONID`) + protection CSRF (cookie `XSRF-TOKEN` → en-tête `X-XSRF-TOKEN`, géré automatiquement par le HttpClient d'Angular).
- `/api/admin/**` exige une session authentifiée (401 sinon) ; les chevauchements de réservations sont refusés (409).
- `/bo` est interdit aux robots (`robots.txt`).

## Structure

```
v2/
├─ frontend/            Angular 19 (standalone, signaux, lazy routes)
│  ├─ src/app/core/     models, SiteService, ApiService, AuthService, SeoService
│  ├─ src/app/shared/   carrousel hero, lightbox, calendrier dispo, galerie, reveal
│  ├─ src/app/pages/    accueil, la-maison, chambres, chambre, spa, activités, galerie, contact, crédits, /bo
│  ├─ src/assets/img/   toutes les photos (récupérées de l'ancien site)
│  └─ public/           robots.txt, sitemap.xml
└─ backend/             Spring Boot 3 (Java 21, Maven)
   ├─ model/ repo/ dto/    H2 via JPA
   ├─ web/                  PublicApiController, AuthController, AdminController
   ├─ config/               SecurityConfig (session+CSRF+CORS), DataSeeder, SpaFallbackFilter
   └─ resources/seed/       contenu initial (site.json, chambres, disponibilités)
```
