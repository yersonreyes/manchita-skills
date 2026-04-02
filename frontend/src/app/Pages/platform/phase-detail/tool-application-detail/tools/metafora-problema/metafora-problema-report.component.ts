import { Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MetaforaProblemaReportVersionDto } from './metafora-problema.types';

@Component({
  selector: 'app-metafora-problema-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (reports().length === 0) {
      <div class="empty-report">
        <i class="pi pi-sparkles"></i>
        <p>Aún no hay informes generados. Completá al menos 1 metáfora con título e insights y hacé clic en "Analizar".</p>
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

          @if (current()!.report.analisisPorMetafora.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-lightbulb"></i>
                Análisis por metáfora
              </p>
              <div class="report__metaforas">
                @for (m of current()!.report.analisisPorMetafora; track $index) {
                  <div class="report__metafora">
                    <p class="report__metafora-titulo">{{ m.titulo }}</p>
                    @if (m.fertilidad) {
                      <p class="report__metafora-fertilidad"><strong>Fertilidad:</strong> {{ m.fertilidad }}</p>
                    }
                    @if (m.limitaciones) {
                      <p class="report__metafora-limitacion"><strong>Limitación:</strong> {{ m.limitaciones }}</p>
                    }
                    @if (m.insightsDerivados.length) {
                      <div class="report__chips">
                        @for (ins of m.insightsDerivados; track $index) {
                          <span class="report__chip">{{ ins }}</span>
                        }
                      </div>
                    }
                    @if (m.aplicacionesPotenciales.length) {
                      <ul class="report__sub-list">
                        @for (ap of m.aplicacionesPotenciales; track $index) {
                          <li>{{ ap }}</li>
                        }
                      </ul>
                    }
                  </div>
                }
              </div>
            </div>
          }

          @if (current()!.report.metaforaRecomendada) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-star"></i>
                Metáfora recomendada
              </p>
              <p class="report__highlight">{{ current()!.report.metaforaRecomendada }}</p>
            </div>
          }

          @if (current()!.report.insightsClave.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-eye"></i>
                Insights clave
              </p>
              <ul class="report__list">
                @for (item of current()!.report.insightsClave; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          }

          @if (current()!.report.implicacionesDeDiseno.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-compass"></i>
                Implicaciones de diseño
              </p>
              <ul class="report__list report__list--implications">
                @for (item of current()!.report.implicacionesDeDiseno; track $index) {
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
    .version-btn--active { background: #fff7ed; border-color: #fed7aa; color: #ea580c; font-weight: 600; }

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
      color: #ea580c; margin: 0 0 8px;
    }
    .report__label .pi { font-size: 0.7rem; }

    .report__metaforas { display: flex; flex-direction: column; gap: 8px; }

    .report__metafora {
      padding: 10px 12px; border-radius: 8px;
      background: rgba(255,255,255,0.7); border: 1px solid #fed7aa;
    }
    .report__metafora-titulo {
      margin: 0 0 6px; font-size: 0.8125rem; font-style: italic;
      color: #374151; line-height: 1.5; border-left: 3px solid #ea580c;
      padding-left: 8px; font-weight: 600;
    }
    .report__metafora-fertilidad { margin: 0 0 4px; font-size: 0.8rem; color: #374151; }
    .report__metafora-limitacion { margin: 0 0 6px; font-size: 0.8rem; color: #374151; }

    .report__chips { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
    .report__chip {
      padding: 3px 8px; border-radius: 20px;
      background: #ffedd5; color: #9a3412;
      font-size: 0.75rem; font-weight: 500;
    }

    .report__sub-list {
      margin: 6px 0 0; padding-left: 1.25rem;
      display: flex; flex-direction: column; gap: 3px;
    }
    .report__sub-list li { font-size: 0.78rem; color: #374151; line-height: 1.5; }

    .report__highlight {
      margin: 0; padding: 10px 12px; border-radius: 8px;
      background: rgba(255,255,255,0.8); border: 1px solid #fed7aa;
      font-size: 0.8125rem; font-style: italic; color: #374151; line-height: 1.5;
    }

    .report__list {
      margin: 0; padding-left: 1.25rem;
      display: flex; flex-direction: column; gap: 5px;
    }
    .report__list li { font-size: 0.8125rem; color: #374151; line-height: 1.5; }
    .report__list--implications li { color: #7c2d12; font-weight: 500; }
    .report__list--recommendations li { font-weight: 500; color: #1f2937; }
  `],
})
export class MetaforaProblemaReportComponent {
  reports = input<MetaforaProblemaReportVersionDto[]>([]);
  selectedIndex = signal(0);
  current = computed(() => this.reports()[this.selectedIndex()] ?? null);
}
