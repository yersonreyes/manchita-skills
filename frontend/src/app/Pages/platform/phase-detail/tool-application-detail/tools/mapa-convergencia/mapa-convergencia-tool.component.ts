import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { MapaConvergenciaService } from '@core/services/mapaConvergenciaService/mapa-convergencia.service';
import { MapaConvergenciaReportComponent } from './mapa-convergencia-report.component';
import { EMPTY_MAPA_CONVERGENCIA, IdeaConvergenciaDto, IdeaEstado, MapaConvergenciaData, MapaConvergenciaReportVersionDto } from './mapa-convergencia.types';

@Component({
  selector: 'app-mapa-convergencia-tool',
  standalone: true,
  imports: [FormsModule, MapaConvergenciaReportComponent],
  template: `
    <div class="mc">

      <!-- Header -->
      <div class="mc__header">
        <div class="mc__header-left">
          <span class="mc__badge">MC</span>
          <div>
            <p class="mc__title">Mapa de Convergencia</p>
            <p class="mc__subtitle">
              {{ data().ideas.length }} idea{{ data().ideas.length === 1 ? '' : 's' }} ·
              <span class="mc__stat mc__stat--sel">{{ ideasSeleccionadas() }} seleccionada{{ ideasSeleccionadas() === 1 ? '' : 's' }}</span> ·
              <span class="mc__stat mc__stat--desc">{{ ideasDescartadas() }} descartada{{ ideasDescartadas() === 1 ? '' : 's' }}</span>
              @if (saving()) { <span class="mc__saving"> · guardando…</span> }
            </p>
          </div>
        </div>
        <div class="mc__header-actions">
          @if (reports().length > 0) {
            <button class="mc__btn-ghost" (click)="showReport.set(!showReport())">
              <i class="pi pi-file-check"></i>
              Informes ({{ reports().length }})
            </button>
          }
          <button
            class="mc__btn-primary"
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

      <!-- Contexto -->
      <div class="mc__section">
        <label class="mc__label">Contexto de la sesión</label>
        <textarea
          class="mc__textarea"
          rows="2"
          placeholder="Ej: Sesión de brainstorming con el equipo de producto — 47 ideas generadas para la feature de notas inteligentes."
          [ngModel]="data().contexto"
          (ngModelChange)="updateField('contexto', $event)"
        ></textarea>
      </div>

      <!-- Criterios de convergencia -->
      <div class="mc__section">
        <label class="mc__label">Criterios de convergencia</label>
        <p class="mc__hint">¿Con qué criterios filtraron las ideas? (Enter para agregar)</p>
        <div class="mc__chips">
          @for (c of data().criterios; track $index; let i = $index) {
            <span class="mc__chip">
              {{ c }}
              <button class="mc__chip-remove" (click)="removeCriterio(i)">
                <i class="pi pi-times"></i>
              </button>
            </span>
          }
          <input
            class="mc__chip-input"
            type="text"
            placeholder="Ej: Viabilidad técnica…"
            [ngModel]="criterioBuffer()"
            (ngModelChange)="criterioBuffer.set($event)"
            (keydown.enter)="addCriterio()"
          />
        </div>
      </div>

      <!-- Reporte -->
      @if (showReport()) {
        <div class="mc__report-wrap">
          <app-mapa-convergencia-report [reports]="reports()" />
        </div>
      }

      <!-- Ideas -->
      <div class="mc__ideas-header">
        <span class="mc__ideas-title">Ideas</span>
        <button class="mc__btn-add-idea" (click)="addIdea()">
          <i class="pi pi-plus"></i> Agregar idea
        </button>
      </div>

      <div class="mc__legend">
        <span class="mc__legend-item mc__legend-item--activa">
          <i class="pi pi-circle"></i> Activa
        </span>
        <span class="mc__legend-item mc__legend-item--sel">
          <i class="pi pi-check-circle"></i> Seleccionada
        </span>
        <span class="mc__legend-item mc__legend-item--desc">
          <i class="pi pi-times-circle"></i> Descartada
        </span>
      </div>

      <div class="mc__list">
        @for (idea of data().ideas; track idea.id; let i = $index) {
          <div class="mc__card" [class.mc__card--seleccionada]="idea.estado === 'seleccionada'" [class.mc__card--descartada]="idea.estado === 'descartada'">
            <div class="mc__card-left">
              <!-- Status toggle -->
              <div class="mc__status-btns">
                <button
                  class="mc__status-btn"
                  [class.mc__status-btn--activa]="idea.estado === 'activa'"
                  title="Activa"
                  (click)="setEstado(i, 'activa')"
                >
                  <i class="pi pi-circle"></i>
                </button>
                <button
                  class="mc__status-btn"
                  [class.mc__status-btn--sel]="idea.estado === 'seleccionada'"
                  title="Seleccionada"
                  (click)="setEstado(i, 'seleccionada')"
                >
                  <i class="pi pi-check-circle"></i>
                </button>
                <button
                  class="mc__status-btn"
                  [class.mc__status-btn--desc]="idea.estado === 'descartada'"
                  title="Descartada"
                  (click)="setEstado(i, 'descartada')"
                >
                  <i class="pi pi-times-circle"></i>
                </button>
              </div>
            </div>

            <div class="mc__card-body">
              <input
                class="mc__idea-input"
                type="text"
                placeholder="Describí la idea…"
                [ngModel]="idea.texto"
                (ngModelChange)="updateIdea(i, 'texto', $event)"
              />
              <input
                class="mc__cluster-input"
                type="text"
                placeholder="Cluster / Tema (opcional)"
                [ngModel]="idea.cluster"
                (ngModelChange)="updateIdea(i, 'cluster', $event)"
              />
              @if (idea.estado === 'descartada') {
                <input
                  class="mc__razon-input"
                  type="text"
                  placeholder="¿Por qué se descartó? (opcional)"
                  [ngModel]="idea.razonDescarte"
                  (ngModelChange)="updateIdea(i, 'razonDescarte', $event)"
                />
              }
            </div>

            <button class="mc__card-delete" (click)="removeIdea(i)" title="Eliminar">
              <i class="pi pi-times"></i>
            </button>
          </div>
        }

        @if (data().ideas.length === 0) {
          <div class="mc__empty">
            <i class="pi pi-filter"></i>
            <p>Agregá las ideas de tu sesión de brainstorming y marcalas como activas, seleccionadas o descartadas.</p>
          </div>
        }
      </div>

      <!-- Notas -->
      <div class="mc__section">
        <label class="mc__label">Notas del equipo (opcional)</label>
        <textarea
          class="mc__textarea"
          rows="2"
          placeholder="Contexto adicional sobre las decisiones tomadas, próximos pasos, etc."
          [ngModel]="data().notas"
          (ngModelChange)="updateField('notas', $event)"
        ></textarea>
      </div>

    </div>
  `,
  styles: [`
    .mc { display: flex; flex-direction: column; gap: 16px; }

    .mc__header {
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px; flex-wrap: wrap;
    }
    .mc__header-left { display: flex; align-items: center; gap: 10px; }
    .mc__badge {
      width: 36px; height: 36px; border-radius: 10px;
      background: linear-gradient(135deg, #0284c7, #0369a1);
      color: #fff; font-size: 0.6rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      letter-spacing: 0.02em; flex-shrink: 0;
    }
    .mc__title { margin: 0; font-size: 0.9375rem; font-weight: 700; color: #111827; }
    .mc__subtitle { margin: 0; font-size: 0.78rem; color: #6b7280; }
    .mc__stat { font-weight: 600; }
    .mc__stat--sel { color: #0284c7; }
    .mc__stat--desc { color: #9ca3af; }
    .mc__saving { color: #0284c7; }

    .mc__header-actions { display: flex; gap: 8px; align-items: center; }

    .mc__btn-ghost {
      display: flex; align-items: center; gap: 5px;
      padding: 6px 12px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: transparent;
      font-size: 0.8125rem; color: var(--p-text-color); cursor: pointer;
      transition: background 0.15s;
    }
    .mc__btn-ghost:hover { background: var(--p-surface-100); }

    .mc__btn-primary {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 8px; border: none;
      background: linear-gradient(135deg, #0284c7, #0369a1);
      color: #fff; font-size: 0.8125rem; font-weight: 600; cursor: pointer;
      transition: opacity 0.15s;
    }
    .mc__btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
    .mc__btn-primary:not(:disabled):hover { opacity: 0.9; }

    .mc__section { display: flex; flex-direction: column; gap: 4px; }
    .mc__label { font-size: 0.78rem; font-weight: 600; color: #6b7280; }
    .mc__hint { margin: 0 0 4px; font-size: 0.75rem; color: #9ca3af; }

    .mc__textarea {
      width: 100%; box-sizing: border-box;
      padding: 8px 10px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: var(--p-surface-0);
      font-size: 0.8125rem; color: var(--p-text-color); line-height: 1.5;
      resize: vertical; font-family: inherit; transition: border-color 0.15s;
    }
    .mc__textarea:focus { outline: none; border-color: #0284c7; }

    .mc__chips {
      display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
      min-height: 36px; padding: 6px 8px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: var(--p-surface-0);
    }
    .mc__chip {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 8px; border-radius: 20px;
      background: #e0f2fe; color: #075985;
      font-size: 0.75rem; font-weight: 500;
    }
    .mc__chip-remove {
      border: none; background: transparent; color: #0369a1;
      cursor: pointer; padding: 0; line-height: 1; display: flex;
    }
    .mc__chip-remove .pi { font-size: 0.6rem; }
    .mc__chip-input {
      flex: 1; min-width: 140px; border: none; outline: none;
      background: transparent; font-size: 0.8125rem; color: var(--p-text-color);
      font-family: inherit;
    }

    .mc__report-wrap { border-radius: 10px; overflow: hidden; }

    .mc__ideas-header {
      display: flex; align-items: center; justify-content: space-between;
      padding-bottom: 4px; border-bottom: 1px solid var(--p-surface-200);
    }
    .mc__ideas-title { font-size: 0.8125rem; font-weight: 700; color: #374151; }
    .mc__btn-add-idea {
      display: flex; align-items: center; gap: 5px;
      padding: 5px 10px; border-radius: 7px; border: none;
      background: #e0f2fe; color: #0369a1;
      font-size: 0.78rem; font-weight: 600; cursor: pointer;
      transition: background 0.15s;
    }
    .mc__btn-add-idea:hover { background: #bae6fd; }
    .mc__btn-add-idea .pi { font-size: 0.7rem; }

    .mc__legend {
      display: flex; gap: 12px; flex-wrap: wrap;
    }
    .mc__legend-item {
      display: flex; align-items: center; gap: 4px;
      font-size: 0.72rem; font-weight: 600;
    }
    .mc__legend-item .pi { font-size: 0.72rem; }
    .mc__legend-item--activa { color: #6b7280; }
    .mc__legend-item--sel { color: #0284c7; }
    .mc__legend-item--desc { color: #d1d5db; }

    .mc__list { display: flex; flex-direction: column; gap: 6px; }

    .mc__card {
      display: flex; align-items: flex-start; gap: 8px;
      padding: 10px 12px; border-radius: 10px;
      border: 1px solid var(--p-surface-200);
      background: var(--p-surface-0);
      transition: border-color 0.15s, background 0.15s;
    }
    .mc__card--seleccionada {
      border-color: #bae6fd; background: #f0f9ff;
    }
    .mc__card--descartada {
      opacity: 0.6; background: var(--p-surface-50);
    }

    .mc__card-left { display: flex; flex-direction: column; padding-top: 2px; }

    .mc__status-btns { display: flex; flex-direction: column; gap: 3px; }
    .mc__status-btn {
      width: 22px; height: 22px; border: none; background: transparent;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; border-radius: 4px; color: #d1d5db;
      transition: color 0.15s, background 0.15s;
    }
    .mc__status-btn:hover { background: var(--p-surface-100); color: #6b7280; }
    .mc__status-btn .pi { font-size: 0.8rem; }
    .mc__status-btn--activa { color: #6b7280; }
    .mc__status-btn--sel { color: #0284c7; }
    .mc__status-btn--desc { color: #9ca3af; }

    .mc__card-body { flex: 1; display: flex; flex-direction: column; gap: 5px; }

    .mc__idea-input {
      width: 100%; box-sizing: border-box;
      border: none; background: transparent; outline: none;
      font-size: 0.8125rem; color: var(--p-text-color); font-family: inherit;
      font-weight: 500;
    }
    .mc__cluster-input {
      width: 100%; box-sizing: border-box;
      border: none; background: transparent; outline: none;
      font-size: 0.72rem; color: #9ca3af; font-family: inherit;
    }
    .mc__razon-input {
      width: 100%; box-sizing: border-box;
      border: none; background: transparent; outline: none;
      font-size: 0.72rem; color: #b45309; font-family: inherit;
      border-top: 1px solid var(--p-surface-200); padding-top: 4px;
    }

    .mc__card-delete {
      width: 22px; height: 22px; border-radius: 5px; border: none;
      background: transparent; color: #d1d5db; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: color 0.15s, background 0.15s;
    }
    .mc__card-delete:hover { color: #ef4444; background: #fee2e2; }
    .mc__card-delete .pi { font-size: 0.65rem; }

    .mc__empty {
      display: flex; flex-direction: column; align-items: center;
      gap: 6px; padding: 24px 16px; text-align: center;
      border: 2px dashed #bae6fd; border-radius: 10px;
      color: #9ca3af;
    }
    .mc__empty i { font-size: 1.25rem; color: #bae6fd; }
    .mc__empty p { margin: 0; font-size: 0.8125rem; }
  `],
})
export class MapaConvergenciaToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly mapaConvergenciaService = inject(MapaConvergenciaService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<MapaConvergenciaData>({ ...EMPTY_MAPA_CONVERGENCIA });
  reports = signal<MapaConvergenciaReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  criterioBuffer = signal('');

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  ideasSeleccionadas = computed(() => this.data().ideas.filter(i => i.estado === 'seleccionada').length);
  ideasDescartadas = computed(() => this.data().ideas.filter(i => i.estado === 'descartada').length);
  canGenerate = computed(() => this.ideasSeleccionadas() >= 1);

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;
    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as MapaConvergenciaData | undefined;
    const storedReports = (raw['reports'] as MapaConvergenciaReportVersionDto[]) ?? [];
    this.data.set(stored ?? { ...EMPTY_MAPA_CONVERGENCIA });
    this.reports.set(storedReports);
  }

  updateField(field: 'contexto' | 'notas', value: string): void {
    this.data.set({ ...this.data(), [field]: value });
    this.scheduleSave();
  }

  addCriterio(): void {
    const value = this.criterioBuffer().trim();
    if (!value) return;
    this.data.set({ ...this.data(), criterios: [...this.data().criterios, value] });
    this.criterioBuffer.set('');
    this.scheduleSave();
  }

  removeCriterio(index: number): void {
    this.data.set({ ...this.data(), criterios: this.data().criterios.filter((_, i) => i !== index) });
    this.scheduleSave();
  }

  addIdea(): void {
    const newIdea: IdeaConvergenciaDto = {
      id: crypto.randomUUID(), texto: '', cluster: '', estado: 'activa', razonDescarte: '',
    };
    this.data.set({ ...this.data(), ideas: [...this.data().ideas, newIdea] });
    this.scheduleSave();
  }

  updateIdea(index: number, field: keyof IdeaConvergenciaDto, value: string): void {
    const ideas = this.data().ideas.map((idea, i) => i === index ? { ...idea, [field]: value } : idea);
    this.data.set({ ...this.data(), ideas });
    this.scheduleSave();
  }

  setEstado(index: number, estado: IdeaEstado): void {
    const ideas = this.data().ideas.map((idea, i) =>
      i === index ? { ...idea, estado, razonDescarte: estado !== 'descartada' ? '' : idea.razonDescarte } : idea
    );
    this.data.set({ ...this.data(), ideas });
    this.scheduleSave();
  }

  removeIdea(index: number): void {
    this.data.set({ ...this.data(), ideas: this.data().ideas.filter((_, i) => i !== index) });
    this.scheduleSave();
  }

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;
    this.analyzing.set(true);
    try {
      const result = await this.mapaConvergenciaService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });
      const newVersion: MapaConvergenciaReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };
      const updated = [newVersion, ...this.reports()];
      this.reports.set(updated);
      await this.persistData(updated);
      this.showReport.set(true);
      this.uiDialog.showSuccess('Informe generado', 'El análisis fue generado correctamente.');
    } catch (error) {
      this.uiDialog.showError('Error', `No se pudo generar el informe: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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

  private async persistData(reports: MapaConvergenciaReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
