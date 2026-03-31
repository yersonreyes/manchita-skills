import { Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SistemaReportVersionDto } from './diagrama-sistema.types';

@Component({
  selector: 'app-diagrama-sistema-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (reports().length === 0) {
      <div class="dsr__empty">
        <i class="pi pi-share-alt"></i>
        <p>Aún no hay informes. Agregá actores y conexiones, luego hacé clic en "Analizar".</p>
      </div>
    } @else {
      @if (reports().length > 1) {
        <div class="dsr__version-bar">
          @for (r of reports(); track r.version; let i = $index) {
            <button
              class="dsr__version-btn"
              [class.dsr__version-btn--active]="selectedIndex() === i"
              (click)="selectedIndex.set(i)"
            >
              v{{ r.version }} — {{ r.generatedAt | date:'dd/MM/yy HH:mm' }}
            </button>
          }
        </div>
      }

      @if (current()) {
        <div class="dsr__report">

          <div class="dsr__summary">
            <p>{{ current()!.report.executiveSummary }}</p>
          </div>

          <div class="dsr__grid">

            @if (current()!.report.actoresClave.length) {
              <div class="dsr__card dsr__card--actores">
                <h4 class="dsr__card-title">
                  <i class="pi pi-users"></i>
                  Actores clave
                </h4>
                <ul class="dsr__list">
                  @for (item of current()!.report.actoresClave; track $index) {
                    <li>{{ item }}</li>
                  }
                </ul>
              </div>
            }

            @if (current()!.report.flujosImportantes.length) {
              <div class="dsr__card dsr__card--flujos">
                <h4 class="dsr__card-title">
                  <i class="pi pi-arrow-right-arrow-left"></i>
                  Flujos importantes
                </h4>
                <ul class="dsr__list">
                  @for (item of current()!.report.flujosImportantes; track $index) {
                    <li>{{ item }}</li>
                  }
                </ul>
              </div>
            }

          </div>

          @if (current()!.report.buclesIdentificados.length) {
            <div class="dsr__bucles">
              <h4 class="dsr__card-title">
                <i class="pi pi-sync"></i>
                Bucles identificados
              </h4>
              <ul class="dsr__list">
                @for (item of current()!.report.buclesIdentificados; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          }

          @if (current()!.report.puntasDePalanca.length) {
            <div class="dsr__palanca">
              <h4 class="dsr__card-title">
                <i class="pi pi-chart-line"></i>
                Puntos de palanca
              </h4>
              <ul class="dsr__list">
                @for (item of current()!.report.puntasDePalanca; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          }

          <div class="dsr__recommendations">
            <h4 class="dsr__card-title">
              <i class="pi pi-list-check"></i>
              Recomendaciones
            </h4>
            <ol class="dsr__list dsr__list--ordered">
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
    .dsr__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 40px 20px;
      color: var(--p-text-muted-color);
      text-align: center;
    }

    .dsr__empty .pi { font-size: 1.5rem; opacity: 0.4; }
    .dsr__empty p { font-size: 0.82rem; margin: 0; max-width: 300px; line-height: 1.5; }

    .dsr__version-bar {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }

    .dsr__version-btn {
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

    .dsr__version-btn:hover { background: var(--p-surface-100); }

    .dsr__version-btn--active {
      background: #eff6ff;
      border-color: #bfdbfe;
      color: #1d4ed8;
      font-weight: 600;
    }

    .dsr__report {
      display: flex;
      flex-direction: column;
      gap: 12px;
      overflow-y: auto;
    }

    .dsr__summary {
      padding: 12px 14px;
      background: var(--p-surface-50, #f9fafb);
      border-radius: 10px;
      border: 1px solid var(--p-surface-200);
    }

    .dsr__summary p { margin: 0; font-size: 0.84rem; line-height: 1.6; color: var(--p-text-color); }

    .dsr__grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .dsr__card {
      border-radius: 10px;
      padding: 12px 14px;
      border: 1px solid;
    }

    .dsr__card--actores {
      background: #eff6ff;
      border-color: #bfdbfe;
    }

    .dsr__card--actores .dsr__card-title { color: #1d4ed8; }

    .dsr__card--flujos {
      background: #f0fdf4;
      border-color: #bbf7d0;
    }

    .dsr__card--flujos .dsr__card-title { color: #047857; }

    .dsr__bucles {
      padding: 12px 14px;
      background: #f5f3ff;
      border-radius: 10px;
      border: 1px solid #ddd6fe;
    }

    .dsr__bucles .dsr__card-title { color: #6d28d9; }

    .dsr__palanca {
      padding: 12px 14px;
      background: #fffbeb;
      border-radius: 10px;
      border: 1px solid #fde68a;
    }

    .dsr__palanca .dsr__card-title { color: #b45309; }

    .dsr__recommendations {
      padding: 12px 14px;
      background: var(--p-surface-50, #f9fafb);
      border-radius: 10px;
      border: 1px solid var(--p-surface-200);
    }

    .dsr__card-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: 'Syne', sans-serif;
      font-size: 0.78rem;
      font-weight: 700;
      margin: 0 0 8px;
    }

    .dsr__card-title .pi { font-size: 0.8rem; }

    .dsr__list {
      margin: 0;
      padding-left: 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .dsr__list li { font-size: 0.8rem; line-height: 1.5; color: var(--p-text-color); }

    .dsr__list--ordered {
      padding-left: 20px;
    }

    .dsr__list--ordered li { font-size: 0.82rem; }
  `],
})
export class DiagramaSistemaReportComponent {
  reports = input<SistemaReportVersionDto[]>([]);
  selectedIndex = signal(0);
  current = computed(() => this.reports()[this.selectedIndex()] ?? null);
}
