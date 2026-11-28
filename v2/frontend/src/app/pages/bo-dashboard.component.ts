import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { SiteService } from '../core/site.service';
import { ChambreSummary, Reservation } from '../core/models';
import { DateFRPipe } from '../shared/date-fr.pipe';
import { StatsGlobal, computeStats } from '../shared/dispo-utils';

/**
 * /bo — Tableau de bord : KPIs sur la saison, taux d'occupation par chambre,
 * prochaines réservations.
 */
@Component({
  selector: 'app-bo-dashboard',
  imports: [RouterLink, DateFRPipe],
  styles: [`
    .kpi .kpi-val { font-family: var(--font-display); font-size: 2rem; font-weight: 700; color: var(--vert); line-height: 1.1; }
    .kpi .kpi-label { color: var(--texte-doux); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
    .bar { height: 10px; background: var(--sable); border-radius: 999px; overflow: hidden; margin: 0.45rem 0; }
    .bar > span { display: block; height: 100%; background: var(--terra); border-radius: 999px; }
    .bar.ok > span { background: var(--vert); }
    .statut-complet { color: #b3261e; font-weight: 700; }
    .bo-alert { border-radius: 10px; padding: 0.55rem 0.9rem; margin-bottom: 0.5rem; font-size: 0.95rem; }
    .bo-alert.err { background: #fdecea; color: #b3261e; font-weight: 600; }
    .bo-alert.warn { background: #fdf3e0; color: #8a5a00; }
    .bo-alert.info { background: #e6f2e8; color: #22392c; }
    .statut-ok { color: var(--vert); font-weight: 600; }
    table.bo-table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
    table.bo-table th, table.bo-table td { text-align: left; padding: 0.5rem 0.6rem; border-bottom: 1px solid var(--sable); vertical-align: top; }
    table.bo-table th { color: var(--texte-doux); font-weight: 600; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em; }
  `],
  template: `
    <section class="container">
      @if (site(); as s) {
        <h1 style="font-size:1.7rem; margin-bottom:0.2rem;">Tableau de bord</h1>
        <p class="bo-note" style="color:var(--texte-doux); margin-bottom:1.2rem;">
          Saison : du {{ s.saison.debut | dateFR }} au {{ s.saison.fin | dateFR }} ·
          <a routerLink="/bo/calendriers">modifier la saison</a> ·
          <a routerLink="/bo/reservations">gérer les réservations</a>
        </p>

        @if (alertes().length) {
          <div style="margin-bottom:1.2rem;">
            @for (a of alertes(); track a.text) {
              <p class="bo-alert" [class]="'bo-alert ' + a.cls">{{ a.icon }} {{ a.text }}</p>
            }
          </div>
        }

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

  /** Alertes affichées en haut du tableau de bord. */
  readonly alertes = computed<{ icon: string; text: string; cls: string }[]>(() => {
    const s = this.site();
    const st = this.stats();
    if (!s || !st) return [];
    const out: { icon: string; text: string; cls: string }[] = [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const parse = (d: string) => { const [y, m, dd] = d.split('-').map(Number); return new Date(y, (m || 1) - 1, dd || 1); };
    const debut = parse(s.saison.debut), fin = parse(s.saison.fin);
    const DAY = 86400000;
    if (fin < today) {
      out.push({ icon: '🏁', text: `La saison est terminée (fin le ${s.saison.fin}). Pensez à mettre à jour la saison pour l'année prochaine.`, cls: 'info' });
    } else {
      const jours = Math.round((debut.getTime() - today.getTime()) / DAY);
      if (debut > today && jours <= 45) {
        out.push({ icon: '⏰', text: `La saison ouvre dans ${jours} jour(s) (le ${s.saison.debut}).`, cls: 'warn' });
      }
    }
    for (const c of st.parChambre) {
      const nom = this.titreOf(c.slug);
      if (c.complet) out.push({ icon: '🔴', text: `${nom} est COMPLET sur la saison.`, cls: 'err' });
      else if (st.nuitsSaison > 0 && c.libres <= 10) out.push({ icon: '🟠', text: `${nom} : plus que ${c.libres} nuit(s) libres.`, cls: 'warn' });
    }
    if (st.aVenir.length > 0) {
      const n = st.aVenir[0];
      out.push({ icon: '📅', text: `Prochaine réservation : ${this.titreOf(n.chambre)}, du ${n.debut} au ${n.fin}${n.note ? ' (' + n.note + ')' : ''}.`, cls: 'info' });
    }
    return out;
  });

  ngOnInit(): void {
    this.api.chambres().subscribe(c => this.chambres.set(c));
    this.api.disponibilites().subscribe(r => this.reservations.set(r));
  }

  titreOf(slug: string): string {
    return this.chambres().find(c => c.slug === slug)?.titre ?? slug;
  }
}
