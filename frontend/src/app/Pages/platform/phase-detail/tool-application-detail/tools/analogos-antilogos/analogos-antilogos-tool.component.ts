import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { AnalogosAntilogosService } from '@core/services/analogosAntilogosService/analogos-antilogos.service';
import { AnalogosAntilogosReportComponent } from './analogos-antilogos-report.component';
import {
  AnalogoItem,
  AntilogoItem,
  AnalogosAntilogosItems,
  AnalogosAntilogosReportVersionDto,
  EMPTY_ITEMS,
} from './analogos-antilogos.types';

@Component({
  selector: 'app-analogos-antilogos-tool',
  standalone: true,
  imports: [FormsModule, AnalogosAntilogosReportComponent],
  template: `
    <div class="aa">

      <!-- Header -->
      <div class="aa__header">
        <div class="aa__header-left">
          <div class="aa__badge">
            <i class="pi pi-arrows-h"></i>
          </div>
          <div class="aa__title-block">
            <span class="aa__title">Análogos y Antilogos</span>
            <span class="aa__subtitle">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              } @else {
                {{ items().analogos.length }} análogo{{ items().analogos.length !== 1 ? 's' : '' }} ·
                {{ items().antilogos.length }} antilogo{{ items().antilogos.length !== 1 ? 's' : '' }}
              }
            </span>
          </div>
        </div>
        <div class="aa__header-actions">
          <button
            class="aa__btn aa__btn--ghost"
            (click)="toggleReport()"
            [class.aa__btn--active]="showReport()"
          >
            <i class="pi pi-chart-bar"></i>
            Informes {{ reports().length ? '(' + reports().length + ')' : '' }}
          </button>
          <button
            class="aa__btn aa__btn--primary"
            (click)="generateReport()"
            [disabled]="!canGenerate() || analyzing()"
            [title]="!canGenerate() ? 'Agregá al menos un análogo o antilogo para analizar' : 'Generar informe con IA'"
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
      <div class="aa__content">
        @if (showReport()) {
          <app-analogos-antilogos-report [reports]="reports()" />
        } @else {
          <div class="aa__grid">

            <!-- Análogos -->
            <div class="aa__panel aa__panel--analogos">
              <div class="aa__panel-header">
                <i class="pi pi-check-circle"></i>
                <span>Análogos</span>
                <span class="aa__panel-hint">Soluciones exitosas de otras industrias que podés adaptar</span>
              </div>

              <!-- Lista de análogos -->
              <div class="aa__list">
                @for (item of items().analogos; track $index; let i = $index) {
                  <div class="aa__card aa__card--analogo">
                    <div class="aa__card-body">
                      <div class="aa__card-row">
                        <span class="aa__card-label">Industria</span>
                        <span class="aa__card-value">{{ item.industria }}</span>
                      </div>
                      <div class="aa__card-row">
                        <span class="aa__card-label">Solución</span>
                        <span class="aa__card-value">{{ item.solucion }}</span>
                      </div>
                      @if (item.adaptacion) {
                        <div class="aa__card-row">
                          <span class="aa__card-label">Adaptación</span>
                          <span class="aa__card-value aa__card-value--muted">{{ item.adaptacion }}</span>
                        </div>
                      }
                    </div>
                    <button class="aa__card-remove" (click)="removeAnalogo(i)" title="Eliminar">
                      <i class="pi pi-times"></i>
                    </button>
                  </div>
                }
                @if (items().analogos.length === 0) {
                  <p class="aa__empty">Agregá un análogo para empezar</p>
                }
              </div>

              <!-- Form para agregar análogo -->
              <div class="aa__form">
                <input
                  class="aa__input aa__input--analogo"
                  type="text"
                  placeholder="Industria (ej: Aviación)"
                  [ngModel]="newAnalogo().industria"
                  (ngModelChange)="updateNewAnalogo('industria', $event)"
                />
                <input
                  class="aa__input aa__input--analogo"
                  type="text"
                  placeholder="Solución que usan (ej: Sistema de slots)"
                  [ngModel]="newAnalogo().solucion"
                  (ngModelChange)="updateNewAnalogo('solucion', $event)"
                />
                <input
                  class="aa__input aa__input--analogo"
                  type="text"
                  placeholder="Cómo adaptarla (opcional)"
                  [ngModel]="newAnalogo().adaptacion"
                  (ngModelChange)="updateNewAnalogo('adaptacion', $event)"
                  (keydown.enter)="addAnalogo()"
                />
                <button
                  class="aa__add-btn aa__add-btn--analogo"
                  (click)="addAnalogo()"
                  [disabled]="!newAnalogo().industria.trim() || !newAnalogo().solucion.trim()"
                >
                  <i class="pi pi-plus"></i> Agregar análogo
                </button>
              </div>
            </div>

            <!-- Antilogos -->
            <div class="aa__panel aa__panel--antilogos">
              <div class="aa__panel-header">
                <i class="pi pi-times-circle"></i>
                <span>Antilogos</span>
                <span class="aa__panel-hint">Fracasos conocidos de otras industrias que debés evitar</span>
              </div>

              <!-- Lista de antilogos -->
              <div class="aa__list">
                @for (item of items().antilogos; track $index; let i = $index) {
                  <div class="aa__card aa__card--antilogo">
                    <div class="aa__card-body">
                      <div class="aa__card-row">
                        <span class="aa__card-label">Industria</span>
                        <span class="aa__card-value">{{ item.industria }}</span>
                      </div>
                      <div class="aa__card-row">
                        <span class="aa__card-label">Fracaso</span>
                        <span class="aa__card-value">{{ item.fracaso }}</span>
                      </div>
                      @if (item.errorAEvitar) {
                        <div class="aa__card-row">
                          <span class="aa__card-label">Error a evitar</span>
                          <span class="aa__card-value aa__card-value--muted">{{ item.errorAEvitar }}</span>
                        </div>
                      }
                    </div>
                    <button class="aa__card-remove" (click)="removeAntilogo(i)" title="Eliminar">
                      <i class="pi pi-times"></i>
                    </button>
                  </div>
                }
                @if (items().antilogos.length === 0) {
                  <p class="aa__empty">Agregá un antilogo para empezar</p>
                }
              </div>

              <!-- Form para agregar antilogo -->
              <div class="aa__form">
                <input
                  class="aa__input aa__input--antilogo"
                  type="text"
                  placeholder="Industria (ej: Retail)"
                  [ngModel]="newAntilogo().industria"
                  (ngModelChange)="updateNewAntilogo('industria', $event)"
                />
                <input
                  class="aa__input aa__input--antilogo"
                  type="text"
                  placeholder="¿Qué falló? (ej: Descuentos insostenibles)"
                  [ngModel]="newAntilogo().fracaso"
                  (ngModelChange)="updateNewAntilogo('fracaso', $event)"
                />
                <input
                  class="aa__input aa__input--antilogo"
                  type="text"
                  placeholder="Error a evitar (opcional)"
                  [ngModel]="newAntilogo().errorAEvitar"
                  (ngModelChange)="updateNewAntilogo('errorAEvitar', $event)"
                  (keydown.enter)="addAntilogo()"
                />
                <button
                  class="aa__add-btn aa__add-btn--antilogo"
                  (click)="addAntilogo()"
                  [disabled]="!newAntilogo().industria.trim() || !newAntilogo().fracaso.trim()"
                >
                  <i class="pi pi-plus"></i> Agregar antilogo
                </button>
              </div>
            </div>

          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    .aa {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 12px;
    }

    /* ─── Header ─────────────────────────────────────────────────── */
    .aa__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-shrink: 0;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--p-surface-200);
    }

    .aa__header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .aa__badge {
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

    .aa__title-block {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .aa__title {
      font-family: 'Syne', sans-serif;
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--p-text-color);
      line-height: 1.2;
    }

    .aa__subtitle {
      font-size: 0.72rem;
      color: var(--p-text-muted-color);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .aa__header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* ─── Buttons ─────────────────────────────────────────────────── */
    .aa__btn {
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

    .aa__btn--ghost {
      background: transparent;
      border-color: var(--p-surface-300);
      color: var(--p-text-secondary-color);

      &:hover:not(:disabled) { background: var(--p-surface-100); }
      &.aa__btn--active {
        background: var(--p-primary-50, #eff6ff);
        border-color: var(--p-primary-200, #bfdbfe);
        color: var(--p-primary-700, #1d4ed8);
      }
    }

    .aa__btn--primary {
      background: var(--p-primary-600, #0284c7);
      color: white;
      border-color: var(--p-primary-600, #0284c7);

      &:hover:not(:disabled) { background: var(--p-primary-700, #0369a1); }
    }

    /* ─── Content ─────────────────────────────────────────────────── */
    .aa__content {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }

    /* ─── Grid ────────────────────────────────────────────────────── */
    .aa__grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      flex: 1;
      min-height: 0;
    }

    /* ─── Panel ───────────────────────────────────────────────────── */
    .aa__panel {
      border-radius: 12px;
      padding: 12px;
      border: 1px solid transparent;
      display: flex;
      flex-direction: column;
      gap: 8px;
      overflow: hidden;
    }

    .aa__panel--analogos {
      background: #f0fdf4;
      border-color: #bbf7d0;
    }

    .aa__panel--antilogos {
      background: #fff7ed;
      border-color: #fed7aa;
    }

    .aa__panel-header {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;

      .pi {
        font-size: 0.85rem;
        flex-shrink: 0;
      }

      span:first-of-type {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
    }

    .aa__panel--analogos .aa__panel-header .pi,
    .aa__panel--analogos .aa__panel-header span:first-of-type {
      color: #15803d;
    }

    .aa__panel--antilogos .aa__panel-header .pi,
    .aa__panel--antilogos .aa__panel-header span:first-of-type {
      color: #c2410c;
    }

    .aa__panel-hint {
      font-size: 0.68rem;
      color: var(--p-text-muted-color);
      margin-left: auto;
      text-align: right;
      line-height: 1.3;
    }

    /* ─── List ────────────────────────────────────────────────────── */
    .aa__list {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .aa__empty {
      font-size: 0.78rem;
      color: var(--p-text-muted-color);
      text-align: center;
      padding: 16px 0;
      margin: 0;
    }

    /* ─── Cards ───────────────────────────────────────────────────── */
    .aa__card {
      border-radius: 8px;
      padding: 8px 10px;
      display: flex;
      gap: 8px;
      align-items: flex-start;
      position: relative;

      &:hover .aa__card-remove { opacity: 1; }
    }

    .aa__card--analogo {
      background: rgba(255, 255, 255, 0.75);
      border: 1px solid #bbf7d0;
    }

    .aa__card--antilogo {
      background: rgba(255, 255, 255, 0.75);
      border: 1px solid #fed7aa;
    }

    .aa__card-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 0;
    }

    .aa__card-row {
      display: flex;
      gap: 6px;
      align-items: baseline;
      min-width: 0;
    }

    .aa__card-label {
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--p-text-muted-color);
      flex-shrink: 0;
      width: 58px;
    }

    .aa__card-value {
      font-size: 0.8rem;
      color: var(--p-text-color);
      line-height: 1.4;
      word-break: break-word;
    }

    .aa__card-value--muted {
      font-size: 0.75rem;
      color: var(--p-text-secondary-color);
      font-style: italic;
    }

    .aa__card-remove {
      opacity: 0;
      background: none;
      border: none;
      cursor: pointer;
      color: #9ca3af;
      padding: 2px;
      font-size: 0.65rem;
      flex-shrink: 0;
      transition: color 0.15s, opacity 0.15s;
      line-height: 1;

      &:hover { color: #ef4444; }
    }

    /* ─── Form ────────────────────────────────────────────────────── */
    .aa__form {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex-shrink: 0;
      padding-top: 6px;
      border-top: 1px solid rgba(0, 0, 0, 0.06);
    }

    .aa__input {
      width: 100%;
      box-sizing: border-box;
      padding: 6px 10px;
      border-radius: 7px;
      border: 1px solid;
      font-size: 0.78rem;
      background: rgba(255, 255, 255, 0.9);
      color: var(--p-text-color);
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
      font-family: inherit;

      &::placeholder { color: #9ca3af; }
    }

    .aa__input--analogo {
      border-color: #bbf7d0;
      &:focus { border-color: #22c55e; box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.15); }
    }

    .aa__input--antilogo {
      border-color: #fed7aa;
      &:focus { border-color: #f97316; box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.15); }
    }

    .aa__add-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      padding: 6px 10px;
      border-radius: 7px;
      border: none;
      font-size: 0.77rem;
      font-weight: 600;
      cursor: pointer;
      transition: filter 0.15s;
      color: white;
      margin-top: 2px;
      font-family: inherit;

      .pi { font-size: 0.7rem; }

      &:disabled { opacity: 0.4; cursor: not-allowed; }
      &:hover:not(:disabled) { filter: brightness(0.9); }
    }

    .aa__add-btn--analogo { background: #22c55e; }
    .aa__add-btn--antilogo { background: #f97316; }
  `],
})
export class AnalogosAntilogosToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly analogosService = inject(AnalogosAntilogosService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  // ─── Estado ───────────────────────────────────────────────────────────────
  items = signal<AnalogosAntilogosItems>({ ...EMPTY_ITEMS });
  reports = signal<AnalogosAntilogosReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  newAnalogo = signal<AnalogoItem>({ industria: '', solucion: '', adaptacion: '' });
  newAntilogo = signal<AntilogoItem>({ industria: '', fracaso: '', errorAEvitar: '' });

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // ─── Computed ─────────────────────────────────────────────────────────────
  canGenerate = computed(
    () => this.items().analogos.length > 0 || this.items().antilogos.length > 0,
  );

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;

    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['items'] as AnalogosAntilogosItems | undefined;
    const storedReports = (raw['reports'] as AnalogosAntilogosReportVersionDto[]) ?? [];

    this.items.set(stored ?? { ...EMPTY_ITEMS });
    this.reports.set(storedReports);
  }

  // ─── Análogos ─────────────────────────────────────────────────────────────
  addAnalogo(): void {
    const item = this.newAnalogo();
    if (!item.industria.trim() || !item.solucion.trim()) return;

    const current = this.items();
    this.items.set({ ...current, analogos: [...current.analogos, { ...item }] });
    this.newAnalogo.set({ industria: '', solucion: '', adaptacion: '' });
    this.scheduleSave();
  }

  removeAnalogo(index: number): void {
    const arr = [...this.items().analogos];
    arr.splice(index, 1);
    this.items.set({ ...this.items(), analogos: arr });
    this.scheduleSave();
  }

  updateNewAnalogo(field: keyof AnalogoItem, value: string): void {
    this.newAnalogo.set({ ...this.newAnalogo(), [field]: value });
  }

  // ─── Antilogos ────────────────────────────────────────────────────────────
  addAntilogo(): void {
    const item = this.newAntilogo();
    if (!item.industria.trim() || !item.fracaso.trim()) return;

    const current = this.items();
    this.items.set({ ...current, antilogos: [...current.antilogos, { ...item }] });
    this.newAntilogo.set({ industria: '', fracaso: '', errorAEvitar: '' });
    this.scheduleSave();
  }

  removeAntilogo(index: number): void {
    const arr = [...this.items().antilogos];
    arr.splice(index, 1);
    this.items.set({ ...this.items(), antilogos: arr });
    this.scheduleSave();
  }

  updateNewAntilogo(field: keyof AntilogoItem, value: string): void {
    this.newAntilogo.set({ ...this.newAntilogo(), [field]: value });
  }

  // ─── Acciones ─────────────────────────────────────────────────────────────
  toggleReport(): void {
    this.showReport.set(!this.showReport());
  }

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;

    this.analyzing.set(true);
    try {
      const result = await this.analogosService.analyze({
        toolApplicationId: app.id,
        items: this.items(),
        currentVersion: this.reports().length,
      });

      const newVersion: AnalogosAntilogosReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };

      const updated = [newVersion, ...this.reports()];
      this.reports.set(updated);
      await this.persistData(updated);
      this.showReport.set(true);
      this.uiDialog.showSuccess('Informe generado', 'El análisis fue generado y guardado correctamente.');
    } catch (error) {
      this.uiDialog.showError('Error', `No se pudo generar el informe: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      this.analyzing.set(false);
    }
  }

  // ─── Privados ─────────────────────────────────────────────────────────────
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
    } catch {
      // silent — datos en memoria
    } finally {
      this.saving.set(false);
    }
  }

  private async persistData(reports: AnalogosAntilogosReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, items: this.items(), reports },
    });
    this.sessionSaved.emit();
  }
}
