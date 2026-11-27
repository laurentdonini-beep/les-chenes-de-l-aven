#!/bin/sh
# ============================================================
#  Les Chênes de l'Aven — v2 Angular + Spring Boot, en LOCAL
#  ./start-local.sh  puis ouvrir http://localhost:8080
#  Backoffice : http://localhost:8080/bo
#    email    : admin@leschenesdelaven.fr
#    password : $ADMIN_PASSWORD (défaut : change-me)
#  ex : ADMIN_PASSWORD=monmotdepasse ./start-local.sh
# ============================================================
cd "$(dirname "$0")"

echo "[1/3] Installation des dépendances du front (si besoin)..."
cd frontend
if [ ! -d node_modules ]; then
  echo "npm install..."
  npm install
fi

echo "[2/3] Build du front Angular (si besoin)..."
if [ ! -f dist/frontend/browser/index.html ]; then
  echo "npx ng build..."
  npx ng build
fi
cd ..

echo "[3/3] Démarrage du backend Spring Boot (API + site sur http://localhost:8080)..."
echo "      (premier lancement : télécharge Maven + les dépendances, quelques minutes)"
cd backend
: "${ADMIN_PASSWORD:=change-me}"
export ADMIN_PASSWORD
./mvnw spring-boot:run
