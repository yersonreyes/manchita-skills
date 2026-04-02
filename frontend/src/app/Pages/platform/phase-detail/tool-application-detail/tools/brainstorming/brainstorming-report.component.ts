import { Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BrainstormingReportVersionDto } from './brainstorming.types';

@Component({
  selector: 'app-brainstorming-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (reports().length === 0) {
      <div class="empty-report">
        <i class="pi pi-sparkles"></i>
        <p>Aún no hay informes generados. Cargá el reto y al menos 3 ideas, luego hacé clic en "Analizar".</p>
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

          @if (current()!.report.calidadSesion) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-star"></i>
                Calidad de la sesión
              </p>
              <p class="report__text">{{ current()!.report.calidadSesion }}</p>
            </div>
          }

          @if (current()!.report.analisisTopIdeas.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-trophy"></i>
                Análisis de top ideas
              </p>
              <div class="report__ideas">
                @for (item of current()!.report.analisisTopIdeas; track $index) {
                  <div class="report__idea">
                    <p class="report__idea-titulo">{{ item.idea }}</p>
                    @if (item.potencial) {
                      <p class="report__idea-row"><strong>Potencial:</strong> {{ item.potencial }}</p>
                    }
                    @if (item.riesgos) {
                      <p class="report__idea-row"><strong>Riesgos:</strong> {{ item.riesgos }}</p>
                    }
                    @if (item.siguientesPasos) {
                      <p class="report__idea-row"><strong>Siguientes pasos:</strong> {{ item.siguientesPasos }}</p>
                    }
                  </div>
                }
              </div>
            </div>
          }

          @if (current()!.report.ideasInnovadoras.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-bolt"></i>
                Ideas más innovadoras
              </p>
              <div class="report__chips">
                @for (item of current()!.report.ideasInnovadoras; track $index) {
                  <span class="report__chip">{{ item }}</span>
                }
              </div>
            </div>
          }

          @if (current()!.report.clustersDestacados.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-objects-column"></i>
                Clusters destacados
              </p>
              <ul class="report__list">
                @for (item of current()!.report.clustersDestacados; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          }

          @if (current()!.report.ideasAExplorar.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-search"></i>
                Ideas a explorar más
              </p>
              <ul class="report__list report__list--explore">
                @for (item of current()!.report.ideasAExplorar; track $index) {
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
    .version-btn--active { background: #f0fdf4; border-color: #bbf7d0; color: #16a34a; font-weight: 600; }

    .report {
      display: flex; flex-direction: column; gap: 0;
      border: 1px solid #bbf7d0; border-radius: 12px;
      background: linear-gradient(135deg, #f0fdf4, #fafffe); overflow: hidden;
    }

    .report__summary { padding: 14px 16px; border-bottom: 1px solid #bbf7d0; }
    .report__summary p { margin: 0; font-size: 0.875rem; color: #374151; line-height: 1.65; }

    .report__section { padding: 12px 16px; border-bottom: 1px solid #bbf7d0; }
    .report__section:last-child { border-bottom: none; }

    .report__label {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.6875rem; font-weight: 700;
      letter-spacing: 0.06em; text-transform: uppercase;
      color: #16a34a; margin: 0 0 8px;
    }
    .report__label .pi { font-size: 0.7rem; }

    .report__text { margin: 0; font-size: 0.8125rem; color: #374151; line-height: 1.6; }

    .report__ideas { display: flex; flex-direction: column; gap: 8px; }
    .report__idea {
      padding: 10px 12px; border-radius: 8px;
      background: rgba(255,255,255,0.7); border: 1px solid #bbf7d0;
    }
    .report__idea-titulo {
      margin: 0 0 6px; font-size: 0.8125rem; font-weight: 600;
      color: #374151; line-height: 1.5; border-left: 3px solid #16a34a;
      padding-left: 8px;
    }
    .report__idea-row { margin: 0 0 4px; font-size: 0.8rem; color: #374151; }
    .report__idea-row:last-child { margin-bottom: 0; }

    .report__chips { display: flex; flex-wrap: wrap; gap: 6px; }
    .report__chip {
      padding: 4px 10px; border-radius: 20px;
      background: #dcfce7; color: #166534;
      font-size: 0.78rem; font-weight: 500;
    }

    .report__list {
      margin: 0; padding-left: 1.25rem;
      display: flex; flex-direction: column; gap: 5px;
    }
    .report__list li { font-size: 0.8125rem; color: #374151; line-height: 1.5; }
    .report__list--explore li { color: #15803d; font-style: italic; }
    .report__list--recommendations li { font-weight: 500; color: #1f2937; }
  `],
})
export class BrainstormingReportComponent {
  reports = input<BrainstormingReportVersionDto[]>([]);
  selectedIndex = signal(0);
  current = computed(() => this.reports()[this.selectedIndex()] ?? null);
}
