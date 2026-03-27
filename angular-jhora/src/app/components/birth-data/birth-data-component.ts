import { Component, inject } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { JHoraService }    from '../../services/jhora.service';

@Component({
  selector: 'app-birth-data',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="bd-root">

  <!-- ── Birth Details ─────────────────────────── -->
  <div class="panel-heading">Birth Details</div>
  <div class="bd-form">

    <div class="form-row">
      <label class="jh-label">Name</label>
      <input class="jh-input" [(ngModel)]="form.name" placeholder="Full Name">
    </div>

    <div class="form-row two-col">
      <div>
        <label class="jh-label">Date</label>
        <input class="jh-input" [(ngModel)]="form.date" type="date">
      </div>
      <div>
        <label class="jh-label">Time</label>
        <input class="jh-input" [(ngModel)]="form.time" type="time">
      </div>
    </div>

    <div class="form-row">
      <label class="jh-label">Place of Birth</label>
      <input class="jh-input" [(ngModel)]="form.place" placeholder="City, Country">
    </div>

    <div class="form-row two-col">
      <div>
        <label class="jh-label">Latitude</label>
        <input class="jh-input" [(ngModel)]="form.latitude" type="number" step="0.0001" placeholder="28.6139">
      </div>
      <div>
        <label class="jh-label">Longitude</label>
        <input class="jh-input" [(ngModel)]="form.longitude" type="number" step="0.0001" placeholder="77.2090">
      </div>
    </div>

    <div class="form-row two-col">
      <div>
        <label class="jh-label">Timezone</label>
        <select class="jh-select" [(ngModel)]="form.timezone">
          @for (tz of timezones; track tz.value) {
            <option [value]="tz.value">{{ tz.label }}</option>
          }
        </select>
      </div>
      <div>
        <label class="jh-label">Ayanamsa</label>
        <select class="jh-select" [(ngModel)]="form.ayanamsa">
          @for (a of ayanamsas; track a) {
            <option>{{ a }}</option>
          }
        </select>
      </div>
    </div>

    <div class="form-row btn-row">
      <button class="jh-btn primary" (click)="calculate()" [disabled]="svc.isLoading()"
              [style.opacity]="svc.isLoading() ? 0.6 : 1">
        {{ svc.isLoading() ? '⏳ Calculating…' : '▶ Calculate Chart' }}
      </button>
      <button class="jh-btn secondary" (click)="reset()" [disabled]="svc.isLoading()">Reset</button>
    </div>
    @if (svc.error()) {
      <div class="api-error">⚠ {{ svc.error() }}</div>
    }
  </div>

  <!-- ── Panchang ──────────────────────────────── -->
  <div class="panel-heading">Pañchāṅga</div>
  <div class="panchang-grid">
    @for (item of panchangItems; track item.label) {
      <div class="panch-item">
        <span class="panch-label">{{ item.label }}</span>
        <span class="panch-value">{{ item.value }}</span>
      </div>
    }
  </div>

  <!-- ── Graha Table ───────────────────────────── -->
  <div class="panel-heading">Graha Sthiti</div>
  <div class="graha-scroll">
    <table class="jh-table">
      <thead>
        <tr>
          <th>Graha</th>
          <th>Rāśi</th>
          <th>Degrees</th>
          <th>Nakṣatra</th>
          <th>H</th>
        </tr>
      </thead>
      <tbody>
        @for (p of svc.planets(); track p.id) {
          <tr>
            <td>
              <span class="planet-{{p.id}}" style="font-weight:600">{{ p.id }}</span>
              @if (p.isRetrograde) { <span class="retro">®</span> }
            </td>
            <td class="font-mono" style="font-size:0.68rem">{{ p.rashiName.slice(0,3) }}</td>
            <td class="font-mono" style="font-size:0.68rem">
              {{ p.degrees }}°{{ p.minutes }}'{{ p.seconds }}"
            </td>
            <td style="font-size:0.65rem;color:var(--text-muted)">
              {{ p.nakshatra.slice(0,6) }}-{{ p.nakshatraPada }}
            </td>
            <td style="text-align:center;color:var(--text-gold)">{{ p.house }}</td>
          </tr>
        }
      </tbody>
    </table>
  </div>

  <!-- ── Special Lagnas ────────────────────────── -->
  <div class="panel-heading">Special Lagnas</div>
  <div class="special-lagnas">
    @for (sl of svc.SPECIAL_LAGNAS; track sl.short) {
      <div class="sl-item">
        <span class="sl-short text-gold">{{ sl.short }}</span>
        <span class="sl-name">{{ sl.name }}</span>
        <span class="sl-rashi font-mono">{{ sl.rashiName.slice(0,3) }}</span>
      </div>
    }
  </div>

</div>
  `,
  styles: [`
    .bd-root { display:flex; flex-direction:column; height:100%; overflow:hidden; }
    .bd-form { padding:8px; display:flex; flex-direction:column; gap:6px; background:var(--bg-panel); flex-shrink:0; }
    .form-row { display:flex; flex-direction:column; gap:2px; }
    .two-col  { display:grid; grid-template-columns:1fr 1fr; gap:6px; flex-direction:row; }
    .btn-row  { flex-direction:row; gap:6px; margin-top:2px; }
    .api-error { padding:4px 8px; font-size:0.68rem; color:#e84040; background:rgba(232,64,64,0.08); border-left:2px solid #e84040; }
    .panchang-grid { display:grid; grid-template-columns:1fr 1fr; gap:0; flex-shrink:0; }
    .panch-item {
      display:flex; flex-direction:column; padding:4px 8px;
      border-bottom:1px solid var(--border-primary);
      border-right:1px solid var(--border-primary);
      &:nth-child(even) { border-right:none; }
    }
    .panch-label { font-family:var(--font-display); font-size:0.58rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em; }
    .panch-value { font-family:var(--font-mono); font-size:0.72rem; color:var(--text-primary); }
    .graha-scroll { flex:1; overflow-y:auto; }
    .special-lagnas { flex-shrink:0; overflow-y:auto; max-height:140px; }
    .sl-item {
      display:grid; grid-template-columns:36px 1fr 40px;
      align-items:center; gap:6px; padding:3px 8px;
      border-bottom:1px solid rgba(46,46,66,0.4);
      &:hover { background:var(--bg-hover); }
    }
    .sl-short { font-family:var(--font-display); font-size:0.68rem; font-weight:600; }
    .sl-name  { font-size:0.68rem; color:var(--text-secondary); }
    .sl-rashi { font-size:0.65rem; color:var(--text-muted); text-align:right; }
  `]
})
export class BirthDataComponent {
  svc = inject(JHoraService);

  form = {
    name:      'Sample Native',
    date:      '1990-04-14',
    time:      '08:30',
    place:     'New Delhi, India',
    latitude:  28.6139,
    longitude: 77.2090,
    timezone:  5.5,
    ayanamsa:  'Lahiri'
  };

  timezones = [
    { value: 5.5,  label: 'IST +5:30' },
    { value: 0,    label: 'GMT +0:00' },
    { value: -5,   label: 'EST -5:00' },
    { value: 8,    label: 'CST +8:00' },
    { value: 3.5,  label: 'IRST +3:30'},
  ];

  ayanamsas = ['Lahiri','Raman','KP','True Chitra','Yukteshwar','Fagan/Bradley'];

  get panchangItems() {
    const p = this.svc.panchang();
    return [
      { label:'Vara',      value: p.vara        },
      { label:'Tithi',     value: p.tithi       },
      { label:'Nakṣatra',  value: p.nakshatra   },
      { label:'Yoga',      value: p.yoga        },
      { label:'Karaṇa',    value: p.karana      },
      { label:'Māsa',      value: p.masa        },
      { label:'Sunrise',   value: p.sunrise     },
      { label:'Sunset',    value: p.sunset      },
      { label:'Ayanāṃśa',  value: p.ayanamsaDeg },
    ];
  }

  calculate() { this.svc.calculate(this.form); }
  reset()     { Object.assign(this.form, { name:'', date:'', time:'', place:'', latitude:0, longitude:0 }); }
}
