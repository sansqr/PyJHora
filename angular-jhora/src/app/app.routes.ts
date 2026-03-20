import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'panchanga', pathMatch: 'full' },
  {
    path: 'panchanga',
    loadComponent: () => import('./panchanga/panchanga.component').then(m => m.PanchangaComponent)
  },
  {
    path: 'horoscope',
    loadComponent: () => import('./horoscope/horoscope.component').then(m => m.HoroscopeComponent)
  },
  {
    path: 'dhasa',
    loadComponent: () => import('./dhasa-bhukti/dhasa-bhukti.component').then(m => m.DhasaBhuktiComponent)
  },
  {
    path: 'analysis',
    loadComponent: () => import('./analysis/analysis.component').then(m => m.AnalysisComponent)
  },
  {
    path: 'match',
    loadComponent: () => import('./match/match.component').then(m => m.MatchComponent)
  },
  {
    path: 'muhurta',
    loadComponent: () => import('./muhurta/muhurta.component').then(m => m.MuhurtaComponent)
  },
  { path: '**', redirectTo: 'panchanga' }
];
