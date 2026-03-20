import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule   } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule   } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule} from '@angular/material/divider';
import { MatChipsModule  } from '@angular/material/chips';
import { MatTableModule  } from '@angular/material/table';

import { BirthDataFormComponent } from '../shared/birth-data-form/birth-data-form.component';
import { JhoraApiService } from '../services/jhora-api.service';
import { BirthData } from '../models/jhora.models';

@Component({
  selector: 'app-match',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatDividerModule, MatChipsModule, MatTableModule,
    BirthDataFormComponent
  ],
  template: `
    <div class="page-container">
      <h2 class="section-title"><mat-icon>favorite</mat-icon> Marriage Compatibility (Ashtakoota)</h2>

      <div class="match-forms">
        <mat-card class="form-half">
          <mat-card-header><mat-card-title>Boy's Birth Details</mat-card-title></mat-card-header>
          <mat-card-content>
            <app-birth-data-form
              title=""
              submitLabel="Save Boy"
              [loading]="false"
              (submitted)="onBoy($event)">
            </app-birth-data-form>
          </mat-card-content>
          <mat-card-footer *ngIf="boyData">
            <mat-chip color="primary" highlighted style="margin:8px">✓ Boy's data saved</mat-chip>
          </mat-card-footer>
        </mat-card>

        <mat-card class="form-half">
          <mat-card-header><mat-card-title>Girl's Birth Details</mat-card-title></mat-card-header>
          <mat-card-content>
            <app-birth-data-form
              title=""
              submitLabel="Save Girl"
              [loading]="false"
              (submitted)="onGirl($event)">
            </app-birth-data-form>
          </mat-card-content>
          <mat-card-footer *ngIf="girlData">
            <mat-chip color="accent" highlighted style="margin:8px">✓ Girl's data saved</mat-chip>
          </mat-card-footer>
        </mat-card>
      </div>

      <div class="match-action" *ngIf="boyData && girlData">
        <button mat-raised-button color="primary" (click)="calculate()" [disabled]="loading">
          <mat-icon>favorite</mat-icon> Calculate Compatibility
        </button>
        <mat-spinner *ngIf="loading" diameter="24"></mat-spinner>
      </div>

      <div *ngIf="loading" class="loading-overlay"><mat-spinner diameter="48"></mat-spinner></div>

      <ng-container *ngIf="result && !loading">
        <!-- Score Summary -->
        <mat-card class="score-card">
          <mat-card-content>
            <div class="score-display">
              <div class="score-circle" [class.good]="totalScore >= 18" [class.avg]="totalScore >= 12 && totalScore < 18" [class.poor]="totalScore < 12">
                {{ totalScore }} / 36
              </div>
              <div class="score-text">
                <h3>{{ compatibilityLabel }}</h3>
                <p>{{ compatibilityDesc }}</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Raw result -->
        <mat-card style="margin-top:16px">
          <mat-card-title>Detailed Compatibility Report</mat-card-title>
          <mat-card-content>
            <pre class="raw-data">{{ result | json }}</pre>
          </mat-card-content>
        </mat-card>
      </ng-container>

      <p *ngIf="errorMsg" class="error-msg">{{ errorMsg }}</p>
    </div>
  `,
  styles: [`
    .match-forms  { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 16px; }
    .form-half    { flex: 1 1 380px; }
    .match-action { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .score-card   { background: linear-gradient(135deg,#e8eaf6,#fff); }
    .score-display{ display: flex; align-items: center; gap: 24px; }
    .score-circle {
      width: 100px; height: 100px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.6rem; font-weight: 700; color: #fff;
      background: #9e9e9e;
      &.good { background: #43a047; }
      &.avg  { background: #fb8c00; }
      &.poor { background: #e53935; }
    }
    .score-text h3 { margin: 0 0 4px; font-size: 1.2rem; }
    .score-text p  { margin: 0; color: #555; font-size: .9rem; }
    .raw-data { font-size:.78rem; background:#f5f5f5; padding:12px; border-radius:4px;
                overflow:auto; max-height:400px; white-space: pre-wrap; }
    .error-msg{ color: #f44336; margin-top: 12px; }
  `]
})
export class MatchComponent {
  loading   = false;
  boyData:  BirthData | null = null;
  girlData: BirthData | null = null;
  result: any = null;
  errorMsg = '';
  totalScore = 0;

  constructor(private api: JhoraApiService) {}

  onBoy(d: BirthData):  void { this.boyData  = d; }
  onGirl(d: BirthData): void { this.girlData = d; }

  calculate(): void {
    if (!this.boyData || !this.girlData) return;
    this.loading  = true;
    this.result   = null;
    this.errorMsg = '';
    this.api.getMatchCompatibility({ boy: this.boyData, girl: this.girlData }).subscribe({
      next: r  => {
        this.result     = r;
        this.totalScore = this.extractScore(r);
        this.loading    = false;
      },
      error: e => { this.errorMsg = e.error?.detail ?? 'API error'; this.loading = false; }
    });
  }

  private extractScore(r: any): number {
    if (typeof r?.total_score === 'number') return r.total_score;
    if (typeof r?.score       === 'number') return r.score;
    return 0;
  }

  get compatibilityLabel(): string {
    if (this.totalScore >= 28) return 'Excellent Match';
    if (this.totalScore >= 18) return 'Good Match';
    if (this.totalScore >= 12) return 'Average Match';
    return 'Poor Match';
  }

  get compatibilityDesc(): string {
    if (this.totalScore >= 28) return 'Very compatible – highly recommended for marriage.';
    if (this.totalScore >= 18) return 'Compatible – good prospects for a happy marriage.';
    if (this.totalScore >= 12) return 'Moderately compatible – may need individual assessment.';
    return 'Not recommended without expert consultation.';
  }
}
