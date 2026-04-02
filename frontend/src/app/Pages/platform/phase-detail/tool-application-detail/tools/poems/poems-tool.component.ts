import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { PoemsService } from '@core/services/poemsService/poems.service';
import { PoemsReportComponent } from './poems-report.component';
import {
  EMPTY_POEMS,
  POEMS_SECTIONS,
  PoemsData,
  PoemsKey,
  PoemsReportVersionDto,
} from './poems.types';

@Component({
  selector: 'app-poems-tool',
  standalone: true,
  imports: [FormsModule, PoemsReportComponent],
  template: `
    <div class="po">

      <!-- Header -->
      <div class="po__header">
        <div class="po__header-left">
          <div class="po__badge">
            <i class="pi pi-th-large"></i>
          </div>
          <div class="po__title-block">
            <span class="po__title">POEMS</span>
            <span class="po__subtitle">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              } @else {
                {{ filledCount() }}/5 dimensiones completadas
              }
            </span>
          </div>
        </div>
        <div class="po__header-actions">
          <button
            class="po__btn po__btn--ghost"
            (click)="showReport.set(!showReport())"
            [class.po__btn--active]="showReport()"
          >
            <i class="pi pi-chart-bar"></i>
            Informes {{ reports().length ? '(' + reports().length + ')' : '' }}
          </button>
          <button
            class="po__btn po__btn--primary"
            (click)="generateReport()"
            [disabled]="!canGenerate() || analyzing()"
            [title]="!canGenerate() ? 'Completá al menos 3 dimensiones para analizar' : 'Generar informe con IA'"
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
      <div class="po__content">
        @if (showReport()) {
          <app-poems-report [reports]="reports()" />
        } @else {

          <!-- Context strip -->
          <div class="po__context">
            <div class="po__context-field">
              <label class="po__context-label">
                <i class="pi pi-map-marker"></i> Contexto observado
              </label>
              <input
                class="po__context-input"
                type="text"
                [ngModel]="data().contexto"
                (ngModelChange)="onFieldChange('contexto', $event)"
                placeholder="Ej: Sucursal bancaria, hora pico del mediodía"
              />
            </div>
            <div class="po__context-field">
              <label class="po__context-label">
                <i class="pi pi-align-left"></i> Síntesis del equipo (opcional)
              </label>
              <input
                class="po__context-input"
                type="text"
                [ngModel]="data().sintesis"
                (ngModelChange)="onFieldChange('sintesis', $event)"
                placeholder="Ej: La fricción principal ocurre en el momento de espera..."
              />
            </div>
          </div>

          <!-- POEMS panels -->
          <div class="po__grid">
            @for (s of sections; track s.key) {
              <div
                class="po__panel"
                [style.background-color]="s.accentBg"
                [style.border-color]="s.borderColor"
              >
                <div class="po__panel-header" [style.color]="s.textColor">
                  <span class="po__panel-letter" [style.background-color]="s.accentColor">{{ s.letter }}</span>
                  <i class="pi {{ s.icon }}"></i>
                  <span>{{ s.label }}</span>
                  @if (data()[s.key].length > 0) {
                    <span class="po__badge-count" [style.background-color]="s.accentColor">
                      {{ data()[s.key].length }}
                    </span>
                  }
                </div>

                <ul class="po__list">
                  @for (item of data()[s.key]; track $index; let i = $index) {
                    <li class="po__item">
                      <span class="po__item-dot" [style.background-color]="s.accentColor"></span>
                      <span class="po__item-text">{{ item }}</span>
                      <button
                        class="po__item-remove"
                        (click)="removeItem(s.key, i)"
                        title="Eliminar"
                      >
                        <i class="pi pi-times"></i>
                      </button>
                    </li>
                  }
                </ul>

                <div class="po__input-row">
                  <input
                    class="po__input"
                    type="text"
                    [placeholder]="s.placeholder"
                    [ngModel]="newItemTexts()[s.key]"
                    (ngModelChange)="updateNewItemText(s.key, $event)"
                    (keydown.enter)="addItem(s.key, newItemTexts()[s.key])"
                    [style.border-color]="s.borderColor"
                  />
                  <button
                    class="po__add-btn"
                    [style.background-color]="s.accentColor"
                    (click)="addItem(s.key, newItemTexts()[s.key])"
                    [disabled]="!newItemTexts()[s.key].trim()"
                    title="Agregar"
                  >
                    <i class="pi pi-plus"></i>
                  </button>
                </div>
              </div>
            }
          </div>

        }
      </div>

    </div>
  `,
  styles: [`
    .po {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 12px;
    }

    /* ─── Header ─────────────────────────────────────────────────── */
    .po__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-shrink: 0;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--p-surface-200);
    }

    .po__header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .po__badge {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #f5f3ff;
      color: #6d28d9;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      flex-shrink: 0;
    }

    .po__title-block {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .po__title {
      font-family: 'Syne', sans-serif;
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--p-text-color);
      line-height: 1.2;
    }

    .po__subtitle {
      font-size: 0.72rem;
      color: var(--p-text-muted-color);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .po__header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* ─── Buttons ─────────────────────────────────────────────────── */
    .po__btn {
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

    .po__btn .pi { font-size: 0.8rem; }
    .po__btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .po__btn--ghost {
      background: transparent;
      border-color: var(--p-surface-300);
      color: var(--p-text-secondary-color);
    }

    .po__btn--ghost:hover:not(:disabled) { background: var(--p-surface-100); }
    .po__btn--ghost.po__btn--active { background: #f5f3ff; border-color: #ddd6fe; color: #6d28d9; }

    .po__btn--primary {
      background: var(--p-primary-600, #0284c7);
      color: white;
      border-color: var(--p-primary-600, #0284c7);
    }

    .po__btn--primary:hover:not(:disabled) { background: var(--p-primary-700, #0369a1); }

    /* ─── Content ─────────────────────────────────────────────────── */
    .po__content {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* ─── Context strip ───────────────────────────────────────────── */
    .po__context {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      flex-shrink: 0;
    }

    .po__context-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .po__context-label {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--p-text-secondary-color);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .po__context-label .pi { font-size: 0.7rem; }

    .po__context-input {
      padding: 7px 10px;
      border-radius: 8px;
      border: 1px solid var(--p-surface-300);
      font-size: 0.8125rem;
      background: var(--p-surface-0);
      color: var(--p-text-color);
      outline: none;
      transition: border-color 0.15s;
      width: 100%;
      box-sizing: border-box;
    }

    .po__context-input::placeholder { color: #9ca3af; }
    .po__context-input:focus { border-color: #7c3aed; box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.12); }

    /* ─── Grid ────────────────────────────────────────────────────── */
    .po__grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
      flex: 1;
      min-height: 0;
    }

    /* ─── Panel ───────────────────────────────────────────────────── */
    .po__panel {
      border-radius: 12px;
      padding: 12px;
      border: 1px solid transparent;
      display: flex;
      flex-direction: column;
      gap: 8px;
      overflow: hidden;
      min-width: 0;
    }

    .po__panel-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      flex-shrink: 0;
    }

    .po__panel-header .pi { font-size: 0.75rem; }

    .po__panel-letter {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      color: white;
      font-size: 0.7rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .po__badge-count {
      margin-left: auto;
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 10px;
      line-height: 1.6;
    }

    /* ─── Items list ──────────────────────────────────────────────── */
    .po__list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      overflow-y: auto;
      min-height: 0;
    }

    .po__item {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      font-size: 0.8rem;
      color: #374151;
      line-height: 1.4;
      padding: 4px 6px;
      border-radius: 6px;
      background: rgba(255,255,255,0.6);
    }

    .po__item:hover .po__item-remove { opacity: 1; }

    .po__item-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      margin-top: 4px;
      flex-shrink: 0;
    }

    .po__item-text {
      flex: 1;
      word-break: break-word;
    }

    .po__item-remove {
      opacity: 0;
      background: none;
      border: none;
      cursor: pointer;
      color: #9ca3af;
      padding: 0 2px;
      font-size: 0.65rem;
      flex-shrink: 0;
      transition: color 0.15s, opacity 0.15s;
      line-height: 1;
      margin-top: 2px;
    }

    .po__item-remove:hover { color: #ef4444; }

    /* ─── Input row ───────────────────────────────────────────────── */
    .po__input-row {
      display: flex;
      gap: 6px;
      align-items: center;
      flex-shrink: 0;
    }

    .po__input {
      flex: 1;
      padding: 6px 8px;
      border-radius: 8px;
      border: 1px solid;
      font-size: 0.75rem;
      background: rgba(255,255,255,0.8);
      color: var(--p-text-color);
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
      min-width: 0;
    }

    .po__input::placeholder { color: #9ca3af; }

    .po__add-btn {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: filter 0.15s;
      font-size: 0.7rem;
    }

    .po__add-btn:hover:not(:disabled) { filter: brightness(0.9); }
    .po__add-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  `],
})
export class PoemsToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly poemsService = inject(PoemsService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  // ─── Estado ───────────────────────────────────────────────────────────────
  data = signal<PoemsData>({ ...EMPTY_POEMS });
  reports = signal<PoemsReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);
  newItemTexts = signal<Record<PoemsKey, string>>({
    people: '',
    objects: '',
    environment: '',
    messages: '',
    services: '',
  });

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly sections = POEMS_SECTIONS;

  // ─── Computed ─────────────────────────────────────────────────────────────
  filledCount = computed(
    () => POEMS_SECTIONS.filter(s => this.data()[s.key].length > 0).length
  );

  canGenerate = computed(
    () => POEMS_SECTIONS.filter(s => this.data()[s.key].length > 0).length >= 3
  );

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;

    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as PoemsData | undefined;
    const storedReports = (raw['reports'] as PoemsReportVersionDto[]) ?? [];

    this.data.set(stored ? { ...EMPTY_POEMS, ...stored } : { ...EMPTY_POEMS });
    this.reports.set(storedReports);
  }

  // ─── Acciones ─────────────────────────────────────────────────────────────
  onFieldChange(field: 'contexto' | 'sintesis', value: string): void {
    this.data.set({ ...this.data(), [field]: value });
    this.scheduleSave();
  }

  addItem(key: PoemsKey, text: string): void {
    const trimmed = text.trim();
    if (!trimmed) return;

    this.data.set({ ...this.data(), [key]: [...this.data()[key], trimmed] });
    this.newItemTexts.set({ ...this.newItemTexts(), [key]: '' });
    this.scheduleSave();
  }

  removeItem(key: PoemsKey, index: number): void {
    const arr = [...this.data()[key]];
    arr.splice(index, 1);
    this.data.set({ ...this.data(), [key]: arr });
    this.scheduleSave();
  }

  updateNewItemText(key: PoemsKey, value: string): void {
    this.newItemTexts.set({ ...this.newItemTexts(), [key]: value });
  }

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;

    this.analyzing.set(true);
    try {
      const result = await this.poemsService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });

      const newVersion: PoemsReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };

      const updatedReports = [newVersion, ...this.reports()];
      this.reports.set(updatedReports);

      await this.persistData(updatedReports);
      this.showReport.set(true);
      this.uiDialog.showSuccess('Informe generado', 'El análisis POEMS fue generado correctamente.');
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

  private async persistData(reports: PoemsReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;

    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
