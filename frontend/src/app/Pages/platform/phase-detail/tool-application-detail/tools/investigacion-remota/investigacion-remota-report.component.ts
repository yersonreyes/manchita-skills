import { Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { InvestigacionRemotaReportVersionDto } from './investigacion-remota.types';

@Component({
  selector: 'app-investigacion-remota-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (reports().length === 0) {
      <div class="irr__empty">
        <i class="pi pi-sparkles"></i>
        <p>Aún no hay informes generados. Documentá al menos un método con hallazgos y hacé clic en "Analizar".</p>
      </div>
    } @else {

      @if (reports().length > 1) {
        <div class="irr__version-bar">
          @for (r of reports(); track r.version; let idx = $index) {
            <button
              class="irr__version-btn"
              [class.irr__version-btn--active]="selectedIndex() === idx"
              (click)="selectedIndex.set(idx)"
            >
              v{{ r.version }} — {{ r.generatedAt | date:'dd/MM HH:mm' }}
            </button>
          }
        </div>
      }

      @if (current()) {
        <div class="irr__report">

          <!-- Executive summary -->
          <div class="irr__summary">
            <i class="pi pi-align-left irr__summary-icon"></i>
            <p class="irr__summary-text">{{ current()!.report.executiveSummary }}</p>
          </div>

          <!-- Hallazgos clave -->
          @if (current()!.report.hallazgosClave.length) {
            <div class="irr__block">
              <h4 class="irr__block-title">
                <i class="pi pi-star"></i>
                Hallazgos Clave por Método
              </h4>
              <div class="irr__hallazgos-grid">
                @for (h of current()!.report.hallazgosClave; track $index) {
                  <div class="irr__hallazgo-card">
                    <span class="irr__hallazgo-metodo">{{ h.metodo }}</span>
                    <p class="irr__hallazgo-texto">{{ h.hallazgo }}</p>
                    <p class="irr__hallazgo-impl">
                      <i class="pi pi-arrow-right"></i>
                      {{ h.implicancia }}
                    </p>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Patrones -->
          @if (current()!.report.patronesEncontrados.length) {
            <div class="irr__block">
              <h4 class="irr__block-title">
                <i class="pi pi-objects-column"></i>
                Patrones Encontrados
              </h4>
              <ul class="irr__list">
                @for (p of current()!.report.patronesEncontrados; track $index) {
                  <li class="irr__list-item irr__list-item--pattern">{{ p }}</li>
                }
              </ul>
            </div>
          }

          <!-- Insights accionables -->
          @if (current()!.report.insightsAccionables.length) {
            <div class="irr__block">
              <h4 class="irr__block-title">
                <i class="pi pi-lightbulb"></i>
                Insights Accionables
              </h4>
              <ul class="irr__list">
                @for (ins of current()!.report.insightsAccionables; track $index) {
                  <li class="irr__list-item irr__list-item--insight">{{ ins }}</li>
                }
              </ul>
            </div>
          }

          <!-- Oportunidades -->
          @if (current()!.report.oportunidades.length) {
            <div class="irr__block">
              <h4 class="irr__block-title">
                <i class="pi pi-arrow-up-right"></i>
                Oportunidades de Diseño
              </h4>
              <ul class="irr__list">
                @for (o of current()!.report.oportunidades; track $index) {
                  <li class="irr__list-item irr__list-item--oportunidad">{{ o }}</li>
                }
              </ul>
            </div>
          }

          <!-- Limitaciones -->
          @if (current()!.report.limitacionesDetectadas.length) {
            <div class="irr__block irr__block--warning">
              <h4 class="irr__block-title">
                <i class="pi pi-exclamation-triangle"></i>
                Limitaciones Detectadas
              </h4>
              <ul class="irr__list">
                @for (l of current()!.report.limitacionesDetectadas; track $index) {
                  <li class="irr__list-item">{{ l }}</li>
                }
              </ul>
            </div>
          }

          <!-- Recomendaciones -->
          @if (current()!.report.recommendations.length) {
            <div class="irr__block irr__block--recommendations">
              <h4 class="irr__block-title">
                <i class="pi pi-check-circle"></i>
                Recomendaciones
              </h4>
              <ol class="irr__list irr__list--ordered">
                @for (r of current()!.report.recommendations; track $index) {
                  <li class="irr__list-item">{{ r }}</li>
                }
              </ol>
            </div>
          }

        </div>
      }
    }
  `,
  styles: [`
    .irr__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 48px 24px;
      color: var(--p-surface-400);
      text-align: center;
    }

    .irr__empty i {
      font-size: 36px;
      opacity: 0.4;
    }

    .irr__empty p {
      font-size: 13px;
      max-width: 320px;
      line-height: 1.5;
    }

    .irr__version-bar {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }

    .irr__version-btn {
      padding: 5px 12px;
      border-radius: 6px;
      border: 1px solid var(--p-surface-300);
      background: white;
      font-size: 12px;
      color: var(--p-surface-600);
      cursor: pointer;
      transition: all 0.15s;
    }

    .irr__version-btn--active {
      background: var(--p-emerald-50);
      border-color: var(--p-emerald-300);
      color: var(--p-emerald-700);
      font-weight: 600;
    }

    .irr__report {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .irr__summary {
      display: flex;
      gap: 12px;
      padding: 14px 16px;
      background: var(--p-emerald-50);
      border: 1px solid var(--p-emerald-100);
      border-radius: 10px;
      align-items: flex-start;
    }

    .irr__summary-icon {
      color: var(--p-emerald-500);
      font-size: 15px;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .irr__summary-text {
      font-size: 13px;
      line-height: 1.6;
      color: var(--p-surface-700);
      margin: 0;
    }

    .irr__block {
      background: var(--p-surface-50);
      border: 1px solid var(--p-surface-200);
      border-radius: 10px;
      padding: 14px 16px;
    }

    .irr__block--warning {
      background: var(--p-orange-50);
      border-color: var(--p-orange-100);
    }

    .irr__block--recommendations {
      background: var(--p-blue-50);
      border-color: var(--p-blue-100);
    }

    .irr__block-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 700;
      color: var(--p-surface-700);
      margin: 0 0 12px 0;
    }

    .irr__hallazgos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 10px;
    }

    .irr__hallazgo-card {
      background: white;
      border: 1px solid var(--p-surface-200);
      border-radius: 8px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .irr__hallazgo-metodo {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--p-emerald-600);
      letter-spacing: 0.5px;
    }

    .irr__hallazgo-texto {
      font-size: 13px;
      color: var(--p-surface-700);
      line-height: 1.4;
      margin: 0;
    }

    .irr__hallazgo-impl {
      font-size: 12px;
      color: var(--p-surface-500);
      line-height: 1.4;
      margin: 0;
      display: flex;
      gap: 5px;
      align-items: flex-start;
    }

    .irr__list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 0;
      margin: 0;
      list-style: none;
    }

    .irr__list--ordered {
      list-style: none;
      counter-reset: item;
    }

    .irr__list-item {
      font-size: 13px;
      color: var(--p-surface-700);
      line-height: 1.5;
      padding: 6px 10px;
      border-radius: 6px;
      background: white;
      border: 1px solid var(--p-surface-200);
    }

    .irr__list--ordered .irr__list-item {
      counter-increment: item;
      padding-left: 32px;
      position: relative;
    }

    .irr__list--ordered .irr__list-item::before {
      content: counter(item);
      position: absolute;
      left: 10px;
      top: 6px;
      font-size: 11px;
      font-weight: 700;
      color: var(--p-blue-500);
      background: var(--p-blue-50);
      width: 16px;
      height: 16px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .irr__list-item--pattern {
      border-left: 3px solid var(--p-violet-400);
    }

    .irr__list-item--insight {
      border-left: 3px solid var(--p-emerald-400);
    }

    .irr__list-item--oportunidad {
      border-left: 3px solid var(--p-sky-400);
    }
  `],
})
export class InvestigacionRemotaReportComponent {
  reports = input<InvestigacionRemotaReportVersionDto[]>([]);
  selectedIndex = signal(0);
  current = computed(() => this.reports()[this.selectedIndex()] ?? null);
}
