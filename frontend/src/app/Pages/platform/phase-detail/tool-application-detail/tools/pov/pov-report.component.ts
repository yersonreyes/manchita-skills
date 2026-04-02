import { Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PovReportVersionDto } from './pov.types';

@Component({
  selector: 'app-pov-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (reports().length === 0) {
      <div class="empty-report">
        <i class="pi pi-sparkles"></i>
        <p>Aún no hay informes generados. Completá al menos 1 POV y hacé clic en "Analizar".</p>
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

          @if (current()!.report.analisisPorPov.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-user"></i>
                Análisis por POV
              </p>
              <div class="report__povs">
                @for (pov of current()!.report.analisisPorPov; track $index) {
                  <div class="report__pov">
                    <p class="report__pov-enunciado">{{ pov.enunciado }}</p>
                    @if (pov.fortaleza) {
                      <p class="report__pov-fortaleza"><strong>Fortaleza:</strong> {{ pov.fortaleza }}</p>
                    }
                    @if (pov.oportunidadMejora) {
                      <p class="report__pov-mejora"><strong>Oportunidad:</strong> {{ pov.oportunidadMejora }}</p>
                    }
                    @if (pov.hmwSugeridos.length) {
                      <div class="report__hmw-list">
                        @for (hmw of pov.hmwSugeridos; track $index) {
                          <span class="report__hmw-chip">{{ hmw }}</span>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }

          @if (current()!.report.povMasAccionable) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-star"></i>
                POV más accionable
              </p>
              <p class="report__highlight">{{ current()!.report.povMasAccionable }}</p>
            </div>
          }

          @if (current()!.report.hmwPrioritarios.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-question-circle"></i>
                How Might We prioritarios
              </p>
              <ul class="report__list report__list--hmw">
                @for (item of current()!.report.hmwPrioritarios; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          }

          @if (current()!.report.tensionesIdentificadas.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-exclamation-triangle"></i>
                Tensiones identificadas
              </p>
              <ul class="report__list">
                @for (item of current()!.report.tensionesIdentificadas; track $index) {
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
    .version-btn--active { background: #f5f3ff; border-color: #c4b5fd; color: #7c3aed; font-weight: 600; }

    .report {
      display: flex; flex-direction: column; gap: 0;
      border: 1px solid #c4b5fd; border-radius: 12px;
      background: linear-gradient(135deg, #f5f3ff, #fefbff); overflow: hidden;
    }

    .report__summary { padding: 14px 16px; border-bottom: 1px solid #c4b5fd; }
    .report__summary p { margin: 0; font-size: 0.875rem; color: #374151; line-height: 1.65; }

    .report__section { padding: 12px 16px; border-bottom: 1px solid #c4b5fd; }
    .report__section:last-child { border-bottom: none; }

    .report__label {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.6875rem; font-weight: 700;
      letter-spacing: 0.06em; text-transform: uppercase;
      color: #7c3aed; margin: 0 0 8px;
    }
    .report__label .pi { font-size: 0.7rem; }

    .report__povs { display: flex; flex-direction: column; gap: 8px; }

    .report__pov {
      padding: 10px 12px; border-radius: 8px;
      background: rgba(255,255,255,0.7); border: 1px solid #c4b5fd;
    }
    .report__pov-enunciado {
      margin: 0 0 6px; font-size: 0.8125rem; font-style: italic;
      color: #374151; line-height: 1.5; border-left: 3px solid #7c3aed;
      padding-left: 8px;
    }
    .report__pov-fortaleza { margin: 0 0 4px; font-size: 0.8rem; color: #374151; }
    .report__pov-mejora { margin: 0 0 6px; font-size: 0.8rem; color: #374151; }

    .report__hmw-list { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
    .report__hmw-chip {
      padding: 3px 8px; border-radius: 20px;
      background: #ede9fe; color: #5b21b6;
      font-size: 0.75rem; font-weight: 500;
    }

    .report__highlight {
      margin: 0; padding: 10px 12px; border-radius: 8px;
      background: rgba(255,255,255,0.8); border: 1px solid #c4b5fd;
      font-size: 0.8125rem; font-style: italic; color: #374151; line-height: 1.5;
    }

    .report__list {
      margin: 0; padding-left: 1.25rem;
      display: flex; flex-direction: column; gap: 5px;
    }
    .report__list li { font-size: 0.8125rem; color: #374151; line-height: 1.5; }
    .report__list--hmw li { color: #5b21b6; font-weight: 600; }
    .report__list--recommendations li { font-weight: 500; color: #1f2937; }
  `],
})
export class PovReportComponent {
  reports = input<PovReportVersionDto[]>([]);
  selectedIndex = signal(0);
  current = computed(() => this.reports()[this.selectedIndex()] ?? null);
}
