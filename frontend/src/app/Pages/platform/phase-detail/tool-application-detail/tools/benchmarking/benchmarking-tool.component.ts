import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { BenchmarkingService } from '@core/services/benchmarkingService/benchmarking.service';
import { BenchmarkingReportComponent } from './benchmarking-report.component';
import {
  BenchmarkingCompetidor,
  BenchmarkingCriterio,
  BenchmarkingData,
  BenchmarkingReportVersionDto,
  EMPTY_BENCHMARKING,
} from './benchmarking.types';

@Component({
  selector: 'app-benchmarking-tool',
  standalone: true,
  imports: [FormsModule, BenchmarkingReportComponent],
  template: `
    <div class="bm">

      <!-- Header -->
      <div class="bm__header">
        <div class="bm__header-left">
          <div class="bm__badge">
            <i class="pi pi-chart-bar"></i>
          </div>
          <div class="bm__title-block">
            <span class="bm__title">Benchmarking</span>
            <span class="bm__subtitle">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              } @else {
                {{ data().criterios.length }} criterios · {{ data().competidores.length }} competidores
              }
            </span>
          </div>
        </div>
        <div class="bm__header-actions">
          <button
            class="bm__btn bm__btn--ghost"
            (click)="toggleReport()"
            [class.bm__btn--active]="showReport()"
          >
            <i class="pi pi-chart-bar"></i>
            Informes {{ reports().length ? '(' + reports().length + ')' : '' }}
          </button>
          <button
            class="bm__btn bm__btn--primary"
            (click)="generateReport()"
            [disabled]="!canGenerate() || analyzing()"
            [title]="!canGenerate() ? 'Agregá al menos 2 criterios y 1 competidor' : 'Generar análisis con IA'"
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
      <div class="bm__content">
        @if (showReport()) {
          <app-benchmarking-report [reports]="reports()" />
        } @else {

          <!-- Context strip -->
          <div class="bm__context">
            <div class="bm__context-field">
              <label class="bm__context-label">
                <i class="pi pi-search"></i> ¿Qué estás comparando?
              </label>
              <input
                class="bm__context-input"
                type="text"
                placeholder="Ej: Apps de inversión para fintechs, Proceso de onboarding, Pricing..."
                [ngModel]="data().contexto"
                (ngModelChange)="onContextChange('contexto', $event)"
              />
            </div>
            <div class="bm__context-field">
              <label class="bm__context-label">
                <i class="pi pi-star"></i> Nombre de tu producto
              </label>
              <input
                class="bm__context-input"
                type="text"
                placeholder="Ej: InvestApp, Mi Startup, Producto Actual..."
                [ngModel]="data().miProducto"
                (ngModelChange)="onContextChange('miProducto', $event)"
              />
            </div>
          </div>

          <!-- Matrix -->
          <div class="bm__matrix-wrap">
            <div class="bm__matrix-scroll">
              <table class="bm__table">
                <thead>
                  <tr>
                    <th class="bm__th bm__th--criterio">
                      <span class="bm__th-label">Criterio de comparación</span>
                    </th>
                    <th class="bm__th bm__th--mine">
                      <div class="bm__th-mine-label">
                        <span class="bm__mine-badge">Tuyo</span>
                        <span>{{ data().miProducto || 'Mi Producto' }}</span>
                      </div>
                    </th>
                    @for (comp of data().competidores; track comp.id; let i = $index) {
                      <th class="bm__th bm__th--comp">
                        <div class="bm__th-comp">
                          <input
                            class="bm__th-input"
                            type="text"
                            [ngModel]="comp.nombre"
                            (ngModelChange)="onCompetidorNameChange(comp.id, $event)"
                            [placeholder]="'Competidor ' + (i + 1)"
                          />
                          <button
                            class="bm__th-remove"
                            (click)="removeCompetidor(comp.id)"
                            title="Eliminar competidor"
                          >
                            <i class="pi pi-times"></i>
                          </button>
                        </div>
                      </th>
                    }
                    <th class="bm__th bm__th--add-col">
                      <button class="bm__add-col-btn" (click)="addCompetidor()" title="Agregar competidor">
                        <i class="pi pi-plus"></i>
                        <span>Competidor</span>
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  @for (criterio of data().criterios; track criterio.id) {
                    <tr class="bm__tr">
                      <td class="bm__td bm__td--criterio">
                        <input
                          class="bm__criterio-input"
                          type="text"
                          [ngModel]="criterio.nombre"
                          (ngModelChange)="onCriterioNameChange(criterio.id, $event)"
                          placeholder="Ej: Onboarding, UI, Precio, Features..."
                        />
                        <button
                          class="bm__criterio-remove"
                          (click)="removeCriterio(criterio.id)"
                          title="Eliminar criterio"
                        >
                          <i class="pi pi-trash"></i>
                        </button>
                      </td>
                      <td class="bm__td bm__td--mine">
                        <input
                          class="bm__cell-input"
                          type="text"
                          [ngModel]="getMiValor(criterio.id)"
                          (ngModelChange)="onMiValorChange(criterio.id, $event)"
                          placeholder="—"
                        />
                      </td>
                      @for (comp of data().competidores; track comp.id) {
                        <td class="bm__td">
                          <input
                            class="bm__cell-input"
                            type="text"
                            [ngModel]="getCellValue(comp.id, criterio.id)"
                            (ngModelChange)="onCellChange(comp.id, criterio.id, $event)"
                            placeholder="—"
                          />
                        </td>
                      }
                      <td class="bm__td bm__td--spacer"></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Add criterio -->
            <button class="bm__add-row-btn" (click)="addCriterio()">
              <i class="pi pi-plus-circle"></i>
              Agregar criterio
            </button>
          </div>

        }
      </div>

    </div>
  `,
  styles: [`
    .bm {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 12px;
    }

    /* ─── Header ─────────────────────────────────────────────────── */
    .bm__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-shrink: 0;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--p-surface-200);
    }

    .bm__header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .bm__badge {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: linear-gradient(135deg, #fef9c3 0%, #fef08a 100%);
      color: #854d0e;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      flex-shrink: 0;
      box-shadow: 0 1px 3px rgba(133,77,14,0.15);
    }

    .bm__title-block {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .bm__title {
      font-family: 'Syne', sans-serif;
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--p-text-color);
      line-height: 1.2;
    }

    .bm__subtitle {
      font-size: 0.72rem;
      color: var(--p-text-muted-color);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .bm__header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* ─── Buttons ─────────────────────────────────────────────────── */
    .bm__btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s;
      white-space: nowrap;
    }

    .bm__btn .pi { font-size: 0.8rem; }
    .bm__btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .bm__btn--ghost {
      background: transparent;
      border-color: var(--p-surface-300);
      color: var(--p-text-secondary-color);
    }

    .bm__btn--ghost:hover:not(:disabled) { background: var(--p-surface-100); }

    .bm__btn--ghost.bm__btn--active {
      background: #fefce8;
      border-color: #fde047;
      color: #713f12;
    }

    .bm__btn--primary {
      background: #ca8a04;
      color: white;
      border-color: #ca8a04;
    }

    .bm__btn--primary:hover:not(:disabled) { background: #a16207; }

    /* ─── Content ─────────────────────────────────────────────────── */
    .bm__content {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      gap: 12px;
    }

    /* ─── Context strip ───────────────────────────────────────────── */
    .bm__context {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      flex-shrink: 0;
    }

    .bm__context-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .bm__context-label {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--p-text-muted-color);
      display: flex;
      align-items: center;
      gap: 4px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .bm__context-label .pi { font-size: 0.68rem; }

    .bm__context-input {
      padding: 7px 10px;
      border-radius: 8px;
      border: 1px solid var(--p-surface-300);
      font-size: 0.8125rem;
      background: var(--p-surface-0);
      color: var(--p-text-color);
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .bm__context-input::placeholder { color: #9ca3af; }
    .bm__context-input:focus { border-color: #ca8a04; box-shadow: 0 0 0 2px rgba(202,138,4,0.15); }

    /* ─── Matrix ──────────────────────────────────────────────────── */
    .bm__matrix-wrap {
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex: 1;
    }

    .bm__matrix-scroll {
      overflow-x: auto;
      border: 1px solid var(--p-surface-200);
      border-radius: 12px;
    }

    .bm__table {
      width: 100%;
      border-collapse: collapse;
      min-width: 600px;
    }

    /* ─── Table header ────────────────────────────────────────────── */
    .bm__th {
      padding: 10px 12px;
      text-align: left;
      background: var(--p-surface-50);
      border-bottom: 1px solid var(--p-surface-200);
      white-space: nowrap;
    }

    .bm__th--criterio {
      width: 200px;
      min-width: 200px;
    }

    .bm__th-label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--p-text-muted-color);
    }

    .bm__th--mine { background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%); }

    .bm__th-mine-label {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .bm__mine-badge {
      font-size: 0.58rem;
      font-weight: 700;
      background: #fde047;
      color: #713f12;
      padding: 2px 6px;
      border-radius: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .bm__th-mine-label span:last-child {
      font-size: 0.78rem;
      font-weight: 600;
      color: #713f12;
      font-family: 'Syne', sans-serif;
    }

    .bm__th--comp { min-width: 160px; }

    .bm__th-comp {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .bm__th-input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 0.8125rem;
      font-weight: 600;
      font-family: 'Syne', sans-serif;
      color: var(--p-text-color);
      outline: none;
      min-width: 0;
      padding: 2px 4px;
      border-radius: 4px;
      transition: background 0.15s;
    }

    .bm__th-input::placeholder { color: #9ca3af; font-weight: 400; font-family: 'Outfit', sans-serif; }
    .bm__th-input:focus { background: var(--p-surface-0); box-shadow: 0 0 0 1px var(--p-surface-300); }

    .bm__th-remove {
      background: none;
      border: none;
      cursor: pointer;
      color: #9ca3af;
      padding: 2px 4px;
      font-size: 0.6rem;
      border-radius: 4px;
      transition: color 0.15s, background 0.15s;
      flex-shrink: 0;
    }

    .bm__th-remove:hover { color: #ef4444; background: #fef2f2; }

    .bm__th--add-col { width: 120px; }

    .bm__add-col-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      background: none;
      border: 1px dashed var(--p-surface-300);
      border-radius: 8px;
      padding: 5px 10px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--p-text-muted-color);
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s;
    }

    .bm__add-col-btn:hover { border-color: #ca8a04; color: #854d0e; background: #fefce8; }
    .bm__add-col-btn .pi { font-size: 0.7rem; }

    /* ─── Table rows ──────────────────────────────────────────────── */
    .bm__tr { border-bottom: 1px solid var(--p-surface-100); }
    .bm__tr:last-child { border-bottom: none; }
    .bm__tr:hover { background: var(--p-surface-50); }

    .bm__td {
      padding: 6px 12px;
      vertical-align: middle;
    }

    .bm__td--criterio {
      background: var(--p-surface-50);
      border-right: 1px solid var(--p-surface-200);
    }

    .bm__td--mine {
      background: linear-gradient(135deg, #fffef0 0%, #fefce8 100%);
    }

    .bm__td--spacer { width: 120px; }

    /* Criterio cell */
    .bm__td--criterio {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .bm__criterio-input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 0.8125rem;
      color: var(--p-text-color);
      outline: none;
      padding: 3px 6px;
      border-radius: 4px;
      font-weight: 500;
      transition: background 0.15s;
    }

    .bm__criterio-input::placeholder { color: #9ca3af; font-weight: 400; }
    .bm__criterio-input:focus { background: var(--p-surface-0); }

    .bm__criterio-remove {
      background: none;
      border: none;
      cursor: pointer;
      color: #d1d5db;
      padding: 2px 4px;
      font-size: 0.65rem;
      border-radius: 4px;
      transition: color 0.15s, background 0.15s;
      flex-shrink: 0;
      opacity: 0;
    }

    .bm__tr:hover .bm__criterio-remove { opacity: 1; }
    .bm__criterio-remove:hover { color: #ef4444; background: #fef2f2; }

    /* Cell input */
    .bm__cell-input {
      width: 100%;
      border: none;
      background: transparent;
      font-size: 0.8rem;
      color: var(--p-text-color);
      outline: none;
      padding: 3px 6px;
      border-radius: 4px;
      transition: background 0.15s, box-shadow 0.15s;
      text-align: center;
    }

    .bm__cell-input::placeholder { color: #d1d5db; }
    .bm__cell-input:focus { background: var(--p-surface-0); box-shadow: 0 0 0 1px var(--p-surface-300); }

    /* ─── Add row ─────────────────────────────────────────────────── */
    .bm__add-row-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px;
      border-radius: 10px;
      border: 2px dashed var(--p-surface-300);
      background: transparent;
      color: var(--p-text-muted-color);
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }

    .bm__add-row-btn:hover { border-color: #ca8a04; color: #854d0e; background: #fefce8; }
    .bm__add-row-btn .pi { font-size: 1rem; }
  `],
})
export class BenchmarkingToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly benchmarkingService = inject(BenchmarkingService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  // ─── State ────────────────────────────────────────────────────────────────
  data = signal<BenchmarkingData>({ ...EMPTY_BENCHMARKING });
  reports = signal<BenchmarkingReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // ─── Computed ─────────────────────────────────────────────────────────────
  canGenerate = computed(
    () => this.data().criterios.length >= 2 && this.data().competidores.length >= 1
  );

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;

    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as BenchmarkingData | undefined;
    const storedReports = (raw['reports'] as BenchmarkingReportVersionDto[]) ?? [];

    this.data.set(stored ? { ...EMPTY_BENCHMARKING, ...stored } : { ...EMPTY_BENCHMARKING });
    this.reports.set(storedReports);
  }

  // ─── Context ──────────────────────────────────────────────────────────────
  onContextChange(field: 'contexto' | 'miProducto', value: string): void {
    this.data.set({ ...this.data(), [field]: value });
    this.scheduleSave();
  }

  // ─── Criterios ────────────────────────────────────────────────────────────
  addCriterio(): void {
    const criterio: BenchmarkingCriterio = { id: crypto.randomUUID(), nombre: '' };
    this.data.set({ ...this.data(), criterios: [...this.data().criterios, criterio] });
    this.scheduleSave();
  }

  removeCriterio(id: string): void {
    const miValores = { ...this.data().miValores };
    delete miValores[id];
    const competidores = this.data().competidores.map(c => {
      const valores = { ...c.valores };
      delete valores[id];
      return { ...c, valores };
    });
    this.data.set({
      ...this.data(),
      criterios: this.data().criterios.filter(c => c.id !== id),
      miValores,
      competidores,
    });
    this.scheduleSave();
  }

  onCriterioNameChange(id: string, nombre: string): void {
    this.data.set({
      ...this.data(),
      criterios: this.data().criterios.map(c => c.id === id ? { ...c, nombre } : c),
    });
    this.scheduleSave();
  }

  // ─── Competidores ─────────────────────────────────────────────────────────
  addCompetidor(): void {
    const comp: BenchmarkingCompetidor = { id: crypto.randomUUID(), nombre: '', valores: {} };
    this.data.set({ ...this.data(), competidores: [...this.data().competidores, comp] });
    this.scheduleSave();
  }

  removeCompetidor(id: string): void {
    this.data.set({
      ...this.data(),
      competidores: this.data().competidores.filter(c => c.id !== id),
    });
    this.scheduleSave();
  }

  onCompetidorNameChange(id: string, nombre: string): void {
    this.data.set({
      ...this.data(),
      competidores: this.data().competidores.map(c => c.id === id ? { ...c, nombre } : c),
    });
    this.scheduleSave();
  }

  // ─── Cell values ──────────────────────────────────────────────────────────
  getMiValor(criterioId: string): string {
    return this.data().miValores[criterioId] ?? '';
  }

  onMiValorChange(criterioId: string, value: string): void {
    this.data.set({ ...this.data(), miValores: { ...this.data().miValores, [criterioId]: value } });
    this.scheduleSave();
  }

  getCellValue(competidorId: string, criterioId: string): string {
    const comp = this.data().competidores.find(c => c.id === competidorId);
    return comp?.valores[criterioId] ?? '';
  }

  onCellChange(competidorId: string, criterioId: string, value: string): void {
    this.data.set({
      ...this.data(),
      competidores: this.data().competidores.map(c =>
        c.id === competidorId ? { ...c, valores: { ...c.valores, [criterioId]: value } } : c
      ),
    });
    this.scheduleSave();
  }

  // ─── Report ───────────────────────────────────────────────────────────────
  toggleReport(): void {
    this.showReport.set(!this.showReport());
  }

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;

    this.analyzing.set(true);
    try {
      const result = await this.benchmarkingService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });

      const newVersion: BenchmarkingReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };

      const updated = [newVersion, ...this.reports()];
      this.reports.set(updated);
      await this.persistData(updated);
      this.showReport.set(true);
      this.uiDialog.showSuccess('Análisis generado', 'El análisis de benchmarking fue generado correctamente.');
    } catch (error) {
      this.uiDialog.showError('Error', `No se pudo generar el análisis: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      this.analyzing.set(false);
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
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

  private async persistData(reports: BenchmarkingReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
