import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MessageView } from '../core/models';
import { DateFRPipe } from '../shared/date-fr.pipe';

/**
 * /bo/messages — boîte de réception des demandes envoyées via le formulaire
 * de contact : marquer comme traité / rouvrir / supprimer.
 */
@Component({
  selector: 'app-bo-messages',
  imports: [FormsModule, DateFRPipe],
  styles: [`
    .bo-msg { border-radius: 8px; padding: 0.6rem 0.9rem; margin-bottom: 1rem; }
    .bo-msg.ok { background: #e6f2e8; color: #22392c; }
    .bo-msg.err { background: #fdecea; color: #b3261e; }
    .msg-card { border: 1px solid var(--sable); border-radius: var(--radius); padding: 1rem 1.2rem; margin-bottom: 0.9rem; background: var(--blanc); }
    .msg-card.non-traite { border-left: 5px solid var(--terra); }
    .msg-card.traite { opacity: 0.65; border-left: 5px solid var(--vert-clair); }
    .msg-head { display: flex; flex-wrap: wrap; gap: 0.4rem 1.2rem; align-items: baseline; margin-bottom: 0.4rem; }
    .msg-head strong { color: var(--vert); font-size: 1.05rem; }
    .msg-meta { color: var(--texte-doux); font-size: 0.85rem; }
    .msg-body { white-space: pre-wrap; margin: 0.4rem 0 0.7rem; }
    .msg-actions { display: flex; gap: 0.8rem; align-items: center; }
    .bo-del { border: none; background: transparent; color: #b3261e; cursor: pointer; font-size: 0.85rem; text-decoration: underline; padding: 0; }
    .bo-toggle { border: 1px solid var(--vert-clair); background: transparent; color: var(--vert); border-radius: 999px; cursor: pointer; font-size: 0.82rem; padding: 0.25rem 0.8rem; }
    .bo-note { color: var(--texte-doux); font-size: 0.85rem; }
    .badge { font-size: 0.75rem; font-weight: 700; border-radius: 999px; padding: 0.1rem 0.6rem; }
    .badge.new { background: var(--terra); color: #fff; }
    .badge.done { background: #e6f2e8; color: var(--vert); }
  `],
  template: `
    <section class="container">
      <h1 style="font-size:1.7rem; margin-bottom:0.4rem;">📨 Messages reçus</h1>
      <p class="bo-note" style="margin-bottom:1.2rem;">
        Demandes envoyées via le formulaire de contact du site.
        {{ nonTraites() }} non traité(s) sur {{ messages().length }}.
        @if (!mailOk()) { <br>⚠️ Aucun SMTP configuré : les messages sont enregistrés ici uniquement (le visiteur a aussi un lien mailto). }
      </p>

      @if (msg(); as m) { <p class="bo-msg" [class.ok]="m.ok" [class.err]="!m.ok">{{ m.text }}</p> }

      <label style="display:flex; align-items:center; gap:0.5rem; margin-bottom:1rem; font-weight:400;">
        <input type="checkbox" [ngModel]="onlyNew()" (ngModelChange)="onlyNew.set($event)" style="width:auto;">
        Afficher uniquement les non traités
      </label>

      @if (filtres().length === 0) {
        <p class="bo-note" style="font-style:italic;">Aucun message pour le moment.</p>
      }
      @for (m of filtres(); track m.id) {
        <div class="msg-card" [class.non-traite]="!m.traite" [class.traite]="m.traite">
          <div class="msg-head">
            <strong>{{ m.nom }}</strong>
            @if (m.traite) { <span class="badge done">traité</span> } @else { <span class="badge new">nouveau</span> }
            <span class="msg-meta">{{ m.createdAt | dateFR }} · <a [href]="'mailto:' + m.email">{{ m.email }}</a> @if (m.tel) { · {{ m.tel }} }</span>
            @if (!m.mailEnvoye) { <span class="msg-meta">✉️ non envoyé par mail (voir en base)</span> }
          </div>
          <div class="msg-meta">
            @if (m.chambre) { Chambre : <strong>{{ m.chambre }}</strong> · }
            @if (m.arrivee) { du {{ m.arrivee | dateFR }} } @if (m.depart) { au {{ m.depart | dateFR }} }
          </div>
          <p class="msg-body">{{ m.message }}</p>
          <div class="msg-actions">
            <button type="button" class="bo-toggle" (click)="toggleTraite(m)">{{ m.traite ? '↩️ Marquer non traité' : '✅ Marquer comme traité' }}</button>
            <button type="button" class="bo-del" (click)="deleteMsg(m)">Supprimer</button>
          </div>
        </div>
      }
    </section>
  `
})
export class BoMessagesComponent implements OnInit {
  private http = inject(HttpClient);

  readonly messages = signal<MessageView[]>([]);
  readonly onlyNew = signal(false);
  readonly msg = signal<{ ok: boolean; text: string } | null>(null);

  readonly nonTraites = computed(() => this.messages().filter(m => !m.traite).length);
  readonly filtres = computed(() => this.onlyNew() ? this.messages().filter(m => !m.traite) : this.messages());
  readonly mailOk = computed(() => this.messages().some(m => m.mailEnvoye) || this.messages().length === 0);

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.http.get<MessageView[]>('/api/admin/messages').subscribe(m => this.messages.set(m));
  }

  toggleTraite(m: MessageView): void {
    this.http.patch<MessageView>(`/api/admin/messages/${m.id}`, { traite: !m.traite }).subscribe({
      next: () => this.reload(),
      error: () => this.msg.set({ ok: false, text: '⚠ Mise à jour impossible.' })
    });
  }

  deleteMsg(m: MessageView): void {
    this.http.delete(`/api/admin/messages/${m.id}`).subscribe({
      next: () => {
        this.msg.set({ ok: true, text: `✅ Message de ${m.nom} supprimé.` });
        this.reload();
      },
      error: () => this.msg.set({ ok: false, text: '⚠ Suppression impossible.' })
    });
  }
}
