import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChambreDetail, ChambreSummary, ContactPayload, Reservation, Saison } from './models';

/** Appels à l'API publique (lecture) + contact. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  chambres(): Observable<ChambreSummary[]> {
    return this.http.get<ChambreSummary[]>('/api/public/chambres');
  }

  chambre(slug: string): Observable<ChambreDetail> {
    return this.http.get<ChambreDetail>(`/api/public/chambres/${slug}`);
  }

  disponibilites(chambre?: string): Observable<Reservation[]> {
    let params = new HttpParams();
    if (chambre) params = params.set('chambre', chambre);
    return this.http.get<Reservation[]>('/api/public/disponibilites', { params });
  }

  saison(): Observable<Saison> {
    return this.http.get<Saison>('/api/public/saison');
  }

  contact(payload: ContactPayload): Observable<{ ok: boolean; mailEnvoye: boolean }> {
    return this.http.post<{ ok: boolean; mailEnvoye: boolean }>('/api/public/contact', payload);
  }
}
