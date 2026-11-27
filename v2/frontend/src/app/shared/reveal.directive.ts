import { Directive, ElementRef, OnDestroy, OnInit, inject } from '@angular/core';

/**
 * Animation d'apparition au scroll (.reveal -> .visible), avec filet de sécurité :
 * l'élément devient visible de toute façon 1,5 s après son initialisation.
 */
@Directive({ selector: '.reveal' })
export class RevealDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private observer: IntersectionObserver | null = null;
  private fallback: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    const node = this.el.nativeElement;
    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver(
        entries => entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            this.observer?.unobserve(e.target);
          }
        }),
        { threshold: 0.12 }
      );
      this.observer.observe(node);
    }
    this.fallback = setTimeout(() => node.classList.add('visible'), 1500);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.fallback) clearTimeout(this.fallback);
  }
}
