import { Routes } from '@angular/router';

export const routes: Routes = [
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Root â€” redirects to the main chart shell
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    path: '',
    redirectTo: 'chart',
    pathMatch: 'full',
  },

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Main App Shell (three-panel layout)
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    path: 'chart',
    loadComponent: () =>
      import('./components/app-shell/app-shell-component').then(
        (m) => m.AppShellComponent
      ),
    title: 'PyJHora v4.7 â€” Vedic Chart',
    children: [

      // Default child â†’ Rashi Chart (D-1)
      {
        path: '',
        redirectTo: 'rashi',
        pathMatch: 'full',
      },

      // â”€â”€ Divisional Charts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      {
        path: 'rashi',
        loadComponent: () =>
          import('./components/chart-area/chart-area-component').then(
            (m) => m.ChartAreaComponent
          ),
        title: 'RÄÅ›i â€” D-1',
        data: { chart: 'D-1', label: 'RÄÅ›i', devanagari: 'à¤°à¤¾à¤¶à¤¿' },
      },
      {
        path: 'hora',
        loadComponent: () =>
          import('./components/chart-area/chart-area-component').then(
            (m) => m.ChartAreaComponent
          ),
        data: { chart: 'D-2', label: 'HorÄ', devanagari: 'à¤¹à¥‹à¤°à¤¾' },
      },
      {
        path: 'drekkana',
        loadComponent: () =>
          import('./components/chart-area/chart-area-component').then(
            (m) => m.ChartAreaComponent
          ),
        title: 'DrekkÄá¹‡a â€” D-3',
        data: { chart: 'D-3', label: 'DrekkÄá¹‡a', devanagari: 'à¤¦à¥à¤°à¥‡à¤•à¥à¤•à¤¾à¤£' },
      },
      {
        path: 'chaturthamsa',
        loadComponent: () =>
          import('./components/chart-area/chart-area-component').then(
            (m) => m.ChartAreaComponent
          ),
        data: { chart: 'D-4', label: 'ChaturtÄá¹ƒÅ›a', devanagari: 'à¤šà¤¤à¥à¤°à¥à¤¥à¤¾à¤‚à¤¶' },
      },
      {
        path: 'panchamsa',
        loadComponent: () =>
          import('./components/chart-area/chart-area-component').then(
            (m) => m.ChartAreaComponent
          ),
        title: 'PaÃ±cÄá¹ƒÅ›a â€” D-5',
        data: { chart: 'D-5', label: 'PaÃ±cÄá¹ƒÅ›a', devanagari: 'à¤ªà¤žà¥à¤šà¤¾à¤‚à¤¶' },
      },
      {
        path: 'shashthamsa',
        loadComponent: () =>
          import('./components/chart-area/chart-area-component').then(
            (m) => m.ChartAreaComponent
          ),
        data: { chart: 'D-6', label: 'á¹¢aá¹£á¹­Äá¹ƒÅ›a', devanagari: 'à¤·à¤·à¥à¤ à¤¾à¤‚à¤¶' },
      },
      {
        path: 'saptamsa',
        loadComponent: () =>
          import('./components/chart-area/chart-area-component').then(
            (m) => m.ChartAreaComponent
          ),        data: { chart: 'D-7', label: 'SaptÄá¹ƒÅ›a', devanagari: 'à¤¸à¤ªà¥à¤¤à¤¾à¤‚à¤¶' },
      },
      {
        path: 'ashtamsa',
        loadComponent: () =>
          import('./components/chart-area/chart-area-component').then(
            (m) => m.ChartAreaComponent
          ),
        data: { chart: 'D-8', label: 'Aá¹£á¹­Äá¹ƒÅ›a', devanagari: 'à¤…à¤·à¥à¤Ÿà¤¾à¤‚à¤¶' },
      },
      {
        path: 'navamsa',
        loadComponent: () =>
          import('./components/chart-area/chart-area-component').then(
            (m) => m.ChartAreaComponent
          ),        data: { chart: 'D-9', label: 'NavÄá¹ƒÅ›a', devanagari: 'à¤¨à¤µà¤¾à¤‚à¤¶' },
      },
      {
        path: 'dasamsa',
        loadComponent: () =>
          import('./components/chart-area/chart-area-component').then(
            (m) => m.ChartAreaComponent
          ),
        title: 'DaÅ›Äá¹ƒÅ›a â€” D-10',
        data: { chart: 'D-10', label: 'DaÅ›Äá¹ƒÅ›a', devanagari: 'à¤¦à¤¶à¤¾à¤‚à¤¶' },
      },
      {
        path: 'dwadasamsa',
        loadComponent: () =>
          import('./components/chart-area/chart-area-component').then(
            (m) => m.ChartAreaComponent
          ),
        data: { chart: 'D-12', label: 'DvÄdaÅ›Äá¹ƒÅ›a', devanagari: 'à¤¦à¥à¤µà¤¾à¤¦à¤¶à¤¾à¤‚à¤¶' },
      },
      {
        path: 'shodasamsa',
        loadComponent: () =>
          import('./components/chart-area/chart-area-component').then(
            (m) => m.ChartAreaComponent
          ),
        title: 'á¹¢oá¸aÅ›Äá¹ƒÅ›a â€” D-16',
        data: { chart: 'D-16', label: 'á¹¢oá¸aÅ›Äá¹ƒÅ›a', devanagari: 'à¤·à¥‹à¤¡à¤¶à¤¾à¤‚à¤¶' },
      },
      {
        path: 'visamsa',
        loadComponent: () =>
          import('./components/chart-area/chart-area-component').then(
            (m) => m.ChartAreaComponent
          ),
        data: { chart: 'D-20', label: 'Viá¹ƒÅ›Äá¹ƒÅ›a', devanagari: 'à¤µà¤¿à¤‚à¤¶à¤¾à¤‚à¤¶' },
      },
      {
        path: 'chaturvisamsa',
        loadComponent: () =>
          import('./components/chart-area/chart-area-component').then(
            (m) => m.ChartAreaComponent
          ),        data: { chart: 'D-24', label: 'Caturviá¹ƒÅ›Äá¹ƒÅ›a', devanagari: 'à¤šà¤¤à¥à¤°à¥à¤µà¤¿à¤‚à¤¶à¤¾à¤‚à¤¶' },
      },
      {
        path: 'nakshatramsa',
        loadComponent: () =>
          import('./components/chart-area/chart-area-component').then(
            (m) => m.ChartAreaComponent
          ),
        data: { chart: 'D-27', label: 'Naká¹£atrÄá¹ƒÅ›a', devanagari: 'à¤¨à¤•à¥à¤·à¤¤à¥à¤°à¤¾à¤‚à¤¶' },
      },
      {
        path: 'trisamsa',
        loadComponent: () =>
          import('./components/chart-area/chart-area-component').then(
            (m) => m.ChartAreaComponent
          ),        data: { chart: 'D-30', label: 'Triá¹ƒÅ›Äá¹ƒÅ›a', devanagari: 'à¤¤à¥à¤°à¤¿à¤‚à¤¶à¤¾à¤‚à¤¶' },
      },
      {
        path: 'khavedamsa',
        loadComponent: () =>
          import('./components/chart-area/chart-area-component').then(
            (m) => m.ChartAreaComponent
          ),
        data: { chart: 'D-40', label: 'KhavedÄá¹ƒÅ›a', devanagari: 'à¤–à¤µà¥‡à¤¦à¤¾à¤‚à¤¶' },
      },
      {
        path: 'akshavedamsa',
        loadComponent: () =>
          import('./components/chart-area/chart-area-component').then(
            (m) => m.ChartAreaComponent
          ),        data: { chart: 'D-45', label: 'Aká¹£avedÄá¹ƒÅ›a', devanagari: 'à¤…à¤•à¥à¤·à¤µà¥‡à¤¦à¤¾à¤‚à¤¶' },
      },
      {
        path: 'shastiamsa',
        loadComponent: () =>
          import('./components/chart-area/chart-area-component').then(
            (m) => m.ChartAreaComponent
          ),

        data: { chart: 'D-60', label: 'á¹¢aá¹£á¹­yÄá¹ƒÅ›a', devanagari: 'à¤·à¤·à¥à¤Ÿà¥à¤¯à¤‚à¤¶' },
      },

      // â”€â”€ Dasha Systems â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      {
        path: 'vimshottari',
        loadComponent: () =>
          import('./components/chart-area/chart-area-component').then(
            (m) => m.ChartAreaComponent
          ),
        data: { tab: 'Vimshottari' },
      },
      {
        path: 'yogini',
        loadComponent: () =>
          import('./components/chart-area/chart-area-component').then(
            (m) => m.ChartAreaComponent
          ),
        data: { tab: 'Yogini' },
      },
      {
        path: 'ashtottari',
        loadComponent: () =>
          import('./components/chart-area/chart-area-component').then(
            (m) => m.ChartAreaComponent
          ),
        data: { tab: 'Ashtottari' },
      },
      {
        path: 'chara',
        loadComponent: () =>
          import('./components/chart-area/chart-area-component').then(
            (m) => m.ChartAreaComponent
          ),
        title: 'CharÄ DaÅ›Ä (Jaimini)',
        data: { tab: 'Chara' },
      },

      // â”€â”€ Strength & Analysis â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      {
        path: 'ashtakavarga',
        loadComponent: () =>
          import('./components/chart-area/chart-area-component').then(
            (m) => m.ChartAreaComponent
          ),
        data: { tab: 'Ashtakavarga' },
      },
      {
        path: 'shadbala',
        loadComponent: () =>
          import('./components/chart-area/chart-area-component').then(
            (m) => m.ChartAreaComponent
          ),
        data: { tab: 'Shadbala' },
      },
      {
        path: 'analysis',
        loadComponent: () =>
          import('./analysis/analysis.component').then(
            (m) => m.AnalysisComponent
          ),
        data: { tab: 'Analysis' },
      },
    ],
  },

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Saved Charts Browser
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    path: 'saved',
    loadComponent: () =>
      import('./components/saved-charts/saved-charts.component').then(
        (m) => m.SavedChartsComponent
      ),
    title: 'Saved Charts',
  },

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Settings
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    path: 'settings',
    loadComponent: () =>
      import('./components/settings/settings.component').then(
        (m) => m.SettingsComponent
      ),
    title: 'PyJHora â€” Settings',
  },

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // 404 Wildcard
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    path: '**',
    redirectTo: 'chart',
  },
];
