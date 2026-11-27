import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, Meta, Title } from '@angular/platform-browser';
import { ApiService } from '../core/api.service';
import { SiteService } from '../core/site.service';
import { ChambreDetail, Reservation } from '../core/models';
import { resumeDispo } from '../shared/dispo-utils';
import { RevealDirective } from '../shared/reveal.directive';
import { GalleryGridComponent, GalleryImage } from '../shared/gallery-grid.component';
import { CalendarComponent } from '../shared/calendar.component';
import { DateFRPipe } from '../shared/date-fr.pipe';

@Component({
  selector: 'app-chambre-detail',
  imports: [RouterLink, RevealDirective, GalleryGridComponent, CalendarComponent, DateFRPipe],
  template: `
    @if (chambre(); as c) {
      @if (site(); as s) {
        <article class="room-page container">
          <p class="breadcrumb"><a routerLink="/chambres">← Toutes les chambres</a></p>
          <div class="room-hero">
            <img [src]="c.image" [alt]="'Chambre ' + c.titre" class="room-hero-img" loading="lazy" decoding="async">
            <div class="room-hero-text">
              <h1>{{ c.titre }}</h1>
              <ul class="room-meta">
                <li>{{ c.surface }}</li>
                <li>{{ c.capacite }}</li>
              </ul>
            </div>
          </div>

          @if (galleryPhotos().length) {
            <section class="room-gallery">
              <h2>Photos de la chambre</h2>
              <app-gallery-grid [imagesInput]="galleryPhotos()" />
            </section>
          }

          <div class="room-body">
            <div class="room-content">
              <div [innerHTML]="contenuHtml()"></div>
              <div class="room-infos">
                <h2>Infos pratiques</h2>
                <ul>
                  <li>Réservation à partir de 2 nuits minimum</li>
                  <li>Wi-Fi gratuit</li>
                  <li>Parking privatif</li>
                  <li>Taxe de séjour réglée sur place</li>
                  <li>Animaux non admis</li>
                </ul>
              </div>
              <section class="room-dispo reveal" id="dispo">
                <h2>Disponibilités de cette chambre</h2>
                <p class="legend"><span class="swatch"></span> disponible &nbsp; <span class="swatch booked"></span> réservé &nbsp; <span class="swatch closed"></span> fermé (hors saison)</p>
                <p class="bo-note" style="margin-bottom: 0.8rem;">Saison : du {{ s.saison.debut | dateFR }} au {{ s.saison.fin | dateFR }} ({{ s.ouverture.toLowerCase() }}).</p>
                <app-calendar [room]="c.slug" />
                @if (resumeDispo(); as r) {
                  <p class="bo-note" style="margin-top: 0.8rem;">
                    @if (r.terminee) {
                      La saison est terminée (fin le {{ r.fin | dateFR }}).
                    } @else if (r.complet) {
                      🔴 <strong>Complet</strong> — plus aucune nuit disponible jusqu'au {{ r.fin | dateFR }}.
                    } @else {
                      🟢 <strong>{{ r.libres }} nuit{{ r.libres > 1 ? 's' : '' }}</strong> encore disponible{{ r.libres > 1 ? 's' : '' }} jusqu'au {{ r.fin | dateFR }} (sur {{ r.total }} restantes).
                    }
                  </p>
                }
              </section>
            </div>
            <aside class="room-aside">
              <h2>Équipements</h2>
              <ul class="equip-list">
                @for (eq of c.equipements; track eq) { <li>{{ eq }}</li> }
              </ul>
              <div class="room-tarif">
                <h2>Tarif</h2>
                <p class="room-price">{{ s.tarif2 }} <span>/ 2 pers.</span> &nbsp;·&nbsp; {{ s.tarif1 }} <span>/ 1 pers.</span></p>
                <p class="room-tarif-note">{{ s.tarifNote }}</p>
                <p class="room-tarif-note"><strong>Paiement :</strong> {{ s.paiement }}</p>
              </div>
              <a [routerLink]="['/contact']" [queryParams]="{ chambre: c.titre }" class="btn btn-block">Demander cette chambre</a>
            </aside>
          </div>
        </article>
      }
    } @else if (notFound()) {
      <section class="page-hero container">
        <h1>Chambre introuvable</h1>
        <p class="lead"><a routerLink="/chambres">← Retour à la liste des chambres</a></p>
      </section>
    }
  `
})
export class ChambreDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private siteSvc = inject(SiteService);
  private sanitizer = inject(DomSanitizer);
  private title = inject(Title);
  private meta = inject(Meta);

  readonly site = this.siteSvc.site;
  readonly chambre = signal<ChambreDetail | null>(null);
  readonly notFound = signal(false);
  readonly dispo = signal<Reservation[]>([]);

  /** Résumé dispo : nuits libres restantes, ou « complet » si plus rien. */
  readonly resumeDispo = computed(() =>
    resumeDispo(this.site()?.saison ?? null, this.dispo(), this.chambre()?.slug ?? ''));

  readonly contenuHtml = computed(() => {
    const c = this.chambre();
    return c ? this.sanitizer.bypassSecurityTrustHtml(c.contenu) : null;
  });

  readonly galleryPhotos = computed<GalleryImage[]>(() => {
    const c = this.chambre();
    return c ? c.photos.map(p => ({ src: p, alt: c.titre })) : [];
  });

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.api.disponibilites(slug).subscribe(r => this.dispo.set(r));
    this.api.chambre(slug).subscribe({
      next: c => {
        this.chambre.set(c);
        const nom = this.site()?.nom ?? '';
        this.title.setTitle(`${c.titre} — ${nom}`);
        this.meta.updateTag({ name: 'description', content: c.resume });
      },
      error: () => this.notFound.set(true)
    });
  }
}
