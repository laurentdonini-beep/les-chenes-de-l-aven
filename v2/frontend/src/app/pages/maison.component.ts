import { Component } from '@angular/core';
import { RevealDirective } from '../shared/reveal.directive';
import { GalleryGridComponent, GalleryImage } from '../shared/gallery-grid.component';

const PHOTOS: GalleryImage[] = [
  { src: '/assets/img/photos/full/20200821_085726.jpg', alt: "Les Chênes de l'Aven" },
  { src: '/assets/img/photos/full/20200807_184232.jpg', alt: "Les Chênes de l'Aven" },
  { src: '/assets/img/photos/full/20200720_211244.jpg', alt: "Les Chênes de l'Aven" },
  { src: '/assets/img/photos/full/20200720_211537.jpg', alt: "Les Chênes de l'Aven" },
  { src: '/assets/img/photos/full/20180521_1334292.jpg', alt: "Chambre d'hôtes Sud Ardèche" },
  { src: '/assets/img/photos/full/20191005_1810102.jpg', alt: "Chambre d'hôtes Sud Ardèche" },
  { src: '/assets/img/photos/full/20230803_1126172.jpg', alt: "Chambre d'hôtes Sud Ardèche" },
  { src: '/assets/img/photos/full/20220810_090217.jpg', alt: 'Les petits déjeuners' },
  { src: '/assets/img/photos/full/20200522_175013.jpg', alt: 'Les petits déjeuners' },
  { src: '/assets/img/photos/full/20210713_082328.jpg', alt: 'Les petits déjeuners' },
  { src: '/assets/img/photos/full/20210721_090209.jpg', alt: 'Les petits déjeuners' },
  { src: '/assets/img/photos/full/20230625_085828.jpg', alt: 'Les petits déjeuners' },
  { src: '/assets/img/photos/full/20190926_120727-1.jpg', alt: 'La piscine' },
  { src: '/assets/img/photos/full/20200708_212251-1.jpg', alt: 'La piscine' },
  { src: '/assets/img/photos/full/20190930_170643-2.jpg', alt: 'La piscine' },
  { src: '/assets/img/photos/full/20200821_085702-1.jpg', alt: 'La piscine' },
  { src: '/assets/img/photos/full/20240726_200330-1.jpg', alt: 'La piscine' },
  { src: '/assets/img/photos/full/20200627_195556.jpg', alt: 'La pièce commune' },
  { src: '/assets/img/photos/full/20180601_145054.jpg', alt: 'La pièce commune' },
  { src: '/assets/img/photos/full/20220730_083315.jpg', alt: 'La pièce commune' },
  { src: '/assets/img/photos/full/20220625_110421.jpg', alt: 'La pièce commune' },
  { src: '/assets/img/photos/full/20180506_190313.jpg', alt: 'LE SPA' },
  { src: '/assets/img/photos/full/20190929_200158.jpg', alt: 'LE SPA' },
  { src: '/assets/img/photos/full/20190929_195724.jpg', alt: 'LE SPA' },
  { src: '/assets/img/photos/full/20190929_200258.jpg', alt: 'LE SPA' }
];

@Component({
  selector: 'app-maison',
  imports: [RevealDirective, GalleryGridComponent],
  template: `
    <section class="page-hero container">
      <p class="hero-kicker">Notre maison</p>
      <h1>Un lieu de vie pensé pour vous</h1>
      <p class="lead">Nous avons agrandi notre maison familiale pour y créer vos chambres d'hôtes et plusieurs espaces dédiés à votre confort.</p>
    </section>

    <section class="section container">
      <div class="split reveal">
        <img src="/assets/img/photos/maison.jpg" alt="La maison en pierre de pays" class="split-img" loading="lazy" decoding="async">
        <div class="split-text">
          <h2>Une maison en pierre de pays</h2>
          <p>Jolie maison indépendante en pierre de pays, entourée de chênes verts, entre les Gorges de l'Ardèche et la vallée de la Cèze, à 2 pas de la célèbre grotte de l'Aven d'Orgnac.</p>
        </div>
      </div>
    </section>

    <section class="section container">
      <div class="grid-3">
        <div class="card reveal">
          <h2>La terrasse & la piscine</h2>
          <p>À l'ombre des chênes verts et à proximité de la piscine, vous partagerez votre petit-déjeuner avec les autres hôtes (table de 8 personnes maximum).</p>
          <p>La piscine est ouverte de 8h00 à 19h00 : bassin d'eau salée et chauffée de 10 m (profondeur 1,30 à 1,80 m), plage carrelée d'environ 100 m² avec transats et parasols, sanitaires sous le pool-house.</p>
        </div>
        <div class="card reveal">
          <h2>Les espaces communs</h2>
          <p>Les chambres de l'étage disposent d'une pièce commune à partager, équipée (climatisation fixe) : lecture, jeux de société, télévision, canapé, frigo, évier et micro-ondes.</p>
          <p>En cas de mauvais temps, prenez votre petit-déjeuner dans la véranda du rez-de-chaussée (chambres Pitchouline et Petite-Lauze) ou dans la pièce commune de l'étage (chambres Marron Glacé et Chêne Vert).</p>
        </div>
        <div class="card reveal">
          <h2>Le solarium</h2>
          <p>L'accès aux chambres de l'étage se fait par un escalier extérieur qui donne sur un solarium commun, idéal pour profiter du calme du soir.</p>
        </div>
      </div>
    </section>

    <section class="section container">
      <h2 class="section-title reveal">La maison en photos</h2>
      <app-gallery-grid [imagesInput]="photos" />
    </section>
  `
})
export class MaisonComponent {
  readonly photos = PHOTOS;
}
