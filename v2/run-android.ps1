# ============================================================
#  Les Chênes de l'Aven — build + lancement de l'app Android du BO
#
#  Usage (PowerShell, UNE commande) :
#    powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\Documents\GitHub\les-chenes-de-l-aven\v2\run-android.ps1"
#
#  Option :  -ApkOnly   -> produit seulement l'APK (fichier à envoyer sur un téléphone)
#
#  Prérequis (voir v2/ANDROID.md) :
#   - Android Studio installé + variable ANDROID_HOME définie
#   - un émulateur démarré (Android Studio > Device Manager > ▶)
#     ou un téléphone branché en USB avec "Débogage USB" activé
#   - le backend tourne sur le PC : start-local.ps1
#     (l'émulateur y accède via http://10.0.2.2:8080, déjà configuré)
#  Premier lancement : Gradle télécharge ~2 Go, quelques minutes.
# ============================================================
param([switch]$ApkOnly, [switch]$Rebuild)
$root = $PSScriptRoot

# --- Node.js ---
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "ERREUR : Node.js introuvable. Installe Node 22+ LTS : https://nodejs.org"
  Read-Host "Entree pour quitter"; exit 1
}
Write-Host "Node $(& node -v)"

# --- Java (JDK 21, aussi requis par Gradle/Android) ---
if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
  Write-Host "ERREUR : Java introuvable. Installe Eclipse Temurin JDK 21 : https://adoptium.net/temurin/releases/?version=21"
  Read-Host "Entree pour quitter"; exit 1
}
if (-not $env:JAVA_HOME -or -not (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
  $j = (Get-Command java).Source
  $env:JAVA_HOME = (Split-Path (Split-Path $j -Parent) -Parent)
}
Write-Host "JAVA_HOME = $env:JAVA_HOME"

# --- Android SDK (ANDROID_HOME) ---
if (-not $env:ANDROID_HOME -or -not (Test-Path "$env:ANDROID_HOME\platform-tools\adb.exe")) {
  Write-Host "ERREUR : ANDROID_HOME non défini (ou SDK incomplet)."
  Write-Host "  1) Installe Android Studio : https://developer.android.com/studio"
  Write-Host "  2) Définis la variable utilisateur ANDROID_HOME = $env:LOCALAPPDATA\Android\Sdk"
  Write-Host "     (recherche Windows 'variables d'environnement' -> Nouvelle -> Nom: ANDROID_HOME)"
  Write-Host "  3) Ajoute au PATH : %ANDROID_HOME%\platform-tools ; %ANDROID_HOME%\emulator"
  Write-Host "  4) Ouvre un NOUVEAU PowerShell et relance ce script."
  Write-Host "  Détails : v2\ANDROID.md"
  Read-Host "Entree pour quitter"; exit 1
}
Write-Host "ANDROID_HOME = $env:ANDROID_HOME"
$adb = "$env:ANDROID_HOME\platform-tools\adb.exe"

Push-Location "$root\frontend"

$bundlePrecompile = (Test-Path "android-web\index.html")
if ($bundlePrecompile -and -not $Rebuild) {
  $env:CAP_WEB_DIR = "android-web"
  Write-Host "[1/3] Bundle Android précompilé trouvé (android-web) -> AUCUN ng build sur ce PC"
  Write-Host "      (apiBase = http://10.0.2.2:8080 ; pour rebuilder quand même : -Rebuild)"
} else {
  $env:CAP_WEB_DIR = ""
  Write-Host "[1/3] Build Angular (configuration capacitor, apiBase = http://10.0.2.2:8080)..."
  npx ng build --configuration capacitor
if ($LASTEXITCODE -ne 0) {
  # auto-réparation esbuild (antivirus) comme start-local.ps1
  Write-Host "  Build echoue -> on tue node (verrou), npm rebuild esbuild, nouvel essai..."
  taskkill /F /IM node.exe 2>$null
  Start-Sleep -Seconds 1
  npm rebuild esbuild 2>$null
  Start-Sleep -Seconds 2
  npx ng build --configuration capacitor
  if ($LASTEXITCODE -ne 0) {
    # Plan B : copier le binaire esbuild HORS du dossier surveillé par l'antivirus
    $bin = "node_modules\@esbuild\win32-x64\esbuild.exe"
    if (Test-Path $bin) {
      $out = "$env:LOCALAPPDATA\esbuild-bin"
      New-Item -ItemType Directory -Force $out | Out-Null
      Copy-Item $bin "$out\esbuild.exe" -Force
      $env:ESBUILD_BINARY_PATH = "$out\esbuild.exe"
      Write-Host "  Plan B : binaire esbuild copié dans $out et ESBUILD_BINARY_PATH forcé -> nouvel essai..."
      npx ng build --configuration capacitor
    }
  }
  if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERREUR ng build persistante (souvent 'spawn EPERM' = antivirus bloque esbuild)."
    Write-Host "A faire UNE fois :"
    Write-Host "  1) Parametres Windows -> Confidentialite et securite -> Securite Windows"
    Write-Host "     -> Protection contre les virus et menaces -> Gerer les parametres -> Exclusions"
    Write-Host "     -> Ajouter une exclusion -> Dossier -> C:\Users\admin\Documents\GitHub\les-chenes-de-l-aven"
    Write-Host "     (optionnel: exclusion de Processus -> C:\Program Files\nodejs\node.exe)"
    Write-Host "  2) Dans ce PowerShell : taskkill /F /IM node.exe"
    Write-Host "  3) Puis : cd frontend ; npm rebuild esbuild"
    Write-Host "  4) Verifier : node_modules\@esbuild\win32-x64\esbuild.exe --version"
    Write-Host "  5) Relancer ce script dans une NOUVELLE fenetre PowerShell."
    Write-Host "  Details : v2\ANDROID.md (section Depannage)."
    Pop-Location; Read-Host "Entree"; exit 1
  }
}

# CLI Capacitor presente ? (si node_modules incomplet -> reinstall SANS scripts, donc sans esbuild)
if (-not (Test-Path "node_modules\@capacitor\cli\bin\capacitor")) {
  Write-Host "CLI Capacitor manquante -> npm install --ignore-scripts (aucun script execute, esbuild non touche)..."
  npm install --ignore-scripts
  if (-not (Test-Path "node_modules\@capacitor\cli\bin\capacitor")) {
    Write-Host "ERREUR : CLI Capacitor toujours absente apres npm install --ignore-scripts"
    Pop-Location; Read-Host "Entree"; exit 1
  }
}

if (-not (Test-Path "android\app\build.gradle")) {
  Write-Host "Premiere fois : ajout de la plateforme Android (node node_modules/@capacitor/cli/bin/capacitor add android)..."
  node node_modules/@capacitor/cli/bin/capacitor add android
  if ($LASTEXITCODE -ne 0) { Write-Host "ERREUR cap add android"; Pop-Location; Read-Host "Entree"; exit 1 }
}

}

