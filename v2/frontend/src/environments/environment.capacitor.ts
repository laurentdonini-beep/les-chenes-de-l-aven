// Build Capacitor (app mobile) : l'API est appelée en absolu sur le serveur.
//
//  TEST LOCAL sur ÉMULATEUR Android (émulateur = émulateur dans Android Studio) :
//    -> http://10.0.2.2:8080   (10.0.2.2 = alias du PC vu depuis l'émulateur ; backend lancé avec start-local.ps1)
//  TEST LOCAL sur VRAI TÉLÉPHONE (même Wi-Fi que le PC) :
//    -> http://192.168.1.x:8080  (remplace par l'IP du PC, voir `ipconfig` ; autoriser le pare-feu Windows pour Java:8080)
//  PROD (site en ligne) :
//    -> https://www.leschenesdelaven.com
export const environment = {
  production: true,
  apiBase: 'http://10.0.2.2:8080'
};
