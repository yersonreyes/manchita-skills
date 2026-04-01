import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { StakeholderMapService } from '@core/services/stakeholderMapService/stakeholder-map.service';
import { StakeholderMapReportComponent } from './stakeholder-map-report.component';
import {
  EMPTY_STAKEHOLDER_ITEMS,
  STAKEHOLDER_QUADRANTS,
  STAKEHOLDER_TIPOS,
  StakeholderCuadrante,
  StakeholderItem,
  StakeholderMapItems,
  StakeholderMapReportVersionDto,
  StakeholderTipo,
} from './stakeholder-map.types';

interface AddingState {
  cuadrante: StakeholderCuadrante;
  nombre: string;
  tipo: StakeholderTipo;
  descripcion: string;
}

@Component({
  selector: 'app-stakeholder-map-tool',
  standalone: true,
  imports: [FormsModule, StakeholderMapReportComponent],
  template: `
    <div class="sm">

      <!-- Header -->
      <div class="sm__header">
        <div class="sm__header-left">
          <div class="sm__badge">
            <i class="pi pi-users"></i>
          </div>
          <div class="sm__title-block">
            <span class="sm__title">Stakeholder Map</span>
            <span class="sm__subtitle">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              } @else {
                {{ totalCount() }} actores identificados
              }
            </span>
          </div>
        </div>
        <div class="sm__header-actions">
          <button
            class="sm__btn sm__btn--ghost"
            (click)="toggleReport()"
            [class.sm__btn--active]="showReport()"
          >
            <i class="pi pi-chart-bar"></i>
            Informes {{ reports().length ? '(' + reports().length + ')' : '' }}
          </button>
          <button
            class="sm__btn sm__btn--primary"
            (click)="generateReport()"
            [disabled]="!canGenerate() || analyzing()"
            [title]="!canGenerate() ? 'Agregá al menos 1 actor para analizar' : 'Generar informe con IA'"
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
      <div class="sm__content">
        @if (showReport()) {
          <app-stakeholder-map-report [reports]="reports()" />
        } @else {

          <!-- Axis labels -->
          <div class="sm__axis-labels">
            <div class="sm__axis sm__axis--y">
              <i class="pi pi-arrow-up"></i> Poder
            </div>
            <div class="sm__axis sm__axis--x">
              Interés <i class="pi pi-arrow-right"></i>
            </div>
          </div>

          <!-- 2x2 matrix -->
          <div class="sm__grid">
            @for (q of quadrants; track q.key) {
              <div
                class="sm__quadrant"
                [style.background-color]="q.accentBg"
                [style.border-color]="q.borderColor"
              >
                <!-- Quadrant header -->
                <div class="sm__quadrant-header" [style.color]="q.textColor">
                  <i class="pi {{ q.icon }}"></i>
                  <span>{{ q.label }}</span>
                  @if (items()[q.key].length > 0) {
                    <span class="sm__badge-count" [style.background-color]="q.accentColor">
                      {{ items()[q.key].length }}
                    </span>
                  }
                </div>
                <p class="sm__quadrant-estrategia">{{ q.estrategia }}</p>

                <!-- Items list -->
                <ul class="sm__list">
                  @for (item of items()[q.key]; track item.id) {
                    <li class="sm__item">
                      <span class="sm__item-dot" [style.background-color]="q.accentColor"></span>
                      <div class="sm__item-body">
                        <span class="sm__item-nombre">{{ item.nombre }}</span>
                        <span class="sm__item-tipo">{{ tipoLabel(item.tipo) }}</span>
                      </div>
                      <button
                        class="sm__item-remove"
                        (click)="removeItem(q.key, item.id)"
                        title="Eliminar"
                      >
                        <i class="pi pi-times"></i>
                      </button>
                    </li>
                  }
                </ul>

                <!-- Add form or trigger -->
                @if (adding()?.cuadrante === q.key) {
                  <div class="sm__add-form">
                    <input
                      class="sm__input"
                      type="text"
                      placeholder="Nombre del actor..."
                      [(ngModel)]="addingNombre"
                      (keydown.enter)="confirmAdd()"
                      (keydown.escape)="cancelAdd()"
                      [style.--focus-color]="q.accentColor"
                      autofocus
                    />
                    <div class="sm__add-row">
                      <select class="sm__select" [(ngModel)]="addingTipo">
                        @for (t of tipos; track t.value) {
                          <option [value]="t.value">{{ t.label }}</option>
                        }
                      </select>
                      <button class="sm__confirm-btn" [style.background-color]="q.accentColor" (click)="confirmAdd()" title="Confirmar">
                        <i class="pi pi-check"></i>
                      </button>
                      <button class="sm__cancel-btn" (click)="cancelAdd()" title="Cancelar">
                        <i class="pi pi-times"></i>
                      </button>
                    </div>
                    <input
                      class="sm__input sm__input--sm"
                      type="text"
                      placeholder="Descripción (opcional)..."
                      [(ngModel)]="addingDescripcion"
                      (keydown.enter)="confirmAdd()"
                      (keydown.escape)="cancelAdd()"
                      [style.--focus-color]="q.accentColor"
                    />
                  </div>
                } @else {
                  <button
                    class="sm__add-trigger"
                    [style.color]="q.textColor"
                    [style.border-color]="q.borderColor"
                    (click)="startAdd(q.key)"
                  >
                    <i class="pi pi-plus"></i> Actor
                  </button>
                }
              </div>
            }
          </div>

        }
      </div>

    </div>
  `,
  styles: [`
    .sm {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 12px;
    }

    /* ─── Header ─────────────────────────────────────────────────── */
    .sm__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-shrink: 0;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--p-surface-200);
    }

    .sm__header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .sm__badge {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #f5f3ff;
      color: #7c3aed;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      flex-shrink: 0;
    }

    .sm__title-block {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .sm__title {
      font-family: 'Syne', sans-serif;
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--p-text-color);
      line-height: 1.2;
    }

    .sm__subtitle {
      font-size: 0.72rem;
      color: var(--p-text-muted-color);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .sm__header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* ─── Buttons ─────────────────────────────────────────────────── */
    .sm__btn {
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

    .sm__btn .pi { font-size: 0.8rem; }
    .sm__btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .sm__btn--ghost {
      background: transparent;
      border-color: var(--p-surface-300);
      color: var(--p-text-secondary-color);
    }

    .sm__btn--ghost:hover:not(:disabled) { background: var(--p-surface-100); }

    .sm__btn--active {
      background: #f5f3ff;
      border-color: #ddd6fe;
      color: #5b21b6;
    }

    .sm__btn--primary {
      background: var(--p-primary-600, #0284c7);
      color: white;
      border-color: var(--p-primary-600, #0284c7);
    }

    .sm__btn--primary:hover:not(:disabled) { background: var(--p-primary-700, #0369a1); }

    /* ─── Content ─────────────────────────────────────────────────── */
    .sm__content {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    /* ─── Axis labels ─────────────────────────────────────────────── */
    .sm__axis-labels {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
      padding: 0 4px;
    }

    .sm__axis {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.68rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--p-text-muted-color);
    }

    .sm__axis .pi { font-size: 0.65rem; }

    /* ─── Grid ────────────────────────────────────────────────────── */
    .sm__grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      flex: 1;
      min-height: 0;
    }

    /* ─── Quadrant ────────────────────────────────────────────────── */
    .sm__quadrant {
      border-radius: 12px;
      padding: 12px;
      border: 1px solid transparent;
      display: flex;
      flex-direction: column;
      gap: 8px;
      overflow: hidden;
    }

    .sm__quadrant-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      flex-shrink: 0;
    }

    .sm__quadrant-header .pi { font-size: 0.8rem; }

    .sm__badge-count {
      margin-left: auto;
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 10px;
      line-height: 1.6;
    }

    .sm__quadrant-estrategia {
      margin: 0;
      font-size: 0.68rem;
      color: var(--p-text-muted-color);
      font-style: italic;
      flex-shrink: 0;
    }

    /* ─── Items list ──────────────────────────────────────────────── */
    .sm__list {
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

    .sm__item {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      padding: 5px 7px;
      border-radius: 7px;
      background: rgba(255,255,255,0.65);
    }

    .sm__item:hover .sm__item-remove { opacity: 1; }

    .sm__item-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      margin-top: 5px;
      flex-shrink: 0;
    }

    .sm__item-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1px;
      min-width: 0;
    }

    .sm__item-nombre {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--p-text-color);
      line-height: 1.3;
      word-break: break-word;
    }

    .sm__item-tipo {
      font-size: 0.68rem;
      color: var(--p-text-muted-color);
    }

    .sm__item-remove {
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
      margin-top: 3px;
    }

    .sm__item-remove:hover { color: #ef4444; }

    /* ─── Add trigger ─────────────────────────────────────────────── */
    .sm__add-trigger {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 5px 9px;
      border-radius: 7px;
      border: 1px dashed;
      background: transparent;
      font-size: 0.73rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.15s;
      flex-shrink: 0;
      opacity: 0.65;
    }

    .sm__add-trigger:hover { opacity: 1; background: rgba(255,255,255,0.5); }
    .sm__add-trigger .pi { font-size: 0.7rem; }

    /* ─── Add form ────────────────────────────────────────────────── */
    .sm__add-form {
      display: flex;
      flex-direction: column;
      gap: 5px;
      flex-shrink: 0;
    }

    .sm__add-row {
      display: flex;
      gap: 5px;
      align-items: center;
    }

    .sm__input {
      width: 100%;
      padding: 5px 9px;
      border-radius: 7px;
      border: 1px solid var(--p-surface-300);
      font-size: 0.78rem;
      background: white;
      color: var(--p-text-color);
      outline: none;
      font-family: inherit;
      transition: border-color 0.15s;
      box-sizing: border-box;
    }

    .sm__input:focus { border-color: var(--focus-color, var(--p-primary-400)); }
    .sm__input::placeholder { color: var(--p-text-muted-color); }
    .sm__input--sm { font-size: 0.72rem; }

    .sm__select {
      flex: 1;
      padding: 5px 7px;
      border-radius: 7px;
      border: 1px solid var(--p-surface-300);
      font-size: 0.73rem;
      font-family: inherit;
      background: white;
      color: var(--p-text-color);
      cursor: pointer;
      outline: none;
    }

    .sm__confirm-btn {
      width: 28px;
      height: 28px;
      border-radius: 7px;
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 0.7rem;
      transition: filter 0.15s;
    }

    .sm__confirm-btn:hover { filter: brightness(0.9); }

    .sm__cancel-btn {
      width: 28px;
      height: 28px;
      border-radius: 7px;
      border: 1px solid var(--p-surface-300);
      background: white;
      color: var(--p-text-muted-color);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 0.7rem;
      transition: all 0.15s;
    }

    .sm__cancel-btn:hover { background: #fef2f2; border-color: #fecaca; color: #dc2626; }
  `],
})
export class StakeholderMapToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly stakeholderMapService = inject(StakeholderMapService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  // ─── Estado ───────────────────────────────────────────────────────────────
  items = signal<StakeholderMapItems>({ ...EMPTY_STAKEHOLDER_ITEMS });
  reports = signal<StakeholderMapReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);
  adding = signal<AddingState | null>(null);

  addingNombre = '';
  addingTipo: StakeholderTipo = 'otro';
  addingDescripcion = '';

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly quadrants = STAKEHOLDER_QUADRANTS;
  readonly tipos = STAKEHOLDER_TIPOS;

  // ─── Computed ─────────────────────────────────────────────────────────────
  totalCount = computed(
    () => Object.values(this.items()).reduce((sum, arr) => sum + arr.length, 0)
  );

  canGenerate = computed(() => this.totalCount() >= 1);

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;

    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const storedItems = raw['items'] as StakeholderMapItems | undefined;
    const storedReports = (raw['reports'] as StakeholderMapReportVersionDto[]) ?? [];

    this.items.set(storedItems ? { ...EMPTY_STAKEHOLDER_ITEMS, ...storedItems } : { ...EMPTY_STAKEHOLDER_ITEMS });
    this.reports.set(storedReports);
  }

  // ─── Helpers de UI ────────────────────────────────────────────────────────
  tipoLabel(tipo: StakeholderTipo): string {
    return STAKEHOLDER_TIPOS.find(t => t.value === tipo)?.label ?? tipo;
  }

  toggleReport(): void {
    this.showReport.set(!this.showReport());
  }

  // ─── Acciones de items ────────────────────────────────────────────────────
  startAdd(cuadrante: StakeholderCuadrante): void {
    this.addingNombre = '';
    this.addingTipo = 'otro';
    this.addingDescripcion = '';
    this.adding.set({ cuadrante, nombre: '', tipo: 'otro', descripcion: '' });
  }

  cancelAdd(): void {
    this.adding.set(null);
  }

  confirmAdd(): void {
    const state = this.adding();
    if (!state || !this.addingNombre.trim()) return;

    const newItem: StakeholderItem = {
      id: crypto.randomUUID(),
      nombre: this.addingNombre.trim(),
      tipo: this.addingTipo,
      descripcion: this.addingDescripcion.trim(),
    };

    this.items.set({
      ...this.items(),
      [state.cuadrante]: [...this.items()[state.cuadrante], newItem],
    });

    this.adding.set(null);
    this.scheduleSave();
  }

  removeItem(cuadrante: StakeholderCuadrante, id: string): void {
    this.items.set({
      ...this.items(),
      [cuadrante]: this.items()[cuadrante].filter(i => i.id !== id),
    });
    this.scheduleSave();
  }

  // ─── Análisis IA ──────────────────────────────────────────────────────────
  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;

    this.analyzing.set(true);
    try {
      const result = await this.stakeholderMapService.analyze({
        toolApplicationId: app.id,
        cuadrantes: this.items(),
        currentVersion: this.reports().length,
      });

      const newVersion: StakeholderMapReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };

      const updated = [newVersion, ...this.reports()];
      this.reports.set(updated);
      await this.persistData(updated);
      this.showReport.set(true);
      this.uiDialog.showSuccess('Informe generado', 'El análisis del Stakeholder Map fue generado correctamente.');
    } catch (error) {
      this.uiDialog.showError('Error', `No se pudo generar el informe: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      this.analyzing.set(false);
    }
  }

  // ─── Helpers privados ──────────────────────────────────────────────────────
  private scheduleSave(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => void this.saveItems(), 800);
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
    } catch { /* silent */ }
    finally { this.saving.set(false); }
  }

  private async persistData(reports: StakeholderMapReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;

    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, items: this.items(), reports },
    });
    this.sessionSaved.emit();
  }
}
