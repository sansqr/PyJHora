import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BirthDataComponent }   from '../birth-data/birth-data-component';
import { ChartAreaComponent }   from '../chart-area/chart-area-component';
import { AnalysisComponent }    from '../../analysis/analysis.component';
import { JHoraService }       from '../../services/jhora.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, BirthDataComponent, ChartAreaComponent, AnalysisComponent],
  template: `
<div class="app-root">

  <!-- ═══════════════════ MENU BAR ═══════════════════ -->
  <div class="menubar">
    <span class="brand font-display">⊛ PyJHora 4.7</span>
    <div class="menu-sep"></div>
    @for (item of menus; track item) {
      <span class="menu-item" [class.active]="activeMenu() === item"
            (click)="activeMenu.set(item)">{{ item }}</span>
    }
  </div>

  <!-- ═══════════════════ TOOLBAR ══════════════════════ -->
  <div class="toolbar">
    <button class="tool-btn primary" (click)="calculate()">▶ Calculate</button>
    <button class="tool-btn">⎙ New Chart</button>
    <button class="tool-btn">⊞ Open</button>
    <button class="tool-btn">⊟ Save</button>
    <div class="separator"></div>
    <button class="tool-btn" (click)="printChart()">⎙ Print</button>
    <button class="tool-btn" (click)="exportPdf()">⬇ Export PDF</button>
    <div class="separator"></div>
    @for (ayn of ayanamsas; track ayn) {
      <button class="tool-btn" [class.primary]="selectedAyanamsa() === ayn"
              (click)="selectedAyanamsa.set(ayn)">{{ ayn }}</button>
    }
    <div class="separator"></div>
    <span class="tool-label">Style:</span>
    <button class="tool-btn" [class.primary]="chartStyle() === 'South'"
            (click)="chartStyle.set('South')">South Indian</button>
    <button class="tool-btn" [class.primary]="chartStyle() === 'North'"
            (click)="chartStyle.set('North')">North Indian</button>
  </div>

  <!-- ═══════════════════ THREE-PANEL BODY ═══════════════════ -->
  <div class="body-area">

    <!-- LEFT PANEL -->
    <div class="left-panel">
      <app-birth-data />
    </div>

    <!-- CENTER PANEL -->
    <div class="center-panel">
      <app-chart-area [style]="chartStyle()" />
    </div>

    <!-- RIGHT PANEL -->
    <div class="right-panel">
      <app-analysis />
    </div>

  </div>

  <!-- ═══════════════════ STATUS BAR ════════════════════════ -->
  <div class="statusbar">
    <div class="status-item"><div class="status-dot"></div> Ready</div>
    <div class="status-item">Ayanamsa: {{ selectedAyanamsa() }} — 24° 28′ 16″</div>
    <div class="status-item">PyJHora v4.7.0</div>
    <div class="status-item ml-auto">{{ currentTime }}</div>
  </div>

</div>
  `,
  styles: [`
    .app-root {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      background: var(--bg-primary);
    }
    .brand {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--gold-primary);
      letter-spacing: 0.06em;
      padding: 2px 12px 2px 4px;
      border-right: 1px solid var(--border-primary);
    }
    .menu-sep { width: 8px; }
    .menubar .active { color: var(--gold-primary); background: rgba(212,168,67,0.1); }
    .tool-label { font-family: var(--font-display); font-size: 0.65rem; color: var(--text-muted); }
    .body-area {
      display: grid;
      grid-template-columns: 280px 1fr 270px;
      flex: 1;
      overflow: hidden;
      gap: 0;
    }
    .left-panel, .center-panel, .right-panel {
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .left-panel   { border-right: 1px solid var(--border-primary); background: var(--bg-panel); }
    .center-panel { background: var(--bg-primary); }
    .right-panel  { border-left: 1px solid var(--border-primary); background: var(--bg-panel); }
    .ml-auto { margin-left: auto; }
  `]
})
export class AppShellComponent {
  svc = inject(JHoraService);

  menus    = ['File','Edit','View','Chart','Dasha','Tools','Settings','Help'];
  ayanamsas = ['Lahiri','Raman','KP','True Chitra'];

  activeMenu      = signal('File');
  selectedAyanamsa = signal('Lahiri');
  chartStyle      = signal<'South'|'North'>('South');

  get currentTime() {
    return new Date().toLocaleTimeString('en-IN', { hour12: false });
  }

  calculate()  { this.svc.recalculate(); }
  printChart() { window.print(); }
  exportPdf()  { console.log('Exporting PDF…'); }
}

