import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CanActivateFn, Router } from '@angular/router';
import { Observable, catchError, firstValueFrom, map, of, tap } from 'rxjs';

/** Authentification du backoffice (session côté serveur, cookie JSESSIONID). */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly user = signal<string | null>(null);

  me(): Observable<{ ok: boolean; email?: string }> {
    return this.http.get<{ ok: boolean; email?: string }>('/api/auth/me').pipe(
      map(r => r),
      tap(r => this.user.set(r.ok ? (r.email ?? null) : null)),
      catchError(() => {
        this.user.set(null);
        return of({ ok: false });
      })
    );
  }

  login(email: string, password: string): Observable<{ ok: boolean; email?: string }> {
    return this.http.post<{ ok: boolean; email?: string }>('/api/auth/login', { email, password }).pipe(
      tap(r => { if (r.ok) this.user.set(r.email ?? email); })
    );
  }

  logout(): Observable<unknown> {
    return this.http.post('/api/auth/logout', {}).pipe(
      tap(() => this.user.set(null))
    );
  }
}

/** Garde /bo : vérifie la session courante, sinon renvoie vers /bo/login. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return firstValueFrom(auth.me()).then(r => (r.ok ? true : router.createUrlTree(['/bo/login'])));
};
