import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { SiteService } from '../core/site.service';
import { ChambreSummary, TarifPeriode } from '../core/models';
import { DateFRPipe } from '../shared/date-fr.pipe';

interface LigneTarifBase {
  slug: string;
  titre: string;
  t1: number | null;
  t2: number | null;
}

/**
 * /bo/tarifs — prix de base par chambre + périodes tarifaires (haute saison,
 * promotions à prix réduits), globales ou par chambre.
 */
@Component({
  selector: 'app-bo-tarifs',
  imports: [FormsModule, DateFRPipe],
  styles: [`
    .bo-msg { border-radius: 8px; padding: 0.6rem 0.9rem; margin-bottom: 1rem; }
    .bo-msg.ok { background: #e6f2e8; color: #22392c; }
    .bo-msg.err { background: #fdecea; color: #b3261e; }
    table.bo-table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
    table.bo-table th, table.bo-table td { text-align: left; padding: 0.5rem 0.6rem; border-bottom: 1px solid var(--sable); vertical-align: middle; }
    table.bo-table th { color: var(--texte-doux); font-weight: 600; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em; }
    .bo-del { border: none; background: transparent; color: #b3261e; cursor: pointer; font-size: 0.85rem; text-decoration: underline; padding: 0; }
    .bo-edit { border: none; background: transparent; color: var(--vert); cursor: pointer; font-size: 0.85rem; text-decoration: underline; padding: 0; margin-right: 0.6rem; }
    .bo-note { color: var(--texte-doux); font-size: 0.85rem; }
    .bo-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 1.4rem; align-items: start; }
    @media (max-width: 1000px) { .bo-grid { grid-template-columns: 1fr; } }
    input[type=number] { width: 90px; }
  `],
  template: `
    <section class="container">
      <h1 style="font-size:1.7rem; margin-bottom:1.2rem;">Tarifs</h1>

      @if (msg(); as m) { <p class="bo-msg" [class.ok]="m.ok" [class.err]="!m.ok">{{ m.text }}</p> }

      @if (site(); as s) {
        <p class="bo-note" style="margin-bottom:1.2rem;">
          Tarifs généraux du site (utilisés si une chambre n'a pas de prix spécifique) :
          <strong>{{ s.tarif2 }} / 2 pers.</strong> · <strong>{{ s.tarif1 }} / 1 pers.</strong>
          — modifiables dans les paramètres généraux (site.json).
        </p>

        <div class="bo-grid">
          <div class="card">
            <h2>Prix de base par chambre</h2>
            <p class="bo-note" style="margin-bottom:0.8rem;">Laisser vide = utiliser les tarifs généraux ci-dessus.</p>
            <table class="bo-table">
              <thead><tr><th>Chambre</th><th>1 pers. (€)</th><th>2 pers. (€)</th><th></th></tr></thead>
              <tbody>
                @for (row of baseRows; track row.slug) {
                  <tr>
                    <td>{{ row.titre }}</td>
                    <td><input type="number" min="0" [attr.name]="'t1-' + row.slug" [(ngModel)]="row.t1" placeholder="{{ s.tarif1 }}"></td>
                    <td><input type="number" min="0" [attr.name]="'t2-' + row.slug" [(ngModel)]="row.t2" placeholder="{{ s.tarif2 }}"></td>
                    <td><button type="button" class="btn btn-outline btn-small" (click)="saveBase(row)">Enregistrer</button></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="card">
            <h2>Périodes tarifaires & promos</h2>
            <p class="bo-note" style="margin-bottom:0.8rem;">
              Une période = des prix différents du <em>au</em> <em>au</em> (inclus). Prix réduits = offre promo.
              « Toutes les chambres » = période globale. Une période spécifique à une chambre prime sur la globale.
            </p>
            <form #f="ngForm" (ngSubmit)="savePeriode(f)" style="margin-bottom:1.2rem; padding-bottom:1rem; border-bottom:1px solid var(--sable);">
              <label>Libellé * (ex : « Haute saison », « Promo -20% »)
                <input type="text" name="label" [(ngModel)]="form.label" required placeholder="Haute saison, Promo printemps…">
              </label>
              <label>Chambre
                <select name="chambre" [(ngModel)]="form.chambre">
                  <option value="">Toutes les chambres</option>
                  @for (c of chambres(); track c.slug) {
                    <option [value]="c.slug">{{ c.titre }}</option>
                  }
                </select>
              </label>
              <div class="form-row">
                <label>Du * <input type="date" name="debut" [(ngModel)]="form.debut" required></label>
                <label>Au * <input type="date" name="fin" [(ngModel)]="form.fin" required></label>
              </div>
              <div class="form-row">
                <label>Prix 1 pers. (€) * <input type="number" min="1" name="prix1" [(ngModel)]="form.prix1" required></label>
                <label>Prix 2 pers. (€) * <input type="number" min="1" name="prix2" [(ngModel)]="form.prix2" required></label>
              </div>
              <button type="submit" class="btn btn-block" [disabled]="busy()">{{ form.id ? 'Modifier la période' : 'Ajouter la période' }}</button>
              @if (form.id) {
                <button type="button" class="btn btn-outline btn-block" style="margin-top:0.5rem;" (click)="resetForm()">Annuler la modification</button>
              }
            </form>

            @if (periodes().length === 0) {
              <p class="bo-note" style="font-style:italic;">Aucune période définie — les prix de base s'appliquent toute l'année.</p>
            } @else {
              <table class="bo-table">
                <thead><tr><th>Libellé</th><th>Chambre</th><th>Période</th><th>Prix</th><th></th></tr></thead>
                <tbody>
                  @for (p of periodes(); track p.id) {
                    <tr>
                      <td><strong>{{ p.label }}</strong></td>
                      <td>{{ p.chambre ? titreOf(p.chambre) : 'Toutes' }}</td>
                      <td>du {{ p.debut | dateFR }} au {{ p.fin | dateFR }}</td>
                      <td>{{ p.prix2 }} €/2p · {{ p.prix1 }} €/1p</td>
                      <td>
                        <button type="button" class="bo-edit" (click)="editPeriode(p)">Modifier</button>
                        <button type="button" class="bo-del" (click)="deletePeriode(p)">Supprimer</button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </div>
        </div>
      }
    </section>
  `
})
export class BoTarifsComponent implements OnInit {
  private http = inject(HttpClient);
  private api = inject(ApiService);
  readonly site = inject(SiteService).site;

