// Build Capacitor (app mobile) : l'API est appelée en absolu sur le serveur.
// PROD : https://www.leschenesdelaven.com
// TEST LOCAL sur téléphone (même Wi-Fi que le PC) : http://192.168.1.x:8080  (IP du PC, voir ipconfig)
export const environment = {
  production: true,
  apiBase: 'https://www.leschenesdelaven.com'
};
