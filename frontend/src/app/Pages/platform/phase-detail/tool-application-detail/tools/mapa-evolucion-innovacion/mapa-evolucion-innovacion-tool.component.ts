import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { MapaEvolucionInnovacionService } from '@core/services/mapaEvolucionInnovacionService/mapa-evolucion-innovacion.service';
import { MapaEvolucionInnovacionReportComponent } from './mapa-evolucion-innovacion-report.component';
import {
  EMPTY_MAPA_EVOLUCION,
  EraEvolucionDto,
  HitoDto,
  MapaEvolucionInnovacionData,
  MapaEvolucionReportVersionDto,
  TIPO_INNOVACION_COLORS,
  TIPO_INNOVACION_LABELS,
  TipoInnovacion,
} from './mapa-evolucion-innovacion.types';

@Component({
  selector: 'app-mapa-evolucion-innovacion-tool',
  standalone: true,
  imports: [FormsModule, MapaEvolucionInnovacionReportComponent],
  template: `
    <div class="mei">

      <!-- Header -->
      <div class="mei__header">
        <div class="mei__header-left">
          <div class="mei__badge">
            <i class="pi pi-history"></i>
          </div>
          <div class="mei__title-block">
            <span class="mei__title">Mapa de Evolución e Innovación</span>
            <span class="mei__subtitle">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              } @else {
                {{ data().eras.length }} era{{ data().eras.length !== 1 ? 's' : '' }} mapeada{{ data().eras.length !== 1 ? 's' : '' }}
              }
            </span>
          </div>
        </div>
        <div class="mei__header-actions">
          <button class="mei__btn mei__btn--ghost" (click)="addEra()">
            <i class="pi pi-plus"></i> Agregar era
          </button>
          <button
            class="mei__btn mei__btn--ghost"
            (click)="showReport.set(!showReport())"
            [class.mei__btn--active]="showReport()"
          >
            <i class="pi pi-chart-bar"></i>
            Informes {{ reports().length ? '(' + reports().length + ')' : '' }}
          </button>
          <button
            class="mei__btn mei__btn--primary"
            (click)="generateReport()"
            [disabled]="!canGenerate() || analyzing()"
            [title]="!canGenerate() ? 'Mapeá al menos 2 eras con hitos para analizar' : 'Generar informe con IA'"
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
      <div class="mei__content">
        @if (showReport()) {
          <app-mapa-evolucion-innovacion-report [reports]="reports()" />
        } @else {

          <!-- Context -->
          <div class="mei__context">
            <div class="mei__context-field">
              <label class="mei__context-label"><i class="pi pi-tag"></i> Industria / Producto</label>
              <input
                class="mei__context-input"
                type="text"
                [ngModel]="data().industria"
                (ngModelChange)="onContextChange('industria', $event)"
                placeholder="Ej: Transporte urbano, Fintech, Salud digital"
              />
            </div>
            <div class="mei__context-field">
              <label class="mei__context-label"><i class="pi pi-align-left"></i> Contexto general</label>
              <input
                class="mei__context-input"
                type="text"
                [ngModel]="data().contexto"
                (ngModelChange)="onContextChange('contexto', $event)"
                placeholder="Ej: Evolución del transporte urbano desde los 80s hasta la era autónoma"
              />
            </div>
          </div>

          <!-- Timeline -->
          @if (data().eras.length === 0) {
            <div class="mei__empty">
              <i class="pi pi-history"></i>
              <p>Aún no hay eras. Hacé clic en "Agregar era" para empezar a mapear la evolución.</p>
            </div>
          } @else {
            <div class="mei__timeline">

              <!-- Timeline line -->
              <div class="mei__line">
                <div class="mei__line-bar"></div>
                @for (era of data().eras; track era.id; let i = $index) {
                  <div class="mei__line-dot" [style.left]="eraLinePosition(i) + '%'"></div>
                }
              </div>

              <!-- Era cards scroll -->
              <div class="mei__cards">
                @for (era of data().eras; track era.id; let i = $index) {
                  <div class="mei__card">

                    <!-- Card header -->
                    <div class="mei__card-header">
                      <div class="mei__card-index">{{ i + 1 }}</div>
                      <div class="mei__card-fields">
                        <input
                          class="mei__card-nombre"
                          type="text"
                          [ngModel]="era.nombre"
                          (ngModelChange)="updateEraField(i, 'nombre', $event)"
                          placeholder="Era 1"
                        />
                        <input
                          class="mei__card-periodo"
                          type="text"
                          [ngModel]="era.periodo"
                          (ngModelChange)="updateEraField(i, 'periodo', $event)"
                          placeholder="1980s - 2000"
                        />
                      </div>
                      <button class="mei__card-remove" (click)="removeEra(i)" title="Eliminar era">
                        <i class="pi pi-trash"></i>
                      </button>
                    </div>

                    <!-- Hitos -->
                    <div class="mei__card-section">
                      <p class="mei__card-section-label">
                        <i class="pi pi-flag"></i> Hitos
                      </p>
                      <div class="mei__hitos">
                        @for (hito of era.hitos; track hito.id; let hi = $index) {
                          <div class="mei__hito">
                            <span
                              class="mei__hito-tipo"
                              [style.background-color]="tipoColor(hito.tipoInnovacion)"
                            >{{ tipoLabel(hito.tipoInnovacion) }}</span>
                            <span class="mei__hito-desc">{{ hito.descripcion }}</span>
                            <button class="mei__hito-remove" (click)="removeHito(i, hi)">
                              <i class="pi pi-times"></i>
                            </button>
                          </div>
                        }
                        <div class="mei__hito-add">
                          <select
                            class="mei__hito-tipo-select"
                            [(ngModel)]="newHitoTipo[i]"
                          >
                            <option value="incremental">Incremental</option>
                            <option value="disruptiva">Disruptiva</option>
                            <option value="arquitectural">Arquitectural</option>
                            <option value="radical">Radical</option>
                          </select>
                          <input
                            class="mei__hito-input"
                            type="text"
                            [(ngModel)]="newHitoDesc[i]"
                            placeholder="Describir hito..."
                            (keydown.enter)="addHito(i)"
                          />
                          <button
                            class="mei__hito-add-btn"
                            (click)="addHito(i)"
                            [disabled]="!newHitoDesc[i]?.trim()"
                          >
                            <i class="pi pi-plus"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Puntos de inflexión -->
                    <div class="mei__card-section">
                      <p class="mei__card-section-label">
                        <i class="pi pi-bolt"></i> Puntos de inflexión
                      </p>
                      <div class="mei__list">
                        @for (p of era.puntosInflexion; track $index; let pi = $index) {
                          <div class="mei__list-item">
                            <span class="mei__list-dot mei__list-dot--orange"></span>
                            <span>{{ p }}</span>
                            <button class="mei__list-remove" (click)="removePuntoInflexion(i, pi)">
                              <i class="pi pi-times"></i>
                            </button>
                          </div>
                        }
                        <div class="mei__list-add">
                          <input
                            class="mei__list-input"
                            type="text"
                            [(ngModel)]="newPuntoInflexion[i]"
                            placeholder="Ej: Llegada del smartphone"
                            (keydown.enter)="addPuntoInflexion(i)"
                          />
                          <button
                            class="mei__list-add-btn"
                            (click)="addPuntoInflexion(i)"
                            [disabled]="!newPuntoInflexion[i]?.trim()"
                          >
                            <i class="pi pi-plus"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Oportunidades -->
                    <div class="mei__card-section">
                      <p class="mei__card-section-label">
                        <i class="pi pi-lightbulb"></i> Oportunidades / Gaps
                      </p>
                      <div class="mei__list">
                        @for (o of era.oportunidades; track $index; let oi = $index) {
                          <div class="mei__list-item">
                            <span class="mei__list-dot mei__list-dot--green"></span>
                            <span>{{ o }}</span>
                            <button class="mei__list-remove" (click)="removeOportunidad(i, oi)">
                              <i class="pi pi-times"></i>
                            </button>
                          </div>
                        }
                        <div class="mei__list-add">
                          <input
                            class="mei__list-input"
                            type="text"
                            [(ngModel)]="newOportunidad[i]"
                            placeholder="Ej: Nadie integró transport público + micromobility"
                            (keydown.enter)="addOportunidad(i)"
                          />
                          <button
                            class="mei__list-add-btn"
                            (click)="addOportunidad(i)"
                            [disabled]="!newOportunidad[i]?.trim()"
                          >
                            <i class="pi pi-plus"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                }
              </div>
            </div>
          }

        }
      </div>

    </div>
  `,
  styles: [`
    .mei {
      display: flex; flex-direction: column;
      height: 100%; gap: 12px;
    }

    /* ─── Header ─────────────────────────────────────────────────── */
    .mei__header {
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px; flex-shrink: 0;
      padding-bottom: 12px; border-bottom: 1px solid var(--p-surface-200);
    }

    .mei__header-left { display: flex; align-items: center; gap: 10px; }

    .mei__badge {
      width: 36px; height: 36px; border-radius: 8px;
      background: #f0f9ff; color: #0369a1;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.875rem; flex-shrink: 0;
    }

    .mei__title-block { display: flex; flex-direction: column; gap: 1px; }

    .mei__title {
      font-family: 'Syne', sans-serif;
      font-size: 0.9375rem; font-weight: 700;
      color: var(--p-text-color); line-height: 1.2;
    }

    .mei__subtitle {
      font-size: 0.72rem; color: var(--p-text-muted-color);
      display: flex; align-items: center; gap: 4px;
    }

    .mei__header-actions { display: flex; align-items: center; gap: 8px; }

    /* ─── Buttons ─────────────────────────────────────────────────── */
    .mei__btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 7px 14px; border-radius: 8px;
      font-size: 0.8125rem; font-weight: 600;
      cursor: pointer; border: 1px solid transparent;
      transition: all 0.15s; white-space: nowrap;
    }
    .mei__btn .pi { font-size: 0.8rem; }
    .mei__btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .mei__btn--ghost {
      background: transparent; border-color: var(--p-surface-300);
      color: var(--p-text-secondary-color);
    }
    .mei__btn--ghost:hover:not(:disabled) { background: var(--p-surface-100); }
    .mei__btn--ghost.mei__btn--active { background: #f0f9ff; border-color: #bae6fd; color: #0369a1; }

    .mei__btn--primary {
      background: var(--p-primary-600, #0284c7);
      color: white; border-color: var(--p-primary-600, #0284c7);
    }
    .mei__btn--primary:hover:not(:disabled) { background: var(--p-primary-700, #0369a1); }

    /* ─── Content ─────────────────────────────────────────────────── */
    .mei__content {
      flex: 1; min-height: 0;
      display: flex; flex-direction: column; gap: 10px;
    }

    /* ─── Context ─────────────────────────────────────────────────── */
    .mei__context {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 10px; flex-shrink: 0;
    }

    .mei__context-field { display: flex; flex-direction: column; gap: 4px; }

    .mei__context-label {
      font-size: 0.72rem; font-weight: 700;
      letter-spacing: 0.05em; text-transform: uppercase;
      color: var(--p-text-secondary-color);
      display: flex; align-items: center; gap: 4px;
    }
    .mei__context-label .pi { font-size: 0.7rem; }

    .mei__context-input {
      padding: 7px 10px; border-radius: 8px;
      border: 1px solid var(--p-surface-300);
      font-size: 0.8125rem; background: var(--p-surface-0);
      color: var(--p-text-color); outline: none;
      transition: border-color 0.15s; width: 100%; box-sizing: border-box;
    }
    .mei__context-input::placeholder { color: #9ca3af; }
    .mei__context-input:focus { border-color: #0ea5e9; box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.12); }

    /* ─── Empty ───────────────────────────────────────────────────── */
    .mei__empty {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 0.5rem; color: #9ca3af; text-align: center;
    }
    .mei__empty i { font-size: 2rem; color: #d1d5db; }
    .mei__empty p { font-size: 0.875rem; margin: 0; }

    /* ─── Timeline ────────────────────────────────────────────────── */
    .mei__timeline {
      flex: 1; min-height: 0;
      display: flex; flex-direction: column; gap: 0;
    }

    .mei__line {
      position: relative; height: 20px; flex-shrink: 0;
      margin: 0 8px; display: flex; align-items: center;
    }

    .mei__line-bar {
      position: absolute; left: 0; right: 0; top: 50%;
      height: 2px; background: linear-gradient(90deg, #bae6fd, #0ea5e9, #0284c7);
      transform: translateY(-50%);
    }

    .mei__line-dot {
      position: absolute; top: 50%; transform: translate(-50%, -50%);
      width: 10px; height: 10px; border-radius: 50%;
      background: #0ea5e9; border: 2px solid white;
      box-shadow: 0 0 0 2px #0ea5e9;
    }

    .mei__cards {
      flex: 1; min-height: 0;
      display: flex; gap: 10px;
      overflow-x: auto; overflow-y: hidden;
      padding: 8px 4px 4px;
    }

    /* ─── Card ────────────────────────────────────────────────────── */
    .mei__card {
      min-width: 280px; max-width: 320px;
      border: 1px solid #bae6fd; border-radius: 12px;
      background: #f0f9ff;
      display: flex; flex-direction: column; gap: 0;
      overflow: hidden; flex-shrink: 0;
      overflow-y: auto;
    }

    .mei__card-header {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 12px;
      background: #e0f2fe; border-bottom: 1px solid #bae6fd;
      flex-shrink: 0;
    }

    .mei__card-index {
      width: 22px; height: 22px; border-radius: 50%;
      background: #0ea5e9; color: white;
      font-size: 0.7rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }

    .mei__card-fields { flex: 1; display: flex; flex-direction: column; gap: 3px; }

    .mei__card-nombre {
      font-size: 0.8125rem; font-weight: 700; color: #0369a1;
      background: none; border: none; outline: none; padding: 0;
      width: 100%;
    }
    .mei__card-nombre::placeholder { color: #7dd3fc; }

    .mei__card-periodo {
      font-size: 0.72rem; color: #0284c7;
      background: none; border: none; outline: none; padding: 0;
      width: 100%;
    }
    .mei__card-periodo::placeholder { color: #bae6fd; }

    .mei__card-remove {
      background: none; border: none; cursor: pointer;
      color: #7dd3fc; font-size: 0.7rem; padding: 2px;
      border-radius: 4px; transition: all 0.15s; flex-shrink: 0;
    }
    .mei__card-remove:hover { color: #ef4444; background: #fef2f2; }

    /* ─── Card Section ────────────────────────────────────────────── */
    .mei__card-section {
      padding: 8px 12px;
      border-bottom: 1px solid #bae6fd;
    }
    .mei__card-section:last-child { border-bottom: none; }

    .mei__card-section-label {
      display: flex; align-items: center; gap: 5px;
      font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.05em; color: #0369a1; margin: 0 0 6px;
    }
    .mei__card-section-label .pi { font-size: 0.65rem; }

    /* ─── Hitos ───────────────────────────────────────────────────── */
    .mei__hitos { display: flex; flex-direction: column; gap: 4px; }

    .mei__hito {
      display: flex; align-items: flex-start; gap: 5px;
      font-size: 0.78rem; background: rgba(255,255,255,0.7);
      padding: 4px 6px; border-radius: 6px;
    }
    .mei__hito:hover .mei__hito-remove { opacity: 1; }

    .mei__hito-tipo {
      color: white; font-size: 0.6rem; font-weight: 700;
      padding: 1px 5px; border-radius: 4px; white-space: nowrap; flex-shrink: 0;
      margin-top: 1px;
    }

    .mei__hito-desc { flex: 1; color: #1f2937; line-height: 1.4; word-break: break-word; }

    .mei__hito-remove {
      opacity: 0; background: none; border: none; cursor: pointer;
      color: #9ca3af; font-size: 0.6rem; padding: 0 2px; flex-shrink: 0;
      transition: all 0.15s;
    }
    .mei__hito-remove:hover { color: #ef4444; }

    .mei__hito-add {
      display: flex; gap: 4px; align-items: center; margin-top: 4px;
    }

    .mei__hito-tipo-select {
      font-size: 0.72rem; padding: 4px 6px; border-radius: 6px;
      border: 1px solid #bae6fd; background: white;
      color: #374151; outline: none; flex-shrink: 0; max-width: 100px;
    }

    .mei__hito-input {
      flex: 1; padding: 4px 8px; border-radius: 6px;
      border: 1px solid #bae6fd; font-size: 0.78rem;
      background: rgba(255,255,255,0.8); color: var(--p-text-color); outline: none;
      min-width: 0;
    }
    .mei__hito-input::placeholder { color: #9ca3af; }

    .mei__hito-add-btn {
      width: 26px; height: 26px; border-radius: 6px;
      background: #0ea5e9; border: none; color: white;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem; flex-shrink: 0; transition: background 0.15s;
    }
    .mei__hito-add-btn:hover:not(:disabled) { background: #0284c7; }
    .mei__hito-add-btn:disabled { opacity: 0.35; cursor: not-allowed; }

    /* ─── Lists ───────────────────────────────────────────────────── */
    .mei__list { display: flex; flex-direction: column; gap: 4px; }

    .mei__list-item {
      display: flex; align-items: flex-start; gap: 5px;
      font-size: 0.78rem; color: #374151; line-height: 1.4;
      padding: 2px 0;
    }
    .mei__list-item:hover .mei__list-remove { opacity: 1; }

    .mei__list-dot {
      width: 6px; height: 6px; border-radius: 50%;
      margin-top: 4px; flex-shrink: 0;
    }
    .mei__list-dot--orange { background: #f59e0b; }
    .mei__list-dot--green { background: #10b981; }

    .mei__list-remove {
      opacity: 0; background: none; border: none; cursor: pointer;
      color: #9ca3af; font-size: 0.6rem; padding: 0 2px; flex-shrink: 0;
      transition: all 0.15s; margin-left: auto;
    }
    .mei__list-remove:hover { color: #ef4444; }

    .mei__list-add {
      display: flex; gap: 4px; align-items: center; margin-top: 4px;
    }

    .mei__list-input {
      flex: 1; padding: 4px 8px; border-radius: 6px;
      border: 1px solid #bae6fd; font-size: 0.78rem;
      background: rgba(255,255,255,0.8); color: var(--p-text-color); outline: none;
      min-width: 0;
    }
    .mei__list-input::placeholder { color: #9ca3af; }

    .mei__list-add-btn {
      width: 26px; height: 26px; border-radius: 6px;
      background: #0ea5e9; border: none; color: white;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem; flex-shrink: 0; transition: background 0.15s;
    }
    .mei__list-add-btn:hover:not(:disabled) { background: #0284c7; }
    .mei__list-add-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  `],
})
export class MapaEvolucionInnovacionToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly mapaEvolucionService = inject(MapaEvolucionInnovacionService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  // ─── Estado ───────────────────────────────────────────────────────────────
  data = signal<MapaEvolucionInnovacionData>({ ...EMPTY_MAPA_EVOLUCION });
  reports = signal<MapaEvolucionReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  // Input buffers por era (indexed by era position)
  newHitoDesc: string[] = [];
  newHitoTipo: TipoInnovacion[] = [];
  newPuntoInflexion: string[] = [];
  newOportunidad: string[] = [];

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // ─── Computed ─────────────────────────────────────────────────────────────
  canGenerate = computed(
    () => this.data().eras.filter(e => e.hitos.length > 0).length >= 2
  );

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;

    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as MapaEvolucionInnovacionData | undefined;
    const storedReports = (raw['reports'] as MapaEvolucionReportVersionDto[]) ?? [];

    this.data.set(stored ? { ...EMPTY_MAPA_EVOLUCION, ...stored } : { ...EMPTY_MAPA_EVOLUCION });
    this.reports.set(storedReports);
    this.syncInputBuffers();
  }

  // ─── Display helpers ──────────────────────────────────────────────────────
  tipoLabel(tipo: TipoInnovacion): string {
    return TIPO_INNOVACION_LABELS[tipo];
  }

  tipoColor(tipo: TipoInnovacion): string {
    return TIPO_INNOVACION_COLORS[tipo];
  }

  eraLinePosition(index: number): number {
    const total = this.data().eras.length;
    if (total <= 1) return 50;
    return (index / (total - 1)) * 100;
  }

  // ─── Acciones ─────────────────────────────────────────────────────────────
  onContextChange(field: 'industria' | 'contexto', value: string): void {
    this.data.set({ ...this.data(), [field]: value });
    this.scheduleSave();
  }

  addEra(): void {
    const nueva: EraEvolucionDto = {
      id: crypto.randomUUID(),
      nombre: `Era ${this.data().eras.length + 1}`,
      periodo: '',
      hitos: [],
      puntosInflexion: [],
      oportunidades: [],
    };
    this.data.set({ ...this.data(), eras: [...this.data().eras, nueva] });
    this.syncInputBuffers();
    this.scheduleSave();
  }

  removeEra(index: number): void {
    const eras = this.data().eras.filter((_, i) => i !== index);
    this.data.set({ ...this.data(), eras });
    this.syncInputBuffers();
    this.scheduleSave();
  }

  updateEraField(index: number, field: 'nombre' | 'periodo', value: string): void {
    const eras = this.data().eras.map((e, i) => i === index ? { ...e, [field]: value } : e);
    this.data.set({ ...this.data(), eras });
    this.scheduleSave();
  }

  addHito(eraIndex: number): void {
    const desc = this.newHitoDesc[eraIndex]?.trim();
    if (!desc) return;

    const hito: HitoDto = {
      id: crypto.randomUUID(),
      descripcion: desc,
      tipoInnovacion: this.newHitoTipo[eraIndex] ?? 'incremental',
    };
    const eras = this.data().eras.map((e, i) =>
      i === eraIndex ? { ...e, hitos: [...e.hitos, hito] } : e
    );
    this.data.set({ ...this.data(), eras });
    this.newHitoDesc[eraIndex] = '';
    this.scheduleSave();
  }

  removeHito(eraIndex: number, hitoIndex: number): void {
    const eras = this.data().eras.map((e, i) =>
      i === eraIndex ? { ...e, hitos: e.hitos.filter((_, hi) => hi !== hitoIndex) } : e
    );
    this.data.set({ ...this.data(), eras });
    this.scheduleSave();
  }

  addPuntoInflexion(eraIndex: number): void {
    const texto = this.newPuntoInflexion[eraIndex]?.trim();
    if (!texto) return;

    const eras = this.data().eras.map((e, i) =>
      i === eraIndex ? { ...e, puntosInflexion: [...e.puntosInflexion, texto] } : e
    );
    this.data.set({ ...this.data(), eras });
    this.newPuntoInflexion[eraIndex] = '';
    this.scheduleSave();
  }

  removePuntoInflexion(eraIndex: number, itemIndex: number): void {
    const eras = this.data().eras.map((e, i) =>
      i === eraIndex ? { ...e, puntosInflexion: e.puntosInflexion.filter((_, pi) => pi !== itemIndex) } : e
    );
    this.data.set({ ...this.data(), eras });
    this.scheduleSave();
  }

  addOportunidad(eraIndex: number): void {
    const texto = this.newOportunidad[eraIndex]?.trim();
    if (!texto) return;

    const eras = this.data().eras.map((e, i) =>
      i === eraIndex ? { ...e, oportunidades: [...e.oportunidades, texto] } : e
    );
    this.data.set({ ...this.data(), eras });
    this.newOportunidad[eraIndex] = '';
    this.scheduleSave();
  }

  removeOportunidad(eraIndex: number, itemIndex: number): void {
    const eras = this.data().eras.map((e, i) =>
      i === eraIndex ? { ...e, oportunidades: e.oportunidades.filter((_, oi) => oi !== itemIndex) } : e
    );
    this.data.set({ ...this.data(), eras });
    this.scheduleSave();
  }

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;

    this.analyzing.set(true);
    try {
      const result = await this.mapaEvolucionService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });

      const newVersion: MapaEvolucionReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };

      const updatedReports = [newVersion, ...this.reports()];
      this.reports.set(updatedReports);

      await this.persistData(updatedReports);
      this.showReport.set(true);
      this.uiDialog.showSuccess('Informe generado', 'El análisis del Mapa de Evolución fue generado correctamente.');
    } catch (error) {
      this.uiDialog.showError('Error', `No se pudo generar el informe: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      this.analyzing.set(false);
    }
  }

  // ─── Helpers privados ──────────────────────────────────────────────────────
  private syncInputBuffers(): void {
    const n = this.data().eras.length;
    this.newHitoDesc = Array(n).fill('');
    this.newHitoTipo = Array(n).fill('incremental') as TipoInnovacion[];
    this.newPuntoInflexion = Array(n).fill('');
    this.newOportunidad = Array(n).fill('');
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
    } catch {
      // silent
    } finally {
      this.saving.set(false);
    }
  }

  private async persistData(reports: MapaEvolucionReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;

    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
