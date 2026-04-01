import { Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { StakeholderMapReportVersionDto, STAKEHOLDER_QUADRANTS } from './stakeholder-map.types';

@Component({
  selector: 'app-stakeholder-map-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (reports().length === 0) {
      <div class="smr-empty">
        <i class="pi pi-users"></i>
        <p>Aún no hay informes generados. Agregá actores al mapa y hacé clic en "Analizar".</p>
      </div>
    } @else {
      @if (reports().length > 1) {
        <div class="smr-versions">
          @for (r of reports(); track r.version; let i = $index) {
            <button
              class="smr-version-btn"
              [class.smr-version-btn--active]="selectedIndex() === i"
              (click)="selectedIndex.set(i)"
            >
              v{{ r.version }} — {{ r.generatedAt | date:'dd/MM/yy HH:mm' }}
            </button>
          }
        </div>
      }

      @if (current()) {
        <div class="smr-report">

          <div class="smr-summary">
            <i class="pi pi-sparkles"></i>
            <p>{{ current()!.report.executiveSummary }}</p>
          </div>

          <div class="smr-quadrants">
            @for (q of quadrants; track q.key) {
              <div class="smr-quadrant" [style.border-color]="q.borderColor" [style.background]="q.accentBg">
                <div class="smr-quadrant-header" [style.color]="q.textColor">
                  <i class="pi {{ q.icon }}"></i>
                  <span>{{ q.label }}</span>
                  <span class="smr-quadrant-meta">{{ q.poder }} poder · {{ q.interes }} interés</span>
                </div>

                <p class="smr-dinamica">
                  {{ current()!.report.quadrantAnalysis[q.key].dinamica }}
                </p>

                @if (current()!.report.quadrantAnalysis[q.key].actoresClave.length) {
                  <div class="smr-section">
                    <span class="smr-section-label">Actores clave</span>
                    <ul class="smr-list">
                      @for (a of current()!.report.quadrantAnalysis[q.key].actoresClave; track $index) {
                        <li>{{ a }}</li>
                      }
                    </ul>
                  </div>
                }

                @if (current()!.report.quadrantAnalysis[q.key].accionesRecomendadas.length) {
                  <div class="smr-section">
                    <span class="smr-section-label">Acciones</span>
                    <ul class="smr-list smr-list--actions">
                      @for (a of current()!.report.quadrantAnalysis[q.key].accionesRecomendadas; track $index) {
                        <li>{{ a }}</li>
                      }
                    </ul>
                  </div>
                }
              </div>
            }
          </div>

          <div class="smr-insights">
            @if (current()!.report.alianzasEstrategicas.length) {
              <div class="smr-insight-block smr-insight-block--alliance">
                <div class="smr-insight-header">
                  <i class="pi pi-link"></i>
                  <span>Alianzas Estratégicas</span>
                </div>
                <ul class="smr-list">
                  @for (a of current()!.report.alianzasEstrategicas; track $index) {
                    <li>{{ a }}</li>
                  }
                </ul>
              </div>
            }

            @if (current()!.report.riesgosRelacionales.length) {
              <div class="smr-insight-block smr-insight-block--risk">
                <div class="smr-insight-header">
                  <i class="pi pi-exclamation-triangle"></i>
                  <span>Riesgos Relacionales</span>
                </div>
                <ul class="smr-list">
                  @for (r of current()!.report.riesgosRelacionales; track $index) {
                    <li>{{ r }}</li>
                  }
                </ul>
              </div>
            }
          </div>

          <div class="smr-recommendations">
            <div class="smr-rec-header">
              <i class="pi pi-check-circle"></i>
              <span>Recomendaciones</span>
            </div>
            <ol class="smr-rec-list">
              @for (r of current()!.report.recommendations; track $index) {
                <li>{{ r }}</li>
              }
            </ol>
          </div>

        </div>
      }
    }
  `,
  styles: [`
    .smr-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 48px 24px;
      color: var(--p-text-muted-color);
      text-align: center;
    }

    .smr-empty .pi {
      font-size: 2rem;
      opacity: 0.3;
    }

    .smr-empty p {
      font-size: 0.85rem;
      margin: 0;
      max-width: 360px;
    }

    .smr-versions {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }

    .smr-version-btn {
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid var(--p-surface-300);
      background: white;
      font-size: 0.75rem;
      cursor: pointer;
      color: var(--p-text-secondary-color);
      transition: all 0.15s;
    }

    .smr-version-btn--active {
      background: var(--p-primary-50, #eff6ff);
      border-color: var(--p-primary-300, #93c5fd);
      color: var(--p-primary-700, #1d4ed8);
      font-weight: 600;
    }

    .smr-report {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .smr-summary {
      display: flex;
      gap: 10px;
      padding: 12px 14px;
      background: #fafbff;
      border: 1px solid var(--p-surface-200);
      border-radius: 10px;
      align-items: flex-start;
    }

    .smr-summary .pi {
      color: var(--p-primary-500, #3b82f6);
      font-size: 0.9rem;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .smr-summary p {
      margin: 0;
      font-size: 0.8375rem;
      line-height: 1.6;
      color: var(--p-text-color);
    }

    .smr-quadrants {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .smr-quadrant {
      border: 1px solid;
      border-radius: 10px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .smr-quadrant-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .smr-quadrant-header .pi { font-size: 0.8rem; }

    .smr-quadrant-meta {
      margin-left: auto;
      font-size: 0.65rem;
      font-weight: 400;
      text-transform: none;
      letter-spacing: 0;
      opacity: 0.7;
    }

    .smr-dinamica {
      margin: 0;
      font-size: 0.78rem;
      color: var(--p-text-secondary-color);
      line-height: 1.5;
      font-style: italic;
    }

    .smr-section {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .smr-section-label {
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--p-text-muted-color);
    }

    .smr-list {
      margin: 0;
      padding: 0;
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .smr-list li {
      font-size: 0.78rem;
      line-height: 1.4;
      color: var(--p-text-color);
      padding-left: 10px;
      position: relative;
    }

    .smr-list li::before {
      content: '·';
      position: absolute;
      left: 0;
      color: var(--p-text-muted-color);
    }

    .smr-list--actions li::before {
      content: '→';
    }

    .smr-insights {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .smr-insight-block {
      border-radius: 10px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .smr-insight-block--alliance {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
    }

    .smr-insight-block--risk {
      background: #fff7ed;
      border: 1px solid #fed7aa;
    }

    .smr-insight-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .smr-insight-block--alliance .smr-insight-header { color: #047857; }
    .smr-insight-block--risk .smr-insight-header { color: #c2410c; }

    .smr-insight-header .pi { font-size: 0.8rem; }

    .smr-recommendations {
      background: var(--p-surface-50, #f9fafb);
      border: 1px solid var(--p-surface-200);
      border-radius: 10px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .smr-rec-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--p-text-color);
    }

    .smr-rec-header .pi {
      color: var(--p-primary-500, #3b82f6);
      font-size: 0.85rem;
    }

    .smr-rec-list {
      margin: 0;
      padding: 0 0 0 20px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .smr-rec-list li {
      font-size: 0.8125rem;
      line-height: 1.5;
      color: var(--p-text-color);
    }
  `],
})
export class StakeholderMapReportComponent {
  reports = input<StakeholderMapReportVersionDto[]>([]);
  selectedIndex = signal(0);
  current = computed(() => this.reports()[this.selectedIndex()] ?? null);
  readonly quadrants = STAKEHOLDER_QUADRANTS;
}
