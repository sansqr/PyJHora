import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  BirthData, Planet, HouseData, ChartData,
  DashaPeriod, Panchang, Yoga, AshtakavargaRow,
  ShadbalaRow, DivisionalChart
} from '../models/jhora.models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class JHoraService {

  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // ── Signals ──────────────────────────────────────────────
  readonly birthData   = signal<BirthData | null>(null);
  readonly chartData   = signal<ChartData | null>(null);
  readonly activeChart = signal<DivisionalChart>('D-1');
  readonly activeTab   = signal<string>('Chart');
  readonly isLoading   = signal<boolean>(false);
  readonly error       = signal<string | null>(null);

  // ── Planet catalog ───────────────────────────────────────
  readonly planets = signal<Planet[]>([
    { id:'La', name:'Lagna',   nameDevanagari:'लग्न', rashi:1, rashiName:'Aries',   degrees:14, minutes:22, seconds:18, isRetrograde:false, nakshatra:'Ashwini',    nakshatraPada:2, house:1,  dignity:'own',        shadbalaScore:1.52, color:'#ffd700' },
    { id:'Su', name:'Sun',     nameDevanagari:'सूर्य', rashi:4, rashiName:'Cancer',  degrees:8,  minutes:15, seconds:44, isRetrograde:false, nakshatra:'Pushya',     nakshatraPada:3, house:4,  dignity:'friend',     shadbalaScore:0.98, color:'#ff6b35' },
    { id:'Mo', name:'Moon',    nameDevanagari:'चन्द्र',rashi:7, rashiName:'Libra',   degrees:24, minutes:8,  seconds:32, isRetrograde:false, nakshatra:'Vishakha',   nakshatraPada:1, house:7,  dignity:'neutral',    shadbalaScore:0.76, color:'#a8b8d8' },
    { id:'Ma', name:'Mars',    nameDevanagari:'मंगल', rashi:10, rashiName:'Capricorn',degrees:2, minutes:44, seconds:10, isRetrograde:false, nakshatra:'Uttarashada',nakshatraPada:2, house:10, dignity:'exalted',    shadbalaScore:1.34, color:'#e84040' },
    { id:'Bu', name:'Mercury', nameDevanagari:'बुध',  rashi:4,  rashiName:'Cancer',  degrees:22, minutes:3,  seconds:56, isRetrograde:false, nakshatra:'Ashlesha',   nakshatraPada:4, house:4,  dignity:'enemy',      shadbalaScore:0.88, color:'#40c878' },
    { id:'Gu', name:'Jupiter', nameDevanagari:'गुरु', rashi:1,  rashiName:'Aries',   degrees:28, minutes:17, seconds:22, isRetrograde:false, nakshatra:'Krittika',   nakshatraPada:1, house:1,  dignity:'neutral',    shadbalaScore:1.12, color:'#f0a030' },
    { id:'Sk', name:'Venus',   nameDevanagari:'शुक्र',rashi:5,  rashiName:'Leo',     degrees:15, minutes:50, seconds:8,  isRetrograde:false, nakshatra:'Purva Phalguni',nakshatraPada:3,house:5, dignity:'friend',    shadbalaScore:0.94, color:'#f080c0' },
    { id:'Sa', name:'Saturn',  nameDevanagari:'शनि',  rashi:11, rashiName:'Aquarius',degrees:7,  minutes:29, seconds:14, isRetrograde:true,  nakshatra:'Shatabhisha',nakshatraPada:2, house:11, dignity:'own',        shadbalaScore:1.18, color:'#8090b0' },
    { id:'Ra', name:'Rahu',    nameDevanagari:'राहु', rashi:8,  rashiName:'Scorpio', degrees:19, minutes:6,  seconds:40, isRetrograde:true,  nakshatra:'Jyeshtha',   nakshatraPada:3, house:8,  dignity:'neutral',    shadbalaScore:0.84, color:'#7050a0' },
    { id:'Ke', name:'Ketu',    nameDevanagari:'केतु', rashi:2,  rashiName:'Taurus',  degrees:19, minutes:6,  seconds:40, isRetrograde:true,  nakshatra:'Rohini',     nakshatraPada:4, house:2,  dignity:'neutral',    shadbalaScore:0.84, color:'#c07050' },
  ]);

  readonly DASHAS: DashaPeriod[] = [
    { planet:'Su', startDate:'2010-04-14', endDate:'2016-04-14', isActive:false,
      antardashas:[
        { planet:'Su', startDate:'2010-04-14', endDate:'2010-08-26', isActive:false },
        { planet:'Mo', startDate:'2010-08-26', endDate:'2011-02-26', isActive:false },
        { planet:'Ma', startDate:'2011-02-26', endDate:'2011-07-05', isActive:false },
      ]
    },
    { planet:'Mo', startDate:'2016-04-14', endDate:'2026-04-14', isActive:true,
      antardashas:[
        { planet:'Mo', startDate:'2016-04-14', endDate:'2017-02-14', isActive:false },
        { planet:'Ma', startDate:'2017-02-14', endDate:'2017-09-14', isActive:false },
        { planet:'Ra', startDate:'2017-09-14', endDate:'2019-03-14', isActive:false },
        { planet:'Gu', startDate:'2019-03-14', endDate:'2020-07-14', isActive:false },
        { planet:'Sa', startDate:'2020-07-14', endDate:'2022-02-14', isActive:false },
        { planet:'Bu', startDate:'2022-02-14', endDate:'2023-08-14', isActive:false },
        { planet:'Ke', startDate:'2023-08-14', endDate:'2024-03-14', isActive:false },
        { planet:'Sk', startDate:'2024-03-14', endDate:'2025-11-14', isActive:false },
        { planet:'Su', startDate:'2025-11-14', endDate:'2026-04-14', isActive:true  },
      ]
    },
    { planet:'Ma', startDate:'2026-04-14', endDate:'2033-04-14', isActive:false },
    { planet:'Ra', startDate:'2033-04-14', endDate:'2051-04-14', isActive:false },
    { planet:'Gu', startDate:'2051-04-14', endDate:'2067-04-14', isActive:false },
    { planet:'Sa', startDate:'2067-04-14', endDate:'2086-04-14', isActive:false },
    { planet:'Bu', startDate:'2086-04-14', endDate:'2103-04-14', isActive:false },
    { planet:'Ke', startDate:'2103-04-14', endDate:'2110-04-14', isActive:false },
    { planet:'Sk', startDate:'2110-04-14', endDate:'2130-04-14', isActive:false },
  ];

  readonly panchang = signal<Panchang>({
    vara:'Wednesday', tithi:'Dashami', tithiNum:10,
    nakshatra:'Vishakha', nakshatraLord:'Jupiter',
    yoga:'Shiva', karana:'Bava', masa:'Chaitra', masaNum:1,
    sunrise:'06:14:22', sunset:'18:42:08',
    ayanamsa:'Lahiri', ayanamsaDeg:'24° 28\' 16"'
  });

  readonly YOGAS: Yoga[] = [
    { name:'Gajakesari',  type:'raja',  strength:92, planets:['Mo','Gu'], description:'Moon-Jupiter in kendra — prosperity and wisdom' },
    { name:'Ruchaka',     type:'pancha',strength:88, planets:['Ma'],      description:'Mars in own/exalted sign in kendra' },
    { name:'Budhaditya',  type:'raja',  strength:76, planets:['Su','Bu'], description:'Sun-Mercury conjunction — intelligence and fame' },
    { name:'Hamsa',       type:'pancha',strength:84, planets:['Gu'],      description:'Jupiter in own/exalted sign in kendra' },
    { name:'Adhi',        type:'dhana', strength:70, planets:['Su','Mo'], description:'All benefics in 6th, 7th, 8th from Moon' },
    { name:'Kemadruma',   type:'arista',strength:55, planets:['Mo'],      description:'No planets in 2nd/12th from Moon' },
    { name:'Saraswati',   type:'raja',  strength:80, planets:['Gu','Sk','Bu'], description:'Venus, Jupiter, Mercury in kendras/trikonas' },
  ];

  readonly ASHTAKAVARGA: AshtakavargaRow[] = [
    { planet:'Su', bindus:[4,3,5,2,4,3,5,4,3,4,5,2], total:44 },
    { planet:'Mo', bindus:[5,4,3,5,2,4,3,5,4,3,4,5], total:47 },
    { planet:'Ma', bindus:[3,4,2,4,3,5,4,3,5,2,4,3], total:42 },
    { planet:'Bu', bindus:[5,3,4,5,3,4,5,3,4,5,3,4], total:48 },
    { planet:'Gu', bindus:[4,5,3,4,5,3,4,5,3,4,5,3], total:48 },
    { planet:'Sk', bindus:[3,4,5,3,4,5,3,4,5,3,4,5], total:48 },
    { planet:'Sa', bindus:[2,3,4,2,3,4,2,3,4,2,3,4], total:36 },
    { planet:'Sarva', bindus:[26,26,26,25,24,28,26,27,28,23,28,26], total:313 },
  ];

  readonly SHADBALA: ShadbalaRow[] = [
    { planet:'Su', sthana:118, dig:42, kala:84, chesta:60, naisargika:60, drik:15, total:379, required:390, ratio:0.97 },
    { planet:'Mo', sthana:92,  dig:38, kala:76, chesta:48, naisargika:51, drik:12, total:317, required:360, ratio:0.88 },
    { planet:'Ma', sthana:134, dig:44, kala:60, chesta:66, naisargika:17, drik:18, total:339, required:300, ratio:1.13 },
    { planet:'Bu', sthana:102, dig:56, kala:68, chesta:54, naisargika:26, drik:14, total:320, required:420, ratio:0.76 },
    { planet:'Gu', sthana:126, dig:60, kala:72, chesta:72, naisargika:34, drik:22, total:386, required:390, ratio:0.99 },
    { planet:'Sk', sthana:110, dig:48, kala:64, chesta:60, naisargika:43, drik:16, total:341, required:330, ratio:1.03 },
    { planet:'Sa', sthana:88,  dig:32, kala:56, chesta:42, naisargika:9,  drik:10, total:237, required:300, ratio:0.79 },
  ];

  readonly SPECIAL_LAGNAS = [
    { name:'Ārūḍha Lagna',    short:'AL',  rashi:4,  rashiName:'Cancer'    },
    { name:'Upa Pada Lagna',  short:'UL',  rashi:10, rashiName:'Capricorn' },
    { name:'Hora Lagna',      short:'HL',  rashi:7,  rashiName:'Libra'     },
    { name:'Ghāṭikā Lagna',   short:'GL',  rashi:2,  rashiName:'Taurus'    },
    { name:'Śrī Lagna',       short:'SL',  rashi:11, rashiName:'Aquarius'  },
    { name:'Pāka Lagna',      short:'PkL', rashi:1,  rashiName:'Aries'     },
    { name:'Indu Lagna',      short:'IL',  rashi:9,  rashiName:'Sagittarius'},
    { name:'Dāra Kāraka',     short:'DK',  rashi:7,  rashiName:'Libra'     },
    { name:'Ātma Kāraka',     short:'AK',  rashi:4,  rashiName:'Cancer'    },
  ];

  readonly RASHI_NAMES = [
    'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
    'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
  ];

  readonly RASHI_SHORT = [
    'Ar','Ta','Ge','Cn','Le','Vi','Li','Sc','Sg','Cp','Aq','Pi'
  ];

  readonly RASHI_DEVANAGARI = [
    'मेष','वृष','मिथुन','कर्क','सिंह','कन्या',
    'तुला','वृश्चिक','धनु','मकर','कुम्भ','मीन'
  ];

  // ── Chart layout (South Indian 4×4 grid) ────────────────
  // Cell index 0-15, corners are [0,3,12,15]
  readonly SI_GRID_RASHI: (number | null)[] = [
    null, 12, 1, null,
    11,   null,null, 2,
    10,   null,null, 3,
    null,  9,  8, null
  ];

  // inner cells for missing
  readonly SI_INNER: { [key: number]: number } = {
    5: 7, 6: 6, 9: 4, 10: 5
  };

  readonly SI_FULL_GRID: (number | null)[] = [
    null, 12, 1,  null,
    11,    7,  6,  2,
    10,    4,  5,  3,
    null,  9,  8,  null
  ];

  getPlanetsInRashi(rashiNum: number): Planet[] {
    return this.planets().filter(p => p.rashi === rashiNum);
  }

  getDashaColor(planet: string): string {
    const p = this.planets().find(x => x.id === planet);
    return p?.color ?? '#a09880';
  }

  private _lastForm: { date: string; time: string; latitude: number; longitude: number; timezone: number; ayanamsa: string; place: string; } | null = null;

  async recalculate(): Promise<void> {
    if (this._lastForm) await this.calculate(this._lastForm);
  }

  /** Build the API request body from the form values passed by BirthDataComponent */
  private buildRequestBody(form: {
    date: string; time: string;
    latitude: number; longitude: number;
    timezone: number; ayanamsa: string;
    place: string;
  }) {
    const [year, month, day] = form.date.split('-').map(Number);
    const [hour, minute]     = form.time.split(':').map(Number);
    return {
      year, month, day,
      hour, minute, second: 0,
      latitude:         form.latitude,
      longitude:        form.longitude,
      timezone_offset:  form.timezone,
      ayanamsa_mode:    form.ayanamsa.toUpperCase(),
      place_name:       form.place,
      language:         'en',
    };
  }

  async calculate(form: {
    date: string; time: string;
    latitude: number; longitude: number;
    timezone: number; ayanamsa: string;
    place: string;
  }): Promise<void> {
    this._lastForm = form;
    this.isLoading.set(true);
    this.error.set(null);
    const body = this.buildRequestBody(form);
    try {
      const [rasiResp, panchangaResp]: [any, any] = await Promise.all([
        firstValueFrom(this.http.post<any>(`${this.baseUrl}/horoscope/rasi-chart`, body)),
        firstValueFrom(this.http.post<any>(`${this.baseUrl}/panchanga`, body)),
      ]);
      this._applyRasiChart(rasiResp);
      this._applyPanchanga(panchangaResp);
    } catch (err: any) {
      this.error.set(err?.error?.detail ?? err?.message ?? 'API error');
    } finally {
      this.isLoading.set(false);
    }
  }

  private _applyRasiChart(resp: any) {
    const planetIdMap: Record<number, string> = {
      0:'Su', 1:'Mo', 2:'Ma', 3:'Bu', 4:'Gu', 5:'Sk', 6:'Sa', 7:'Ra', 8:'Ke',
      12:'La'
    };
    const rashiNames = [
      '','Aries','Taurus','Gemini','Cancer','Leo','Virgo',
      'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
    ];
    const retro: number[] = resp.retrograde ?? [];
    const updated: Planet[] = resp.planets.map((p: any) => {
      const short = planetIdMap[p.planet_id] ?? `P${p.planet_id}`;
      const lon   = p.longitude ?? 0;
      const deg   = Math.floor(lon);
      const minFrac = (lon - deg) * 60;
      const min   = Math.floor(minFrac);
      const sec   = Math.round((minFrac - min) * 60);
      const existing = this.planets().find(x => x.id === short);
      return {
        ...(existing ?? {}),
        id:            short,
        name:          p.planet_name,
        nameDevanagari: existing?.nameDevanagari ?? p.planet_name,
        rashi:         p.rasi + 1,
        rashiName:     rashiNames[p.rasi + 1] ?? `Rashi ${p.rasi}`,
        degrees:       deg,
        minutes:       min,
        seconds:       sec,
        isRetrograde:  retro.includes(p.planet_id),
        color:         existing?.color ?? '#a09880',
      } as Planet;
    });
    // Merge ascendant
    if (resp.ascendant) {
      const asc = resp.ascendant;
      const lon = asc.longitude ?? 0;
      const deg = Math.floor(lon);
      const minFrac = (lon - deg) * 60;
      const min = Math.floor(minFrac);
      const sec = Math.round((minFrac - min) * 60);
      const existing = this.planets().find(x => x.id === 'La');
      const lagna: Planet = {
        ...(existing ?? {}),
        id: 'La', name: 'Lagna', nameDevanagari: 'लग्न',
        rashi: asc.rasi + 1,
        rashiName: rashiNames[asc.rasi + 1] ?? '',
        degrees: deg, minutes: min, seconds: sec,
        isRetrograde: false,
        nakshatra: asc.nakshatra ?? '',
        nakshatraPada: asc.pada ?? 0,
        house: 1, dignity: 'own', shadbalaScore: 0, color: '#ffd700',
      } as Planet;
      updated.unshift(lagna);
    }
    // Assign house numbers based on lagna rashi
    const lagnaRashi = updated.find(x => x.id === 'La')?.rashi ?? 1;
    updated.forEach(p => {
      p.house = ((p.rashi - lagnaRashi + 12) % 12) + 1;
    });
    this.planets.set(updated);
  }

  private _applyPanchanga(resp: any) {
    const tithiNames = [
      '','Pratipada','Dvitiya','Tritiya','Chaturthi','Panchami',
      'Shashthi','Saptami','Ashtami','Navami','Dashami',
      'Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima/Amavasya'
    ];
    const nakshatraNames = [
      '','Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
      'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
      'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula',
      'Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha',
      'Purva Bhadrapada','Uttara Bhadrapada','Revati'
    ];
    const yogaNames = [
      '','Vishkumbha','Preeti','Ayushman','Saubhagya','Shobhana',
      'Atiganda','Sukarma','Dhriti','Shula','Ganda','Vriddhi',
      'Dhruva','Vyaghata','Harshana','Vajra','Siddhi','Vyatipata',
      'Variyan','Parigha','Shiva','Siddha','Sadhya','Shubha',
      'Shukla','Brahma','Indra','Vaidhriti'
    ];
    const karanaNames = [
      '','Bava','Balava','Kaulava','Taitila','Garija',
      'Vanija','Vishti','Shakuni','Chatushpada','Naga','Kimstughna'
    ];
    const varaNames = ['','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const masaNames = [
      '','Chaitra','Vaishakha','Jyeshtha','Ashadha','Shravana',
      'Bhadrapada','Ashwina','Kartika','Margashirsha','Pausha','Magha','Phalguna'
    ];
    const t = resp.tithi?.number ?? 0;
    const n = resp.nakshatra?.number ?? 0;
    const y = resp.yoga?.number ?? 0;
    const k = resp.karana?.number ?? 0;
    const v = resp.vaara ?? 0;
    const m = resp.lunar_month?.month ?? 0;
    const sr = resp.sunrise?.time ?? this.panchang().sunrise;
    const ss = resp.sunset?.time  ?? this.panchang().sunset;
    this.panchang.set({
      vara:           varaNames[v]       ?? String(v),
      tithi:          tithiNames[t]      ?? String(t),
      tithiNum:       t,
      nakshatra:      nakshatraNames[n]  ?? String(n),
      nakshatraLord:  this.panchang().nakshatraLord,
      yoga:           yogaNames[y]       ?? String(y),
      karana:         karanaNames[k]     ?? String(k),
      masa:           masaNames[m]       ?? String(m),
      masaNum:        m,
      sunrise:        typeof sr === 'string' ? sr : sr.join(':'),
      sunset:         typeof ss === 'string' ? ss : ss.join(':'),
      ayanamsa:       this.panchang().ayanamsa,
      ayanamsaDeg:    this.panchang().ayanamsaDeg,
    });
  }
}