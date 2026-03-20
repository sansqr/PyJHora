import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule   } from '@angular/material/card';
import { MatTabsModule   } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule   } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule  } from '@angular/material/chips';
import { MatTableModule  } from '@angular/material/table';
import { MatDividerModule} from '@angular/material/divider';

import { BirthDataFormComponent } from '../shared/birth-data-form/birth-data-form.component';
import { JhoraApiService } from '../services/jhora-api.service';
import { BirthData, DoshaResult, AshtakavargaResult, PLANET_NAMES, RASI_NAMES } from '../models/jhora.models';

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatTabsModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatExpansionModule, MatChipsModule,
    MatTableModule, MatDividerModule,
    BirthDataFormComponent
  ],
  template: `
    <div class="page-container">
      <h2 class="section-title"><mat-icon>analytics</mat-icon> Chart Analysis</h2>

      <mat-card class="form-card">
        <mat-card-content>
          <app-birth-data-form
            title="Birth Details"
            submitLabel="Analyse"
            [loading]="loading"
            (submitted)="onSubmit($event)">
          </app-birth-data-form>
        </mat-card-content>
      </mat-card>

      <div *ngIf="loading" class="loading-overlay"><mat-spinner diameter="48"></mat-spinner></div>

      <ng-container *ngIf="currentBirth && !loading">
        <mat-tab-group dynamicHeight>

          <!-- ─── Yoga Analysis ──────────────────────────── -->
          <mat-tab label="Yogas">
            <div style="padding:16px">
              <button mat-raised-button color="primary" (click)="loadYoga()" [disabled]="yogaLoading">
                <mat-icon>self_improvement</mat-icon> Load Yogas
              </button>
              <mat-spinner *ngIf="yogaLoading" diameter="24" style="display:inline-block;margin-left:12px"></mat-spinner>

              <ng-container *ngIf="yogaData">
                <mat-accordion style="margin-top:16px">
                  <ng-container *ngFor="let key of yogaKeys">
                    <mat-expansion-panel *ngIf="yogaData[key]?.length">
                      <mat-expansion-panel-header>
                        <mat-panel-title>{{ key }}</mat-panel-title>
                        <mat-panel-description>{{ yogaData[key].length }} yoga(s)</mat-panel-description>
                      </mat-expansion-panel-header>
                      <ul class="yoga-list">
                        <li *ngFor="let y of yogaData[key]">{{ y }}</li>
                      </ul>
                    </mat-expansion-panel>
                  </ng-container>
                </mat-accordion>
                <p *ngIf="!yogaKeys.length">No yoga data returned.</p>
              </ng-container>
            </div>
          </mat-tab>

          <!-- ─── Raja Yoga ──────────────────────────────── -->
          <mat-tab label="Raja Yoga">
            <div style="padding:16px">
              <button mat-raised-button color="primary" (click)="loadRajaYoga()" [disabled]="rajaLoading">
                <mat-icon>crown</mat-icon> Load Raja Yogas
              </button>
              <mat-spinner *ngIf="rajaLoading" diameter="24" style="display:inline-block;margin-left:12px"></mat-spinner>

              <ng-container *ngIf="rajaYogaData">
                <mat-card style="margin-top:16px">
                  <mat-card-title>Raja Yoga Details</mat-card-title>
                  <mat-card-content>
                    <pre class="raw-data">{{ rajaYogaData | json }}</pre>
                  </mat-card-content>
                </mat-card>
              </ng-container>
            </div>
          </mat-tab>

          <!-- ─── Dosha Analysis ────────────────────────── -->
          <mat-tab label="Dosha">
            <div style="padding:16px">
              <button mat-raised-button color="primary" (click)="loadDosha()" [disabled]="doshaLoading">
                <mat-icon>warning</mat-icon> Load Doshas
              </button>
              <mat-spinner *ngIf="doshaLoading" diameter="24" style="display:inline-block;margin-left:12px"></mat-spinner>

              <div *ngIf="doshaData" class="card-grid" style="margin-top:16px">
                <mat-card [class.dosha-present]="doshaData.kala_sarpa">
                  <mat-card-title>Kala Sarpa Dosha</mat-card-title>
                  <mat-card-content>
                    <div class="dosha-badge" [class.present]="doshaData.kala_sarpa">
                      {{ doshaData.kala_sarpa ? 'PRESENT' : 'NOT PRESENT' }}
                    </div>
                    <p style="font-size:.85rem;color:#555;margin-top:8px">
                      All planets are hemmed between Rahu and Ketu when Kala Sarpa Dosha is present.
                    </p>
                  </mat-card-content>
                </mat-card>

                <mat-card [class.dosha-present]="doshaData.manglik.is_manglik && !doshaData.manglik.has_exceptions">
                  <mat-card-title>Mangal (Kuja) Dosha</mat-card-title>
                  <mat-card-content>
                    <div class="dosha-badge" [class.present]="doshaData.manglik.is_manglik && !doshaData.manglik.has_exceptions">
                      {{ doshaData.manglik.is_manglik
                         ? (doshaData.manglik.has_exceptions ? 'PRESENT (with exceptions)' : 'PRESENT')
                         : 'NOT PRESENT' }}
                    </div>
                    <div *ngIf="doshaData.manglik.is_manglik && doshaData.manglik.has_exceptions"
                         style="margin-top:8px">
                      <strong>Cancellation factors present</strong>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- ─── Ashtakavarga ───────────────────────────── -->
          <mat-tab label="Ashtakavarga">
            <div style="padding:16px">
              <button mat-raised-button color="primary" (click)="loadAshtakavarga()" [disabled]="avLoading">
                <mat-icon>grid_on</mat-icon> Load Ashtakavarga
              </button>
              <mat-spinner *ngIf="avLoading" diameter="24" style="display:inline-block;margin-left:12px"></mat-spinner>

              <ng-container *ngIf="avData">
                <!-- Samudhaya (total) bar chart -->
                <mat-card style="margin-top:16px">
                  <mat-card-title>Samudhaya Ashtakavarga (Total Points per Rasi)</mat-card-title>
                  <mat-card-content>
                    <div class="av-bars">
                      <div *ngFor="let val of getSAV(); let i = index" class="av-bar-wrap">
                        <div class="av-bar" [style.height.px]="(val / maxSAV) * 80"
                             [class.strong]="val >= 30">
                          {{ val }}
                        </div>
                        <div class="av-label">{{ rasi(i) }}</div>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <!-- Binna (planet-wise) table -->
                <mat-card style="margin-top:16px">
                  <mat-card-title>Binna Ashtakavarga (Planet-wise)</mat-card-title>
                  <mat-card-content>
                    <pre class="raw-data">{{ avData.binna_ashtaka_varga | json }}</pre>
                  </mat-card-content>
                </mat-card>
              </ng-container>
            </div>
          </mat-tab>

          <!-- ─── Planetary Strength ─────────────────────── -->
          <mat-tab label="Shadbala">
            <div style="padding:16px">
              <button mat-raised-button color="primary" (click)="loadStrength()" [disabled]="strengthLoading">
                <mat-icon>fitness_center</mat-icon> Compute Shadbala
              </button>
              <mat-spinner *ngIf="strengthLoading" diameter="24" style="display:inline-block;margin-left:12px"></mat-spinner>

              <mat-card *ngIf="strengthData" style="margin-top:16px">
                <mat-card-title>Shadbala (Six-fold Strength)</mat-card-title>
                <mat-card-content>
                  <pre class="raw-data">{{ strengthData | json }}</pre>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- ─── Transits ───────────────────────────────── -->
          <mat-tab label="Transits">
            <div style="padding:16px">
              <button mat-raised-button color="primary" (click)="loadTransit()" [disabled]="transitLoading">
                <mat-icon>swap_horiz</mat-icon> Load Current Transits
              </button>
              <mat-spinner *ngIf="transitLoading" diameter="24" style="display:inline-block;margin-left:12px"></mat-spinner>

              <ng-container *ngIf="transitData">
                <p style="margin-top:12px;font-size:.85rem;color:#555">
                  Transit Date: {{ transitData.transit_date | date:'medium' }}
                </p>
                <div class="card-grid" style="margin-top:12px">
                  <mat-card>
                    <mat-card-title>Natal Positions</mat-card-title>
                    <mat-card-content>
                      <div *ngFor="let p of transitData.natal" class="info-row">
                        <label>{{ p.planet_name }}</label>
                        <span>{{ rasiName(p.rasi) }} {{ p.longitude | number:'1.2-2' }}°</span>
                      </div>
                    </mat-card-content>
                  </mat-card>
                  <mat-card>
                    <mat-card-title>Current Transit Positions</mat-card-title>
                    <mat-card-content>
                      <div *ngFor="let p of transitData.transit" class="info-row">
                        <label>{{ p.planet_name }}</label>
                        <span>{{ rasiName(p.rasi) }} {{ p.longitude | number:'1.2-2' }}°</span>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </ng-container>
            </div>
          </mat-tab>

        </mat-tab-group>
      </ng-container>

      <p *ngIf="errorMsg" class="error-msg">{{ errorMsg }}</p>
    </div>
  `,
  styles: [`
    .form-card    { margin-bottom: 20px; }
    .yoga-list    { paddig-left: 16px; }
    .yoga-list li { margin-bottom: 4px; font-size: .9rem; }
    .raw-data     { font-size: .78rem; background: #f5f5f5; padding: 12px;
                    border-radius: 4px; overflow: auto; max-height: 320px; white-space: pre-wrap; }
    .dosha-badge  {
      display: inline-block; padding: 6px 14px; border-radius: 16px;
      font-weight: 600; background: #e8f5e9; color: #2e7d32;
      &.present { background: #ffebee; color: #c62828; }
    }
    .dosha-present { border-left: 4px solid #f44336; }
    .av-bars   { display: flex; align-items: flex-end; gap: 8px; height: 100px; }
    .av-bar-wrap { display: flex; flex-direction: column; align-items: center; flex: 1; }
    .av-bar    { width: 100%; max-width: 36px; background: #9fa8da; border-radius: 3px 3px 0 0;
                 display: flex; align-items: flex-end; justify-content: center;
                 font-size: .7rem; color: #fff; font-weight: 600; padding-bottom: 2px;
                 min-height: 20px; transition: background .3s;
                 &.strong { background: #3f51b5; } }
    .av-label  { font-size: .65rem; color: #555; margin-top: 2px; text-align: center; }
    .error-msg { color: #f44336; margin-top: 12px; }
  `]
})
export class AnalysisComponent {
  loading       = false;
  currentBirth: BirthData | null = null;
  errorMsg      = '';

