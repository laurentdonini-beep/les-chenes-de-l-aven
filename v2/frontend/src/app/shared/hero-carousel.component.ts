import { Component, OnDestroy, signal } from '@angular/core';

interface Slide { src: string; alt: string; }

/**
 * Carrousel du hero : défilement auto 6 s, flèches, points, pause au survol,
 * Ken Burns en CSS (.hero-img.active), respect de prefers-reduced-motion.
 * Ordre : piscine d'abord, la façade en dernier.
 */
@Component({
  selector: 'app-hero-carousel',
  template: `
    <div class="hero-slider" id="hero-slider" (mouseenter)="pause()" (mouseleave)="resume()">
      @for (s of slides; track s.src; let i = $index) {
        <img [src]="s.src" [alt]="s.alt" class="hero-img" [class.active]="i === cur()"
             [attr.loading]="i === 0 ? null : 'lazy'" decoding="async">
      }
      <button type="button" class="hero-arrow hero-prev" aria-label="Photo précédente" (click)="go(cur() - 1)">‹</button>
      <button type="button" class="hero-arrow hero-next" aria-label="Photo suivante" (click)="go(cur() + 1)">›</button>
      <div class="hero-dots">
        @for (s of slides; track s.src; let i = $index) {
          <button type="button" [class.active]="i === cur()" [attr.aria-label]="'Photo ' + (i + 1)" (click)="go(i)"></button>
        }
      </div>
    </div>
  `
})
export class HeroCarouselComponent implements OnDestroy {
  readonly slides: Slide[] = [
    { src: '/assets/img/photos/carousel-2.jpg', alt: "La piscine des Chênes de l'Aven" },
    { src: '/assets/img/photos/carousel-3.jpg', alt: 'La piscine et les chaises longues' },
    { src: '/assets/img/photos/carousel-4.jpg', alt: 'La terrasse de la piscine' },
    { src: '/assets/img/photos/carousel-1.jpg', alt: "La maison Les Chênes de l'Aven" }
  ];

  readonly cur = signal(0);
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    const reduce = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) {
      this.timer = setInterval(() => this.cur.update(c => (c + 1) % this.slides.length), 6000);
    }
  }

  go(i: number): void {
    this.cur.set((i + this.slides.length) % this.slides.length);
    this.restart();
  }

  pause(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }

  resume(): void {
    if (!this.timer && !this.reducedMotion()) {
      this.timer = setInterval(() => this.cur.update(c => (c + 1) % this.slides.length), 6000);
    }
  }

  private restart(): void {
    this.pause();
    this.resume();
  }

  private reducedMotion(): boolean {
    return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  ngOnDestroy(): void {
    this.pause();
  }
}
