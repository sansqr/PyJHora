import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule    } from '@angular/material/card';
import { MatSelectModule  } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule  } from '@angular/material/button';
import { MatIconModule    } from '@angular/material/icon';
import { MatTableModule   } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule   } from '@angular/material/chips';

import { BirthDataFormComponent } from '../shared/birth-data-form/birth-data-form.component';
import { JhoraApiService } from '../services/jhora-api.service';
import { BirthData } from '../models/jhora.models';

const GRAHA_DHASAS = [
  'vimsottari','ashtottari','yogini','tithi_yogini','tithi_ashtottari',
  'yoga_vimsottari','naisargika','karaka','tara','shodasottari',
  'dwadasottari','panchottari','shastihayani','chathuraaseethi_sama',
  'saptharishi_nakshathra','buddhi_gathi','kaala','aayu'
];
const RAASI_DHASAS = [
  'chara','sthira','shoola','brahma','narayana','kalachakra',
  'navamsa','nirayana','mandooka','trikona','drig','chakra',
  'moola','sudasa','varnada','lagnamsaka','kendradhi_rasi','yogardha','tara_lagna'
];
const ANNUAL_DHASAS = ['mudda','patyayini'];

@Component({
  selector: 'app-dhasa-bhukti',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatSelectModule, MatFormFieldModule,
    MatButtonModule, MatIconModule, MatTableModule,
    MatProgressSpinnerModule, MatExpansionModule, MatTooltipModule, MatChipsModule,
    BirthDataFormComponent
  ],
  template: `
    <div class="page-container">
      <h2 class="section-title"><mat-icon>timeline</mat-icon> Dhasa – Bhukti Periods</h2>

      <mat-card class="form-card">
        <mat-card-content>
          <app-birth-data-form
            title="Birth Details"
            submitLabel="Load Dhasa"
            [loading]="loading"
            (submitted)="onBirthSubmit($event)">
          </app-birth-data-form>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="currentBirth" style="margin-bottom:16px">
        <mat-card-content>
          <form [formGroup]="dhasaForm" class="dhasa-opts">
            <mat-form-field appearance="outline">
              <mat-label>Dhasa Category</mat-label>
              <mat-select formControlName="category" (selectionChange)="onCategoryChange()">
                <mat-option value="graha">Graha Dhasa</mat-option>
                <mat-option value="raasi">Raasi Dhasa</mat-option>
                <mat-option value="annual">Annual Dhasa</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Dhasa Type</mat-label>
              <mat-select formControlName="type">
                <mat-option *ngFor="let d of currentDhasaList" [value]="d">{{ d | titlecase }}</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-raised-button color="primary" type="button"
                    (click)="loadDhasa()" [disabled]="loading">
              <mat-icon>play_circle</mat-icon> Calculate
            </button>
            <mat-spinner *ngIf="loading" diameter="24"></mat-spinner>
          </form>
        </mat-card-content>
      </mat-card>

      <div *ngIf="loading" class="loading-overlay"><mat-spinner diameter="48"></mat-spinner></div>

      <ng-container *ngIf="dhasaData && !loading">
        <mat-card>
          <mat-card-title>{{ dhasaForm.value.type | titlecase }} Dhasa Periods</mat-card-title>
          <mat-card-content>
            <p *ngIf="!parsedPeriods.length" class="raw-data">
              <strong>Raw API response:</strong><br>
              <pre>{{ dhasaData | json }}</pre>
            </p>

            <mat-accordion *ngIf="parsedPeriods.length">
              <mat-expansion-panel *ngFor="let dasha of parsedPeriods; let i = index"
                                   [class.current-dasha]="dasha.isCurrent">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <strong>{{ dasha.lord }}</strong>
                    <mat-chip *ngIf="dasha.isCurrent" color="accent" highlighted style="margin-left:8px;font-size:.7rem">Current</mat-chip>
                  </mat-panel-title>
                  <mat-panel-description>{{ dasha.start }} → {{ dasha.end }}</mat-panel-description>
                </mat-expansion-panel-header>

                <table *ngIf="dasha.subPeriods?.length" mat-table [dataSource]="dasha.subPeriods" class="full-width">
                  <ng-container matColumnDef="lord">
                    <th mat-header-cell *matHeaderCellDef>Bhukti Lord</th>
                    <td mat-cell *matCellDef="let s">{{ s.lord }}</td>
                  </ng-container>
                  <ng-container matColumnDef="start">
                    <th mat-header-cell *matHeaderCellDef>Start</th>
                    <td mat-cell *matCellDef="let s">{{ s.start }}</td>
                  </ng-container>
                  <ng-container matColumnDef="end">
                    <th mat-header-cell *matHeaderCellDef>End</th>
                    <td mat-cell *matCellDef="let s">{{ s.end }}</td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="['lord','start','end']"></tr>
                  <tr mat-row *matRowDef="let r; columns:['lord','start','end']"
                      [class.current-bhukti]="r.isCurrent"></tr>
                </table>
              </mat-expansion-panel>
            </mat-accordion>
          </mat-card-content>
        </mat-card>
      </ng-container>

      <p *ngIf="errorMsg" class="error-msg">{{ errorMsg }}</p>
    </div>
  `,
  styles: [`
    .form-card   { margin-bottom: 16px; }
    .dhasa-opts  { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    .full-width  { width: 100%; }
    .error-msg   { color: #f44336; margin-top: 12px; }
    .raw-data    { white-space: pre-wrap; font-size: .8rem; background: #f5f5f5;
                   padding: 12px; border-radius: 4px; overflow: auto; max-height: 400px; }
    pre          { margin: 0; }
    .current-dasha  { background: #fffde7; }
    .current-bhukti { background: #fff9c4; }
  `]
})
export class DhasaBhuktiComponent {
  loading       = false;
  currentBirth: BirthData | null = null;
  dhasaData: any = null;
  parsedPeriods: any[] = [];
  errorMsg      = '';

