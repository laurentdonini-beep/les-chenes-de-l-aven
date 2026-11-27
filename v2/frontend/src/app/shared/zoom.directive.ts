import { Directive, ElementRef, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { LightboxService } from './lightbox.service';

/** Rend une <img> cliquable : elle s'ouvre dans la lightbox plein écran. */
@Directive({ selector: 'img[appZoom]' })
export class ZoomDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLImageElement>);
  private lightbox = inject(LightboxService);

  ngOnInit(): void {
    this.el.nativeElement.classList.add('zoomable');
    this.lightbox.register(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.lightbox.unregister(this.el.nativeElement);
  }

  @HostListener('click')
  onClick(): void {
    this.lightbox.openFrom(this.el.nativeElement);
  }
}
