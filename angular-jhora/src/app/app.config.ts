import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import {
  provideRouter,
  withPreloading,
  withComponentInputBinding,
  withRouterConfig,
} from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { PreloadAllModules } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),      // prefetch lazy chunks after initial load
      withComponentInputBinding(),            // bind route params to @Input() directly
      withRouterConfig({ onSameUrlNavigation: 'reload' })
    ),
    provideAnimations(),
    provideHttpClient(withFetch()),
  ]
};
