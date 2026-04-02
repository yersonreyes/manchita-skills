import { Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MapaActivoReportVersionDto } from './mapa-activo-experiencia.types';

@Component({
  selector: 'app-mapa-activo-experiencia-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (reports().length === 0) {
      <div class="empty-report">
        <i class="pi pi-sparkles"></i>
        <p>Aún no hay informes generados. Completá al menos 2 etapas y hacé clic en "Analizar".</p>
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

          @if (current()!.report.analisisPorEtapa.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-map"></i>
                Análisis por etapa
              </p>
              <div class="report__etapas">
                @for (e of current()!.report.analisisPorEtapa; track $index) {
                  <div class="report__etapa">
                    <p class="report__etapa-nombre">{{ e.etapa }}</p>
                    @if (e.momentoClave) {
                      <p class="report__etapa-momento"><strong>Momento clave:</strong> {{ e.momentoClave }}</p>
                    }
                    @if (e.oportunidadPrioritaria) {
                      <p class="report__etapa-oportunidad"><strong>Oportunidad:</strong> {{ e.oportunidadPrioritaria }}</p>
                    }
                    @if (e.implicacion) {
                      <p class="report__etapa-implicacion">{{ e.implicacion }}</p>
                    }
                  </div>
                }
              </div>
            </div>
          }

          @if (current()!.report.momentosCriticos.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-bolt"></i>
                Momentos críticos
              </p>
              <ul class="report__list report__list--critical">
                @for (item of current()!.report.momentosCriticos; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          }

          @if (current()!.report.touchpointsPrioritarios.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-map-marker"></i>
                Touchpoints prioritarios
              </p>
              <ul class="report__list">
                @for (item of current()!.report.touchpointsPrioritarios; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          }

          @if (current()!.report.mapaDeOportunidades.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-lightbulb"></i>
                Mapa de oportunidades
              </p>
              <ul class="report__list">
                @for (item of current()!.report.mapaDeOportunidades; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          }

          @if (current()!.report.patronesDeComportamiento.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-search"></i>
                Patrones de comportamiento
              </p>
              <ul class="report__list">
                @for (item of current()!.report.patronesDeComportamiento; track $index) {
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
    .version-btn--active { background: #fff1f2; border-color: #fecdd3; color: #be185d; font-weight: 600; }

    .report {
      display: flex; flex-direction: column; gap: 0;
      border: 1px solid #fecdd3; border-radius: 12px;
      background: linear-gradient(135deg, #fff1f2, #fffbfc); overflow: hidden;
    }

    .report__summary { padding: 14px 16px; border-bottom: 1px solid #fecdd3; }
    .report__summary p { margin: 0; font-size: 0.875rem; color: #374151; line-height: 1.65; }

    .report__section { padding: 12px 16px; border-bottom: 1px solid #fecdd3; }
    .report__section:last-child { border-bottom: none; }

    .report__label {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.6875rem; font-weight: 700;
      letter-spacing: 0.06em; text-transform: uppercase;
      color: #be185d; margin: 0 0 8px;
    }
    .report__label .pi { font-size: 0.7rem; }

    .report__etapas { display: flex; flex-direction: column; gap: 6px; }

    .report__etapa {
      padding: 8px 10px; border-radius: 8px;
      background: rgba(255,255,255,0.7); border: 1px solid #fecdd3;
    }
    .report__etapa-nombre {
      margin: 0 0 4px; font-size: 0.8rem; font-weight: 800; color: #be185d;
    }
    .report__etapa-momento {
      margin: 0 0 3px; font-size: 0.8rem; color: #374151;
    }
    .report__etapa-oportunidad {
      margin: 0 0 3px; font-size: 0.8rem; color: #374151;
    }
    .report__etapa-implicacion {
      margin: 0; font-size: 0.78rem; color: #6b7280; font-style: italic; line-height: 1.4;
    }

    .report__list {
      margin: 0; padding-left: 1.25rem;
      display: flex; flex-direction: column; gap: 5px;
    }
    .report__list li { font-size: 0.8125rem; color: #374151; line-height: 1.5; }
    .report__list--critical li { color: #be185d; font-weight: 500; }
    .report__list--recommendations li { font-weight: 500; color: #1f2937; }
  `],
})
export class MapaActivoExperienciaReportComponent {
  reports = input<MapaActivoReportVersionDto[]>([]);
  selectedIndex = signal(0);
  current = computed(() => this.reports()[this.selectedIndex()] ?? null);
}
