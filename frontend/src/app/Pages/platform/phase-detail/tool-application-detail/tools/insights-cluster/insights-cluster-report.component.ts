import { Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { InsightsClusterReportVersionDto } from './insights-cluster.types';

@Component({
  selector: 'app-insights-cluster-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (reports().length === 0) {
      <div class="empty-report">
        <i class="pi pi-sparkles"></i>
        <p>Aún no hay informes generados. Cargá al menos 2 clusters con insights y hacé clic en "Analizar".</p>
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

          @if (current()!.report.clusterPrioritario) {
            <div class="report__section report__section--highlight">
              <p class="report__label">
                <i class="pi pi-star-fill"></i>
                Cluster prioritario
              </p>
              <p class="report__highlight-text">{{ current()!.report.clusterPrioritario }}</p>
            </div>
          }

          @if (current()!.report.analisisPorCluster.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-objects-column"></i>
                Análisis por cluster
              </p>
              <div class="report__clusters">
                @for (c of current()!.report.analisisPorCluster; track $index) {
                  <div class="report__cluster">
                    <p class="report__cluster-name">{{ c.cluster }}</p>
                    <p class="report__cluster-patron"><strong>Patrón:</strong> {{ c.patron }}</p>
                    <p class="report__cluster-implicacion">{{ c.implicacion }}</p>
                    @if (c.insightsClave.length) {
                      <ul class="report__cluster-insights">
                        @for (ins of c.insightsClave; track $index) {
                          <li>{{ ins }}</li>
                        }
                      </ul>
                    }
                  </div>
                }
              </div>
            </div>
          }

          @if (current()!.report.patronesGlobales.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-search"></i>
                Patrones globales
              </p>
              <ul class="report__list">
                @for (item of current()!.report.patronesGlobales; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          }

          @if (current()!.report.tensionesEntreGrupos.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-exclamation-triangle"></i>
                Tensiones entre grupos
              </p>
              <ul class="report__list">
                @for (item of current()!.report.tensionesEntreGrupos; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          }

          @if (current()!.report.oportunidadesPrioritarias.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-lightbulb"></i>
                Oportunidades prioritarias
              </p>
              <ul class="report__list">
                @for (item of current()!.report.oportunidadesPrioritarias; track $index) {
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
    .version-btn--active { background: #eef2ff; border-color: #c7d2fe; color: #4338ca; font-weight: 600; }

    .report {
      display: flex; flex-direction: column; gap: 0;
      border: 1px solid #c7d2fe; border-radius: 12px;
      background: linear-gradient(135deg, #eef2ff, #f8f9ff); overflow: hidden;
    }

    .report__summary { padding: 14px 16px; border-bottom: 1px solid #c7d2fe; }
    .report__summary p { margin: 0; font-size: 0.875rem; color: #374151; line-height: 1.65; }

    .report__section { padding: 12px 16px; border-bottom: 1px solid #c7d2fe; }
    .report__section:last-child { border-bottom: none; }
    .report__section--highlight { background: rgba(99,102,241,0.05); }

    .report__label {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.6875rem; font-weight: 700;
      letter-spacing: 0.06em; text-transform: uppercase;
      color: #4338ca; margin: 0 0 8px;
    }
    .report__label .pi { font-size: 0.7rem; }

    .report__highlight-text {
      margin: 0; font-size: 0.875rem; font-weight: 600; color: #4338ca; line-height: 1.5;
    }

    .report__clusters { display: flex; flex-direction: column; gap: 8px; }

    .report__cluster {
      padding: 10px 12px; border-radius: 8px;
      background: rgba(255,255,255,0.7); border: 1px solid #c7d2fe;
    }
    .report__cluster-name {
      margin: 0 0 4px; font-size: 0.8rem; font-weight: 800; color: #4338ca;
    }
    .report__cluster-patron {
      margin: 0 0 3px; font-size: 0.8rem; color: #374151; line-height: 1.4;
    }
    .report__cluster-implicacion {
      margin: 0 0 6px; font-size: 0.78rem; color: #6b7280; font-style: italic; line-height: 1.4;
    }
    .report__cluster-insights {
      margin: 0; padding-left: 1rem;
      display: flex; flex-direction: column; gap: 3px;
    }
    .report__cluster-insights li { font-size: 0.775rem; color: #4b5563; line-height: 1.4; }

    .report__list {
      margin: 0; padding-left: 1.25rem;
      display: flex; flex-direction: column; gap: 5px;
    }
    .report__list li { font-size: 0.8125rem; color: #374151; line-height: 1.5; }
    .report__list--recommendations li { font-weight: 500; color: #1f2937; }
  `],
})
export class InsightsClusterReportComponent {
  reports = input<InsightsClusterReportVersionDto[]>([]);
  selectedIndex = signal(0);
  current = computed(() => this.reports()[this.selectedIndex()] ?? null);
}
