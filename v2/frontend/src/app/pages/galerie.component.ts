import { Component } from '@angular/core';
import { GalleryGridComponent, GalleryImage } from '../shared/gallery-grid.component';

const P: GalleryImage[] = [
  { src: '/assets/img/photos/maison.jpg', alt: 'La maison' },
  { src: '/assets/img/photos/piscine.jpg', alt: 'La piscine' },
  { src: '/assets/img/photos/terrasse.jpg', alt: 'La terrasse' },
  { src: '/assets/img/photos/piece-commune.jpg', alt: 'La pièce commune' },
  { src: '/assets/img/photos/petit-dejeuner.jpg', alt: 'Le petit-déjeuner' },
  { src: '/assets/img/photos/spa.jpg', alt: 'Le spa' },
  { src: '/assets/img/photos/spa-2.jpg', alt: 'Le spa — vue intérieure' },
  { src: '/assets/img/photos/spa-3.jpg', alt: 'Le spa — luminothérapie' },
  { src: '/assets/img/photos/spa-4.jpg', alt: 'Le spa — vu depuis la pièce' }
];
const BONUS = [
  '20200914_004626', '20191005_181031', '20191219_112610', '20170921_142635-1', '20200917_130052',
  '20240726_110453', '20240801_170312', '20240817_204042', '20240910_113133', 'c2d5a5b9-4fff-4e6b-a33b-e86cb28490c9',
  'IMG_5639', '20240629_131157', '20230821_122439', '20230809_135635', '20230803_130549',
  '20230801_201901', '20201229_163047', '20210830_163904', '20220719_161319', '20200912_142608',
  '20200901_152833', '20200831_151359', '20200804_133511', '20200804_125721', '20200804_123844',
  '20190817_130739', '20190817_165708', '20191208_153004', '20200804_122255', '20200804_123725',
  '20180415_155036-1', '20170921_171944-1', '20170921_153149-1', 'IMG_5860'
].map(n => ({ src: `/assets/img/photos/full/${n}.jpg`, alt: 'Ardèche — Le bonus photos' }));

@Component({
  selector: 'app-galerie',
  imports: [GalleryGridComponent],
  template: `
    <section class="page-hero container">
      <p class="hero-kicker">Galerie</p>
      <h1>La maison en images</h1>
      <p class="lead">Un aperçu de votre futur séjour.</p>
    </section>

    <section class="section container">
      <app-gallery-grid [imagesInput]="photos" />
    </section>
  `
})
export class GalerieComponent {
  readonly photos = [...P, ...BONUS];
}
