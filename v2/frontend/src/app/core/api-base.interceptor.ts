import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { ApiCsrfService } from './api-csrf.service';

/**
 * En build Capacitor (app mobile), préfixe les appels /api/... par l'URL du serveur
 * (environment.apiBase) et envoie la session (withCredentials) + le token CSRF en en-tête
 * (en cross-origin, le cookie XSRF-TOKEN n'est pas lisible par Angular).
 * En build web, apiBase est vide -> rien ne change (same-origin, XSRF par cookie).
 */
export const apiBaseInterceptor: HttpInterceptorFn = (req, next) => {
  if (environment.apiBase && req.url.startsWith('/api/')) {
    const csrf = inject(ApiCsrfService).token();
    req = req.clone({
      url: environment.apiBase + req.url,
      withCredentials: true,
      setHeaders: csrf ? { 'X-XSRF-TOKEN': csrf } : {}
    });
  }
  return next(req);
};
