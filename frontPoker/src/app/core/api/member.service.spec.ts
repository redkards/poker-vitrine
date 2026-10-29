import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { ANONYMOUS_PSEUDO, MemberProfile, hasPublicProfile } from './member.models';
import { MemberService } from './member.service';

describe('MemberService', () => {
  let service: MemberService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(MemberService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('charge le profil public GET /api/members/{pseudo}', () => {
    const profile: MemberProfile = { pseudo: 'Doyle.B', createdAt: '2026-01-15T10:00:00+01:00', postCount: 42 };
    let result: MemberProfile | undefined;

    service.getProfile('Doyle.B').subscribe((p) => (result = p));

    const req = http.expectOne(`${environment.apiUrl}/members/Doyle.B`);
    expect(req.request.method).toBe('GET');
    req.flush(profile);
    expect(result).toEqual(profile);
  });

  it('ne propose un profil que pour un pseudo public valide', () => {
    expect(hasPublicProfile('ActionJack')).toBeTrue();
    expect(hasPublicProfile(ANONYMOUS_PSEUDO)).toBeFalse();
    expect(hasPublicProfile('ab')).toBeFalse();
    expect(hasPublicProfile('avec espace')).toBeFalse();
    expect(hasPublicProfile(null)).toBeFalse();
  });
});
