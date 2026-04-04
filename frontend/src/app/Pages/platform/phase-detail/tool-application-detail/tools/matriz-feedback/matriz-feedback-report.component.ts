import { Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatrizFeedbackReportVersionDto } from './matriz-feedback.types';

@Component({
  selector: 'app-matriz-feedback-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (reports().length === 0) {
      <div class="empty-report">
        <i class="pi pi-sparkles"></i>
        <p>Aún no hay informes. Agregá al menos 3 items de feedback y hacé clic en "Analizar".</p>
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

          <div class="report__section">
            <p class="report__label">
              <i class="pi pi-eye"></i>
              Patrones identificados
            </p>
            <p class="report__text">{{ current()!.report.patronesIdentificados }}</p>
          </div>

          @if (current()!.report.prioridadAcciones.length) {
            <div class="report__section">
              <p class="report__label report__label--arreglar">
                <i class="pi pi-sort-amount-up-alt"></i>
                Prioridad de acciones
              </p>
              <ul class="report__list report__list--arreglar">
                @for (a of current()!.report.prioridadAcciones; track $index) {
                  <li>{{ a }}</li>
                }
              </ul>
            </div>
          }

          @if (current()!.report.insightsDestacados.length) {
            <div class="report__section">
              <p class="report__label report__label--insights">
                <i class="pi pi-lightbulb"></i>
                Insights destacados
              </p>
              <ul class="report__list report__list--insights">
                @for (ins of current()!.report.insightsDestacados; track $index) {
                  <li>{{ ins }}</li>
                }
              </ul>
            </div>
          }

          @if (current()!.report.feedbackAIgnorar) {
            <div class="report__section">
              <p class="report__label report__label--ignorar">
                <i class="pi pi-ban"></i>
                Feedback a ignorar / descartar
              </p>
              <p class="report__text">{{ current()!.report.feedbackAIgnorar }}</p>
            </div>
          }

          @if (current()!.report.recommendations.length) {
            <div class="report__section">
              <p class="report__label report__label--recs">
                <i class="pi pi-check-square"></i>
                Recomendaciones
              </p>
              <ul class="report__list report__list--recs">
                @for (r of current()!.report.recommendations; track $index) {
                  <li>{{ r }}</li>
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
      cursor: pointer; transition: all 0.15s; font-family: inherit;
    }
    .version-btn:hover { background: var(--p-surface-100); }
    .version-btn--active { background: #ecfeff; border-color: #a5f3fc; color: #0891b2; font-weight: 600; }

    .report {
      display: flex; flex-direction: column; gap: 0;
      border: 1px solid #a5f3fc; border-radius: 12px;
      background: linear-gradient(135deg, #ecfeff, #f0fdfe); overflow: hidden;
    }

    .report__summary { padding: 14px 16px; border-bottom: 1px solid #a5f3fc; }
    .report__summary p { margin: 0; font-size: 0.875rem; color: #374151; line-height: 1.65; }

    .report__section { padding: 12px 16px; border-bottom: 1px solid #a5f3fc; }
    .report__section:last-child { border-bottom: none; }

    .report__label {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.6875rem; font-weight: 700;
      letter-spacing: 0.06em; text-transform: uppercase;
      color: #0891b2; margin: 0 0 8px;
    }
    .report__label .pi { font-size: 0.7rem; }
    .report__label--arreglar { color: #92400e; }
    .report__label--insights { color: #1e40af; }
    .report__label--ignorar  { color: #6b7280; }
    .report__label--recs     { color: #065f46; }

    .report__text { margin: 0; font-size: 0.875rem; color: #374151; line-height: 1.6; }

    .report__list {
      margin: 0; padding: 0; list-style: none;
      display: flex; flex-direction: column; gap: 4px;
    }
    .report__list li {
      padding: 6px 10px; border-radius: 6px;
      font-size: 0.8125rem; color: #374151; line-height: 1.5; border-left: 2px solid;
    }
    .report__list--arreglar li { background: #fffbeb; border-color: #f59e0b; }
    .report__list--insights li { background: #eff6ff; border-color: #3b82f6; }
    .report__list--recs     li { background: var(--p-surface-50); border-color: #0891b2; }
  `],
})
export class MatrizFeedbackReportComponent {
  reports = input<MatrizFeedbackReportVersionDto[]>([]);
  selectedIndex = signal(0);
  current = computed(() => this.reports()[this.selectedIndex()] ?? null);
}
