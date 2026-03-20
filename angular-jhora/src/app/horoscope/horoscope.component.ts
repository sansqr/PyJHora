import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule    } from '@angular/material/card';
import { MatTabsModule    } from '@angular/material/tabs';
import { MatSelectModule  } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule  } from '@angular/material/button';
import { MatIconModule    } from '@angular/material/icon';
import { MatTableModule   } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule   } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';

import { BirthDataFormComponent } from '../shared/birth-data-form/birth-data-form.component';
import { VedicChartComponent    } from '../shared/vedic-chart/vedic-chart.component';
import { JhoraApiService } from '../services/jhora-api.service';
import {
  BirthData, RasiChartResult, ArudhaSets, CharaKaraka,
  PLANET_NAMES, RASI_NAMES, DIV_CHART_FACTORS
} from '../models/jhora.models';

@Component({
  selector: 'app-horoscope',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatTabsModule, MatSelectModule, MatFormFieldModule,
    MatButtonModule, MatIconModule, MatTableModule, MatProgressSpinnerModule,
    MatChipsModule, MatDividerModule, MatTooltipModule, MatExpansionModule,
    BirthDataFormComponent, VedicChartComponent
  ],
  template: `
    <div class="page-container">
      <h2 class="section-title"><mat-icon>auto_stories</mat-icon> Horoscope Charts</h2>

      <mat-card class="form-card">
        <mat-card-content>
          <app-birth-data-form
            title="Birth Details"
            submitLabel="Cast Chart"
            [loading]="loading"
            (submitted)="onSubmit($event)">
          </app-birth-data-form>
        </mat-card-content>
      </mat-card>

      <div *ngIf="loading" class="loading-overlay"><mat-spinner diameter="48"></mat-spinner></div>

      <ng-container *ngIf="rasiResult && !loading">
        <mat-tab-group dynamicHeight>

          <!-- ─── D1 Rasi Chart ─────────────────────────── -->
          <mat-tab label="D1 – Rasi Chart">
            <div class="chart-section">
              <app-vedic-chart
                [planets]="rasiResult.planets"
                [ascRasi]="rasiResult.ascendant.rasi"
                [retrograde]="rasiResult.retrograde"
                title="D1 – Rasi">
              </app-vedic-chart>

              <mat-card class="planet-table-card">
                <mat-card-title>Planet Positions</mat-card-title>
                <mat-card-content>
                  <table mat-table [dataSource]="rasiResult.planets" class="full-width">
                    <ng-container matColumnDef="planet">
                      <th mat-header-cell *matHeaderCellDef>Planet</th>
                      <td mat-cell *matCellDef="let p">
                        {{ p.planet_name }}
                        <mat-chip *ngIf="rasiResult.retrograde.includes(p.planet_id)"
                                  color="warn" highlighted style="font-size:.7rem">R</mat-chip>
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="rasi">
                      <th mat-header-cell *matHeaderCellDef>Rasi</th>
                      <td mat-cell *matCellDef="let p">{{ rasiName(p.rasi) }}</td>
                    </ng-container>
                    <ng-container matColumnDef="longitude">
                      <th mat-header-cell *matHeaderCellDef>Longitude</th>
                      <td mat-cell *matCellDef="let p">{{ p.longitude | number:'1.2-4' }}°</td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="['planet','rasi','longitude']"></tr>
                    <tr mat-row *matRowDef="let r; columns:['planet','rasi','longitude']"></tr>
                  </table>
                  <mat-divider style="margin:8px 0"></mat-divider>
                  <div class="info-row">
                    <label>Ascendant (Lagna)</label>
                    <span>{{ rasiName(rasiResult.ascendant.rasi) }} –
                      {{ rasiResult.ascendant.longitude | number:'1.2-4' }}°
                      (Nak {{ rasiResult.ascendant.nakshatra }}, Pada {{ rasiResult.ascendant.pada }})</span>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- ─── Divisional Charts ─────────────────────── -->
          <mat-tab label="Divisional Charts">
            <div style="padding:16px">
              <form [formGroup]="divForm" class="div-opts">
                <mat-form-field appearance="outline">
                  <mat-label>Divisional Factor</mat-label>
                  <mat-select formControlName="factor">
                    <mat-option *ngFor="let f of divFactors" [value]="f">D{{ f }}</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Chart Method</mat-label>
                  <mat-select formControlName="method">
                    <mat-option [value]="1">Method 1 (Parashari)</mat-option>
                    <mat-option [value]="2">Method 2</mat-option>
                    <mat-option [value]="3">Method 3</mat-option>
                  </mat-select>
                </mat-form-field>
                <button mat-raised-button color="accent" type="button"
                        (click)="loadDivChart()" [disabled]="divLoading">
                  <mat-icon>show_chart</mat-icon> Load D{{ divForm.value.factor }}
                </button>
                <mat-spinner *ngIf="divLoading" diameter="24"></mat-spinner>
              </form>

              <div *ngIf="divResult" class="chart-section" style="margin-top:16px">
                <app-vedic-chart
                  [planets]="divResult.planets"
                  [ascRasi]="divResult.planets[divResult.planets.length-1]?.rasi ?? 0"
                  [title]="'D' + divResult.divisional_factor">
                </app-vedic-chart>

                <mat-card class="planet-table-card">
                  <mat-card-title>D{{ divResult.divisional_factor }} Positions</mat-card-title>
                  <mat-card-content>
                    <table mat-table [dataSource]="divResult.planets" class="full-width">
                      <ng-container matColumnDef="planet">
                        <th mat-header-cell *matHeaderCellDef>Planet</th>
                        <td mat-cell *matCellDef="let p">{{ p.planet_name }}</td>
                      </ng-container>
                      <ng-container matColumnDef="rasi">
                        <th mat-header-cell *matHeaderCellDef>Rasi</th>
                        <td mat-cell *matCellDef="let p">{{ rasiName(p.rasi) }}</td>
                      </ng-container>
                      <ng-container matColumnDef="longitude">
                        <th mat-header-cell *matHeaderCellDef>Longitude</th>
                        <td mat-cell *matCellDef="let p">{{ p.longitude | number:'1.2-4' }}°</td>
                      </ng-container>
                      <tr mat-header-row *matHeaderRowDef="['planet','rasi','longitude']"></tr>
                      <tr mat-row *matRowDef="let r; columns:['planet','rasi','longitude']"></tr>
                    </table>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- ─── Chara Karakas ─────────────────────────── -->
          <mat-tab label="Chara Karakas">
            <div style="padding:16px">
              <button mat-raised-button color="primary" (click)="loadCharaKarakas()" [disabled]="ckLoading">
                <mat-icon>star</mat-icon> Load Chara Karakas
              </button>
              <mat-spinner *ngIf="ckLoading" diameter="24" style="margin-left:12px;display:inline-block"></mat-spinner>

              <div *ngIf="karakas.length" style="margin-top:16px">
                <mat-card>
                  <mat-card-title>Chara Karakas</mat-card-title>
                  <mat-card-content>
                    <div class="karaka-grid">
                      <div *ngFor="let k of karakas" class="karaka-item">
                        <div class="karaka-name">{{ k.karaka }}</div>
                        <div class="karaka-planet">{{ k.planet_name }}</div>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- ─── Arudhas ────────────────────────────────── -->
          <mat-tab label="Arudhas">
            <div style="padding:16px">
              <button mat-raised-button color="primary" (click)="loadArudhas()" [disabled]="arudhaLoading">
                <mat-icon>hub</mat-icon> Load Arudhas
              </button>
              <mat-spinner *ngIf="arudhaLoading" diameter="24" style="margin-left:12px;display:inline-block"></mat-spinner>

              <div *ngIf="arudhas" style="margin-top:16px">
                <div class="card-grid">
                  <mat-card *ngFor="let section of arudhaSections">
                    <mat-card-title>{{ section.title }}</mat-card-title>
                    <mat-card-content>
                      <div *ngFor="let a of section.data" class="info-row">
                        <label>{{ a.label }}</label>
                        <span>{{ rasiName(a.rasi) }} ({{ a.rasi + 1 }})</span>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- ─── Special Lagnas ────────────────────────── -->
          <mat-tab label="Special Lagnas">
            <div style="padding:16px">
              <button mat-raised-button color="primary" (click)="loadSpecialLagnas()" [disabled]="lagnaLoading">
                <mat-icon>place</mat-icon> Load Special Lagnas
              </button>
              <mat-spinner *ngIf="lagnaLoading" diameter="24" style="margin-left:12px;display:inline-block"></mat-spinner>

              <div *ngIf="specialLagnas" style="margin-top:16px">
                <mat-card>
                  <mat-card-title>Special Lagnas & Upagrahas</mat-card-title>
                  <mat-card-content>
                    <div *ngFor="let key of specialLagnaKeys" class="info-row">
                      <label>{{ key | titlecase }}</label>
                      <span>{{ formatLagna(specialLagnas[key]) }}</span>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>

        </mat-tab-group>
      </ng-container>

      <p *ngIf="errorMsg" class="error-msg">{{ errorMsg }}</p>
    </div>
  `,
  styles: [`
    .chart-section    { display: flex; flex-wrap: wrap; gap: 24px; padding-top: 16px; align-items: flex-start; }
    .planet-table-card{ flex: 1 1 320px; }
    .full-width       { width: 100%; }
    .div-opts         { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    .karaka-grid      { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px,1fr)); gap: 12px; }
    .karaka-item      { text-align: center; padding: 12px; background: #e8eaf6; border-radius: 8px; }
    .karaka-name      { font-size: .75rem; color:#555; text-transform: uppercase; }
    .karaka-planet    { font-size: 1.15rem; font-weight: 600; color: #3f51b5; }
    .error-msg        { color: #f44336; margin-top: 12px; }
    .form-card        { margin-bottom: 20px; }
  `]
})
export class HoroscopeComponent {
  loading     = false;
  rasiResult: RasiChartResult | null = null;
  currentBirth: BirthData | null = null;
  errorMsg    = '';

