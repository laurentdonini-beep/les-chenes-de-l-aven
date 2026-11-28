import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../core/api.service';
import { ChambreDetail, ChambreSummary, MediaItem } from '../core/models';

interface ChambrePick {
  slug: string;
  titre: string;
  image: string;
  photos: string[];
  dirty: boolean;
}

/**
 * /bo/photos — gestion des images du site par la propriétaire :
 * - upload de nouvelles photos (/uploads/...)
 * - remplacer n'importe quelle image du site (même URL, aucun autre changement)
 * - supprimer un upload / annuler un remplacement
 * - choisir l'image principale et la galerie de chaque chambre
 */
@Component({
  selector: 'app-bo-photos',
  imports: [],
  styles: [`
    .bo-toolbar { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.4rem; }
    .media-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 0.9rem; margin-bottom: 2rem; }
    .media-card { padding: 0.5rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .media-card img { width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: 10px; background: var(--sable); }
    .media-name { font-weight: 600; font-size: 0.82rem; word-break: break-all; }
    .media-actions { display: flex; flex-wrap: wrap; gap: 0.3rem; }
    .media-actions button, .media-actions label { font-size: 0.75rem; padding: 0.25rem 0.6rem; border-radius: 999px; border: 1.5px solid var(--sable); background: #fff; cursor: pointer; font-weight: 600; color: var(--texte-doux); }
    .media-actions button:hover, .media-actions label:hover { border-color: var(--vert); color: var(--vert); }
    .media-actions .danger { color: #b3261e; border-color: #e5b6b2; }
    .media-actions .danger:hover { border-color: #b3261e; }
    .badge-replace { color: var(--terra-fonce); font-weight: 700; }
    .ch-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.1rem; margin-bottom: 2rem; }
    .ch-main { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.7rem; }
    .ch-main img { width: 110px; height: 76px; object-fit: cover; border-radius: 10px; background: var(--sable); }
    .ch-gallery { display: flex; flex-wrap: wrap; gap: 0.45rem; margin-bottom: 0.7rem; }
    .thumb-wrap { position: relative; }
    .thumb-wrap img { width: 74px; height: 56px; object-fit: cover; border-radius: 8px; display: block; background: var(--sable); }
    .thumb-wrap button { position: absolute; top: -7px; right: -7px; width: 20px; height: 20px; border-radius: 50%; border: none; background: #b3261e; color: #fff; font-size: 0.7rem; cursor: pointer; line-height: 1; }
    .picker-overlay { position: fixed; inset: 0; background: rgba(20, 30, 24, 0.55); z-index: 1000; display: flex; align-items: flex-start; justify-content: center; padding: 4vh 4vw; }
    .picker { background: var(--creme); border-radius: var(--radius); box-shadow: var(--ombre); max-width: 980px; width: 100%; max-height: 88vh; overflow: auto; padding: 1.4rem; }
    .picker .media-card { border: 2px solid transparent; cursor: pointer; background: #fff; border-radius: 12px; }
    .picker .media-card:hover { border-color: var(--terra); }
    h2.bo-h2 { margin: 1.6rem 0 0.7rem; }
  `],
  template: `
    <section class="container">
      <h1 style="font-size:1.7rem; margin-bottom:0.2rem;">Photos du site</h1>
      <p class="bo-note" style="margin-bottom:1.2rem;">
        Ajoutez, remplacez ou supprimez les photos du site — aucun autre réglage à toucher.
        « Remplacer » change une image du site <b>à la même adresse</b> : toutes les pages sont mises à jour d'un coup.
      </p>

      @if (msg(); as m) { <p class="bo-msg" [class.ok]="m.ok" [class.err]="!m.ok">{{ m.text }}</p> }

      <div class="card bo-toolbar">
        <label class="btn" style="cursor:pointer;">
          ⬆ Ajouter des photos…
          <input type="file" hidden multiple accept="image/*" (change)="onFiles($event)">
        </label>
        <span class="bo-note">JPG, PNG, WebP, GIF, SVG — max 20 Mo par photo. Les nouvelles photos arrivent dans « Vos photos uploadées » en bas.</span>
        @if (uploading()) { <span class="bo-note">Envoi en cours…</span> }
      </div>

      <h2 class="bo-h2">Images du site ({{ siteMedia().length }})</h2>
      <p class="bo-note" style="margin-bottom:0.7rem;">Celles livrées avec le site. Bouton <b>Remplacer</b> pour les changer ; <b>Supprimer</b> n'apparaît que si vous les avez remplacées (pour revenir à l'originale).</p>
      <div class="media-grid">
        @for (m of siteMedia(); track m.path) {
          <div class="card media-card">
            <img [src]="m.path" [alt]="m.name" loading="lazy" decoding="async">
            <span class="media-name">{{ m.name }}@if (m.source === 'remplacee') { <span class="badge-replace"> · remplacée</span> }</span>
            <span class="bo-note">{{ sizeLabel(m.size) }}</span>
            <div class="media-actions">
              <button type="button" (click)="preview(m)">👁 Aperçu</button>
              <button type="button" (click)="copyPath(m)">📋 Chemin</button>
              <label>🔄 Remplacer<input type="file" hidden accept="image/*" (change)="onReplace($event, m.path)"></label>
              @if (m.source === 'remplacee') {
                <button type="button" class="danger" (click)="deleteMedia(m)">↩ Originale</button>
              }
            </div>
          </div>
        }
      </div>

      <h2 class="bo-h2">Vos photos uploadées ({{ uploadMedia().length }})</h2>
      @if (uploadMedia().length === 0) {
        <p class="bo-note">Aucune pour l'instant — utilisez « ⬆ Ajouter des photos… » ci-dessus.</p>
      }
      <div class="media-grid">
        @for (m of uploadMedia(); track m.path) {
          <div class="card media-card">
            <img [src]="m.path" [alt]="m.name" loading="lazy" decoding="async">
            <span class="media-name">{{ m.name }}</span>
            <span class="bo-note">{{ sizeLabel(m.size) }}</span>
            <div class="media-actions">
              <button type="button" (click)="preview(m)">👁 Aperçu</button>
              <button type="button" (click)="copyPath(m)">📋 Chemin</button>
              <label>🔄 Remplacer<input type="file" hidden accept="image/*" (change)="onReplace($event, m.path)"></label>
              <button type="button" class="danger" (click)="deleteMedia(m)">🗑 Supprimer</button>
            </div>
          </div>
        }
      </div>

      <h2 class="bo-h2">Photos de chaque chambre</h2>
      <p class="bo-note" style="margin-bottom:0.7rem;">Choisissez l'image principale et la galerie de chaque chambre, puis « Enregistrer ».</p>
      <div class="ch-grid">
        @for (ch of chambres(); track ch.slug) {
          <div class="card">
            <h3 style="margin-bottom:0.6rem;">{{ ch.titre }}</h3>
            <div class="ch-main">
              <img [src]="ch.image" [alt]="ch.titre" loading="lazy">
              <button type="button" class="btn btn-outline btn-small" (click)="openPick(ch.slug, 'image')">Changer l'image principale</button>
            </div>
            <div class="ch-gallery">
              @for (ph of ch.photos; track ph; let i = $index) {
                <div class="thumb-wrap">
                  <img [src]="ph" alt="" loading="lazy">
                  <button type="button" (click)="removePhoto(ch, i)" title="Retirer de la galerie">✕</button>
                </div>
              }
              <button type="button" class="btn btn-outline btn-small" (click)="openPick(ch.slug, 'gallery')">+ Ajouter une photo</button>
            </div>
            <button type="button" class="btn btn-block" [disabled]="!ch.dirty || saving()" (click)="saveChambre(ch)">
              {{ saving() ? 'Enregistrement…' : 'Enregistrer' }}
            </button>
          </div>
        }
      </div>
    </section>

    @if (pick(); as p) {
      <div class="picker-overlay" (click)="pick.set(null)">
        <div class="picker" (click)="$event.stopPropagation()">
          <h2 style="margin-bottom:0.8rem;">Choisir une photo pour « {{ chambreTitre(p.chambre) }} »</h2>
          <div class="media-grid">
            @for (m of media(); track m.path) {
              <button type="button" class="media-card" (click)="choose(m)">
                <img [src]="m.path" [alt]="m.name" loading="lazy">
                <span class="media-name">{{ m.name }}</span>
              </button>
            }
          </div>
          <button type="button" class="btn btn-outline" style="margin-top:0.8rem;" (click)="pick.set(null)">Annuler</button>
        </div>
      </div>
    }
  `
})
export class BoPhotosComponent implements OnInit {
  private http = inject(HttpClient);
  private api = inject(ApiService);

