import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { SiteService } from '../core/site.service';

/** Page de connexion du backoffice /bo (même style que le site). */
@Component({
  selector: 'app-bo-login',
  imports: [RouterLink, FormsModule],
  styles: [`
    .bo-login { max-width: 420px; margin: 4rem auto; }
    .bo-login h1 { font-size: 1.8rem; margin-bottom: 0.4rem; }
    .bo-login .lead { color: var(--texte-doux); margin-bottom: 1.4rem; }
    .bo-error { color: #b3261e; background: #fdecea; border-radius: 8px; padding: 0.6rem 0.9rem; margin-bottom: 1rem; }
    .bo-hint { margin-top: 1rem; font-size: 0.85rem; color: var(--texte-doux); }
  `],
  template: `
    <section class="container">
      <div class="card bo-login">
        <h1>Backoffice</h1>
        <p class="lead">{{ site()?.nom }} — gestion des disponibilités</p>
        @if (error()) { <p class="bo-error">⚠ {{ error() }}</p> }
        <form #f="ngForm" (ngSubmit)="submit(f)">
          <label>Email
            <input type="email" name="email" [(ngModel)]="email" required autocomplete="username">
          </label>
          <label>Mot de passe
            <input type="password" name="password" [(ngModel)]="password" required autocomplete="current-password">
          </label>
          <button type="submit" class="btn btn-block" [disabled]="busy()">{{ busy() ? 'Connexion…' : 'Se connecter' }}</button>
        </form>
        <p class="bo-hint"><a routerLink="/">← Retour au site public</a></p>
      </div>
    </section>
  `
})
export class BoLoginComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly site = inject(SiteService).site;
  email = '';
  password = '';
  readonly error = signal('');
  readonly busy = signal(false);

  ngOnInit(): void {
    // déjà connecté ? on va directement au tableau de bord
    this.auth.me().subscribe(r => {
      if (r.ok) this.router.navigate(['/bo']);
    });
  }

  submit(f: { valid: boolean | null }): void {
    if (f.valid === false) return;
    this.busy.set(true);
    this.error.set('');
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/bo']),
      error: () => {
        this.busy.set(false);
        this.error.set('Identifiants invalides.');
      }
    });
  }
}
