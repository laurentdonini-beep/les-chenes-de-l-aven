import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { SiteService } from '../core/site.service';
import { RevealDirective } from '../shared/reveal.directive';

interface Spot { img: string; alt: string; titre: string; texte?: string; href: string; cta: string; external?: boolean; }

@Component({
  selector: 'app-activites',
  imports: [RouterLink, RevealDirective],
  template: `
    @if (site(); as s) {
      <section class="page-hero container">
        <p class="hero-kicker">Accès & loisirs</p>
        <h1>Notre région</h1>
        <p class="lead">Notre région regorge de curiosités naturelles : l'aven d'Orgnac, la grotte Chauvet, le Pont d'Arc et de nombreux villages classés. Voici nos incontournables.</p>
      </section>

      <section class="section container">
        <div class="spot-grid">
          @for (sp of top; track sp.titre) {
            <a class="spot-card reveal" [href]="sp.href" [attr.target]="sp.external ? '_blank' : null" [attr.rel]="sp.external ? 'noopener' : null" [routerLink]="sp.external ? null : sp.href">
              <img [src]="sp.img" [alt]="sp.alt" loading="lazy">
              <div class="spot-card-body">
                <h3>{{ sp.titre }}</h3>
                <p>{{ sp.texte }}</p>
                <span class="btn-card">{{ sp.cta }}</span>
              </div>
            </a>
          }
        </div>
      </section>

      <section class="section container">
        <h2 class="section-title reveal">Les grottes & avens</h2>
        <div class="spot-grid">
          @for (sp of grottes; track sp.titre) {
            <a class="spot-card reveal" [href]="sp.href" target="_blank" rel="noopener">
              <img [src]="sp.img" [alt]="sp.alt" loading="lazy">
              <div class="spot-card-body"><h3>{{ sp.titre }}</h3><span class="btn-card">{{ sp.cta }}</span></div>
            </a>
          }
        </div>
      </section>

      <section class="section container">
        <h2 class="section-title reveal">Les rivières</h2>
        <div class="split reveal">
          <img src="/assets/img/photos/web/canoe-ardeche.jpg" alt="Canoë dans les gorges de l'Ardèche" class="split-img" loading="lazy">
          <div class="split-text">
            <h3>L'Ardèche</h3>
            <p>Avec sa réserve naturelle et son célèbre Pont-d'Arc, c'est le lieu touristique à ne pas rater. De nombreux loueurs de canoës proposent une descente en 1 ou 2 jours. La route sauvage des Gorges offre de sensationnels panoramas depuis plus de 10 belvédères.</p>
            <p><a class="pill" href="https://www.gorges-ardeche-pontdarc.fr/activites/canoe/infos-et-parcours/" target="_blank" rel="noopener">Descentes en canoë — Office de Tourisme</a></p>
          </div>
        </div>
        <div class="split reveal">
          <img src="/assets/img/photos/web/sautadet.jpg" alt="Les cascades du Sautadet (vallée de la Cèze)" class="split-img" loading="lazy">
          <div class="split-text">
            <h3>La Cèze</h3>
            <p>Rivière toute proche et bien plus tranquille que l'Ardèche. Demandez-nous nos coins secrets de baignade, un circuit pour découvrir la Venise Gardoise (Goudargues) ou les Cascades du Sautadet.</p>
            <p><a class="pill" href="https://www.tourisme-ceze-cevennes.com/fr/decouvrir/decouvrez-la-vallee-de-la-ceze.html" target="_blank" rel="noopener">Vallée de la Cèze — Office de Tourisme</a></p>
          </div>
        </div>
      </section>

      <section class="section container">
        <h2 class="section-title reveal">Les activités outdoor</h2>
        <p class="center reveal" style="margin-bottom: 1.6rem; color: var(--texte-doux);">Aux portes des Gorges de l'Ardèche :</p>
        <div class="spot-grid">
          @for (sp of outdoor; track sp.titre) {
            <a class="spot-card reveal" [href]="sp.href" target="_blank" rel="noopener">
              <img [src]="sp.img" [alt]="sp.alt" loading="lazy">
              <div class="spot-card-body"><h3>{{ sp.titre }}</h3><p>{{ sp.texte }}</p><span class="btn-card">{{ sp.cta }}</span></div>
            </a>
          }
        </div>
      </section>

      <section class="section container" id="villages">
        <h2 class="section-title reveal">Villages & châteaux</h2>
        <div class="grid-2">
          <div class="card photo reveal">
            <img src="/assets/img/photos/full/20191208_153004.jpg" alt="Ruelle d'un village ardéchois" loading="lazy">
            <h3>Les jolis villages</h3>
            <p><strong>Sud Ardèche (villages classés) :</strong> Labeaume, Vogüé, Balazuc, Ruoms, Banne, Les Vans, Naves, Thines, Saint-Montant.</p>
            <p><strong>Nord Gard (incontournables) :</strong> Barjac, Montclus, Cornillon, Goudargues, Lussan, Uzès.</p>
          </div>
          <div class="card photo reveal">
            <img src="/assets/img/photos/web/chateau-vogue.jpg" alt="Château de Vogüé" loading="lazy">
            <h3>Les châteaux autour de chez nous</h3>
            <p>
              <a class="pill" href="https://www.chateaudevogue.net/" target="_blank" rel="noopener">Château des Roure (Labastide de Virac)</a>
              <a class="pill" href="https://www.chateaudevogue.net/" target="_blank" rel="noopener">Château de Vogüé</a>
              <a class="pill" href="https://www.ville-aubenas.fr/" target="_blank" rel="noopener">Aubenas</a>
              <a class="pill" href="https://www.patrimoine-ardeche.com/visites/largentiere.htm" target="_blank" rel="noopener">Largentière</a>
            </p>
            <p class="center" style="margin-top:1rem;"><a routerLink="/galerie" class="btn btn-outline">Voir toutes les photos de la région</a></p>
          </div>
        </div>
      </section>

      <section class="section container">
        <h2 class="section-title reveal">Plan d'accès</h2>
        <div class="map-wrap reveal">
          <iframe title="Plan d'accès — Orgnac-l'Aven" loading="lazy" [src]="mapSrc"></iframe>
        </div>
        <p class="center reveal">{{ s.adresse }} — <a href="https://www.openstreetmap.org/?mlat=44.3106&mlon=4.4321#map=14/44.3106/4.4321" target="_blank" rel="noopener">Ouvrir dans OpenStreetMap →</a></p>
      </section>
    }
  `
})
export class ActivitesComponent {
  readonly site = inject(SiteService).site;
  readonly mapSrc = inject(DomSanitizer).bypassSecurityTrustResourceUrl(
    'https://www.openstreetmap.org/export/embed.html?bbox=4.40%2C44.29%2C4.46%2C44.33&layer=mapnik&marker=44.3106%2C4.4321');