  readonly media = signal<MediaItem[]>([]);
  readonly chambres = signal<ChambrePick[]>([]);
  readonly msg = signal<{ ok: boolean; text: string } | null>(null);
  readonly uploading = signal(false);
  readonly saving = signal(false);
  readonly pick = signal<{ chambre: string; field: 'image' | 'gallery' } | null>(null);

  readonly siteMedia = computed(() => this.media().filter(m => m.source !== 'upload'));
  readonly uploadMedia = computed(() => this.media().filter(m => m.source === 'upload'));

  ngOnInit(): void {
    this.loadMedia();
    this.loadChambres();
  }

  loadMedia(): void {
    this.http.get<MediaItem[]>('/api/admin/media').subscribe({
      next: m => this.media.set(m),
      error: () => this.msg.set({ ok: false, text: '⚠ Impossible de charger la liste des photos.' })
    });
  }

  loadChambres(): void {
    this.api.chambres().subscribe((list: ChambreSummary[]) => {
      for (const c of list) {
        this.http.get<ChambreDetail>(`/api/public/chambres/${c.slug}`).subscribe(d => {
          this.chambres.update(arr => [...arr, {
            slug: c.slug, titre: c.titre, image: d.image, photos: [...(d.photos ?? [])], dirty: false
          }]);
        });
      }
    });
  }