  readonly chambres = signal<ChambreSummary[]>([]);
  readonly periodes = signal<TarifPeriode[]>([]);
  baseRows: LigneTarifBase[] = [];

  form = { id: null as number | null, label: '', chambre: '', debut: '', fin: '', prix1: null as number | null, prix2: null as number | null };
  readonly msg = signal<{ ok: boolean; text: string } | null>(null);
  readonly busy = signal(false);

  ngOnInit(): void {
    this.api.chambres().subscribe(c => {
      this.chambres.set(c);
      this.baseRows = c.map(x => ({ slug: x.slug, titre: x.titre, t1: x.tarif1 ?? null, t2: x.tarif2 ?? null }));
    });
    this.reloadPeriodes();
  }

  titreOf(slug: string): string {
    return this.chambres().find(c => c.slug === slug)?.titre ?? slug;
  }

  reloadPeriodes(): void {
    this.http.get<TarifPeriode[]>('/api/admin/tarifs').subscribe(p => this.periodes.set(p));
  }

  saveBase(row: LigneTarifBase): void {
    this.msg.set(null);
    this.http.put(`/api/admin/chambres/${row.slug}/tarifs`, { tarif1: row.t1, tarif2: row.t2 }).subscribe({
      next: () => this.msg.set({ ok: true, text: `✅ Prix de base enregistrés pour ${row.titre}.` }),
      error: () => this.msg.set({ ok: false, text: '⚠ Enregistrement impossible.' })
    });
  }

  savePeriode(f: { valid: boolean | null }): void {
    if (f.valid === false) return;
    this.busy.set(true);
    this.msg.set(null);
    const payload = {
      chambre: this.form.chambre || null,
      debut: this.form.debut,
      fin: this.form.fin,
      prix1: this.form.prix1,
      prix2: this.form.prix2,
      label: this.form.label
    };
    const request = this.form.id
      ? this.http.put<TarifPeriode>(`/api/admin/tarifs/${this.form.id}`, payload)
      : this.http.post<TarifPeriode>('/api/admin/tarifs', payload);
    request.subscribe({
      next: () => {
        this.busy.set(false);
        this.msg.set({ ok: true, text: this.form.id ? '✅ Période modifiée.' : '✅ Période ajoutée — visible sur les fiches chambres.' });
        this.resetForm();
        this.reloadPeriodes();
      },
      error: e => {
        this.busy.set(false);
        const detail = e?.error?.error ?? e?.error?.message ?? 'Erreur inconnue';
        this.msg.set({ ok: false, text: '⚠ ' + detail });
      }
    });
  }

  editPeriode(p: TarifPeriode): void {
    this.form = { id: p.id, label: p.label, chambre: p.chambre ?? '', debut: p.debut, fin: p.fin, prix1: p.prix1, prix2: p.prix2 };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetForm(): void {
    this.form = { id: null, label: '', chambre: '', debut: '', fin: '', prix1: null, prix2: null };
  }

  deletePeriode(p: TarifPeriode): void {
    this.http.delete(`/api/admin/tarifs/${p.id}`).subscribe({
      next: () => {
        this.msg.set({ ok: true, text: `✅ Période « ${p.label} » supprimée.` });
        this.reloadPeriodes();
      },
      error: () => this.msg.set({ ok: false, text: '⚠ Suppression impossible.' })
    });
  }
}
