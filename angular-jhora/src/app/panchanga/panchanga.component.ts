import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule       } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule       } from '@angular/material/tabs';
import { MatTableModule      } from '@angular/material/table';
import { MatChipsModule      } from '@angular/material/chips';
import { MatDividerModule    } from '@angular/material/divider';
import { MatIconModule       } from '@angular/material/icon';

import { BirthDataFormComponent } from '../shared/birth-data-form/birth-data-form.component';
import { JhoraApiService } from '../services/jhora-api.service';
import {
  BirthData, PanchangaResult,
  VAARA_NAMES, TITHI_NAMES, NAKSHATRA_NAMES,
  YOGA_NAMES, KARANA_NAMES, RASI_NAMES
} from '../models/jhora.models';

@Component({
  selector: 'app-panchanga',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatProgressSpinnerModule,
    MatTabsModule, MatTableModule, MatChipsModule,
    MatDividerModule, MatIconModule, BirthDataFormComponent
  ],
  template: `
    <div class="page-container">
      <h2 class="section-title"><mat-icon>calendar_today</mat-icon> Panchanga – Daily Almanac</h2>

      <mat-card class="form-card">
        <mat-card-content>
          <app-birth-data-form
            title="Date, Time &amp; Place"
            submitLabel="Get Panchanga"
            [loading]="loading"
            (submitted)="onSubmit($event)">
          </app-birth-data-form>
        </mat-card-content>
      </mat-card>

      <div *ngIf="loading" class="loading-overlay">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <ng-container *ngIf="result && !loading">

        <!-- Five Limbs Banner -->
        <mat-card class="pancha-banner">
          <mat-card-content>
            <div class="five-limbs">
              <div class="limb">
                <div class="limb-label">Vaara (Day)</div>
                <div class="limb-val">{{ vaaraName }}</div>
              </div>
              <div class="limb">
                <div class="limb-label">Tithi</div>
                <div class="limb-val">{{ tithiName }}</div>
                <div class="limb-sub">{{ result.tithi.start }} – {{ result.tithi.end }}</div>
              </div>
              <div class="limb">
                <div class="limb-label">Nakshatra</div>
                <div class="limb-val">{{ nakshatraName }} (Pada {{ result.nakshatra.pada }})</div>
                <div class="limb-sub">{{ result.nakshatra.start }} – {{ result.nakshatra.end }}</div>
              </div>
              <div class="limb">
                <div class="limb-label">Yoga</div>
                <div class="limb-val">{{ yogaName }}</div>
                <div class="limb-sub">{{ result.yoga.start }} – {{ result.yoga.end }}</div>
              </div>
              <div class="limb">
                <div class="limb-label">Karana</div>
                <div class="limb-val">{{ karanaName }}</div>
                <div class="limb-sub">{{ result.karana.start }} – {{ result.karana.end }}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-tab-group dynamicHeight>

          <!-- ─── Tab 1: Sun/Moon times ──────────────────── -->
          <mat-tab label="Sun & Moon Times">
            <div class="card-grid" style="padding-top:16px">
              <mat-card>
                <mat-card-title>Sunrise</mat-card-title>
                <mat-card-content>
                  <div class="info-row"><label>Time</label><span>{{ result.sunrise.time }}</span></div>
                </mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-title>Sunset</mat-card-title>
                <mat-card-content>
                  <div class="info-row"><label>Time</label><span>{{ result.sunset.time }}</span></div>
                </mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-title>Moonrise</mat-card-title>
                <mat-card-content>
                  <div class="info-row"><label>Time</label><span>{{ result.moonrise.time }}</span></div>
                </mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-title>Moonset</mat-card-title>
                <mat-card-content>
                  <div class="info-row"><label>Time</label><span>{{ result.moonset.time }}</span></div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- ─── Tab 2: Muhurta ─────────────────────────── -->
          <mat-tab label="Muhurta Times">
            <div class="card-grid" style="padding-top:16px">
              <mat-card>
                <mat-card-title>Rahu Kalam</mat-card-title>
                <mat-card-content>
                  <div class="info-row"><label>Period</label>
                    <span>{{ result.rahu_kalam[0] }} – {{ result.rahu_kalam[1] }}</span></div>
                </mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-title>Yamaganda</mat-card-title>
                <mat-card-content>
                  <div class="info-row"><label>Period</label>
                    <span>{{ result.yamaganda[0] }} – {{ result.yamaganda[1] }}</span></div>
                </mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-title>Gulikai Kalam</mat-card-title>
                <mat-card-content>
                  <div class="info-row"><label>Period</label>
                    <span>{{ result.gulikai[0] }} – {{ result.gulikai[1] }}</span></div>
                </mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-title>Abhijit Muhurta</mat-card-title>
                <mat-card-content>
                  <div class="info-row"><label>Period</label>
                    <span>{{ result.abhijit[0] }} – {{ result.abhijit[1] }}</span></div>
                </mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-title>Durmuhurtam</mat-card-title>
                <mat-card-content>
                  <div class="info-row"><label>Period 1</label>
                    <span>{{ result.durmuhurtam[0] }} – {{ result.durmuhurtam[1] }}</span></div>
                  <div class="info-row"><label>Period 2</label>
                    <span>{{ result.durmuhurtam[2] }} – {{ result.durmuhurtam[3] }}</span></div>
                </mat-card-content>
              </mat-card>
            </div>

            <!-- Gauri Choghadiya -->
            <mat-card style="margin-top:16px">
              <mat-card-title>Gauri Choghadiya (16 Periods)</mat-card-title>
              <mat-card-content>
                <table mat-table [dataSource]="choghadiyaRows" class="full-width">
                  <ng-container matColumnDef="num">
                    <th mat-header-cell *matHeaderCellDef>#</th>
                    <td mat-cell *matCellDef="let r">{{ r.num }}</td>
                  </ng-container>
                  <ng-container matColumnDef="type">
                    <th mat-header-cell *matHeaderCellDef>Type</th>
                    <td mat-cell *matCellDef="let r">{{ r.type }}</td>
                  </ng-container>
                  <ng-container matColumnDef="start">
                    <th mat-header-cell *matHeaderCellDef>Start</th>
                    <td mat-cell *matCellDef="let r">{{ r.start }}</td>
                  </ng-container>
                  <ng-container matColumnDef="end">
                    <th mat-header-cell *matHeaderCellDef>End</th>
                    <td mat-cell *matCellDef="let r">{{ r.end }}</td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="['num','type','start','end']"></tr>
                  <tr mat-row     *matRowDef="let r; columns: ['num','type','start','end']"></tr>
                </table>
              </mat-card-content>
            </mat-card>
          </mat-tab>

          <!-- ─── Tab 3: Calendar info ───────────────────── -->
          <mat-tab label="Calendar Info">
            <div class="card-grid" style="padding-top:16px">
              <mat-card>
                <mat-card-title>Rasi (Moon Sign)</mat-card-title>
                <mat-card-content>
                  <div class="info-row"><label>Rasi</label>
                    <span>{{ rasiName(result.rasi.number) }}</span></div>
                  <div class="info-row"><label>End Time</label>
                    <span>{{ result.rasi.end }}</span></div>
                </mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-title>Lunar Month &amp; Date</mat-card-title>
                <mat-card-content>
                  <div class="info-row"><label>Lunar Month</label>
                    <span>{{ result.lunar_month.month }}
                      <mat-chip *ngIf="result.lunar_month.is_adhika" color="warn" highlighted>Adhika</mat-chip>
                    </span></div>
                  <div class="info-row"><label>Lunar Day</label>
                    <span>{{ result.lunar_date.day }}</span></div>
                  <div class="info-row"><label>Vedic Year</label>
                    <span>{{ result.lunar_date.vedic_year }}</span></div>
                </mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-title>Elapsed Years</mat-card-title>
                <mat-card-content>
                  <div class="info-row"><label>Kali Yuga</label>
                    <span>{{ result.elapsed_years.kali }}</span></div>
                  <div class="info-row"><label>Vikrama Samvat</label>
                    <span>{{ result.elapsed_years.vikrama }}</span></div>
                  <div class="info-row"><label>Saka Era</label>
                    <span>{{ result.elapsed_years.saka }}</span></div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

        </mat-tab-group>
      </ng-container>

      <p *ngIf="errorMsg" class="error-msg">{{ errorMsg }}</p>
    </div>
  `,
  styles: [`
    .form-card { margin-bottom: 20px; }
    .pancha-banner { margin-bottom: 16px; background: linear-gradient(135deg,#3f51b5,#7986cb); color:#fff; }
    .five-limbs { display: flex; gap: 16px; flex-wrap: wrap; }
    .limb { flex: 1 1 140px; text-align: center; padding: 8px; border-radius: 6px; background:rgba(255,255,255,.15); }
    .limb-label { font-size:.75rem; opacity:.8; text-transform:uppercase; letter-spacing:.5px; }
    .limb-val   { font-size:1.1rem; font-weight:600; margin: 4px 0; }
    .limb-sub   { font-size:.72rem; opacity:.75; }
    .full-width { width: 100%; }
    .error-msg  { color:#f44336; margin-top:12px; }
  `]
})
export class PanchangaComponent {
  loading  = false;
  result: PanchangaResult | null = null;
  errorMsg = '';
  choghadiyaRows: any[] = [];

