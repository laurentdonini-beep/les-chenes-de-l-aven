import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

/**
 * En build Capacitor (app mobile), préfixe les appels /api/... par l'URL du serveur
 * (environment.apiBase). En build web, apiBase est vide -> rien ne change.
 */
export const apiBaseInterceptor: HttpInterceptorFn = (req, next) => {
  if (environment.apiBase && req.url.startsWith('/api/')) {
    req = req.clone({ url: environment.apiBase + req.url });
  }
  return next(req);
};
