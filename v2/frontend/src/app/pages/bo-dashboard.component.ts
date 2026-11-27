import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { SiteService } from '../core/site.service';
import { ChambreSummary, Reservation } from '../core/models';
import { BoNavComponent } from '../shared/bo-nav.component';
import { DateFRPipe } from '../shared/date-fr.pipe';
import { StatsGlobal, computeStats } from '../shared/dispo-utils';

/**
 * /bo — Tableau de bord : KPIs sur la saison, taux d'occupation par chambre,
 * prochaines réservations.
 */
@Component({
  selector: 'app-bo-dashboard',
  imports: [RouterLink, BoNavComponent, DateFRPipe],
  styles: [`
    .kpi .kpi-val { font-family: var(--font-display); font-size: 2rem; font-weight: 700; color: var(--vert); line-height: 1.1; }
    .kpi .kpi-label { color: var(--texte-doux); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
    .bar { height: 10px; background: var(--sable); border-radius: 999px; overflow: hidden; margin: 0.45rem 0; }
    .bar > span { display: block; height: 100%; background: var(--terra); border-radius: 999px; }
    .bar.ok > span { background: var(--vert); }
    .statut-complet { color: #b3261e; font-weight: 700; }
    .statut-ok { color: var(--vert); font-weight: 600; }
    table.bo-table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
    table.bo-table th, table.bo-table td { text-align: left; padding: 0.5rem 0.6rem; border-bottom: 1px solid var(--sable); vertical-align: top; }
    table.bo-table th { color: var(--texte-doux); font-weight: 600; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em; }
  `],
  template: `
    <section class="container">
      <app-bo-nav />
      @if (site(); as s) {
        <h1 style="font-size:1.7rem; margin-bottom:0.2rem;">Tableau de bord</h1>
        <p class="bo-note" style="color:var(--texte-doux); margin-bottom:1.2rem;">
          Saison : du {{ s.saison.debut | dateFR }} au {{ s.saison.fin | dateFR }} ·
          <a routerLink="/bo/calendriers">modifier la saison</a> ·
          <a routerLink="/bo/reservations">gérer les réservations</a>
        </p>

        @if (stats(); as st) {
          <div class="grid-3" style="margin-bottom:1.4rem;">
            <div class="card kpi"><p class="kpi-label">Chambres</p><p class="kpi-val">{{ st.totalChambres }}</p></div>
            <div class="card kpi"><p class="kpi-label">Capacité saison (4 chambres)</p><p class="kpi-val">{{ st.capaciteTotale }}</p><p class="bo-note" style="color:var(--texte-doux)">{{ st.nuitsSaison }} nuits / chambre</p></div>
            <div class="card kpi"><p class="kpi-label">Taux d'occupation</p><p class="kpi-val">{{ st.taux }} %</p></div>
            <div class="card kpi"><p class="kpi-label">Nuits réservées</p><p class="kpi-val">{{ st.nuitsReservees }}</p></div>
            <div class="card kpi"><p class="kpi-label">Nuits libres</p><p class="kpi-val">{{ st.nuitsLibres }}</p></div>
            <div class="card kpi">
              <p class="kpi-label">Réservations</p>
              <p class="kpi-val">{{ reservations().length }}</p>
              <p class="bo-note" style="color:var(--texte-doux)">{{ st.enCours }} en cours · {{ st.aVenir.length }} à venir · {{ st.passees }} passées</p>
            </div>
          </div>

          <div class="bo-grid">
            <div class="card">
              <h2>Occupation par chambre</h2>
              @for (c of st.parChambre; track c.slug) {
                <div style="margin-bottom: 1rem;">
                  <p style="display:flex; justify-content:space-between; margin:0;">
                    <strong>{{ titreOf(c.slug) }}</strong>
                    @if (c.complet) {
                      <span class="statut-complet">🔴 Complet</span>
                    } @else {
                      <span class="statut-ok">{{ c.taux }} % · {{ c.libres }} libres</span>
                    }
                  </p>
                  <div class="bar" [class.ok]="!c.complet"><span [style.width.%]="c.taux"></span></div>
                  <p class="bo-note" style="color:var(--texte-doux)">{{ c.reservees }} / {{ st.nuitsSaison }} nuits réservées</p>
                </div>
              }
              @if (st.plusReservee) {
                <p class="bo-note" style="color:var(--texte-doux)">Chambre la plus réservée : <strong>{{ titreOf(st.plusReservee) }}</strong></p>
              }
            </div>

            <div class="card">
              <h2>Prochaines réservations</h2>
              @if (st.aVenir.length === 0) {
                <p class="bo-note" style="color:var(--texte-doux); font-style:italic;">Aucune réservation à venir — la maison est entièrement disponible.</p>
              } @else {
                <table class="bo-table">
                  <thead><tr><th>Chambre</th><th>Du</th><th>Au</th><th>Note</th></tr></thead>
                  <tbody>
                    @for (r of st.aVenir.slice(0, 8); track r.id) {
                      <tr>
                        <td>{{ titreOf(r.chambre) }}</td>
                        <td>{{ r.debut | dateFR }}</td>
                        <td>{{ r.fin | dateFR }}</td>
                        <td>{{ r.note || '—' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
                <p style="margin-top:0.8rem;"><a routerLink="/bo/reservations" class="btn btn-outline btn-small">Voir toutes les réservations</a></p>
              }
            </div>
          </div>
        }
      }
    </section>
  `
})
export class BoDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private api = inject(ApiService);
  readonly site = inject(SiteService).site;

  readonly chambres = signal<ChambreSummary[]>([]);
  readonly reservations = signal<Reservation[]>([]);

  readonly stats = computed<StatsGlobal | null>(() => {
    const s = this.site();
    return s ? computeStats(this.chambres(), this.reservations(), s.saison) : null;
  });

  ngOnInit(): void {
    this.api.chambres().subscribe(c => this.chambres.set(c));
    this.api.disponibilites().subscribe(r => this.reservations.set(r));
  }

  titreOf(slug: string): string {
    return this.chambres().find(c => c.slug === slug)?.titre ?? slug;
  }
}