  constructor(private api: JhoraApiService) {}

  get vaaraName()    { return this.result ? VAARA_NAMES[this.result.vaara]           ?? '' : ''; }
  get tithiName()    { return this.result ? (TITHI_NAMES[this.result.tithi.number - 1]    ?? '') : ''; }
  get nakshatraName(){ return this.result ? (NAKSHATRA_NAMES[this.result.nakshatra.number - 1] ?? '') : ''; }
  get yogaName()     { return this.result ? (YOGA_NAMES[this.result.yoga.number - 1]     ?? '') : ''; }
  get karanaName()   { return this.result ? (KARANA_NAMES[this.result.karana.number % KARANA_NAMES.length] ?? '') : ''; }

  rasiName(n: number): string { return RASI_NAMES[n] ?? ''; }

  onSubmit(data: BirthData): void {
    this.loading  = true;
    this.result   = null;
    this.errorMsg = '';
    this.api.getPanchanga(data).subscribe({
      next: r => {
        this.result = r;
        this.choghadiyaRows = (r.gauri_choghadiya || []).map((row: any, i: number) => ({
          num: i + 1, type: row[0], start: row[1], end: row[2]
        }));
        this.loading = false;
      },
      error: e => {
        this.errorMsg = e.error?.detail ?? 'API error';
        this.loading  = false;
      }
    });
  }
}
