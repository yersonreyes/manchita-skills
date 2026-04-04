import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { MatrizFeedbackService } from '@core/services/matrizFeedbackService/matriz-feedback.service';
import { MatrizFeedbackReportComponent } from './matriz-feedback-report.component';
import {
  CUADRANTE_CONFIG,
  CuadranteFeedback,
  EMPTY_MATRIZ_FEEDBACK,
  FUENTE_OPTIONS,
  FeedbackItemDto,
  FuenteFeedback,
  MatrizFeedbackData,
  MatrizFeedbackReportVersionDto,
  PRIORIDAD_OPTIONS,
  PrioridadFeedback,
} from './matriz-feedback.types';

@Component({
  selector: 'app-matriz-feedback-tool',
  standalone: true,
  imports: [FormsModule, MatrizFeedbackReportComponent],
  template: `
    <div class="mf">

      <!-- ─── Header ──────────────────────────────────────────────────────── -->
      <div class="mf__header">
        <div class="mf__header-left">
          <span class="mf__badge">MF</span>
          <div>
            <p class="mf__title">Matriz de Feedback</p>
            <p class="mf__subtitle">
              {{ totalItems() }} item{{ totalItems() === 1 ? '' : 's' }}
              @if (arreglarCount() > 0) { · <span class="mf__stat--arreglar">{{ arreglarCount() }} a arreglar</span> }
              @if (saving()) { <span class="mf__saving"> · guardando…</span> }
            </p>
          </div>
        </div>
        <div class="mf__header-actions">
          @if (reports().length > 0) {
            <button class="mf__btn-ghost" (click)="showReport.set(!showReport())">
              @if (showReport()) {
                <i class="pi pi-arrow-left"></i> Formulario
              } @else {
                <i class="pi pi-file-check"></i> Informes ({{ reports().length }})
              }
            </button>
          }
          <button
            class="mf__btn-primary"
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
        <app-matriz-feedback-report [reports]="reports()" />
      } @else {

        <!-- ─── Contexto ──────────────────────────────────────────────────── -->
        <div class="mf__section">
          <label class="mf__label">Contexto del feedback</label>
          <textarea
            class="mf__textarea"
            rows="2"
            placeholder="Ej: Feedback de test de usuario con 5 personas para la app de delivery — sesión del 3 de abril."
            [ngModel]="data().contexto"
            (ngModelChange)="updateContexto($event)"
          ></textarea>
        </div>

        <!-- ─── Matriz 2×2 ─────────────────────────────────────────────── -->
        <div class="mf__grid">
          @for (key of cuadrantes; track key) {
            @let cfg = config[key];
            <div class="mf__quadrant" [style.border-top-color]="cfg.color">
              <div class="mf__quadrant-header">
                <span class="mf__quadrant-emoji">{{ cfg.emoji }}</span>
                <div>
                  <p class="mf__quadrant-title" [style.color]="cfg.color">{{ cfg.label }}</p>
                  <p class="mf__quadrant-sub">{{ cfg.descripcion }}</p>
                </div>
                <span class="mf__quadrant-count">{{ data()[key].length }}</span>
              </div>

              <div class="mf__items">
                @for (item of data()[key]; track item.id) {
                  <div class="mf__item">
                    <textarea
                      class="mf__item-text"
                      rows="2"
                      placeholder="Describí el feedback…"
                      [ngModel]="item.texto"
                      (ngModelChange)="updateItem(key, item.id, 'texto', $event)"
                    ></textarea>
                    <div class="mf__item-meta">
                      <select
                        class="mf__select"
                        [ngModel]="item.fuente"
                        (ngModelChange)="updateItem(key, item.id, 'fuente', $event)"
                      >
                        @for (f of fuentes; track f.value) {
                          <option [value]="f.value">{{ f.label }}</option>
                        }
                      </select>
                      <div class="mf__prio-btns">
                        @for (p of prioridades; track p.value) {
                          <button
                            class="mf__prio-btn"
                            [class.mf__prio-btn--active]="item.prioridad === p.value"
                            [style.--prio-color]="p.color"
                            (click)="updateItem(key, item.id, 'prioridad', p.value)"
                            [title]="p.label"
                          >{{ p.label }}</button>
                        }
                      </div>
                      <button class="mf__item-del" (click)="removeItem(key, item.id)" title="Eliminar">
                        <i class="pi pi-times"></i>
                      </button>
                    </div>
                  </div>
                }

                <button class="mf__add-item" (click)="addItem(key)">
                  <i class="pi pi-plus"></i> Agregar feedback
                </button>
              </div>
            </div>
          }
        </div>

      }
    </div>
  `,
  styles: [`
    .mf { display: flex; flex-direction: column; gap: 16px; }

    .mf__header {
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px; flex-wrap: wrap;
    }
    .mf__header-left { display: flex; align-items: center; gap: 10px; }
    .mf__badge {
      width: 36px; height: 36px; border-radius: 10px;
      background: linear-gradient(135deg, #0891b2, #0e7490);
      color: #fff; font-size: 0.6rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      letter-spacing: 0.02em; flex-shrink: 0;
    }
    .mf__title { margin: 0; font-size: 0.9375rem; font-weight: 700; color: #111827; }
    .mf__subtitle { margin: 0; font-size: 0.78rem; color: #6b7280; }
    .mf__stat--arreglar { color: #92400e; font-weight: 600; }
    .mf__saving { color: #0891b2; }

    .mf__header-actions { display: flex; gap: 8px; align-items: center; }

    .mf__btn-ghost {
      display: flex; align-items: center; gap: 5px;
      padding: 6px 12px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: transparent;
      font-size: 0.8125rem; color: var(--p-text-color); cursor: pointer;
      transition: background 0.15s; font-family: inherit;
    }
    .mf__btn-ghost:hover { background: var(--p-surface-100); }

    .mf__btn-primary {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 8px; border: none;
      background: linear-gradient(135deg, #0891b2, #0e7490);
      color: #fff; font-size: 0.8125rem; font-weight: 600; cursor: pointer;
      transition: opacity 0.15s; font-family: inherit;
    }
    .mf__btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
    .mf__btn-primary:not(:disabled):hover { opacity: 0.9; }

    .mf__section { display: flex; flex-direction: column; gap: 4px; }
    .mf__label { font-size: 0.78rem; font-weight: 600; color: #6b7280; }

    .mf__textarea {
      width: 100%; box-sizing: border-box;
      padding: 8px 10px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: var(--p-surface-0);
      font-size: 0.8125rem; color: var(--p-text-color); line-height: 1.5;
      resize: vertical; font-family: inherit; transition: border-color 0.15s;
    }
    .mf__textarea:focus { outline: none; border-color: #0891b2; }

    /* Grid 2×2 */
    .mf__grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .mf__quadrant {
      border: 1px solid var(--p-surface-200); border-top-width: 3px;
      border-radius: 10px; background: var(--p-surface-0);
      display: flex; flex-direction: column; gap: 0; overflow: hidden;
    }

    .mf__quadrant-header {
      display: flex; align-items: flex-start; gap: 8px;
      padding: 10px 12px; background: var(--p-surface-50);
      border-bottom: 1px solid var(--p-surface-200);
    }
    .mf__quadrant-emoji { font-size: 1rem; flex-shrink: 0; margin-top: 1px; }
    .mf__quadrant-title { margin: 0; font-size: 0.8125rem; font-weight: 700; line-height: 1.2; }
    .mf__quadrant-sub { margin: 0; font-size: 0.68rem; color: #9ca3af; margin-top: 2px; }
    .mf__quadrant-count {
      margin-left: auto; flex-shrink: 0;
      background: var(--p-surface-200); color: #6b7280;
      font-size: 0.68rem; font-weight: 700;
      padding: 1px 7px; border-radius: 20px;
    }

    .mf__items {
      display: flex; flex-direction: column; gap: 1px;
      padding: 8px;
    }

    .mf__item {
      display: flex; flex-direction: column; gap: 5px;
      padding: 8px 10px; border-radius: 8px;
      border: 1px solid var(--p-surface-200); background: var(--p-surface-0);
    }

    .mf__item-text {
      width: 100%; box-sizing: border-box;
      border: none; background: transparent; outline: none;
      font-size: 0.8125rem; color: var(--p-text-color);
      line-height: 1.5; resize: none; font-family: inherit;
    }

    .mf__item-meta {
      display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
    }

    .mf__select {
      flex: 1; min-width: 120px;
      padding: 3px 6px; border-radius: 6px;
      border: 1px solid var(--p-surface-300); background: var(--p-surface-50);
      font-size: 0.72rem; color: var(--p-text-color); font-family: inherit;
      cursor: pointer;
    }
    .mf__select:focus { outline: none; border-color: #0891b2; }

    .mf__prio-btns { display: flex; gap: 3px; }
    .mf__prio-btn {
      padding: 2px 7px; border-radius: 20px;
      border: 1px solid var(--p-surface-300); background: transparent;
      font-size: 0.65rem; font-weight: 600; cursor: pointer;
      color: #9ca3af; font-family: inherit; transition: all 0.12s;
    }
    .mf__prio-btn:hover { border-color: var(--prio-color); color: var(--prio-color); }
    .mf__prio-btn--active { border-color: var(--prio-color); background: var(--prio-color); color: #fff; }

    .mf__item-del {
      width: 20px; height: 20px; border-radius: 4px; border: none;
      background: transparent; color: #d1d5db; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: color 0.15s, background 0.15s; margin-left: auto;
    }
    .mf__item-del:hover { color: #ef4444; background: #fee2e2; }
    .mf__item-del .pi { font-size: 0.6rem; }

    .mf__add-item {
      display: flex; align-items: center; justify-content: center; gap: 4px;
      padding: 6px; border-radius: 7px; border: 1px dashed var(--p-surface-300);
      background: transparent; color: #9ca3af;
      font-size: 0.75rem; cursor: pointer; transition: all 0.15s; font-family: inherit;
      margin-top: 4px;
    }
    .mf__add-item:hover { border-color: #0891b2; color: #0891b2; background: #ecfeff; }
    .mf__add-item .pi { font-size: 0.65rem; }
  `],
})
export class MatrizFeedbackToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly matrizFeedbackService = inject(MatrizFeedbackService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<MatrizFeedbackData>({ ...EMPTY_MATRIZ_FEEDBACK });
  reports = signal<MatrizFeedbackReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  readonly config = CUADRANTE_CONFIG;
  readonly cuadrantes: CuadranteFeedback[] = ['reforzar', 'arreglar', 'insights', 'evaluar'];
  readonly fuentes = FUENTE_OPTIONS;
  readonly prioridades = PRIORIDAD_OPTIONS;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  totalItems = computed(() => {
    const d = this.data();
    return d.reforzar.length + d.arreglar.length + d.insights.length + d.evaluar.length;
  });

  arreglarCount = computed(() => this.data().arreglar.length);

  canGenerate = computed(() => {
    return this.data().contexto.trim().length > 0 && this.totalItems() >= 3;
  });

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;
    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as MatrizFeedbackData | undefined;
    const storedReports = (raw['reports'] as MatrizFeedbackReportVersionDto[]) ?? [];
    this.data.set(stored ?? { ...EMPTY_MATRIZ_FEEDBACK });
    this.reports.set(storedReports);
  }

  updateContexto(value: string): void {
    this.data.set({ ...this.data(), contexto: value });
    this.scheduleSave();
  }

  addItem(cuadrante: CuadranteFeedback): void {
    const newItem: FeedbackItemDto = {
      id: crypto.randomUUID(),
      texto: '',
      fuente: 'testing',
      prioridad: 'normal',
    };
    this.data.set({ ...this.data(), [cuadrante]: [...this.data()[cuadrante], newItem] });
    this.scheduleSave();
  }

  removeItem(cuadrante: CuadranteFeedback, id: string): void {
    this.data.set({ ...this.data(), [cuadrante]: this.data()[cuadrante].filter(i => i.id !== id) });
    this.scheduleSave();
  }

  updateItem(cuadrante: CuadranteFeedback, id: string, field: keyof FeedbackItemDto, value: string): void {
    this.data.set({
      ...this.data(),
      [cuadrante]: this.data()[cuadrante].map(i =>
        i.id === id ? { ...i, [field]: value as FuenteFeedback | PrioridadFeedback | string } : i
      ),
    });
    this.scheduleSave();
  }

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;
    this.analyzing.set(true);
    try {
      const result = await this.matrizFeedbackService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });
      const newVersion: MatrizFeedbackReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };
      const updated = [newVersion, ...this.reports()];
      this.reports.set(updated);
      await this.persistData(updated);
      this.showReport.set(true);
      this.uiDialog.showSuccess('Análisis generado', 'La Matriz de Feedback fue analizada correctamente.');
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

  private async persistData(reports: MatrizFeedbackReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
