import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiService } from '../core/api.service';
import { SiteService } from '../core/site.service';
import { ChambreSummary, ContactPayload } from '../core/models';
import { RevealDirective } from '../shared/reveal.directive';

@Component({
  selector: 'app-contact',
  imports: [FormsModule, RevealDirective],
  template: `
    @if (site(); as s) {
      <section class="page-hero container">
        <p class="hero-kicker">Contact & réservation</p>
        <h1>Réserver votre séjour</h1>
        <p class="lead">{{ s.ouverture }} — réponse par mail sous 24–48 h.</p>
      </section>

      <section class="section container contact-top">
        <div class="grid-3">
          <div class="card contact-strip-card reveal">
            <span class="service-icon">📞</span>
            <h3>Appeler</h3>
            <p><a [href]="'tel:' + s.telHref" class="btn btn-outline">{{ s.tel }}</a></p>
          </div>
          <div class="card contact-strip-card reveal">
            <span class="service-icon">✉️</span>
            <h3>Écrire</h3>
            <p><a [href]="'mailto:' + s.email" class="btn btn-outline">{{ s.email }}</a></p>
          </div>
          <div class="card contact-strip-card reveal">
            <span class="service-icon">📍</span>
            <h3>Adresse</h3>
            <p class="contact-lines">
              @for (ligne of s.adresseLignes; track ligne; let last = $last) {
                {{ ligne }}@if (!last) {<br>}
              }
            </p>
            <div class="social-links social-lg" style="justify-content:center; margin-top:0.6rem;">
              <a [href]="s.facebook" target="_blank" rel="noopener" aria-label="Facebook" title="Facebook">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z"/></svg>
              </a>
              <a [href]="s.instagram" target="_blank" rel="noopener" aria-label="Instagram" title="Instagram">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1-3.2 0-3.6 0-4.8-.1-3.3-.1-4.8-1.7-4.9-4.9-.1-1.3-.1-1.6-.1-4.8s0-3.6.1-4.8C2.4 4 4 2.4 7.2 2.3c1.2-.1 1.6-.1 4.8-.1zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zm5.2-9.6a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section class="section container" style="padding-top: 0.5rem;">
        <h2 class="section-title reveal">Demander une réservation</h2>
        <p class="center reveal" style="margin-top: -0.5rem;">Réponse sous 24–48 h · acompte 30 % pour bloquer le séjour (min. 2 nuits) · solde à l'arrivée.</p>

        <div class="form-wrap reveal">
          <div class="card">
            @if (sent()) {
              <p class="form-ok">✅ Merci {{ form.nom }} ! Votre demande a bien été envoyée à {{ s.email }}. Nous vous répondons sous 24–48 h.</p>
              <p><button type="button" class="btn btn-outline" (click)="sent.set(false)">Envoyer une autre demande</button></p>
            } @else {
              <form id="contact-form" #f="ngForm" (ngSubmit)="submit(f)">
                <div class="form-row">
                  <label>Nom *
                    <input type="text" name="nom" [(ngModel)]="form.nom" required>
                  </label>
                  <label>Email *
                    <input type="email" name="email" [(ngModel)]="form.email" required email>
                  </label>
                </div>
                <div class="form-row">
                  <label>Téléphone
                    <input type="tel" name="telephone" [(ngModel)]="form.tel">
                  </label>
                  <label>Chambre souhaitée
                    <select name="chambre" [(ngModel)]="form.chambre">
                      <option value="">Peu importe</option>
                      @for (c of chambres(); track c.slug) {
                        <option [value]="c.titre">{{ c.titre }}</option>
                      }
                    </select>
                  </label>
                </div>
                <div class="form-row">
                  <label>Arrivée souhaitée
                    <input type="date" name="arrivee" [(ngModel)]="form.arrivee">
                  </label>
                  <label>Départ souhaité
                    <input type="date" name="depart" [(ngModel)]="form.depart">
                  </label>
                </div>
                <label>Message *
                  <textarea name="message" rows="4" [(ngModel)]="form.message" required placeholder="Vos dates, le nombre de personnes, vos questions…"></textarea>
                </label>
                <button type="submit" class="btn btn-block" [disabled]="sending()">
                  {{ sending() ? 'Envoi…' : 'Envoyer la demande' }}
                </button>
                @if (error()) {
                  <p class="form-error">⚠ {{ error() }} — <a [href]="mailtoLink()">écrire directement par mail</a></p>
                }
                <p class="form-note">Votre demande est envoyée directement à {{ s.email }} (aucun service tiers). En cas de problème, le formulaire ouvre votre messagerie avec un email pré-rempli.</p>
              </form>
            }
          </div>
        </div>
      </section>

      <section class="section container" style="padding-top: 0.5rem;">
        <h2 class="section-title reveal">Plan d'accès</h2>
        <div class="map-wrap reveal">
          <iframe title="Plan d'accès — Les Chênes de l'Aven" loading="lazy"
                  [src]="mapSrc"></iframe>
        </div>
        <p class="center reveal" style="margin-top: 1rem;">
          <a class="pill" href="https://www.openstreetmap.org/?mlat=44.3106&mlon=4.4321#map=14/44.3106/4.4321" target="_blank" rel="noopener">Ouvrir dans OpenStreetMap</a>
          <a class="pill" href="https://www.google.com/maps/dir/?api=1&destination=44.3106,4.4321" target="_blank" rel="noopener">Itinéraire Google Maps</a>
        </p>
      </section>
    }
  `
})
export class ContactComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  readonly site = inject(SiteService).site;
  readonly chambres = signal<ChambreSummary[]>([]);

  readonly form: ContactPayload = { nom: '', email: '', tel: '', chambre: '', arrivee: '', depart: '', message: '' };
  readonly sent = signal(false);
  readonly sending = signal(false);
  readonly error = signal('');

  // iframe OSM : URL fixe et sûre, marquée explicitement comme ressource de confiance
  readonly mapSrc = inject(DomSanitizer).bypassSecurityTrustResourceUrl(
    'https://www.openstreetmap.org/export/embed.html?bbox=4.40%2C44.29%2C4.46%2C44.33&layer=mapnik&marker=44.3106%2C4.4321');

  ngOnInit(): void {
    this.api.chambres().subscribe(c => this.chambres.set(c));
    this.route.queryParamMap.subscribe(q => {
      const ch = q.get('chambre');
      if (ch) this.form.chambre = ch;
    });
  }

  submit(f: { valid: boolean | null }): void {
    if (f.valid === false) return;
    this.sending.set(true);
    this.error.set('');
    this.api.contact(this.form).subscribe({
      next: () => {
        this.sending.set(false);
        this.sent.set(true);
      },
      error: () => {
        this.sending.set(false);
        // fallback : ouvrir le mail pré-rempli dans la messagerie du visiteur
        this.fallbackMailto();
      }
    });
  }

  mailtoLink(): string {
    const sujet = "Demande de réservation — Les Chênes de l'Aven";
    const lignes = [
      'Nom : ' + this.form.nom,
      'Email : ' + this.form.email,
      'Téléphone : ' + (this.form.tel || '—'),
      'Arrivée souhaitée : ' + (this.form.arrivee || '—'),
      'Départ souhaité : ' + (this.form.depart || '—'),
      'Chambre souhaitée : ' + (this.form.chambre || 'Peu importe'),
      '',
      this.form.message
    ];
    return 'mailto:contact@leschenesdelaven.fr?subject=' + encodeURIComponent(sujet)
      + '&body=' + encodeURIComponent(lignes.join('\n'));
  }

  private fallbackMailto(): void {
    window.location.href = this.mailtoLink();
  }
}