  yogaLoading   = false; yogaData: any = null; yogaKeys: string[] = [];
  rajaLoading   = false; rajaYogaData: any = null;
  doshaLoading  = false; doshaData: DoshaResult | null = null;
  avLoading     = false; avData: AshtakavargaResult | null = null; maxSAV = 1;
  strengthLoading = false; strengthData: any = null;
  transitLoading  = false; transitData: any  = null;

  constructor(private api: JhoraApiService) {}

  rasiName(n: number): string { return RASI_NAMES[n] ?? ''; }
  rasi(i: number): string { return RASI_NAMES[i]?.slice(0,3) ?? ''; }

  onSubmit(data: BirthData): void {
    this.currentBirth = data;
    // Reset all sub-results
    this.yogaData = null; this.rajaYogaData = null;
    this.doshaData = null; this.avData = null;
    this.strengthData = null; this.transitData = null;
  }

  loadYoga(): void {
    if (!this.currentBirth) return;
    this.yogaLoading = true;
    this.api.getYogaDetails(this.currentBirth).subscribe({
      next: r  => {
        this.yogaData = r;
        this.yogaKeys = Object.keys(r).filter(k => Array.isArray(r[k]) && r[k].length);
        this.yogaLoading = false;
      },
      error: e => { this.errorMsg = e.error?.detail ?? 'API error'; this.yogaLoading = false; }
    });
  }

