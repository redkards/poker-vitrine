import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { ForumPostReport } from './forum.models';
import { ForumService } from './forum.service';

describe('ForumService — signalement', () => {
  let service: ForumService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ForumService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('envoie POST /api/forum/posts/{id}/report avec motif et commentaire', () => {
    let result: ForumPostReport | undefined;
    service.reportPost(12, 'spam', '  lien vers un site de paris  ').subscribe((r) => (result = r));

    const req = http.expectOne(`${environment.apiUrl}/forum/posts/12/report`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ reason: 'spam', comment: 'lien vers un site de paris' });

    const response: ForumPostReport = { id: 3, postId: 12, reason: 'spam', createdAt: '2026-10-29T12:00:00+01:00', message: 'Merci' };
    req.flush(response, { status: 201, statusText: 'Created' });
    expect(result).toEqual(response);
  });

  it('envoie un commentaire null quand il est vide', () => {
    service.reportPost(5, 'hors_sujet', '   ').subscribe();
    const req = http.expectOne(`${environment.apiUrl}/forum/posts/5/report`);
    expect(req.request.body).toEqual({ reason: 'hors_sujet', comment: null });
    req.flush({});
  });
});
