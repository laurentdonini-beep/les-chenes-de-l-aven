import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { SiteService } from '../core/site.service';
import { NotificationsService } from './notifications.service';
import { MessageView } from '../core/models';

/**
 * Layout du backoffice (/bo*) : barre latérale à GAUCHE (marque, menu, utilisateur,
 * déconnexion, retour au site public) + zone de contenu à droite avec <router-outlet>.
 * Le header/footer du site public sont masqués sur ces routes (voir app.component).
 */
@Component({
  selector: 'app-bo-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  styles: [`
    .bo-shell { display: flex; align-items: stretch; min-height: 100vh; background: var(--creme); }

    /* ----- Barre latérale gauche ----- */
    .bo-sidebar {
      width: 248px; flex: 0 0 248px;
      background: var(--vert); color: var(--creme);
      display: flex; flex-direction: column; gap: 0.25rem;
      padding: 1.4rem 1rem 1.2rem;
      position: sticky; top: 0; height: 100vh;
    }
    .bo-brand { display: flex; align-items: center; gap: 0.6rem; text-decoration: none; color: var(--creme); margin-bottom: 1.2rem; }
    .bo-brand img { width: 34px; height: 34px; }
    .bo-brand .bo-brand-name { font-family: var(--font-display); font-weight: 700; font-size: 1.02rem; line-height: 1.2; }
    .bo-brand .bo-brand-sub { display: block; font-family: var(--font-body); font-size: 0.68rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(247,243,234,0.65); }

    .bo-menu { display: flex; flex-direction: column; gap: 0.2rem; }
    .bo-menu a {
      display: flex; align-items: center; gap: 0.55rem;
      text-decoration: none; color: rgba(247,243,234,0.85);
      font-weight: 600; font-size: 0.93rem;
      padding: 0.55rem 0.8rem; border-radius: 10px;
      transition: background 0.18s, color 0.18s;
    }
    .bo-menu a:hover { background: rgba(247,243,234,0.12); color: #fff; }
    .bo-menu a.active { background: var(--terra); color: #fff; }
    .bo-badge { background: var(--creme); color: var(--vert); border-radius: 999px; font-size: 0.72rem; font-weight: 700; padding: 0 0.42rem; margin-left: auto; }
    .bo-menu a.active .bo-badge { background: rgba(255,255,255,0.9); }

    .bo-side-foot { margin-top: auto; padding-top: 1rem; border-top: 1px solid rgba(247,243,234,0.18); display: flex; flex-direction: column; gap: 0.5rem; }
    .bo-side-user { font-size: 0.8rem; color: rgba(247,243,234,0.75); word-break: break-all; }
    .bo-side-foot .btn-logout {
      background: transparent; color: var(--creme); border: 1.5px solid rgba(247,243,234,0.45);
      border-radius: 999px; padding: 0.4rem 0.9rem; font-weight: 600; font-size: 0.85rem; cursor: pointer;
      transition: background 0.18s;
    }
    .bo-side-foot .btn-logout:hover { background: rgba(247,243,234,0.14); }
    .bo-side-foot .bo-back-site { color: rgba(247,243,234,0.8); font-size: 0.85rem; text-decoration: none; }
    .bo-side-foot .bo-back-site:hover { color: #fff; text-decoration: underline; }

    /* ----- Zone de contenu ----- */
    .bo-content { flex: 1; min-width: 0; padding: 1.6rem clamp(1rem, 3vw, 2.6rem) 3.5rem; }
    .bo-content > * { max-width: 1120px; margin-left: auto; margin-right: auto; }

    /* ----- Mobile : la barre latérale devient une barre horizontale en haut ----- */
    @media (max-width: 860px) {
      .bo-shell { flex-direction: column; }
      .bo-sidebar { width: 100%; flex: none; height: auto; position: static; padding: 0.8rem 1rem; }
      .bo-brand { margin-bottom: 0.5rem; }
      .bo-menu { flex-direction: row; flex-wrap: nowrap; overflow-x: auto; padding-bottom: 0.3rem; }
      .bo-menu a { white-space: nowrap; }
      .bo-side-foot { margin-top: 0.4rem; padding-top: 0.5rem; flex-direction: row; align-items: center; gap: 0.7rem; }
      .bo-content { padding: 1.2rem 4% 3rem; }
    }
  `],
  template: `
    <div class="bo-shell">
      <aside class="bo-sidebar">
        <a class="bo-brand" routerLink="/bo">
          <img src="/assets/img/favicon.svg" alt="" width="34" height="34">
          <span class="bo-brand-name">{{ site()?.nom }}<span class="bo-brand-sub">Backoffice</span></span>
        </a>
        <nav class="bo-menu" aria-label="Navigation du backoffice">
          <a routerLink="/bo" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">📊 Tableau de bord</a>
          <a routerLink="/bo/reservations" routerLinkActive="active">🗓️ Réservations</a>
          <a routerLink="/bo/calendriers" routerLinkActive="active">🗓️ Saison &amp; calendriers</a>
          <a routerLink="/bo/tarifs" routerLinkActive="active">💶 Tarifs &amp; promos</a>
          <a routerLink="/bo/messages" routerLinkActive="active">✉️ Messages@if (nonTraites()) { <span class="bo-badge">{{ nonTraites() }}</span> }</a>
        </nav>
        <div class="bo-side-foot">
          <span class="bo-side-user">{{ auth.user() }}</span>
          <button type="button" class="btn-logout" (click)="logout()">Se déconnecter</button>
          <a class="bo-back-site" routerLink="/">← Voir le site public</a>
        </div>
      </aside>
      <div class="bo-content">
        <router-outlet />
      </div>
    </div>
  `
})
export class BoLayoutComponent implements OnInit, OnDestroy {
  readonly auth = inject(AuthService);
  readonly site = inject(SiteService).site;
  private router = inject(Router);
  private http = inject(HttpClient);
  private notif = inject(NotificationsService);

  readonly nonTraites = signal(0);
  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    // mobile (Capacitor) : notifications locales (nouveau message / nouvelle réservation)
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
