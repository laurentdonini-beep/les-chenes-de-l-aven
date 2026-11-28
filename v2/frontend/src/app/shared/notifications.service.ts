import { Injectable, OnDestroy, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { firstValueFrom } from 'rxjs';
import { MessageView, Reservation } from '../core/models';

const LS_MSG = 'bo_last_msg_id';
const LS_RES = 'bo_last_res_id';
const POLL_MS = 30000;

/**
 * Notifications du BO sur mobile (Capacitor) : toutes les 30 s, interroge
 * l'API admin (messages non traités, dernières réservations) et déclenche une
 * notification locale quand quelque chose de nouveau arrive.
 * (v1 = app ouverte ; push en arrière-plan = FCM/APNs, étape suivante.)
 */
@Injectable({ providedIn: 'root' })
export class NotificationsService implements OnDestroy {
  private http = inject(HttpClient);
  private timer: ReturnType<typeof setInterval> | null = null;
  private lastMsgId = Number(localStorage.getItem(LS_MSG) ?? 0);
  private lastResId = Number(localStorage.getItem(LS_RES) ?? 0);
  private permissionGranted = false;

  async start(): Promise<void> {
    if (this.timer || !Capacitor.isNativePlatform()) return;
    try {
      const perm = await LocalNotifications.requestPermissions();
      this.permissionGranted = perm.display === 'granted';
    } catch {
      this.permissionGranted = false;
    }
    await this.poll();
    this.timer = setInterval(() => this.poll(), POLL_MS);
  }

  ngOnDestroy(): void {
    this.stop();
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async poll(): Promise<void> {
    try {
      const [msgs, res] = await Promise.all([
        firstValueFrom(this.http.get<MessageView[]>('/api/admin/messages')),
        firstValueFrom(this.http.get<Reservation[]>('/api/admin/disponibilites'))
      ]);
      const newestMsg = msgs.filter(m => !m.traite).sort((a, b) => b.id - a.id)[0];
      if (newestMsg && newestMsg.id > this.lastMsgId) {
        this.lastMsgId = newestMsg.id;
        localStorage.setItem(LS_MSG, String(this.lastMsgId));
        await this.notify('📨 Nouveau message', `${newestMsg.nom} : ${(newestMsg.message ?? '').slice(0, 100)}`);
      }
      const newestRes = [...res].sort((a, b) => b.id - a.id)[0];
      if (newestRes && newestRes.id > this.lastResId) {
        this.lastResId = newestRes.id;
        localStorage.setItem(LS_RES, String(this.lastResId));
        await this.notify('📅 Nouvelle réservation', `${newestRes.chambre} — du ${newestRes.debut} au ${newestRes.fin}${newestRes.note ? ' (' + newestRes.note + ')' : ''}`);
      }
    } catch {
      // pas connecté ou réseau coupé : on réessaiera au prochain poll
    }
  }

  private async notify(title: string, body: string): Promise<void> {
    if (!this.permissionGranted) return;
    try {
      await LocalNotifications.schedule({
        notifications: [{ id: Math.floor(Date.now() / 1000) % 100000, title, body }]
      });
    } catch { /* ignore */ }
  }
}
