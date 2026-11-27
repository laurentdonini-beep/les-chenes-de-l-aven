import { Component, HostListener, inject } from '@angular/core';
import { LightboxService } from './lightbox.service';

/** Visionneuse plein écran : flèches, clavier (Échap/←/→), swipe tactile, compteur, légende. */
@Component({
  selector: 'app-lightbox',
  template: `
    @if (lb.open() && lb.current(); as img) {
      <div class="lightbox open" role="dialog" aria-modal="true" aria-label="Visionneuse photo"
           (click)="onBackdrop($event)" (touchstart)="onTouchStart($event)" (touchend)="onTouchEnd($event)">
        <span class="lightbox-caption">{{ img.alt }}</span>
        <button class="lightbox-btn lightbox-close" aria-label="Fermer" (click)="lb.close()">×</button>
        <button class="lightbox-btn lightbox-prev" aria-label="Photo précédente" (click)="lb.show(lb.index() - 1)">‹</button>
        <img class="lightbox-img" [src]="img.src" [alt]="img.alt" loading="lazy" decoding="async">
        <button class="lightbox-btn lightbox-next" aria-label="Photo suivante" (click)="lb.show(lb.index() + 1)">›</button>
        <span class="lightbox-counter">{{ lb.index() + 1 }} / {{ lb.count() }}</span>
      </div>
    }
  `
})
export class LightboxComponent {
  readonly lb = inject(LightboxService);
  private touchX: number | null = null;

  onBackdrop(e: MouseEvent): void {
    if (e.target === e.currentTarget) this.lb.close();
  }

  onTouchStart(e: TouchEvent): void {
    this.touchX = e.touches[0].clientX;
  }

  onTouchEnd(e: TouchEvent): void {
    if (this.touchX === null) return;
    const dx = e.changedTouches[0].clientX - this.touchX;
    if (Math.abs(dx) > 40) this.lb.show(this.lb.index() + (dx < 0 ? 1 : -1));
    this.touchX = null;
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (!this.lb.open()) return;
    if (e.key === 'Escape') this.lb.close();
    if (e.key === 'ArrowLeft') this.lb.show(this.lb.index() - 1);
    if (e.key === 'ArrowRight') this.lb.show(this.lb.index() + 1);
  }
}
