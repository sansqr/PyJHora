import { Component, Input, OnChanges, signal, computed } from '@angular/core';
import { PlanetPosition, RASI_NAMES, PLANET_ABBR } from '../../models/jhora.models';

interface PlanetTag { abbr: string; color: string; retro: boolean; }
interface Cell       { rasi: number; planets: PlanetTag[]; isAsc: boolean; isVoid: boolean; }

const PLANET_COLORS: Record<number, string> = {
  0:'#FFD700', 1:'#C0C0C0', 2:'#FF5555', 3:'#44DD66', 4:'#FF9933',
  5:'#FF77BB', 6:'#AAAAAA', 7:'#CC66FF', 8:'#BB55EE',
  9:'#55CCFF', 10:'#55CCFF', 11:'#55CCFF', 12:'#FFFFFF',
};

/** South-Indian 4×4 fixed-rasi Vedic chart — JH8 dark theme */
@Component({
  selector: 'app-vedic-chart',
  standalone: true,
  template: `
    <div class="jh-chart-wrap">
      <div class="jh-chart-label">{{ title }}</div>
      <div class="jh-chart-grid">
        @for (cell of cells(); track $index) {
          <div class="jh-cell"
               [class.jh-cell-asc]="cell.isAsc"
               [class.jh-cell-void]="cell.isVoid"
               [attr.title]="rasiName(cell.rasi)">

            @if (!cell.isVoid) {
              <span class="jh-rasi-num">{{ cell.rasi + 1 }}</span>
            }

            @for (p of cell.planets; track p.abbr) {
              <span class="jh-planet-tag" [style.color]="p.color">
                {{ p.abbr }}{{ p.retro ? '(R)' : '' }}
              </span>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .jh-chart-wrap  { display: inline-block; text-align: center; }
    .jh-chart-label { font-size: 10px; font-weight: bold; color: var(--jh-text-accent); margin-bottom: 4px; text-align: center; font-family: 'Courier New', Courier, monospace; }
    .jh-chart-grid  { display: grid; grid-template-columns: repeat(4, 72px); grid-template-rows: repeat(4, 72px); border: 1px solid var(--jh-border-bright); background: var(--jh-bg-app); }
    .jh-cell        { border: 1px solid var(--jh-border); display: flex; flex-wrap: wrap; align-items: flex-start; padding: 3px; position: relative; background: var(--jh-bg-panel); }
    .jh-cell-void   { background: #090910 !important; pointer-events: none; }
    .jh-cell-asc    { background: #0a1a0a !important; border-color: #336633 !important;
      &::before { content: '★'; position: absolute; top: 1px; left: 3px; color: #FFD700; font-size: 9px; line-height: 1; } }
    .jh-rasi-num    { position: absolute; top: 2px; right: 3px; font-size: 9px; color: var(--jh-text-muted); font-family: 'Courier New', Courier, monospace; }
    .jh-planet-tag  { font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: bold; padding: 1px; margin: 1px; line-height: 1.2; }
  `]
})
export class VedicChartComponent implements OnChanges {
  @Input() planets:    PlanetPosition[] = [];
  @Input() ascRasi     = 0;
  @Input() retrograde: number[] = [];
  @Input() title       = 'D1 – Rasi';

  private readonly SI_GRID = [
    11, 0, 1, 2,
    10,-1,-1, 3,
     9,-1,-1, 4,
     8, 7, 6, 5,
  ];

  readonly cells = signal<Cell[]>([]);

  ngOnChanges(): void { this.build(); }

  private build(): void {
    const map = new Map<number, PlanetTag[]>();
    for (const p of this.planets) {
      if (!map.has(p.rasi)) map.set(p.rasi, []);
      map.get(p.rasi)!.push({
        abbr:  PLANET_ABBR[p.planet_id] ?? p.planet_name.slice(0, 2),
        color: PLANET_COLORS[p.planet_id] ?? '#cccccc',
        retro: this.retrograde.includes(p.planet_id),
      });
    }
    this.cells.set(this.SI_GRID.map(rasi => ({
      rasi,
      planets: rasi >= 0 ? (map.get(rasi) ?? []) : [],
      isAsc:   rasi === this.ascRasi,
      isVoid:  rasi < 0,
    })));
  }

  rasiName(rasi: number): string { return rasi >= 0 ? RASI_NAMES[rasi] : ''; }
}
