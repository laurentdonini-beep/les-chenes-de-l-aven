import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';
import { environment } from '../../environments/environment';

/**
 * En mode natif (app mobile Capacitor), l'API est en cross-origin : le cookie XSRF-TOKEN
 * n'est pas lisible via document.cookie. On récupère donc le token CSRF via l'API
 * (GET /api/public/csrf, avec credentials) et l'interceptor le renvoie en en-tête.
 */
@Injectable({ providedIn: 'root' })
export class ApiCsrfService {
  private http = inject(HttpClient);
  readonly token = signal('');

  bootstrap(): void {
    if (environment.apiBase && Capacitor.isNativePlatform()) {
      this.http.get<{ token: string }>(environment.apiBase + '/api/public/csrf', { withCredentials: true })
        .subscribe({ next: r => this.token.set(r.token ?? ''), error: () => {} });
    }
  }
}
