import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteService } from '../core/site.service';
import { HeroCarouselComponent } from '../shared/hero-carousel.component';
import { RevealDirective } from '../shared/reveal.directive';

@Component({
  selector: 'app-home',
  imports: [RouterLink, HeroCarouselComponent, RevealDirective],
  template: `
    @if (site(); as s) {
      <section class="hero">
        <app-hero-carousel />
        <div class="hero-overlay">
          <div class="container hero-content">
            <p class="hero-kicker">Chambres d'hôtes — Sud Ardèche</p>
            <h1>{{ s.nom }}</h1>
            <p class="hero-sub">Une maison en pierre de pays, entourée de chênes verts, à 2 pas de l'Aven d'Orgnac, Grand Site de France.</p>
            <div class="hero-actions">
              <a routerLink="/contact" class="btn">Réserver</a>
              <a routerLink="/chambres" class="btn btn-ghost">Voir les chambres</a>
            </div>
          </div>
        </div>
      </section>

      <section class="section container">
        <div class="grid-3">
          <div class="card reveal">
            <h2>Un cadre idéal</h2>
            <p>Depuis 2011, nous vous accueillons à Orgnac-l'Aven, charmant village du sud de l'Ardèche. Notre maison spacieuse vous permet de profiter de votre propre espace tout en partageant, si vous le souhaitez, des moments d'échanges et de découverte avec nous et les autres hôtes.</p>
          </div>
          <div class="card reveal">
            <h2>4 chambres tout confort</h2>
            <p>Toutes nos chambres sont destinées à 1 ou 2 personnes, climatisées, avec sanitaire privatif. Certaines disposent d'un accès indépendant par l'extérieur.</p>
            <p><a routerLink="/chambres" class="btn btn-outline btn-small">Découvrir les chambres</a></p>
          </div>
          <div class="card reveal">
            <h2>Petits-déjeuners au bord de la piscine</h2>
            <p>À l'ombre des chênes verts et à proximité de la piscine, vous prendrez votre petit-déjeuner (table de 8 personnes maximum). En cas de mauvais temps, un lieu de repli est prévu.</p>
          </div>
        </div>
      </section>

      <section class="band">
        <div class="container band-inner reveal">
          <div>
            <p class="band-kicker">Tarifs</p>
            <p class="band-price">{{ s.tarif2 }} <span>/ 2 pers.</span> · {{ s.tarif1 }} <span>/ 1 pers.</span></p>
            <p>{{ s.tarifNote }}</p>
          </div>
          <a routerLink="/contact" class="btn btn-light">Demander une réservation</a>
        </div>
      </section>

      <section class="section container">
        <h2 class="section-title reveal">Aux portes de trésors de l'Ardèche</h2>
        <div class="grid-3">
          <div class="card photo reveal">
            <img src="/assets/img/photos/web/aven-orgnac.jpg" alt="L'Aven d'Orgnac" loading="lazy">
            <h3>L'Aven d'Orgnac</h3>
            <p>Grotte classée Grand Site de France, à quelques minutes de la maison.</p>
          </div>
          <div class="card photo reveal">
            <img src="/assets/img/photos/web/pont-darc.jpg" alt="Le Pont d'Arc et la grotte Chauvet" loading="lazy">
            <h3>Grotte Chauvet & Pont d'Arc</h3>
            <p>Les plus belles grottes ornées du monde et l'emblématique arche naturelle.</p>
          </div>
          <div class="card photo reveal">
            <img src="/assets/img/photos/web/vogue-village.jpg" alt="Vogüé, village classé du Sud Ardèche" loading="lazy">
            <h3>Villages de caractère</h3>
            <p>Entre Gorges de l'Ardèche et vallée de la Cèze, de nombreux villages classés.</p>
          </div>
        </div>
        <p class="center reveal"><a routerLink="/activites" class="btn btn-outline">Toutes les idées de sorties</a></p>
      </section>

      <section class="section container">
        <div class="split reveal">
          <img src="/assets/img/photos/piscine.jpg" alt="La piscine et le jardin des Chênes de l'Aven" class="split-img" loading="lazy" decoding="async">
          <div class="split-text">
            <h2>La maison</h2>
            <p>Nous avons agrandi notre maison familiale pour y créer vos chambres d'hôtes et plusieurs espaces dédiés à votre confort : solarium, pièce commune, terrasse et piscine.</p>
            <p><a routerLink="/la-maison" class="btn btn-outline">Visiter la maison</a></p>
          </div>
        </div>
      </section>
    }
  `
})
export class HomeComponent {
  readonly site = inject(SiteService).site;
}
