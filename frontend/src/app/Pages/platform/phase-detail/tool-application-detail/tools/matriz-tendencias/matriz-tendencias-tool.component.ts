import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { MatrizTendenciasService } from '@core/services/matrizTendenciasService/matriz-tendencias.service';
import { MatrizTendenciasReportComponent } from './matriz-tendencias-report.component';
import {
  CATEGORIA_COLORS,
  CATEGORIA_LABELS,
  EMPTY_MATRIZ_TENDENCIAS,
  MATRIZ_CUADRANTES,
  MatrizTendenciasData,
  MatrizTendenciasReportVersionDto,
  TendenciaCategoria,
  TendenciaDto,
  TendenciaImpacto,
  TendenciaPlazo,
} from './matriz-tendencias.types';

@Component({
  selector: 'app-matriz-tendencias-tool',
  standalone: true,
  imports: [FormsModule, MatrizTendenciasReportComponent],
  template: `
    <div class="mt">

      <!-- Header -->
      <div class="mt__header">
        <div class="mt__header-left">
          <div class="mt__badge">
            <i class="pi pi-chart-bar"></i>
          </div>
          <div class="mt__title-block">
            <span class="mt__title">Matriz de Tendencias</span>
            <span class="mt__subtitle">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              } @else {
                {{ data().tendencias.length }} tendencia{{ data().tendencias.length !== 1 ? 's' : '' }} registrada{{ data().tendencias.length !== 1 ? 's' : '' }}
              }
            </span>
          </div>
        </div>
        <div class="mt__header-actions">
          <button
            class="mt__btn mt__btn--ghost"
            (click)="showReport.set(!showReport())"
            [class.mt__btn--active]="showReport()"
          >
            <i class="pi pi-chart-bar"></i>
            Informes {{ reports().length ? '(' + reports().length + ')' : '' }}
          </button>
          <button
            class="mt__btn mt__btn--primary"
            (click)="generateReport()"
            [disabled]="!canGenerate() || analyzing()"
            [title]="!canGenerate() ? 'Registrá al menos 3 tendencias para analizar' : 'Generar informe con IA'"
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
      <div class="mt__content">
        @if (showReport()) {
          <app-matriz-tendencias-report [reports]="reports()" />
        } @else {

          <!-- Context -->
          <div class="mt__context">
            <label class="mt__context-label">
              <i class="pi pi-map-marker"></i> Contexto
            </label>
            <input
              class="mt__context-input"
              type="text"
              [ngModel]="data().contexto"
              (ngModelChange)="onContextoChange($event)"
              placeholder="Ej: Fintech planificando roadmap 2025-2026"
            />
          </div>

          <!-- Add form -->
          <div class="mt__form">
            <div class="mt__form-row">
              <input
                class="mt__form-input mt__form-input--nombre"
                type="text"
                [(ngModel)]="newNombre"
                placeholder="Nombre de la tendencia *"
                (keydown.enter)="addTendencia()"
              />
              <input
                class="mt__form-input"
                type="text"
                [(ngModel)]="newDescripcion"
                placeholder="Descripción (opcional)"
              />
            </div>
            <div class="mt__form-row mt__form-row--controls">
              <select class="mt__form-select" [(ngModel)]="newCategoria">
                <option value="tecnologica">Tecnológica</option>
                <option value="social">Social</option>
                <option value="economica">Económica</option>
                <option value="regulatoria">Regulatoria</option>
                <option value="mercado">Mercado</option>
              </select>
              <div class="mt__form-toggle-group">
                <label class="mt__toggle-label">Impacto</label>
                <div class="mt__toggle">
                  <button
                    class="mt__toggle-btn"
                    [class.mt__toggle-btn--active-amber]="newImpacto === 'alto'"
                    (click)="newImpacto = 'alto'"
                    type="button"
                  >
                    Alto
                  </button>
                  <button
                    class="mt__toggle-btn"
                    [class.mt__toggle-btn--active-gray]="newImpacto === 'bajo'"
                    (click)="newImpacto = 'bajo'"
                    type="button"
                  >
                    Bajo
                  </button>
                </div>
              </div>
              <div class="mt__form-toggle-group">
                <label class="mt__toggle-label">Plazo</label>
                <div class="mt__toggle">
                  <button
                    class="mt__toggle-btn"
                    [class.mt__toggle-btn--active-amber]="newPlazo === 'corto'"
                    (click)="newPlazo = 'corto'"
                    type="button"
                  >
                    Corto
                  </button>
                  <button
                    class="mt__toggle-btn"
                    [class.mt__toggle-btn--active-blue]="newPlazo === 'largo'"
                    (click)="newPlazo = 'largo'"
                    type="button"
                  >
                    Largo
                  </button>
                </div>
              </div>
              <button
                class="mt__form-add-btn"
                (click)="addTendencia()"
                [disabled]="!newNombre.trim()"
              >
                <i class="pi pi-plus"></i> Agregar
              </button>
            </div>
          </div>

          <!-- 2x2 Matrix -->
          <div class="mt__matrix">

            <!-- Axis labels -->
            <div class="mt__axis-y">
              <div class="mt__axis-label">IMPACTO ALTO</div>
              <div class="mt__axis-arrow">↑</div>
              <div class="mt__axis-label">IMPACTO BAJO</div>
            </div>

            <div class="mt__matrix-body">
              <div class="mt__axis-x">
                <span class="mt__axis-label">CORTO PLAZO</span>
                <span class="mt__axis-label">LARGO PLAZO →</span>
              </div>

              <div class="mt__grid">
                @for (q of cuadrantes; track q.label) {
                  <div
                    class="mt__quadrant"
                    [style.background-color]="q.accentBg"
                    [style.border-color]="q.borderColor"
                  >
                    <div class="mt__quadrant-header" [style.color]="q.textColor">
                      <i class="pi {{ q.icon }}"></i>
                      <span class="mt__quadrant-label">{{ q.label }}</span>
                      <span class="mt__quadrant-count" [style.background-color]="q.accentColor">
                        {{ tendenciasEnCuadrante(q.impacto, q.plazo).length }}
                      </span>
                    </div>
                    <p class="mt__quadrant-sublabel" [style.color]="q.textColor">{{ q.sublabel }}</p>

                    <div class="mt__chips">
                      @for (t of tendenciasEnCuadrante(q.impacto, q.plazo); track t.id) {
                        <div class="mt__chip" [style.border-color]="q.borderColor">
                          <span
                            class="mt__chip-cat"
                            [style.background-color]="categoriaColor(t.categoria)"
                          >{{ categoriaLabel(t.categoria) }}</span>
                          <span class="mt__chip-name">{{ t.nombre }}</span>
                          <button
                            class="mt__chip-remove"
                            (click)="removeTendencia(t.id)"
                            title="Eliminar"
                          >
                            <i class="pi pi-times"></i>
                          </button>
                        </div>
                      }
                      @if (tendenciasEnCuadrante(q.impacto, q.plazo).length === 0) {
                        <p class="mt__empty-hint">Sin tendencias</p>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

        }
      </div>

    </div>
  `,
  styles: [`
    .mt {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 12px;
    }

    /* ─── Header ─────────────────────────────────────────────────── */
    .mt__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-shrink: 0;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--p-surface-200);
    }

    .mt__header-left { display: flex; align-items: center; gap: 10px; }

    .mt__badge {
      width: 36px; height: 36px; border-radius: 8px;
      background: #fffbeb; color: #92400e;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.875rem; flex-shrink: 0;
    }

    .mt__title-block { display: flex; flex-direction: column; gap: 1px; }

    .mt__title {
      font-family: 'Syne', sans-serif;
      font-size: 0.9375rem; font-weight: 700;
      color: var(--p-text-color); line-height: 1.2;
    }

    .mt__subtitle {
      font-size: 0.72rem; color: var(--p-text-muted-color);
      display: flex; align-items: center; gap: 4px;
    }

    .mt__header-actions { display: flex; align-items: center; gap: 8px; }

    /* ─── Buttons ─────────────────────────────────────────────────── */
    .mt__btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 7px 14px; border-radius: 8px;
      font-size: 0.8125rem; font-weight: 600;
      cursor: pointer; border: 1px solid transparent;
      transition: all 0.15s; white-space: nowrap;
    }
    .mt__btn .pi { font-size: 0.8rem; }
    .mt__btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .mt__btn--ghost {
      background: transparent; border-color: var(--p-surface-300);
      color: var(--p-text-secondary-color);
    }
    .mt__btn--ghost:hover:not(:disabled) { background: var(--p-surface-100); }
    .mt__btn--ghost.mt__btn--active { background: #fffbeb; border-color: #fde68a; color: #92400e; }

    .mt__btn--primary {
      background: var(--p-primary-600, #0284c7);
      color: white; border-color: var(--p-primary-600, #0284c7);
    }
    .mt__btn--primary:hover:not(:disabled) { background: var(--p-primary-700, #0369a1); }

    /* ─── Content ─────────────────────────────────────────────────── */
    .mt__content {
      flex: 1; min-height: 0;
      display: flex; flex-direction: column; gap: 10px;
    }

    /* ─── Context ─────────────────────────────────────────────────── */
    .mt__context { display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; }

    .mt__context-label {
      font-size: 0.72rem; font-weight: 700;
      letter-spacing: 0.05em; text-transform: uppercase;
      color: var(--p-text-secondary-color);
      display: flex; align-items: center; gap: 4px;
    }
    .mt__context-label .pi { font-size: 0.7rem; }

    .mt__context-input {
      padding: 7px 10px; border-radius: 8px;
      border: 1px solid var(--p-surface-300);
      font-size: 0.8125rem; background: var(--p-surface-0);
      color: var(--p-text-color); outline: none;
      transition: border-color 0.15s; width: 100%; box-sizing: border-box;
    }
    .mt__context-input::placeholder { color: #9ca3af; }
    .mt__context-input:focus { border-color: #d97706; box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.12); }

    /* ─── Form ────────────────────────────────────────────────────── */
    .mt__form {
      display: flex; flex-direction: column; gap: 6px;
      padding: 10px 12px; border-radius: 10px;
      background: var(--p-surface-50); border: 1px solid var(--p-surface-200);
      flex-shrink: 0;
    }

    .mt__form-row {
      display: flex; gap: 8px; align-items: center;
    }

    .mt__form-row--controls { flex-wrap: wrap; }

    .mt__form-input {
      padding: 6px 10px; border-radius: 8px;
      border: 1px solid var(--p-surface-300);
      font-size: 0.8125rem; background: var(--p-surface-0);
      color: var(--p-text-color); outline: none;
      transition: border-color 0.15s; box-sizing: border-box;
    }
    .mt__form-input--nombre { flex: 2; }
    .mt__form-input { flex: 1; }
    .mt__form-input::placeholder { color: #9ca3af; }
    .mt__form-input:focus { border-color: #d97706; }

    .mt__form-select {
      padding: 6px 10px; border-radius: 8px;
      border: 1px solid var(--p-surface-300);
      font-size: 0.8125rem; background: var(--p-surface-0);
      color: var(--p-text-color); outline: none; cursor: pointer;
    }

    .mt__form-toggle-group {
      display: flex; align-items: center; gap: 6px;
    }

    .mt__toggle-label {
      font-size: 0.72rem; font-weight: 700; color: var(--p-text-secondary-color);
      text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap;
    }

    .mt__toggle {
      display: flex; border-radius: 7px; overflow: hidden;
      border: 1px solid var(--p-surface-300);
    }

    .mt__toggle-btn {
      padding: 5px 10px; border: none; background: transparent;
      font-size: 0.78rem; cursor: pointer; color: var(--p-text-secondary-color);
      transition: all 0.15s; white-space: nowrap;
    }
    .mt__toggle-btn:hover { background: var(--p-surface-100); }
    .mt__toggle-btn--active-amber { background: #fffbeb; color: #92400e; font-weight: 700; }
    .mt__toggle-btn--active-gray { background: #f3f4f6; color: #374151; font-weight: 700; }
    .mt__toggle-btn--active-blue { background: #eff6ff; color: #1e40af; font-weight: 700; }

    .mt__form-add-btn {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 6px 14px; border-radius: 8px;
      background: #d97706; color: white; border: none;
      font-size: 0.8125rem; font-weight: 600; cursor: pointer;
      transition: background 0.15s; white-space: nowrap; margin-left: auto;
    }
    .mt__form-add-btn:hover:not(:disabled) { background: #b45309; }
    .mt__form-add-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .mt__form-add-btn .pi { font-size: 0.75rem; }

    /* ─── Matrix ──────────────────────────────────────────────────── */
    .mt__matrix {
      display: flex; gap: 6px;
      flex: 1; min-height: 0;
    }

    .mt__axis-y {
      display: flex; flex-direction: column; align-items: center;
      justify-content: space-between; padding: 4px 0;
      gap: 4px; flex-shrink: 0;
    }

    .mt__axis-arrow { font-size: 1rem; color: var(--p-text-secondary-color); }

    .mt__axis-label {
      font-size: 0.65rem; font-weight: 700; color: var(--p-text-secondary-color);
      text-transform: uppercase; letter-spacing: 0.06em;
      writing-mode: vertical-rl; text-orientation: mixed;
      transform: rotate(180deg);
    }

    .mt__matrix-body { display: flex; flex-direction: column; gap: 4px; flex: 1; min-height: 0; }

    .mt__axis-x {
      display: flex; justify-content: space-between;
      padding: 0 4px; flex-shrink: 0;
    }
    .mt__axis-x .mt__axis-label { writing-mode: initial; transform: none; }

    .mt__grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 8px; flex: 1; min-height: 0;
    }

    /* ─── Quadrant ────────────────────────────────────────────────── */
    .mt__quadrant {
      border-radius: 12px; padding: 10px;
      border: 1px solid transparent;
      display: flex; flex-direction: column; gap: 6px;
      overflow: hidden;
    }

    .mt__quadrant-header {
      display: flex; align-items: center; gap: 5px;
      font-size: 0.75rem; font-weight: 800;
      text-transform: uppercase; letter-spacing: 0.08em;
      flex-shrink: 0;
    }
    .mt__quadrant-header .pi { font-size: 0.8rem; }

    .mt__quadrant-label { flex: 1; }

    .mt__quadrant-count {
      color: white; font-size: 0.65rem; font-weight: 700;
      padding: 1px 6px; border-radius: 10px; line-height: 1.6;
    }

    .mt__quadrant-sublabel {
      margin: 0; font-size: 0.68rem; opacity: 0.7; flex-shrink: 0;
    }

    /* ─── Chips ───────────────────────────────────────────────────── */
    .mt__chips {
      display: flex; flex-direction: column; gap: 4px;
      flex: 1; overflow-y: auto; min-height: 0;
    }

    .mt__chip {
      display: flex; align-items: center; gap: 5px;
      padding: 4px 8px; border-radius: 8px;
      background: rgba(255,255,255,0.7); border: 1px solid;
      font-size: 0.78rem;
    }
    .mt__chip:hover .mt__chip-remove { opacity: 1; }

    .mt__chip-cat {
      color: white; font-size: 0.6rem; font-weight: 700;
      padding: 1px 5px; border-radius: 4px; white-space: nowrap; flex-shrink: 0;
    }

    .mt__chip-name { flex: 1; color: #1f2937; word-break: break-word; line-height: 1.3; }

    .mt__chip-remove {
      opacity: 0; background: none; border: none; cursor: pointer;
      color: #9ca3af; font-size: 0.6rem; padding: 0 2px; flex-shrink: 0;
      transition: color 0.15s, opacity 0.15s;
    }
    .mt__chip-remove:hover { color: #ef4444; }

    .mt__empty-hint {
      margin: 0; font-size: 0.75rem;
      color: var(--p-text-muted-color); font-style: italic;
      padding: 4px 0;
    }
  `],
})
export class MatrizTendenciasToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly matrizTendenciasService = inject(MatrizTendenciasService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  // ─── Estado ───────────────────────────────────────────────────────────────
  data = signal<MatrizTendenciasData>({ ...EMPTY_MATRIZ_TENDENCIAS });
  reports = signal<MatrizTendenciasReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  newNombre = '';
  newDescripcion = '';
  newCategoria: TendenciaCategoria = 'tecnologica';
  newImpacto: TendenciaImpacto = 'alto';
  newPlazo: TendenciaPlazo = 'corto';

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly cuadrantes = MATRIZ_CUADRANTES;

  // ─── Computed ─────────────────────────────────────────────────────────────
  canGenerate = computed(() => this.data().tendencias.length >= 3);

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;

    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as MatrizTendenciasData | undefined;
    const storedReports = (raw['reports'] as MatrizTendenciasReportVersionDto[]) ?? [];

    this.data.set(stored ? { ...EMPTY_MATRIZ_TENDENCIAS, ...stored } : { ...EMPTY_MATRIZ_TENDENCIAS });
    this.reports.set(storedReports);
  }

  // ─── Helpers de display ───────────────────────────────────────────────────
  tendenciasEnCuadrante(impacto: TendenciaImpacto, plazo: TendenciaPlazo): TendenciaDto[] {
    return this.data().tendencias.filter(t => t.impacto === impacto && t.plazo === plazo);
  }

  categoriaLabel(cat: TendenciaCategoria): string {
    return CATEGORIA_LABELS[cat];
  }

  categoriaColor(cat: TendenciaCategoria): string {
    return CATEGORIA_COLORS[cat];
  }

  // ─── Acciones ─────────────────────────────────────────────────────────────
  onContextoChange(value: string): void {
    this.data.set({ ...this.data(), contexto: value });
    this.scheduleSave();
  }

  addTendencia(): void {
    const nombre = this.newNombre.trim();
    if (!nombre) return;

    const nueva: TendenciaDto = {
      id: crypto.randomUUID(),
      nombre,
      descripcion: this.newDescripcion.trim(),
      categoria: this.newCategoria,
      impacto: this.newImpacto,
      plazo: this.newPlazo,
    };

    this.data.set({ ...this.data(), tendencias: [...this.data().tendencias, nueva] });
    this.newNombre = '';
    this.newDescripcion = '';
    this.scheduleSave();
  }

  removeTendencia(id: string): void {
    this.data.set({
      ...this.data(),
      tendencias: this.data().tendencias.filter(t => t.id !== id),
    });
    this.scheduleSave();
  }

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;

    this.analyzing.set(true);
    try {
      const result = await this.matrizTendenciasService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });

      const newVersion: MatrizTendenciasReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };

      const updatedReports = [newVersion, ...this.reports()];
      this.reports.set(updatedReports);

      await this.persistData(updatedReports);
      this.showReport.set(true);
      this.uiDialog.showSuccess('Informe generado', 'El análisis de la Matriz de Tendencias fue generado correctamente.');
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

  private async persistData(reports: MatrizTendenciasReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;

    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
