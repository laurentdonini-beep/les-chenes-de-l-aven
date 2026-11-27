import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, ViewChild, signal } from '@angular/core';
import { RevealDirective } from './reveal.directive';
import { ZoomDirective } from './zoom.directive';

export interface GalleryImage { src: string; alt: string; }

type Sizes = Record<string, [number, number]>;

/**
 * Galerie "best grid" (style Modula) : rangées de hauteur égale, bas aligné.
 * Les tailles d'images connues (img-sizes.json) servent à calculer les rangées
 * avant le chargement ; sinon on retombe sur les dimensions naturelles.
 */
@Component({
  selector: 'app-gallery-grid',
  imports: [RevealDirective, ZoomDirective],
  template: `
    <div class="gallery-grid" #grid>
      @for (im of images(); track im.src) {
        <img [src]="im.src" [alt]="im.alt" loading="lazy" decoding="async" class="reveal" appZoom (load)="layout()">
      }
    </div>
  `
})
export class GalleryGridComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) set imagesInput(v: GalleryImage[]) { this.images.set(v); }
  readonly images = signal<GalleryImage[]>([]);

  @ViewChild('grid') grid!: ElementRef<HTMLElement>;

  private sizes: Sizes | null = null;
  private resizeTimer: ReturnType<typeof setTimeout> | null = null;

  ngAfterViewInit(): void {
    fetch('/assets/js/img-sizes.json')
      .then(r => (r.ok ? r.json() : null))
      .then(j => { this.sizes = j; this.layout(); })
      .catch(() => this.layout());
    // re-layout quand toutes les images sont chargées
    window.addEventListener('load', this.onWindowLoad);
    this.layout();
  }

  ngOnDestroy(): void {
    window.removeEventListener('load', this.onWindowLoad);
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
  }

  private onWindowLoad = (): void => this.layout();

  @HostListener('window:resize')
  onResize(): void {
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => this.layout(), 150);
  }

  layout(): void {
    const grid = this.grid?.nativeElement;
    if (!grid) return;
    const gap = window.innerWidth <= 640 ? 8 : 12;
    // aplatit les rangées existantes
    grid.querySelectorAll('.g-row').forEach(row => {
      while (row.firstChild) grid.appendChild(row.firstChild);
      row.remove();
    });
    const imgs = Array.from(grid.querySelectorAll('img')) as HTMLImageElement[];
    if (!imgs.length) return;
    const W = grid.clientWidth;
    if (!W) return;
    const targetH = Math.max(160, Math.min(300, W / 3));
    const items = imgs.map(im => {
      const src = im.getAttribute('src') || '';
      const key = src.replace(/^\/assets\/img\//, '').split('?')[0];
      const s = (this.sizes && this.sizes[key]) || (im.naturalWidth ? [im.naturalWidth, im.naturalHeight] as [number, number] : null);
      return { im, a: s && s[1] ? s[0] / s[1] : 1 };
    });
    let row: typeof items = [];
    let rowA = 0;
    const flush = (isLast: boolean) => {
      if (!row.length) return;
      let h = (W - gap * (row.length - 1)) / rowA;
      let stretch = false;
      if (isLast && h > targetH) { h = targetH; stretch = true; }
      const div = document.createElement('div');
      div.className = 'g-row';
      div.style.height = h + 'px';
      row.forEach(it => {
        it.im.style.height = '100%';
        it.im.style.objectFit = 'cover';
        if (stretch) {
          it.im.style.width = 'auto';
          it.im.style.flex = it.a + ' 1 0px';
        } else {
          it.im.style.width = Math.round(it.a * h) + 'px';
          it.im.style.flex = '0 1 auto';
        }
        div.appendChild(it.im);
      });
      grid.appendChild(div);
      row = [];
      rowA = 0;
    };
    items.forEach((it, i) => {
      row.push(it);
      rowA += it.a;
      if (rowA * targetH + gap * (row.length - 1) >= W || i === items.length - 1) flush(i === items.length - 1);
    });
  }
}
