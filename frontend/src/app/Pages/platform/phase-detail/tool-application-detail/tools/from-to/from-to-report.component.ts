import { Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FromToReportVersionDto } from './from-to.types';

@Component({
  selector: 'app-from-to-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (reports().length === 0) {
      <div class="empty-report">
        <i class="pi pi-sparkles"></i>
        <p>Aún no hay informes generados. Definí al menos 3 pares FROM-TO y hacé clic en "Analizar".</p>
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

          @if (current()!.report.analisisFrom || current()!.report.analisisTo) {
            <div class="report__section report__section--context">
              <div class="report__context-grid">
                @if (current()!.report.analisisFrom) {
                  <div class="report__context-col">
                    <p class="report__context-label report__context-label--from">
                      <i class="pi pi-circle"></i> Estado actual (FROM)
                    </p>
                    <p class="report__context-text">{{ current()!.report.analisisFrom }}</p>
                  </div>
                }
                @if (current()!.report.analisisTo) {
                  <div class="report__context-col">
                    <p class="report__context-label report__context-label--to">
                      <i class="pi pi-check-circle"></i> Visión futura (TO)
                    </p>
                    <p class="report__context-text">{{ current()!.report.analisisTo }}</p>
                  </div>
                }
              </div>
            </div>
          }

          @if (current()!.report.transformacionesDestacadas.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-arrow-right"></i>
                Transformaciones destacadas
              </p>
              <div class="report__transformaciones">
                @for (t of current()!.report.transformacionesDestacadas; track $index) {
                  <div class="report__trans">
                    <span class="report__trans-from">{{ t.from }}</span>
                    <i class="pi pi-arrow-right report__trans-arrow"></i>
                    <span class="report__trans-to">{{ t.to }}</span>
                    <p class="report__trans-brecha">{{ t.brecha }}</p>
                  </div>
                }
              </div>
            </div>
          }

          @if (current()!.report.brechasCriticas.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-exclamation-triangle"></i>
                Brechas críticas
              </p>
              <ul class="report__list">
                @for (item of current()!.report.brechasCriticas; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          }

          @if (current()!.report.insightsEstrategicos.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-lightbulb"></i>
                Insights estratégicos
              </p>
              <ul class="report__list">
                @for (item of current()!.report.insightsEstrategicos; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          }

          @if (current()!.report.oportunidades.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-arrow-up-right"></i>
                Oportunidades
              </p>
              <ul class="report__list">
                @for (item of current()!.report.oportunidades; track $index) {
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
    .version-btn--active { background: #fff7ed; border-color: #fed7aa; color: #c2410c; font-weight: 600; }

    .report {
      display: flex; flex-direction: column; gap: 0;
      border: 1px solid #fed7aa; border-radius: 12px;
      background: linear-gradient(135deg, #fff7ed, #fffbf5); overflow: hidden;
    }

    .report__summary { padding: 14px 16px; border-bottom: 1px solid #fed7aa; }
    .report__summary p { margin: 0; font-size: 0.875rem; color: #374151; line-height: 1.65; }

    .report__section { padding: 12px 16px; border-bottom: 1px solid #fed7aa; }
    .report__section:last-child { border-bottom: none; }

    .report__label {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.6875rem; font-weight: 700;
      letter-spacing: 0.06em; text-transform: uppercase;
      color: #c2410c; margin: 0 0 8px;
    }
    .report__label .pi { font-size: 0.7rem; }

    /* Context grid */
    .report__context-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .report__context-col { display: flex; flex-direction: column; gap: 4px; }

    .report__context-label {
      display: flex; align-items: center; gap: 5px;
      font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.05em; margin: 0;
    }
    .report__context-label .pi { font-size: 0.7rem; }
    .report__context-label--from { color: #c2410c; }
    .report__context-label--to { color: #15803d; }

    .report__context-text { margin: 0; font-size: 0.8125rem; color: #374151; line-height: 1.55; }

    /* Transformaciones */
    .report__transformaciones { display: flex; flex-direction: column; gap: 6px; }

    .report__trans {
      display: grid; grid-template-columns: 1fr 20px 1fr;
      grid-template-rows: auto auto;
      gap: 4px 8px; padding: 8px 10px;
      border-radius: 8px; background: rgba(255,255,255,0.6);
      border: 1px solid #fed7aa;
    }

    .report__trans-from {
      font-size: 0.8125rem; color: #c2410c; font-weight: 600; line-height: 1.4;
    }

    .report__trans-arrow {
      display: flex; align-items: center; justify-content: center;
      color: #ea580c; font-size: 0.7rem;
    }

    .report__trans-to {
      font-size: 0.8125rem; color: #15803d; font-weight: 600; line-height: 1.4;
    }

    .report__trans-brecha {
      grid-column: 1 / -1; margin: 0;
      font-size: 0.78rem; color: #6b7280;
      font-style: italic; line-height: 1.4;
    }

    .report__list {
      margin: 0; padding-left: 1.25rem;
      display: flex; flex-direction: column; gap: 5px;
    }
    .report__list li { font-size: 0.8125rem; color: #374151; line-height: 1.5; }
    .report__list--recommendations li { font-weight: 500; color: #1f2937; }
  `],
})
export class FromToReportComponent {
  reports = input<FromToReportVersionDto[]>([]);
  selectedIndex = signal(0);
  current = computed(() => this.reports()[this.selectedIndex()] ?? null);
}
