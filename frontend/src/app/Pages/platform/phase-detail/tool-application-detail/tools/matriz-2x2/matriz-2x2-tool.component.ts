import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { Matriz2x2Service } from '@core/services/matriz2x2Service/matriz-2x2.service';
import { Matriz2x2ReportComponent } from './matriz-2x2-report.component';
import {
  CUADRANTES,
  CuadranteConfig,
  EMPTY_MATRIZ_2X2,
  Matriz2x2Data,
  Matriz2x2ItemDto,
  Matriz2x2ReportVersionDto,
  ValorEje,
} from './matriz-2x2.types';

@Component({
  selector: 'app-matriz-2x2-tool',
  standalone: true,
  imports: [FormsModule, Matriz2x2ReportComponent],
  template: `
    <div class="m2">

      <!-- Header -->
      <div class="m2__header">
        <div class="m2__header-left">
          <span class="m2__badge">2×2</span>
          <div>
            <p class="m2__title">Matriz 2×2</p>
            <p class="m2__subtitle">
              {{ data().items.length }} ítem{{ data().items.length === 1 ? '' : 's' }} en la matriz
              @if (saving()) { <span class="m2__saving">· guardando…</span> }
            </p>
          </div>
        </div>
        <div class="m2__header-actions">
          @if (reports().length > 0) {
            <button class="m2__btn-ghost" (click)="showReport.set(!showReport())">
              <i class="pi pi-file-check"></i>
              Informes ({{ reports().length }})
            </button>
          }
          <button
            class="m2__btn-primary"
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

      <!-- Config ejes -->
      <div class="m2__config">
        <div class="m2__config-field">
          <label class="m2__label">Eje X (horizontal)</label>
          <input
            class="m2__input"
            type="text"
            placeholder="ej: Esfuerzo"
            [ngModel]="data().config.ejeXNombre"
            (ngModelChange)="updateConfig('ejeXNombre', $event)"
          />
        </div>
        <div class="m2__config-field">
          <label class="m2__label">Eje Y (vertical)</label>
          <input
            class="m2__input"
            type="text"
            placeholder="ej: Impacto"
            [ngModel]="data().config.ejeYNombre"
            (ngModelChange)="updateConfig('ejeYNombre', $event)"
          />
        </div>
        <div class="m2__config-field">
          <label class="m2__label">Contexto (opcional)</label>
          <input
            class="m2__input"
            type="text"
            placeholder="ej: Priorización del backlog Q3 2025"
            [ngModel]="data().contexto"
            (ngModelChange)="updateContexto($event)"
          />
        </div>
      </div>

      <!-- Report -->
      @if (showReport()) {
        <div class="m2__report-wrap">
          <app-matriz-2x2-report [reports]="reports()" />
        </div>
      }

      <!-- Matriz visual -->
      <div class="m2__matrix-wrap">

        <!-- Eje Y label top -->
        <div class="m2__axis-y-label">
          <span class="m2__axis-name">{{ data().config.ejeYNombre || 'Eje Y' }}</span>
        </div>

        <div class="m2__matrix-body">

          <!-- Eje Y labels -->
          <div class="m2__axis-y">
            <span class="m2__axis-val">Alto</span>
            <span class="m2__axis-val">Bajo</span>
          </div>

          <!-- Grid 2x2 -->
          <div class="m2__grid">
            @for (q of cuadrantes; track q.position) {
              <div
                class="m2__quadrant"
                [style.background]="q.bg"
                [style.border-color]="q.border"
              >
                <div class="m2__quadrant-header">
                  <span class="m2__quadrant-axes" [style.color]="q.labelColor">
                    {{ q.ejeX === 'alto' ? 'Alto' : 'Bajo' }} {{ ejeXLabel() }} /
                    {{ q.ejeY === 'alto' ? 'Alto' : 'Bajo' }} {{ ejeYLabel() }}
                  </span>
                  <span class="m2__quadrant-count" [style.color]="q.labelColor">
                    {{ itemsEnCuadrante(q.ejeX, q.ejeY).length }}
                  </span>
                </div>

                <div class="m2__chips">
                  @for (item of itemsEnCuadrante(q.ejeX, q.ejeY); track item.id) {
                    <div class="m2__chip" [style.background]="q.chipBg" [style.color]="q.chipText">
                      <span class="m2__chip-name">{{ item.nombre }}</span>
                      <button
                        class="m2__chip-delete"
                        [style.color]="q.chipText"
                        (click)="removeItem(item.id)"
                        title="Eliminar"
                      >
                        <i class="pi pi-times"></i>
                      </button>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Eje X labels -->
          <div class="m2__axis-x">
            <div class="m2__axis-y-spacer"></div>
            <div class="m2__axis-x-vals">
              <span class="m2__axis-val">Bajo</span>
              <span class="m2__axis-val">Alto</span>
            </div>
          </div>

        </div>

        <!-- Eje X label -->
        <div class="m2__axis-x-label">
          <span class="m2__axis-name">{{ data().config.ejeXNombre || 'Eje X' }}</span>
        </div>

      </div>

      <!-- Add item form -->
      <div class="m2__add-form">
        <p class="m2__label">Agregar ítem</p>
        <div class="m2__add-row">
          <input
            class="m2__input m2__input--nombre"
            type="text"
            placeholder="Nombre del ítem (ej: Notificaciones push)"
            [ngModel]="newNombre()"
            (ngModelChange)="newNombre.set($event)"
          />
          <div class="m2__add-selects">
            <div class="m2__select-wrap">
              <label class="m2__select-label">{{ ejeXLabel() }}</label>
              <select
                class="m2__select"
                [ngModel]="newEjeX()"
                (ngModelChange)="newEjeX.set($event)"
              >
                <option value="alto">Alto</option>
                <option value="bajo">Bajo</option>
              </select>
            </div>
            <div class="m2__select-wrap">
              <label class="m2__select-label">{{ ejeYLabel() }}</label>
              <select
                class="m2__select"
                [ngModel]="newEjeY()"
                (ngModelChange)="newEjeY.set($event)"
              >
                <option value="alto">Alto</option>
                <option value="bajo">Bajo</option>
              </select>
            </div>
          </div>
          <button
            class="m2__btn-add"
            [disabled]="!newNombre().trim()"
            (click)="addItem()"
          >
            <i class="pi pi-plus"></i> Agregar
          </button>
        </div>
        <input
          class="m2__input m2__input--desc"
          type="text"
          placeholder="Descripción o justificación (opcional)"
          [ngModel]="newDescripcion()"
          (ngModelChange)="newDescripcion.set($event)"
        />
      </div>

    </div>
  `,
  styles: [`
    .m2 { display: flex; flex-direction: column; gap: 16px; }

    .m2__header {
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px; flex-wrap: wrap;
    }
    .m2__header-left { display: flex; align-items: center; gap: 10px; }
    .m2__badge {
      width: 36px; height: 36px; border-radius: 10px;
      background: linear-gradient(135deg, #059669, #047857);
      color: #fff; font-size: 0.65rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      letter-spacing: 0.02em; flex-shrink: 0;
    }
    .m2__title { margin: 0; font-size: 0.9375rem; font-weight: 700; color: #111827; }
    .m2__subtitle { margin: 0; font-size: 0.78rem; color: #6b7280; }
    .m2__saving { color: #059669; }

    .m2__header-actions { display: flex; gap: 8px; align-items: center; }

    .m2__btn-ghost {
      display: flex; align-items: center; gap: 5px;
      padding: 6px 12px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: transparent;
      font-size: 0.8125rem; color: var(--p-text-color); cursor: pointer;
      transition: background 0.15s;
    }
    .m2__btn-ghost:hover { background: var(--p-surface-100); }

    .m2__btn-primary {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 8px; border: none;
      background: linear-gradient(135deg, #059669, #047857);
      color: #fff; font-size: 0.8125rem; font-weight: 600; cursor: pointer;
      transition: opacity 0.15s;
    }
    .m2__btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
    .m2__btn-primary:not(:disabled):hover { opacity: 0.9; }

    .m2__config {
      display: grid; grid-template-columns: 1fr 1fr 1.5fr; gap: 10px;
    }
    .m2__config-field { display: flex; flex-direction: column; gap: 4px; }
    .m2__label { font-size: 0.78rem; font-weight: 600; color: #6b7280; }

    .m2__input {
      padding: 6px 10px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: var(--p-surface-0);
      font-size: 0.8rem; color: var(--p-text-color); font-family: inherit;
      transition: border-color 0.15s;
    }
    .m2__input:focus { outline: none; border-color: #059669; }
    .m2__input--nombre { flex: 1; }
    .m2__input--desc { margin-top: 6px; width: 100%; box-sizing: border-box; }

    .m2__report-wrap { border-radius: 10px; overflow: hidden; }

    /* Matrix */
    .m2__matrix-wrap { display: flex; flex-direction: column; align-items: center; gap: 4px; }

    .m2__axis-y-label { align-self: flex-start; padding-left: 36px; }
    .m2__axis-x-label { align-self: flex-end; padding-right: 8px; }
    .m2__axis-name {
      font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; color: #6b7280;
    }

    .m2__matrix-body { display: flex; flex-direction: column; width: 100%; gap: 0; }

    .m2__axis-y {
      display: flex; flex-direction: column; justify-content: space-around;
      position: absolute; left: 0;
    }

    .m2__axis-y-spacer { width: 32px; flex-shrink: 0; }

    .m2__axis-x { display: flex; align-items: center; gap: 0; padding-top: 4px; }
    .m2__axis-x-vals {
      flex: 1; display: flex; justify-content: space-around;
    }
    .m2__axis-val {
      font-size: 0.7rem; color: #9ca3af; font-weight: 600; text-transform: uppercase;
    }

    .m2__grid {
      display: grid; grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 6px; width: 100%;
    }

    .m2__quadrant {
      border: 1px solid; border-radius: 10px;
      padding: 10px; min-height: 110px;
      display: flex; flex-direction: column; gap: 6px;
    }

    .m2__quadrant-header {
      display: flex; align-items: center; justify-content: space-between;
    }

    .m2__quadrant-axes {
      font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
    }

    .m2__quadrant-count {
      font-size: 0.75rem; font-weight: 800;
    }

    .m2__chips { display: flex; flex-wrap: wrap; gap: 5px; }

    .m2__chip {
      display: flex; align-items: center; gap: 4px;
      padding: 3px 8px; border-radius: 6px; font-size: 0.775rem; font-weight: 500;
    }

    .m2__chip-name { flex: 1; }

    .m2__chip-delete {
      border: none; background: transparent; cursor: pointer; padding: 0;
      opacity: 0.5; transition: opacity 0.15s;
      display: flex; align-items: center;
    }
    .m2__chip-delete:hover { opacity: 1; }
    .m2__chip-delete .pi { font-size: 0.6rem; }

    /* Add form */
    .m2__add-form { display: flex; flex-direction: column; gap: 4px; }
    .m2__add-row { display: flex; align-items: flex-end; gap: 8px; flex-wrap: wrap; }
    .m2__add-selects { display: flex; gap: 8px; }
    .m2__select-wrap { display: flex; flex-direction: column; gap: 3px; }
    .m2__select-label { font-size: 0.72rem; color: #9ca3af; font-weight: 600; }

    .m2__select {
      padding: 6px 8px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: var(--p-surface-0);
      font-size: 0.8rem; color: var(--p-text-color); font-family: inherit;
      transition: border-color 0.15s;
    }
    .m2__select:focus { outline: none; border-color: #059669; }

    .m2__btn-add {
      display: flex; align-items: center; gap: 5px;
      padding: 6px 14px; border-radius: 8px; border: none;
      background: #059669; color: #fff;
      font-size: 0.8125rem; font-weight: 600; cursor: pointer;
      transition: opacity 0.15s; white-space: nowrap;
    }
    .m2__btn-add:disabled { opacity: 0.4; cursor: not-allowed; }
    .m2__btn-add:not(:disabled):hover { opacity: 0.85; }
    .m2__btn-add .pi { font-size: 0.75rem; }
  `],
})
export class Matriz2x2ToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly matriz2x2Service = inject(Matriz2x2Service);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<Matriz2x2Data>({ ...EMPTY_MATRIZ_2X2, config: { ...EMPTY_MATRIZ_2X2.config } });
  reports = signal<Matriz2x2ReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  newNombre = signal('');
  newDescripcion = signal('');
  newEjeX = signal<ValorEje>('alto');
  newEjeY = signal<ValorEje>('alto');

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly cuadrantes: CuadranteConfig[] = CUADRANTES;

  ejeXLabel = computed(() => this.data().config.ejeXNombre || 'Eje X');
  ejeYLabel = computed(() => this.data().config.ejeYNombre || 'Eje Y');

  canGenerate = computed(() => this.data().items.length >= 3);

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;
    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as Matriz2x2Data | undefined;
    const storedReports = (raw['reports'] as Matriz2x2ReportVersionDto[]) ?? [];
    this.data.set(stored ? { ...EMPTY_MATRIZ_2X2, ...stored, config: { ...EMPTY_MATRIZ_2X2.config, ...stored.config } } : { ...EMPTY_MATRIZ_2X2, config: { ...EMPTY_MATRIZ_2X2.config } });
    this.reports.set(storedReports);
  }

  itemsEnCuadrante(ejeX: ValorEje, ejeY: ValorEje): Matriz2x2ItemDto[] {
    return this.data().items.filter(i => i.ejeX === ejeX && i.ejeY === ejeY);
  }

  updateContexto(value: string): void {
    this.data.set({ ...this.data(), contexto: value });
    this.scheduleSave();
  }

  updateConfig(field: string, value: string): void {
    this.data.set({ ...this.data(), config: { ...this.data().config, [field]: value } });
    this.scheduleSave();
  }

  addItem(): void {
    const nombre = this.newNombre().trim();
    if (!nombre) return;
    const newItem: Matriz2x2ItemDto = {
      id: crypto.randomUUID(),
      nombre,
      descripcion: this.newDescripcion().trim(),
      ejeX: this.newEjeX(),
      ejeY: this.newEjeY(),
    };
    this.data.set({ ...this.data(), items: [...this.data().items, newItem] });
    this.newNombre.set('');
    this.newDescripcion.set('');
    this.scheduleSave();
  }

  removeItem(id: string): void {
    this.data.set({ ...this.data(), items: this.data().items.filter(i => i.id !== id) });
    this.scheduleSave();
  }

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;
    this.analyzing.set(true);
    try {
      const result = await this.matriz2x2Service.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });
      const newVersion: Matriz2x2ReportVersionDto = {
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

  private async persistData(reports: Matriz2x2ReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
