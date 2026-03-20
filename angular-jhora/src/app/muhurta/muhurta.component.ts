import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule   } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule   } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule  } from '@angular/material/table';
import { MatDividerModule} from '@angular/material/divider';
import { MatChipsModule  } from '@angular/material/chips';
import { MatTabsModule   } from '@angular/material/tabs';

import { BirthDataFormComponent } from '../shared/birth-data-form/birth-data-form.component';
import { JhoraApiService } from '../services/jhora-api.service';
import { BirthData, MuhurtaTimes } from '../models/jhora.models';

@Component({
  selector: 'app-muhurta',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatTableModule, MatDividerModule,
    MatChipsModule, MatTabsModule,
    BirthDataFormComponent
  ],
  template: `
    <div class="page-container">
      <h2 class="section-title"><mat-icon>access_time</mat-icon> Muhurta – Auspicious Timings</h2>

      <mat-card class="form-card">
        <mat-card-content>
          <app-birth-data-form
            title="Date &amp; Place"
            submitLabel="Get Muhurta"
            [loading]="loading"
            (submitted)="onSubmit($event)">
          </app-birth-data-form>
        </mat-card-content>
      </mat-card>

      <div *ngIf="loading" class="loading-overlay"><mat-spinner diameter="48"></mat-spinner></div>

      <ng-container *ngIf="result && !loading">
        <mat-tab-group dynamicHeight>

          <!-- Inauspicious periods -->
          <mat-tab label="Inauspicious Periods">
            <div class="card-grid" style="padding-top:16px">
              <mat-card class="bad-period">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon color="warn">block</mat-icon> Rahu Kalam
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="time-display">
                    {{ result.rahu_kalam[0] }} – {{ result.rahu_kalam[1] }}
                  </div>
                  <p class="hint">Avoid starting new ventures during Rahu Kalam.</p>
                </mat-card-content>
              </mat-card>

              <mat-card class="bad-period">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon color="warn">block</mat-icon> Yamaganda
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="time-display">
                    {{ result.yamaganda[0] }} – {{ result.yamaganda[1] }}
                  </div>
                  <p class="hint">Avoid travel and important tasks.</p>
                </mat-card-content>
              </mat-card>

              <mat-card class="bad-period">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon color="warn">block</mat-icon> Gulikai Kalam
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="time-display">
                    {{ result.gulikai[0] }} – {{ result.gulikai[1] }}
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="bad-period">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon color="warn">block</mat-icon> Durmuhurtam
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="time-display">Period 1: {{ result.durmuhurtam[0] }} – {{ result.durmuhurtam[1] }}</div>
                  <div class="time-display">Period 2: {{ result.durmuhurtam[2] }} – {{ result.durmuhurtam[3] }}</div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Auspicious periods -->
          <mat-tab label="Auspicious Periods">
            <div class="card-grid" style="padding-top:16px">
              <mat-card class="good-period">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon style="color:#43a047">check_circle</mat-icon> Abhijit Muhurta
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="time-display">
                    {{ result.abhijit[0] }} – {{ result.abhijit[1] }}
                  </div>
                  <p class="hint">Most auspicious period of the day – best for starting new work.</p>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Gauri Choghadiya -->
          <mat-tab label="Gauri Choghadiya">
            <div style="padding-top:16px">
              <mat-card>
                <mat-card-title>16 Choghadiya Periods</mat-card-title>
                <mat-card-content>
                  <table mat-table [dataSource]="choghadiyaRows" class="full-width">
                    <ng-container matColumnDef="num">
                      <th mat-header-cell *matHeaderCellDef>#</th>
                      <td mat-cell *matCellDef="let r">{{ r.num }}</td>
                    </ng-container>
                    <ng-container matColumnDef="type">
                      <th mat-header-cell *matHeaderCellDef>Choghadiya</th>
                      <td mat-cell *matCellDef="let r">
                        <mat-chip [color]="r.type <= 4 ? 'primary' : 'warn'" highlighted>
                          {{ r.typeName }}
                        </mat-chip>
                      </td>
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
                    <tr mat-row *matRowDef="let r; columns:['num','type','start','end']"></tr>
                  </table>
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
    .form-card      { margin-bottom: 20px; }
    .time-display   { font-size: 1.1rem; font-weight: 600; color: #333; margin: 8px 0; }
    .hint           { font-size: .8rem; color: #777; margin: 0; }
    .bad-period     { border-left: 4px solid #ef9a9a; }
    .good-period    { border-left: 4px solid #a5d6a7; }
    .full-width     { width: 100%; }
    .error-msg      { color: #f44336; margin-top: 12px; }
  `]
})
export class MuhurtaComponent {
  loading  = false;
  result: MuhurtaTimes | null = null;
  errorMsg = '';
  choghadiyaRows: any[] = [];

  private readonly CHOGHADIYA_NAMES = [
    'Udveg','Char','Labh','Amrit','Kaal','Shubh','Rog','Udveg',
    'Char','Labh','Amrit','Kaal','Shubh','Rog','Udveg','Char'
  ];

  constructor(private api: JhoraApiService) {}

  onSubmit(data: BirthData): void {
    this.loading  = true;
    this.result   = null;
    this.errorMsg = '';
    this.api.getMuhurta(data).subscribe({
      next: r  => {
        this.result = r;
        this.choghadiyaRows = (r.gauri_choghadiya || []).map((row: any, i: number) => ({
          num: i + 1, type: row[0],
          typeName: this.CHOGHADIYA_NAMES[i] ?? String(row[0]),
          start: row[1], end: row[2]
        }));
        this.loading = false;
      },
      error: e => { this.errorMsg = e.error?.detail ?? 'API error'; this.loading = false; }
    });
  }
}
