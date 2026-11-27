import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { combineLatest } from 'rxjs';
import { ApiService } from '../core/api.service';
import { Reservation, Saison } from '../core/models';

interface CalDay { n: number; cls: string; title?: string; }
interface CalMonth { label: string; offset: number; pads: number[]; days: CalDay[]; }

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const DOWS = ['lu', 'ma', 'me', 'je', 've', 'sa', 'di'];
const NB_MOIS = 2;
const MAX_OFFSET = 24;

/**
 * Calendrier des disponibilités d'une chambre : 2 mois visibles, chevrons ‹ ›
 * discrets de part et d'autre, animation de glissement, jours réservés en orange,
 * hors-saison "fermé" (récurrence annuelle via la saison du site).
 */
@Component({
  selector: 'app-calendar',
  imports: [],
  template: `
    <div class="cal">
      <button type="button" class="cal-nav" [disabled]="offset() <= 0" (click)="nav(-1)" aria-label="Mois précédents">‹</button>
      <div class="cal-months" [class.anim-next]="anim() === 1" [class.anim-prev]="anim() === -1">
        @for (mo of months(); track mo.label) {
          <div class="cal-month">
            <h4>{{ mo.label }}</h4>
            <div class="cal-grid">
              @for (d of dows; track d) { <span class="cal-dow">{{ d }}</span> }
              @for (p of mo.pads; track $index) { <span></span> }
              @for (d of mo.days; track d.n) {
                <span class="cal-day" [class]="'cal-day ' + d.cls" [title]="d.title ?? null">{{ d.n }}</span>
              }
            </div>
          </div>
        }
      </div>
      <button type="button" class="cal-nav" [disabled]="offset() >= maxOffset" (click)="nav(1)" aria-label="Mois suivants">›</button>
    </div>
  `
})
export class CalendarComponent implements OnInit {
  @Input({ required: true }) room!: string;

  private api = inject(ApiService);

  readonly dows = DOWS;
  readonly maxOffset = MAX_OFFSET;
  readonly offset = signal(0);
  readonly months = signal<CalMonth[]>([]);
  readonly anim = signal<0 | 1 | -1>(0);

  private reservations: Reservation[] = [];
  private saison: Saison | null = null;
  private today = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();

  ngOnInit(): void {
    combineLatest([this.api.disponibilites(this.room), this.api.saison()]).subscribe(([res, saison]) => {
      this.reservations = res.filter(r => r.chambre === this.room);
      this.saison = saison;
      this.render(0);
    });
  }

  nav(dir: 1 | -1): void {
    const next = this.offset() + dir;
    if (next < 0 || next > MAX_OFFSET) return;
    this.offset.set(next);
    this.render(dir);
  }

  private render(dir: 0 | 1 | -1): void {
    const base = new Date(this.today.getFullYear(), this.today.getMonth() + this.offset(), 1);
    const months: CalMonth[] = [];
    for (let i = 0; i < NB_MOIS; i++) {
      const d = new Date(base.getFullYear(), base.getMonth() + i, 1);
      months.push(this.monthBlock(d.getFullYear(), d.getMonth()));
    }
    this.months.set(months);
    if (dir !== 0) {
      // relance l'animation CSS après le rendu
      this.anim.set(0);
      requestAnimationFrame(() => {
        this.anim.set(dir);
        setTimeout(() => this.anim.set(0), 350);
      });
    }
  }

  private monthBlock(y: number, m: number): CalMonth {
    const offset = (new Date(y, m, 1).getDay() + 6) % 7;
    const nbDays = new Date(y, m + 1, 0).getDate();
    const days: CalDay[] = [];
    for (let day = 1; day <= nbDays; day++) {
      const dt = new Date(y, m, day);
      let cls = '';
      if (dt < this.today) cls += ' past';
      if (dt.getTime() === this.today.getTime()) cls += ' today';
      if (this.bookedOn(y, m, day)) cls += ' booked';
      let title: string | undefined;
      if (this.saison && this.closedOn(y, m, day)) {
        cls += ' closed';
        title = 'Fermé (hors saison)';
      }
      days.push({ n: day, cls: cls.trim(), title });
    }
    return { label: `${MOIS[m]} ${y}`, offset, pads: Array(offset).fill(0), days };
  }

  private bookedOn(y: number, m: number, d: number): boolean {
    const t = new Date(y, m, d).getTime();
    return this.reservations.some(r => {
      const a = new Date(r.debut + 'T00:00:00').getTime();
      const b = new Date(r.fin + 'T23:59:59').getTime();
      return t >= a && t <= b;
    });
  }

  private md(dateStr: string): number {
    const p = dateStr.slice(5, 10).split('-');
    return Number(p[0]) * 100 + Number(p[1]);
  }

  private closedOn(y: number, m: number, day: number): boolean {
    if (!this.saison || !this.saison.debut || !this.saison.fin) return false;
    const v = (m + 1) * 100 + day;
    return v < this.md(this.saison.debut) || v > this.md(this.saison.fin);
  }
}
