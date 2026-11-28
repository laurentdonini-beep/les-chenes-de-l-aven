import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { ChambreSummary, Reservation } from '../core/models';
import { BoNavComponent } from '../shared/bo-nav.component';
import { DateFRPipe } from '../shared/date-fr.pipe';

interface LigneReservation extends Reservation {
  nuits: number;
  statut: 'À venir' | 'En cours' | 'Passée';
}

/**
 * /bo/reservations — gestion complète des réservations :
 * ajouter (y compris « période de vacances »), filtrer, supprimer.
 */
@Component({
  selector: 'app-bo-reservations',
  imports: [FormsModule, BoNavComponent, DateFRPipe],
  styles: [`
    .bo-msg { border-radius: 8px; padding: 0.6rem 0.9rem; margin-bottom: 1rem; }
    .bo-msg.ok { background: #e6f2e8; color: #22392c; }
    .bo-msg.err { background: #fdecea; color: #b3261e; }
    table.bo-table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
    table.bo-table th, table.bo-table td { text-align: left; padding: 0.5rem 0.6rem; border-bottom: 1px solid var(--sable); vertical-align: top; }
    table.bo-table th { color: var(--texte-doux); font-weight: 600; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em; cursor: pointer; }
    .bo-del { border: none; background: transparent; color: #b3261e; cursor: pointer; font-size: 0.85rem; text-decoration: underline; padding: 0; }
    .bo-edit { border: none; background: transparent; color: var(--vert); cursor: pointer; font-size: 0.85rem; text-decoration: underline; padding: 0; margin-right: 0.6rem; }
    .bo-empty { color: var(--texte-doux); font-style: italic; }
    .bo-note { color: var(--texte-doux); font-size: 0.85rem; }
    .bo-filters { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; }
    .bo-filters label { margin-bottom: 0; font-size: 0.85rem; }
    .statut-venir { color: var(--vert); font-weight: 600; }
    .statut-cours { color: var(--terra); font-weight: 600; }
    .statut-passee { color: var(--texte-doux); }
  `],
  template: `
    <section class="container">
      <app-bo-nav />
      <h1 style="font-size:1.7rem; margin-bottom:1.2rem;">Réservations des chambres</h1>

      @if (msg(); as m) { <p class="bo-msg" [class.ok]="m.ok" [class.err]="!m.ok">{{ m.text }}</p> }

      <div class="bo-grid">
        <div class="card">
          <h2>{{ editId() ? 'Modifier la réservation #' + editId() : 'Ajouter une réservation' }}</h2>
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
            <label>Note (interne)
              <input type="text" name="note" [(ngModel)]="newRes.note" placeholder="ex : famille Martin, acompte reçu…">
            </label>
            <label style="display:flex; align-items:center; gap:0.5rem; font-weight:400;">
              <input type="checkbox" name="vacances" [ngModel]="newRes.vacances" (ngModelChange)="newRes.vacances = $event" style="width:auto; margin:0;">
              Période de vacances / fermeture de la chambre
            </label>
            <button type="submit" class="btn btn-block" [disabled]="busy()">{{ busy() ? 'Enregistrement…' : (editId() ? 'Enregistrer les modifications' : 'Enregistrer') }}</button>
            @if (editId()) {
              <button type="button" class="btn btn-outline btn-block" style="margin-top:0.5rem;" (click)="resetForm()">Annuler la modification</button>
            }
            <p class="bo-note">Les jours réservés apparaissent en orange sur le calendrier de la chambre. Un chevauchement est refusé.</p>
          </form>
        </div>

        <div class="card">
          <h2>Liste ({{ lignesFiltrees().length }})</h2>
          <div class="bo-filters">
            <label>Chambre
              <select name="filtreChambre" [(ngModel)]="filtreChambre">
                <option value="">Toutes</option>
                @for (c of chambres(); track c.slug) {
                  <option [value]="c.slug">{{ c.titre }}</option>
                }
              </select>
            </label>
            <label>Statut
              <select name="filtreStatut" [(ngModel)]="filtreStatut">
                <option value="">Tous</option>
                <option value="À venir">À venir</option>
                <option value="En cours">En cours</option>
                <option value="Passée">Passées</option>
              </select>
            </label>
          </div>

          @if (lignesFiltrees().length === 0) {
            <p class="bo-empty">Aucune réservation ne correspond — la maison est entièrement disponible.</p>
          } @else {
            <table class="bo-table">
              <thead>
                <tr>
                  <th>Chambre</th><th>Du</th><th>Au</th><th>Nuits</th><th>Statut</th><th>Note</th><th></th>
                </tr>
              </thead>
              <tbody>
                @for (r of lignesFiltrees(); track r.id) {
                  <tr>
                    <td>{{ titreOf(r.chambre) }}</td>
                    <td>{{ r.debut | dateFR }}</td>
                    <td>{{ r.fin | dateFR }}</td>
                    <td>{{ r.nuits }}</td>
                    <td>
                      @if (r.statut === 'En cours') { <span class="statut-cours">En cours</span> }
                      @else if (r.statut === 'À venir') { <span class="statut-venir">À venir</span> }
                      @else { <span class="statut-passee">Passée</span> }
                    </td>
                    <td>{{ r.note || '—' }}</td>
                    <td>
                      <button type="button" class="bo-edit" (click)="editRes(r)">Modifier</button>
                      <button type="button" class="bo-del" (click)="deleteRes(r)">Supprimer</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </div>
    </section>
  `
})
export class BoReservationsComponent implements OnInit {
  private http = inject(HttpClient);
  private api = inject(ApiService);