  divFactors  = DIV_CHART_FACTORS;
  divForm: FormGroup;
  divLoading  = false;
  divResult: any = null;

  ckLoading   = false;
  karakas: CharaKaraka[] = [];

  arudhaLoading = false;
  arudhas: ArudhaSets | null = null;
  arudhaSections: any[] = [];

  lagnaLoading    = false;
  specialLagnas: any  = null;
  specialLagnaKeys: string[] = [];

  constructor(private api: JhoraApiService, private fb: FormBuilder) {
    this.divForm = this.fb.group({ factor: [9], method: [1] });
  }

  rasiName(n: number): string { return RASI_NAMES[n] ?? ''; }

  onSubmit(data: BirthData): void {
    this.currentBirth = data;
    this.loading  = true;
    this.rasiResult = null;
    this.errorMsg   = '';
    this.api.getRasiChart(data).subscribe({
      next: r  => { this.rasiResult = r; this.loading = false; },
      error: e => { this.errorMsg = e.error?.detail ?? 'API error'; this.loading = false; }
    });
  }

  loadDivChart(): void {
    if (!this.currentBirth) return;
    this.divLoading = true;
    const payload = { ...this.currentBirth,
      divisional_chart_factor: this.divForm.value.factor,
      chart_method: this.divForm.value.method };
    this.api.getDivisionalChart(payload).subscribe({
      next: r  => { this.divResult = r; this.divLoading = false; },
      error: e => { this.errorMsg = e.error?.detail ?? 'API error'; this.divLoading = false; }
    });
  }

