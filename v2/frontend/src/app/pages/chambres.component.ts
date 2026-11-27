import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { ChambreSummary } from '../core/models';
import { RevealDirective } from '../shared/reveal.directive';

@Component({
  selector: 'app-chambres',
  imports: [RouterLink, RevealDirective],
  template: `
    <section class="page-hero container">
      <p class="hero-kicker">Nos chambres</p>
      <h1>Nos 4 chambres</h1>
      <p class="lead">Toutes nos chambres sont destinées à 1 ou 2 personnes. Réservation à partir de 2 nuits minimum. Les tarifs figurent sur chaque fiche chambre.</p>
    </section>

    <section class="section container">
      <div class="grid-2">
        @for (c of chambres(); track c.slug) {
          <a [routerLink]="['/chambres', c.slug]" class="card room-card reveal">
            <img [src]="c.image" [alt]="'Chambre ' + c.titre" class="room-card-img" loading="lazy" decoding="async">
            <div class="room-card-body">
              <h3>{{ c.titre }}</h3>
              <p class="room-card-meta">{{ c.surface }} · {{ c.capacite }}</p>
              <p>{{ c.resume }}</p>
              <span class="btn-card">Voir la chambre</span>
            </div>
          </a>
        }
      </div>
    </section>
  `
})
export class ChambresComponent implements OnInit {
  private api = inject(ApiService);
  readonly chambres = signal<ChambreSummary[]>([]);

  ngOnInit(): void {
    this.api.chambres().subscribe(c => this.chambres.set(c));
  }
}