  loadRajaYoga(): void {
    if (!this.currentBirth) return;
    this.rajaLoading = true;
    this.api.getRajaYoga(this.currentBirth).subscribe({
      next: r  => { this.rajaYogaData = r; this.rajaLoading = false; },
      error: e => { this.errorMsg = e.error?.detail ?? 'API error'; this.rajaLoading = false; }
    });
  }

  loadDosha(): void {
    if (!this.currentBirth) return;
    this.doshaLoading = true;
    this.api.getDosha(this.currentBirth).subscribe({
      next: r  => { this.doshaData = r; this.doshaLoading = false; },
      error: e => { this.errorMsg = e.error?.detail ?? 'API error'; this.doshaLoading = false; }
    });
  }

  loadAshtakavarga(): void {
    if (!this.currentBirth) return;
    this.avLoading = true;
    this.api.getAshtakavarga(this.currentBirth).subscribe({
      next: r  => {
        this.avData = r;
        const sav = this.getSAV(r);
        this.maxSAV = Math.max(...sav, 1);
        this.avLoading = false;
      },
      error: e => { this.errorMsg = e.error?.detail ?? 'API error'; this.avLoading = false; }
    });
  }

  loadStrength(): void {
    if (!this.currentBirth) return;
    this.strengthLoading = true;
    this.api.getPlanetaryStrength(this.currentBirth).subscribe({
      next: r  => { this.strengthData = r; this.strengthLoading = false; },
      error: e => { this.errorMsg = e.error?.detail ?? 'API error'; this.strengthLoading = false; }
    });
  }

  loadTransit(): void {
    if (!this.currentBirth) return;
    this.transitLoading = true;
    this.api.getCurrentTransits(this.currentBirth).subscribe({
      next: r  => { this.transitData = r; this.transitLoading = false; },
      error: e => { this.errorMsg = e.error?.detail ?? 'API error'; this.transitLoading = false; }
    });
  }

  getSAV(data?: AshtakavargaResult): number[] {
    const d = data ?? this.avData;
    if (!d?.samudhaya_ashtaka_varga) return new Array(12).fill(0);
    const sav = d.samudhaya_ashtaka_varga;
    if (Array.isArray(sav)) return sav.slice(0, 12);
    return new Array(12).fill(0);
  }

  rasiNameFn = (n: number) => RASI_NAMES[n] ?? '';
}
