import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { DiagramaSistemaService } from '@core/services/diagramaSistemaService/diagrama-sistema.service';
import { DiagramaSistemaDiagramComponent } from './diagrama-sistema-diagram.component';
import { DiagramaSistemaReportComponent } from './diagrama-sistema-report.component';
import {
  ACTOR_TIPOS,
  CONEXION_TIPOS,
  EMPTY_SISTEMA,
  SistemaActor,
  SistemaConexion,
  SistemaData,
  SistemaReportVersionDto,
} from './diagrama-sistema.types';

type ActiveView = 'form' | 'diagram' | 'report';

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
              [class.ds__tab--active]="activeView() === 'form'"
              (click)="setView('form')"
            >
              <i class="pi pi-pencil"></i> Editar
            </button>
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
          <app-diagrama-sistema-diagram [data]="data()" />
        }

        <!-- ── Informe ───────────────────────────────────────────────────── -->
        @if (activeView() === 'report') {
          <app-diagrama-sistema-report [reports]="reports()" />
        }

        <!-- ── Formulario ────────────────────────────────────────────────── -->
        @if (activeView() === 'form') {
          <div class="ds__form">

            <!-- Alcance -->
            <div class="ds__section">
              <div class="ds__section-header">
                <i class="pi pi-map" style="color:#64748b"></i>
                <span class="ds__section-title" style="color:#475569">Alcance del sistema</span>
              </div>
              <p class="ds__section-hint">¿Qué sistema vas a mapear? ¿Dónde están los límites?</p>
              <textarea
                class="ds__textarea"
                placeholder="Ej: Ecosistema de crédito para freelancers en Argentina"
                [ngModel]="data().alcance"
                (ngModelChange)="updateAlcance($event)"
                rows="2"
              ></textarea>
            </div>

            <!-- Actores y Conexiones -->
            <div class="ds__columns">

              <!-- ── Actores ──────────────────────────────────────────── -->
              <div class="ds__panel ds__panel--actores">
                <div class="ds__panel-header">
                  <i class="pi pi-users" style="color:#2563eb"></i>
                  <span class="ds__panel-title" style="color:#1d4ed8">Actores</span>
                  <span class="ds__panel-count">{{ data().actores.length }}</span>
                </div>
                <p class="ds__panel-hint">Personas, organizaciones, sistemas o entidades del ecosistema.</p>

                @for (actor of data().actores; track actor.id) {
                  <div class="ds__item">
                    <div class="ds__item-row">
                      <input
                        type="text"
                        class="ds__input-text"
                        placeholder="Nombre del actor..."
                        [ngModel]="actor.nombre"
                        (ngModelChange)="updateActorNombre(actor.id, $event)"
                      />
                      <button class="ds__remove" (click)="removeActor(actor.id)" title="Eliminar">
                        <i class="pi pi-times"></i>
                      </button>
                    </div>
                    <div class="ds__item-row">
                      <select
                        class="ds__select"
                        [ngModel]="actor.tipo"
                        (ngModelChange)="updateActorTipo(actor.id, $event)"
                      >
                        @for (t of actorTipos; track t.value) {
                          <option [value]="t.value">{{ t.label }}</option>
                        }
                      </select>
                      <select
                        class="ds__select"
                        [ngModel]="actor.frontera"
                        (ngModelChange)="updateActorFrontera(actor.id, $event)"
                      >
                        <option value="dentro">Dentro</option>
                        <option value="fuera">Fuera</option>
                      </select>
                    </div>
                  </div>
                }

                <button class="ds__add" (click)="addActor()">
                  <i class="pi pi-plus"></i> Agregar actor
                </button>
              </div>

              <!-- ── Conexiones ──────────────────────────────────────── -->
              <div class="ds__panel ds__panel--conexiones">
                <div class="ds__panel-header">
                  <i class="pi pi-arrow-right-arrow-left" style="color:#7c3aed"></i>
                  <span class="ds__panel-title" style="color:#6d28d9">Conexiones</span>
                  <span class="ds__panel-count">{{ data().conexiones.length }}</span>
                </div>
                <p class="ds__panel-hint">Relaciones, flujos o vínculos entre los actores.</p>

                @if (data().actores.length < 2) {
                  <p class="ds__empty-hint">Agregá al menos 2 actores para crear conexiones.</p>
                }

                @for (conexion of data().conexiones; track conexion.id) {
                  <div class="ds__item">
                    <div class="ds__item-row">
                      <select
                        class="ds__select"
                        [ngModel]="conexion.fromId"
                        (ngModelChange)="updateConexionFrom(conexion.id, $event)"
                      >
                        @for (a of data().actores; track a.id) {
                          <option [value]="a.id">{{ a.nombre || '(sin nombre)' }}</option>
                        }
                      </select>
                      <i class="pi pi-arrow-right" style="color:#94a3b8;font-size:0.7rem;flex-shrink:0"></i>
                      <select
                        class="ds__select"
                        [ngModel]="conexion.toId"
                        (ngModelChange)="updateConexionTo(conexion.id, $event)"
                      >
                        @for (a of data().actores; track a.id) {
                          <option [value]="a.id">{{ a.nombre || '(sin nombre)' }}</option>
                        }
                      </select>
                      <button class="ds__remove" (click)="removeConexion(conexion.id)" title="Eliminar">
                        <i class="pi pi-times"></i>
                      </button>
                    </div>
                    <div class="ds__item-row">
                      <select
                        class="ds__select"
                        [ngModel]="conexion.tipo"
                        (ngModelChange)="updateConexionTipo(conexion.id, $event)"
                      >
                        @for (t of conexionTipos; track t.value) {
                          <option [value]="t.value">{{ t.label }}</option>
                        }
                      </select>
                    </div>
                    <input
                      type="text"
                      class="ds__input-text"
                      placeholder="Describí esta conexión..."
                      [ngModel]="conexion.descripcion"
                      (ngModelChange)="updateConexionDesc(conexion.id, $event)"
                    />
                  </div>
                }

                @if (data().actores.length >= 2) {
                  <button class="ds__add" (click)="addConexion()">
                    <i class="pi pi-plus"></i> Agregar conexión
                  </button>
                }
              </div>

            </div>
          </div>
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
    }

    /* ─── Form ───────────────────────────────────────────────── */
    .ds__form {
      display: flex;
      flex-direction: column;
      gap: 10px;
      overflow-y: auto;
      flex: 1;
      padding-right: 2px;
    }

    .ds__section {
      background: #f8fafc;
      border: 1px dashed #e2e8f0;
      border-radius: 10px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .ds__section-header {
      display: flex;
      align-items: center;
      gap: 7px;
    }

    .ds__section-header .pi { font-size: 0.8rem; flex-shrink: 0; }

    .ds__section-title {
      font-size: 0.75rem;
      font-weight: 700;
      font-family: 'Syne', sans-serif;
    }

    .ds__section-hint {
      font-size: 0.72rem;
      color: var(--p-text-muted-color);
      margin: 0;
      line-height: 1.5;
    }

    /* ─── Columns ────────────────────────────────────────────── */
    .ds__columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .ds__panel {
      border-radius: 10px;
      padding: 12px 14px;
      border: 1px solid;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .ds__panel--actores {
      background: #eff6ff;
      border-color: #bfdbfe;
    }

    .ds__panel--conexiones {
      background: #f5f3ff;
      border-color: #ddd6fe;
    }

    .ds__panel-header {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .ds__panel-header .pi { font-size: 0.8rem; }

    .ds__panel-title {
      font-size: 0.75rem;
      font-weight: 700;
      font-family: 'Syne', sans-serif;
      flex: 1;
    }

    .ds__panel-count {
      font-size: 0.7rem;
      font-weight: 600;
      background: rgba(0,0,0,0.06);
      border-radius: 20px;
      padding: 1px 7px;
      color: var(--p-text-muted-color);
    }

    .ds__panel-hint {
      font-size: 0.72rem;
      color: var(--p-text-muted-color);
      margin: 0;
      line-height: 1.4;
    }

    .ds__empty-hint {
      font-size: 0.72rem;
      color: var(--p-text-muted-color);
      font-style: italic;
      margin: 0;
      text-align: center;
      padding: 8px 0;
    }

    /* ─── Item ───────────────────────────────────────────────── */
    .ds__item {
      background: rgba(255,255,255,0.8);
      border-radius: 8px;
      padding: 8px 10px;
      border: 1px solid rgba(0,0,0,0.08);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .ds__item-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .ds__select {
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

    .ds__remove {
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
    }

    .ds__remove .pi { font-size: 0.65rem; }

    .ds__remove:hover {
      background: #fef2f2;
      border-color: #fecaca;
      color: #dc2626;
    }

    .ds__input-text {
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

    .ds__input-text:focus { border-color: var(--p-primary-400); }

    .ds__textarea {
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

    .ds__textarea:focus { border-color: var(--p-primary-400); }

    .ds__add {
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
    }

    .ds__add .pi { font-size: 0.7rem; }

    .ds__add:hover {
      background: rgba(0,0,0,0.04);
      color: var(--p-text-color);
    }
  `],
})
export class DiagramaSistemaToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly diagramaSistemaService = inject(DiagramaSistemaService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  // ─── State ───────────────────────────────────────────────────────────────
  data = signal<SistemaData>({ ...EMPTY_SISTEMA });
  reports = signal<SistemaReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  activeView = signal<ActiveView>('form');

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

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

    this.data.set(storedData ? { ...EMPTY_SISTEMA, ...storedData } : { ...EMPTY_SISTEMA });
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

  // ─── Actores ──────────────────────────────────────────────────────────────
  addActor(): void {
    const newActor: SistemaActor = {
      id: crypto.randomUUID(),
      nombre: '',
      tipo: 'organizacion',
      frontera: 'dentro',
    };
    this.data.set({ ...this.data(), actores: [...this.data().actores, newActor] });
    this.scheduleSave();
  }

  removeActor(id: string): void {
    this.data.set({
      ...this.data(),
      actores: this.data().actores.filter(a => a.id !== id),
      conexiones: this.data().conexiones.filter(c => c.fromId !== id && c.toId !== id),
    });
    this.scheduleSave();
  }

  updateActorNombre(id: string, nombre: string): void {
    this.data.set({
      ...this.data(),
      actores: this.data().actores.map(a => a.id === id ? { ...a, nombre } : a),
    });
    this.scheduleSave();
  }

  updateActorTipo(id: string, tipo: string): void {
    this.data.set({
      ...this.data(),
      actores: this.data().actores.map(a => a.id === id ? { ...a, tipo: tipo as SistemaActor['tipo'] } : a),
    });
    this.scheduleSave();
  }

  updateActorFrontera(id: string, frontera: string): void {
    this.data.set({
      ...this.data(),
      actores: this.data().actores.map(a => a.id === id ? { ...a, frontera: frontera as SistemaActor['frontera'] } : a),
    });
    this.scheduleSave();
  }

  // ─── Conexiones ───────────────────────────────────────────────────────────
  addConexion(): void {
    const actores = this.data().actores;
    if (actores.length < 2) return;
    const newConexion: SistemaConexion = {
      id: crypto.randomUUID(),
      fromId: actores[0].id,
      toId: actores[1].id,
      tipo: 'relacion',
      descripcion: '',
    };
    this.data.set({ ...this.data(), conexiones: [...this.data().conexiones, newConexion] });
    this.scheduleSave();
  }

  removeConexion(id: string): void {
    this.data.set({
      ...this.data(),
      conexiones: this.data().conexiones.filter(c => c.id !== id),
    });
    this.scheduleSave();
  }

  updateConexionFrom(id: string, fromId: string): void {
    this.data.set({
      ...this.data(),
      conexiones: this.data().conexiones.map(c => c.id === id ? { ...c, fromId } : c),
    });
    this.scheduleSave();
  }

  updateConexionTo(id: string, toId: string): void {
    this.data.set({
      ...this.data(),
      conexiones: this.data().conexiones.map(c => c.id === id ? { ...c, toId } : c),
    });
    this.scheduleSave();
  }

  updateConexionTipo(id: string, tipo: string): void {
    this.data.set({
      ...this.data(),
      conexiones: this.data().conexiones.map(c => c.id === id ? { ...c, tipo: tipo as SistemaConexion['tipo'] } : c),
    });
    this.scheduleSave();
  }

  updateConexionDesc(id: string, descripcion: string): void {
    this.data.set({
      ...this.data(),
      conexiones: this.data().conexiones.map(c => c.id === id ? { ...c, descripcion } : c),
    });
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
