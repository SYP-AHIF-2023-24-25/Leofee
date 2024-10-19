// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),  // Configuring app routes
    provideHttpClient(),    // Providing HttpClient for API calls
    // Add more providers if necessary, such as global services or custom error handlers
  ]
};