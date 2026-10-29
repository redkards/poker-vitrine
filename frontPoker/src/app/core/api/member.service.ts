import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { MemberProfile } from './member.models';

/**
 * v1.1 — Profils publics des membres.
 */
@Injectable({ providedIn: 'root' })
export class MemberService {
  private readonly api = inject(ApiService);

  getProfile(pseudo: string): Observable<MemberProfile> {
    return this.api.get<MemberProfile>(`members/${encodeURIComponent(pseudo)}`);
  }
}
