import { Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Matriz2x2ReportVersionDto } from './matriz-2x2.types';

@Component({
  selector: 'app-matriz-2x2-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (reports().length === 0) {
      <div class="empty-report">
        <i class="pi pi-sparkles"></i>
        <p>Aún no hay informes generados. Cargá al menos 3 ítems y hacé clic en "Analizar".</p>
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

          @if (current()!.report.distribucionPorCuadrante.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-th-large"></i>
                Distribución por cuadrante
              </p>
              <div class="report__cuadrantes">
                @for (c of current()!.report.distribucionPorCuadrante; track $index) {
                  <div class="report__cuadrante">
                    <p class="report__cuadrante-nombre">{{ c.cuadrante }}</p>
                    <p class="report__cuadrante-interp">{{ c.interpretacion }}</p>
                    @if (c.items.length) {
                      <ul class="report__cuadrante-items">
                        @for (item of c.items; track $index) {
                          <li>{{ item }}</li>
                        }
                      </ul>
                    }
                  </div>
                }
              </div>
            </div>
          }

          @if (current()!.report.itemsPrioritarios.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-star"></i>
                Ítems prioritarios
              </p>
              <ul class="report__list report__list--priority">
                @for (item of current()!.report.itemsPrioritarios; track $index) {
                  <li>
                    <strong>{{ item.nombre }}</strong>
                    @if (item.justificacion) {
                      <span> — {{ item.justificacion }}</span>
                    }
                  </li>
                }
              </ul>
            </div>
          }

          @if (current()!.report.itemsAEvitar.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-ban"></i>
                Ítems a evitar o postergar
              </p>
              <ul class="report__list">
                @for (item of current()!.report.itemsAEvitar; track $index) {
                  <li>
                    <strong>{{ item.nombre }}</strong>
                    @if (item.justificacion) {
                      <span> — {{ item.justificacion }}</span>
                    }
                  </li>
                }
              </ul>
            </div>
          }

          @if (current()!.report.patronesIdentificados.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-search"></i>
                Patrones identificados
              </p>
              <ul class="report__list">
                @for (item of current()!.report.patronesIdentificados; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          }

          @if (current()!.report.oportunidades.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-lightbulb"></i>
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
    .version-btn--active { background: #f0fdf4; border-color: #bbf7d0; color: #15803d; font-weight: 600; }

    .report {
      display: flex; flex-direction: column; gap: 0;
      border: 1px solid #bbf7d0; border-radius: 12px;
      background: linear-gradient(135deg, #f0fdf4, #f8fffc); overflow: hidden;
    }

    .report__summary { padding: 14px 16px; border-bottom: 1px solid #bbf7d0; }
    .report__summary p { margin: 0; font-size: 0.875rem; color: #374151; line-height: 1.65; }

    .report__section { padding: 12px 16px; border-bottom: 1px solid #bbf7d0; }
    .report__section:last-child { border-bottom: none; }

    .report__label {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.6875rem; font-weight: 700;
      letter-spacing: 0.06em; text-transform: uppercase;
      color: #15803d; margin: 0 0 8px;
    }
    .report__label .pi { font-size: 0.7rem; }

    .report__cuadrantes { display: flex; flex-direction: column; gap: 6px; }

    .report__cuadrante {
      padding: 8px 10px; border-radius: 8px;
      background: rgba(255,255,255,0.7); border: 1px solid #bbf7d0;
    }
    .report__cuadrante-nombre {
      margin: 0 0 3px; font-size: 0.8rem; font-weight: 700; color: #15803d;
    }
    .report__cuadrante-interp {
      margin: 0 0 5px; font-size: 0.78rem; color: #6b7280; font-style: italic;
    }
    .report__cuadrante-items {
      margin: 0; padding-left: 1rem;
      display: flex; flex-direction: column; gap: 2px;
    }
    .report__cuadrante-items li { font-size: 0.775rem; color: #374151; }

    .report__list {
      margin: 0; padding-left: 1.25rem;
      display: flex; flex-direction: column; gap: 5px;
    }
    .report__list li { font-size: 0.8125rem; color: #374151; line-height: 1.5; }
    .report__list--priority li { color: #15803d; }
    .report__list--recommendations li { font-weight: 500; color: #1f2937; }
  `],
})
export class Matriz2x2ReportComponent {
  reports = input<Matriz2x2ReportVersionDto[]>([]);
  selectedIndex = signal(0);
  current = computed(() => this.reports()[this.selectedIndex()] ?? null);
}
