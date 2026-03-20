import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  BirthData, DateTimeData, LocationResult, PanchangaResult, TithiInfo,
  NakshatraInfo, YogaInfo, KaranaInfo, MuhurtaTimes, RasiChartResult,
  DivisionalChartResult, ArudhaSets, AshtakavargaResult, DoshaResult,
  CharaKaraka, TransitResult, DhasaResult, MatchData
} from '../models/jhora.models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class JhoraApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Meta ────────────────────────────────────────────────────────────────────

  getAyanamsaModes(): Observable<{ modes: string[] }> {
    return this.http.get<{ modes: string[] }>(`${this.base}/ayanamsa-modes`);
  }

  getDivisionalChartFactors(): Observable<{ factors: number[] }> {
    return this.http.get<{ factors: number[] }>(`${this.base}/divisional-chart-factors`);
  }

  getDhasaTypes(): Observable<any> {
    return this.http.get<any>(`${this.base}/dhasa-types`);
  }

  searchLocation(placeName: string): Observable<LocationResult> {
    return this.http.post<LocationResult>(`${this.base}/search-location`, { place_name: placeName });
  }

  getLanguages(): Observable<any> {
    return this.http.get<any>(`${this.base}/languages`);
  }

  // ── Panchanga ────────────────────────────────────────────────────────────────

  getPanchanga(data: DateTimeData): Observable<PanchangaResult> {
    return this.http.post<PanchangaResult>(`${this.base}/panchanga`, data);
  }

  getTithi(data: DateTimeData): Observable<TithiInfo> {
    return this.http.post<TithiInfo>(`${this.base}/panchanga/tithi`, data);
  }

  getNakshatra(data: DateTimeData): Observable<NakshatraInfo> {
    return this.http.post<NakshatraInfo>(`${this.base}/panchanga/nakshatra`, data);
  }

  getYoga(data: DateTimeData): Observable<YogaInfo> {
    return this.http.post<YogaInfo>(`${this.base}/panchanga/yoga`, data);
  }

  getKarana(data: DateTimeData): Observable<KaranaInfo> {
    return this.http.post<KaranaInfo>(`${this.base}/panchanga/karana`, data);
  }

  getSunriseSunset(data: DateTimeData): Observable<any> {
    return this.http.post<any>(`${this.base}/panchanga/sunrise-sunset`, data);
  }

  getMuhurta(data: DateTimeData): Observable<MuhurtaTimes> {
    return this.http.post<MuhurtaTimes>(`${this.base}/panchanga/muhurta`, data);
  }

  getPlanetPositions(data: DateTimeData): Observable<any> {
    return this.http.post<any>(`${this.base}/panchanga/planet-positions`, data);
  }

  getSpecialLagnas(data: BirthData): Observable<any> {
    return this.http.post<any>(`${this.base}/panchanga/special-lagnas`, data);
  }

  // ── Horoscope ───────────────────────────────────────────────────────────────

  getRasiChart(data: BirthData): Observable<RasiChartResult> {
    return this.http.post<RasiChartResult>(`${this.base}/horoscope/rasi-chart`, data);
  }

  getDivisionalChart(data: BirthData & { divisional_chart_factor: number; chart_method: number }): Observable<DivisionalChartResult> {
    return this.http.post<DivisionalChartResult>(`${this.base}/horoscope/divisional-chart`, data);
  }

  getBhavaChart(data: BirthData): Observable<any> {
    return this.http.post<any>(`${this.base}/horoscope/bhava-chart`, data);
  }

  getFullHoroscope(data: BirthData & { chart_index?: number; chart_method?: number; divisional_chart_factor?: number; bhava_madhya_method?: number }): Observable<any> {
    return this.http.post<any>(`${this.base}/horoscope/full-info`, data);
  }

  getCalendarInfo(data: BirthData): Observable<any> {
    return this.http.post<any>(`${this.base}/horoscope/calendar-info`, data);
  }

  getCharaKarakas(data: BirthData): Observable<{ chara_karakas: CharaKaraka[] }> {
    return this.http.post<{ chara_karakas: CharaKaraka[] }>(`${this.base}/horoscope/chara-karakas`, data);
  }

  getArudhas(data: BirthData): Observable<ArudhaSets> {
    return this.http.post<ArudhaSets>(`${this.base}/horoscope/arudhas`, data);
  }

  getAshtakavarga(data: BirthData): Observable<AshtakavargaResult> {
    return this.http.post<AshtakavargaResult>(`${this.base}/horoscope/ashtakavarga`, data);
  }

  getYogaDetails(data: BirthData): Observable<any> {
    return this.http.post<any>(`${this.base}/horoscope/yoga`, data);
  }

  getRajaYoga(data: BirthData): Observable<any> {
    return this.http.post<any>(`${this.base}/horoscope/raja-yoga`, data);
  }

  getDosha(data: BirthData): Observable<DoshaResult> {
    return this.http.post<DoshaResult>(`${this.base}/horoscope/dosha`, data);
  }

  getPlanetaryStrength(data: BirthData): Observable<any> {
    return this.http.post<any>(`${this.base}/horoscope/strength`, data);
  }

  // ── Dhasa ────────────────────────────────────────────────────────────────────

  getDhasa(data: BirthData & { dhasa_type: string; chart_index?: number }): Observable<DhasaResult> {
    return this.http.post<DhasaResult>(`${this.base}/dhasa`, data);
  }

  // ── Match ────────────────────────────────────────────────────────────────────

  getMatchCompatibility(data: MatchData): Observable<any> {
    return this.http.post<any>(`${this.base}/match/compatibility`, data);
  }

  // ── Transit ──────────────────────────────────────────────────────────────────

  getCurrentTransits(data: BirthData): Observable<TransitResult> {
    return this.http.post<TransitResult>(`${this.base}/transit/current-planets`, data);
  }

  // ── Utils ────────────────────────────────────────────────────────────────────

  getAyanamsaValue(data: DateTimeData): Observable<{ ayanamsa_mode: string; value_degrees: number }> {
    return this.http.post<any>(`${this.base}/utils/ayanamsa-value`, data);
  }

  getJulianDay(data: DateTimeData): Observable<{ julian_day: number }> {
    return this.http.post<any>(`${this.base}/utils/julian-day`, data);
  }
}
