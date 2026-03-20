import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanetPosition, RASI_NAMES, PLANET_ABBR } from '../../models/jhora.models';

interface Cell { rasi: number; planets: string[]; isAsc: boolean; }

/**
 * Renders a South-Indian style (4×4 fixed-rasi) Vedic chart grid.
 *  - rasi 0→Aries occupies a fixed cell
 *  - ascendant cell is highlighted with ★
 */
@Component({
  selector: 'app-vedic-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-wrapper">
      <div class="chart-label">{{ title }}</div>
      <div class="chart-grid">
        <ng-container *ngFor="let cell of cells">
          <div class="cell" [class.asc]="cell.isAsc" [title]="rasiName(cell.rasi)">
            <span class="rasi-num">{{ cell.rasi + 1 }}</span>
            <span *ngFor="let p of cell.planets" class="planet-tag">{{ p }}</span>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .chart-wrapper { display: inline-block; text-align: center; }
    .chart-label   { font-weight: 500; color: #3f51b5; margin-bottom: 4px; font-size: .85rem; }
    .chart-grid    {
      display: grid;
      grid-template-columns: repeat(4, 72px);
      grid-template-rows:    repeat(4, 72px);
      border: 2px solid #3f51b5;
      background: #fff;
    }
    .cell {
      border: 1px solid #9fa8da;
      display: flex; flex-wrap: wrap; align-items: flex-start;
      padding: 4px; position: relative;
    }
    .rasi-num { position: absolute; top: 2px; right: 4px; font-size: .58rem; color: #9fa8da; }
    .planet-tag {
      background: #e8eaf6; border-radius: 3px;
      padding: 1px 3px; margin: 1px; font-size: .68rem;
    }
    .cell.asc::after {
      content: '★'; position: absolute; top: 1px; left: 3px;
      color: #f57c00; font-size: .7rem;
    }
    /* Center 2 cells of each row are hidden (form the "diamond" void) */
    .cell.void { background: #f5f5f5; visibility: hidden; }
  `]
})
export class VedicChartComponent implements OnChanges {
  @Input() planets: PlanetPosition[] = [];
  @Input() ascRasi  = 0;
  @Input() retrograde: number[] = [];
  @Input() title = 'D1 – Rasi';

  /** South-Indian grid: row-major order of rasi indices (0-based) */
  private readonly SI_GRID = [
    11, 0,  1,  2,
    10, -1, -1, 3,
     9, -1, -1, 4,
     8,  7,  6, 5
  ];

  cells: Cell[] = [];

  ngOnChanges(): void { this.buildCells(); }

  buildCells(): void {
    const map = new Map<number, string[]>();
    for (const p of this.planets) {
      if (!map.has(p.rasi)) map.set(p.rasi, []);
      const tag = this.retrograde.includes(p.planet_id)
        ? `(${PLANET_ABBR[p.planet_id] ?? p.planet_name})`
        : PLANET_ABBR[p.planet_id] ?? p.planet_name;
      map.get(p.rasi)!.push(tag);
    }
    this.cells = this.SI_GRID.map(rasi => ({
      rasi,
      planets: rasi >= 0 ? (map.get(rasi) ?? []) : [],
      isAsc: rasi === this.ascRasi
    }));
  }

  rasiName(rasi: number): string { return rasi >= 0 ? RASI_NAMES[rasi] : ''; }
}
