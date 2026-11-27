import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';

/** Barre de navigation du backoffice (onglets + utilisateur + déconnexion). */
@Component({
  selector: 'app-bo-nav',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="bo-nav">
      <span class="bo-nav-title">Backoffice</span>
      <a routerLink="/bo" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">📊 Tableau de bord</a>
      <a routerLink="/bo/reservations" routerLinkActive="active">📅 Réservations</a>
      <a routerLink="/bo/calendriers" routerLinkActive="active">🗓️ Saison & calendriers</a>
      <span class="bo-nav-user">{{ auth.user() }}</span>
      <button type="button" class="btn btn-outline btn-small" (click)="logout()">Se déconnecter</button>
    </nav>
  `
})
export class BoNavComponent {
  readonly auth = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.auth.logout().subscribe(() => this.router.navigate(['/bo/login']));
  }
}
