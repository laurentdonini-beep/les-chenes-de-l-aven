@echo off
REM ============================================================
REM  Les Chênes de l'Aven — v2 Angular + Spring Boot, en LOCAL
REM  Double-clic sur ce fichier, puis ouvrir http://localhost:8080
REM  Backoffice : http://localhost:8080/bo
REM    email    : admin@leschenesdelaven.fr
REM    password : variable ADMIN_PASSWORD (defaut : change-me)
REM    pour changer : set ADMIN_PASSWORD=monmotdepasse puis lancer
REM  Depuis PowerShell :  .\start-local.bat   (avec .\ devant !)
REM ============================================================
cd /d "%~dp0"

REM --- Java (JDK 21 requis) : JAVA_HOME recalcule a chaque lancement ---
where java >nul 2>&1
if errorlevel 1 (
  echo ERREUR : Java n'est pas detecte sur ce PC.
  echo Installe Eclipse Temurin JDK 21 : https://adoptium.net/temurin/releases/?version=21
  echo Pendant l'installation, laisse coches "Add to PATH" et "Set JAVA_HOME variable".
  pause
  exit /b 1
)
set "JAVABIN="
for /f "delims=" %%i in ('where java') do if not defined JAVABIN set "JAVABIN=%%i"
set "JAVA_HOME=%JAVABIN:\bin\java.exe=%"
if not exist "%JAVA_HOME%\bin\java.exe" (
  for /d %%d in ("C:\Program Files\Eclipse Adoptium\jdk-*" "C:\Program Files\Java\jdk-*" "C:\Program Files\Microsoft\jdk-*" "C:\Program Files\Amazon Corretto\jdk*" "C:\Program Files\Zulu\zulu-*") do (
    if exist "%%d\bin\java.exe" set "JAVA_HOME=%%d"
  )
)
if not exist "%JAVA_HOME%\bin\java.exe" (
  echo ERREUR : dossier du JDK introuvable (JAVA_HOME).
  echo Definit-le manuellement : recherche Windows "variables d'environnement" ^> Nouvelle variable
  echo Nom : JAVA_HOME   Valeur : ex C:\Program Files\Eclipse Adoptium\jdk-21.0.7.6-hotspot
  pause
  exit /b 1
)
echo JAVA_HOME = %JAVA_HOME%
"%JAVA_HOME%\bin\java.exe" -version

echo [1/3] Dependances du front (si besoin)...
cd frontend
if not exist node_modules (
  echo npm install...
  call npm install
)

echo [2/3] Build du front Angular (si besoin)...
if not exist dist\frontend\browser\index.html (
  echo npx ng build...
  call npx ng build
)
cd ..

echo [3/3] Demarrage du backend Spring Boot (API + site sur http://localhost:8080)...
echo      Premier lancement : telecharge Maven + dependances, quelques minutes.
cd backend
if "%ADMIN_PASSWORD%"=="" set ADMIN_PASSWORD=change-me
call mvnw.cmd spring-boot:run
pause
