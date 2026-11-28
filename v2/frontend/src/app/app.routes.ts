import { Routes } from '@angular/router';
import { authGuard } from './core/auth.service';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home.component').then(m => m.HomeComponent),
    data: {
      title: "Chambres d'hôtes à Orgnac-l'Aven (Ardèche)",
      description: "Les Chênes de l'Aven, chambres d'hôtes à Orgnac-l'Aven en Ardèche, aux portes de l'Aven d'Orgnac Grand Site de France. 4 chambres climatisées, piscine, spa et petits-déjeuners au bord de l'eau."
    }
  },
  {
    path: 'la-maison',
    loadComponent: () => import('./pages/maison.component').then(m => m.MaisonComponent),
    data: {
      title: 'La maison',
      description: "Découvrez la maison Les Chênes de l'Aven à Orgnac-l'Aven — espaces communs, solarium, terrasse, piscine et petits-déjeuners au bord de l'eau."
    }
  },
  {
    path: 'chambres',
    loadComponent: () => import('./pages/chambres.component').then(m => m.ChambresComponent),
    data: {
      title: 'Chambres',
      description: "4 chambres d'hôtes climatisées à Orgnac-l'Aven, pour 1 ou 2 personnes. Tarifs détaillés sur chaque fiche chambre."
    }
  },
  {
    path: 'chambres/:slug',
    loadComponent: () => import('./pages/chambre-detail.component').then(m => m.ChambreDetailComponent),
    data: { title: 'Chambre' }
  },
  {
    path: 'spa',
    loadComponent: () => import('./pages/spa.component').then(m => m.SpaComponent),
    data: {
      title: 'Spa & bien-être',
      description: "Espace spa aux Chênes de l'Aven — séance de 30 minutes à 5 € par personne, offerte pour tout séjour d'au moins 3 jours."
    }
  },
  {
    path: 'activites',
    loadComponent: () => import('./pages/activites.component').then(m => m.ActivitesComponent),
    data: {
      title: 'Activités & accès',
      description: "Que faire autour d'Orgnac-l'Aven — grottes et avens (Aven d'Orgnac, Grotte Chauvet 2…), rivières Ardèche et Cèze, activités outdoor, villages classés, châteaux, et plan d'accès."
    }
  },
  {
    path: 'galerie',
    loadComponent: () => import('./pages/galerie.component').then(m => m.GalerieComponent),
    data: {
      title: 'Galerie',
      description: "Photos de la maison Les Chênes de l'Aven, de ses chambres, de la piscine et des alentours d'Orgnac-l'Aven."
    }
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact.component').then(m => m.ContactComponent),
    data: {
      title: 'Contact & réservation',
      description: "Contactez Les Chênes de l'Aven à Orgnac-l'Aven pour réserver votre chambre d'hôtes — téléphone, email, formulaire et plan d'accès."
    }
  },
  {
    path: 'credits',
    loadComponent: () => import('./pages/credits.component').then(m => m.CreditsComponent),
    data: {
      title: 'Crédits photos',
      description: "Crédits des photos externes utilisées sur le site (Wikimedia Commons, licences libres)."
    }
  },
  {
    path: 'bo/login',
    loadComponent: () => import('./pages/bo-login.component').then(m => m.BoLoginComponent),
    data: { title: 'Connexion — Backoffice' }
  },
  {
    path: 'bo',
    pathMatch: 'full',
    loadComponent: () => import('./pages/bo-dashboard.component').then(m => m.BoDashboardComponent),
    canActivate: [authGuard],
    data: { title: 'Tableau de bord — Backoffice' }
  },
  {
    path: 'bo/reservations',
    loadComponent: () => import('./pages/bo-reservations.component').then(m => m.BoReservationsComponent),
    canActivate: [authGuard],
    data: { title: 'Réservations — Backoffice' }
  },
  {
    path: 'bo/calendriers',
    loadComponent: () => import('./pages/bo-calendars.component').then(m => m.BoCalendarsComponent),
    canActivate: [authGuard],
    data: { title: 'Saison & calendriers — Backoffice' }
  },
  {
    path: 'bo/tarifs',
    loadComponent: () => import('./pages/bo-tarifs.component').then(m => m.BoTarifsComponent),
    canActivate: [authGuard],
    data: { title: 'Tarifs — Backoffice' }
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found.component').then(m => m.NotFoundComponent),
    data: { title: 'Page introuvable' }
  }
];
