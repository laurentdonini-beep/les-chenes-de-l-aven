import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteService } from '../core/site.service';
import { RevealDirective } from '../shared/reveal.directive';
import { GalleryGridComponent, GalleryImage } from '../shared/gallery-grid.component';

const PHOTOS: GalleryImage[] = [
  { src: '/assets/img/photos/spa.jpg', alt: 'Le spa — bain à remous et lumières' },
  { src: '/assets/img/photos/spa-2.jpg', alt: 'Le spa — vue intérieure' },
  { src: '/assets/img/photos/spa-3.jpg', alt: 'Le spa — luminothérapie' },
  { src: '/assets/img/photos/spa-4.jpg', alt: 'Le spa — vu depuis la pièce' }
];

@Component({
  selector: 'app-spa',
  imports: [RouterLink, RevealDirective, GalleryGridComponent],
  template: `
    @if (site(); as s) {
      <section class="page-hero container">
        <p class="hero-kicker">Bien-être</p>
        <h1>Spa & détente</h1>
        <p class="lead">Après une journée de visite, profitez de notre espace spa.</p>
      </section>

      <section class="section container">
        <div class="tarif-card reveal">
          <p class="band-price">{{ s.spa }}</p>
          <p>Le spa (ou Jacuzzi) reste disponible pour vos moments de détente et de bien-être. Il suffit de nous prévenir à l'avance pour le mettre à votre disposition.</p>
          <p>Ce bain à remous avec luminothérapie, aromathérapie et une eau chauffée à 35° vous apportera tous les bienfaits nécessaires à la relaxation (4 places assises et 1 place allongée).</p>
        </div>
      </section>

      <section class="section container" style="padding-top: 0.5rem;">
        <h2 class="section-title reveal">Le spa en images</h2>
        <app-gallery-grid [imagesInput]="photos" />
      </section>

      <section class="section container" style="padding-top: 0.5rem;">
        <div class="split reveal">
          <img src="/assets/img/photos/spa.jpg" alt="Espace spa" class="split-img" loading="lazy" decoding="async">
          <div class="split-text">
            <h2>Un moment pour soi</h2>
            <p>Située à quelques minutes des sites les plus visités de l'Ardèche, notre maison est aussi un havre de paix : piscine, jardin arboré et espace spa vous attendent au retour de vos balades.</p>
            <p><a routerLink="/contact" class="btn btn-outline">Réserver votre séjour</a></p>
          </div>
        </div>
      </section>
    }
  `
})
export class SpaComponent {
  readonly site = inject(SiteService).site;
  readonly photos = PHOTOS;
}
