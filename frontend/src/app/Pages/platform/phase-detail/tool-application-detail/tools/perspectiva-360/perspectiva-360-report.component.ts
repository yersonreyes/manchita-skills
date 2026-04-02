import { Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Perspectiva360ReportVersionDto } from './perspectiva-360.types';

@Component({
  selector: 'app-perspectiva-360-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (reports().length === 0) {
      <div class="p360r__empty">
        <i class="pi pi-sparkles"></i>
        <p>Aún no hay informes generados. Completá al menos 2 perspectivas y hacé clic en "Analizar".</p>
      </div>
    } @else {

      @if (reports().length > 1) {
        <div class="p360r__version-bar">
          @for (r of reports(); track r.version; let idx = $index) {
            <button
              class="p360r__version-btn"
              [class.p360r__version-btn--active]="selectedIndex() === idx"
              (click)="selectedIndex.set(idx)"
            >
              v{{ r.version }} — {{ r.generatedAt | date:'dd/MM HH:mm' }}
            </button>
          }
        </div>
      }

      @if (current()) {
        <div class="p360r__report">

          <!-- Executive summary -->
          <div class="p360r__summary">
            <i class="pi pi-eye p360r__summary-icon"></i>
            <p class="p360r__summary-text">{{ current()!.report.executiveSummary }}</p>
          </div>

          <!-- Brecha crítica -->
          @if (current()!.report.brechaCritica) {
            <div class="p360r__brecha">
              <span class="p360r__brecha-label">
                <i class="pi pi-exclamation-triangle"></i>
                Brecha Crítica
              </span>
              <p class="p360r__brecha-text">{{ current()!.report.brechaCritica }}</p>
            </div>
          }

          <!-- Perspectivas destacadas -->
          <div class="p360r__perspectivas-row">
            @if (current()!.report.perspectivaMasRiesgosa) {
              <div class="p360r__perspectiva-card p360r__perspectiva-card--risk">
                <span class="p360r__perspectiva-label">
                  <i class="pi pi-times-circle"></i> Mayor Riesgo
                </span>
                <p class="p360r__perspectiva-val">{{ current()!.report.perspectivaMasRiesgosa }}</p>
              </div>
            }
            @if (current()!.report.perspectivaMasOportunidad) {
              <div class="p360r__perspectiva-card p360r__perspectiva-card--opportunity">
                <span class="p360r__perspectiva-label">
                  <i class="pi pi-arrow-up-right"></i> Mayor Oportunidad
                </span>
                <p class="p360r__perspectiva-val">{{ current()!.report.perspectivaMasOportunidad }}</p>
              </div>
            }
          </div>

          <!-- Insights clave -->
          @if (current()!.report.insightsClave.length) {
            <div class="p360r__block">
              <h4 class="p360r__block-title">
                <i class="pi pi-lightbulb"></i>
                Insights Clave
              </h4>
              <ul class="p360r__list">
                @for (ins of current()!.report.insightsClave; track $index) {
                  <li class="p360r__list-item p360r__list-item--insight">{{ ins }}</li>
                }
              </ul>
            </div>
          }

          <!-- Tensiones detectadas -->
          @if (current()!.report.tensionesDetectadas.length) {
            <div class="p360r__block p360r__block--tension">
              <h4 class="p360r__block-title">
                <i class="pi pi-arrows-h"></i>
                Tensiones Entre Perspectivas
              </h4>
              <div class="p360r__tensiones-list">
                @for (t of current()!.report.tensionesDetectadas; track $index) {
                  <div class="p360r__tension-card">
                    <div class="p360r__tension-tags">
                      @for (p of t.perspectivas; track $index) {
                        <span class="p360r__tension-tag">{{ p }}</span>
                      }
                    </div>
                    <p class="p360r__tension-text">{{ t.tension }}</p>
                    <p class="p360r__tension-impl">
                      <i class="pi pi-arrow-right"></i>
                      {{ t.implicancia }}
                    </p>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Oportunidades -->
          @if (current()!.report.oportunidades.length) {
            <div class="p360r__block">
              <h4 class="p360r__block-title">
                <i class="pi pi-arrow-up-right"></i>
                Oportunidades
              </h4>
              <ul class="p360r__list">
                @for (o of current()!.report.oportunidades; track $index) {
                  <li class="p360r__list-item p360r__list-item--opportunity">{{ o }}</li>
                }
              </ul>
            </div>
          }

          <!-- Recomendaciones -->
          @if (current()!.report.recommendations.length) {
            <div class="p360r__block p360r__block--recommendations">
              <h4 class="p360r__block-title">
                <i class="pi pi-list-check"></i>
                Recomendaciones
              </h4>
              <ol class="p360r__list p360r__list--ordered">
                @for (r of current()!.report.recommendations; track $index) {
                  <li class="p360r__list-item">{{ r }}</li>
                }
              </ol>
            </div>
          }

        </div>
      }
    }
  `,
  styles: [`
    .p360r__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 48px 24px;
      color: var(--p-surface-400);
      text-align: center;
    }

    .p360r__empty i {
      font-size: 36px;
      opacity: 0.4;
    }

    .p360r__empty p {
      font-size: 13px;
      max-width: 320px;
      line-height: 1.5;
    }

    .p360r__version-bar {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }

    .p360r__version-btn {
      padding: 5px 12px;
      border-radius: 6px;
      border: 1px solid var(--p-surface-300);
      background: white;
      font-size: 12px;
      color: var(--p-surface-600);
      cursor: pointer;
      transition: all 0.15s;
    }

    .p360r__version-btn--active {
      background: var(--p-indigo-50);
      border-color: var(--p-indigo-300);
      color: var(--p-indigo-700);
      font-weight: 600;
    }

    .p360r__report {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .p360r__summary {
      display: flex;
      gap: 12px;
      padding: 14px 16px;
      background: var(--p-indigo-50);
      border: 1px solid var(--p-indigo-100);
      border-radius: 10px;
      align-items: flex-start;
    }

    .p360r__summary-icon {
      color: #6366f1;
      font-size: 15px;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .p360r__summary-text {
      font-size: 13px;
      line-height: 1.6;
      color: var(--p-surface-700);
      margin: 0;
    }

    .p360r__brecha {
      background: var(--p-red-50);
      border: 1px solid var(--p-red-200);
      border-radius: 10px;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .p360r__brecha-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 700;
      color: var(--p-red-600);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .p360r__brecha-text {
      font-size: 13px;
      color: var(--p-surface-700);
      margin: 0;
      line-height: 1.5;
    }

    .p360r__perspectivas-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .p360r__perspectiva-card {
      border-radius: 10px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .p360r__perspectiva-card--risk {
      background: var(--p-orange-50);
      border: 1px solid var(--p-orange-100);
    }

    .p360r__perspectiva-card--opportunity {
      background: var(--p-green-50);
      border: 1px solid var(--p-green-100);
    }

    .p360r__perspectiva-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--p-surface-600);
    }

    .p360r__perspectiva-val {
      font-size: 13px;
      color: var(--p-surface-700);
      margin: 0;
      line-height: 1.4;
      font-weight: 500;
    }

    .p360r__block {
      background: var(--p-surface-50);
      border: 1px solid var(--p-surface-200);
      border-radius: 10px;
      padding: 14px 16px;
    }

    .p360r__block--tension {
      background: var(--p-amber-50);
      border-color: var(--p-amber-100);
    }

    .p360r__block--recommendations {
      background: var(--p-blue-50);
      border-color: var(--p-blue-100);
    }

    .p360r__block-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 700;
      color: var(--p-surface-700);
      margin: 0 0 12px 0;
    }

    .p360r__tensiones-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .p360r__tension-card {
      background: white;
      border: 1px solid var(--p-surface-200);
      border-radius: 8px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .p360r__tension-tags {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .p360r__tension-tag {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      background: var(--p-indigo-50);
      color: var(--p-indigo-600);
      padding: 2px 8px;
      border-radius: 10px;
      letter-spacing: 0.5px;
    }

    .p360r__tension-text {
      font-size: 13px;
      color: var(--p-surface-700);
      margin: 0;
      line-height: 1.4;
      font-weight: 500;
    }

    .p360r__tension-impl {
      font-size: 12px;
      color: var(--p-surface-500);
      margin: 0;
      display: flex;
      gap: 5px;
      align-items: flex-start;
      line-height: 1.4;
    }

    .p360r__list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 0;
      margin: 0;
      list-style: none;
    }

    .p360r__list--ordered {
      counter-reset: item;
    }

    .p360r__list-item {
      font-size: 13px;
      color: var(--p-surface-700);
      line-height: 1.5;
      padding: 6px 10px;
      border-radius: 6px;
      background: white;
      border: 1px solid var(--p-surface-200);
    }

    .p360r__list--ordered .p360r__list-item {
      counter-increment: item;
      padding-left: 32px;
      position: relative;
    }

    .p360r__list--ordered .p360r__list-item::before {
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

    .p360r__list-item--insight {
      border-left: 3px solid #6366f1;
    }

    .p360r__list-item--opportunity {
      border-left: 3px solid var(--p-green-400);
    }

    @media (max-width: 640px) {
      .p360r__perspectivas-row {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class Perspectiva360ReportComponent {
  reports = input<Perspectiva360ReportVersionDto[]>([]);
  selectedIndex = signal(0);
  current = computed(() => this.reports()[this.selectedIndex()] ?? null);
}
