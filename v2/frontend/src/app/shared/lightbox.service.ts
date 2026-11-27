import { Injectable, signal } from '@angular/core';

export interface LightboxImage {
  src: string;
  alt: string;
}

/** Registre des images zoomables de la page courante + état de la visionneuse. */
@Injectable({ providedIn: 'root' })
export class LightboxService {
  private images: LightboxImage[] = [];

  readonly open = signal(false);
  readonly index = signal(0);
  readonly current = signal<LightboxImage | null>(null);
  readonly count = signal(0);

  register(img: HTMLImageElement): void {
    const src = img.currentSrc || img.src;
    if (!src || this.images.some(i => i.src === src)) return;
    this.images.push({ src, alt: img.alt || '' });
    this.count.set(this.images.length);
  }

  unregister(img: HTMLImageElement): void {
    const src = img.currentSrc || img.src;
    this.images = this.images.filter(i => i.src !== src);
    this.count.set(this.images.length);
  }

  openFrom(img: HTMLImageElement): void {
    const src = img.currentSrc || img.src;
    const idx = this.images.findIndex(i => i.src === src);
    if (idx < 0) return;
    this.index.set(idx);
    this.current.set(this.images[idx]);
    this.open.set(true);
    document.body.style.overflow = 'hidden';
  }

  show(i: number): void {
    if (!this.images.length) return;
    const idx = (i + this.images.length) % this.images.length;
    this.index.set(idx);
    this.current.set(this.images[idx]);
  }

  close(): void {
    this.open.set(false);
    this.current.set(null);
    document.body.style.overflow = '';
  }

  reset(): void {
    this.images = [];
    this.count.set(0);
    this.close();
  }
}
