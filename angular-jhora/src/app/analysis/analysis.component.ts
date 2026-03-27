import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JHoraService } from '../services/jhora.service';
@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="an-root">

  <!-- ── Yogas ────────────────────────────── -->
  <div class="panel-heading">Yoga Vibhāga</div>
  <div class="yoga-section">
    @for (yoga of svc.YOGAS; track yoga.name) {
      <div class="yoga-card">
        <div class="yoga-header">
          <span class="yoga-badge {{ yoga.type }}">{{ yoga.name }}</span>
          <div class="strength-bar" style="flex:1;max-width:60px">
            <div class="fill" [style.width.%]="yoga.strength"></div>
          </div>
          <span style="font-family:var(--font-mono);font-size:0.6rem;color:var(--text-muted)">
            {{ yoga.strength }}%
          </span>
        </div>
        <div class="yoga-planets">
          @for (p of yoga.planets; track p) {
            <span class="planet-{{p}}" style="font-family:var(--font-display);font-size:0.68rem;font-weight:600">{{ p }}</span>
          }
        </div>
        <div class="yoga-desc">{{ yoga.description }}</div>
      </div>
    }
  </div>

  <!-- ── Nakshatra Analysis ─────────────────── -->
  <div class="panel-heading">Nakṣatra Viśleṣaṇa</div>
  <div class="nakshatra-section">
    @for (p of mainPlanets; track p.id) {
      <div class="nk-item">
        <span class="planet-{{p.id}}" style="font-family:var(--font-display);font-size:0.72rem;font-weight:600;min-width:24px">{{ p.id }}</span>
        <div class="nk-info">
          <span style="font-size:0.72rem;color:var(--text-primary)">{{ p.nakshatra }}</span>
          <span style="font-size:0.6rem;color:var(--text-muted)">Pāda {{ p.nakshatraPada }} · Lord: {{ getNakshatraLord(p.nakshatra) }}</span>
        </div>
      </div>
    }
  </div>

  <!-- ── Lagna Interpretation ──────────────── -->
  <div class="panel-heading">Lagna Viśleṣaṇa</div>
  <div class="lagna-section">
    <div class="lagna-card">
      <div class="lagna-title">Aries Ascendant (Meṣa Lagna)</div>
      <div class="lagna-ruler">Ruler: <span class="planet-Ma">Mars</span> in Capricorn (Exalted)</div>
      <div class="lagna-desc">
        Dynamic, pioneering energy. The native is courageous with leadership qualities.
        Exalted Mars as Lagna lord bestows exceptional vitality and executive ability.
      </div>
    </div>
  </div>

  <!-- ── Kāraka Analysis ──────────────────── -->
  <div class="panel-heading">Jaimini Kāraka</div>
  <div class="karaka-section">
    @for (k of karakas; track k.name) {
      <div class="karaka-row">
        <span class="karaka-name">{{ k.name }}</span>
        <span class="planet-{{k.planet}}" style="font-family:var(--font-display);font-weight:600;font-size:0.75rem">{{ k.planet }}</span>
        <span class="karaka-rashi">{{ k.rashi }}</span>
      </div>
    }
  </div>

  <!-- ── Upachaya/Dusthana Houses ──────────── -->
  <div class="panel-heading">House Strength</div>
  <div class="house-strength">
    @for (h of houseSummary; track h.house) {
      <div class="hs-row">
        <span class="hs-num">{{ h.house }}</span>
        <span class="hs-name">{{ h.name }}</span>
        <div class="strength-bar" style="flex:1">
          <div class="fill" [style.width.%]="h.strength"
               [style.background]="h.type === 'kendra' ? 'linear-gradient(90deg,#8a6820,#d4a843)' :
                                   h.type === 'trikona' ? 'linear-gradient(90deg,#2a5a30,#40c878)' :
                                   'linear-gradient(90deg,#4a1818,#e84040)'">
          </div>
        </div>
        <span class="hs-tag" [class]="h.type">{{ h.type }}</span>
      </div>
    }
  </div>

