import { Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HibridacionAgregacionReportVersionDto } from './hibridacion-agregacion.types';

@Component({
  selector: 'app-hibridacion-agregacion-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (reports().length === 0) {
      <div class="empty-report">
        <i class="pi pi-sparkles"></i>
        <p>Aún no hay informes generados. Agregá al menos 2 ideas base y documentá la idea híbrida.</p>
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

          @if (current()!.report.evaluacionHibrida) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-star"></i>
                Evaluación de la idea híbrida
              </p>
              <p class="report__text">{{ current()!.report.evaluacionHibrida }}</p>
            </div>
          }

          @if (current()!.report.elementosClave.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-key"></i>
                Elementos clave de la combinación
              </p>
              <div class="report__chips">
                @for (el of current()!.report.elementosClave; track $index) {
                  <span class="report__chip">{{ el }}</span>
                }
              </div>
            </div>
          }

          @if (current()!.report.sinergiasDetectadas.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-link"></i>
                Sinergias detectadas
              </p>
              <div class="report__sinergias">
                @for (sin of current()!.report.sinergiasDetectadas; track $index) {
                  <div class="report__sinergia">
                    <p class="report__sinergia-titulo">{{ sin.combinacion }}</p>
                    <p class="report__sinergia-texto"><span class="report__tag report__tag--green">Sinergia:</span> {{ sin.sinergia }}</p>
                    @if (sin.riesgo) {
                      <p class="report__sinergia-texto"><span class="report__tag report__tag--yellow">Riesgo:</span> {{ sin.riesgo }}</p>
                    }
                  </div>
                }
              </div>
            </div>
          }

          @if (current()!.report.riesgosIntegracion.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-exclamation-triangle"></i>
                Riesgos de integración
              </p>
              <ul class="report__list report__list--alerts">
                @for (item of current()!.report.riesgosIntegracion; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          }

          @if (current()!.report.propuestaValorAmpliada) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-bolt"></i>
                Propuesta de valor ampliada
              </p>
              <p class="report__text">{{ current()!.report.propuestaValorAmpliada }}</p>
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
    .version-btn--active { background: #fff1f2; border-color: #fecdd3; color: #e11d48; font-weight: 600; }

    .report {
      display: flex; flex-direction: column; gap: 0;
      border: 1px solid #fecdd3; border-radius: 12px;
      background: linear-gradient(135deg, #fff1f2, #fffafa); overflow: hidden;
    }

    .report__summary { padding: 14px 16px; border-bottom: 1px solid #fecdd3; }
    .report__summary p { margin: 0; font-size: 0.875rem; color: #374151; line-height: 1.65; }

    .report__section { padding: 12px 16px; border-bottom: 1px solid #fecdd3; }
    .report__section:last-child { border-bottom: none; }

    .report__label {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.6875rem; font-weight: 700;
      letter-spacing: 0.06em; text-transform: uppercase;
      color: #e11d48; margin: 0 0 8px;
    }
    .report__label .pi { font-size: 0.7rem; }

    .report__text { margin: 0; font-size: 0.8125rem; color: #374151; line-height: 1.6; }

    .report__chips { display: flex; flex-wrap: wrap; gap: 6px; }
    .report__chip {
      padding: 3px 10px; border-radius: 12px;
      background: #fecdd3; color: #9f1239;
      font-size: 0.78rem; font-weight: 500;
    }

    .report__sinergias { display: flex; flex-direction: column; gap: 8px; }
    .report__sinergia {
      padding: 9px 11px; border-radius: 8px;
      background: rgba(255,255,255,0.8); border: 1px solid #fecdd3;
    }
    .report__sinergia-titulo {
      margin: 0 0 4px; font-size: 0.8125rem; font-weight: 600;
      color: #374151; border-left: 3px solid #e11d48; padding-left: 8px;
    }
    .report__sinergia-texto { margin: 4px 0 0; font-size: 0.78rem; color: #4b5563; line-height: 1.4; }

    .report__tag {
      display: inline-block; padding: 1px 6px; border-radius: 4px;
      font-size: 0.67rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.04em; margin-right: 5px;
    }
    .report__tag--green { background: #dcfce7; color: #166534; }
    .report__tag--yellow { background: #fef9c3; color: #713f12; }

    .report__list {
      margin: 0; padding-left: 1.25rem;
      display: flex; flex-direction: column; gap: 5px;
    }
    .report__list li { font-size: 0.8125rem; color: #374151; line-height: 1.5; }
    .report__list--alerts li { color: #b45309; }
    .report__list--recommendations li { font-weight: 500; color: #1f2937; }
  `],
})
export class HibridacionAgregacionReportComponent {
  reports = input<HibridacionAgregacionReportVersionDto[]>([]);
  selectedIndex = signal(0);
  current = computed(() => this.reports()[this.selectedIndex()] ?? null);
}
