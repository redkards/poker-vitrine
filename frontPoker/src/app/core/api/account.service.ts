import { Injectable, inject } from '@angular/core';
import { Observable, map, switchMap, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Video } from './content.models';
import { AuthService } from '../auth/auth.service';
import { CurrentUser, MessageResponse } from '../auth/auth.models';

/**
 * Espace membre (Sprint 4) : profil, mot de passe, favoris vidéos et droits RGPD.
 */
@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  updatePseudo(pseudo: string): Observable<CurrentUser> {
    return this.api.patch<CurrentUser>('me', { pseudo }).pipe(switchMap(() => this.auth.loadCurrentUser()));
  }

  /**
   * Le serveur révoque toutes les sessions : on se reconnecte aussitôt avec le nouveau mot de passe.
   */
  changePassword(currentPassword: string, newPassword: string): Observable<MessageResponse> {
    return this.api.post<MessageResponse>('me/password', { currentPassword, newPassword }).pipe(
      switchMap((res) => this.auth.login(this.auth.user()?.email ?? '', newPassword).pipe(map(() => res))),
    );
  }

  /** Droit d'accès / portabilité : télécharge le fichier JSON */
  downloadExport(): Observable<void> {
    return this.api.getBlob('me/export').pipe(
      map((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pokervitrine-mes-donnees-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
      }),
    );
  }

  /** Étape 1 : envoie l'email de confirmation */
  requestDeletion(password: string): Observable<MessageResponse> {
    return this.api.delete<MessageResponse>('me', { password });
  }

  /** Étape 2 : lien de l'email ; la session locale est fermée */
  confirmDeletion(token: string): Observable<MessageResponse> {
    return this.api
      .post<MessageResponse>('account-deletion/confirm', { token })
      .pipe(tap(() => this.auth.logout(false)));
  }

  getFavorites(): Observable<Video[]> {
    return this.api.get<Video[]>('me/favorites');
  }

  setFavorite(videoId: number, favorite: boolean): Observable<{ isFavorite: boolean }> {
    const path = `videos/${videoId}/favorite`;
    return favorite ? this.api.post(path) : this.api.delete(path);
  }
}
