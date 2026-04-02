import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { FromToService } from '@core/services/fromToService/from-to.service';
import { FromToReportComponent } from './from-to-report.component';
import {
  EMPTY_FROM_TO,
  FromToData,
  FromToReportVersionDto,
  TransformacionDto,
} from './from-to.types';

@Component({
  selector: 'app-from-to-tool',
  standalone: true,
  imports: [FormsModule, FromToReportComponent],
  template: `
    <div class="ft">

      <!-- Header -->
      <div class="ft__header">
        <div class="ft__header-left">
          <div class="ft__badge">
            <i class="pi pi-arrow-right"></i>
          </div>
          <div class="ft__title-block">
            <span class="ft__title">From-To</span>
            <span class="ft__subtitle">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              } @else {
                {{ filledCount() }} par{{ filledCount() !== 1 ? 'es' : '' }} definido{{ filledCount() !== 1 ? 's' : '' }}
              }
            </span>
          </div>
        </div>
        <div class="ft__header-actions">
          <button
            class="ft__btn ft__btn--ghost"
            (click)="showReport.set(!showReport())"
            [class.ft__btn--active]="showReport()"
          >
            <i class="pi pi-chart-bar"></i>
            Informes {{ reports().length ? '(' + reports().length + ')' : '' }}
          </button>
          <button
            class="ft__btn ft__btn--primary"
            (click)="generateReport()"
            [disabled]="!canGenerate() || analyzing()"
            [title]="!canGenerate() ? 'Definí al menos 3 pares FROM-TO para analizar' : 'Generar informe con IA'"
          >
            @if (analyzing()) {
              <i class="pi pi-spin pi-spinner"></i> Analizando...
            } @else {
              <i class="pi pi-sparkles"></i> Analizar
            }
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="ft__content">
        @if (showReport()) {
          <app-from-to-report [reports]="reports()" />
        } @else {

          <!-- Título -->
          <div class="ft__field">
            <label class="ft__label">
              <i class="pi pi-tag"></i> Título del diagrama
            </label>
            <input
              class="ft__input"
              type="text"
              [ngModel]="data().titulo"
              (ngModelChange)="onFieldChange('titulo', $event)"
              placeholder="Ej: From-To — App de pagos para freelancers"
            />
          </div>

          <!-- Contexto actual + Visión de futuro -->
          <div class="ft__context-grid">
            <div class="ft__context-col ft__context-col--from">
              <label class="ft__context-label">
                <i class="pi pi-circle"></i> Contexto actual (FROM)
              </label>
              <textarea
                class="ft__textarea"
                [ngModel]="data().contextoActual"
                (ngModelChange)="onFieldChange('contextoActual', $event)"
                placeholder="Describí la situación actual: cuál es el problema, quién lo sufre, cuándo y dónde ocurre..."
                rows="3"
              ></textarea>
            </div>
            <div class="ft__context-col ft__context-col--to">
              <label class="ft__context-label">
                <i class="pi pi-check-circle"></i> Visión de futuro (TO)
              </label>
              <textarea
                class="ft__textarea"
                [ngModel]="data().visionFuturo"
                (ngModelChange)="onFieldChange('visionFuturo', $event)"
                placeholder="Describí el estado deseado: cómo será diferente la experiencia, qué se habrá transformado..."
                rows="3"
              ></textarea>
            </div>
          </div>

          <!-- Transformaciones table -->
          <div class="ft__table-wrap">
            <div class="ft__table-header">
              <div class="ft__col-label ft__col-label--from">
                <span class="ft__col-pill ft__col-pill--from">FROM</span>
                Estado actual
              </div>
              <div class="ft__col-arrow"></div>
              <div class="ft__col-label ft__col-label--to">
                <span class="ft__col-pill ft__col-pill--to">TO</span>
                Estado futuro
              </div>
              <div class="ft__col-actions"></div>
            </div>

            <div class="ft__rows">
              @for (t of data().transformaciones; track t.id; let i = $index) {
                <div class="ft__row">
                  <input
                    class="ft__row-input ft__row-input--from"
                    type="text"
                    [ngModel]="t.from"
                    (ngModelChange)="updateTransformacion(i, 'from', $event)"
                    placeholder="Ej: Cobrar tarda 3-7 días"
                  />
                  <div class="ft__row-arrow">
                    <i class="pi pi-arrow-right"></i>
                  </div>
                  <input
                    class="ft__row-input ft__row-input--to"
                    type="text"
                    [ngModel]="t.to"
                    (ngModelChange)="updateTransformacion(i, 'to', $event)"
                    placeholder="Ej: Cobrar en segundos"
                  />
                  <button
                    class="ft__row-remove"
                    (click)="removeTransformacion(i)"
                    title="Eliminar"
                  >
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              }

              <!-- Add row -->
              <div class="ft__add-row">
                <input
                  class="ft__row-input ft__row-input--from"
                  type="text"
                  [(ngModel)]="newFrom"
                  placeholder="Nuevo estado actual..."
                  (keydown.enter)="addTransformacion()"
                />
                <div class="ft__row-arrow ft__row-arrow--add">
                  <i class="pi pi-arrow-right"></i>
                </div>
                <input
                  class="ft__row-input ft__row-input--to"
                  type="text"
                  [(ngModel)]="newTo"
                  placeholder="Estado futuro deseado..."
                  (keydown.enter)="addTransformacion()"
                />
                <button
                  class="ft__add-btn"
                  (click)="addTransformacion()"
                  [disabled]="!newFrom.trim() && !newTo.trim()"
                  title="Agregar transformación"
                >
                  <i class="pi pi-plus"></i>
                </button>
              </div>
            </div>
          </div>

        }
      </div>

    </div>
  `,
  styles: [`
    .ft {
      display: flex; flex-direction: column;
      height: 100%; gap: 12px;
    }

    /* ─── Header ─────────────────────────────────────────────────── */
    .ft__header {
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px; flex-shrink: 0;
      padding-bottom: 12px; border-bottom: 1px solid var(--p-surface-200);
    }

    .ft__header-left { display: flex; align-items: center; gap: 10px; }

    .ft__badge {
      width: 36px; height: 36px; border-radius: 8px;
      background: #fff7ed; color: #c2410c;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.875rem; flex-shrink: 0;
    }

    .ft__title-block { display: flex; flex-direction: column; gap: 1px; }

    .ft__title {
      font-family: 'Syne', sans-serif;
      font-size: 0.9375rem; font-weight: 700;
      color: var(--p-text-color); line-height: 1.2;
    }

    .ft__subtitle {
      font-size: 0.72rem; color: var(--p-text-muted-color);
      display: flex; align-items: center; gap: 4px;
    }

    .ft__header-actions { display: flex; align-items: center; gap: 8px; }

    /* ─── Buttons ─────────────────────────────────────────────────── */
    .ft__btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 7px 14px; border-radius: 8px;
      font-size: 0.8125rem; font-weight: 600;
      cursor: pointer; border: 1px solid transparent;
      transition: all 0.15s; white-space: nowrap;
    }
    .ft__btn .pi { font-size: 0.8rem; }
    .ft__btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .ft__btn--ghost {
      background: transparent; border-color: var(--p-surface-300);
      color: var(--p-text-secondary-color);
    }
    .ft__btn--ghost:hover:not(:disabled) { background: var(--p-surface-100); }
    .ft__btn--ghost.ft__btn--active { background: #fff7ed; border-color: #fed7aa; color: #c2410c; }

    .ft__btn--primary {
      background: var(--p-primary-600, #0284c7);
      color: white; border-color: var(--p-primary-600, #0284c7);
    }
    .ft__btn--primary:hover:not(:disabled) { background: var(--p-primary-700, #0369a1); }

    /* ─── Content ─────────────────────────────────────────────────── */
    .ft__content {
      flex: 1; min-height: 0;
      display: flex; flex-direction: column; gap: 10px;
    }

    /* ─── Field ───────────────────────────────────────────────────── */
    .ft__field { display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; }

    .ft__label {
      font-size: 0.72rem; font-weight: 700;
      letter-spacing: 0.05em; text-transform: uppercase;
      color: var(--p-text-secondary-color);
      display: flex; align-items: center; gap: 4px;
    }
    .ft__label .pi { font-size: 0.7rem; }

    .ft__input {
      padding: 7px 10px; border-radius: 8px;
      border: 1px solid var(--p-surface-300);
      font-size: 0.8125rem; background: var(--p-surface-0);
      color: var(--p-text-color); outline: none;
      transition: border-color 0.15s; width: 100%; box-sizing: border-box;
    }
    .ft__input::placeholder { color: #9ca3af; }
    .ft__input:focus { border-color: #ea580c; box-shadow: 0 0 0 2px rgba(234, 88, 12, 0.12); }

    /* ─── Context grid ────────────────────────────────────────────── */
    .ft__context-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 10px; flex-shrink: 0;
    }

    .ft__context-col { display: flex; flex-direction: column; gap: 4px; }

    .ft__context-label {
      font-size: 0.72rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.05em;
      display: flex; align-items: center; gap: 4px;
    }
    .ft__context-label .pi { font-size: 0.7rem; }

    .ft__context-col--from .ft__context-label { color: #c2410c; }
    .ft__context-col--to .ft__context-label { color: #15803d; }

    .ft__textarea {
      padding: 8px 10px; border-radius: 8px;
      border: 1px solid var(--p-surface-300);
      font-size: 0.8125rem; background: var(--p-surface-0);
      color: var(--p-text-color); outline: none;
      resize: vertical; transition: border-color 0.15s;
      font-family: inherit; line-height: 1.5;
      width: 100%; box-sizing: border-box;
    }
    .ft__textarea::placeholder { color: #9ca3af; }
    .ft__context-col--from .ft__textarea:focus { border-color: #ea580c; box-shadow: 0 0 0 2px rgba(234, 88, 12, 0.1); }
    .ft__context-col--to .ft__textarea:focus { border-color: #16a34a; box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.1); }

    /* ─── Table ───────────────────────────────────────────────────── */
    .ft__table-wrap {
      flex: 1; min-height: 0;
      display: flex; flex-direction: column;
      border: 1px solid var(--p-surface-200); border-radius: 12px;
      overflow: hidden;
    }

    .ft__table-header {
      display: grid; grid-template-columns: 1fr 32px 1fr 36px;
      gap: 8px; padding: 8px 12px;
      background: var(--p-surface-50);
      border-bottom: 1px solid var(--p-surface-200);
      flex-shrink: 0;
    }

    .ft__col-label {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.7rem; font-weight: 700; color: var(--p-text-secondary-color);
    }

    .ft__col-pill {
      font-size: 0.62rem; font-weight: 800;
      padding: 1px 6px; border-radius: 4px; color: white;
    }
    .ft__col-pill--from { background: #ea580c; }
    .ft__col-pill--to { background: #16a34a; }

    .ft__col-arrow { display: flex; align-items: center; justify-content: center; }
    .ft__col-actions { display: flex; align-items: center; justify-content: center; }

    .ft__rows {
      flex: 1; overflow-y: auto; min-height: 0;
      display: flex; flex-direction: column;
    }

    .ft__row {
      display: grid; grid-template-columns: 1fr 32px 1fr 36px;
      gap: 8px; padding: 6px 12px;
      border-bottom: 1px solid var(--p-surface-100);
      align-items: center;
    }
    .ft__row:hover { background: var(--p-surface-50); }

    .ft__row-input {
      padding: 5px 8px; border-radius: 7px;
      border: 1px solid transparent;
      font-size: 0.8125rem; background: transparent;
      color: var(--p-text-color); outline: none;
      transition: border-color 0.15s, background 0.15s;
      width: 100%; box-sizing: border-box;
    }
    .ft__row-input::placeholder { color: #d1d5db; }
    .ft__row-input--from:focus { border-color: #fed7aa; background: #fff7ed; }
    .ft__row-input--to:focus { border-color: #bbf7d0; background: #f0fdf4; }

    .ft__row-arrow {
      display: flex; align-items: center; justify-content: center;
      color: #9ca3af; font-size: 0.75rem;
    }
    .ft__row-arrow--add { color: #ea580c; }

    .ft__row-remove {
      opacity: 0; background: none; border: none; cursor: pointer;
      color: #9ca3af; font-size: 0.75rem; padding: 4px;
      border-radius: 6px; transition: all 0.15s;
      display: flex; align-items: center; justify-content: center;
    }
    .ft__row:hover .ft__row-remove { opacity: 1; }
    .ft__row-remove:hover { color: #ef4444; background: #fef2f2; }

    /* ─── Add row ─────────────────────────────────────────────────── */
    .ft__add-row {
      display: grid; grid-template-columns: 1fr 32px 1fr 36px;
      gap: 8px; padding: 6px 12px;
      background: #fff7ed; border-top: 1px dashed #fed7aa;
      align-items: center; flex-shrink: 0;
    }

    .ft__add-btn {
      width: 28px; height: 28px; border-radius: 7px;
      background: #ea580c; border: none; color: white;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 0.75rem; transition: background 0.15s;
    }
    .ft__add-btn:hover:not(:disabled) { background: #c2410c; }
    .ft__add-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  `],
})
export class FromToToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly fromToService = inject(FromToService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  // ─── Estado ───────────────────────────────────────────────────────────────
  data = signal<FromToData>({ ...EMPTY_FROM_TO });
  reports = signal<FromToReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  newFrom = '';
  newTo = '';

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // ─── Computed ─────────────────────────────────────────────────────────────
  filledCount = computed(
    () => this.data().transformaciones.filter(t => t.from.trim() || t.to.trim()).length
  );

  canGenerate = computed(
    () => this.data().transformaciones.filter(t => t.from.trim() && t.to.trim()).length >= 3
  );

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;

    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as FromToData | undefined;
    const storedReports = (raw['reports'] as FromToReportVersionDto[]) ?? [];

    this.data.set(stored ? { ...EMPTY_FROM_TO, ...stored } : { ...EMPTY_FROM_TO });
    this.reports.set(storedReports);
  }

  // ─── Acciones ─────────────────────────────────────────────────────────────
  onFieldChange(field: 'titulo' | 'contextoActual' | 'visionFuturo', value: string): void {
    this.data.set({ ...this.data(), [field]: value });
    this.scheduleSave();
  }

  addTransformacion(): void {
    const from = this.newFrom.trim();
    const to = this.newTo.trim();
    if (!from && !to) return;

    const nueva: TransformacionDto = { id: crypto.randomUUID(), from, to };
    this.data.set({ ...this.data(), transformaciones: [...this.data().transformaciones, nueva] });
    this.newFrom = '';
    this.newTo = '';
    this.scheduleSave();
  }

  updateTransformacion(index: number, field: 'from' | 'to', value: string): void {
    const transformaciones = this.data().transformaciones.map((t, i) =>
      i === index ? { ...t, [field]: value } : t
    );
    this.data.set({ ...this.data(), transformaciones });
    this.scheduleSave();
  }

  removeTransformacion(index: number): void {
    const transformaciones = this.data().transformaciones.filter((_, i) => i !== index);
    this.data.set({ ...this.data(), transformaciones });
    this.scheduleSave();
  }

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;

    this.analyzing.set(true);
    try {
      const result = await this.fromToService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });

      const newVersion: FromToReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };

      const updatedReports = [newVersion, ...this.reports()];
      this.reports.set(updatedReports);

      await this.persistData(updatedReports);
      this.showReport.set(true);
      this.uiDialog.showSuccess('Informe generado', 'El análisis From-To fue generado correctamente.');
    } catch (error) {
      this.uiDialog.showError('Error', `No se pudo generar el informe: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      this.analyzing.set(false);
    }
  }

  // ─── Helpers privados ──────────────────────────────────────────────────────
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
    } catch {
      // silent
    } finally {
      this.saving.set(false);
    }
  }

  private async persistData(reports: FromToReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;

    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
