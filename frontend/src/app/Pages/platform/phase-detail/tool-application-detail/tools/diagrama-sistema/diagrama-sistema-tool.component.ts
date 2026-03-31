import { Component, OnChanges, ViewChild, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { DiagramaSistemaService } from '@core/services/diagramaSistemaService/diagrama-sistema.service';
import { DiagramaSistemaDiagramComponent, DiagramaEdgeDrawnEvent, DiagramaNodeMovedEvent, DiagramaSelectionRemovedEvent } from './diagrama-sistema-diagram.component';
import { DiagramaSistemaReportComponent } from './diagrama-sistema-report.component';
import { NodeFieldUpdate } from './diagrama-node-edit.service';
import {
  ACTOR_TIPOS,
  CONEXION_TIPOS,
  EMPTY_SISTEMA,
  SistemaActor,
  SistemaConexion,
  SistemaData,
  SistemaReportVersionDto,
} from './diagrama-sistema.types';

type ActiveView = 'diagram' | 'report';

@Component({
  selector: 'app-diagrama-sistema-tool',
  standalone: true,
  imports: [FormsModule, DiagramaSistemaDiagramComponent, DiagramaSistemaReportComponent],
  template: `
    <div class="ds">

      <!-- Header -->
      <div class="ds__header">
        <div class="ds__header-left">
          <div class="ds__badge">
            <i class="pi pi-share-alt"></i>
          </div>
          <div class="ds__title-block">
            <span class="ds__title">Diagrama de Sistema</span>
            <span class="ds__subtitle">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              } @else {
                {{ data().actores.length }} actores · {{ data().conexiones.length }} conexiones
              }
            </span>
          </div>
        </div>
        <div class="ds__header-actions">
          <div class="ds__tab-group">
            <button
              class="ds__tab"
              [class.ds__tab--active]="activeView() === 'diagram'"
              (click)="setView('diagram')"
            >
              <i class="pi pi-share-alt"></i> Diagrama
            </button>
            <button
              class="ds__tab"
              [class.ds__tab--active]="activeView() === 'report'"
              (click)="setView('report')"
            >
              <i class="pi pi-sparkles"></i>
              Informes {{ reports().length ? '(' + reports().length + ')' : '' }}
            </button>
          </div>
          <button
            class="ds__btn ds__btn--primary"
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
      <div class="ds__content">

        <!-- ── Diagrama ──────────────────────────────────────────────────── -->
        @if (activeView() === 'diagram') {
          <!-- Alcance inline -->
          <div class="ds__alcance">
            <i class="pi pi-map"></i>
            <input
              type="text"
              class="ds__alcance-input"
              placeholder="Alcance del sistema: ej. Ecosistema de crédito para freelancers..."
              [ngModel]="data().alcance"
              (ngModelChange)="updateAlcance($event)"
            />
          </div>

          <app-diagrama-sistema-diagram
            #diagram
            [data]="data()"
            (edgeDrawn)="onDiagramEdgeDrawn($event)"
            (nodeMoved)="onDiagramNodeMoved($event)"
            (selectionRemoved)="onDiagramSelectionRemoved($event)"
            (nodeFieldUpdated)="onNodeFieldUpdated($event)"
            (nodeDeleteRequested)="onNodeDeleteRequested($event)"
            (actorAddRequested)="addActor()"
          />
        }

        <!-- ── Informe ───────────────────────────────────────────────────── -->
        @if (activeView() === 'report') {
          <app-diagrama-sistema-report [reports]="reports()" />
        }

      </div>
    </div>
  `,
  styles: [`
    .ds {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 12px;
    }

    /* ─── Header ─────────────────────────────────────────────── */
    .ds__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-shrink: 0;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--p-surface-200);
    }

    .ds__header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .ds__badge {
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

    .ds__title-block {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .ds__title {
      font-family: 'Syne', sans-serif;
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--p-text-color);
      line-height: 1.2;
    }

    .ds__subtitle {
      font-size: 0.72rem;
      color: var(--p-text-muted-color);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .ds__header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* ─── Tab group ──────────────────────────────────────────── */
    .ds__tab-group {
      display: flex;
      align-items: center;
      background: var(--p-surface-100);
      border-radius: 8px;
      padding: 3px;
      gap: 2px;
    }

    .ds__tab {
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

    .ds__tab .pi { font-size: 0.75rem; }

    .ds__tab--active {
      background: white;
      color: var(--p-text-color);
      font-weight: 600;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    /* ─── Buttons ────────────────────────────────────────────── */
    .ds__btn {
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

    .ds__btn .pi { font-size: 0.8rem; }
    .ds__btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .ds__btn--primary {
      background: var(--p-primary-600, #0284c7);
      color: white;
      border-color: var(--p-primary-600, #0284c7);
    }

    .ds__btn--primary:hover:not(:disabled) {
      background: var(--p-primary-700, #0369a1);
    }

    /* ─── Content ────────────────────────────────────────────── */
    .ds__content {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    /* ─── Alcance inline ─────────────────────────────────────── */
    .ds__alcance {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background: #f8fafc;
      border: 1px dashed #e2e8f0;
      border-radius: 8px;
      flex-shrink: 0;
    }

    .ds__alcance .pi {
      font-size: 0.8rem;
      color: #64748b;
      flex-shrink: 0;
    }

    .ds__alcance-input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 0.8rem;
      font-family: inherit;
      color: var(--p-text-color);
      outline: none;
    }

    .ds__alcance-input::placeholder {
      color: var(--p-text-muted-color);
    }
  `],
})
export class DiagramaSistemaToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly diagramaSistemaService = inject(DiagramaSistemaService);
  private readonly uiDialog = inject(UiDialogService);

  @ViewChild('diagram') diagramRef?: DiagramaSistemaDiagramComponent;

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  // ─── State ───────────────────────────────────────────────────────────────
  data = signal<SistemaData>({ ...EMPTY_SISTEMA });
  reports = signal<SistemaReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  activeView = signal<ActiveView>('diagram');

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private initialDataLoaded = false;

  readonly actorTipos = ACTOR_TIPOS;
  readonly conexionTipos = CONEXION_TIPOS;

  // ─── Computed ────────────────────────────────────────────────────────────
  canGenerate = computed(() => this.data().actores.length >= 1);

  // ─── Lifecycle ───────────────────────────────────────────────────────────
  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;

    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const storedData = raw['data'] as SistemaData | undefined;
    const storedReports = (raw['reports'] as SistemaReportVersionDto[]) ?? [];

    // Always load data on first change; skip when diagram is live to avoid
    // rebuilding the ng-diagram model (which breaks port measurements).
    if (!this.initialDataLoaded || this.activeView() !== 'diagram') {
      this.data.set(storedData ? { ...EMPTY_SISTEMA, ...storedData } : { ...EMPTY_SISTEMA });
      this.initialDataLoaded = true;
    }
    this.reports.set(storedReports);
  }

  // ─── View ─────────────────────────────────────────────────────────────────
  setView(view: ActiveView): void {
    this.activeView.set(view);
  }

  // ─── Alcance ──────────────────────────────────────────────────────────────
  updateAlcance(value: string): void {
    this.data.set({ ...this.data(), alcance: value });
    this.scheduleSave();
  }

  // ─── Actores (from diagram) ──────────────────────────────────────────────
  addActor(): void {
    const newActor: SistemaActor = {
      id: crypto.randomUUID(),
      nombre: '',
      tipo: 'organizacion',
      frontera: 'dentro',
      x: 200 + Math.random() * 200,
      y: 150 + Math.random() * 150,
    };
    this.data.set({ ...this.data(), actores: [...this.data().actores, newActor] });
    this.scheduleSave();

    // Add node to the live diagram model
    this.diagramRef?.addNodeToModel({
      id: newActor.id,
      label: newActor.nombre,
      tipo: newActor.tipo,
      frontera: newActor.frontera,
      x: newActor.x!,
      y: newActor.y!,
    });
  }

  // ─── Node inline edit events ─────────────────────────────────────────────
  onNodeFieldUpdated(update: NodeFieldUpdate): void {
    const { id, field, value } = update;
    this.data.set({
      ...this.data(),
      actores: this.data().actores.map(a => {
        if (a.id !== id) return a;
        return { ...a, [field]: value };
      }),
    });
    this.scheduleSave();
  }

  onNodeDeleteRequested(id: string): void {
    this.data.set({
      ...this.data(),
      actores: this.data().actores.filter(a => a.id !== id),
      conexiones: this.data().conexiones.filter(c => c.fromId !== id && c.toId !== id),
    });
    this.scheduleSave();
  }

  // ─── Diagram events (bidirectional sync) ─────────────────────────────────

  onDiagramEdgeDrawn(event: DiagramaEdgeDrawnEvent): void {
    const actores = this.data().actores;
    if (!actores.find(a => a.id === event.fromId) || !actores.find(a => a.id === event.toId)) return;
    const newConexion: SistemaConexion = {
      id: event.edgeId,
      fromId: event.fromId,
      toId: event.toId,
      tipo: 'relacion',
      descripcion: '',
    };
    this.data.set({ ...this.data(), conexiones: [...this.data().conexiones, newConexion] });
    this.scheduleSave();
  }

  onDiagramNodeMoved(events: DiagramaNodeMovedEvent[]): void {
    const actores = this.data().actores.map(a => {
      const moved = events.find(e => e.id === a.id);
      return moved ? { ...a, x: moved.x, y: moved.y } : a;
    });
    this.data.set({ ...this.data(), actores });
    this.scheduleSave();
  }

  onDiagramSelectionRemoved(event: DiagramaSelectionRemovedEvent): void {
    const nodeIdsSet = new Set(event.nodeIds);
    const edgeIdsSet = new Set(event.edgeIds);
    const actores = this.data().actores.filter(a => !nodeIdsSet.has(a.id));
    const conexiones = this.data().conexiones.filter(
      c => !edgeIdsSet.has(c.id) && !nodeIdsSet.has(c.fromId) && !nodeIdsSet.has(c.toId),
    );
    this.data.set({ ...this.data(), actores, conexiones });
    this.scheduleSave();
  }

  // ─── Generate report ──────────────────────────────────────────────────────
  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;

    this.analyzing.set(true);
    try {
      const result = await this.diagramaSistemaService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });

      const newVersion: SistemaReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };

      const updated = [newVersion, ...this.reports()];
      this.reports.set(updated);
      await this.persistData(updated);
      this.setView('report');
      this.uiDialog.showSuccess('Análisis generado', 'El diagrama de sistema fue analizado y guardado correctamente.');
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

  private async persistData(reports: SistemaReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
