import { Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DisenioEscenariosReportVersionDto, TIPO_COLORS, TIPOS_ESCENARIO } from './disenio-escenarios.types';

@Component({
  selector: 'app-disenio-escenarios-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (reports().length === 0) {
      <div class="empty-report">
        <i class="pi pi-sparkles"></i>
        <p>Aún no hay informes generados. Creá al menos 1 escenario con su flujo de pasos.</p>
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

          @if (current()!.report.analisisEscenarios.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-map"></i>
                Análisis por escenario
              </p>
              <div class="report__escenarios">
                @for (item of current()!.report.analisisEscenarios; track $index) {
                  <div class="report__escenario" [style.border-left-color]="tipoColor(item.tipo).border">
                    <div class="report__escenario-header" [style.background]="tipoColor(item.tipo).bg">
                      <span class="report__nombre">{{ item.nombre }}</span>
                      <span class="report__tipo-badge" [style.color]="tipoColor(item.tipo).text">
                        {{ tipoLabel(item.tipo) }}
                      </span>
                    </div>
                    @if (item.emocionDominante) {
                      <p class="report__emocion"><strong>Emoción dominante:</strong> {{ item.emocionDominante }}</p>
                    }
                    @if (item.momentosMagicos.length) {
                      <div class="report__momentos">
                        <span class="report__tag report__tag--green">Momentos mágicos</span>
                        <ul class="report__sub-list">
                          @for (m of item.momentosMagicos; track $index) {
                            <li>{{ m }}</li>
                          }
                        </ul>
                      </div>
                    }
                    @if (item.puntosDeFriccion.length) {
                      <div class="report__friccion">
                        <span class="report__tag report__tag--red">Puntos de fricción</span>
                        <ul class="report__sub-list">
                          @for (f of item.puntosDeFriccion; track $index) {
                            <li>{{ f }}</li>
                          }
                        </ul>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }

          @if (current()!.report.patronesEmocionales.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-heart"></i>
                Patrones emocionales
              </p>
              <ul class="report__list">
                @for (item of current()!.report.patronesEmocionales; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          }

          @if (current()!.report.friccionesComunes.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-exclamation-triangle"></i>
                Fricciones comunes entre escenarios
              </p>
              <ul class="report__list report__list--alerts">
                @for (item of current()!.report.friccionesComunes; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          }

          @if (current()!.report.oportunidadesDiseno.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-lightbulb"></i>
                Oportunidades de diseño
              </p>
              <ul class="report__list report__list--opportunities">
                @for (item of current()!.report.oportunidadesDiseno; track $index) {
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
    .version-btn--active { background: #fffbeb; border-color: #fde68a; color: #d97706; font-weight: 600; }

    .report {
      display: flex; flex-direction: column; gap: 0;
      border: 1px solid #fde68a; border-radius: 12px;
      background: linear-gradient(135deg, #fffbeb, #fff8e1); overflow: hidden;
    }

    .report__summary { padding: 14px 16px; border-bottom: 1px solid #fde68a; }
    .report__summary p { margin: 0; font-size: 0.875rem; color: #374151; line-height: 1.65; }

    .report__section { padding: 12px 16px; border-bottom: 1px solid #fde68a; }
    .report__section:last-child { border-bottom: none; }

    .report__label {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.6875rem; font-weight: 700;
      letter-spacing: 0.06em; text-transform: uppercase;
      color: #d97706; margin: 0 0 8px;
    }
    .report__label .pi { font-size: 0.7rem; }

    .report__escenarios { display: flex; flex-direction: column; gap: 8px; }
    .report__escenario {
      border-radius: 8px; border: 1px solid #fde68a; border-left-width: 4px;
      overflow: hidden;
    }
    .report__escenario-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 12px; flex-wrap: wrap; gap: 4px;
    }
    .report__nombre { font-size: 0.8125rem; font-weight: 700; color: #1f2937; }
    .report__tipo-badge { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }

    .report__emocion { margin: 6px 12px; font-size: 0.8rem; color: #374151; }
    .report__momentos { margin: 6px 12px 8px; }
    .report__friccion { margin: 6px 12px 8px; }

    .report__tag {
      display: inline-block; padding: 1px 6px; border-radius: 4px;
      font-size: 0.67rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.04em; margin-bottom: 4px;
    }
    .report__tag--green { background: #d1fae5; color: #065f46; }
    .report__tag--red { background: #fee2e2; color: #7f1d1d; }

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
    .report__list--opportunities li { color: #065f46; }
    .report__list--recommendations li { font-weight: 500; color: #1f2937; }
  `],
})
export class DisenioEscenariosReportComponent {
  reports = input<DisenioEscenariosReportVersionDto[]>([]);
  selectedIndex = signal(0);
  current = computed(() => this.reports()[this.selectedIndex()] ?? null);

  tipoColor(tipo: string) {
    return TIPO_COLORS[tipo] ?? { bg: '#f9fafb', text: '#374151', border: '#e5e7eb' };
  }

  tipoLabel(tipo: string): string {
    return TIPOS_ESCENARIO.find(t => t.value === tipo)?.label ?? tipo;
  }
}
