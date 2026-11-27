import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { ApiService } from '../core/api.service';
import { SiteService } from '../core/site.service';
import { ChambreSummary, Reservation, Site } from '../core/models';
import { DateFRPipe } from '../shared/date-fr.pipe';

/**
 * Backoffice /bo : gérer les réservations (disponibilités) et les dates
 * d'ouverture de la saison. Appelle l'API admin sécurisée (session + CSRF).
 */
@Component({
  selector: 'app-bo-dashboard',
  imports: [RouterLink, FormsModule, DateFRPipe],
  styles: [`
    .bo-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin: 2.5rem 0 1.2rem; }
    .bo-head h1 { margin: 0; font-size: 1.9rem; }
    .bo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.4rem; align-items: start; }
    @media (max-width: 900px) { .bo-grid { grid-template-columns: 1fr; } }
    .bo-msg { border-radius: 8px; padding: 0.6rem 0.9rem; margin-bottom: 1rem; }
    .bo-msg.ok { background: #e6f2e8; color: #22392c; }
    .bo-msg.err { background: #fdecea; color: #b3261e; }
    table.bo-table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
    table.bo-table th, table.bo-table td { text-align: left; padding: 0.5rem 0.6rem; border-bottom: 1px solid var(--sable); vertical-align: top; }
    table.bo-table th { color: var(--texte-doux); font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.04em; }
    .bo-del { border: none; background: transparent; color: #b3261e; cursor: pointer; font-size: 0.85rem; text-decoration: underline; padding: 0; }
    .bo-empty { color: var(--texte-doux); font-style: italic; }
    .bo-note { color: var(--texte-doux); font-size: 0.85rem; }
  `],
  template: `
    @if (site(); as s) {
      <section class="container">
        <div class="bo-head">
          <div>
            <h1>Backoffice — Disponibilités</h1>
            <p class="bo-note">Connecté : {{ auth.user() }} · <a routerLink="/">voir le site</a></p>
          </div>
          <button type="button" class="btn btn-outline btn-small" (click)="logout()">Se déconnecter</button>
        </div>

        @if (msg(); as m) { <p class="bo-msg" [class.ok]="m.ok" [class.err]="!m.ok">{{ m.text }}</p> }

        <div class="bo-grid">
          <div class="card">
            <h2>Ajouter une réservation</h2>
            <form #f="ngForm" (ngSubmit)="addRes(f)">
              <label>Chambre *
                <select name="chambre" [(ngModel)]="newRes.chambre" required>
                  <option value="" disabled>Choisir…</option>
                  @for (c of chambres(); track c.slug) {
                    <option [value]="c.slug">{{ c.titre }}</option>
                  }
                </select>
              </label>
              <div class="form-row">
                <label>Du * <input type="date" name="debut" [(ngModel)]="newRes.debut" required></label>
                <label>Au * <input type="date" name="fin" [(ngModel)]="newRes.fin" required></label>
              </div>
              <label>Note (visible en interne)
                <input type="text" name="note" [(ngModel)]="newRes.note" placeholder="ex : famille Martin, acompte reçu…">
              </label>
              <button type="submit" class="btn btn-block" [disabled]="busy()">Ajouter</button>
              <p class="bo-note">Les jours réservés apparaissent en orange sur le calendrier de chaque chambre.</p>
            </form>
          </div>

          <div class="card">
            <h2>Saison d'ouverture</h2>
            <p class="bo-note">Les jours hors saison apparaissent « fermés » dans les calendriers (récurrent chaque année, mois/jour). Actuellement : du {{ s.saison.debut | dateFR }} au {{ s.saison.fin | dateFR }}.</p>
            <form #sf="ngForm" (ngSubmit)="saveSaison(sf)">
              <div class="form-row">
                <label>Ouverture * <input type="date" name="sdebut" [(ngModel)]="saisonForm.debut" required></label>
                <label>Fermeture * <input type="date" name="sfin" [(ngModel)]="saisonForm.fin" required></label>
              </div>
              <button type="submit" class="btn btn-outline btn-block" [disabled]="busy()">Enregistrer la saison</button>
            </form>
          </div>
        </div>

        <div class="card" style="margin-top: 1.4rem;">
          <h2>Réservations enregistrées ({{ reservations().length }})</h2>
          @if (reservations().length === 0) {
            <p class="bo-empty">Aucune réservation pour le moment — la maison est entièrement disponible.</p>
          } @else {
            <table class="bo-table">
              <thead>
                <tr><th>Chambre</th><th>Du</th><th>Au</th><th>Note</th><th></th></tr>
              </thead>
              <tbody>
                @for (r of reservations(); track r.id) {
                  <tr>
                    <td>{{ titreOf(r.chambre) }}</td>
                    <td>{{ r.debut | dateFR }}</td>
                    <td>{{ r.fin | dateFR }}</td>
                    <td>{{ r.note || '—' }}</td>
                    <td><button type="button" class="bo-del" (click)="deleteRes(r)">Supprimer</button></td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </section>
    }
  `
})
export class BoDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private api = inject(ApiService);
  readonly auth = inject(AuthService);
  private router = inject(Router);
  readonly site = inject(SiteService).site;

  readonly chambres = signal<ChambreSummary[]>([]);
  readonly reservations = signal<Reservation[]>([]);
  newRes = { chambre: '', debut: '', fin: '', note: '' };
  saisonForm = { debut: '', fin: '' };
  readonly msg = signal<{ ok: boolean; text: string } | null>(null);
  readonly busy = signal(false);

  ngOnInit(): void {
    this.api.chambres().subscribe(c => this.chambres.set(c));
    const s = this.site();
    if (s) this.saisonForm = { debut: s.saison.debut, fin: s.saison.fin };
    this.reload();
  }

  titreOf(slug: string): string {
    return this.chambres().find(c => c.slug === slug)?.titre ?? slug;
  }

  reload(): void {
    this.http.get<Reservation[]>('/api/admin/disponibilites').subscribe(r => this.reservations.set(r));
  }

  addRes(f: { valid: boolean | null }): void {
    if (f.valid === false) return;
    this.busy.set(true);
    this.msg.set(null);
    this.http.post<Reservation>('/api/admin/disponibilites', this.newRes).subscribe({
      next: () => {
        this.busy.set(false);
        this.msg.set({ ok: true, text: '✅ Réservation ajoutée.' });
        this.newRes = { chambre: '', debut: '', fin: '', note: '' };
        this.reload();
      },
      error: e => {
        this.busy.set(false);
        const detail = e?.error?.error ?? e?.error?.message ?? 'Erreur inconnue';
        this.msg.set({ ok: false, text: '⚠ ' + detail });
      }
    });
  }

  deleteRes(r: Reservation): void {
    this.http.delete(`/api/admin/disponibilites/${r.id}`).subscribe({
      next: () => {
        this.msg.set({ ok: true, text: `✅ Réservation du ${r.debut} au ${r.fin} supprimée.` });
        this.reload();
      },
      error: () => this.msg.set({ ok: false, text: '⚠ Suppression impossible.' })
    });
  }

  saveSaison(f: { valid: boolean | null }): void {
    if (f.valid === false) return;
    const s = this.site();
    if (!s) return;
    this.busy.set(true);
    const payload: Site = { ...s, saison: { debut: this.saisonForm.debut, fin: this.saisonForm.fin } };
    this.http.put('/api/admin/site', payload).subscribe({
      next: () => {
        this.busy.set(false);
        this.msg.set({ ok: true, text: '✅ Saison enregistrée : du ' + this.saisonForm.debut + ' au ' + this.saisonForm.fin + '.' });
      },
      error: () => {
        this.busy.set(false);
        this.msg.set({ ok: false, text: '⚠ Enregistrement de la saison impossible.' });
      }
    });
  }

  logout(): void {
    this.auth.logout().subscribe(() => this.router.navigate(['/bo/login']));
  }
}
