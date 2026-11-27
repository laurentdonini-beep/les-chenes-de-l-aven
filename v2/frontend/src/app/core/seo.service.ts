import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { combineLatest, filter, map } from 'rxjs';
import { SiteService } from './site.service';
import { Site } from './models';

/**
 * SEO par route : <title>, meta description, canonical, OpenGraph/Twitter,
 * et JSON-LD BreadcrumbList sur les sous-pages (LodgingBusiness statique dans index.html).
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private siteSvc = inject(SiteService);

  init(): void {
    const navEnd$ = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.deepest(this.route))
    );
    combineLatest([navEnd$, this.siteSvc.site$]).subscribe(([route, site]) => {
      if (!site) return;
      const data = route.snapshot.data as { title?: string; description?: string; image?: string };
      const url = (this.router.url || '/').split('?')[0];
      this.apply(site, url, data);
    });
  }

  private deepest(route: ActivatedRoute): ActivatedRoute {
    let r = route;
    while (r.firstChild) r = r.firstChild;
    return r;
  }

  private apply(site: Site, url: string, data: { title?: string; description?: string; image?: string }): void {
    const isHome = url === '/' || url === '';
    const title = isHome
      ? `${site.nom} — Chambres d'hôtes à Orgnac-l'Aven (Sud Ardèche)`
      : `${data.title ?? ''} — ${site.nom}`;
    const description = data.description
      ?? `${site.baseline} — ${site.ouverture}. ${site.adresse}. ${site.tel}`;
    const canonical = site.url + (url === '/' ? '/' : url.replace(/\/?$/, '/'));
    const image = site.url + (data.image ?? site.imageOg);

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: canonical });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });

    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonical);

    // Breadcrumb JSON-LD (sous-pages uniquement)
    const ld = document.getElementById('ld-breadcrumb');
    if (ld) {
      if (isHome) {
        ld.textContent = '';
      } else {
        ld.textContent = JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Accueil', item: site.url + '/' },
            { '@type': 'ListItem', position: 2, name: data.title ?? '', item: canonical }
          ]
        });
      }
    }
  }
}
