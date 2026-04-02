import { Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { VisitaCampoReportVersionDto } from './visita-campo.types';

@Component({
  selector: 'app-visita-campo-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (reports().length === 0) {
      <div class="vcr__empty">
        <i class="pi pi-map"></i>
        <p>Aún no hay informes generados. Documentá al menos una visita con hallazgos y hacé clic en "Analizar".</p>
      </div>
    } @else {

      @if (reports().length > 1) {
        <div class="vcr__version-bar">
          @for (r of reports(); track r.version; let idx = $index) {
            <button
              class="vcr__version-btn"
              [class.vcr__version-btn--active]="selectedIndex() === idx"
              (click)="selectedIndex.set(idx)"
            >
              v{{ r.version }} — {{ r.generatedAt | date:'dd/MM HH:mm' }}
            </button>
          }
        </div>
      }

      @if (current()) {
        <div class="vcr__report">

          <!-- Executive summary -->
          <div class="vcr__summary">
            <i class="pi pi-align-left vcr__summary-icon"></i>
            <p class="vcr__summary-text">{{ current()!.report.executiveSummary }}</p>
          </div>

          <!-- Hallazgos destacados -->
          @if (current()!.report.hallazgosDestacados.length) {
            <div class="vcr__block">
              <h4 class="vcr__block-title">
                <i class="pi pi-star"></i>
                Hallazgos Destacados
              </h4>
              <div class="vcr__hallazgos-grid">
                @for (h of current()!.report.hallazgosDestacados; track $index) {
                  <div class="vcr__hallazgo-card">
                    <div class="vcr__hallazgo-header">
                      <span class="vcr__hallazgo-visita">{{ h.visita }}</span>
                      <span class="vcr__hallazgo-tipo">{{ h.tipo }}</span>
                    </div>
                    <p class="vcr__hallazgo-texto">{{ h.observacion }}</p>
                    <p class="vcr__hallazgo-insight">
                      <i class="pi pi-lightbulb"></i>
                      {{ h.insight }}
                    </p>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Patrones contextuales -->
          @if (current()!.report.patronesContextuales.length) {
            <div class="vcr__block">
              <h4 class="vcr__block-title">
                <i class="pi pi-objects-column"></i>
                Patrones Contextuales
              </h4>
              <ul class="vcr__list">
                @for (p of current()!.report.patronesContextuales; track $index) {
                  <li class="vcr__list-item vcr__list-item--patron">{{ p }}</li>
                }
              </ul>
            </div>
          }

          <!-- Elementos invisibles -->
          @if (current()!.report.elementosInvisibles.length) {
            <div class="vcr__block vcr__block--invisible">
              <h4 class="vcr__block-title">
                <i class="pi pi-eye-slash"></i>
                Lo que No se Ve (Elementos Invisibles)
              </h4>
              <ul class="vcr__list">
                @for (e of current()!.report.elementosInvisibles; track $index) {
                  <li class="vcr__list-item vcr__list-item--invisible">{{ e }}</li>
                }
              </ul>
            </div>
          }

          <!-- Workarounds -->
          @if (current()!.report.workaroundsEncontrados.length) {
            <div class="vcr__block vcr__block--workaround">
              <h4 class="vcr__block-title">
                <i class="pi pi-wrench"></i>
                Workarounds Encontrados
              </h4>
              <ul class="vcr__list">
                @for (w of current()!.report.workaroundsEncontrados; track $index) {
                  <li class="vcr__list-item vcr__list-item--workaround">{{ w }}</li>
                }
              </ul>
            </div>
          }

          <!-- Pain Points -->
          @if (current()!.report.painPointsCriticos.length) {
            <div class="vcr__block vcr__block--pain">
              <h4 class="vcr__block-title">
                <i class="pi pi-exclamation-triangle"></i>
                Pain Points Críticos
              </h4>
              <ul class="vcr__list">
                @for (pp of current()!.report.painPointsCriticos; track $index) {
                  <li class="vcr__list-item vcr__list-item--pain">{{ pp }}</li>
                }
              </ul>
            </div>
          }

          <!-- Insights de contexto -->
          @if (current()!.report.insightsDeContexto.length) {
            <div class="vcr__block">
              <h4 class="vcr__block-title">
                <i class="pi pi-lightbulb"></i>
                Insights de Contexto
              </h4>
              <ul class="vcr__list">
                @for (ins of current()!.report.insightsDeContexto; track $index) {
                  <li class="vcr__list-item vcr__list-item--insight">{{ ins }}</li>
                }
              </ul>
            </div>
          }

          <!-- Oportunidades -->
          @if (current()!.report.oportunidades.length) {
            <div class="vcr__block">
              <h4 class="vcr__block-title">
                <i class="pi pi-arrow-up-right"></i>
                Oportunidades de Diseño
              </h4>
              <ul class="vcr__list">
                @for (o of current()!.report.oportunidades; track $index) {
                  <li class="vcr__list-item vcr__list-item--oportunidad">{{ o }}</li>
                }
              </ul>
            </div>
          }

          <!-- Recomendaciones -->
          @if (current()!.report.recommendations.length) {
            <div class="vcr__block vcr__block--recommendations">
              <h4 class="vcr__block-title">
                <i class="pi pi-check-circle"></i>
                Recomendaciones
              </h4>
              <ol class="vcr__list vcr__list--ordered">
                @for (r of current()!.report.recommendations; track $index) {
                  <li class="vcr__list-item">{{ r }}</li>
                }
              </ol>
            </div>
          }

        </div>
      }
    }
  `,
  styles: [`
    .vcr__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 48px 24px;
      color: var(--p-surface-400);
      text-align: center;
    }

    .vcr__empty i {
      font-size: 36px;
      opacity: 0.4;
    }

    .vcr__empty p {
      font-size: 13px;
      max-width: 320px;
      line-height: 1.5;
    }

    .vcr__version-bar {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }

    .vcr__version-btn {
      padding: 5px 12px;
      border-radius: 6px;
      border: 1px solid var(--p-surface-300);
      background: white;
      font-size: 12px;
      color: var(--p-surface-600);
      cursor: pointer;
      transition: all 0.15s;
    }

    .vcr__version-btn--active {
      background: var(--p-teal-50);
      border-color: var(--p-teal-300);
      color: var(--p-teal-700);
      font-weight: 600;
    }

    .vcr__report {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .vcr__summary {
      display: flex;
      gap: 12px;
      padding: 14px 16px;
      background: var(--p-teal-50);
      border: 1px solid var(--p-teal-100);
      border-radius: 10px;
      align-items: flex-start;
    }

    .vcr__summary-icon {
      color: var(--p-teal-500);
      font-size: 15px;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .vcr__summary-text {
      font-size: 13px;
      line-height: 1.6;
      color: var(--p-surface-700);
      margin: 0;
    }

    .vcr__block {
      background: var(--p-surface-50);
      border: 1px solid var(--p-surface-200);
      border-radius: 10px;
      padding: 14px 16px;
    }

    .vcr__block--invisible {
      background: var(--p-slate-50);
      border-color: var(--p-slate-200);
    }

    .vcr__block--workaround {
      background: var(--p-violet-50);
      border-color: var(--p-violet-100);
    }

    .vcr__block--pain {
      background: var(--p-orange-50);
      border-color: var(--p-orange-100);
    }

    .vcr__block--recommendations {
      background: var(--p-blue-50);
      border-color: var(--p-blue-100);
    }

    .vcr__block-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 700;
      color: var(--p-surface-700);
      margin: 0 0 12px 0;
    }

    .vcr__hallazgos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 10px;
    }

    .vcr__hallazgo-card {
      background: white;
      border: 1px solid var(--p-surface-200);
      border-radius: 8px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .vcr__hallazgo-header {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .vcr__hallazgo-visita {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--p-teal-600);
      letter-spacing: 0.5px;
    }

    .vcr__hallazgo-tipo {
      font-size: 11px;
      color: var(--p-surface-400);
      background: var(--p-surface-100);
      border-radius: 4px;
      padding: 1px 6px;
    }

    .vcr__hallazgo-texto {
      font-size: 13px;
      color: var(--p-surface-700);
      line-height: 1.4;
      margin: 0;
    }

    .vcr__hallazgo-insight {
      font-size: 12px;
      color: var(--p-surface-500);
      line-height: 1.4;
      margin: 0;
      display: flex;
      gap: 5px;
      align-items: flex-start;
    }

    .vcr__list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 0;
      margin: 0;
      list-style: none;
    }

    .vcr__list--ordered {
      list-style: none;
      counter-reset: item;
    }

    .vcr__list-item {
      font-size: 13px;
      color: var(--p-surface-700);
      line-height: 1.5;
      padding: 6px 10px;
      border-radius: 6px;
      background: white;
      border: 1px solid var(--p-surface-200);
    }

    .vcr__list--ordered .vcr__list-item {
      counter-increment: item;
      padding-left: 32px;
      position: relative;
    }

    .vcr__list--ordered .vcr__list-item::before {
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

    .vcr__list-item--patron {
      border-left: 3px solid var(--p-teal-400);
    }

    .vcr__list-item--invisible {
      border-left: 3px solid var(--p-slate-400);
    }

    .vcr__list-item--workaround {
      border-left: 3px solid var(--p-violet-400);
    }

    .vcr__list-item--pain {
      border-left: 3px solid var(--p-orange-400);
    }

    .vcr__list-item--insight {
      border-left: 3px solid var(--p-emerald-400);
    }

    .vcr__list-item--oportunidad {
      border-left: 3px solid var(--p-sky-400);
    }
  `],
})
export class VisitaCampoReportComponent {
  reports = input<VisitaCampoReportVersionDto[]>([]);
  selectedIndex = signal(0);
  current = computed(() => this.reports()[this.selectedIndex()] ?? null);
}
