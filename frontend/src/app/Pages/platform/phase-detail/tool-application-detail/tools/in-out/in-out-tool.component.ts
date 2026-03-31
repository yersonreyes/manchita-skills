import { Component, OnChanges, ViewChild, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { InOutService } from '@core/services/inOutService/in-out.service';
import { InOutDiagramComponent } from './in-out-diagram.component';
import { InOutReportComponent } from './in-out-report.component';
import { InOutNodeFieldUpdate } from './in-out-node-edit.service';
import {
  EMPTY_IN_OUT,
  INPUT_TIPOS,
  OUTPUT_TIPOS,
  InOutData,
  InOutInputItem,
  InOutOutputItem,
  InOutReportVersionDto,
} from './in-out.types';

type ActiveView = 'diagram' | 'report';

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
          <app-in-out-diagram
            #diagram
            [data]="data()"
            (nodeFieldUpdated)="onNodeFieldUpdated($event)"
            (nodeDeleteRequested)="onNodeDeleteRequested($event)"
            (inputAddRequested)="addInput()"
            (outputAddRequested)="addOutput()"
          />
        }

        <!-- ── Informe ──────────────────────────────────────────────────────── -->
        @if (activeView() === 'report') {
          <app-in-out-report [reports]="reports()" />
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
    }

    .inout__tab .pi { font-size: 0.75rem; }

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
    }

    .inout__btn .pi { font-size: 0.8rem; }
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
      gap: 8px;
    }
  `],
})
export class InOutToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly inOutService = inject(InOutService);
  private readonly uiDialog = inject(UiDialogService);

  @ViewChild('diagram') diagramRef?: InOutDiagramComponent;

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  // ─── State ────────────────────────────────────────────────────────────────
  data = signal<InOutData>({ ...EMPTY_IN_OUT });
  reports = signal<InOutReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  activeView = signal<ActiveView>('diagram');

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private initialDataLoaded = false;

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

    if (!this.initialDataLoaded || this.activeView() !== 'diagram') {
      this.data.set(storedData ? { ...EMPTY_IN_OUT, ...storedData } : { ...EMPTY_IN_OUT });
      this.initialDataLoaded = true;
    }
    this.reports.set(storedReports);
  }

  // ─── View ─────────────────────────────────────────────────────────────────
  setView(view: ActiveView): void {
    this.activeView.set(view);
  }

  // ─── Add items (from diagram buttons) ─────────────────────────────────────
  addInput(): void {
    const newItem: InOutInputItem = { id: crypto.randomUUID(), tipo: 'informacion', descripcion: '' };
    const inputs = [...this.data().inputs, newItem];
    this.data.set({ ...this.data(), inputs });
    this.scheduleSave();

    const spacing = 110;
    const y = (inputs.length - 1) * spacing;
    this.diagramRef?.addInputNode(newItem.id, y);
  }

  addOutput(): void {
    const newItem: InOutOutputItem = { id: crypto.randomUUID(), tipo: 'producto', descripcion: '' };
    const outputs = [...this.data().outputs, newItem];
    this.data.set({ ...this.data(), outputs });
    this.scheduleSave();

    const spacing = 110;
    const y = (outputs.length - 1) * spacing;
    this.diagramRef?.addOutputNode(newItem.id, y);
  }

  // ─── Node inline edit events ──────────────────────────────────────────────
  onNodeFieldUpdated(update: InOutNodeFieldUpdate): void {
    const { id, field, value } = update;

    if (id === 'process' && field === 'proceso') {
      this.data.set({ ...this.data(), proceso: value });
    } else if (id.startsWith('input-')) {
      const itemId = id.replace('input-', '');
      this.data.set({
        ...this.data(),
        inputs: this.data().inputs.map(i =>
          i.id === itemId ? { ...i, [field]: value } : i,
        ),
      });
    } else if (id.startsWith('output-')) {
      const itemId = id.replace('output-', '');
      this.data.set({
        ...this.data(),
        outputs: this.data().outputs.map(o =>
          o.id === itemId ? { ...o, [field]: value } : o,
        ),
      });
    }
    this.scheduleSave();
  }

  onNodeDeleteRequested(modelId: string): void {
    if (modelId.startsWith('input-')) {
      const itemId = modelId.replace('input-', '');
      this.data.set({ ...this.data(), inputs: this.data().inputs.filter(i => i.id !== itemId) });
    } else if (modelId.startsWith('output-')) {
      const itemId = modelId.replace('output-', '');
      this.data.set({ ...this.data(), outputs: this.data().outputs.filter(o => o.id !== itemId) });
    }
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