Write-Host "[2/3] cap sync android (copie du build dans le projet Android)..."
node node_modules/@capacitor/cli/bin/capacitor sync android
if ($LASTEXITCODE -ne 0) { Write-Host "ERREUR cap sync"; Pop-Location; Read-Host "Entree"; exit 1 }

$apkRel = "android\app\build\outputs\apk\debug\app-debug.apk"
if ($ApkOnly) {
  Write-Host "[3/3] Build de l'APK uniquement (gradle, premier lancement long)..."
  node node_modules/@capacitor/cli/bin/capacitor build android
  if ($LASTEXITCODE -ne 0) { Write-Host "ERREUR gradle"; Pop-Location; Read-Host "Entree"; exit 1 }
  Write-Host "APK pret : $root\frontend\$apkRel"
  Write-Host "Envoie ce fichier sur le telephone (WhatsApp/mail/USB), puis ouvre-le et autorise 'installer depuis cette source'."
  Pop-Location; Read-Host "Entree pour quitter"; exit 0
}

Write-Host "[3/3] Appareil connecté ?"
$devices = (& $adb devices) | Where-Object { $_ -match "\tdevice\s*$" }
if (-not $devices) {
  Write-Host "AUCUN appareil détecté (adb devices vide)."
  Write-Host "  -> Démarre l'émulateur : Android Studio > Device Manager > ▶ (ou `emulator -avd <nom>` dans un terminal)"
  Write-Host "  -> ou branche un téléphone en USB avec 'Débogage USB' activé (Options développeur)"
  Write-Host "  -> vérifie la virtualisation : Gestionnaire des tâches > Performances > CPU > Virtualisation = Activé"
  Pop-Location; Read-Host "Entree pour quitter"; exit 1
}
$devices | ForEach-Object { Write-Host "  appareil : $_" }

Write-Host "Build Gradle + installation sur l'appareil (premier lancement : plusieurs minutes, ~2 Go téléchargés)..."
node node_modules/@capacitor/cli/bin/capacitor run android
if ($LASTEXITCODE -ne 0) { Write-Host "ERREUR cap run android"; Pop-Location; Read-Host "Entree"; exit 1 }

Write-Host ""
Write-Host "OK ! L'app 'BO Chênes de l'Aven' s'ouvre sur l'appareil, directement sur /bo."
Write-Host "Identifiants : admin@leschenesdelaven.fr / (ADMIN_PASSWORD, défaut change-me)"
Write-Host "APK aussi disponible ici : $root\frontend\$apkRel"
Pop-Location
Read-Host "Entree pour quitter"
