import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { SiteService } from '../core/site.service';
import { ChambreSummary, Reservation, Site } from '../core/models';
import { BoNavComponent } from '../shared/bo-nav.component';
import { CalendarComponent } from '../shared/calendar.component';
import { DateFRPipe } from '../shared/date-fr.pipe';
import { DispoResume, resumeDispo } from '../shared/dispo-utils';

/**
 * /bo/calendriers — voir/modifier la saison d'ouverture + calendrier
 * des disponibilités par chambre (avec statut Complet / nuits libres).
 */
@Component({
  selector: 'app-bo-calendars',
  imports: [RouterLink, FormsModule, BoNavComponent, CalendarComponent, DateFRPipe],
  styles: [`
    .bo-msg { border-radius: 8px; padding: 0.6rem 0.9rem; margin-bottom: 1rem; }
    .bo-msg.ok { background: #e6f2e8; color: #22392c; }
    .bo-msg.err { background: #fdecea; color: #b3261e; }
    .bo-note { color: var(--texte-doux); font-size: 0.85rem; }
    .bo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.4rem; align-items: start; }
    @media (max-width: 900px) { .bo-grid { grid-template-columns: 1fr; } }
  `],
  template: `
    <section class="container">
      <app-bo-nav />
      <h1 style="font-size:1.7rem; margin-bottom:1.2rem;">Saison & calendriers</h1>

      @if (msg(); as m) { <p class="bo-msg" [class.ok]="m.ok" [class.err]="!m.ok">{{ m.text }}</p> }

      @if (site(); as s) {
        <div class="bo-grid">
          <div class="card">
            <h2>Saison d'ouverture</h2>
            <p style="font-weight:600; color: var(--vert); font-size: 1.05rem;">
              Saison actuelle : du {{ s.saison.debut | dateFR }} au {{ s.saison.fin | dateFR }}
            </p>
            <p class="bo-note">Les jours hors saison apparaissent « fermés » dans les calendriers (récurrent chaque année, mois/jour).</p>
            <form #sf="ngForm" (ngSubmit)="saveSaison(sf)">
              <div class="form-row">
                <label>Ouverture * <input type="date" name="sdebut" [(ngModel)]="saisonForm.debut" required></label>
                <label>Fermeture * <input type="date" name="sfin" [(ngModel)]="saisonForm.fin" required></label>
              </div>
              <button type="submit" class="btn btn-outline btn-block" [disabled]="busy()">Enregistrer la saison</button>
            </form>
          </div>

          <div class="card">
            <h2>Calendrier par chambre</h2>
            <label>Chambre
              <select name="calRoom" [ngModel]="calRoom()" (ngModelChange)="calRoom.set($event)">
                @for (c of chambres(); track c.slug) {
                  <option [value]="c.slug">{{ c.titre }}</option>
                }
              </select>
            </label>
            @if (calRoom()) {
              <app-calendar [room]="calRoom()" />
              @if (resumeCal(); as r) {
                <p class="bo-note" style="margin-top: 0.8rem;">
                  @if (r.terminee) {
                    La saison est terminée (fin le {{ r.fin | dateFR }}).
                  } @else if (r.complet) {
                    🔴 <strong>Complet</strong> jusqu'au {{ r.fin | dateFR }} — aucune nuit libre.
                  } @else {
                    🟢 <strong>{{ r.libres }} nuit{{ r.libres > 1 ? 's' : '' }} libres</strong> jusqu'au {{ r.fin | dateFR }} (sur {{ r.total }} restantes).
                  }
                </p>
              }
            }
            <p class="bo-note">Jours orange = réservés / vacances. Pour bloquer une période : onglet <a routerLink="/bo/reservations">Réservations</a>.</p>
          </div>
        </div>
      }
    </section>
  `
})
export class BoCalendarsComponent implements OnInit {
  private http = inject(HttpClient);
  private api = inject(ApiService);
  readonly site = inject(SiteService).site;

  readonly chambres = signal<ChambreSummary[]>([]);
  readonly calRoom = signal('');
  saisonForm = { debut: '', fin: '' };
  readonly msg = signal<{ ok: boolean; text: string } | null>(null);
  readonly busy = signal(false);

  readonly resumeCal = computed<DispoResume | null>(() => {
    const s = this.site();
    return s ? resumeDispo(s.saison, this.reservations(), this.calRoom()) : null;
  });

  private reservations = signal<Reservation[]>([]);

  ngOnInit(): void {
    this.api.chambres().subscribe(c => {
      this.chambres.set(c);
      if (!this.calRoom() && c.length) this.calRoom.set(c[0].slug);
    });
    this.api.disponibilites().subscribe(r => this.reservations.set(r));
    const s = this.site();
    if (s) this.saisonForm = { debut: s.saison.debut, fin: s.saison.fin };
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
}
