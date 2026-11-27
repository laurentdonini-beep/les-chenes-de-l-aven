import { Reservation, Saison } from '../core/models';

export interface DispoResume {
  libres: number;      // nuits encore libres sur la période restante
  total: number;       // nuits restantes sur la saison (à partir d'aujourd'hui)
  complet: boolean;    // true si total > 0 et libres === 0
  terminee: boolean;   // true si la saison est passée
  debut: string;
  fin: string;
}

function parseDate(d: string): Date {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, (m || 1) - 1, day || 1);
}

const DAY = 24 * 60 * 60 * 1000;

/**
 * Résumé des disponibilités d'une chambre sur sa saison :
 * compte les nuits libres entre max(aujourd'hui, saison.debut) et saison.fin.
 */
export function resumeDispo(saison: Saison | null, reservations: Reservation[], room: string): DispoResume | null {
  if (!saison || !saison.debut || !saison.fin) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const debut = parseDate(saison.debut);
  const fin = parseDate(saison.fin);
  const start = debut > today ? debut : today;
  const total = start <= fin ? Math.round((fin.getTime() - start.getTime()) / DAY) + 1 : 0;
  const booked = new Set<string>();
  for (const r of reservations) {
    if (r.chambre !== room) continue;
    let d = parseDate(r.debut);
    const end = parseDate(r.fin);
    while (d <= end) {
      if (d >= start && d <= fin) booked.add(d.toDateString());
      d = new Date(d.getTime() + DAY);
    }
  }
  const libres = Math.max(0, total - booked.size);
  return {
    libres,
    total,
    complet: total > 0 && libres === 0,
    terminee: fin < today,
    debut: saison.debut,
    fin: saison.fin
  };
}

/* ---------------- Stats globales (tableau de bord BO) ---------------- */

export interface StatsChambre {
  slug: string;
  reservees: number;   // nuits réservées (capées à la saison)
  libres: number;
  taux: number;        // % 0..100
  complet: boolean;
}

export interface StatsGlobal {
  totalChambres: number;
  nuitsSaison: number;      // nuits par chambre sur la saison
  capaciteTotale: number;   // nuitsSaison x nb chambres
  nuitsReservees: number;
  nuitsLibres: number;
  taux: number;             // % global
  aVenir: Reservation[];   // réservations à venir, triées par date
  enCours: number;
  passees: number;
  parChambre: StatsChambre[];
  plusReservee: string | null; // slug
}

function overlapJours(a1: string, a2: string, b1: string, b2: string): number {
  const s = Math.max(parseDate(a1).getTime(), parseDate(b1).getTime());
  const e = Math.min(parseDate(a2).getTime(), parseDate(b2).getTime());
  return s <= e ? Math.round((e - s) / DAY) + 1 : 0;
}

/** Nuits réservées d'une chambre, capées à la saison [debut, fin]. */
export function compteNuitsReservees(reservations: Reservation[], room: string, saison: Saison | null): number {
  if (!saison?.debut || !saison?.fin) return 0;
  let n = 0;
  for (const r of reservations) {
    if (r.chambre === room) n += overlapJours(r.debut, r.fin, saison.debut, saison.fin);
  }
  return n;
}

export function computeStats(chambres: { slug: string }[], reservations: Reservation[], saison: Saison | null): StatsGlobal {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const nuitsSaison = saison?.debut && saison?.fin ? overlapJours(saison.debut, saison.fin, saison.debut, saison.fin) : 0;
  const parChambre: StatsChambre[] = chambres.map(c => {
    const reservees = compteNuitsReservees(reservations, c.slug, saison);
    const libres = Math.max(0, nuitsSaison - reservees);
    return { slug: c.slug, reservees, libres, taux: nuitsSaison ? Math.round(100 * reservees / nuitsSaison) : 0, complet: nuitsSaison > 0 && libres === 0 };
  });
  const capaciteTotale = nuitsSaison * chambres.length;
  const nuitsReservees = Math.min(parChambre.reduce((a, c) => a + c.reservees, 0), capaciteTotale);
  const aVenir = reservations
    .filter(r => parseDate(r.fin) >= today)
    .sort((a, b) => a.debut.localeCompare(b.debut));
  const enCours = reservations.filter(r => parseDate(r.debut) <= today && parseDate(r.fin) >= today).length;
  const passees = reservations.filter(r => parseDate(r.fin) < today).length;
  const plusReservee = parChambre.length ? [...parChambre].sort((a, b) => b.reservees - a.reservees)[0].slug : null;
  return {
    totalChambres: chambres.length,
    nuitsSaison,
    capaciteTotale,
    nuitsReservees,
    nuitsLibres: Math.max(0, capaciteTotale - nuitsReservees),
    taux: capaciteTotale ? Math.round(100 * nuitsReservees / capaciteTotale) : 0,
    aVenir,
    enCours,
    passees,
    parChambre,
    plusReservee
  };
}
