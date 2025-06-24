import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { OAuthModule, AuthConfig } from "angular-oauth2-oidc";


export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),
  provideHttpClient(withInterceptorsFromDi()),
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }
  ]
};

export const authConfig: AuthConfig = {
  issuer : 'https://accounts.google.com',
  scope : 'openid profile email',
  redirectUri : window.location.origin,
  clientId: "407987005028-goqhfc0ndc8cj6sadlko00bl7jtapbut.apps.googleusercontent.com",
  strictDiscoveryDocumentValidation : false,
}