  readonly chambres = signal<ChambreSummary[]>([]);
  readonly reservations = signal<Reservation[]>([]);

  newRes = { chambre: '', debut: '', fin: '', note: '', vacances: false };
  readonly editId = signal<number | null>(null);
  filtreChambre = '';
  filtreStatut = '';
  readonly msg = signal<{ ok: boolean; text: string } | null>(null);
  readonly busy = signal(false);

  readonly lignes = computed<LigneReservation[]>(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const p = (d: string) => { const [y, m, dd] = d.split('-').map(Number); return new Date(y, m - 1, dd); };
    return this.reservations()
      .map((r): LigneReservation => {
        const debut = p(r.debut), fin = p(r.fin);
        const nuits = Math.round((fin.getTime() - debut.getTime()) / 86400000) + 1;
        const statut: LigneReservation['statut'] = fin < today ? 'Passée' : (debut > today ? 'À venir' : 'En cours');
        return { ...r, nuits, statut };
      })
      .sort((a, b) => a.debut.localeCompare(b.debut));
  });

  readonly lignesFiltrees = computed<LigneReservation[]>(() => {
    let l = this.lignes();
    if (this.filtreChambre) l = l.filter(r => r.chambre === this.filtreChambre);
    if (this.filtreStatut) l = l.filter(r => r.statut === this.filtreStatut);
    return l;
  });

  ngOnInit(): void {
    this.api.chambres().subscribe(c => this.chambres.set(c));
    this.reload();
  }

  titreOf(slug: string): string {
    return this.chambres().find(c => c.slug === slug)?.titre ?? slug;
  }

  reload(): void {
    this.api.disponibilites().subscribe(r => this.reservations.set(r));
  }

  addRes(f: { valid: boolean | null }): void {
    if (f.valid === false) return;
    this.busy.set(true);
    this.msg.set(null);
    const note = this.newRes.vacances
      ? ('Vacances' + (this.newRes.note ? ' — ' + this.newRes.note : ''))
      : this.newRes.note;
    const payload = { chambre: this.newRes.chambre, debut: this.newRes.debut, fin: this.newRes.fin, note };
    const editId = this.editId();
    const request = editId
      ? this.http.put<Reservation>(`/api/admin/disponibilites/${editId}`, payload)
      : this.http.post<Reservation>('/api/admin/disponibilites', payload);
    request.subscribe({
      next: () => {
        this.busy.set(false);
        this.msg.set({ ok: true, text: editId ? '✅ Réservation modifiée.' : (this.newRes.vacances ? '✅ Période de vacances enregistrée.' : '✅ Réservation enregistrée.') });
        this.resetForm();
        this.reload();
      },
      error: e => {
        this.busy.set(false);
        const detail = e?.error?.error ?? e?.error?.message ?? 'Erreur inconnue';
        this.msg.set({ ok: false, text: '⚠ ' + detail });
      }
    });
  }

  editRes(r: LigneReservation): void {
    this.editId.set(r.id);
    this.newRes = { chambre: r.chambre, debut: r.debut, fin: r.fin, note: r.note ?? '', vacances: (r.note ?? '').startsWith('Vacances') };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetForm(): void {
    this.editId.set(null);
    this.newRes = { chambre: this.newRes.chambre, debut: '', fin: '', note: '', vacances: false };
  }

  deleteRes(r: Reservation): void {
    this.http.delete(`/api/admin/disponibilites/${r.id}`).subscribe({
      next: () => {
        this.msg.set({ ok: true, text: `✅ Réservation du ${r.debut} au ${r.fin} (${this.titreOf(r.chambre)}) supprimée.` });
        this.reload();
      },
      error: () => this.msg.set({ ok: false, text: '⚠ Suppression impossible.' })
    });
  }
}
