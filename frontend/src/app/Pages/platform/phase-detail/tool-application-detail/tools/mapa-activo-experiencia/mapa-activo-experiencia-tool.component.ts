import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { MapaActivoExperienciaService } from '@core/services/mapaActivoExperienciaService/mapa-activo-experiencia.service';
import { MapaActivoExperienciaReportComponent } from './mapa-activo-experiencia-report.component';
import {
  EMPTY_MAPA_ACTIVO,
  MapaActivoEtapaDto,
  MapaActivoExperienciaData,
  MapaActivoReportVersionDto,
} from './mapa-activo-experiencia.types';

@Component({
  selector: 'app-mapa-activo-experiencia-tool',
  standalone: true,
  imports: [FormsModule, MapaActivoExperienciaReportComponent],
  template: `
    <div class="mae">

      <!-- Header -->
      <div class="mae__header">
        <div class="mae__header-left">
          <span class="mae__badge"><i class="pi pi-map"></i></span>
          <div>
            <p class="mae__title">Mapa Activo de la Experiencia</p>
            <p class="mae__subtitle">
              {{ data().etapas.length }} etapa{{ data().etapas.length === 1 ? '' : 's' }} mapeada{{ data().etapas.length === 1 ? '' : 's' }}
              @if (saving()) { <span class="mae__saving">· guardando…</span> }
            </p>
          </div>
        </div>
        <div class="mae__header-actions">
          @if (reports().length > 0) {
            <button class="mae__btn-ghost" (click)="showReport.set(!showReport())">
              <i class="pi pi-file-check"></i>
              Informes ({{ reports().length }})
            </button>
          }
          <button
            class="mae__btn-primary"
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
      <div class="mae__context-row">
        <label class="mae__label">Contexto del usuario / producto (opcional)</label>
        <input
          class="mae__input"
          type="text"
          placeholder="ej: Usuario que descarga una app de delivery por primera vez en Buenos Aires"
          [ngModel]="data().contexto"
          (ngModelChange)="updateContexto($event)"
        />
      </div>

      <!-- Report -->
      @if (showReport()) {
        <div class="mae__report-wrap">
          <app-mapa-activo-experiencia-report [reports]="reports()" />
        </div>
      }

      <!-- Timeline -->
      @if (data().etapas.length > 0) {
        <div class="mae__timeline">
          @for (etapa of data().etapas; track etapa.id; let i = $index) {
            <div class="mae__step-dot" [class.mae__step-dot--last]="i === data().etapas.length - 1">
              <span class="mae__step-num">{{ i + 1 }}</span>
            </div>
          }
        </div>
      }

      <!-- Etapas -->
      <div class="mae__etapas">
        @for (etapa of data().etapas; track etapa.id; let i = $index) {
          <div class="mae__etapa">

            <!-- Etapa header -->
            <div class="mae__etapa-header">
              <span class="mae__etapa-num">{{ i + 1 }}</span>
              <input
                class="mae__etapa-nombre"
                type="text"
                placeholder="Nombre de la etapa (ej: Conocimiento)"
                [ngModel]="etapa.nombre"
                (ngModelChange)="updateEtapa(i, 'nombre', $event)"
              />
              <button class="mae__etapa-delete" (click)="removeEtapa(i)" title="Eliminar etapa">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <!-- Rows -->
            <div class="mae__etapa-body">

              <!-- Acciones -->
              <div class="mae__row">
                <p class="mae__row-label mae__row-label--acciones">
                  <i class="pi pi-play"></i> Acciones
                </p>
                <div class="mae__chips">
                  @for (item of etapa.acciones; track $index; let ii = $index) {
                    <span class="mae__chip mae__chip--acciones">
                      {{ item }}
                      <button class="mae__chip-del" (click)="removeItem(i, 'acciones', ii)"><i class="pi pi-times"></i></button>
                    </span>
                  }
                </div>
                <div class="mae__add-inline">
                  <input
                    class="mae__add-input"
                    type="text"
                    placeholder="+ Acción…"
                    [ngModel]="newAccion()[i] ?? ''"
                    (ngModelChange)="setNew('newAccion', i, $event)"
                    (keydown.enter)="addItem(i, 'acciones')"
                  />
                  <button class="mae__add-btn" [disabled]="!(newAccion()[i]?.trim())" (click)="addItem(i, 'acciones')">
                    <i class="pi pi-plus"></i>
                  </button>
                </div>
              </div>

              <!-- Touchpoints -->
              <div class="mae__row">
                <p class="mae__row-label mae__row-label--touch">
                  <i class="pi pi-map-marker"></i> Touchpoints
                </p>
                <div class="mae__chips">
                  @for (item of etapa.touchpoints; track $index; let ii = $index) {
                    <span class="mae__chip mae__chip--touch">
                      {{ item }}
                      <button class="mae__chip-del" (click)="removeItem(i, 'touchpoints', ii)"><i class="pi pi-times"></i></button>
                    </span>
                  }
                </div>
                <div class="mae__add-inline">
                  <input
                    class="mae__add-input"
                    type="text"
                    placeholder="+ Touchpoint…"
                    [ngModel]="newTouch()[i] ?? ''"
                    (ngModelChange)="setNew('newTouch', i, $event)"
                    (keydown.enter)="addItem(i, 'touchpoints')"
                  />
                  <button class="mae__add-btn" [disabled]="!(newTouch()[i]?.trim())" (click)="addItem(i, 'touchpoints')">
                    <i class="pi pi-plus"></i>
                  </button>
                </div>
              </div>

              <!-- Momento clave -->
              <div class="mae__row">
                <p class="mae__row-label mae__row-label--momento">
                  <i class="pi pi-bolt"></i> Momento clave
                </p>
                <input
                  class="mae__input mae__input--momento"
                  type="text"
                  placeholder="El momento de la verdad en esta etapa"
                  [ngModel]="etapa.momentoClave"
                  (ngModelChange)="updateEtapa(i, 'momentoClave', $event)"
                />
              </div>

              <!-- Oportunidades -->
              <div class="mae__row">
                <p class="mae__row-label mae__row-label--oportunidad">
                  <i class="pi pi-lightbulb"></i> Oportunidades
                </p>
                <div class="mae__chips">
                  @for (item of etapa.oportunidades; track $index; let ii = $index) {
                    <span class="mae__chip mae__chip--oportunidad">
                      {{ item }}
                      <button class="mae__chip-del" (click)="removeItem(i, 'oportunidades', ii)"><i class="pi pi-times"></i></button>
                    </span>
                  }
                </div>
                <div class="mae__add-inline">
                  <input
                    class="mae__add-input"
                    type="text"
                    placeholder="+ Oportunidad de intervención…"
                    [ngModel]="newOportunidad()[i] ?? ''"
                    (ngModelChange)="setNew('newOportunidad', i, $event)"
                    (keydown.enter)="addItem(i, 'oportunidades')"
                  />
                  <button class="mae__add-btn" [disabled]="!(newOportunidad()[i]?.trim())" (click)="addItem(i, 'oportunidades')">
                    <i class="pi pi-plus"></i>
                  </button>
                </div>
              </div>

            </div>
          </div>
        }

        <!-- Add etapa -->
        <button class="mae__add-etapa" (click)="addEtapa()">
          <i class="pi pi-plus"></i>
          Agregar etapa
        </button>
      </div>

    </div>
  `,
  styles: [`
    .mae { display: flex; flex-direction: column; gap: 16px; }

    .mae__header {
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px; flex-wrap: wrap;
    }
    .mae__header-left { display: flex; align-items: center; gap: 10px; }
    .mae__badge {
      width: 36px; height: 36px; border-radius: 10px;
      background: linear-gradient(135deg, #db2777, #be185d);
      color: #fff; font-size: 0.9rem;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .mae__title { margin: 0; font-size: 0.9375rem; font-weight: 700; color: #111827; }
    .mae__subtitle { margin: 0; font-size: 0.78rem; color: #6b7280; }
    .mae__saving { color: #db2777; }

    .mae__header-actions { display: flex; gap: 8px; align-items: center; }

    .mae__btn-ghost {
      display: flex; align-items: center; gap: 5px;
      padding: 6px 12px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: transparent;
      font-size: 0.8125rem; color: var(--p-text-color); cursor: pointer;
      transition: background 0.15s;
    }
    .mae__btn-ghost:hover { background: var(--p-surface-100); }

    .mae__btn-primary {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 8px; border: none;
      background: linear-gradient(135deg, #db2777, #be185d);
      color: #fff; font-size: 0.8125rem; font-weight: 600; cursor: pointer;
      transition: opacity 0.15s;
    }
    .mae__btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
    .mae__btn-primary:not(:disabled):hover { opacity: 0.9; }

    .mae__context-row { display: flex; flex-direction: column; gap: 4px; }
    .mae__label { font-size: 0.78rem; font-weight: 600; color: #6b7280; }

    .mae__input {
      padding: 6px 10px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: var(--p-surface-0);
      font-size: 0.8rem; color: var(--p-text-color); font-family: inherit;
      transition: border-color 0.15s;
    }
    .mae__input:focus { outline: none; border-color: #db2777; }
    .mae__input--momento { width: 100%; box-sizing: border-box; }

    .mae__report-wrap { border-radius: 10px; overflow: hidden; }

    .mae__timeline {
      display: flex; align-items: center; gap: 0;
      padding: 0 8px;
    }
    .mae__step-dot {
      display: flex; align-items: center; flex: 1;
    }
    .mae__step-dot::after {
      content: ''; flex: 1; height: 2px; background: #fecdd3;
    }
    .mae__step-dot--last::after { display: none; }
    .mae__step-num {
      width: 24px; height: 24px; border-radius: 50%;
      background: #db2777; color: #fff;
      font-size: 0.7rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }

    .mae__etapas { display: flex; flex-direction: column; gap: 12px; }

    .mae__etapa {
      border: 1px solid var(--p-surface-200); border-radius: 12px;
      overflow: hidden; background: var(--p-surface-0);
    }

    .mae__etapa-header {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 12px; background: #fff1f2; border-bottom: 1px solid #fecdd3;
    }

    .mae__etapa-num {
      width: 22px; height: 22px; border-radius: 50%;
      background: #db2777; color: #fff;
      font-size: 0.7rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }

    .mae__etapa-nombre {
      flex: 1; padding: 4px 8px; border-radius: 6px;
      border: 1px solid transparent; background: transparent;
      font-size: 0.875rem; font-weight: 700; color: #be185d;
      font-family: inherit; transition: border-color 0.15s, background 0.15s;
    }
    .mae__etapa-nombre:hover { border-color: #fecdd3; background: #fff1f2; }
    .mae__etapa-nombre:focus { outline: none; border-color: #db2777; background: #fff1f2; }
    .mae__etapa-nombre::placeholder { color: #fbcfe8; font-weight: 400; }

    .mae__etapa-delete {
      width: 24px; height: 24px; border-radius: 6px; border: none;
      background: transparent; color: #9ca3af;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; flex-shrink: 0; transition: color 0.15s, background 0.15s;
    }
    .mae__etapa-delete:hover { color: #ef4444; background: #fee2e2; }
    .mae__etapa-delete .pi { font-size: 0.7rem; }

    .mae__etapa-body { display: flex; flex-direction: column; gap: 0; }

    .mae__row {
      padding: 8px 12px; border-bottom: 1px solid var(--p-surface-100);
      display: flex; flex-direction: column; gap: 5px;
    }
    .mae__row:last-child { border-bottom: none; }

    .mae__row-label {
      display: flex; align-items: center; gap: 5px;
      font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
      margin: 0;
    }
    .mae__row-label .pi { font-size: 0.65rem; }
    .mae__row-label--acciones { color: #7c3aed; }
    .mae__row-label--touch { color: #0369a1; }
    .mae__row-label--momento { color: #b45309; }
    .mae__row-label--oportunidad { color: #15803d; }

    .mae__chips { display: flex; flex-wrap: wrap; gap: 4px; }

    .mae__chip {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 2px 8px; border-radius: 5px; font-size: 0.775rem;
    }
    .mae__chip--acciones { background: #ede9fe; color: #5b21b6; }
    .mae__chip--touch { background: #dbeafe; color: #1d4ed8; }
    .mae__chip--oportunidad { background: #dcfce7; color: #15803d; }

    .mae__chip-del {
      border: none; background: transparent; cursor: pointer; padding: 0;
      opacity: 0.5; transition: opacity 0.15s;
      display: flex; align-items: center;
    }
    .mae__chip-del:hover { opacity: 1; }
    .mae__chip-del .pi { font-size: 0.55rem; }

    .mae__add-inline {
      display: flex; gap: 5px; align-items: center;
    }

    .mae__add-input {
      flex: 1; padding: 4px 8px; border-radius: 6px;
      border: 1px solid var(--p-surface-300); background: var(--p-surface-0);
      font-size: 0.775rem; color: var(--p-text-color); font-family: inherit;
      transition: border-color 0.15s;
    }
    .mae__add-input:focus { outline: none; border-color: #db2777; }

    .mae__add-btn {
      width: 24px; height: 24px; border-radius: 5px; border: none;
      background: #db2777; color: #fff; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: opacity 0.15s;
    }
    .mae__add-btn:disabled { opacity: 0.35; cursor: not-allowed; }
    .mae__add-btn:not(:disabled):hover { opacity: 0.85; }
    .mae__add-btn .pi { font-size: 0.6rem; }

    .mae__add-etapa {
      display: flex; align-items: center; gap: 6px; justify-content: center;
      width: 100%; padding: 10px; border-radius: 12px;
      border: 2px dashed #fecdd3; background: transparent;
      font-size: 0.8125rem; color: #db2777; cursor: pointer;
      transition: background 0.15s;
    }
    .mae__add-etapa:hover { background: #fff1f2; }
    .mae__add-etapa .pi { font-size: 0.75rem; }
  `],
})
export class MapaActivoExperienciaToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly mapaActivoService = inject(MapaActivoExperienciaService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<MapaActivoExperienciaData>({ ...EMPTY_MAPA_ACTIVO });
  reports = signal<MapaActivoReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  newAccion = signal<Record<number, string | undefined>>({});
  newTouch = signal<Record<number, string | undefined>>({});
  newOportunidad = signal<Record<number, string | undefined>>({});

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  canGenerate = computed(() =>
    this.data().etapas.filter(e =>
      e.acciones.length > 0 || e.touchpoints.length > 0
    ).length >= 2
  );

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;
    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as MapaActivoExperienciaData | undefined;
    const storedReports = (raw['reports'] as MapaActivoReportVersionDto[]) ?? [];
    this.data.set(stored ?? { ...EMPTY_MAPA_ACTIVO });
    this.reports.set(storedReports);
  }

  updateContexto(value: string): void {
    this.data.set({ ...this.data(), contexto: value });
    this.scheduleSave();
  }

  addEtapa(): void {
    const newEtapa: MapaActivoEtapaDto = {
      id: crypto.randomUUID(),
      nombre: '',
      acciones: [],
      touchpoints: [],
      momentoClave: '',
      oportunidades: [],
    };
    this.data.set({ ...this.data(), etapas: [...this.data().etapas, newEtapa] });
    this.scheduleSave();
  }

  removeEtapa(index: number): void {
    this.data.set({ ...this.data(), etapas: this.data().etapas.filter((_, i) => i !== index) });
    this.scheduleSave();
  }

  updateEtapa(index: number, field: string, value: string): void {
    const etapas = this.data().etapas.map((e, i) => i === index ? { ...e, [field]: value } : e);
    this.data.set({ ...this.data(), etapas });
    this.scheduleSave();
  }

  setNew(buffer: 'newAccion' | 'newTouch' | 'newOportunidad', index: number, value: string): void {
    this[buffer].set({ ...this[buffer](), [index]: value });
  }

  addItem(etapaIndex: number, field: 'acciones' | 'touchpoints' | 'oportunidades'): void {
    const bufferMap = { acciones: this.newAccion, touchpoints: this.newTouch, oportunidades: this.newOportunidad };
    const bufferKey = field === 'acciones' ? 'newAccion' : field === 'touchpoints' ? 'newTouch' : 'newOportunidad';
    const buf = bufferMap[field];
    const value = buf()[etapaIndex]?.trim();
    if (!value) return;

    const etapas = this.data().etapas.map((e, i) =>
      i === etapaIndex ? { ...e, [field]: [...e[field], value] } : e
    );
    this.data.set({ ...this.data(), etapas });

    const updated = { ...buf() };
    delete updated[etapaIndex];
    this[bufferKey].set(updated);
    this.scheduleSave();
  }

  removeItem(etapaIndex: number, field: 'acciones' | 'touchpoints' | 'oportunidades', itemIndex: number): void {
    const etapas = this.data().etapas.map((e, i) =>
      i === etapaIndex ? { ...e, [field]: e[field].filter((_, ii) => ii !== itemIndex) } : e
    );
    this.data.set({ ...this.data(), etapas });
    this.scheduleSave();
  }

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;
    this.analyzing.set(true);
    try {
      const result = await this.mapaActivoService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });
      const newVersion: MapaActivoReportVersionDto = {
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

  private async persistData(reports: MapaActivoReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
