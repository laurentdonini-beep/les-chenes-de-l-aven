# 📱 Tester l'app Android du backoffice (émulateur)

L'app mobile du BO est le **même code Angular** que le site, compilé en app Android avec **Capacitor** (dossier `frontend/android/`). Elle ouvre directement le backoffice `/bo` avec les notifications locales (nouveau message / nouvelle réservation toutes les 30 s).

Ce guide configure ton PC Windows pour lancer un **émulateur Android**, puis installe l'app dessus.

---

## 0. Ce qu'il faut sur le PC

| Élément | Détail |
|---|---|
| Windows 10/11 64 bits | — |
| Espace disque | **~10 Go libres** (Android Studio ~1,5 Go + SDK ~3-5 Go + image émulateur ~1 Go + cache Gradle ~2 Go) |
| RAM | 8 Go minimum, **16 Go recommandés** |
| Virtualisation | **VT-x (Intel) ou AMD-V activé dans le BIOS** — vérifie : Gestionnaire des tâches → Performances → CPU → « Virtualisation : Activé ». Si « Désactivé » → redémarrer le PC, entrer dans le BIOS (touche Suppr/F2 au démarrage) et activer VT-x/AMD-V/SVM. |

Tu as déjà : Node.js 22+, JDK 21 (installés pour `start-local.ps1`).

---

## 1. Installer Android Studio (l'émulateur est inclus)

1. Télécharge : **https://developer.android.com/studio** → bouton « Download Android Studio ».
2. Lance l'installateur, **laisse les options par défaut** (ça installe le SDK Android + l'émulateur + l'AVD).
3. Au premier démarrage, fais le wizard « Standard » (thème au choix), laisse télécharger les composants proposés.

## 2. Variables d'environnement (une seule fois)

Ouvre « variables d'environnement » (tape ça dans la recherche Windows) :

1. **Nouvelle variable utilisateur** :
   - Nom : `ANDROID_HOME`
   - Valeur : `%LOCALAPPDATA%\Android\Sdk`
2. Dans le **PATH** utilisateur, ajoute 4 entrées :
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\emulator`
   - `%ANDROID_HOME%\tools`
   - `%ANDROID_HOME%\tools\bin`
3. Ouvre un **nouveau** PowerShell (les variables ne sont prises en compte que dans les nouvelles fenêtres) et vérifie :
   ```powershell
   adb --version
   emulator -list-avds
   ```
   Si `adb` répond, c'est bon.

## 3. Activer la virtualisation côté Windows

Panneau de configuration → Programmes → « Activer ou désactiver des fonctionnalités Windows » :

- ☑ **Plateforme d'hyperviseur Windows** (obligatoire pour l'émulateur)
- ☑ **Plateforme de machine virtuelle**
- ☑ **Hyper-V** si proposé (optionnel mais recommandé)

→ **Redémarrer le PC.**

## 4. Créer un émulateur (AVD)

Dans Android Studio : écran d'accueil → **Device Manager** (icône téléphone en haut à droite, ou menu ⋮ → Device Manager) :

1. **Create device** → choisis **Pixel 8** (ou Pixel 7) → Next.
2. Image système : choisis par ex. **VanillaIceCream (API 35)** ou **UpsideDownCake (API 34)**, onglet **x86_64**, colonne « Google APIs » → **Download** (~1 Go) → Next.
3. Laisse les réglages par défaut (RAM 2048 Mo c'est OK) → **Finish**.

## 5. Démarrer l'émulateur

- Device Manager → ▶ sur ton appareil, **ou** dans un terminal : `emulator -avd Pixel_8_API_35`
- Le premier démarrage prend **1 à 5 minutes** (écran noir puis logo Android). Laisse-le ouvert.

## 6. Lancer le backend sur le PC

Dans un PowerShell :
```powershell
powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\Documents\GitHub\les-chenes-de-l-aven\v2\start-local.ps1"
```
Laisse cette fenêtre ouverte (le backend tourne sur `http://localhost:8080`).

> Depuis l'émulateur, le PC est joignable à l'adresse spéciale **`http://10.0.2.2:8080`** — c'est déjà configuré dans `frontend/src/environments/environment.capacitor.ts`. Vérifie dans le navigateur de l'émulateur que `http://10.0.2.2:8080/api/public/site` répond (JSON avec "Les Chênes de l'Aven").

## 7. Build + installer l'app sur l'émulateur (1 commande)

Dans un **nouveau** PowerShell (avec l'émulateur démarré) :
```powershell
powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\Documents\GitHub\les-chenes-de-l-aven\v2\run-android.ps1"
```
Le script fait tout seul : build Angular (config `capacitor`) → `cap sync android` → `cap run android` (build Gradle + installation).

⏳ **Premier lancement : plusieurs minutes** (Gradle télécharge ~2 Go). Les suivants sont plus rapides.

## 8. Tester l'app

- L'app **« BO Chênes de l'Aven »** s'ouvre toute seule sur `/bo` (page de connexion).
- Identifiants : `admin@leschenesdelaven.fr` / mot de passe `ADMIN_PASSWORD` (défaut `change-me`).
- Teste : tableau de bord, réservations, calendriers, tarifs, **photos** (upload), messages + badge.
- **Notifications** : dans l'émulateur, envoie un message via la page contact du site (`http://10.0.2.2:8080/contact`), puis dans l'app tire l'écran du haut vers le bas → une notification locale « ✉️ Nouveau message » doit apparaître (poll toutes les 30 s).

---

## 🐞 Dépannage

| Symptôme | Cause / solution |
|---|---|
| `adb` introuvable | variables d'environnement pas dans le PATH → refaire l'étape 2 dans un **nouveau** terminal |
| Émulateur très lent ou ne démarre pas | virtualisation BIOS désactivée → étape 0/3 ; ou RAM insuffisante → fermer d'autres applis |
| `adb devices` vide alors que l'émulateur tourne | attendre la fin du boot ; sinon `adb kill-server` puis `adb start-server` |
| L'app s'ouvre mais « serveur injoignable » | backend pas lancé (étape 6) ; ou teste `http://10.0.2.2:8080/api/public/site` dans Chrome de l'émulateur |
| Login « Identifiants invalides » | vérifie `ADMIN_PASSWORD` affiché au démarrage de `start-local.ps1` |
| Erreur Gradle au premier build | laisser finir le téléchargement ; si bloqué, vérifier `ANDROID_HOME` ; `cd frontend\android` puis `.\gradlew.bat assembleDebug` pour voir l'erreur complète |
| APK pour un vrai téléphone | `run-android.ps1 -ApkOnly` → fichier `frontend/android/app/build/outputs/apk/debug/app-debug.apk` à envoyer sur le téléphone (autoriser « sources inconnues »). Pour un téléphone sur le même Wi-Fi : mettre l'IP du PC (`ipconfig`, ex. `http://192.168.1.42:8080`) dans `environment.capacitor.ts`, autoriser le **pare-feu Windows** pour Java sur le port 8080, puis relancer le script. |

## 🔁 Mettre à jour l'app après un `Pull`

```powershell
# GitHub Desktop : Pull origin (branche vibe/angular-spring-35f94a)
powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\Documents\GitHub\les-chenes-de-l-aven\v2\run-android.ps1"
```
Le script resynchronise automatiquement le nouveau build dans l'app.
