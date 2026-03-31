import { Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { InOutReportVersionDto } from './in-out.types';

@Component({
  selector: 'app-in-out-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (reports().length === 0) {
      <div class="ior__empty">
        <i class="pi pi-sitemap"></i>
        <p>Aún no hay informes. Agregá inputs y outputs, luego hacé clic en "Analizar".</p>
      </div>
    } @else {
      @if (reports().length > 1) {
        <div class="ior__version-bar">
          @for (r of reports(); track r.version; let i = $index) {
            <button
              class="ior__version-btn"
              [class.ior__version-btn--active]="selectedIndex() === i"
              (click)="selectedIndex.set(i)"
            >
              v{{ r.version }} — {{ r.generatedAt | date:'dd/MM/yy HH:mm' }}
            </button>
          }
        </div>
      }

      @if (current()) {
        <div class="ior__report">

          <div class="ior__summary">
            <p>{{ current()!.report.executiveSummary }}</p>
          </div>

          <div class="ior__grid">

            @if (current()!.report.inputsOcultos.length) {
              <div class="ior__card ior__card--inputs">
                <h4 class="ior__card-title">
                  <i class="pi pi-eye-slash"></i>
                  Inputs ocultos
                </h4>
                <ul class="ior__list">
                  @for (item of current()!.report.inputsOcultos; track $index) {
                    <li>{{ item }}</li>
                  }
                </ul>
              </div>
            }

            @if (current()!.report.outputsOcultos.length) {
              <div class="ior__card ior__card--outputs">
                <h4 class="ior__card-title">
                  <i class="pi pi-eye-slash"></i>
                  Outputs ocultos
                </h4>
                <ul class="ior__list">
                  @for (item of current()!.report.outputsOcultos; track $index) {
                    <li>{{ item }}</li>
                  }
                </ul>
              </div>
            }

          </div>

          @if (current()!.report.gapsIdentificados.length) {
            <div class="ior__gaps">
              <h4 class="ior__card-title">
                <i class="pi pi-exclamation-triangle"></i>
                Gaps identificados
              </h4>
              <ul class="ior__list">
                @for (gap of current()!.report.gapsIdentificados; track $index) {
                  <li>{{ gap }}</li>
                }
              </ul>
            </div>
          }

          <div class="ior__recommendations">
            <h4 class="ior__card-title">
              <i class="pi pi-list-check"></i>
              Recomendaciones
            </h4>
            <ol class="ior__list ior__list--ordered">
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
    .ior__empty {
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

    .ior__version-bar {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }

    .ior__version-btn {
      padding: 4px 10px;
      border-radius: 20px;
      border: 1px solid var(--p-surface-300);
      background: transparent;
      font-size: 0.72rem;
      cursor: pointer;
      color: var(--p-text-secondary-color);
      transition: all 0.15s;
      font-family: inherit;
    }

    .ior__version-btn:hover {
      background: var(--p-surface-100);
    }

    .ior__version-btn--active {
      background: #eff6ff;
      border-color: #bfdbfe;
      color: #1d4ed8;
      font-weight: 600;
    }

    .ior__report {
      display: flex;
      flex-direction: column;
      gap: 12px;
      overflow-y: auto;
    }

    .ior__summary {
      padding: 12px 14px;
      background: var(--p-surface-50, #f9fafb);
      border-radius: 10px;
      border: 1px solid var(--p-surface-200);

      p { margin: 0; font-size: 0.84rem; line-height: 1.6; color: var(--p-text-color); }
    }

    .ior__grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .ior__card {
      border-radius: 10px;
      padding: 12px 14px;
      border: 1px solid;
    }

    .ior__card--inputs {
      background: #eff6ff;
      border-color: #bfdbfe;

      .ior__card-title { color: #1d4ed8; }
    }

    .ior__card--outputs {
      background: #f0fdf4;
      border-color: #bbf7d0;

      .ior__card-title { color: #047857; }
    }

    .ior__gaps {
      padding: 12px 14px;
      background: #fffbeb;
      border-radius: 10px;
      border: 1px solid #fde68a;

      .ior__card-title { color: #b45309; }
    }

    .ior__recommendations {
      padding: 12px 14px;
      background: var(--p-surface-50, #f9fafb);
      border-radius: 10px;
      border: 1px solid var(--p-surface-200);
    }

    .ior__card-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: 'Syne', sans-serif;
      font-size: 0.78rem;
      font-weight: 700;
      margin: 0 0 8px;

      .pi { font-size: 0.8rem; }
    }

    .ior__list {
      margin: 0;
      padding-left: 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;

      li { font-size: 0.8rem; line-height: 1.5; color: var(--p-text-color); }
    }

    .ior__list--ordered {
      padding-left: 20px;

      li { font-size: 0.82rem; }
    }
  `],
})
export class InOutReportComponent {
  reports = input<InOutReportVersionDto[]>([]);
  selectedIndex = signal(0);
  current = computed(() => this.reports()[this.selectedIndex()] ?? null);
}
