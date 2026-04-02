import { Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatrizTendenciasReportVersionDto } from './matriz-tendencias.types';

@Component({
  selector: 'app-matriz-tendencias-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (reports().length === 0) {
      <div class="empty-report">
        <i class="pi pi-sparkles"></i>
        <p>Aún no hay informes generados. Registrá al menos 3 tendencias y hacé clic en "Analizar".</p>
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

          @if (current()!.report.analisisPorCuadrante.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-th-large"></i>
                Análisis por cuadrante
              </p>
              <div class="report__cuadrantes">
                @for (c of current()!.report.analisisPorCuadrante; track $index) {
                  <div class="report__cuadrante">
                    <span class="report__cuadrante-name">{{ c.cuadrante }}</span>
                    @if (c.tendencias.length) {
                      <span class="report__cuadrante-tendencias">{{ c.tendencias.join(' · ') }}</span>
                    }
                    <p class="report__cuadrante-estrategia">{{ c.estrategia }}</p>
                  </div>
                }
              </div>
            </div>
          }

          @if (current()!.report.tendenciasClaves.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-star"></i>
                Tendencias clave
              </p>
              <ul class="report__list">
                @for (item of current()!.report.tendenciasClaves; track $index) {
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

          @if (current()!.report.riesgosIdentificados.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-exclamation-triangle"></i>
                Riesgos identificados
              </p>
              <ul class="report__list">
                @for (item of current()!.report.riesgosIdentificados; track $index) {
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
    .version-btn--active { background: #fffbeb; border-color: #fde68a; color: #92400e; font-weight: 600; }

    .report {
      display: flex; flex-direction: column; gap: 0;
      border: 1px solid #fde68a; border-radius: 12px;
      background: linear-gradient(135deg, #fffbeb, #fffdf5); overflow: hidden;
    }

    .report__summary {
      padding: 14px 16px; border-bottom: 1px solid #fde68a;
    }
    .report__summary p { margin: 0; font-size: 0.875rem; color: #374151; line-height: 1.65; }

    .report__section { padding: 12px 16px; border-bottom: 1px solid #fde68a; }
    .report__section:last-child { border-bottom: none; }

    .report__label {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.6875rem; font-weight: 700;
      letter-spacing: 0.06em; text-transform: uppercase;
      color: #92400e; margin: 0 0 8px;
    }
    .report__label .pi { font-size: 0.7rem; }

    .report__cuadrantes { display: flex; flex-direction: column; gap: 8px; }

    .report__cuadrante {
      padding: 8px 10px; border-radius: 8px;
      background: rgba(255,255,255,0.6); border: 1px solid #fde68a;
    }

    .report__cuadrante-name {
      display: block; font-size: 0.72rem; font-weight: 800;
      text-transform: uppercase; letter-spacing: 0.06em; color: #92400e;
      margin-bottom: 2px;
    }

    .report__cuadrante-tendencias {
      display: block; font-size: 0.75rem; color: #6b7280; margin-bottom: 4px;
    }

    .report__cuadrante-estrategia {
      margin: 0; font-size: 0.8125rem; color: #374151; line-height: 1.5;
    }

    .report__list {
      margin: 0; padding-left: 1.25rem;
      display: flex; flex-direction: column; gap: 5px;
    }
    .report__list li { font-size: 0.8125rem; color: #374151; line-height: 1.5; }
    .report__list--recommendations li { font-weight: 500; color: #1f2937; }
  `],
})
export class MatrizTendenciasReportComponent {
  reports = input<MatrizTendenciasReportVersionDto[]>([]);
  selectedIndex = signal(0);
  current = computed(() => this.reports()[this.selectedIndex()] ?? null);
}
