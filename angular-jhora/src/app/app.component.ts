import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule  } from '@angular/material/button';
import { MatIconModule    } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule    } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

interface NavItem { label: string; icon: string; route: string; }

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, RouterModule, RouterOutlet,
    MatToolbarModule, MatButtonModule, MatIconModule,
    MatSidenavModule, MatListModule, MatTooltipModule
  ],
  template: `
    <mat-sidenav-container class="app-container">

      <!-- Side nav -->
      <mat-sidenav #sidenav mode="side" opened class="sidenav">
        <div class="sidenav-header">
          <mat-icon>stars</mat-icon>
          <span>JHora</span>
        </div>
        <mat-nav-list>
          <a mat-list-item
             *ngFor="let item of navItems"
             [routerLink]="item.route"
             routerLinkActive="active-link"
             [matTooltip]="item.label"
             matTooltipPosition="right">
            <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
            <span matListItemTitle>{{ item.label }}</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <!-- Main content -->
      <mat-sidenav-content>
        <mat-toolbar color="primary" class="app-toolbar">
          <button mat-icon-button (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="toolbar-title">
            <mat-icon>stars</mat-icon> JHora – Vedic Astrology
          </span>
          <span class="spacer"></span>
          <span class="version-badge">PyJHora v4.7</span>
        </mat-toolbar>

        <main>
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>

    </mat-sidenav-container>
  `,
  styles: [`
    .app-container { height: 100vh; }
    .sidenav       { width: 220px; background: #3f51b5; color: #fff; }
    .sidenav-header{
      display: flex; align-items: center; gap: 10px;
      padding: 16px; font-size: 1.2rem; font-weight: 600;
      border-bottom: 1px solid rgba(255,255,255,.2);
      mat-icon { font-size: 1.6rem; }
    }
    .sidenav mat-nav-list a { color: rgba(255,255,255,.85); }
    .sidenav mat-nav-list a:hover   { background: rgba(255,255,255,.1); color: #fff; }
    .sidenav .active-link            { background: rgba(255,255,255,.2) !important; color: #fff !important; }
    .app-toolbar   { position: sticky; top: 0; z-index: 100; }
    .toolbar-title { display: flex; align-items: center; gap: 8px; font-size: 1.1rem; }
    .version-badge { font-size: .75rem; opacity: .7; }
    main           { min-height: calc(100vh - 64px); }
  `]
})
export class AppComponent {
  navItems: NavItem[] = [
    { label: 'Panchanga',       icon: 'calendar_today', route: '/panchanga'  },
    { label: 'Horoscope',       icon: 'auto_stories',   route: '/horoscope'  },
    { label: 'Dhasa-Bhukti',    icon: 'timeline',       route: '/dhasa'      },
    { label: 'Analysis',        icon: 'analytics',      route: '/analysis'   },
    { label: 'Muhurta',         icon: 'access_time',    route: '/muhurta'    },
    { label: 'Match',           icon: 'favorite',       route: '/match'      },
  ];
}