  dhasaForm: FormGroup;
  currentDhasaList = GRAHA_DHASAS;

  constructor(private api: JhoraApiService, private fb: FormBuilder) {
    this.dhasaForm = this.fb.group({ category: ['graha'], type: ['vimsottari'] });
  }

  onCategoryChange(): void {
    const cat = this.dhasaForm.value.category;
    if (cat === 'graha')  { this.currentDhasaList = GRAHA_DHASAS;  this.dhasaForm.patchValue({ type: 'vimsottari' }); }
    if (cat === 'raasi')  { this.currentDhasaList = RAASI_DHASAS;  this.dhasaForm.patchValue({ type: 'chara' }); }
    if (cat === 'annual') { this.currentDhasaList = ANNUAL_DHASAS; this.dhasaForm.patchValue({ type: 'mudda' }); }
  }

  onBirthSubmit(data: BirthData): void {
    this.currentBirth = data;
  }

  loadDhasa(): void {
    if (!this.currentBirth) return;
    this.loading = true;
    this.dhasaData = null;
    this.parsedPeriods = [];
    this.errorMsg = '';
    const payload = { ...this.currentBirth, dhasa_type: this.dhasaForm.value.type };
    this.api.getDhasa(payload).subscribe({
      next: r  => {
        this.dhasaData = r;
        this.parsedPeriods = this.parsePeriods(r.periods);
        this.loading = false;
      },
      error: e => { this.errorMsg = e.error?.detail ?? 'API error'; this.loading = false; }
    });
  }

  private parsePeriods(raw: any): any[] {
    if (!raw) return [];
    const now = new Date();
    // Attempt to parse common dhasa result formats returned by PyJHora
    if (Array.isArray(raw)) {
      return raw.map((item: any) => {
        const [lord, start, end, ...rest] = Array.isArray(item) ? item : [];
        const isCurrent = start && end
          ? (new Date(start) <= now && now <= new Date(end))
          : false;
        const subPeriods = Array.isArray(rest[0])
          ? rest[0].map((s: any) => {
              const [sl, ss, se] = Array.isArray(s) ? s : [];
              return { lord: sl, start: ss, end: se,
                isCurrent: ss && se && new Date(ss) <= now && now <= new Date(se) };
            })
          : [];
        return { lord, start, end, isCurrent, subPeriods };
      });
    }
    // dict-based format
    if (typeof raw === 'object') {
      return Object.entries(raw).map(([lord, periods]: [string, any]) => ({
        lord,
        start: Array.isArray(periods) && periods[0]?.[1],
        end:   Array.isArray(periods) && periods[periods.length-1]?.[2],
        isCurrent: false,
        subPeriods: Array.isArray(periods) ? periods.map((p: any) => ({
          lord: p[0], start: p[1], end: p[2], isCurrent: false
        })) : []
      }));
    }
    return [];
  }
}
