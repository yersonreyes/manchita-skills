import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { InOutService } from '@core/services/inOutService/in-out.service';
import { InOutDiagramComponent } from './in-out-diagram.component';
import { InOutReportComponent } from './in-out-report.component';
import {
  EMPTY_IN_OUT,
  INPUT_TIPOS,
  OUTPUT_TIPOS,
  InOutData,
  InOutInputItem,
  InOutOutputItem,
  InOutReportVersionDto,
} from './in-out.types';

type ActiveView = 'form' | 'diagram' | 'report';

@Component({
  selector: 'app-in-out-tool',
  standalone: true,
  imports: [FormsModule, InOutDiagramComponent, InOutReportComponent],
  template: `
    <div class="inout">

      <!-- Header -->
      <div class="inout__header">
        <div class="inout__header-left">
          <div class="inout__badge">
            <i class="pi pi-sitemap"></i>
          </div>
          <div class="inout__title-block">
            <span class="inout__title">Diagrama de In/Out</span>
            <span class="inout__subtitle">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              } @else {
                {{ data().inputs.length }} inputs · {{ data().outputs.length }} outputs
              }
            </span>
          </div>
        </div>
        <div class="inout__header-actions">
          <div class="inout__tab-group">
            <button
              class="inout__tab"
              [class.inout__tab--active]="activeView() === 'form'"
              (click)="setView('form')"
            >
              <i class="pi pi-pencil"></i> Editar
            </button>
            <button
              class="inout__tab"
              [class.inout__tab--active]="activeView() === 'diagram'"
              (click)="setView('diagram')"
            >
              <i class="pi pi-sitemap"></i> Diagrama
            </button>
            <button
              class="inout__tab"
              [class.inout__tab--active]="activeView() === 'report'"
              (click)="setView('report')"
            >
              <i class="pi pi-sparkles"></i>
              Informes {{ reports().length ? '(' + reports().length + ')' : '' }}
            </button>
          </div>
          <button
            class="inout__btn inout__btn--primary"
            (click)="generateReport()"
            [disabled]="!canGenerate() || analyzing()"
            [title]="!canGenerate() ? 'Agregá al menos 1 input y 1 output para analizar' : 'Generar informe con IA'"
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
      <div class="inout__content">

        <!-- ── Diagrama ─────────────────────────────────────────────────────── -->
        @if (activeView() === 'diagram') {
          <app-in-out-diagram [data]="data()" />
        }

        <!-- ── Informe ──────────────────────────────────────────────────────── -->
        @if (activeView() === 'report') {
          <app-in-out-report [reports]="reports()" />
        }

        <!-- ── Formulario ───────────────────────────────────────────────────── -->
        @if (activeView() === 'form') {
          <div class="inout__form">

            <!-- Proceso -->
            <div class="inout__section inout__section--process">
              <div class="inout__section-header">
                <i class="pi pi-cog" style="color:#64748b"></i>
                <span class="inout__section-title" style="color:#475569">El Proceso / Sistema</span>
              </div>
              <p class="inout__section-hint">¿Qué hace este proceso? ¿Cuál es la transformación central?</p>
              <textarea
                class="inout__textarea"
                placeholder="Ej: Plataforma de onboarding que convierte usuarios registrados en usuarios activos y comprometidos"
                [ngModel]="data().proceso"
                (ngModelChange)="updateProceso($event)"
                rows="2"
              ></textarea>
            </div>

            <!-- Inputs y Outputs en columnas -->
            <div class="inout__columns">

              <!-- ── Inputs ──────────────────────────────────────────────────── -->
              <div class="inout__panel inout__panel--inputs">
                <div class="inout__panel-header">
                  <i class="pi pi-arrow-right" style="color:#2563eb"></i>
                  <span class="inout__panel-title" style="color:#1d4ed8">Inputs</span>
                  <span class="inout__panel-count">{{ data().inputs.length }}</span>
                </div>
                <p class="inout__panel-hint">¿Qué entra al sistema? Información, recursos, materiales, factores externos.</p>

                @for (item of data().inputs; track item.id) {
                  <div class="inout__item">
                    <div class="inout__item-row">
                      <select
                        class="inout__select"
                        [ngModel]="item.tipo"
                        (ngModelChange)="updateInputTipo(item.id, $event)"
                      >
                        @for (t of inputTipos; track t.value) {
                          <option [value]="t.value">{{ t.label }}</option>
                        }
                      </select>
                      <button class="inout__remove" (click)="removeInput(item.id)" title="Eliminar">
                        <i class="pi pi-times"></i>
                      </button>
                    </div>
                    <input
                      type="text"
                      class="inout__input-text"
                      placeholder="Describí este input..."
                      [ngModel]="item.descripcion"
                      (ngModelChange)="updateInputDesc(item.id, $event)"
                    />
                  </div>
                }

                <button class="inout__add" (click)="addInput()">
                  <i class="pi pi-plus"></i> Agregar input
                </button>
              </div>

              <!-- ── Outputs ─────────────────────────────────────────────────── -->
              <div class="inout__panel inout__panel--outputs">
                <div class="inout__panel-header">
                  <i class="pi pi-arrow-right" style="color:#059669"></i>
                  <span class="inout__panel-title" style="color:#047857">Outputs</span>
                  <span class="inout__panel-count">{{ data().outputs.length }}</span>
                </div>
                <p class="inout__panel-hint">¿Qué sale del sistema? Productos, datos, feedback, desperdicios.</p>

                @for (item of data().outputs; track item.id) {
                  <div class="inout__item">
                    <div class="inout__item-row">
                      <select
                        class="inout__select"
                        [ngModel]="item.tipo"
                        (ngModelChange)="updateOutputTipo(item.id, $event)"
                      >
                        @for (t of outputTipos; track t.value) {
                          <option [value]="t.value">{{ t.label }}</option>
                        }
                      </select>
                      <button class="inout__remove" (click)="removeOutput(item.id)" title="Eliminar">
                        <i class="pi pi-times"></i>
                      </button>
                    </div>
                    <input
                      type="text"
                      class="inout__input-text"
                      placeholder="Describí este output..."
                      [ngModel]="item.descripcion"
                      (ngModelChange)="updateOutputDesc(item.id, $event)"
                    />
                  </div>
                }

                <button class="inout__add" (click)="addOutput()">
                  <i class="pi pi-plus"></i> Agregar output
                </button>
              </div>

            </div>
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .inout {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 12px;
    }

    /* ─── Header ─────────────────────────────────────────────────── */
    .inout__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-shrink: 0;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--p-surface-200);
    }

    .inout__header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .inout__badge {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #eff6ff;
      color: #2563eb;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      flex-shrink: 0;
    }

    .inout__title-block {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .inout__title {
      font-family: 'Syne', sans-serif;
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--p-text-color);
      line-height: 1.2;
    }

    .inout__subtitle {
      font-size: 0.72rem;
      color: var(--p-text-muted-color);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .inout__header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* ─── Tab group ───────────────────────────────────────────────── */
    .inout__tab-group {
      display: flex;
      align-items: center;
      background: var(--p-surface-100);
      border-radius: 8px;
      padding: 3px;
      gap: 2px;
    }

    .inout__tab {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 10px;
      border-radius: 6px;
      border: none;
      background: transparent;
      font-size: 0.78rem;
      font-weight: 500;
      color: var(--p-text-secondary-color);
      cursor: pointer;
      transition: all 0.15s;
      white-space: nowrap;

      .pi { font-size: 0.75rem; }
    }

    .inout__tab--active {
      background: white;
      color: var(--p-text-color);
      font-weight: 600;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    /* ─── Buttons ─────────────────────────────────────────────────── */
    .inout__btn {
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
    }

    .inout__btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .inout__btn--primary {
      background: var(--p-primary-600, #0284c7);
      color: white;
      border-color: var(--p-primary-600, #0284c7);
    }

    .inout__btn--primary:hover:not(:disabled) {
      background: var(--p-primary-700, #0369a1);
    }

    /* ─── Content ─────────────────────────────────────────────────── */
    .inout__content {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }

    /* ─── Form ────────────────────────────────────────────────────── */
    .inout__form {
      display: flex;
      flex-direction: column;
      gap: 10px;
      overflow-y: auto;
      flex: 1;
      padding-right: 2px;
    }

    .inout__section {
      border-radius: 10px;
      padding: 12px 14px;
      border: 1px solid;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .inout__section--process {
      background: #f8fafc;
      border-color: #e2e8f0;
      border-style: dashed;
    }

    .inout__section-header {
      display: flex;
      align-items: center;
      gap: 7px;

      .pi { font-size: 0.8rem; flex-shrink: 0; }
    }

    .inout__section-title {
      font-size: 0.75rem;
      font-weight: 700;
      font-family: 'Syne', sans-serif;
    }

    .inout__section-hint {
      font-size: 0.72rem;
      color: var(--p-text-muted-color);
      margin: 0;
      line-height: 1.5;
    }

    /* ─── Columns ─────────────────────────────────────────────────── */
    .inout__columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .inout__panel {
      border-radius: 10px;
      padding: 12px 14px;
      border: 1px solid;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .inout__panel--inputs {
      background: #eff6ff;
      border-color: #bfdbfe;
    }

    .inout__panel--outputs {
      background: #f0fdf4;
      border-color: #bbf7d0;
    }

    .inout__panel-header {
      display: flex;
      align-items: center;
      gap: 6px;

      .pi { font-size: 0.8rem; }
    }

    .inout__panel-title {
      font-size: 0.75rem;
      font-weight: 700;
      font-family: 'Syne', sans-serif;
      flex: 1;
    }

    .inout__panel-count {
      font-size: 0.7rem;
      font-weight: 600;
      background: rgba(0,0,0,0.06);
      border-radius: 20px;
      padding: 1px 7px;
      color: var(--p-text-muted-color);
    }

    .inout__panel-hint {
      font-size: 0.72rem;
      color: var(--p-text-muted-color);
      margin: 0;
      line-height: 1.4;
    }

    /* ─── Item ────────────────────────────────────────────────────── */
    .inout__item {
      background: rgba(255,255,255,0.8);
      border-radius: 8px;
      padding: 8px 10px;
      border: 1px solid rgba(0,0,0,0.08);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .inout__item-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .inout__select {
      flex: 1;
      border: 1px solid rgba(0,0,0,0.12);
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 0.75rem;
      font-family: inherit;
      background: white;
      color: var(--p-text-color);
      cursor: pointer;
    }

    .inout__remove {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      border: 1px solid rgba(0,0,0,0.1);
      background: white;
      color: var(--p-text-muted-color);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.15s;

      .pi { font-size: 0.65rem; }
    }

    .inout__remove:hover {
      background: #fef2f2;
      border-color: #fecaca;
      color: #dc2626;
    }

    .inout__input-text {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid rgba(0,0,0,0.12);
      border-radius: 6px;
      padding: 5px 8px;
      font-size: 0.78rem;
      font-family: inherit;
      background: white;
      color: var(--p-text-color);
      outline: none;
    }

    .inout__input-text:focus {
      border-color: var(--p-primary-400);
    }

    .inout__textarea {
      width: 100%;
      box-sizing: border-box;
      resize: vertical;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      padding: 8px 10px;
      font-size: 0.82rem;
      line-height: 1.6;
      background: white;
      color: var(--p-text-color);
      outline: none;
      font-family: inherit;
    }

    .inout__textarea:focus {
      border-color: var(--p-primary-400);
    }

    .inout__add {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 6px 10px;
      border-radius: 7px;
      border: 1px dashed rgba(0,0,0,0.2);
      background: transparent;
      font-size: 0.75rem;
      color: var(--p-text-muted-color);
      cursor: pointer;
      transition: all 0.15s;
      font-family: inherit;
      align-self: flex-start;

      .pi { font-size: 0.7rem; }
    }

    .inout__add:hover {
      background: rgba(0,0,0,0.04);
      color: var(--p-text-color);
    }
  `],
})
export class InOutToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly inOutService = inject(InOutService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  // ─── State ────────────────────────────────────────────────────────────────
  data = signal<InOutData>({ ...EMPTY_IN_OUT });
  reports = signal<InOutReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  activeView = signal<ActiveView>('form');

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly inputTipos = INPUT_TIPOS;
  readonly outputTipos = OUTPUT_TIPOS;

  // ─── Computed ─────────────────────────────────────────────────────────────
  canGenerate = computed(() => {
    const d = this.data();
    return d.inputs.length > 0 && d.outputs.length > 0;
  });

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;

    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const storedData = raw['data'] as InOutData | undefined;
    const storedReports = (raw['reports'] as InOutReportVersionDto[]) ?? [];

    this.data.set(storedData ? { ...EMPTY_IN_OUT, ...storedData } : { ...EMPTY_IN_OUT });
    this.reports.set(storedReports);
  }

  // ─── View ─────────────────────────────────────────────────────────────────
  setView(view: ActiveView): void {
    this.activeView.set(view);
  }

  // ─── Proceso ──────────────────────────────────────────────────────────────
  updateProceso(value: string): void {
    this.data.set({ ...this.data(), proceso: value });
    this.scheduleSave();
  }

  // ─── Inputs ───────────────────────────────────────────────────────────────
  addInput(): void {
    const newItem: InOutInputItem = { id: crypto.randomUUID(), tipo: 'informacion', descripcion: '' };
    this.data.set({ ...this.data(), inputs: [...this.data().inputs, newItem] });
    this.scheduleSave();
  }

  removeInput(id: string): void {
    this.data.set({ ...this.data(), inputs: this.data().inputs.filter(i => i.id !== id) });
    this.scheduleSave();
  }

  updateInputTipo(id: string, tipo: string): void {
    this.data.set({
      ...this.data(),
      inputs: this.data().inputs.map(i => i.id === id ? { ...i, tipo: tipo as InOutInputItem['tipo'] } : i),
    });
    this.scheduleSave();
  }

  updateInputDesc(id: string, descripcion: string): void {
    this.data.set({
      ...this.data(),
      inputs: this.data().inputs.map(i => i.id === id ? { ...i, descripcion } : i),
    });
    this.scheduleSave();
  }

  // ─── Outputs ──────────────────────────────────────────────────────────────
  addOutput(): void {
    const newItem: InOutOutputItem = { id: crypto.randomUUID(), tipo: 'producto', descripcion: '' };
    this.data.set({ ...this.data(), outputs: [...this.data().outputs, newItem] });
    this.scheduleSave();
  }

  removeOutput(id: string): void {
    this.data.set({ ...this.data(), outputs: this.data().outputs.filter(o => o.id !== id) });
    this.scheduleSave();
  }

  updateOutputTipo(id: string, tipo: string): void {
    this.data.set({
      ...this.data(),
      outputs: this.data().outputs.map(o => o.id === id ? { ...o, tipo: tipo as InOutOutputItem['tipo'] } : o),
    });
    this.scheduleSave();
  }

  updateOutputDesc(id: string, descripcion: string): void {
    this.data.set({
      ...this.data(),
      outputs: this.data().outputs.map(o => o.id === id ? { ...o, descripcion } : o),
    });
    this.scheduleSave();
  }

  // ─── Generate report ──────────────────────────────────────────────────────
  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;

    this.analyzing.set(true);
    try {
      const result = await this.inOutService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });

      const newVersion: InOutReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };

      const updated = [newVersion, ...this.reports()];
      this.reports.set(updated);
      await this.persistData(updated);
      this.setView('report');
      this.uiDialog.showSuccess('Análisis generado', 'El diagrama de In/Out fue analizado y guardado correctamente.');
    } catch (error) {
      this.uiDialog.showError('Error', `No se pudo generar el análisis: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      this.analyzing.set(false);
    }
  }

  // ─── Privados ─────────────────────────────────────────────────────────────
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

  private async persistData(reports: InOutReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
