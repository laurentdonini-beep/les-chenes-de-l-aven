import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { NotificationsService } from './notifications.service';
import { MessageView } from '../core/models';

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
      <a routerLink="/bo/tarifs" routerLinkActive="active">💰 Tarifs & promos</a>
      <a routerLink="/bo/messages" routerLinkActive="active">📨 Messages@if (nonTraites()) { <span class="bo-badge">{{ nonTraites() }}</span> }</a>
      <span class="bo-nav-user">{{ auth.user() }}</span>
      <style>.bo-badge { background: var(--terra); color:#fff; border-radius:999px; font-size:0.72rem; font-weight:700; padding:0 0.4rem; margin-left:0.25rem; }</style>
      <button type="button" class="btn btn-outline btn-small" (click)="logout()">Se déconnecter</button>
    </nav>
  `
})
export class BoNavComponent implements OnInit, OnDestroy {
  readonly auth = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);
  private notif = inject(NotificationsService);

  readonly nonTraites = signal(0);
  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    // mobile : notifications locales (nouveau message / nouvelle réservation)
    this.notif.start();
    this.refreshBadge();
    this.timer = setInterval(() => this.refreshBadge(), 60000);
  }

  ngOnDestroy(): void {
    this.notif.stop();
    if (this.timer) clearInterval(this.timer);
  }

  private refreshBadge(): void {
    this.http.get<MessageView[]>('/api/admin/messages').subscribe({
      next: ms => this.nonTraites.set(ms.filter(m => !m.traite).length),
      error: () => {}
    });
  }

  logout(): void {
    this.auth.logout().subscribe(() => this.router.navigate(['/bo/login']));
  }
}
