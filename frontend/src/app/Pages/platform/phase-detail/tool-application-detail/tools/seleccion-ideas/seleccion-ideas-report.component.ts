import { Component, computed, input, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { SeleccionIdeasReportVersionDto } from './seleccion-ideas.types';

@Component({
  selector: 'app-seleccion-ideas-report',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  template: `
    @if (reports().length === 0) {
      <div class="empty-report">
        <i class="pi pi-sparkles"></i>
        <p>Aún no hay informes generados. Definí criterios y al menos 2 ideas, luego hacé clic en "Analizar".</p>
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

          @if (current()!.report.analisisIdeasSeleccionadas.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-check-circle"></i>
                Análisis de ideas seleccionadas
              </p>
              <div class="report__ideas">
                @for (item of current()!.report.analisisIdeasSeleccionadas; track $index) {
                  <div class="report__idea">
                    <div class="report__idea-header">
                      <p class="report__idea-titulo">{{ item.idea }}</p>
                      @if (item.scoreTotal) {
                        <span class="report__score-badge">{{ item.scoreTotal | number:'1.1-1' }} / 5</span>
                      }
                    </div>
                    @if (item.puntosFuertes.length) {
                      <div class="report__idea-section">
                        <span class="report__idea-tag report__idea-tag--forte">Fortalezas</span>
                        <ul class="report__sub-list">
                          @for (p of item.puntosFuertes; track $index) {
                            <li>{{ p }}</li>
                          }
                        </ul>
                      </div>
                    }
                    @if (item.puntosDebiles.length) {
                      <div class="report__idea-section">
                        <span class="report__idea-tag report__idea-tag--debil">Debilidades</span>
                        <ul class="report__sub-list">
                          @for (p of item.puntosDebiles; track $index) {
                            <li>{{ p }}</li>
                          }
                        </ul>
                      </div>
                    }
                    @if (item.recomendacion) {
                      <p class="report__idea-rec"><strong>Recomendación:</strong> {{ item.recomendacion }}</p>
                    }
                  </div>
                }
              </div>
            </div>
          }

          @if (current()!.report.patronesDecision.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-chart-bar"></i>
                Patrones en la decisión
              </p>
              <ul class="report__list report__list--patterns">
                @for (item of current()!.report.patronesDecision; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          }

          @if (current()!.report.ideasRescatables.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-history"></i>
                Ideas rescatables (no seleccionadas ahora)
              </p>
              <ul class="report__list">
                @for (item of current()!.report.ideasRescatables; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          }

          @if (current()!.report.alertasDeEquipo.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-exclamation-triangle"></i>
                Alertas para el equipo
              </p>
              <ul class="report__list report__list--alerts">
                @for (item of current()!.report.alertasDeEquipo; track $index) {
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
    .version-btn--active { background: #fdf4ff; border-color: #f5d0fe; color: #c026d3; font-weight: 600; }

    .report {
      display: flex; flex-direction: column; gap: 0;
      border: 1px solid #f5d0fe; border-radius: 12px;
      background: linear-gradient(135deg, #fdf4ff, #fffaff); overflow: hidden;
    }

    .report__summary { padding: 14px 16px; border-bottom: 1px solid #f5d0fe; }
    .report__summary p { margin: 0; font-size: 0.875rem; color: #374151; line-height: 1.65; }

    .report__section { padding: 12px 16px; border-bottom: 1px solid #f5d0fe; }
    .report__section:last-child { border-bottom: none; }

    .report__label {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.6875rem; font-weight: 700;
      letter-spacing: 0.06em; text-transform: uppercase;
      color: #c026d3; margin: 0 0 8px;
    }
    .report__label .pi { font-size: 0.7rem; }

    .report__ideas { display: flex; flex-direction: column; gap: 8px; }
    .report__idea {
      padding: 10px 12px; border-radius: 8px;
      background: rgba(255,255,255,0.75); border: 1px solid #f5d0fe;
    }
    .report__idea-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      gap: 8px; margin-bottom: 6px;
    }
    .report__idea-titulo {
      margin: 0; font-size: 0.8125rem; font-weight: 600;
      color: #374151; line-height: 1.4; border-left: 3px solid #c026d3;
      padding-left: 8px; flex: 1;
    }
    .report__score-badge {
      padding: 2px 8px; border-radius: 12px;
      background: #fae8ff; color: #86198f;
      font-size: 0.72rem; font-weight: 700; white-space: nowrap; flex-shrink: 0;
    }
    .report__idea-section { margin: 6px 0 0; }
    .report__idea-tag {
      display: inline-block; padding: 1px 6px; border-radius: 4px;
      font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.05em; margin-bottom: 3px;
    }
    .report__idea-tag--forte { background: #dcfce7; color: #166534; }
    .report__idea-tag--debil { background: #fef9c3; color: #713f12; }
    .report__idea-rec { margin: 6px 0 0; font-size: 0.8rem; color: #374151; }

    .report__sub-list {
      margin: 2px 0 0; padding-left: 1.1rem;
      display: flex; flex-direction: column; gap: 2px;
    }
    .report__sub-list li { font-size: 0.78rem; color: #4b5563; line-height: 1.4; }

    .report__list {
      margin: 0; padding-left: 1.25rem;
      display: flex; flex-direction: column; gap: 5px;
    }
    .report__list li { font-size: 0.8125rem; color: #374151; line-height: 1.5; }
    .report__list--patterns li { color: #86198f; font-weight: 500; }
    .report__list--alerts li { color: #b45309; }
    .report__list--recommendations li { font-weight: 500; color: #1f2937; }
  `],
})
export class SeleccionIdeasReportComponent {
  reports = input<SeleccionIdeasReportVersionDto[]>([]);
  selectedIndex = signal(0);
  current = computed(() => this.reports()[this.selectedIndex()] ?? null);
}
