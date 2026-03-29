import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { FodaService } from '@core/services/fodaService/foda.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { FodaReportComponent } from './foda-report.component';
import {
  EMPTY_ITEMS,
  FODA_QUADRANTS,
  FodaItems,
  FodaQuadrantKey,
  FodaReportVersionDto,
} from './foda.types';

@Component({
  selector: 'app-foda-tool',
  standalone: true,
  imports: [FormsModule, FodaReportComponent],
  template: `
    <div class="foda">

      <!-- Header -->
      <div class="foda__header">
        <div class="foda__header-left">
          <div class="foda__badge">
            <i class="pi pi-th-large"></i>
          </div>
          <div class="foda__title-block">
            <span class="foda__title">Análisis FODA</span>
            <span class="foda__subtitle">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              } @else {
                {{ filledCount() }}/4 cuadrantes completados
              }
            </span>
          </div>
        </div>
        <div class="foda__header-actions">
          <button
            class="foda__btn foda__btn--ghost"
            (click)="toggleReport()"
            [class.foda__btn--active]="showReport()"
          >
            <i class="pi pi-chart-bar"></i>
            Informes {{ reports().length ? '(' + reports().length + ')' : '' }}
          </button>
          <button
            class="foda__btn foda__btn--primary"
            (click)="generateReport()"
            [disabled]="!canGenerate() || analyzing()"
            [title]="!canGenerate() ? 'Completá al menos 2 cuadrantes para analizar' : 'Generar informe con IA'"
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
      <div class="foda__content">
        @if (showReport()) {
          <app-foda-report [reports]="reports()" />
        } @else {
          <div class="foda__grid">
            @for (q of quadrants; track q.key) {
              <div
                class="foda__quadrant"
                [style.background-color]="q.accentBg"
                [style.border-color]="q.borderColor"
              >
                <!-- Quadrant header -->
                <div class="foda__quadrant-header" [style.color]="q.textColor">
                  <i class="pi {{ q.icon }}"></i>
                  <span>{{ q.label }}</span>
                  @if (items()[q.key].length > 0) {
                    <span class="foda__badge-count" [style.background-color]="q.accentColor">
                      {{ items()[q.key].length }}
                    </span>
                  }
                </div>

                <!-- Items list -->
                <ul class="foda__list">
                  @for (item of items()[q.key]; track $index; let i = $index) {
                    <li class="foda__item">
                      <span class="foda__item-dot" [style.background-color]="q.accentColor"></span>
                      <span class="foda__item-text">{{ item }}</span>
                      <button
                        class="foda__item-remove"
                        (click)="removeItem(q.key, i)"
                        title="Eliminar"
                      >
                        <i class="pi pi-times"></i>
                      </button>
                    </li>
                  }
                </ul>

                <!-- Add input -->
                <div class="foda__input-row">
                  <input
                    class="foda__input"
                    type="text"
                    [placeholder]="q.placeholder"
                    [ngModel]="newItemTexts()[q.key]"
                    (ngModelChange)="updateNewItemText(q.key, $event)"
                    (keydown.enter)="addItem(q.key, newItemTexts()[q.key])"
                    [style.border-color]="q.borderColor"
                    [style.--focus-color]="q.accentColor"
                  />
                  <button
                    class="foda__add-btn"
                    [style.background-color]="q.accentColor"
                    (click)="addItem(q.key, newItemTexts()[q.key])"
                    [disabled]="!newItemTexts()[q.key].trim()"
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
    .foda {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 12px;
    }

    /* ─── Header ─────────────────────────────────────────────────── */
    .foda__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-shrink: 0;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--p-surface-200);
    }

    .foda__header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .foda__badge {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: var(--p-primary-100, #e0f2fe);
      color: var(--p-primary-600, #0284c7);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      flex-shrink: 0;
    }

    .foda__title-block {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .foda__title {
      font-family: 'Syne', sans-serif;
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--p-text-color);
      line-height: 1.2;
    }

    .foda__subtitle {
      font-size: 0.72rem;
      color: var(--p-text-muted-color);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .foda__header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* ─── Buttons ─────────────────────────────────────────────────── */
    .foda__btn {
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

      .pi { font-size: 0.8rem; }

      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .foda__btn--ghost {
      background: transparent;
      border-color: var(--p-surface-300);
      color: var(--p-text-secondary-color);

      &:hover:not(:disabled) { background: var(--p-surface-100); }
      &.foda__btn--active { background: var(--p-primary-50, #eff6ff); border-color: var(--p-primary-200, #bfdbfe); color: var(--p-primary-700, #1d4ed8); }
    }

    .foda__btn--primary {
      background: var(--p-primary-600, #0284c7);
      color: white;
      border-color: var(--p-primary-600, #0284c7);

      &:hover:not(:disabled) { background: var(--p-primary-700, #0369a1); }
    }

    /* ─── Content ─────────────────────────────────────────────────── */
    .foda__content {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }

    /* ─── Grid ────────────────────────────────────────────────────── */
    .foda__grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      flex: 1;
      min-height: 0;
    }

    /* ─── Quadrant ────────────────────────────────────────────────── */
    .foda__quadrant {
      border-radius: 12px;
      padding: 12px;
      border: 1px solid transparent;
      display: flex;
      flex-direction: column;
      gap: 8px;
      overflow: hidden;
    }

    .foda__quadrant-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      flex-shrink: 0;

      .pi { font-size: 0.8rem; }
    }

    .foda__badge-count {
      margin-left: auto;
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 10px;
      line-height: 1.6;
    }

    /* ─── Items list ──────────────────────────────────────────────── */
    .foda__list {
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

    .foda__item {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      font-size: 0.8125rem;
      color: #374151;
      line-height: 1.4;
      padding: 4px 6px;
      border-radius: 6px;
      background: rgba(255,255,255,0.6);

      &:hover .foda__item-remove { opacity: 1; }
    }

    .foda__item-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      margin-top: 4px;
      flex-shrink: 0;
    }

    .foda__item-text {
      flex: 1;
      word-break: break-word;
    }

    .foda__item-remove {
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

      &:hover { color: #ef4444; }
    }

    /* ─── Input row ───────────────────────────────────────────────── */
    .foda__input-row {
      display: flex;
      gap: 6px;
      align-items: center;
      flex-shrink: 0;
    }

    .foda__input {
      flex: 1;
      padding: 6px 10px;
      border-radius: 8px;
      border: 1px solid;
      font-size: 0.8rem;
      background: rgba(255,255,255,0.8);
      color: var(--p-text-color);
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;

      &::placeholder { color: #9ca3af; }
      &:focus { box-shadow: 0 0 0 2px color-mix(in srgb, var(--focus-color, #3b82f6) 20%, transparent); }
    }

    .foda__add-btn {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: filter 0.15s;
      font-size: 0.75rem;

      &:hover:not(:disabled) { filter: brightness(0.9); }
      &:disabled { opacity: 0.4; cursor: not-allowed; }
    }
  `],
})
export class FodaToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly fodaService = inject(FodaService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  // ─── Estado ───────────────────────────────────────────────────────────────
  items = signal<FodaItems>({ ...EMPTY_ITEMS });
  reports = signal<FodaReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);
  newItemTexts = signal<Record<FodaQuadrantKey, string>>({
    fortalezas: '',
    oportunidades: '',
    debilidades: '',
    amenazas: '',
  });

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly quadrants = FODA_QUADRANTS;

  // ─── Computed ─────────────────────────────────────────────────────────────
  filledCount = computed(
    () => FODA_QUADRANTS.filter((q) => this.items()[q.key].length > 0).length
  );

  canGenerate = computed(
    () => FODA_QUADRANTS.filter((q) => this.items()[q.key].length > 0).length >= 2
  );

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;

    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const storedItems = raw['items'] as FodaItems | undefined;
    const storedReports = (raw['reports'] as FodaReportVersionDto[]) ?? [];

    this.items.set(storedItems ? { ...EMPTY_ITEMS, ...storedItems } : { ...EMPTY_ITEMS });
    this.reports.set(storedReports);
  }

  // ─── Acciones ─────────────────────────────────────────────────────────────
  addItem(key: FodaQuadrantKey, text: string): void {
    const trimmed = text.trim();
    if (!trimmed) return;

    const current = this.items();
    this.items.set({ ...current, [key]: [...current[key], trimmed] });
    this.newItemTexts.set({ ...this.newItemTexts(), [key]: '' });
    this.scheduleSave();
  }

  removeItem(key: FodaQuadrantKey, index: number): void {
    const arr = [...this.items()[key]];
    arr.splice(index, 1);
    this.items.set({ ...this.items(), [key]: arr });
    this.scheduleSave();
  }

  updateNewItemText(key: FodaQuadrantKey, value: string): void {
    this.newItemTexts.set({ ...this.newItemTexts(), [key]: value });
  }

  toggleReport(): void {
    this.showReport.set(!this.showReport());
  }

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;

    this.analyzing.set(true);
    try {
      const result = await this.fodaService.analyze({
        toolApplicationId: app.id,
        items: this.items(),
        currentVersion: this.reports().length,
      });

      const newVersion: FodaReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };

      const updatedReports = [newVersion, ...this.reports()];
      this.reports.set(updatedReports);

      await this.persistData(updatedReports);
      this.showReport.set(true);
      this.uiDialog.showSuccess('Informe generado', 'El análisis FODA fue generado y guardado correctamente.');
    } catch (error) {
      this.uiDialog.showError('Error', `No se pudo generar el informe: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      this.analyzing.set(false);
    }
  }

  // ─── Helpers privados ──────────────────────────────────────────────────────
  private scheduleSave(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.saveItems(), 800);
  }

  private async saveItems(): Promise<void> {
    const app = this.application();
    if (!app) return;

    this.saving.set(true);
    try {
      const currentData = (app.structuredData as Record<string, unknown>) ?? {};
      await this.toolApplicationService.update(app.id, {
        structuredData: { ...currentData, items: this.items() },
      });
      this.sessionSaved.emit();
    } catch {
      // silent — datos en memoria, no se pierden
    } finally {
      this.saving.set(false);
    }
  }

  private async persistData(reports: FodaReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;

    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, items: this.items(), reports },
    });
    this.sessionSaved.emit();
  }
}
