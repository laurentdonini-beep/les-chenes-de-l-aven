import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { shareReplay } from 'rxjs';
import { Site } from './models';

/** Paramètres généraux du site, chargés une seule fois depuis l'API. */
@Injectable({ providedIn: 'root' })
export class SiteService {
  private http = inject(HttpClient);

  readonly site$ = this.http.get<Site>('/api/public/site').pipe(shareReplay(1));
  readonly site = toSignal<Site | null>(this.site$, { initialValue: null });
}
