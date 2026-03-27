import { Component, inject, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JHoraService } from '../../services/jhora.service';
import { DivisionalChart } from '../../models/jhora.models';

@Component({
  selector: 'app-chart-area',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="ca-root">

  <!-- ── Divisional Chart Tabs ──────────────────── -->
  <div class="tab-bar">
    @for (d of divCharts; track d) {
      <span class="tab-item" [class.active]="activeDiv() === d"
            (click)="activeDiv.set(d)">{{ d }}</span>
    }
  </div>

  <!-- ── Main Content Tabs ─────────────────────── -->
  <div class="tab-bar secondary-tabs">
    @for (t of mainTabs; track t) {
      <span class="tab-item" [class.active]="activeTab() === t"
            (click)="activeTab.set(t)">{{ t }}</span>
    }
  </div>

  <!-- ── Content Area ──────────────────────────── -->
  <div class="ca-content">

    @if (activeTab() === 'Charts') {
      <div class="charts-grid">

        <!-- D-1 Rashi Chart -->
        <div class="chart-container">
          <div class="chart-title">Rāśi — {{ activeDiv() }}</div>
          <div class="si-chart">
            @for (cell of svc.SI_FULL_GRID; track $index; let i = $index) {
              @if (cell === null) {
                <div class="si-cell corner-cell"></div>
              } @else {
                <div class="si-cell" [class.lagna-cell]="cell === lagnaRashi">
                  <span class="rashi-num">{{ cell }}</span>
                  @for (p of svc.getPlanetsInRashi(cell); track p.id) {
                    <span class="planet-entry planet-{{p.id}}">
                      {{ p.id }}{{ p.isRetrograde ? '®' : '' }}
                    </span>
                  }
                </div>
              }
            }
          </div>
        </div>

        <!-- D-9 Navamsa Chart -->
        <div class="chart-container">
          <div class="chart-title">Navāṃśa — D-9</div>
          <div class="si-chart">
            @for (cell of svc.SI_FULL_GRID; track $index) {
              @if (cell === null) {
                <div class="si-cell corner-cell"></div>
              } @else {
                <div class="si-cell" [class.lagna-cell]="cell === 5">
                  <span class="rashi-num">{{ cell }}</span>
                  @for (p of getNavamsaPlanets(cell); track p) {
                    <span class="planet-entry planet-{{p}}">{{ p }}</span>
                  }
                </div>
              }
            }
          </div>
        </div>

        <!-- D-10 Dasamsa Chart -->
        <div class="chart-container">
          <div class="chart-title">Daśāṃśa — D-10</div>
          <div class="si-chart">
            @for (cell of svc.SI_FULL_GRID; track $index) {
              @if (cell === null) {
                <div class="si-cell corner-cell"></div>
              } @else {
                <div class="si-cell" [class.lagna-cell]="cell === 8">
                  <span class="rashi-num">{{ cell }}</span>
                  @for (p of getD10Planets(cell); track p) {
                    <span class="planet-entry planet-{{p}}">{{ p }}</span>
                  }
                </div>
              }
            }
          </div>
        </div>

        <!-- D-3 Drekkana Chart -->
        <div class="chart-container">
          <div class="chart-title">Drekkāṇa — D-3</div>
          <div class="si-chart">
            @for (cell of svc.SI_FULL_GRID; track $index) {
              @if (cell === null) {
                <div class="si-cell corner-cell"></div>
              } @else {
                <div class="si-cell" [class.lagna-cell]="cell === 3">
                  <span class="rashi-num">{{ cell }}</span>
                  @for (p of getD3Planets(cell); track p) {
                    <span class="planet-entry planet-{{p}}">{{ p }}</span>
                  }
                </div>
              }
            }
          </div>
        </div>

      </div>
    }

    @if (activeTab() === 'Vimshottari') {
      <div class="dasha-layout">
        <div class="dasha-section">
          <div class="panel-heading">Viṃśottarī Mahādaśā</div>
          <table class="jh-table">
            <thead>
              <tr><th>Planet</th><th>Start</th><th>End</th><th>Years</th></tr>
            </thead>
            <tbody>
              @for (d of svc.DASHAS; track d.planet) {
                <tr [class.dasha-active]="d.isActive" (click)="expandedDasha.set(d.planet)"
                    style="cursor:pointer">
                  <td>
                    <span class="planet-{{d.planet}}" style="font-weight:700">{{ d.planet }}</span>
                  </td>
                  <td>{{ d.startDate }}</td>
                  <td>{{ d.endDate   }}</td>
                  <td style="text-align:center;color:var(--text-muted)">
                    {{ getDashaYears(d.planet) }}
                  </td>
                </tr>
                @if (expandedDasha() === d.planet && d.antardashas) {
                  @for (ad of d.antardashas; track ad.planet) {
                    <tr [class.dasha-active]="ad.isActive" style="background:rgba(0,0,0,0.3)">
                      <td style="padding-left:20px;font-size:0.68rem">
                        <span class="planet-{{ad.planet}}">↳ {{ ad.planet }}</span>
                      </td>
                      <td style="font-size:0.68rem">{{ ad.startDate }}</td>
                      <td style="font-size:0.68rem">{{ ad.endDate   }}</td>
                      <td></td>
                    </tr>
                  }
                }
              }
            </tbody>
          </table>
        </div>

        <div class="dasha-section">
          <div class="panel-heading">Current Period</div>
          <div class="current-dasha">
            <div class="cd-label">Mahādaśā</div>
            <div class="cd-planet" style="color:var(--moon-color)">Moon (Candra)</div>
            <div class="cd-dates">2016-04-14 → 2026-04-14</div>
            <div class="divider"></div>
            <div class="cd-label">Antardaśā</div>
            <div class="cd-planet" style="color:var(--sun-color)">Sun (Sūrya)</div>
            <div class="cd-dates">2025-11-14 → 2026-04-14</div>
            <div class="divider"></div>
            <div class="cd-label">Pratyantardaśā</div>
            <div class="cd-planet" style="color:var(--saturn-color)">Saturn (Śani)</div>
            <div class="cd-dates">2026-02-01 → 2026-04-14</div>
          </div>
        </div>
      </div>
    }

    @if (activeTab() === 'Ashtakavarga') {
      <div class="avarga-container">
        <div class="panel-heading">Aṣṭakavarga — Sarva Bindu</div>
        <div class="avarga-grid">
          <div class="avarga-cell header">Planet</div>
          @for (r of rashiShorts; track r) {
            <div class="avarga-cell header">{{ r }}</div>
          }
          @for (row of svc.ASHTAKAVARGA; track row.planet) {
            <div class="avarga-cell header" style="color:var(--text-primary)">{{ row.planet }}</div>
            @for (b of row.bindus; track $index) {
              <div class="avarga-cell" [class.high]="b >= 5" [class.low]="b <= 2">{{ b }}</div>
            }
          }
        </div>
      </div>
    }

    @if (activeTab() === 'Shadbala') {
      <div class="shadbala-container">
        <div class="panel-heading">Ṣaḍbala — Six-Fold Strength</div>
        <table class="jh-table">
          <thead>
            <tr>
              <th>Planet</th><th>Sthāna</th><th>Dig</th><th>Kāla</th>
              <th>Cheṣṭā</th><th>Naisargika</th><th>Dṛk</th>
              <th>Total</th><th>Reqd</th><th>Ratio</th>
            </tr>
          </thead>
          <tbody>
            @for (row of svc.SHADBALA; track row.planet) {
              <tr>
                <td><span class="planet-{{row.planet}}" style="font-weight:700">{{ row.planet }}</span></td>
                <td>{{ row.sthana }}</td>
                <td>{{ row.dig }}</td>
                <td>{{ row.kala }}</td>
                <td>{{ row.chesta }}</td>
                <td>{{ row.naisargika }}</td>
                <td>{{ row.drik }}</td>
                <td style="color:var(--gold-primary);font-weight:600">{{ row.total }}</td>
                <td>{{ row.required }}</td>
                <td [style.color]="row.ratio >= 1 ? 'var(--mercury-color)' : 'var(--mars-color)'">
                  {{ row.ratio | number:'1.2-2' }}
                </td>
              </tr>
            }
          </tbody>
        </table>
        <div style="height:16px"></div>
        <div class="panel-heading">Strength Visualization</div>
        @for (row of svc.SHADBALA; track row.planet) {
          <div class="sb-bar-row">
            <span class="planet-{{row.planet}} sb-planet">{{ row.planet }}</span>
            <div class="strength-bar" style="flex:1">
              <div class="fill" [style.width.%]="(row.ratio * 60)"></div>
            </div>
            <span class="sb-ratio"
              [style.color]="row.ratio >= 1 ? 'var(--mercury-color)' : 'var(--mars-color)'">
              {{ row.ratio | number:'1.2-2' }}x
            </span>
          </div>
        }
      </div>
    }

    @if (activeTab() === 'Yogini') {
      <div class="yogini-container">
        <div class="panel-heading">Yoginī Daśā</div>
        <table class="jh-table">
          <thead>
            <tr><th>Yoginī</th><th>Planet</th><th>Years</th><th>Start</th><th>End</th></tr>
          </thead>
          <tbody>
            @for (yd of yoginiDashas; track yd.yogini) {
              <tr [class.dasha-active]="yd.active">
                <td style="color:var(--text-gold)">{{ yd.yogini }}</td>
                <td><span class="planet-{{yd.planet}}">{{ yd.planet }}</span></td>
                <td style="text-align:center">{{ yd.years }}</td>
                <td>{{ yd.start }}</td>
                <td>{{ yd.end }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

  </div>
</div>
  `,
  styles: [`
    .ca-root { display:flex; flex-direction:column; height:100%; overflow:hidden; }
    .secondary-tabs { background:var(--bg-panel); border-bottom:1px solid var(--border-primary); }
    .ca-content { flex:1; overflow-y:auto; overflow-x:hidden; padding:10px; }

    .charts-grid {
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:12px;
    }
    .chart-container {
      display:flex; flex-direction:column; gap:4px;
    }
    .chart-title {
      font-family:var(--font-display);
      font-size:0.72rem; font-weight:600;
      color:var(--gold-primary);
      letter-spacing:0.08em;
      text-align:center;
      padding:3px;
      background:rgba(212,168,67,0.06);
      border:1px solid var(--border-accent);
      border-bottom:none;
    }

    .dasha-layout { display:grid; grid-template-columns:1fr 240px; gap:10px; }
    .dasha-section { display:flex; flex-direction:column; overflow:hidden; }
    .current-dasha { padding:10px; display:flex; flex-direction:column; gap:6px; }
    .cd-label { font-family:var(--font-display); font-size:0.6rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em; }
    .cd-planet { font-family:var(--font-display); font-size:1rem; font-weight:600; }
    .cd-dates  { font-family:var(--font-mono); font-size:0.68rem; color:var(--text-secondary); }

    .avarga-container, .shadbala-container, .yogini-container { display:flex; flex-direction:column; gap:0; }

    .sb-bar-row {
      display:flex; align-items:center; gap:8px; padding:4px 6px;
      border-bottom:1px solid rgba(46,46,66,0.3);
    }
    .sb-planet { font-family:var(--font-display); font-size:0.72rem; font-weight:600; width:28px; }
    .sb-ratio  { font-family:var(--font-mono); font-size:0.65rem; width:36px; text-align:right; }
  `]
})
export class ChartAreaComponent {
  svc = inject(JHoraService);
  @Input() style: 'South' | 'North' = 'South';

  activeDiv   = signal<DivisionalChart>('D-1');
  activeTab   = signal('Charts');
  expandedDasha = signal<string | null>('Mo');

  divCharts: DivisionalChart[] = [
    'D-1','D-2','D-3','D-4','D-5','D-6','D-7','D-8',
    'D-9','D-10','D-12','D-16','D-20','D-24','D-27','D-30','D-40','D-45','D-60'
  ];

  mainTabs = ['Charts','Vimshottari','Ashtakavarga','Shadbala','Yogini'];

  rashiShorts = this.svc.RASHI_SHORT;

  lagnaRashi = 1;

  // Simplified sample data for other divisional charts
  navamsaMap: Record<number, string[]> = {
    1:['La','Gu'], 2:['Ke'], 3:['Sk'], 4:['Su','Bu'], 5:['Mo'],
    6:[], 7:[], 8:['Ra'], 9:[], 10:['Ma'], 11:['Sa'], 12:[]
  };
  d10Map: Record<number, string[]> = {
    1:['La'], 2:['Mo'], 3:[], 4:['Su'], 5:['Gu','Sk'], 6:['Ra'],
    7:[], 8:['Ke'], 9:['Ma'], 10:['Bu'], 11:[], 12:['Sa']
  };
  d3Map: Record<number, string[]> = {
    1:['La','Su'], 2:['Sa'], 3:['Ke'], 4:['Ra'], 5:['Mo'],
    6:['Gu'], 7:['Sk'], 8:[], 9:['Ma','Bu'], 10:[], 11:[], 12:[]
  };

  getNavamsaPlanets(rashi: number) { return this.navamsaMap[rashi] ?? []; }
  getD10Planets(rashi: number)     { return this.d10Map[rashi]     ?? []; }
  getD3Planets(rashi: number)      { return this.d3Map[rashi]      ?? []; }

  getDashaYears(planet: string): number {
    const map: Record<string,number> = {
      Su:6,Mo:10,Ma:7,Ra:18,Gu:16,Sa:19,Bu:17,Ke:7,Sk:20
    };
    return map[planet] ?? 0;
  }

  yoginiDashas = [
    { yogini:'Mangalā',   planet:'Mo', years:1, start:'2014-04-14', end:'2015-04-14', active:false },
    { yogini:'Piṅgalā',   planet:'Su', years:2, start:'2015-04-14', end:'2017-04-14', active:false },
    { yogini:'Dhanyā',    planet:'Gu', years:3, start:'2017-04-14', end:'2020-04-14', active:false },
    { yogini:'Bhrāmarī',  planet:'Ma', years:4, start:'2020-04-14', end:'2024-04-14', active:false },
    { yogini:'Bhadrā',    planet:'Bu', years:5, start:'2024-04-14', end:'2029-04-14', active:true  },
    { yogini:'Ulkā',      planet:'Sa', years:6, start:'2029-04-14', end:'2035-04-14', active:false },
    { yogini:'Siddha',    planet:'Sk', years:7, start:'2035-04-14', end:'2042-04-14', active:false },
    { yogini:'Sankatā',   planet:'Ra', years:8, start:'2042-04-14', end:'2050-04-14', active:false },
  ];
}