</div>
  `,
  styles: [`
    .an-root { display:flex; flex-direction:column; height:100%; overflow-y:auto; }
    .yoga-section { padding:6px; display:flex; flex-direction:column; gap:5px; }
    .yoga-card {
      padding:6px 8px; border:1px solid var(--border-primary);
      border-radius:var(--radius-sm); background:var(--bg-card);
      display:flex; flex-direction:column; gap:3px;
    }
    .yoga-header { display:flex; align-items:center; gap:6px; }
    .yoga-planets { display:flex; gap:6px; }
    .yoga-desc { font-size:0.65rem; color:var(--text-muted); font-style:italic; }

    .nakshatra-section { display:flex; flex-direction:column; }
    .nk-item {
      display:flex; align-items:center; gap:8px; padding:4px 8px;
      border-bottom:1px solid rgba(46,46,66,0.4);
      &:hover { background:var(--bg-hover); }
    }
    .nk-info { display:flex; flex-direction:column; }

    .lagna-section { padding:8px; }
    .lagna-card {
      padding:8px; border:1px solid var(--border-accent);
      border-radius:var(--radius-sm);
      background:rgba(212,168,67,0.04);
    }
    .lagna-title { font-family:var(--font-display); font-size:0.8rem; color:var(--gold-primary); margin-bottom:4px; }
    .lagna-ruler { font-size:0.72rem; color:var(--text-secondary); margin-bottom:6px; }
    .lagna-desc  { font-size:0.7rem; color:var(--text-muted); font-style:italic; line-height:1.5; }

    .karaka-section { display:flex; flex-direction:column; }
    .karaka-row {
      display:grid; grid-template-columns:110px 40px 1fr;
      align-items:center; gap:8px; padding:3px 8px;
      border-bottom:1px solid rgba(46,46,66,0.4);
      &:hover { background:var(--bg-hover); }
    }
    .karaka-name  { font-family:var(--font-display); font-size:0.65rem; color:var(--text-muted); }
    .karaka-rashi { font-family:var(--font-mono); font-size:0.65rem; color:var(--text-secondary); }

    .house-strength { display:flex; flex-direction:column; gap:2px; padding:6px; }
    .hs-row { display:flex; align-items:center; gap:6px; }
    .hs-num  { font-family:var(--font-display); font-size:0.7rem; color:var(--gold-primary); width:18px; text-align:center; }
    .hs-name { font-size:0.65rem; color:var(--text-secondary); width:72px; }
    .hs-tag  {
      font-family:var(--font-display); font-size:0.55rem; font-weight:600;
      letter-spacing:0.06em; padding:1px 5px; border-radius:10px;
      &.kendra  { background:rgba(212,168,67,0.1); color:var(--gold-primary); }
      &.trikona { background:rgba(64,200,120,0.1); color:var(--mercury-color); }
      &.dusthana{ background:rgba(232,64,64,0.1);  color:var(--mars-color);   }
      &.upachaya{ background:rgba(160,80,192,0.1); color:var(--rahu-color);   }
    }
  `]
})
export class AnalysisComponent {
  svc = inject(JHoraService);

  get mainPlanets() { return this.svc.PLANETS.filter(p => p.id !== 'La'); }

  getNakshatraLord(nakshatra: string): string {
    const map: Record<string,string> = {
      'Ashwini':'Ke','Bharani':'Sk','Krittika':'Su','Rohini':'Mo',
      'Mrigashira':'Ma','Ardra':'Ra','Punarvasu':'Gu','Pushya':'Sa',
      'Ashlesha':'Bu','Magha':'Ke','Purva Phalguni':'Sk','Uttara Phalguni':'Su',
      'Hasta':'Mo','Chitra':'Ma','Swati':'Ra','Vishakha':'Gu','Anuradha':'Sa',
      'Jyeshtha':'Bu','Mula':'Ke','Purva Ashadha':'Sk','Uttarashada':'Su',
      'Shravana':'Mo','Dhanistha':'Ma','Shatabhisha':'Ra','Purva Bhadra':'Gu',
      'Uttara Bhadra':'Sa','Revati':'Bu',
    };
    return map[nakshatra] ?? '—';
  }

  karakas = [
    { name:'Ātma Kāraka (AK)',     planet:'Ma', rashi:'Capricorn' },
    { name:'Amātya Kāraka (AmK)',  planet:'Su', rashi:'Cancer'    },
    { name:'Bhrātri Kāraka (BK)',  planet:'Gu', rashi:'Aries'     },
    { name:'Mātri Kāraka (MK)',    planet:'Mo', rashi:'Libra'     },
    { name:'Pitri Kāraka (PiK)',   planet:'Sa', rashi:'Aquarius'  },
    { name:'Putra Kāraka (PuK)',   planet:'Sk', rashi:'Leo'       },
    { name:'Jñāti Kāraka (JK)',    planet:'Bu', rashi:'Cancer'    },
    { name:'Dāra Kāraka (DK)',     planet:'Ra', rashi:'Scorpio'   },
  ];

  houseSummary = [
    { house:'1', name:'Tanu',    strength:88, type:'kendra'   },
    { house:'2', name:'Dhana',   strength:62, type:'upachaya' },
    { house:'4', name:'Sukha',   strength:74, type:'kendra'   },
    { house:'5', name:'Putra',   strength:80, type:'trikona'  },
    { house:'6', name:'Shatru',  strength:45, type:'dusthana' },
    { house:'7', name:'Kalatra', strength:58, type:'kendra'   },
    { house:'8', name:'Ayur',    strength:42, type:'dusthana' },
    { house:'9', name:'Dharma',  strength:86, type:'trikona'  },
    { house:'10', name:'Karma',  strength:92, type:'kendra'   },
    { house:'12', name:'Vyaya',  strength:38, type:'dusthana' },
  ];
}
