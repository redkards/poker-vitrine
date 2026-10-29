import { ApplicationConfig, LOCALE_ID, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import localeFr from '@angular/common/locales/fr';
import { TitleStrategy, provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';
import { jwtInterceptor } from './core/auth/jwt.interceptor';
import { SeoTitleStrategy } from './core/seo/seo-title.strategy';

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'fr' },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideHttpClient(withXhr(), withInterceptors([jwtInterceptor])),
    // Titre + meta description + Open Graph par route
    { provide: TitleStrategy, useClass: SeoTitleStrategy },
    // Restaure la session avant la 1re navigation (les guards connaissent l'utilisateur)
    provideAppInitializer(() => firstValueFrom(inject(AuthService).restoreSession())),
  ],
};
