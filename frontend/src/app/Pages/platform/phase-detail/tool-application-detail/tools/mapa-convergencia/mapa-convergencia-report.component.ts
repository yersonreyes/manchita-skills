import { Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MapaConvergenciaReportVersionDto } from './mapa-convergencia.types';

@Component({
  selector: 'app-mapa-convergencia-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (reports().length === 0) {
      <div class="empty-report">
        <i class="pi pi-sparkles"></i>
        <p>Aún no hay informes generados. Marcá al menos 1 idea como seleccionada y hacé clic en "Analizar".</p>
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
                Ideas seleccionadas — análisis
              </p>
              <div class="report__ideas">
                @for (item of current()!.report.analisisIdeasSeleccionadas; track $index) {
                  <div class="report__idea">
                    <p class="report__idea-titulo">{{ item.idea }}</p>
                    @if (item.potencial) {
                      <p class="report__idea-potencial"><strong>Potencial:</strong> {{ item.potencial }}</p>
                    }
                    @if (item.riesgos) {
                      <p class="report__idea-riesgo"><strong>Riesgos:</strong> {{ item.riesgos }}</p>
                    }
                    @if (item.nextSteps) {
                      <p class="report__idea-next"><strong>Próximos pasos:</strong> {{ item.nextSteps }}</p>
                    }
                  </div>
                }
              </div>
            </div>
          }

          @if (current()!.report.patronesConvergencia.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-filter"></i>
                Patrones de convergencia
              </p>
              <ul class="report__list report__list--patterns">
                @for (item of current()!.report.patronesConvergencia; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          }

          @if (current()!.report.ideasARevisitar.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-history"></i>
                Ideas a revisitar en el futuro
              </p>
              <ul class="report__list">
                @for (item of current()!.report.ideasARevisitar; track $index) {
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
    .version-btn--active { background: #f0f9ff; border-color: #bae6fd; color: #0284c7; font-weight: 600; }

    .report {
      display: flex; flex-direction: column; gap: 0;
      border: 1px solid #bae6fd; border-radius: 12px;
      background: linear-gradient(135deg, #f0f9ff, #fafeff); overflow: hidden;
    }

    .report__summary { padding: 14px 16px; border-bottom: 1px solid #bae6fd; }
    .report__summary p { margin: 0; font-size: 0.875rem; color: #374151; line-height: 1.65; }

    .report__section { padding: 12px 16px; border-bottom: 1px solid #bae6fd; }
    .report__section:last-child { border-bottom: none; }

    .report__label {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.6875rem; font-weight: 700;
      letter-spacing: 0.06em; text-transform: uppercase;
      color: #0284c7; margin: 0 0 8px;
    }
    .report__label .pi { font-size: 0.7rem; }

    .report__ideas { display: flex; flex-direction: column; gap: 8px; }

    .report__idea {
      padding: 10px 12px; border-radius: 8px;
      background: rgba(255,255,255,0.7); border: 1px solid #bae6fd;
    }
    .report__idea-titulo {
      margin: 0 0 6px; font-size: 0.8125rem; font-style: italic;
      color: #374151; line-height: 1.5; border-left: 3px solid #0284c7;
      padding-left: 8px; font-weight: 600;
    }
    .report__idea-potencial { margin: 0 0 4px; font-size: 0.8rem; color: #374151; }
    .report__idea-riesgo { margin: 0 0 4px; font-size: 0.8rem; color: #374151; }
    .report__idea-next { margin: 0; font-size: 0.8rem; color: #374151; }

    .report__list {
      margin: 0; padding-left: 1.25rem;
      display: flex; flex-direction: column; gap: 5px;
    }
    .report__list li { font-size: 0.8125rem; color: #374151; line-height: 1.5; }
    .report__list--patterns li { color: #075985; font-weight: 500; }
    .report__list--alerts li { color: #b45309; }
    .report__list--recommendations li { font-weight: 500; color: #1f2937; }
  `],
})
export class MapaConvergenciaReportComponent {
  reports = input<MapaConvergenciaReportVersionDto[]>([]);
  selectedIndex = signal(0);
  current = computed(() => this.reports()[this.selectedIndex()] ?? null);
}
