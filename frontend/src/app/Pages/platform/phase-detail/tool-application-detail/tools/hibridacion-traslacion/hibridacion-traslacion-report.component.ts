import { Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HibridacionTraslacionReportVersionDto } from './hibridacion-traslacion.types';

@Component({
  selector: 'app-hibridacion-traslacion-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (reports().length === 0) {
      <div class="empty-report">
        <i class="pi pi-sparkles"></i>
        <p>Aún no hay informes generados. Definí el problema, al menos 1 traslación y la idea resultante.</p>
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

          @if (current()!.report.evaluacionTraslacion) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-arrow-right-arrow-left"></i>
                Evaluación de la traslación
              </p>
              <p class="report__text">{{ current()!.report.evaluacionTraslacion }}</p>
            </div>
          }

          @if (current()!.report.analisisTraslaciones.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-search"></i>
                Análisis por traslación
              </p>
              <div class="report__traslaciones">
                @for (item of current()!.report.analisisTraslaciones; track $index) {
                  <div class="report__traslacion">
                    <div class="report__traslacion-header">
                      <span class="report__dominio">{{ item.dominioOrigen }}</span>
                      <span class="report__mecanismo">{{ item.mecanismo }}</span>
                    </div>
                    @if (item.potencialDeTraslacion) {
                      <p class="report__traslacion-texto">{{ item.potencialDeTraslacion }}</p>
                    }
                    @if (item.desafiosAdaptacion.length) {
                      <div class="report__desafios">
                        <span class="report__tag report__tag--yellow">Desafíos de adaptación</span>
                        <ul class="report__sub-list">
                          @for (d of item.desafiosAdaptacion; track $index) {
                            <li>{{ d }}</li>
                          }
                        </ul>
                      </div>
                    }
                    @if (item.impactoEsperado) {
                      <p class="report__impacto"><strong>Impacto esperado:</strong> {{ item.impactoEsperado }}</p>
                    }
                  </div>
                }
              </div>
            </div>
          }

          @if (current()!.report.mecanismoClavePotenciado) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-key"></i>
                Mecanismo clave potenciado
              </p>
              <p class="report__text">{{ current()!.report.mecanismoClavePotenciado }}</p>
            </div>
          }

          @if (current()!.report.diferenciacionCompetitiva) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-bolt"></i>
                Diferenciación competitiva
              </p>
              <p class="report__text">{{ current()!.report.diferenciacionCompetitiva }}</p>
            </div>
          }

          @if (current()!.report.riesgosContextuales.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-exclamation-triangle"></i>
                Riesgos contextuales
              </p>
              <ul class="report__list report__list--alerts">
                @for (item of current()!.report.riesgosContextuales; track $index) {
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
    .version-btn--active { background: #ecfeff; border-color: #a5f3fc; color: #0891b2; font-weight: 600; }

    .report {
      display: flex; flex-direction: column; gap: 0;
      border: 1px solid #a5f3fc; border-radius: 12px;
      background: linear-gradient(135deg, #ecfeff, #f0fdff); overflow: hidden;
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

    .report__text { margin: 0; font-size: 0.8125rem; color: #374151; line-height: 1.6; }

    .report__traslaciones { display: flex; flex-direction: column; gap: 8px; }
    .report__traslacion {
      padding: 10px 12px; border-radius: 8px;
      background: rgba(255,255,255,0.8); border: 1px solid #a5f3fc;
    }
    .report__traslacion-header { display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
    .report__dominio {
      font-size: 0.8125rem; font-weight: 700; color: #0e7490;
      border-left: 3px solid #0891b2; padding-left: 8px;
    }
    .report__mecanismo {
      font-size: 0.75rem; color: #6b7280; font-style: italic;
    }
    .report__traslacion-texto { margin: 0 0 6px; font-size: 0.8rem; color: #374151; line-height: 1.5; }
    .report__impacto { margin: 6px 0 0; font-size: 0.8rem; color: #374151; }

    .report__desafios { margin: 6px 0 0; }
    .report__tag {
      display: inline-block; padding: 1px 6px; border-radius: 4px;
      font-size: 0.67rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.04em; margin-bottom: 4px;
    }
    .report__tag--yellow { background: #fef9c3; color: #713f12; }

    .report__sub-list {
      margin: 3px 0 0; padding-left: 1.1rem;
      display: flex; flex-direction: column; gap: 3px;
    }
    .report__sub-list li { font-size: 0.78rem; color: #4b5563; line-height: 1.4; }

    .report__list {
      margin: 0; padding-left: 1.25rem;
      display: flex; flex-direction: column; gap: 5px;
    }
    .report__list li { font-size: 0.8125rem; color: #374151; line-height: 1.5; }
    .report__list--alerts li { color: #b45309; }
    .report__list--recommendations li { font-weight: 500; color: #1f2937; }
  `],
})
export class HibridacionTraslacionReportComponent {
  reports = input<HibridacionTraslacionReportVersionDto[]>([]);
  selectedIndex = signal(0);
  current = computed(() => this.reports()[this.selectedIndex()] ?? null);
}
