import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <section class="page-hero container">
      <p class="hero-kicker">Erreur 404</p>
      <h1>Page introuvable</h1>
      <p class="lead">Cette page n'existe pas (ou plus). <a routerLink="/">← Retour à l'accueil</a></p>
    </section>
  `
})
export class NotFoundComponent {}
