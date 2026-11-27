import { Component } from '@angular/core';
import { RevealDirective } from '../shared/reveal.directive';

interface Credit { file: string; url: string; author: string; licence: string; }

const CREDITS: Credit[] = [
  { file: "Musée Aven d'Orgnac Ardèche 9.jpg", url: "https://commons.wikimedia.org/wiki/File:Mus%C3%A9e_Aven_d%27Orgnac_Ard%C3%A8che_9.jpg", author: 'Selmoval', licence: 'CC BY-SA 4.0' },
  { file: "Pont d'Arc 2015 - 02.JPG", url: "https://commons.wikimedia.org/wiki/File:Pont_d%27Arc_2015_-_02.JPG", author: 'Superjuju10', licence: 'CC BY-SA 4.0' },
  { file: "Canoë en bas des Gorges de l'Ardèche.jpg", url: "https://commons.wikimedia.org/wiki/File:Cano%C3%AB_en_bas_des_Gorges_de_l%27Ard%C3%A8che.jpg", author: 'Celeda', licence: 'CC BY-SA 4.0' },
  { file: 'Vogüé Flussblick 1.jpg', url: "https://commons.wikimedia.org/wiki/File:Vog%C3%BC%C3%A9_Flussblick_1.jpg", author: 'Superbass', licence: 'CC BY-SA 4.0' },
  { file: 'Château de Vogüé - entrée.jpg', url: "https://commons.wikimedia.org/wiki/File:Ch%C3%A2teau_de_Vog%C3%BC%C3%A9_-_entr%C3%A9e.jpg", author: 'Romainbehar', licence: 'CC0' },
  { file: 'Pont-De-Labeaume place.jpg', url: "https://commons.wikimedia.org/wiki/File:Pont-De-Labeaume_place.jpg", author: 'Kakoula10', licence: 'CC BY-SA 4.0' },
  { file: 'Goudargues 2.JPG', url: "https://commons.wikimedia.org/wiki/File:Goudargues_2.JPG", author: 'Vi..Cult...', licence: 'CC BY-SA 3.0' },
  { file: 'Cascades Sautadet.jpg', url: "https://commons.wikimedia.org/wiki/File:Cascades_Sautadet.jpg", author: 'Benh LIEU SONG', licence: 'CC BY-SA 3.0' },
  { file: 'Rhinocéros grotte Chauvet.jpg', url: "https://commons.wikimedia.org/wiki/File:Rhinoc%C3%A9ros_grotte_Chauvet.jpg", author: 'Inocybe at French Wikipedia', licence: 'Public domain' },
  { file: 'Accrobranche, Bellerive-sur-Allier .jpg', url: "https://commons.wikimedia.org/wiki/File:Accrobranche,_Bellerive-sur-Allier_.jpg", author: 'TCY', licence: 'CC BY-SA 4.0' },
  { file: 'Draisines in Broby, 2009-09-02.jpg', url: "https://commons.wikimedia.org/wiki/File:Draisines_in_Broby,_2009-09-02.jpg", author: 'Erik Lundin', licence: 'CC BY-SA 3.0' },
  { file: 'La Colmiane Les Baus de la Frema via Ferrata 1.jpg', url: "https://commons.wikimedia.org/wiki/File:La_Colmiane_Les_Baus_de_la_Frema_via_Ferrata_1.jpg", author: 'kallerna', licence: 'CC BY-SA 4.0' }
];

@Component({
  selector: 'app-credits',
  imports: [RevealDirective],
  template: `
    <section class="page-hero container">
      <p class="hero-kicker">Mentions légales</p>
      <h1>Crédits photos</h1>
      <p class="lead">Les photos de la maison, des chambres et de la piscine sont la propriété des Chênes de l'Aven (récupérées sur l'ancien site). Certaines photos de la région proviennent de Wikimedia Commons sous licences libres :</p>
    </section>
    <section class="section container">
      <ul class="link-list reveal">
        @for (c of credits; track c.url) {
          <li><a [href]="c.url" target="_blank" rel="noopener">{{ c.file }}</a> — {{ c.author }} — licence {{ c.licence }}</li>
        }
      </ul>
      <p class="reveal">Détail complet : fichier <code>src/assets/img/photos/web/CREDITS.txt</code> dans le dépôt.</p>
    </section>
  `
})
export class CreditsComponent {
  readonly credits = CREDITS;
}
