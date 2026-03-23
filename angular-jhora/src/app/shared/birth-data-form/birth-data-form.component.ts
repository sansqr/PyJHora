import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule      } from '@angular/material/input';
import { MatSelectModule     } from '@angular/material/select';
import { MatButtonModule     } from '@angular/material/button';
import { MatIconModule       } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule    } from '@angular/material/tooltip';

import { BirthData, AYANAMSA_MODES, LANGUAGES } from '../../models/jhora.models';
import { JhoraApiService } from '../../services/jhora-api.service';

@Component({
  selector: 'app-birth-data-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="birth-form">
      <h3 class="form-title">{{ title }}</h3>

      <!-- Date -->
      <div class="row">
        <mat-form-field appearance="outline" class="field-sm">
          <mat-label>Year</mat-label>
          <input matInput type="number" formControlName="year" placeholder="1985">
        </mat-form-field>
        <mat-form-field appearance="outline" class="field-sm">
          <mat-label>Month (1–12)</mat-label>
          <input matInput type="number" formControlName="month" min="1" max="12">
        </mat-form-field>
        <mat-form-field appearance="outline" class="field-sm">
          <mat-label>Day</mat-label>
          <input matInput type="number" formControlName="day" min="1" max="31">
        </mat-form-field>
      </div>

      <!-- Time -->
      <div class="row">
        <mat-form-field appearance="outline" class="field-sm">
          <mat-label>Hour (0–23)</mat-label>
          <input matInput type="number" formControlName="hour" min="0" max="23">
        </mat-form-field>
        <mat-form-field appearance="outline" class="field-sm">
          <mat-label>Minute</mat-label>
          <input matInput type="number" formControlName="minute" min="0" max="59">
        </mat-form-field>
        <mat-form-field appearance="outline" class="field-sm">
          <mat-label>Second</mat-label>
          <input matInput type="number" formControlName="second" min="0" max="59">
        </mat-form-field>
      </div>

      <!-- Location -->
      <div class="row">
        <mat-form-field appearance="outline" class="field-loc">
          <mat-label>Place (city, country)</mat-label>
          <input matInput formControlName="place" placeholder="Chennai, India">
          <button mat-icon-button matSuffix type="button"
                  (click)="lookupPlace()" [disabled]="searching"
                  matTooltip="Lookup coordinates">
            <mat-icon>search</mat-icon>
          </button>
        </mat-form-field>
        <mat-spinner *ngIf="searching" diameter="24" style="margin-top:14px"></mat-spinner>
      </div>

      <div class="row">
        <mat-form-field appearance="outline" class="field-md">
          <mat-label>Latitude (°N +, °S –)</mat-label>
          <input matInput type="number" formControlName="latitude" step="0.0001">
        </mat-form-field>
        <mat-form-field appearance="outline" class="field-md">
          <mat-label>Longitude (°E +, °W –)</mat-label>
          <input matInput type="number" formControlName="longitude" step="0.0001">
        </mat-form-field>
        <mat-form-field appearance="outline" class="field-sm">
          <mat-label>Timezone offset (h)</mat-label>
          <input matInput type="number" formControlName="timezone_offset" step="0.25">
        </mat-form-field>
      </div>

      <!-- Options -->
      <div class="row">
        <mat-form-field appearance="outline" class="field-md">
          <mat-label>Ayanamsa</mat-label>
          <mat-select formControlName="ayanamsa_mode">
            <mat-option *ngFor="let m of ayanamsaModes" [value]="m">{{ m }}</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="field-md">
          <mat-label>Language</mat-label>
          <mat-select formControlName="language">
            <mat-option *ngFor="let l of languages" [value]="l.code">{{ l.name }}</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="actions">
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || loading">
          <mat-icon>calculate</mat-icon> {{ submitLabel }}
        </button>
        <mat-spinner *ngIf="loading" diameter="24"></mat-spinner>
      </div>
      <p *ngIf="errorMsg" class="error">{{ errorMsg }}</p>
    </form>
  `,
  styles: [`
    .birth-form { padding: 0; }
    .form-title { margin: 0 0 12px; font-size: 1rem; color: #3f51b5; }
    .row        { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 4px; }
    .field-sm   { width: 110px; }
    .field-md   { width: 200px; }
    .field-loc  { flex: 1 1 280px; }
    .actions    { display: flex; align-items: center; gap: 12px; margin-top: 12px; }
    .error      { color: #f44336; font-size: .85rem; margin-top: 6px; }
  `]
})
export class BirthDataFormComponent implements OnInit {
  @Input() title        = 'Birth Data';
  @Input() submitLabel  = 'Calculate';
  @Input() loading      = false;
  @Output() submitted   = new EventEmitter<BirthData>();

  form!: FormGroup;
  searching = false;
  errorMsg  = '';
  ayanamsaModes = AYANAMSA_MODES;
  languages     = LANGUAGES;

  constructor(private fb: FormBuilder, private api: JhoraApiService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      year:            [1985, [Validators.required, Validators.min(-4000), Validators.max(2100)]],
      month:           [6,   [Validators.required, Validators.min(1), Validators.max(12)]],
      day:             [15,  [Validators.required, Validators.min(1), Validators.max(31)]],
      hour:            [10,  [Validators.required, Validators.min(0), Validators.max(23)]],
      minute:          [30,  [Validators.required, Validators.min(0), Validators.max(59)]],
      second:          [0],
      place:           [''],
      latitude:        [13.0827, Validators.required],
      longitude:       [80.2707, Validators.required],
      timezone_offset: [5.5,    Validators.required],
      ayanamsa_mode:   ['LAHIRI'],
      language:        ['en'],
    });
  }

  lookupPlace(): void {
    const place = this.form.value.place?.trim();
    if (!place) return;
    this.searching = true;
    this.errorMsg  = '';
    this.api.searchLocation(place).subscribe({
      next: r => {
        this.form.patchValue({
          latitude: r.latitude,
          longitude: r.longitude,
          timezone_offset: r.timezone_offset
        });
        this.searching = false;
      },
      error: e => {
        this.errorMsg = 'Location not found. Enter coordinates manually.';
        this.searching = false;
      }
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.value;
    const data: BirthData = {
      year: v.year, month: v.month, day: v.day,
      hour: v.hour, minute: v.minute, second: v.second ?? 0,
      place_name: v.place ?? '',
      latitude: v.latitude, longitude: v.longitude,
      timezone_offset: v.timezone_offset,
      ayanamsa_mode: v.ayanamsa_mode,
      language: v.language
    };
    this.submitted.emit(data);
  }
}
