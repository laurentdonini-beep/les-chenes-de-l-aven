# ============================================================
#  Les Chênes de l'Aven — v2 Angular + Spring Boot, en LOCAL
#  Lancement (PowerShell, UNE seule commande) :
#    powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\Documents\GitHub\les-chenes-de-l-aven\v2\start-local.ps1"
#  Puis ouvrir http://localhost:8080  (backoffice: http://localhost:8080/bo
#  email admin@leschenesdelaven.fr / mdp = $env:ADMIN_PASSWORD, defaut change-me)
# ============================================================
$root = $PSScriptRoot

# --- Node.js (22 LTS recommande ; Angular 19 ne supporte pas Node > 22) ---
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host "ERREUR : Node.js introuvable. Installe Node 22 LTS : https://nodejs.org (bouton LTS)"
    Read-Host "Entree pour quitter"
    exit 1
}
$nodeVer = (& node -v)
$parts = ($nodeVer -replace 'v', '').Split('.')
$nodeMajor = [int]$parts[0]; $nodeMinor = [int]$parts[1]
Write-Host "Node.js $nodeVer"
# Angular 22 exige : node ^22.22.3 || ^24.15.0 || >=26.0.0
$nodeOk = ($nodeMajor -ge 26) -or ($nodeMajor -eq 24 -and $nodeMinor -ge 15) -or ($nodeMajor -eq 22 -and $nodeMinor -ge 22)
if (-not $nodeOk) {
    Write-Host "ATTENTION : Angular 22 exige Node >= 22.22.3 ou >= 24.15.0 (toi: $nodeVer)."
    Write-Host "Installe la derniere version de https://nodejs.org (LTS ou Current), ouvre une NOUVELLE fenetre PowerShell, puis relance ce script."
}

# --- Java (JDK 21 requis par Spring Boot) ---
$java = Get-Command java -ErrorAction SilentlyContinue
if (-not $java) {
    Write-Host "ERREUR : Java n'est pas detecte. Installe Eclipse Temurin JDK 21 : https://adoptium.net/temurin/releases/?version=21"
    Write-Host "Pendant l'installation, coche 'Add to PATH' et 'Set JAVA_HOME variable'."
    Read-Host "Entree pour quitter"
    exit 1
}
if (-not $env:JAVA_HOME -or -not (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
    $env:JAVA_HOME = (Split-Path (Split-Path $java.Source -Parent) -Parent)   # ...\bin\java.exe -> dossier JDK
}
Write-Host "JAVA_HOME = $env:JAVA_HOME"
& "$env:JAVA_HOME\bin\java.exe" -version

# --- [1/3] Dependances du front ---
Write-Host "[1/3] Dependances du front (si besoin)..."
Push-Location "$root\frontend"
if (-not (Test-Path "node_modules")) {
    Write-Host "npm install..."
    npm install
    if ($LASTEXITCODE -ne 0) { Write-Host "ERREUR npm install"; Read-Host "Entree"; exit 1 }
}

# --- [2/3] Build du front : si dist absent OU si src/public plus recent que dist ---
Write-Host "[2/3] Build du front Angular (si besoin)..."
$distIndex = "dist\frontend\browser\index.html"
$needBuild = -not (Test-Path $distIndex)
if (-not $needBuild) {
    $distTime = (Get-Item $distIndex).LastWriteTime
    $newer = Get-ChildItem -Path "src", "public", "angular.json", "package.json" -Recurse -File -ErrorAction SilentlyContinue |
             Where-Object { $_.LastWriteTime -gt $distTime }
    if ($newer) { $needBuild = $true; Write-Host "  (sources modifies depuis le dernier build -> rebuild)" }
}
if ($needBuild) {
    Write-Host "npx ng build..."
    npx ng build
    if ($LASTEXITCODE -ne 0) {
        # Auto-reparation : spawn EPERM = binaire esbuild bloque/corrompu (souvent antivirus)
        Write-Host "  Build echoue -> tentative de reparation : npm rebuild esbuild, puis nouvel essai..."
        npm rebuild esbuild
        Start-Sleep -Seconds 2
        npx ng build
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERREUR ng build. Causes possibles : Node > 22 (installe Node 22 LTS), antivirus qui bloque"
        Write-Host "node_modules\@esbuild (ajoute le dossier du depot aux exclusions de Windows Defender),"
        Write-Host "ou processus node bloques :  taskkill /F /IM node.exe   puis relance."
        Read-Host "Entree"
        Pop-Location
        exit 1
    }
} else {
    Write-Host "  (dist a jour, build ignore)"
}
Pop-Location

# --- [3/3] Backend Spring Boot (API + site sur http://localhost:8080) ---
Write-Host "[3/3] Demarrage du backend Spring Boot (API + site sur http://localhost:8080)..."
Write-Host "       Premier lancement : telecharge Maven + dependances, quelques minutes."
Push-Location "$root\backend"
if (-not $env:ADMIN_PASSWORD) { $env:ADMIN_PASSWORD = "change-me" }
Write-Host "Backoffice /bo : email admin@leschenesdelaven.fr / mot de passe = $env:ADMIN_PASSWORD"
& "$root\backend\mvnw.cmd" spring-boot:run
Pop-Location
Read-Host "Entree pour quitter"
