import { Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ShadowingReportVersionDto } from './shadowing.types';

@Component({
  selector: 'app-shadowing-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (reports().length === 0) {
      <div class="shr__empty">
        <i class="pi pi-eye"></i>
        <p>Aún no hay informes generados. Documentá al menos una sesión con observaciones y hacé clic en "Analizar".</p>
      </div>
    } @else {

      @if (reports().length > 1) {
        <div class="shr__version-bar">
          @for (r of reports(); track r.version; let idx = $index) {
            <button
              class="shr__version-btn"
              [class.shr__version-btn--active]="selectedIndex() === idx"
              (click)="selectedIndex.set(idx)"
            >
              v{{ r.version }} — {{ r.generatedAt | date:'dd/MM HH:mm' }}
            </button>
          }
        </div>
      }

      @if (current()) {
        <div class="shr__report">

          <!-- Executive summary -->
          <div class="shr__summary">
            <i class="pi pi-align-left shr__summary-icon"></i>
            <p class="shr__summary-text">{{ current()!.report.executiveSummary }}</p>
          </div>

          <!-- Observaciones destacadas -->
          @if (current()!.report.observacionesDestacadas.length) {
            <div class="shr__block">
              <h4 class="shr__block-title">
                <i class="pi pi-eye"></i>
                Observaciones Destacadas
              </h4>
              <div class="shr__obs-grid">
                @for (o of current()!.report.observacionesDestacadas; track $index) {
                  <div class="shr__obs-card">
                    <div class="shr__obs-header">
                      <span class="shr__obs-participante">{{ o.participante }}</span>
                      @if (o.hora) {
                        <span class="shr__obs-hora">{{ o.hora }}</span>
                      }
                    </div>
                    <p class="shr__obs-texto">{{ o.observacion }}</p>
                    <p class="shr__obs-insight">
                      <i class="pi pi-lightbulb"></i>
                      {{ o.insight }}
                    </p>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Flujos de trabajo -->
          @if (current()!.report.flujosDeTrabajo.length) {
            <div class="shr__block">
              <h4 class="shr__block-title">
                <i class="pi pi-arrow-right-arrow-left"></i>
                Flujos de Trabajo Observados
              </h4>
              <ul class="shr__list">
                @for (f of current()!.report.flujosDeTrabajo; track $index) {
                  <li class="shr__list-item shr__list-item--flujo">{{ f }}</li>
                }
              </ul>
            </div>
          }

          <!-- Workarounds -->
          @if (current()!.report.workaroundsEncontrados.length) {
            <div class="shr__block shr__block--workaround">
              <h4 class="shr__block-title">
                <i class="pi pi-wrench"></i>
                Workarounds Encontrados
              </h4>
              <ul class="shr__list">
                @for (w of current()!.report.workaroundsEncontrados; track $index) {
                  <li class="shr__list-item shr__list-item--workaround">{{ w }}</li>
                }
              </ul>
            </div>
          }

          <!-- Pain Points -->
          @if (current()!.report.painPointsCriticos.length) {
            <div class="shr__block shr__block--pain">
              <h4 class="shr__block-title">
                <i class="pi pi-exclamation-triangle"></i>
                Pain Points Críticos
              </h4>
              <ul class="shr__list">
                @for (pp of current()!.report.painPointsCriticos; track $index) {
                  <li class="shr__list-item shr__list-item--pain">{{ pp }}</li>
                }
              </ul>
            </div>
          }

          <!-- Decisiones observadas -->
          @if (current()!.report.decisiones.length) {
            <div class="shr__block">
              <h4 class="shr__block-title">
                <i class="pi pi-chart-scatter"></i>
                Patrones de Decisión
              </h4>
              <ul class="shr__list">
                @for (d of current()!.report.decisiones; track $index) {
                  <li class="shr__list-item shr__list-item--decision">{{ d }}</li>
                }
              </ul>
            </div>
          }

          <!-- Oportunidades -->
          @if (current()!.report.oportunidades.length) {
            <div class="shr__block">
              <h4 class="shr__block-title">
                <i class="pi pi-arrow-up-right"></i>
                Oportunidades de Diseño
              </h4>
              <ul class="shr__list">
                @for (o of current()!.report.oportunidades; track $index) {
                  <li class="shr__list-item shr__list-item--oportunidad">{{ o }}</li>
                }
              </ul>
            </div>
          }

          <!-- Recomendaciones -->
          @if (current()!.report.recommendations.length) {
            <div class="shr__block shr__block--recommendations">
              <h4 class="shr__block-title">
                <i class="pi pi-check-circle"></i>
                Recomendaciones
              </h4>
              <ol class="shr__list shr__list--ordered">
                @for (r of current()!.report.recommendations; track $index) {
                  <li class="shr__list-item">{{ r }}</li>
                }
              </ol>
            </div>
          }

        </div>
      }
    }
  `,
  styles: [`
    .shr__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 48px 24px;
      color: var(--p-surface-400);
      text-align: center;
    }

    .shr__empty i {
      font-size: 36px;
      opacity: 0.4;
    }

    .shr__empty p {
      font-size: 13px;
      max-width: 320px;
      line-height: 1.5;
    }

    .shr__version-bar {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }

    .shr__version-btn {
      padding: 5px 12px;
      border-radius: 6px;
      border: 1px solid var(--p-surface-300);
      background: white;
      font-size: 12px;
      color: var(--p-surface-600);
      cursor: pointer;
      transition: all 0.15s;
    }

    .shr__version-btn--active {
      background: var(--p-indigo-50);
      border-color: var(--p-indigo-300);
      color: var(--p-indigo-700);
      font-weight: 600;
    }

    .shr__report {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .shr__summary {
      display: flex;
      gap: 12px;
      padding: 14px 16px;
      background: var(--p-indigo-50);
      border: 1px solid var(--p-indigo-100);
      border-radius: 10px;
      align-items: flex-start;
    }

    .shr__summary-icon {
      color: var(--p-indigo-500);
      font-size: 15px;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .shr__summary-text {
      font-size: 13px;
      line-height: 1.6;
      color: var(--p-surface-700);
      margin: 0;
    }

    .shr__block {
      background: var(--p-surface-50);
      border: 1px solid var(--p-surface-200);
      border-radius: 10px;
      padding: 14px 16px;
    }

    .shr__block--workaround {
      background: var(--p-violet-50);
      border-color: var(--p-violet-100);
    }

    .shr__block--pain {
      background: var(--p-orange-50);
      border-color: var(--p-orange-100);
    }

    .shr__block--recommendations {
      background: var(--p-blue-50);
      border-color: var(--p-blue-100);
    }

    .shr__block-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 700;
      color: var(--p-surface-700);
      margin: 0 0 12px 0;
    }

    .shr__obs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 10px;
    }

    .shr__obs-card {
      background: white;
      border: 1px solid var(--p-surface-200);
      border-radius: 8px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .shr__obs-header {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .shr__obs-participante {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--p-indigo-600);
      letter-spacing: 0.5px;
    }

    .shr__obs-hora {
      font-size: 11px;
      color: var(--p-surface-400);
      background: var(--p-surface-100);
      border-radius: 4px;
      padding: 1px 6px;
    }

    .shr__obs-texto {
      font-size: 13px;
      color: var(--p-surface-700);
      line-height: 1.4;
      margin: 0;
    }

    .shr__obs-insight {
      font-size: 12px;
      color: var(--p-surface-500);
      line-height: 1.4;
      margin: 0;
      display: flex;
      gap: 5px;
      align-items: flex-start;
    }

    .shr__list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 0;
      margin: 0;
      list-style: none;
    }

    .shr__list--ordered {
      list-style: none;
      counter-reset: item;
    }

    .shr__list-item {
      font-size: 13px;
      color: var(--p-surface-700);
      line-height: 1.5;
      padding: 6px 10px;
      border-radius: 6px;
      background: white;
      border: 1px solid var(--p-surface-200);
    }

    .shr__list--ordered .shr__list-item {
      counter-increment: item;
      padding-left: 32px;
      position: relative;
    }

    .shr__list--ordered .shr__list-item::before {
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

    .shr__list-item--flujo {
      border-left: 3px solid var(--p-indigo-400);
    }

    .shr__list-item--workaround {
      border-left: 3px solid var(--p-violet-400);
    }

    .shr__list-item--pain {
      border-left: 3px solid var(--p-orange-400);
    }

    .shr__list-item--decision {
      border-left: 3px solid var(--p-sky-400);
    }

    .shr__list-item--oportunidad {
      border-left: 3px solid var(--p-emerald-400);
    }
  `],
})
export class ShadowingReportComponent {
  reports = input<ShadowingReportVersionDto[]>([]);
  selectedIndex = signal(0);
  current = computed(() => this.reports()[this.selectedIndex()] ?? null);
}