  readonly top: Spot[] = [
    { img: '/assets/img/photos/aven.jpg', alt: "L'Aven d'Orgnac", titre: "L'Aven d'Orgnac", texte: "Grotte classée Grand Site de France, à quelques minutes de la maison.", href: 'https://www.orgnac.com/', cta: 'Site officiel →', external: true },
    { img: '/assets/img/photos/web/pont-darc.jpg', alt: "Le Pont d'Arc", titre: "Grotte Chauvet 2 & Pont d'Arc", texte: "Les plus belles grottes ornées du monde et l'arche naturelle emblématique.", href: 'https://www.grottechauvet2ardeche.com/', cta: 'Site officiel →', external: true },
    { img: '/assets/img/photos/village.jpg', alt: 'Villages classés du Sud Ardèche', titre: 'Villages de caractère', texte: "Entre Gorges de l'Ardèche et vallée de la Cèze, de nombreux villages classés.", href: '#villages', cta: 'Voir la liste ↓' }
  ];

  readonly grottes: Spot[] = [
    { img: '/assets/img/photos/full/20230801_201901.jpg', alt: "Intérieur de l'Aven d'Orgnac", titre: "Aven d'Orgnac", href: 'https://www.orgnac.com/', cta: 'orgnac.com →', external: true },
    { img: '/assets/img/photos/web/chauvet-peinture.jpg', alt: 'Peinture rupestre, grotte Chauvet', titre: 'Grotte Chauvet 2', href: 'https://www.grottechauvet2ardeche.com/', cta: 'grottechauvet2ardeche.com →', external: true },
    { img: '/assets/img/photos/full/20191005_181031.jpg', alt: 'Aven de la Forêt', titre: 'Aven de la Forêt', href: 'https://grotte-ardeche.fr/', cta: 'grotte-ardeche.fr →', external: true },
    { img: '/assets/img/photos/full/20191219_112610.jpg', alt: 'Grotte St-Marcel', titre: 'Grotte St-Marcel', href: 'https://grotte-ardeche.fr/', cta: 'grotte-ardeche.fr →', external: true },
    { img: '/assets/img/photos/full/20170921_171944-1.jpg', alt: 'Grotte de la Madeleine', titre: 'Grotte de la Madeleine', href: 'https://www.grottemadeleine.com/', cta: 'grottemadeleine.com →', external: true },
    { img: '/assets/img/photos/full/20200804_123725.jpg', alt: 'Grotte de la Salamandre', titre: 'Grotte de la Salamandre', href: 'https://www.grottedelasalamandre.com/fr/', cta: 'grottedelasalamandre.com →', external: true },
    { img: '/assets/img/photos/full/20170921_153149-1.jpg', alt: 'Grotte de la Coqualière', titre: 'Grotte de la Coqualière', href: 'https://www.grotte-cocaliere.com/', cta: 'grotte-cocaliere.com →', external: true }
  ];

  readonly outdoor: Spot[] = [
    { img: '/assets/img/photos/web/accrobranche.jpg', alt: 'Accrobranche', titre: 'Accrobranches', texte: "Parc aventure aux portes des Gorges de l'Ardèche.", href: 'https://www.accroche-aventure.com/', cta: 'accroche-aventure.com →', external: true },
    { img: '/assets/img/photos/web/velorail.jpg', alt: 'Vélo-rail', titre: 'Vélo-rail', texte: 'Balade en draisine sur les anciennes voies ferrées.', href: 'https://www.velorail.fr/', cta: 'velorail.fr →', external: true },
    { img: '/assets/img/photos/web/via-ferrata.jpg', alt: 'Via ferrata', titre: 'Via ferrata & outdoor', texte: "Via ferrata, canyoning, canoë, spéléo en Ardèche.", href: 'https://www.face-sud.com/', cta: 'face-sud.com →', external: true }
  ];
}
