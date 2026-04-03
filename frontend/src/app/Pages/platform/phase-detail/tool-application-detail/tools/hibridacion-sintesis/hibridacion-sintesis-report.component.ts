import { Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HibridacionSintesisReportVersionDto } from './hibridacion-sintesis.types';

@Component({
  selector: 'app-hibridacion-sintesis-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (reports().length === 0) {
      <div class="empty-report">
        <i class="pi pi-sparkles"></i>
        <p>Aún no hay informes generados. Definí al menos 2 conceptos base, el nivel de síntesis y la idea sintetizada.</p>
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

          @if (current()!.report.evaluacionNivel) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-chart-bar"></i>
                Evaluación del nivel de síntesis
              </p>
              <p class="report__text">{{ current()!.report.evaluacionNivel }}</p>
            </div>
          }

          @if (current()!.report.analisisConceptos.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-search"></i>
                Análisis de conceptos
              </p>
              <div class="report__conceptos">
                @for (item of current()!.report.analisisConceptos; track $index) {
                  <div class="report__concepto">
                    <div class="report__concepto-header">
                      <span class="report__nombre">{{ item.nombre }}</span>
                      @if (item.esencia) {
                        <span class="report__esencia">{{ item.esencia }}</span>
                      }
                    </div>
                    @if (item.contribucionReal) {
                      <p class="report__contribucion"><strong>Contribución real:</strong> {{ item.contribucionReal }}</p>
                    }
                    @if (item.tensionCreativa) {
                      <div class="report__tension">
                        <span class="report__tag report__tag--indigo">Tensión creativa</span>
                        <p class="report__tension-texto">{{ item.tensionCreativa }}</p>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }

          @if (current()!.report.puntosConexionClave.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-link"></i>
                Puntos de conexión clave
              </p>
              <ul class="report__list">
                @for (item of current()!.report.puntosConexionClave; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          }

          @if (current()!.report.nuevaEsencia) {
            <div class="report__section report__section--highlight">
              <p class="report__label">
                <i class="pi pi-star"></i>
                Nueva esencia (lo que la síntesis crea)
              </p>
              <p class="report__text">{{ current()!.report.nuevaEsencia }}</p>
            </div>
          }

          @if (current()!.report.diferenciacionParadigmatica) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-bolt"></i>
                Diferenciación paradigmática
              </p>
              <p class="report__text">{{ current()!.report.diferenciacionParadigmatica }}</p>
            </div>
          }

          @if (current()!.report.riesgos.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-exclamation-triangle"></i>
                Riesgos de la síntesis
              </p>
              <ul class="report__list report__list--alerts">
                @for (item of current()!.report.riesgos; track $index) {
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
    .version-btn--active { background: #eef2ff; border-color: #c7d2fe; color: #4f46e5; font-weight: 600; }

    .report {
      display: flex; flex-direction: column; gap: 0;
      border: 1px solid #c7d2fe; border-radius: 12px;
      background: linear-gradient(135deg, #eef2ff, #f5f3ff); overflow: hidden;
    }

    .report__summary { padding: 14px 16px; border-bottom: 1px solid #c7d2fe; }
    .report__summary p { margin: 0; font-size: 0.875rem; color: #374151; line-height: 1.65; }

    .report__section { padding: 12px 16px; border-bottom: 1px solid #c7d2fe; }
    .report__section:last-child { border-bottom: none; }
    .report__section--highlight { background: rgba(99,102,241,0.06); }

    .report__label {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.6875rem; font-weight: 700;
      letter-spacing: 0.06em; text-transform: uppercase;
      color: #4f46e5; margin: 0 0 8px;
    }
    .report__label .pi { font-size: 0.7rem; }

    .report__text { margin: 0; font-size: 0.8125rem; color: #374151; line-height: 1.6; }

    .report__conceptos { display: flex; flex-direction: column; gap: 8px; }
    .report__concepto {
      padding: 10px 12px; border-radius: 8px;
      background: rgba(255,255,255,0.8); border: 1px solid #c7d2fe;
    }
    .report__concepto-header { display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
    .report__nombre {
      font-size: 0.8125rem; font-weight: 700; color: #4338ca;
      border-left: 3px solid #4f46e5; padding-left: 8px;
    }
    .report__esencia { font-size: 0.75rem; color: #6b7280; font-style: italic; }
    .report__contribucion { margin: 0 0 6px; font-size: 0.8rem; color: #374151; line-height: 1.5; }

    .report__tension { margin: 6px 0 0; }
    .report__tag {
      display: inline-block; padding: 1px 6px; border-radius: 4px;
      font-size: 0.67rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.04em; margin-bottom: 4px;
    }
    .report__tag--indigo { background: #e0e7ff; color: #3730a3; }
    .report__tension-texto { margin: 4px 0 0; font-size: 0.78rem; color: #4b5563; line-height: 1.4; }

    .report__list {
      margin: 0; padding-left: 1.25rem;
      display: flex; flex-direction: column; gap: 5px;
    }
    .report__list li { font-size: 0.8125rem; color: #374151; line-height: 1.5; }
    .report__list--alerts li { color: #b45309; }
    .report__list--recommendations li { font-weight: 500; color: #1f2937; }
  `],
})
export class HibridacionSintesisReportComponent {
  reports = input<HibridacionSintesisReportVersionDto[]>([]);
  selectedIndex = signal(0);
  current = computed(() => this.reports()[this.selectedIndex()] ?? null);
}
