export interface BirthData {
  name: string;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:mm
  latitude: number;
  longitude: number;
  timezone: number;
  place: string;
  ayanamsa: string;
  houseSystem: string;
}

export interface Planet {
  id: string;
  name: string;
  nameDevanagari: string;
  rashi: number;       // 1–12
  rashiName: string;
  degrees: number;
  minutes: number;
  seconds: number;
  isRetrograde: boolean;
  nakshatra: string;
  nakshatraPada: number;
  house: number;
  dignity: 'exalted' | 'own' | 'friend' | 'neutral' | 'enemy' | 'debilitated';
  shadbalaScore: number;
  color: string;
}

export interface HouseData {
  houseNumber: number;
  rashiNumber: number;
  rashiName: string;
  planets: Planet[];
  isLagna: boolean;
}

export interface ChartData {
  houses: HouseData[];
  lagna: number;
  planets: Planet[];
  divisional: string; // D-1, D-9, D-10, etc.
}

export interface DashaPeriod {
  planet: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  antardashas?: AntarDasha[];
}

export interface AntarDasha {
  planet: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Panchang {
  vara: string;
  tithi: string;
  tithiNum: number;
  nakshatra: string;
  nakshatraLord: string;
  yoga: string;
  karana: string;
  masa: string;
  masaNum: number;
  sunrise: string;
  sunset: string;
  ayanamsa: string;
  ayanamsaDeg: string;
}

export interface Yoga {
  name: string;
  type: 'raja' | 'dhana' | 'arista' | 'pancha';
  description: string;
  planets: string[];
  strength: number;
}

export interface AshtakavargaRow {
  planet: string;
  bindus: number[];  // 12 values for each rashi
  total: number;
}

export interface ShadbalaRow {
  planet: string;
  sthana: number;
  dig:    number;
  kala:   number;
  chesta: number;
  naisargika: number;
  drik:   number;
  total:  number;
  required: number;
  ratio: number;
}

export type DivisionalChart =
  'D-1' | 'D-2' | 'D-3' | 'D-4' | 'D-5' | 'D-6' | 'D-7' | 'D-8' |
  'D-9' | 'D-10' | 'D-12' | 'D-16' | 'D-20' | 'D-24' | 'D-27' |
  'D-30' | 'D-40' | 'D-45' | 'D-60';