  loadCharaKarakas(): void {
    if (!this.currentBirth) return;
    this.ckLoading = true;
    this.api.getCharaKarakas(this.currentBirth).subscribe({
      next: r  => { this.karakas = r.chara_karakas; this.ckLoading = false; },
      error: e => { this.errorMsg = e.error?.detail ?? 'API error'; this.ckLoading = false; }
    });
  }

  loadArudhas(): void {
    if (!this.currentBirth) return;
    this.arudhaLoading = true;
    this.api.getArudhas(this.currentBirth).subscribe({
      next: r => {
        this.arudhas = r;
        this.arudhaSections = [
          { title: 'Bhava Arudhas (A1–A12)', data: r.bhava_arudhas },
          { title: 'Surya Arudhas (S1–S12)', data: r.surya_arudhas },
          { title: 'Chandra Arudhas (M1–M12)', data: r.chandra_arudhas },
        ];
        this.arudhaLoading = false;
      },
      error: e => { this.errorMsg = e.error?.detail ?? 'API error'; this.arudhaLoading = false; }
    });
  }

  loadSpecialLagnas(): void {
    if (!this.currentBirth) return;
    this.lagnaLoading = true;
    this.api.getSpecialLagnas(this.currentBirth).subscribe({
      next: r => {
        this.specialLagnas = r;
        this.specialLagnaKeys = Object.keys(r);
        this.lagnaLoading = false;
      },
      error: e => { this.errorMsg = e.error?.detail ?? 'API error'; this.lagnaLoading = false; }
    });
  }

  formatLagna(val: any): string {
    if (!val) return '-';
    if (Array.isArray(val) && val.length >= 2) {
      return `${RASI_NAMES[val[0]] ?? val[0]}  ${(+val[1]).toFixed(4)}°`;
    }
    return JSON.stringify(val);
  }
}
