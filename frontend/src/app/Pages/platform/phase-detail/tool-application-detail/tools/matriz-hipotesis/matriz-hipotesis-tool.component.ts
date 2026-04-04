import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { MatrizHipotesisService } from '@core/services/matrizHipotesisService/matriz-hipotesis.service';
import { MatrizHipotesisReportComponent } from './matriz-hipotesis-report.component';
import {
  CUADRANTE_CONFIG,
  EMPTY_MATRIZ_HIPOTESIS,
  HipotesisDto,
  Impacto,
  Incertidumbre,
  MatrizHipotesisData,
  MatrizHipotesisReportVersionDto,
  calcularCuadrante,
} from './matriz-hipotesis.types';

@Component({
  selector: 'app-matriz-hipotesis-tool',
  standalone: true,
  imports: [FormsModule, MatrizHipotesisReportComponent],
  template: `
    <div class="mh">

      <!-- ─── Header ──────────────────────────────────────────────────────── -->
      <div class="mh__header">
        <div class="mh__header-left">
          <span class="mh__badge">MH</span>
          <div>
            <p class="mh__title">Matriz de Hipótesis</p>
            <p class="mh__subtitle">
              {{ data().hipotesis.length }} hipótesis
              @if (priorityCount() > 0) { · <span class="mh__stat--priority">{{ priorityCount() }} priority</span> }
              @if (saving()) { <span class="mh__saving"> · guardando…</span> }
            </p>
          </div>
        </div>
        <div class="mh__header-actions">
          @if (reports().length > 0) {
            <button class="mh__btn-ghost" (click)="showReport.set(!showReport())">
              @if (showReport()) {
                <i class="pi pi-arrow-left"></i> Formulario
              } @else {
                <i class="pi pi-file-check"></i> Informes ({{ reports().length }})
              }
            </button>
          }
          <button
            class="mh__btn-primary"
            [disabled]="!canGenerate() || analyzing()"
            (click)="generateReport()"
          >
            @if (analyzing()) {
              <i class="pi pi-spin pi-spinner"></i> Analizando…
            } @else {
              <i class="pi pi-sparkles"></i> Analizar
            }
          </button>
        </div>
      </div>

      @if (showReport()) {
        <app-matriz-hipotesis-report [reports]="reports()" />
      } @else {

        <!-- ─── Contexto ──────────────────────────────────────────────────── -->
        <div class="mh__section">
          <label class="mh__label">Contexto del análisis de hipótesis</label>
          <textarea
            class="mh__textarea"
            rows="2"
            placeholder="Ej: Hipótesis generadas en la fase de Definición para validar las principales asunciones del rediseño de checkout…"
            [ngModel]="data().contexto"
            (ngModelChange)="updateContexto($event)"
          ></textarea>
        </div>

        <!-- ─── Leyenda de cuadrantes ─────────────────────────────────────── -->
        <div class="mh__legend">
          <div class="mh__legend-item mh__legend-item--priority">
            <i class="pi pi-trophy"></i> PRIORITY — Alto impacto + Alta incertidumbre: validar primero
          </div>
          <div class="mh__legend-item mh__legend-item--later">
            <i class="pi pi-clock"></i> LATER — Alto impacto + Baja incertidumbre: validar después
          </div>
          <div class="mh__legend-item mh__legend-item--drop">
            <i class="pi pi-times-circle"></i> DROP — Bajo impacto + Alta incertidumbre: descartar
          </div>
          <div class="mh__legend-item mh__legend-item--optional">
            <i class="pi pi-minus-circle"></i> OPTIONAL — Bajo impacto + Baja incertidumbre
          </div>
        </div>

        <!-- ─── Lista de hipótesis ────────────────────────────────────────── -->
        <div class="mh__list">
          @for (hip of data().hipotesis; track hip.id; let i = $index) {
            @let cuadrante = getCuadrante(hip);
            @let cfg = config[cuadrante];

            <div class="mh__card" [style.border-left-color]="cfg.color">

              <!-- Card header -->
              <div class="mh__card-top">
                <div class="mh__card-num">{{ i + 1 }}</div>

                <!-- Cuadrante badge -->
                <span
                  class="mh__cuadrante"
                  [style.color]="cfg.color"
                  [style.background]="cfg.bg"
                  [style.border-color]="cfg.border"
                >
                  <i class="pi {{ cfg.icon }}"></i>
                  {{ cfg.label }}
                </span>

                <!-- Evaluadores -->
                <div class="mh__evals">
                  <div class="mh__eval-group">
                    <span class="mh__eval-label">Impacto</span>
                    <div class="mh__toggle">
                      <button
                        class="mh__toggle-btn"
                        [class.mh__toggle-btn--active-high]="hip.impacto === 'alto'"
                        (click)="updateHipotesis(hip.id, 'impacto', 'alto')"
                      >Alto</button>
                      <button
                        class="mh__toggle-btn"
                        [class.mh__toggle-btn--active-low]="hip.impacto === 'bajo'"
                        (click)="updateHipotesis(hip.id, 'impacto', 'bajo')"
                      >Bajo</button>
                    </div>
                  </div>
                  <div class="mh__eval-group">
                    <span class="mh__eval-label">Incertidumbre</span>
                    <div class="mh__toggle">
                      <button
                        class="mh__toggle-btn"
                        [class.mh__toggle-btn--active-high]="hip.incertidumbre === 'alta'"
                        (click)="updateHipotesis(hip.id, 'incertidumbre', 'alta')"
                      >Alta</button>
                      <button
                        class="mh__toggle-btn"
                        [class.mh__toggle-btn--active-low]="hip.incertidumbre === 'baja'"
                        (click)="updateHipotesis(hip.id, 'incertidumbre', 'baja')"
                      >Baja</button>
                    </div>
                  </div>
                </div>

                <button class="mh__card-delete" (click)="removeHipotesis(hip.id)" title="Eliminar hipótesis">
                  <i class="pi pi-trash"></i>
                </button>
              </div>

              <!-- Formulación -->
              <div class="mh__card-body">
                <label class="mh__label">Formulación <span class="mh__hint">— "Si hacemos X, entonces Y, porque Z"</span></label>
                <textarea
                  class="mh__textarea mh__textarea--sm"
                  rows="2"
                  placeholder="Si implementamos el checkout express, entonces reduciremos el abandono un 20%, porque los usuarios abandonan en el paso de datos de envío."
                  [ngModel]="hip.formulacion"
                  (ngModelChange)="updateHipotesis(hip.id, 'formulacion', $event)"
                ></textarea>

                <label class="mh__label mh__label--mt">Experimento para validar</label>
                <textarea
                  class="mh__textarea mh__textarea--sm"
                  rows="2"
                  placeholder="Ej: A/B test con 500 usuarios durante 2 semanas midiendo tasa de abandono en el paso 3."
                  [ngModel]="hip.experimento"
                  (ngModelChange)="updateHipotesis(hip.id, 'experimento', $event)"
                ></textarea>
              </div>

            </div>
          }

          <!-- Agregar hipótesis -->
          <button class="mh__add" (click)="addHipotesis()">
            <i class="pi pi-plus"></i>
            Agregar hipótesis
          </button>
        </div>

      }
    </div>
  `,
  styles: [`
    .mh { display: flex; flex-direction: column; gap: 16px; }

    .mh__header {
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px; flex-wrap: wrap;
    }
    .mh__header-left { display: flex; align-items: center; gap: 10px; }
    .mh__badge {
      width: 36px; height: 36px; border-radius: 10px;
      background: linear-gradient(135deg, #7c3aed, #6d28d9);
      color: #fff; font-size: 0.6rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      letter-spacing: 0.02em; flex-shrink: 0;
    }
    .mh__title { margin: 0; font-size: 0.9375rem; font-weight: 700; color: #111827; }
    .mh__subtitle { margin: 0; font-size: 0.78rem; color: #6b7280; }
    .mh__stat--priority { color: #7c3aed; font-weight: 600; }
    .mh__saving { color: #7c3aed; }

    .mh__header-actions { display: flex; gap: 8px; align-items: center; }

    .mh__btn-ghost {
      display: flex; align-items: center; gap: 5px;
      padding: 6px 12px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: transparent;
      font-size: 0.8125rem; color: var(--p-text-color); cursor: pointer;
      transition: background 0.15s; font-family: inherit;
    }
    .mh__btn-ghost:hover { background: var(--p-surface-100); }

    .mh__btn-primary {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 8px; border: none;
      background: linear-gradient(135deg, #7c3aed, #6d28d9);
      color: #fff; font-size: 0.8125rem; font-weight: 600; cursor: pointer;
      transition: opacity 0.15s; font-family: inherit;
    }
    .mh__btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
    .mh__btn-primary:not(:disabled):hover { opacity: 0.9; }

    .mh__section { display: flex; flex-direction: column; gap: 4px; }
    .mh__label { font-size: 0.78rem; font-weight: 600; color: #6b7280; }
    .mh__label--mt { margin-top: 10px; }
    .mh__hint { font-weight: 400; color: #9ca3af; }

    .mh__textarea {
      width: 100%; box-sizing: border-box;
      padding: 8px 10px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: var(--p-surface-0);
      font-size: 0.8125rem; color: var(--p-text-color); line-height: 1.5;
      resize: vertical; font-family: inherit; transition: border-color 0.15s;
    }
    .mh__textarea:focus { outline: none; border-color: #7c3aed; }

    /* Leyenda */
    .mh__legend { display: flex; flex-wrap: wrap; gap: 6px; }
    .mh__legend-item {
      display: flex; align-items: center; gap: 5px;
      padding: 3px 9px; border-radius: 20px;
      font-size: 0.7rem; font-weight: 600; border: 1px solid;
    }
    .mh__legend-item .pi { font-size: 0.68rem; }
    .mh__legend-item--priority { color: #92400e; background: #fffbeb; border-color: #fde68a; }
    .mh__legend-item--later    { color: #1e40af; background: #eff6ff; border-color: #bfdbfe; }
    .mh__legend-item--drop     { color: #991b1b; background: #fef2f2; border-color: #fecaca; }
    .mh__legend-item--optional { color: #6b7280; background: var(--p-surface-50); border-color: var(--p-surface-200); }

    /* Lista */
    .mh__list { display: flex; flex-direction: column; gap: 8px; }

    /* Card */
    .mh__card {
      border: 1px solid var(--p-surface-200); background: var(--p-surface-0);
      border-left: 3px solid #7c3aed; border-radius: 10px; overflow: hidden;
      transition: border-color 0.15s;
    }

    .mh__card-top {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 12px; background: var(--p-surface-50);
      border-bottom: 1px solid var(--p-surface-200); flex-wrap: wrap;
    }
    .mh__card-num {
      width: 20px; height: 20px; border-radius: 50%;
      background: var(--p-surface-200); color: #6b7280;
      font-size: 0.68rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }

    .mh__cuadrante {
      display: flex; align-items: center; gap: 4px;
      padding: 2px 8px; border-radius: 20px; border: 1px solid;
      font-size: 0.63rem; font-weight: 800; letter-spacing: 0.04em;
    }
    .mh__cuadrante .pi { font-size: 0.63rem; }

    .mh__evals { display: flex; gap: 10px; flex: 1; flex-wrap: wrap; }
    .mh__eval-group { display: flex; flex-direction: column; gap: 2px; }
    .mh__eval-label {
      font-size: 0.63rem; font-weight: 600; color: #9ca3af;
      text-transform: uppercase; letter-spacing: 0.04em;
    }
    .mh__toggle {
      display: flex; border-radius: 6px; overflow: hidden;
      border: 1px solid var(--p-surface-300);
    }
    .mh__toggle-btn {
      padding: 2px 9px; border: none; background: transparent;
      font-size: 0.72rem; font-weight: 500; color: #9ca3af;
      cursor: pointer; transition: all 0.12s; font-family: inherit;
    }
    .mh__toggle-btn:hover { background: var(--p-surface-100); color: var(--p-text-color); }
    .mh__toggle-btn--active-high { background: #fef3c7; color: #92400e; font-weight: 700; }
    .mh__toggle-btn--active-low  { background: #f0fdf4; color: #065f46; font-weight: 700; }

    .mh__card-delete {
      margin-left: auto; width: 22px; height: 22px; border-radius: 4px; border: none;
      background: transparent; color: #d1d5db;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: color 0.15s, background 0.15s; flex-shrink: 0;
    }
    .mh__card-delete .pi { font-size: 0.6rem; }
    .mh__card-delete:hover { color: #ef4444; background: #fee2e2; }

    .mh__card-body { display: flex; flex-direction: column; padding: 10px 12px; }

    /* Agregar */
    .mh__add {
      display: flex; align-items: center; justify-content: center; gap: 5px;
      padding: 8px; border-radius: 10px; border: 2px dashed var(--p-surface-300);
      background: transparent; color: #9ca3af;
      font-size: 0.78rem; cursor: pointer; transition: all 0.15s; font-family: inherit;
    }
    .mh__add:hover { border-color: #7c3aed; color: #7c3aed; background: #faf5ff; }
    .mh__add .pi { font-size: 0.7rem; }
  `],
})
export class MatrizHipotesisToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly matrizHipotesisService = inject(MatrizHipotesisService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<MatrizHipotesisData>({ ...EMPTY_MATRIZ_HIPOTESIS });
  reports = signal<MatrizHipotesisReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  readonly config = CUADRANTE_CONFIG;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  priorityCount = computed(() => this.data().hipotesis.filter(h => calcularCuadrante(h.impacto, h.incertidumbre) === 'priority').length);

  canGenerate = computed(() => {
    const d = this.data();
    return d.contexto.trim().length > 0 && d.hipotesis.length >= 2 && d.hipotesis.some(h => h.formulacion.trim().length > 0);
  });

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;
    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as MatrizHipotesisData | undefined;
    const storedReports = (raw['reports'] as MatrizHipotesisReportVersionDto[]) ?? [];
    this.data.set(stored ?? { ...EMPTY_MATRIZ_HIPOTESIS });
    this.reports.set(storedReports);
  }

  getCuadrante(hip: HipotesisDto) {
    return calcularCuadrante(hip.impacto, hip.incertidumbre);
  }

  updateContexto(value: string): void {
    this.data.set({ ...this.data(), contexto: value });
    this.scheduleSave();
  }

  addHipotesis(): void {
    const newHip: HipotesisDto = {
      id: crypto.randomUUID(),
      formulacion: '',
      impacto: 'alto',
      incertidumbre: 'alta',
      experimento: '',
    };
    this.data.set({ ...this.data(), hipotesis: [...this.data().hipotesis, newHip] });
    this.scheduleSave();
  }

  removeHipotesis(id: string): void {
    this.data.set({ ...this.data(), hipotesis: this.data().hipotesis.filter(h => h.id !== id) });
    this.scheduleSave();
  }

  updateHipotesis(id: string, field: keyof HipotesisDto, value: string): void {
    this.data.set({
      ...this.data(),
      hipotesis: this.data().hipotesis.map(h =>
        h.id === id ? { ...h, [field]: value as Impacto | Incertidumbre | string } : h
      ),
    });
    this.scheduleSave();
  }

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;
    this.analyzing.set(true);
    try {
      const result = await this.matrizHipotesisService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });
      const newVersion: MatrizHipotesisReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };
      const updated = [newVersion, ...this.reports()];
      this.reports.set(updated);
      await this.persistData(updated);
      this.showReport.set(true);
      this.uiDialog.showSuccess('Análisis generado', 'La Matriz de Hipótesis fue analizada correctamente.');
    } catch (error) {
      this.uiDialog.showError('Error', `No se pudo generar el análisis: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      this.analyzing.set(false);
    }
  }

  private scheduleSave(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => void this.saveData(), 800);
  }

  private async saveData(): Promise<void> {
    const app = this.application();
    if (!app) return;
    this.saving.set(true);
    try {
      const currentData = (app.structuredData as Record<string, unknown>) ?? {};
      await this.toolApplicationService.update(app.id, {
        structuredData: { ...currentData, data: this.data() },
      });
      this.sessionSaved.emit();
    } catch { /* silent */ }
    finally { this.saving.set(false); }
  }

  private async persistData(reports: MatrizHipotesisReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
