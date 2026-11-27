# ============================================================
#  Les Chênes de l'Aven — v2 Angular + Spring Boot, en LOCAL
#  Lancement (PowerShell, UNE seule commande) :
#    powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\Documents\GitHub\les-chenes-de-l-aven\v2\start-local.ps1"
#  Puis ouvrir http://localhost:8080  (backoffice: http://localhost:8080/bo
#  email admin@leschenesdelaven.fr / mdp = $env:ADMIN_PASSWORD, defaut change-me)
# ============================================================
$root = $PSScriptRoot

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

# --- [2/3] Build du front : OBLIGATOIRE si dist absent OU si src/public plus recent que dist ---
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
    if ($LASTEXITCODE -ne 0) { Write-Host "ERREUR ng build"; Read-Host "Entree"; exit 1 }
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
