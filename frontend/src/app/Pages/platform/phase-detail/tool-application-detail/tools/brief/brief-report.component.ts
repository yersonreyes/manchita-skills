import { Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BriefReportVersionDto } from './brief.types';

@Component({
  selector: 'app-brief-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (reports().length === 0) {
      <div class="empty-report">
        <i class="pi pi-sparkles"></i>
        <p>Aún no hay informes generados. Completá contexto + objetivo y hacé clic en "Analizar".</p>
      </div>
    } @else {

      @if (reports().length > 1) {
        <div class="version-selector">
          @for (r of reports(); track r.version; let i = $index) {
            <button
              class="version-btn"
              [class.version-btn--active]="selectedIndex() === i"
              (click)="selectedIndex.set(i)"
            >
              v{{ r.version }} — {{ r.generatedAt | date:'dd/MM/yy HH:mm' }}
            </button>
          }
        </div>
      }

      @if (current()) {
        <div class="report">

          <div class="report__summary">
            <p>{{ current()!.report.executiveSummary }}</p>
          </div>

          @if (current()!.report.fortalezas.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-check-circle"></i>
                Fortalezas del brief
              </p>
              <ul class="report__list report__list--success">
                @for (item of current()!.report.fortalezas; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          }

          @if (current()!.report.gapsCriticos.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-exclamation-circle"></i>
                Gaps críticos
              </p>
              <ul class="report__list report__list--gaps">
                @for (item of current()!.report.gapsCriticos; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          }

          @if (current()!.report.alertas.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-exclamation-triangle"></i>
                Alertas
              </p>
              <ul class="report__list report__list--alerts">
                @for (item of current()!.report.alertas; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          }

          @if (current()!.report.sugerenciasScope.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-th-large"></i>
                Sugerencias de scope
              </p>
              <ul class="report__list">
                @for (item of current()!.report.sugerenciasScope; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          }

          @if (current()!.report.recommendations.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-check-square"></i>
                Recomendaciones
              </p>
              <ul class="report__list report__list--recommendations">
                @for (item of current()!.report.recommendations; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          }

        </div>
      }
    }
  `,
  styles: [`
    .empty-report {
      display: flex; flex-direction: column; align-items: center;
      gap: 0.5rem; padding: 2rem; color: #9ca3af; text-align: center;
    }
    .empty-report i { font-size: 1.5rem; color: #d1d5db; }
    .empty-report p { font-size: 0.875rem; margin: 0; }

    .version-selector { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }

    .version-btn {
      padding: 4px 10px; border-radius: 6px;
      border: 1px solid var(--p-surface-300); background: transparent;
      font-size: 0.75rem; color: var(--p-text-secondary-color);
      cursor: pointer; transition: all 0.15s;
    }
    .version-btn:hover { background: var(--p-surface-100); }
    .version-btn--active { background: #eff6ff; border-color: #bfdbfe; color: #1d4ed8; font-weight: 600; }

    .report {
      display: flex; flex-direction: column; gap: 0;
      border: 1px solid #bfdbfe; border-radius: 12px;
      background: linear-gradient(135deg, #eff6ff, #f8fbff); overflow: hidden;
    }

    .report__summary { padding: 14px 16px; border-bottom: 1px solid #bfdbfe; }
    .report__summary p { margin: 0; font-size: 0.875rem; color: #374151; line-height: 1.65; }

    .report__section { padding: 12px 16px; border-bottom: 1px solid #bfdbfe; }
    .report__section:last-child { border-bottom: none; }

    .report__label {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.6875rem; font-weight: 700;
      letter-spacing: 0.06em; text-transform: uppercase;
      color: #1d4ed8; margin: 0 0 8px;
    }
    .report__label .pi { font-size: 0.7rem; }

    .report__list {
      margin: 0; padding-left: 1.25rem;
      display: flex; flex-direction: column; gap: 5px;
    }
    .report__list li { font-size: 0.8125rem; color: #374151; line-height: 1.5; }
    .report__list--success li { color: #15803d; font-weight: 500; }
    .report__list--gaps li { color: #b91c1c; font-weight: 500; }
    .report__list--alerts li { color: #92400e; font-weight: 500; }
    .report__list--recommendations li { font-weight: 500; color: #1f2937; }
  `],
})
export class BriefReportComponent {
  reports = input<BriefReportVersionDto[]>([]);
  selectedIndex = signal(0);
  current = computed(() => this.reports()[this.selectedIndex()] ?? null);
}
