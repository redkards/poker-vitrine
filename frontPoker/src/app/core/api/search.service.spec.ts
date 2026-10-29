import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { SearchResults } from './search.models';
import { SearchService, normalizeQuery } from './search.service';

describe('SearchService', () => {
  let service: SearchService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(SearchService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('interroge GET /api/search avec la requête normalisée', () => {
    const body: SearchResults = { query: 'bankroll poker', articles: [], topics: [] };
    let result: SearchResults | undefined;

    service.search('  bankroll   poker ').subscribe((r) => (result = r));

    const req = http.expectOne((r) => r.url === `${environment.apiUrl}/search`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('q')).toBe('bankroll poker');
    req.flush(body);
    expect(result).toEqual(body);
  });

  it('normalise les espaces comme l’API', () => {
    expect(normalizeQuery('  3-bet \n  light ')).toBe('3-bet light');
    expect(normalizeQuery('   ')).toBe('');
  });
});
