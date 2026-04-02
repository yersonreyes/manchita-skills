import { Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SafariReportVersionDto } from './safari.types';

@Component({
  selector: 'app-safari-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (reports().length === 0) {
      <div class="sr__empty">
        <i class="pi pi-binoculars"></i>
        <p>Aún no hay informes generados. Documentá al menos una sesión con observaciones y hacé clic en "Analizar".</p>
      </div>
    } @else {

      @if (reports().length > 1) {
        <div class="sr__version-bar">
          @for (r of reports(); track r.version; let idx = $index) {
            <button
              class="sr__version-btn"
              [class.sr__version-btn--active]="selectedIndex() === idx"
              (click)="selectedIndex.set(idx)"
            >
              v{{ r.version }} — {{ r.generatedAt | date:'dd/MM HH:mm' }}
            </button>
          }
        </div>
      }

      @if (current()) {
        <div class="sr__report">

          <!-- Executive summary -->
          <div class="sr__summary">
            <i class="pi pi-align-left sr__summary-icon"></i>
            <p class="sr__summary-text">{{ current()!.report.executiveSummary }}</p>
          </div>

          <!-- Observaciones destacadas -->
          @if (current()!.report.observacionesDestacadas.length) {
            <div class="sr__block">
              <h4 class="sr__block-title">
                <i class="pi pi-eye"></i>
                Observaciones Destacadas
              </h4>
              <div class="sr__obs-grid">
                @for (o of current()!.report.observacionesDestacadas; track $index) {
                  <div class="sr__obs-card">
                    <div class="sr__obs-header">
                      <span class="sr__obs-sesion">{{ o.sesion }}</span>
                      @if (o.momento) {
                        <span class="sr__obs-momento">{{ o.momento }}</span>
                      }
                    </div>
                    <p class="sr__obs-texto">{{ o.observacion }}</p>
                    <p class="sr__obs-insight">
                      <i class="pi pi-lightbulb"></i>
                      {{ o.insight }}
                    </p>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Patrones de comportamiento -->
          @if (current()!.report.patronesComportamiento.length) {
            <div class="sr__block">
              <h4 class="sr__block-title">
                <i class="pi pi-objects-column"></i>
                Patrones de Comportamiento
              </h4>
              <ul class="sr__list">
                @for (p of current()!.report.patronesComportamiento; track $index) {
                  <li class="sr__list-item sr__list-item--pattern">{{ p }}</li>
                }
              </ul>
            </div>
          }

          <!-- Workarounds -->
          @if (current()!.report.workaroundsEncontrados.length) {
            <div class="sr__block sr__block--workaround">
              <h4 class="sr__block-title">
                <i class="pi pi-wrench"></i>
                Workarounds Encontrados
              </h4>
              <ul class="sr__list">
                @for (w of current()!.report.workaroundsEncontrados; track $index) {
                  <li class="sr__list-item sr__list-item--workaround">{{ w }}</li>
                }
              </ul>
            </div>
          }

          <!-- Pain Points -->
          @if (current()!.report.painPointsCriticos.length) {
            <div class="sr__block sr__block--pain">
              <h4 class="sr__block-title">
                <i class="pi pi-exclamation-triangle"></i>
                Pain Points Críticos
              </h4>
              <ul class="sr__list">
                @for (pp of current()!.report.painPointsCriticos; track $index) {
                  <li class="sr__list-item sr__list-item--pain">{{ pp }}</li>
                }
              </ul>
            </div>
          }

          <!-- Momentos Wow -->
          @if (current()!.report.momentosWow.length) {
            <div class="sr__block sr__block--wow">
              <h4 class="sr__block-title">
                <i class="pi pi-star"></i>
                Momentos WOW
              </h4>
              <ul class="sr__list">
                @for (m of current()!.report.momentosWow; track $index) {
                  <li class="sr__list-item sr__list-item--wow">{{ m }}</li>
                }
              </ul>
            </div>
          }

          <!-- Oportunidades -->
          @if (current()!.report.oportunidades.length) {
            <div class="sr__block">
              <h4 class="sr__block-title">
                <i class="pi pi-arrow-up-right"></i>
                Oportunidades de Diseño
              </h4>
              <ul class="sr__list">
                @for (o of current()!.report.oportunidades; track $index) {
                  <li class="sr__list-item sr__list-item--oportunidad">{{ o }}</li>
                }
              </ul>
            </div>
          }

          <!-- Recomendaciones -->
          @if (current()!.report.recommendations.length) {
            <div class="sr__block sr__block--recommendations">
              <h4 class="sr__block-title">
                <i class="pi pi-check-circle"></i>
                Recomendaciones
              </h4>
              <ol class="sr__list sr__list--ordered">
                @for (r of current()!.report.recommendations; track $index) {
                  <li class="sr__list-item">{{ r }}</li>
                }
              </ol>
            </div>
          }

        </div>
      }
    }
  `,
  styles: [`
    .sr__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 48px 24px;
      color: var(--p-surface-400);
      text-align: center;
    }

    .sr__empty i {
      font-size: 36px;
      opacity: 0.4;
    }

    .sr__empty p {
      font-size: 13px;
      max-width: 320px;
      line-height: 1.5;
    }

    .sr__version-bar {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }

    .sr__version-btn {
      padding: 5px 12px;
      border-radius: 6px;
      border: 1px solid var(--p-surface-300);
      background: white;
      font-size: 12px;
      color: var(--p-surface-600);
      cursor: pointer;
      transition: all 0.15s;
    }

    .sr__version-btn--active {
      background: var(--p-amber-50);
      border-color: var(--p-amber-300);
      color: var(--p-amber-700);
      font-weight: 600;
    }

    .sr__report {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .sr__summary {
      display: flex;
      gap: 12px;
      padding: 14px 16px;
      background: var(--p-amber-50);
      border: 1px solid var(--p-amber-100);
      border-radius: 10px;
      align-items: flex-start;
    }

    .sr__summary-icon {
      color: var(--p-amber-500);
      font-size: 15px;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .sr__summary-text {
      font-size: 13px;
      line-height: 1.6;
      color: var(--p-surface-700);
      margin: 0;
    }

    .sr__block {
      background: var(--p-surface-50);
      border: 1px solid var(--p-surface-200);
      border-radius: 10px;
      padding: 14px 16px;
    }

    .sr__block--workaround {
      background: var(--p-violet-50);
      border-color: var(--p-violet-100);
    }

    .sr__block--pain {
      background: var(--p-orange-50);
      border-color: var(--p-orange-100);
    }

    .sr__block--wow {
      background: var(--p-yellow-50);
      border-color: var(--p-yellow-100);
    }

    .sr__block--recommendations {
      background: var(--p-blue-50);
      border-color: var(--p-blue-100);
    }

    .sr__block-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 700;
      color: var(--p-surface-700);
      margin: 0 0 12px 0;
    }

    .sr__obs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 10px;
    }

    .sr__obs-card {
      background: white;
      border: 1px solid var(--p-surface-200);
      border-radius: 8px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .sr__obs-header {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .sr__obs-sesion {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--p-amber-600);
      letter-spacing: 0.5px;
    }

    .sr__obs-momento {
      font-size: 11px;
      color: var(--p-surface-400);
      background: var(--p-surface-100);
      border-radius: 4px;
      padding: 1px 6px;
    }

    .sr__obs-texto {
      font-size: 13px;
      color: var(--p-surface-700);
      line-height: 1.4;
      margin: 0;
    }

    .sr__obs-insight {
      font-size: 12px;
      color: var(--p-surface-500);
      line-height: 1.4;
      margin: 0;
      display: flex;
      gap: 5px;
      align-items: flex-start;
    }

    .sr__list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 0;
      margin: 0;
      list-style: none;
    }

    .sr__list--ordered {
      list-style: none;
      counter-reset: item;
    }

    .sr__list-item {
      font-size: 13px;
      color: var(--p-surface-700);
      line-height: 1.5;
      padding: 6px 10px;
      border-radius: 6px;
      background: white;
      border: 1px solid var(--p-surface-200);
    }

    .sr__list--ordered .sr__list-item {
      counter-increment: item;
      padding-left: 32px;
      position: relative;
    }

    .sr__list--ordered .sr__list-item::before {
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

    .sr__list-item--pattern {
      border-left: 3px solid var(--p-amber-400);
    }

    .sr__list-item--workaround {
      border-left: 3px solid var(--p-violet-400);
    }

    .sr__list-item--pain {
      border-left: 3px solid var(--p-orange-400);
    }

    .sr__list-item--wow {
      border-left: 3px solid var(--p-yellow-400);
    }

    .sr__list-item--oportunidad {
      border-left: 3px solid var(--p-sky-400);
    }
  `],
})
export class SafariReportComponent {
  reports = input<SafariReportVersionDto[]>([]);
  selectedIndex = signal(0);
  current = computed(() => this.reports()[this.selectedIndex()] ?? null);
}
