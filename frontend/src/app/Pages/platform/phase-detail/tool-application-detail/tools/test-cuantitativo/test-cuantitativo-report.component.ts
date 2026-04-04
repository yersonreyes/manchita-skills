import { Component, computed, input, signal } from '@angular/core';
import { TestCuantitativoReportVersionDto } from './test-cuantitativo.types';

@Component({
  selector: 'app-test-cuantitativo-report',
  standalone: true,
  template: `
    @if (reports().length === 0) {
      <div class="tcr-empty">
        <i class="pi pi-chart-bar"></i>
        <p>Registrá al menos 1 métrica y presioná "Analizar" para obtener el análisis del test.</p>
      </div>
    } @else {
      <!-- Selector de versiones -->
      @if (reports().length > 1) {
        <div class="tcr-versions">
          @for (r of reports(); track r.version; let i = $index) {
            <button
              class="tcr-version-btn"
              [class.tcr-version-btn--active]="selectedIndex() === i"
              (click)="selectedIndex.set(i)"
            >
              v{{ r.version }} — {{ formatDate(r.generatedAt) }}
            </button>
          }
        </div>
      }

      @if (current(); as rv) {
        <div class="tcr-container">

          <!-- Executive Summary -->
          <div class="tcr-section">
            <span class="tcr-label">Resumen Ejecutivo</span>
            <p class="tcr-summary">{{ rv.report.executiveSummary }}</p>
            <span class="tcr-date">{{ formatDateLong(rv.generatedAt) }}</span>
          </div>

          <!-- Score global -->
          @if (rv.report.scoreGlobal) {
            <div class="tcr-section">
              <span class="tcr-label">Interpretación de Scores</span>
              <p class="tcr-text">{{ rv.report.scoreGlobal }}</p>
            </div>
          }

          <!-- Análisis por tarea -->
          @if (rv.report.tareasAnalisis.length) {
            <div class="tcr-section">
              <span class="tcr-label">Análisis por Tarea</span>
              <div class="tcr-list">
                @for (t of rv.report.tareasAnalisis; track $index; let i = $index) {
                  <div class="tcr-list-item tcr-list-item--blue">
                    <span class="tcr-list-num">{{ i + 1 }}</span>
                    <p>{{ t }}</p>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Patrones -->
          @if (rv.report.patrones.length) {
            <div class="tcr-section">
              <span class="tcr-label">Patrones Identificados</span>
              <ul class="tcr-ul">
                @for (p of rv.report.patrones; track $index) {
                  <li>{{ p }}</li>
                }
              </ul>
            </div>
          }

          <!-- Fortalezas y debilidades -->
          <div class="tcr-section">
            <div class="tcr-two-col">
              @if (rv.report.fortalezas.length) {
                <div class="tcr-col tcr-col--green">
                  <span class="tcr-col-title">✅ Fortalezas</span>
                  <ul class="tcr-ul">
                    @for (f of rv.report.fortalezas; track $index) {
                      <li>{{ f }}</li>
                    }
                  </ul>
                </div>
              }
              @if (rv.report.debilidades.length) {
                <div class="tcr-col tcr-col--amber">
                  <span class="tcr-col-title">⚠️ Debilidades</span>
                  <ul class="tcr-ul">
                    @for (d of rv.report.debilidades; track $index) {
                      <li>{{ d }}</li>
                    }
                  </ul>
                </div>
              }
            </div>
          </div>

          <!-- Recomendaciones -->
          @if (rv.report.recommendations.length) {
            <div class="tcr-section tcr-section--last">
              <span class="tcr-label">Recomendaciones</span>
              <ol class="tcr-ol">
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

    .tcr-empty {
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

    .tcr-empty .pi { font-size: 2rem; color: #bfdbfe; }
    .tcr-empty p { margin: 0; max-width: 320px; line-height: 1.6; }

    .tcr-versions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .tcr-version-btn {
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

    .tcr-version-btn:hover { background: var(--p-surface-100); }
    .tcr-version-btn--active { background: #eff6ff; border-color: #bfdbfe; color: #2563eb; font-weight: 700; }

    .tcr-container {
      border: 1px solid #bfdbfe;
      border-radius: 12px;
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe22 100%);
      overflow: hidden;
    }

    .tcr-section {
      padding: 16px 20px;
      border-bottom: 1px solid #bfdbfe;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .tcr-section--last { border-bottom: none; }

    .tcr-label {
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #2563eb;
    }

    .tcr-summary {
      font-size: 0.85rem;
      line-height: 1.65;
      color: var(--p-text-color);
      font-weight: 500;
      margin: 0;
    }

    .tcr-text {
      font-size: 0.82rem;
      line-height: 1.6;
      color: var(--p-text-secondary-color);
      margin: 0;
    }

    .tcr-date {
      font-size: 0.68rem;
      color: var(--p-text-muted-color);
    }

    .tcr-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .tcr-list-item {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      font-size: 0.8rem;
      line-height: 1.5;
      color: var(--p-text-secondary-color);
    }

    .tcr-list-item--blue .tcr-list-num {
      background: #dbeafe;
      color: #2563eb;
    }

    .tcr-list-num {
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

    .tcr-list-item p { margin: 0; }

    .tcr-ul {
      margin: 0;
      padding-left: 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .tcr-ul li {
      font-size: 0.8rem;
      line-height: 1.5;
      color: var(--p-text-secondary-color);
    }

    .tcr-ol {
      margin: 0;
      padding-left: 18px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .tcr-ol li {
      font-size: 0.82rem;
      line-height: 1.55;
      color: var(--p-text-secondary-color);
    }

    .tcr-two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .tcr-col {
      border-radius: 8px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .tcr-col--green { background: #f0fdf4; border: 1px solid #bbf7d0; }
    .tcr-col--amber { background: #fffbeb; border: 1px solid #fde68a; }

    .tcr-col-title {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--p-text-secondary-color);
    }
  `],
})
export class TestCuantitativoReportComponent {
  reports = input<TestCuantitativoReportVersionDto[]>([]);
  selectedIndex = signal(0);

  current = computed<TestCuantitativoReportVersionDto | null>(() => {
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
