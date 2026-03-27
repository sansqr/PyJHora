import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BirthData, AYANAMSA_MODES, LANGUAGES, AyanamsaMode, LanguageCode } from '../../models/jhora.models';
import { JhoraApiService } from '../../services/jhora.service';

@Component({
  selector: 'app-birth-data-form',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    <form (submit)="submit()" class="jh-form">
      @if (title) {
        <div class="jh-form-title">{{ title }}</div>
      }

      <div class="jh-form-section">DATE</div>
      <div class="jh-field-row">
        <div class="jh-field">
          <label>Year</label>
          <input type="number" [value]="birthForm.controls.year()"
                 (input)="birthForm.controls.year.set(+$any($event.target).value)"
                 placeholder="1985">
        </div>
        <div class="jh-field">
          <label>Month (1–12)</label>
          <input type="number" [value]="birthForm.controls.month()"
                 (input)="birthForm.controls.month.set(+$any($event.target).value)"
                 min="1" max="12">
        </div>
        <div class="jh-field">
          <label>Day</label>
          <input type="number" [value]="birthForm.controls.day()"
                 (input)="birthForm.controls.day.set(+$any($event.target).value)"
                 min="1" max="31">
        </div>
      </div>

      <div class="jh-form-section">TIME</div>
      <div class="jh-field-row">
        <div class="jh-field">
          <label>Hour (0–23)</label>
          <input type="number" [value]="birthForm.controls.hour()"
                 (input)="birthForm.controls.hour.set(+$any($event.target).value)"
                 min="0" max="23">
        </div>
        <div class="jh-field">
          <label>Minute</label>
          <input type="number" [value]="birthForm.controls.minute()"
                 (input)="birthForm.controls.minute.set(+$any($event.target).value)"
                 min="0" max="59">
        </div>
        <div class="jh-field">
          <label>Second</label>
          <input type="number" [value]="birthForm.controls.second()"
                 (input)="birthForm.controls.second.set(+$any($event.target).value)"
                 min="0" max="59">
        </div>
      </div>

      <div class="jh-form-section">LOCATION</div>
      <div class="jh-field-row">
        <div class="jh-field jh-field-wide">
          <label>Place (City, Country)</label>
          <div class="jh-input-with-btn">
            <input type="text" [value]="birthForm.controls.place()"
                   (input)="birthForm.controls.place.set($any($event.target).value)"
                   placeholder="Chennai, India">
            <button type="button" class="jh-lookup-btn"
                    (click)="lookupPlace()" [disabled]="searching()">
              {{ searching() ? '...' : 'Lookup' }}
            </button>
          </div>
        </div>
      </div>
      <div class="jh-field-row">
        <div class="jh-field">
          <label>Latitude (N+, S–)</label>
          <input type="number" [value]="birthForm.controls.latitude()"
                 (input)="birthForm.controls.latitude.set(+$any($event.target).value)"
                 step="0.0001">
        </div>
        <div class="jh-field">
          <label>Longitude (E+, W–)</label>
          <input type="number" [value]="birthForm.controls.longitude()"
                 (input)="birthForm.controls.longitude.set(+$any($event.target).value)"
                 step="0.0001">
        </div>
        <div class="jh-field">
          <label>Timezone (h)</label>
          <input type="number" [value]="birthForm.controls.timezone_offset()"
                 (input)="birthForm.controls.timezone_offset.set(+$any($event.target).value)"
                 step="0.25">
        </div>
      </div>

      <div class="jh-form-section">OPTIONS</div>
      <div class="jh-field-row">
        <div class="jh-field">
          <label>Ayanamsa</label>
          <select [value]="birthForm.controls.ayanamsa_mode()"
                  (change)="birthForm.controls.ayanamsa_mode.set($any($event.target).value)">
            @for (m of ayanamsaModes; track m) {
              <option [value]="m">{{ m }}</option>
            }
          </select>
        </div>
        <div class="jh-field">
          <label>Language</label>
          <select [value]="birthForm.controls.language()"
                  (change)="birthForm.controls.language.set($any($event.target).value)">
            @for (l of languages; track l.code) {
              <option [value]="l.code">{{ l.name }}</option>
            }
          </select>
        </div>
      </div>

      <div class="jh-form-actions">
        <button type="submit" class="jh-btn-primary" [disabled]="loading">
          ▶ {{ submitLabel }}
        </button>
        <button type="button" class="jh-btn-secondary" (click)="resetForm()">Reset</button>
        @if (loading || searching()) {
          <mat-spinner diameter="16" class="jh-spinner"></mat-spinner>
        }
      </div>

      @if (errorMsg()) {
        <div class="jh-form-error">⚠ {{ errorMsg() }}</div>
      }
    </form>
  `,
  styles: [`
    .jh-form { font-family: 'Courier New', Courier, monospace; font-size: 11px; color: var(--jh-text-primary); }
    .jh-form-title { font-size: 11px; font-weight: bold; color: var(--jh-text-accent); margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid var(--jh-border); }
    .jh-form-section { font-size: 9px; letter-spacing: 1px; color: var(--jh-text-muted); padding: 4px 0 2px; border-bottom: 1px solid var(--jh-border); margin-bottom: 4px; }
    .jh-field-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 4px; }
    .jh-field {
      display: flex; flex-direction: column; gap: 2px; min-width: 100px;
      label { font-size: 10px; color: var(--jh-text-secondary); }
      input, select {
        background: var(--jh-bg-input); border: 1px solid var(--jh-border);
        color: var(--jh-text-primary); font-family: 'Courier New', Courier, monospace;
        font-size: 11px; padding: 3px 5px; height: 22px; border-radius: 1px; outline: none; width: 100%;
        &:focus { border-color: var(--jh-border-accent); }
      }
      select option { background: var(--jh-bg-card); color: var(--jh-text-primary); }
    }
    .jh-field-wide { flex: 1 1 280px; }
    .jh-input-with-btn { display: flex; gap: 4px; input { flex: 1; } }
    .jh-lookup-btn {
      background: var(--jh-bg-header); border: 1px solid var(--jh-border);
      color: var(--jh-text-secondary); font-family: 'Courier New', Courier, monospace;
      font-size: 10px; padding: 0 8px; cursor: pointer; height: 22px; white-space: nowrap;
      &:hover { background: var(--jh-bg-hover); color: #fff; }
      &:disabled { opacity: 0.5; cursor: default; }
    }
    .jh-form-actions { display: flex; align-items: center; gap: 6px; margin-top: 8px; padding-top: 6px; border-top: 1px solid var(--jh-border); }
    .jh-btn-primary {
      background: #1e1e5a; border: 1px solid #4444aa; color: #aabbff;
      font-family: 'Courier New', Courier, monospace; font-size: 11px;
      padding: 3px 14px; height: 24px; cursor: pointer; border-radius: 2px; font-weight: bold;
      &:hover { background: #2a2a70; color: #fff; }
      &:disabled { opacity: 0.4; cursor: default; }
    }
    .jh-btn-secondary {
      background: transparent; border: 1px solid var(--jh-border); color: var(--jh-text-secondary);
      font-family: 'Courier New', Courier, monospace; font-size: 11px;
      padding: 3px 12px; height: 24px; cursor: pointer; border-radius: 2px;
      &:hover { background: var(--jh-bg-hover); color: #fff; }
    }
    .jh-form-error { color: var(--jh-danger); font-size: 10px; margin-top: 6px; padding: 3px 6px; border: 1px solid #553333; background: #1a0808; }
  `]
})
export class BirthDataFormComponent {
  @Input() title       = 'Birth Data';
  @Input() submitLabel = 'Calculate';
  @Input() loading     = false;
  @Output() submitted  = new EventEmitter<BirthData>();

  private readonly api = inject(JhoraApiService);

  readonly searching = signal(false);
  readonly errorMsg  = signal('');

  readonly ayanamsaModes = AYANAMSA_MODES;
  readonly languages     = LANGUAGES;

  readonly birthForm = { controls: {
    year:            signal(1985),
    month:           signal(6),
    day:             signal(15),
    hour:            signal(10),
    minute:          signal(30),
    second:          signal(0),
    place:           signal(''),
    latitude:        signal(13.0827),
    longitude:       signal(80.2707),
    timezone_offset: signal(5.5),
    ayanamsa_mode:   signal<AyanamsaMode>('LAHIRI'),
    language:        signal<LanguageCode>('en'),
  }};

  lookupPlace(): void {
    const place = this.birthForm.controls.place()?.trim();
    if (!place) return;
    this.searching.set(true);
    this.errorMsg.set('');
    this.api.searchLocation(place).subscribe({
      next: r => {
        this.birthForm.controls.latitude.set(r.latitude);
        this.birthForm.controls.longitude.set(r.longitude);
        this.birthForm.controls.timezone_offset.set(r.timezone_offset);
        this.searching.set(false);
      },
      error: () => {
        this.errorMsg.set('Location not found – enter coordinates manually.');
        this.searching.set(false);
      }
    });
  }

  resetForm(): void {
    this.birthForm.controls.year.set(1985);
    this.birthForm.controls.month.set(6);
    this.birthForm.controls.day.set(15);
    this.birthForm.controls.hour.set(10);
    this.birthForm.controls.minute.set(30);
    this.birthForm.controls.second.set(0);
    this.birthForm.controls.place.set('');
    this.birthForm.controls.latitude.set(13.0827);
    this.birthForm.controls.longitude.set(80.2707);
    this.birthForm.controls.timezone_offset.set(5.5);
    this.birthForm.controls.ayanamsa_mode.set('LAHIRI');
    this.birthForm.controls.language.set('en');
  }

  submit(): void {
    const c = this.birthForm.controls;
    this.submitted.emit({
      year:             c.year(),
      month:            c.month(),
      day:              c.day(),
      hour:             c.hour(),
      minute:           c.minute(),
      second:           c.second() ?? 0,
      place_name:       c.place() ?? '',
      latitude:         c.latitude(),
      longitude:        c.longitude(),
      timezone_offset:  c.timezone_offset(),
      ayanamsa_mode:    c.ayanamsa_mode(),
      language:         c.language(),
    });
  }
}
