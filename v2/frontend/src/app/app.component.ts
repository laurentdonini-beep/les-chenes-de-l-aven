import { Component, inject, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { SiteService } from './core/site.service';
import { SeoService } from './core/seo.service';
import { ApiCsrfService } from './core/api-csrf.service';
import { LightboxService } from './shared/lightbox.service';
import { LightboxComponent } from './shared/lightbox.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LightboxComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  readonly site = inject(SiteService).site;
  readonly year = new Date().getFullYear();
  readonly navOpen = signal(false);
  /** true sur les routes /bo* : on masque le header/footer du site public. */
  readonly isBo = signal(false);

  private router = inject(Router);
  private lightbox = inject(LightboxService);

  constructor() {
    inject(SeoService).init();
    this.isBo.set(this.router.url.startsWith('/bo'));
    // à chaque navigation : fermer le menu mobile et vider la lightbox
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.navOpen.set(false);
      this.lightbox.reset();
      this.isBo.set(this.router.url.startsWith('/bo'));
    });
    // App mobile (Capacitor) : on démarre directement sur le backoffice /bo
    if (Capacitor.isNativePlatform()) {
      // récupère le token CSRF (cross-origin) pour les requêtes mutantes
      inject(ApiCsrfService).bootstrap();
      if (this.router.url === '/' || this.router.url === '') {
        this.router.navigate(['/bo']);
      }
    }
  }

  toggleNav(): void {
    this.navOpen.update(v => !v);
  }
}
