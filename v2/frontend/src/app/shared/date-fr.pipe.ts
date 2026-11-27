import { Pipe, PipeTransform } from '@angular/core';

/** "2026-06-15" -> "15 juin 2026" */
@Pipe({ name: 'dateFR' })
export class DateFRPipe implements PipeTransform {
  private static readonly MOIS = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];

  transform(value: string | null | undefined): string {
    if (!value) return '';
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return value;
    return `${d} ${DateFRPipe.MOIS[m - 1]} ${y}`;
  }
}
