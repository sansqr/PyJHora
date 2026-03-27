import { Component, HostListener, inject, signal, computed } from '@angular/core';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

interface MenuItem { label?: string; route?: string; separator?: boolean; }
interface Menu { label: string; children: MenuItem[]; }

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="jh-shell">

      <!-- Title Bar -->
      <div class="jh-title-bar">
        <span class="jh-logo">☽</span>
        <span class="jh-title">Jagannath Hora — Vedic Astrology Software &nbsp;|&nbsp; PyJHora v4.7</span>
        <span class="jh-title-right">Standalone App — Not for Resale</span>
      </div>

      <!-- Menu Bar -->
      <nav class="jh-menubar" (mouseleave)="closeMenu()">
        @for (menu of menuDef; track menu.label; let mi = $index) {
          <div class="jh-menu-root"
               [class.open]="openMenu() === mi"
               (mouseenter)="openMenu() >= 0 ? openMenu.set(mi) : null"
               (click)="toggleMenu(mi)">
            <span class="jh-menu-label">{{ menu.label }}</span>

            @if (openMenu() === mi) {
              <div class="jh-dropdown">
                @for (item of menu.children; track $index) {
                  @if (item.separator) {
                    <div class="jh-menu-sep"></div>
                  } @else {
                    <div class="jh-menu-item" (click)="navigate(item.route)">{{ item.label }}</div>
                  }
                }
              </div>
            }
          </div>
        }
      </nav>

      <!-- Toolbar -->
      <div class="jh-toolbar">
        @for (btn of toolbarButtons; track btn.label) {
          @if (btn.sep) {
            <div class="jh-toolbar-sep"></div>
          } @else {
            <button class="jh-tb-btn" (click)="navigate(btn.route)" [matTooltip]="btn.label">
              {{ btn.label }}
            </button>
          }
        }
        <div class="jh-toolbar-sep"></div>
        <span class="jh-tb-label">Ayanamsa:</span>
        <select class="jh-tb-select" (change)="ayanamsa.set($any($event.target).value)">
          @for (a of ayanamsaList; track a) {
            <option [value]="a" [selected]="ayanamsa() === a">{{ a }}</option>
          }
        </select>
        <div class="jh-toolbar-sep"></div>
        <span class="jh-tb-label">Lang:</span>
        <select class="jh-tb-select" (change)="lang.set($any($event.target).value)">
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="ta">Tamil</option>
          <option value="te">Telugu</option>
          <option value="ka">Kannada</option>
          <option value="ml">Malayalam</option>
        </select>
      </div>

      <!-- Page content -->
      <div class="jh-content">
        <router-outlet />
      </div>

      <!-- Status Bar -->
      <div class="jh-statusbar">
        <span>PyJHora v4.7</span>
        <span class="jh-status-sep">|</span>
        <span>Ayanamsa: {{ ayanamsa() }}</span>
        <span class="jh-status-sep">|</span>
        <span>Julian Day: 2460000.0</span>
        <span class="jh-status-sep">|</span>
        <span class="jh-status-route">{{ currentRoute() }}</span>
        <span style="flex:1"></span>
        <span>Ready</span>
      </div>

    </div>
  `,
  styles: [`
    .jh-shell {
      display: flex; flex-direction: column; height: 100vh;
      background: var(--jh-bg-app); color: var(--jh-text-primary);
      font-family: 'Courier New', Courier, monospace; font-size: 12px; overflow: hidden;
    }
    .jh-title-bar {
      background: linear-gradient(to bottom, #1e1e40, #12122a);
      border-bottom: 1px solid var(--jh-border-bright);
      padding: 3px 10px; display: flex; align-items: center; gap: 8px; flex-shrink: 0;
    }
    .jh-logo        { font-size: 16px; color: #aabbff; }
    .jh-title       { font-size: 12px; color: #ccccee; font-weight: bold; }
    .jh-title-right { margin-left: auto; font-size: 10px; color: var(--jh-text-muted); }
    .jh-menubar {
      background: #1a1a32; border-bottom: 1px solid var(--jh-border);
      display: flex; flex-shrink: 0; position: relative; z-index: 200; user-select: none;
    }
    .jh-menu-root {
      position: relative; padding: 3px 10px; cursor: pointer; color: #bbbbd0; font-size: 11px;
      &:hover, &.open { background: #2a2a55; color: #fff; }
    }
    .jh-dropdown {
      position: absolute; top: 100%; left: 0; background: #1e1e3a;
      border: 1px solid var(--jh-border-bright); min-width: 200px; z-index: 500;
      box-shadow: 3px 3px 8px rgba(0,0,0,.6);
    }
    .jh-menu-item {
      padding: 4px 16px; font-size: 11px; color: #bbbbd0; cursor: pointer; white-space: nowrap;
      &:hover { background: #2a2a55; color: #fff; }
    }
    .jh-menu-sep { border-bottom: 1px solid var(--jh-border); margin: 2px 0; }
    .jh-toolbar {
      background: var(--jh-bg-toolbar); border-bottom: 1px solid var(--jh-border);
      padding: 3px 6px; display: flex; gap: 3px; align-items: center;
      flex-shrink: 0; flex-wrap: wrap;
    }
    .jh-tb-btn {
      background: #252548; border: 1px solid #3a3a66; color: #aabbcc;
      padding: 2px 10px; font-family: 'Courier New', Courier, monospace; font-size: 11px;
      cursor: pointer; border-radius: 2px; height: 22px;
      &:hover { background: #333366; color: #fff; border-color: var(--jh-border-accent); }
    }
    .jh-toolbar-sep { width: 1px; height: 16px; background: var(--jh-border); margin: 0 4px; }
    .jh-tb-label { font-size: 10px; color: var(--jh-text-muted); margin-right: 2px; }
    .jh-tb-select {
      background: var(--jh-bg-input); border: 1px solid var(--jh-border);
      color: var(--jh-text-primary); font-family: 'Courier New', Courier, monospace;
      font-size: 11px; padding: 1px 4px; height: 22px; border-radius: 2px;
      &:focus { outline: 1px solid var(--jh-border-accent); }
    }
    .jh-content { flex: 1; overflow: auto; background: var(--jh-bg-app); }
    .jh-statusbar {
      background: #0e0e20; border-top: 1px solid var(--jh-border);
      padding: 2px 8px; font-size: 10px; color: var(--jh-text-muted);
      display: flex; align-items: center; gap: 6px; flex-shrink: 0;
    }
    .jh-status-sep   { color: var(--jh-border); }
    .jh-status-route { color: var(--jh-text-accent); }
  `]
})
export class AppComponent {
  private readonly router = inject(Router);

  // Signals
  readonly openMenu    = signal(-1);
  readonly ayanamsa    = signal('LAHIRI');
  readonly lang        = signal('en');
  readonly currentRoute = signal('/panchanga');

  constructor() {
    // effect replaces ngOnInit router.events subscription
    this.router.events.subscribe(() => this.currentRoute.set(this.router.url));
  }

  readonly ayanamsaList = ['LAHIRI','KP','RAMAN','FAGAN','YUKTESHWAR','USHASHASHI'];

  readonly toolbarButtons = [
    { label: 'Panchanga',    route: '/panchanga' },
    { label: 'Horoscope',    route: '/horoscope' },
    { label: 'Dhasa',        route: '/dhasa'     },
    { label: 'Analysis',     route: '/analysis'  },
    { label: 'Muhurta',      route: '/muhurta'   },
    { label: 'Match',        route: '/match'     },
    { sep: true, label: '', route: '' },
  ];

  readonly menuDef: Menu[] = [
    { label: 'File', children: [
      { label: 'New Chart' }, { label: 'Open Chart...' }, { label: 'Save Chart' },
      { separator: true },
      { label: 'Export to PDF' }, { label: 'Print...' },
      { separator: true }, { label: 'Exit' }
    ]},
    { label: 'View', children: [
      { label: 'Panchanga',    route: '/panchanga' },
      { label: 'Horoscope',    route: '/horoscope' },
      { label: 'Dhasa-Bhukti', route: '/dhasa'     },
      { label: 'Analysis',     route: '/analysis'  },
      { label: 'Muhurta',      route: '/muhurta'   },
      { label: 'Match',        route: '/match'     },
    ]},
    { label: 'Charts', children: [
      { label: 'D1 – Rasi',         route: '/horoscope' },
      { label: 'D2 – Hora',         route: '/horoscope' },
      { label: 'D3 – Drekkana',     route: '/horoscope' },
      { label: 'D9 – Navamsa',      route: '/horoscope' },
      { label: 'D10 – Dasamsa',     route: '/horoscope' },
      { label: 'D12 – Dvadasamsa',  route: '/horoscope' },
      { separator: true },
      { label: 'All Divisional Charts', route: '/horoscope' },
    ]},
    { label: 'Strengths', children: [
      { label: 'Shadbala',     route: '/analysis' },
      { label: 'Ashtakavarga', route: '/analysis' },
      { label: 'Yogas',        route: '/analysis' },
      { label: 'Raja Yoga',    route: '/analysis' },
    ]},
    { label: 'Dhasa', children: [
      { label: 'Vimshottari', route: '/dhasa' }, { label: 'Ashtottari', route: '/dhasa' },
      { label: 'Yogini',      route: '/dhasa' }, { label: 'Chara Dhasa',route: '/dhasa' },
      { separator: true }, { label: 'All Dhasas', route: '/dhasa' },
    ]},
    { label: 'Muhurta', children: [
      { label: 'Auspicious Timings', route: '/muhurta' },
      { label: 'Rahu Kalam',         route: '/muhurta' },
      { label: 'Gauri Choghadiya',   route: '/muhurta' },
    ]},
    { label: 'Match',  children: [{ label: 'Ashtakoota Match', route: '/match' }] },
    { label: 'Tools',  children: [{ label: 'Panchanga', route: '/panchanga' }, { separator: true }, { label: 'Settings...' }] },
    { label: 'Help',   children: [{ label: 'Help Topics' }, { separator: true }, { label: 'About Jagannath Hora...' }] },
  ];

  toggleMenu(mi: number): void {
    this.openMenu.set(this.openMenu() === mi ? -1 : mi);
  }

  @HostListener('document:click')
  closeMenu(): void { this.openMenu.set(-1); }

  navigate(route?: string): void {
    if (route) this.router.navigateByUrl(route);
    this.openMenu.set(-1);
  }
}
