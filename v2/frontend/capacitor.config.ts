import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.leschenesdelaven.bo',
  appName: "BO Chênes de l'Aven",
  // webDir par défaut = build web ; pour l'app Android sans ng build sur le PC,
  // run-android.ps1 pose CAP_WEB_DIR=android-web (bundle précompilé commité)
  webDir: process.env.CAP_WEB_DIR || 'dist/frontend/browser',
  bundledWebRuntime: false,
  // En prod, l'app appelle l'API sur le domaine public (voir environment.capacitor.ts).
  // En test local sur téléphone : mettre http://<IP-du-PC>:8080 dans environment.capacitor.ts
};

export default config;
