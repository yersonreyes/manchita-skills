import { Component, computed, input, signal } from '@angular/core';
import { TestUsuarioReportVersionDto } from './test-usuario.types';

@Component({
  selector: 'app-test-usuario-report',
  standalone: true,
  template: `
    @if (reports().length === 0) {
      <div class="tur-empty">
        <i class="pi pi-eye"></i>
        <p>Agregá sesiones con tareas observadas y presioná "Analizar" para obtener el análisis del test.</p>
      </div>
    } @else {
      @if (reports().length > 1) {
        <div class="tur-versions">
          @for (r of reports(); track r.version; let i = $index) {
            <button
              class="tur-version-btn"
              [class.tur-version-btn--active]="selectedIndex() === i"
              (click)="selectedIndex.set(i)"
            >
              v{{ r.version }} — {{ formatDate(r.generatedAt) }}
            </button>
          }
        </div>
      }

      @if (current(); as rv) {
        <div class="tur-container">

          <!-- Executive Summary -->
          <div class="tur-section">
            <span class="tur-label">Resumen Ejecutivo</span>
            <p class="tur-summary">{{ rv.report.executiveSummary }}</p>
            <span class="tur-date">{{ formatDateLong(rv.generatedAt) }}</span>
          </div>

          <!-- Tasa de éxito -->
          @if (rv.report.tasaExitoGlobal) {
            <div class="tur-section">
              <span class="tur-label">Tasa de Éxito Global</span>
              <p class="tur-text">{{ rv.report.tasaExitoGlobal }}</p>
            </div>
          }

          <!-- Problemas recurrentes -->
          @if (rv.report.problemasRecurrentes.length) {
            <div class="tur-section">
              <span class="tur-label">Problemas Recurrentes</span>
              <div class="tur-list">
                @for (p of rv.report.problemasRecurrentes; track $index; let i = $index) {
                  <div class="tur-list-item tur-list-item--red">
                    <span class="tur-list-num">{{ i + 1 }}</span>
                    <p>{{ p }}</p>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Hallazgos destacados -->
          @if (rv.report.hallazgosDestacados.length) {
            <div class="tur-section">
              <span class="tur-label">Hallazgos Destacados</span>
              <ul class="tur-ul">
                @for (h of rv.report.hallazgosDestacados; track $index) {
                  <li>{{ h }}</li>
                }
              </ul>
            </div>
          }

          <!-- Citas relevantes -->
          @if (rv.report.citasRelevantes.length) {
            <div class="tur-section">
              <span class="tur-label">Citas Relevantes</span>
              <div class="tur-citas">
                @for (c of rv.report.citasRelevantes; track $index) {
                  <div class="tur-cita">
                    <i class="pi pi-quote-left tur-cita__icon"></i>
                    <p>{{ c }}</p>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Patrones de comportamiento -->
          @if (rv.report.patronesComportamiento.length) {
            <div class="tur-section">
              <span class="tur-label">Patrones de Comportamiento</span>
              <ul class="tur-ul">
                @for (p of rv.report.patronesComportamiento; track $index) {
                  <li>{{ p }}</li>
                }
              </ul>
            </div>
          }

          <!-- Recomendaciones -->
          @if (rv.report.recommendations.length) {
            <div class="tur-section tur-section--last">
              <span class="tur-label">Recomendaciones de Diseño</span>
              <ol class="tur-ol">
                @for (r of rv.report.recommendations; track $index) {
                  <li>{{ r }}</li>
                }
              </ol>
            </div>
          }

        </div>
      }
    }
  `,
  styles: [`
    :host { display: flex; flex-direction: column; gap: 12px; }

    .tur-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 48px 32px;
      text-align: center;
      color: var(--p-text-muted-color);
      font-size: 0.82rem;
    }

    .tur-empty .pi { font-size: 2rem; color: #a7f3d0; }
    .tur-empty p { margin: 0; max-width: 320px; line-height: 1.6; }

    .tur-versions { display: flex; flex-wrap: wrap; gap: 6px; }

    .tur-version-btn {
      padding: 4px 12px;
      border-radius: 20px;
      border: 1px solid var(--p-surface-300);
      background: transparent;
      font-size: 0.72rem;
      font-weight: 500;
      font-family: inherit;
      color: var(--p-text-muted-color);
      cursor: pointer;
      transition: all 0.15s;
    }

    .tur-version-btn:hover { background: var(--p-surface-100); }
    .tur-version-btn--active { background: #ecfdf5; border-color: #a7f3d0; color: #059669; font-weight: 700; }

    .tur-container {
      border: 1px solid #a7f3d0;
      border-radius: 12px;
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae522 100%);
      overflow: hidden;
    }

    .tur-section {
      padding: 16px 20px;
      border-bottom: 1px solid #a7f3d0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .tur-section--last { border-bottom: none; }

    .tur-label {
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #059669;
    }

    .tur-summary {
      font-size: 0.85rem;
      line-height: 1.65;
      color: var(--p-text-color);
      font-weight: 500;
      margin: 0;
    }

    .tur-text {
      font-size: 0.82rem;
      line-height: 1.6;
      color: var(--p-text-secondary-color);
      margin: 0;
    }

    .tur-date { font-size: 0.68rem; color: var(--p-text-muted-color); }

    .tur-list { display: flex; flex-direction: column; gap: 6px; }

    .tur-list-item {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      font-size: 0.8rem;
      line-height: 1.5;
      color: var(--p-text-secondary-color);
    }

    .tur-list-item p { margin: 0; }

    .tur-list-item--red .tur-list-num { background: #fee2e2; color: #b91c1c; }

    .tur-list-num {
      min-width: 20px;
      height: 20px;
      border-radius: 50%;
      font-size: 0.65rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
      font-family: 'Syne', sans-serif;
    }

    .tur-ul {
      margin: 0;
      padding-left: 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .tur-ul li {
      font-size: 0.8rem;
      line-height: 1.5;
      color: var(--p-text-secondary-color);
    }

    .tur-ol {
      margin: 0;
      padding-left: 18px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .tur-ol li {
      font-size: 0.82rem;
      line-height: 1.55;
      color: var(--p-text-secondary-color);
    }

    .tur-citas { display: flex; flex-direction: column; gap: 6px; }

    .tur-cita {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 7px;
      padding: 8px 12px;
    }

    .tur-cita__icon { color: #059669; font-size: 0.68rem; flex-shrink: 0; margin-top: 3px; }
    .tur-cita p { margin: 0; font-size: 0.8rem; line-height: 1.5; color: #065f46; font-style: italic; }
  `],
})
export class TestUsuarioReportComponent {
  reports = input<TestUsuarioReportVersionDto[]>([]);
  selectedIndex = signal(0);

  current = computed<TestUsuarioReportVersionDto | null>(() => {
    const list = this.reports();
    if (!list.length) return null;
    return list[this.selectedIndex()] ?? list[0];
  });

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
  }

  formatDateLong(iso: string): string {
    return new Date(iso).toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'short' });
  }
}
