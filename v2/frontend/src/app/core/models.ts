export interface NavItem {
  label: string;
  url: string;
  cta?: boolean;
}

export interface Site {
  nom: string;
  baseline: string;
  hote: string;
  adresseLignes: string[];
  adresse: string;
  tel: string;
  telHref: string;
  email: string;
  ouverture: string;
  saison: { debut: string; fin: string };
  tarif1: string;
  tarif2: string;
  tarifNote: string;
  paiement: string;
  spa: string;
  nav: NavItem[];
  url: string;
  facebook: string;
  instagram: string;
  imageOg: string;
  coords: { lat: number; lon: number };
}

export interface ChambreSummary {
  slug: string;
  titre: string;
  ordre: number;
  surface: string;
  capacite: string;
  resume: string;
  image: string;
}

export interface ChambreDetail extends ChambreSummary {
  contenu: string;          // HTML pré-rendu par le backend
  equipements: string[];
  photos: string[];
}

export interface Reservation {
  id: number;
  chambre: string;
  debut: string;            // AAAA-MM-JJ
  fin: string;              // AAAA-MM-JJ
  note: string;
}

export interface Saison {
  debut: string;
  fin: string;
}

export interface ContactPayload {
  nom: string;
  email: string;
  tel?: string;
  chambre?: string;
  arrivee?: string;
  depart?: string;
  message: string;
}
