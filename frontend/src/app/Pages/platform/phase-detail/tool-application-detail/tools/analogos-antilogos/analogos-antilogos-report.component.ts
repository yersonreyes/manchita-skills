import { Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  AnalogosAntilogosReportVersionDto,
} from './analogos-antilogos.types';

@Component({
  selector: 'app-analogos-antilogos-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (reports().length === 0) {
      <div class="aar__empty">
        <i class="pi pi-sparkles"></i>
        <p>Aún no hay informes generados. Agregá análogos o antilogos y hacé clic en "Analizar".</p>
      </div>
    } @else {
      <!-- Selector de versión -->
      @if (reports().length > 1) {
        <div class="aar__version-bar">
          @for (r of reports(); track r.version; let i = $index) {
            <button
              class="aar__version-btn"
              [class.aar__version-btn--active]="selectedIndex() === i"
              (click)="selectedIndex.set(i)"
            >
              v{{ r.version }} — {{ r.generatedAt | date:'dd/MM/yy HH:mm' }}
            </button>
          }
        </div>
      }

      @if (current()) {
        <div class="aar__report">

          <!-- Executive summary -->
          <div class="aar__summary">
            <p>{{ current()!.report.executiveSummary }}</p>
          </div>

          <div class="aar__columns">

            <!-- Análogo insights -->
            <div class="aar__section aar__section--analogo">
              <h4 class="aar__section-title">
                <i class="pi pi-check-circle"></i>
                Insights de análogos
              </h4>
              @for (insight of current()!.report.analogoInsights; track $index) {
                <div class="aar__insight-card aar__insight-card--analogo">
                  <span class="aar__insight-industry">{{ insight.industria }}</span>
                  <p class="aar__insight-principle">{{ insight.principio }}</p>
                  <p class="aar__insight-potential">
                    <i class="pi pi-arrow-right"></i> {{ insight.potencial }}
                  </p>
                </div>
              }
              @if (!current()!.report.analogoInsights.length) {
                <p class="aar__no-items">Sin análogos registrados</p>
              }
            </div>

            <!-- Antilogo lessons -->
            <div class="aar__section aar__section--antilogo">
              <h4 class="aar__section-title">
                <i class="pi pi-times-circle"></i>
                Lecciones de antilogos
              </h4>
              @for (lesson of current()!.report.antilogoLessons; track $index) {
                <div class="aar__insight-card aar__insight-card--antilogo">
                  <span class="aar__insight-industry">{{ lesson.industria }}</span>
                  <p class="aar__insight-principle">{{ lesson.leccion }}</p>
                  <p class="aar__insight-potential">
                    <i class="pi pi-shield"></i> {{ lesson.safeguard }}
                  </p>
                </div>
              }
              @if (!current()!.report.antilogoLessons.length) {
                <p class="aar__no-items">Sin antilogos registrados</p>
              }
            </div>

          </div>

          <!-- Synthesis principles -->
          @if (current()!.report.synthesisPrinciples.length) {
            <div class="aar__synthesis">
              <h4 class="aar__section-title">
                <i class="pi pi-link"></i>
                Principios de síntesis
              </h4>
              <ul class="aar__synthesis-list">
                @for (p of current()!.report.synthesisPrinciples; track $index) {
                  <li>{{ p }}</li>
                }
              </ul>
            </div>
          }

          <!-- Recommendations -->
          <div class="aar__recommendations">
            <h4 class="aar__section-title">
              <i class="pi pi-list-check"></i>
              Recomendaciones
            </h4>
            <ol class="aar__rec-list">
              @for (rec of current()!.report.recommendations; track $index) {
                <li>{{ rec }}</li>
              }
            </ol>
          </div>

        </div>
      }
    }
  `,
  styles: [`
    .aar__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 40px 20px;
      color: var(--p-text-muted-color);
      text-align: center;

      .pi { font-size: 1.5rem; opacity: 0.4; }
      p { font-size: 0.82rem; margin: 0; max-width: 280px; line-height: 1.5; }
    }

    .aar__version-bar {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }

    .aar__version-btn {
      padding: 4px 10px;
      border-radius: 20px;
      border: 1px solid var(--p-surface-300);
      background: transparent;
      font-size: 0.72rem;
      cursor: pointer;
      color: var(--p-text-secondary-color);
      transition: all 0.15s;
      font-family: inherit;

      &:hover { background: var(--p-surface-100); }
    }

    .aar__version-btn--active {
      background: var(--p-primary-50, #eff6ff);
      border-color: var(--p-primary-300);
      color: var(--p-primary-700, #1d4ed8);
      font-weight: 600;
    }

    .aar__report {
      display: flex;
      flex-direction: column;
      gap: 14px;
      overflow-y: auto;
    }

    .aar__summary {
      padding: 12px 14px;
      background: var(--p-surface-50, #f9fafb);
      border-radius: 10px;
      border: 1px solid var(--p-surface-200);

      p {
        margin: 0;
        font-size: 0.84rem;
        line-height: 1.6;
        color: var(--p-text-color);
      }
    }

    .aar__columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .aar__section {
      border-radius: 10px;
      padding: 12px;
      border: 1px solid transparent;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .aar__section--analogo { background: #f0fdf4; border-color: #bbf7d0; }
    .aar__section--antilogo { background: #fff7ed; border-color: #fed7aa; }

    .aar__section-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: 'Syne', sans-serif;
      font-size: 0.78rem;
      font-weight: 700;
      margin: 0 0 4px;

      .pi { font-size: 0.8rem; }
    }

    .aar__section--analogo .aar__section-title { color: #15803d; }
    .aar__section--antilogo .aar__section-title { color: #c2410c; }

    .aar__insight-card {
      border-radius: 8px;
      padding: 8px 10px;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .aar__insight-card--analogo { border: 1px solid #bbf7d0; }
    .aar__insight-card--antilogo { border: 1px solid #fed7aa; }

    .aar__insight-industry {
      font-size: 0.67rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--p-text-muted-color);
    }

    .aar__insight-principle {
      margin: 0;
      font-size: 0.8rem;
      line-height: 1.4;
      color: var(--p-text-color);
      font-weight: 500;
    }

    .aar__insight-potential {
      margin: 0;
      font-size: 0.76rem;
      line-height: 1.4;
      color: var(--p-text-secondary-color);
      font-style: italic;
      display: flex;
      gap: 5px;
      align-items: flex-start;

      .pi { font-size: 0.7rem; margin-top: 2px; flex-shrink: 0; }
    }

    .aar__no-items {
      font-size: 0.78rem;
      color: var(--p-text-muted-color);
      margin: 0;
      text-align: center;
      padding: 8px 0;
    }

    .aar__synthesis {
      padding: 12px 14px;
      background: var(--p-primary-50, #eff6ff);
      border-radius: 10px;
      border: 1px solid var(--p-primary-200, #bfdbfe);

      .aar__section-title { color: var(--p-primary-700, #1d4ed8); }
    }

    .aar__synthesis-list {
      margin: 0;
      padding-left: 18px;
      display: flex;
      flex-direction: column;
      gap: 4px;

      li {
        font-size: 0.82rem;
        line-height: 1.5;
        color: var(--p-text-color);
      }
    }

    .aar__recommendations {
      padding: 12px 14px;
      background: var(--p-surface-50, #f9fafb);
      border-radius: 10px;
      border: 1px solid var(--p-surface-200);
    }

    .aar__rec-list {
      margin: 0;
      padding-left: 20px;
      display: flex;
      flex-direction: column;
      gap: 5px;

      li {
        font-size: 0.82rem;
        line-height: 1.5;
        color: var(--p-text-color);
      }
    }
  `],
})
export class AnalogosAntilogosReportComponent {
  reports = input<AnalogosAntilogosReportVersionDto[]>([]);
  selectedIndex = signal(0);
  current = computed(() => this.reports()[this.selectedIndex()] ?? null);
}
