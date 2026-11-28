# v2 — Site Angular + Spring Boot (remplace le site statique Eleventy)

Même design que le site v1, mais architecture « vraie app » :

```
Navigateur ──► Angular 22 (SPA, dans v2/frontend)
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
Il a son **propre habillage** : menu latéral à **gauche** (tableau de bord, réservations, saison & calendriers, tarifs & promos, **photos**, messages), sans le header/footer du site public. Sur mobile, ce menu devient une barre horizontale en haut.

**Section Photos (`/bo/photos`)** — gestion autonome des images du site :
- **Ajouter** des photos (bouton « ⬆ Ajouter des photos… », plusieurs fichiers, JPG/PNG/WebP/GIF/SVG, max 20 Mo) → elles arrivent dans `/uploads/...` (dossier persistant `backend/data/uploads`, hors du build) ;
- **Remplacer** n'importe quelle image du site à la **même URL** (ex. la photo de la piscine) : toutes les pages sont mises à jour d'un coup ; « ↩ Originale » restaure l'image livrée avec le site ;
- **Supprimer** une photo uploadée ;
- choisir l'**image principale** et la **galerie** de chaque chambre (sélecteur de photos).
API : `GET/POST/DELETE /api/admin/media` (upload multipart `file` + `targetPath` optionnel), `PUT /api/admin/chambres/{slug}/photos`.

## Lancer en local (le plus simple)

Prérequis : **Node.js ≥ 22.22.3 ou ≥ 24.15.0** (Angular 22)  et **Java 21+** (JDK Temurin), rien d'autre (le Maven Wrapper `mvnw` est fourni).

**Windows (méthode recommandée, une seule commande dans PowerShell)** :
```powershell
powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\Documents\GitHub\les-chenes-de-l-aven\v2\start-local.ps1"
```
(ou double-clic sur `v2\start-local.bat` dans l'Explorateur — le fichier est en CRLF)
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
├─ frontend/            Angular 22 (standalone, signaux, lazy routes)
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

> **Note** : le build du front (`v2/frontend/dist/`) est **commité dans le dépôt** — pas besoin de lancer `ng build` en local pour faire tourner le site (utile si esbuild est bloqué par l'antivirus : `spawn EPERM`). Le script `start-local.ps1` ne rebuild que si `src/` a changé ; s'il ne peut pas builder, il continue avec le `dist/` existant.

## Application mobile du BO (Capacitor — un seul code source)

L'app mobile embarque **le front Angular compilé** (aucun deuxième code à maintenir) :
au lancement, elle ouvre directement le backoffice **/bo** (login requis, même API sécurisée).

- **API** : voir `src/environments/environment.capacitor.ts` — **émulateur Android local : `http://10.0.2.2:8080` (défaut ; 10.0.2.2 = le PC vu depuis l'émulateur)** ; vrai téléphone sur le même Wi-Fi : `http://<IP-du-PC>:8080` (`ipconfig`) + pare-feu Windows à autoriser pour Java:8080 ; prod : `https://www.leschenesdelaven.com`.
- **Cross-origin (mobile)** : l'app (origine `http://localhost`) appelle l'API sur une autre origine → l'interceptor envoie `withCredentials` (session JSESSIONID) + le token CSRF en en-tête, récupéré via `GET /api/public/csrf` (le cookie XSRF-TOKEN n'est pas lisible cross-origin). CORS : origines Capacitor autorisées + `allowCredentials`.
- **Notifications** : notifications locales toutes les 30 s (nouveau message / nouvelle réservation) + badge avec le nombre de messages non lus sur l'onglet Messages. Push même app fermée = FCM (Android, gratuit) / APNs (iOS, compte développeur payant) — étape suivante si besoin.
- **CORS** : le backend autorise déjà les origines Capacitor (`capacitor://localhost`, `http://localhost`) + credentials.

### Tester sur un émulateur Android (guide complet : `v2/ANDROID.md`)

Préparer le PC une fois (Android Studio, `ANDROID_HOME`, virtualisation BIOS, AVD Pixel — voir `ANDROID.md`), puis, émulateur démarré + backend lancé (`start-local.ps1`) :
```powershell
powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\Documents\GitHub\les-chenes-de-l-aven\v2\run-android.ps1"
#  -ApkOnly  -> produit seulement l'APK (frontend/android/app/build/outputs/apk/debug/app-debug.apk)
```
Le script fait `ng build --configuration capacitor`, `cap add android` si besoin, `cap sync`, puis installe sur l'appareil détecté (`cap run android`).

### Build Android (APK pour ta tante)
Prérequis : Android Studio + JDK 17+.
```bash
cd v2/frontend
npm install
npx cap add android        # une seule fois (dossier android/ généré, ignoré par git)
npm run cap:sync           # = build:cap (ng build --configuration capacitor) + npx cap sync
npx cap open android       # ouvre Android Studio
```
Dans Android Studio : **Build → Build Bundle(s)/APK → Build APK** → récupérer `android/app/build/outputs/apk/debug/app-debug.apk` → l'envoyer à ta tante (ou installer via USB avec le mode développeur activé sur son téléphone : 7 taps sur « Numéro de build » dans les réglages).

### iOS
Nécessite un Mac + Xcode + compte Apple Developer (99 €/an) : `npx cap add ios && npx cap open ios`.
