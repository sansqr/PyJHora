// ─── Shared request shapes ────────────────────────────────────────────────────

export interface BirthData {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second?: number;
  latitude: number;
  longitude: number;
  timezone_offset: number;
  ayanamsa_mode?: string;
  language?: string;
}

export interface DateTimeData extends BirthData {}

export interface LocationResult {
  place: string;
  latitude: number;
  longitude: number;
  timezone_offset: number;
}

// ─── Panchanga models ─────────────────────────────────────────────────────────

export interface SunriseSunset {
  decimal: number;
  time: string;
  jd: number;
}

export interface TithiInfo {
  number: number;
  start: string;
  end: string;
  fraction: number;
  next_number: number;
  next_start: string;
  next_end: string;
}

export interface NakshatraInfo {
  number: number;
  pada: number;
  start: string;
  end: string;
  next_number: number;
  next_start: string;
  next_end: string;
}

export interface YogaInfo   { number: number; start: string; end: string; }
export interface KaranaInfo { number: number; start: string; end: string; }

export interface LunarMonth {
  month: number;
  is_adhika: boolean;
  is_nija: boolean;
}

export interface LunarDate {
  month: number;
  day: number;
  vedic_year: number;
  is_adhika: boolean;
  is_nija: boolean;
}

export interface ElapsedYears { kali: number; vikrama: number; saka: number; }
export interface RasiInfo     { number: number; end: string; }

export interface MuhurtaTimes {
  rahu_kalam: [string, string];
  yamaganda:  [string, string];
  gulikai:    [string, string];
  abhijit:    [string, string];
  durmuhurtam: [string, string, string, string];
  gauri_choghadiya: Array<[number, string, string]>;
}

export interface PanchangaResult {
  vaara: number;
  sunrise: SunriseSunset;
  sunset:  SunriseSunset;
  moonrise: SunriseSunset;
  moonset:  SunriseSunset;
  tithi:    TithiInfo;
  nakshatra: NakshatraInfo;
  yoga:    YogaInfo;
  karana:  KaranaInfo;
  rasi:    RasiInfo;
  lunar_month: LunarMonth;
  lunar_date:  LunarDate;
  elapsed_years: ElapsedYears;
  rahu_kalam:  [string, string];
  yamaganda:   [string, string];
  gulikai:     [string, string];
  abhijit:     [string, string];
  durmuhurtam: [string, string, string, string];
  gauri_choghadiya: Array<[number, string, string]>;
}

// ─── Horoscope models ─────────────────────────────────────────────────────────

export interface PlanetPosition {
  planet_id: number;
  planet_name: string;
  rasi: number;
  longitude: number;
}

export interface AscendantInfo {
  rasi: number;
  longitude: number;
  nakshatra: number;
  pada: number;
}

export interface RasiChartResult {
  planets: PlanetPosition[];
  retrograde: number[];
  ascendant: AscendantInfo;
}

export interface DivisionalChartResult {
  divisional_factor: number;
  chart_method: number;
  planets: PlanetPosition[];
}

export interface CharaKaraka {
  karaka: string;
  planet_id: number;
  planet_name: string;
}

export interface ArudhaEntry { label: string; rasi: number; }

export interface ArudhaSets {
  bhava_arudhas:   ArudhaEntry[];
  surya_arudhas:   ArudhaEntry[];
  chandra_arudhas: ArudhaEntry[];
}

export interface AshtakavargaResult {
  binna_ashtaka_varga: any;
  samudhaya_ashtaka_varga: any;
  prastara_ashtaka_varga: any;
}

export interface DoshaResult {
  kala_sarpa: boolean;
  manglik: {
    is_manglik: boolean;
    has_exceptions: boolean;
    exception_indices: number[];
  };
}

// ─── Dhasa models ─────────────────────────────────────────────────────────────

export interface DhasaPeriod {
  lord: string;
  start: string;
  end: string;
  sub_periods?: DhasaPeriod[];
}

export interface DhasaResult {
  dhasa_type: string;
  periods: any;
}

// ─── Match models ─────────────────────────────────────────────────────────────

export interface MatchData {
  boy:  BirthData;
  girl: BirthData;
}

// ─── Transit models ───────────────────────────────────────────────────────────

export interface TransitResult {
  natal:        PlanetPosition[];
  transit:      PlanetPosition[];
  transit_date: string;
}

// ─── Label lookups ────────────────────────────────────────────────────────────

export const PLANET_NAMES = [
  'Sun','Moon','Mars','Mercury','Jupiter','Venus',
  'Saturn','Rahu','Ketu','Uranus','Neptune','Pluto','Ascendant'
];

export const PLANET_ABBR = [
  'Su','Mo','Ma','Me','Ju','Ve','Sa','Ra','Ke','Ur','Ne','Pl','As'
];

export const RASI_NAMES = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
];

export const TITHI_NAMES = [
  'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami',
  'Shashthi','Saptami','Ashtami','Navami','Dashami',
  'Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima/Amavasya'
];

export const NAKSHATRA_NAMES = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha',
  'Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'
];

export const YOGA_NAMES = [
  'Vishkamba','Priti','Ayushman','Saubhagya','Shobhana','Atiganda',
  'Sukarma','Dhriti','Shoola','Ganda','Vriddhi','Dhruva','Vyaghata',
  'Harshana','Vajra','Siddhi','Vyatipata','Variyana','Parigha','Shiva',
  'Siddha','Sadhya','Shubha','Shukla','Brahma','Indra','Vaidhriti'
];

export const KARANA_NAMES = [
  'Bava','Balava','Kaulava','Taitila','Garija','Vanija','Vishti',
  'Shakuni','Chatushpada','Naga','Kimstughna'
];

export const VAARA_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export const AYANAMSA_MODES = [
  'LAHIRI','KP','RAMAN','FAGAN','YUKTESHWAR','USHASHASHI',
  'SURYASIDDHANTA','TRUE_CITRA','TRUE_REVATI','SS_CITRA','SS_REVATI',
  'SENTHIL','TRUE_PUSHYA','TRUE_MULA','KP-SENTHIL','SIDM_USER','SUNDAR_SS','ARYABHATA'
];

export const DIV_CHART_FACTORS = [1,2,3,4,5,6,7,8,9,10,11,12,16,20,24,27,30,40,45,60,81,108,144];

export const LANGUAGES = [
  {code:'en', name:'English'}, {code:'hi', name:'Hindi'},
  {code:'ta', name:'Tamil'},   {code:'te', name:'Telugu'},
  {code:'ka', name:'Kannada'}, {code:'ml', name:'Malayalam'}
];