  chambreTitre(slug: string): string {
    return this.chambres().find(c => c.slug === slug)?.titre ?? slug;
  }

  sizeLabel(size: number): string {
    if (size >= 1024 * 1024) return (size / 1048576).toFixed(1) + ' Mo';
    return Math.max(1, Math.round(size / 1024)) + ' Ko';
  }

  onFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (!files.length) return;
    this.uploading.set(true);
    let done = 0;
    for (const f of files) {
      this.uploadOne(f, null, () => {
        done++;
        if (done === files.length) {
          this.uploading.set(false);
          this.loadMedia();
          this.msg.set({ ok: true, text: `✅ ${files.length} photo(s) ajoutée(s).` });
        }
      });
    }
  }

  onReplace(event: Event, targetPath: string): void {
    const input = event.target as HTMLInputElement;
    const f = input.files?.[0];
    input.value = '';
    if (!f) return;
    this.uploading.set(true);
    this.uploadOne(f, targetPath, () => {
      this.uploading.set(false);
      this.loadMedia();
      this.msg.set({ ok: true, text: '✅ Image remplacée (même adresse, toutes les pages mises à jour).' });
    });
  }

  private uploadOne(file: File, targetPath: string | null, done: () => void): void {
    const fd = new FormData();
    fd.append('file', file, file.name);
    if (targetPath) fd.append('targetPath', targetPath);
    this.http.post<MediaItem>('/api/admin/media/upload', fd).subscribe({
      next: () => done(),
      error: e => {
        done();
        const detail = e?.error?.error ?? e?.error?.message ?? 'Erreur inconnue';
        this.msg.set({ ok: false, text: '⚠ ' + detail });
      }
    });
  }

  deleteMedia(m: MediaItem): void {
    const label = m.source === 'remplacee'
      ? `Revenir à l'image originale de « ${m.name} » ?`
      : `Supprimer définitivement « ${m.name} » ?`;
    if (!window.confirm(label)) return;
    this.http.delete('/api/admin/media', { params: { path: m.path } }).subscribe({
      next: () => {
        this.loadMedia();
        this.msg.set({ ok: true, text: m.source === 'remplacee' ? '↩ Image originale restaurée.' : '🗑 Photo supprimée.' });
      },
      error: e => this.msg.set({ ok: false, text: '⚠ ' + (e?.error?.error ?? 'Suppression impossible.') })
    });
  }

  preview(m: MediaItem): void {
    window.open(m.path, '_blank', 'noopener');
  }

  copyPath(m: MediaItem): void {
    navigator.clipboard?.writeText(m.path).then(
      () => this.msg.set({ ok: true, text: `📋 Chemin copié : ${m.path}` }),
      () => this.msg.set({ ok: false, text: 'Chemin : ' + m.path })
    );
  }

  openPick(slug: string, field: 'image' | 'gallery'): void {
    this.pick.set({ chambre: slug, field });
  }

  choose(m: MediaItem): void {
    const p = this.pick();
    if (!p) return;
    this.chambres.update(arr => arr.map(ch => {
      if (ch.slug !== p.chambre) return ch;
      return p.field === 'image'
        ? { ...ch, image: m.path, dirty: true }
        : { ...ch, photos: [...ch.photos, m.path], dirty: true };
    }));
    this.pick.set(null);
  }

  removePhoto(ch: ChambrePick, i: number): void {
    this.chambres.update(arr => arr.map(c => c.slug === ch.slug
      ? { ...c, photos: c.photos.filter((_, idx) => idx !== i), dirty: true }
      : c));
  }

  saveChambre(ch: ChambrePick): void {
    this.saving.set(true);
    this.http.put(`/api/admin/chambres/${ch.slug}/photos`, { image: ch.image, photos: ch.photos }).subscribe({
      next: () => {
        this.saving.set(false);
        this.chambres.update(arr => arr.map(c => c.slug === ch.slug ? { ...c, dirty: false } : c));
        this.msg.set({ ok: true, text: `✅ Photos de « ${ch.titre} » enregistrées.` });
      },
      error: e => {
        this.saving.set(false);
        this.msg.set({ ok: false, text: '⚠ ' + (e?.error?.error ?? 'Enregistrement impossible.') });
      }
    });
  }
}
