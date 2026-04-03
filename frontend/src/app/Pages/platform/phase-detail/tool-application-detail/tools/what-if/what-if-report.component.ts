import { Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { WhatIfReportVersionDto } from './what-if.types';

@Component({
  selector: 'app-what-if-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (reports().length === 0) {
      <div class="empty-report">
        <i class="pi pi-sparkles"></i>
        <p>Aún no hay informes generados. Definí el contexto, agregá al menos 3 preguntas y hacé clic en "Analizar".</p>
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

          @if (current()!.report.preguntasMasDisruptivas.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-bolt"></i>
                Preguntas más disruptivas
              </p>
              <div class="report__preguntas">
                @for (item of current()!.report.preguntasMasDisruptivas; track $index) {
                  <div class="report__pregunta">
                    <p class="report__pregunta-texto">"¿Qué pasaría si {{ item.pregunta }}?"</p>
                    @if (item.tipo) {
                      <span class="report__tipo-badge">{{ item.tipo }}</span>
                    }
                    @if (item.potencialInnovador) {
                      <p class="report__pregunta-potencial">{{ item.potencialInnovador }}</p>
                    }
                    @if (item.implicaciones.length) {
                      <ul class="report__sub-list">
                        @for (imp of item.implicaciones; track $index) {
                          <li>{{ imp }}</li>
                        }
                      </ul>
                    }
                    @if (item.comoPrototipar) {
                      <p class="report__prototipo"><strong>Cómo prototipar:</strong> {{ item.comoPrototipar }}</p>
                    }
                  </div>
                }
              </div>
            </div>
          }

          @if (current()!.report.patronesDePensamiento.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-chart-bar"></i>
                Patrones de pensamiento
              </p>
              <ul class="report__list report__list--patterns">
                @for (item of current()!.report.patronesDePensamiento; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          }

          @if (current()!.report.temasEmergentes.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-objects-column"></i>
                Temas emergentes
              </p>
              <div class="report__temas">
                @for (t of current()!.report.temasEmergentes; track $index) {
                  <span class="report__tema-chip">{{ t }}</span>
                }
              </div>
            </div>
          }

          @if (current()!.report.insightsDerivados.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-lightbulb"></i>
                Insights derivados
              </p>
              <ul class="report__list">
                @for (item of current()!.report.insightsDerivados; track $index) {
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
      border: 1px solid #e9d5ff; border-radius: 12px;
      background: linear-gradient(135deg, #faf5ff, #fffaff); overflow: hidden;
    }

    .report__summary { padding: 14px 16px; border-bottom: 1px solid #e9d5ff; }
    .report__summary p { margin: 0; font-size: 0.875rem; color: #374151; line-height: 1.65; }

    .report__section { padding: 12px 16px; border-bottom: 1px solid #e9d5ff; }
    .report__section:last-child { border-bottom: none; }

    .report__label {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.6875rem; font-weight: 700;
      letter-spacing: 0.06em; text-transform: uppercase;
      color: #7c3aed; margin: 0 0 8px;
    }
    .report__label .pi { font-size: 0.7rem; }

    .report__preguntas { display: flex; flex-direction: column; gap: 8px; }
    .report__pregunta {
      padding: 10px 12px; border-radius: 8px;
      background: rgba(255,255,255,0.75); border: 1px solid #e9d5ff;
    }
    .report__pregunta-texto {
      margin: 0 0 4px; font-size: 0.8125rem; font-weight: 600;
      color: #374151; line-height: 1.4; border-left: 3px solid #7c3aed;
      padding-left: 8px; font-style: italic;
    }
    .report__tipo-badge {
      display: inline-block; padding: 1px 7px; border-radius: 10px;
      background: #ede9fe; color: #5b21b6;
      font-size: 0.68rem; font-weight: 600; text-transform: capitalize;
      margin: 4px 0 6px;
    }
    .report__pregunta-potencial {
      margin: 6px 0 0; font-size: 0.8rem; color: #4b5563; line-height: 1.5;
    }
    .report__prototipo { margin: 6px 0 0; font-size: 0.8rem; color: #374151; }

    .report__sub-list {
      margin: 6px 0 0; padding-left: 1.1rem;
      display: flex; flex-direction: column; gap: 3px;
    }
    .report__sub-list li { font-size: 0.78rem; color: #4b5563; line-height: 1.4; }

    .report__list {
      margin: 0; padding-left: 1.25rem;
      display: flex; flex-direction: column; gap: 5px;
    }
    .report__list li { font-size: 0.8125rem; color: #374151; line-height: 1.5; }
    .report__list--patterns li { color: #6d28d9; font-weight: 500; }
    .report__list--recommendations li { font-weight: 500; color: #1f2937; }

    .report__temas { display: flex; flex-wrap: wrap; gap: 6px; }
    .report__tema-chip {
      padding: 3px 10px; border-radius: 12px;
      background: #ede9fe; color: #5b21b6;
      font-size: 0.78rem; font-weight: 500;
    }
  `],
})
export class WhatIfReportComponent {
  reports = input<WhatIfReportVersionDto[]>([]);
  selectedIndex = signal(0);
  current = computed(() => this.reports()[this.selectedIndex()] ?? null);
}
