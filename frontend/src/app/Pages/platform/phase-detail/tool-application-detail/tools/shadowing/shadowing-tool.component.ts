import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { ShadowingService } from '@core/services/shadowingService/shadowing.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { ShadowingReportComponent } from './shadowing-report.component';
import {
  EMPTY_OBSERVACION_SHADOWING,
  EMPTY_SESION_SHADOWING,
  EMPTY_SHADOWING,
  ObservacionShadowingDto,
  ShadowingData,
  ShadowingReportVersionDto,
  SesionShadowingDto,
  ShadowingTipo,
  TIPO_DESCRIPTIONS,
  TIPO_ICONS,
  TIPO_LABELS,
} from './shadowing.types';

@Component({
  selector: 'app-shadowing-tool',
  standalone: true,
  imports: [FormsModule, ShadowingReportComponent],
  template: `
    <div class="sh">

      <!-- Header -->
      <div class="sh__header">
        <div class="sh__header-left">
          <div class="sh__badge">
            <i class="pi pi-eye"></i>
          </div>
          <div class="sh__title-block">
            <span class="sh__title">Shadowing</span>
            <span class="sh__subtitle">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              } @else {
                {{ data().sesiones.length }} sesión{{ data().sesiones.length === 1 ? '' : 'es' }} — {{ totalObservaciones() }} observacion{{ totalObservaciones() === 1 ? '' : 'es' }}
              }
            </span>
          </div>
        </div>
        <div class="sh__header-actions">
          <button
            class="sh__btn sh__btn--ghost"
            (click)="toggleReport()"
            [class.sh__btn--active]="showReport()"
          >
            <i class="pi pi-chart-bar"></i>
            Informes {{ reports().length ? '(' + reports().length + ')' : '' }}
          </button>
          <button
            class="sh__btn sh__btn--primary"
            (click)="generateReport()"
            [disabled]="!canGenerate() || analyzing()"
            [title]="!canGenerate() ? 'Agregá al menos 1 sesión con observaciones para analizar' : 'Generar análisis con IA'"
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
      <div class="sh__content">
        @if (showReport()) {
          <app-shadowing-report [reports]="reports()" />
        } @else {
          <div class="sh__body">

            <!-- Preparación -->
            <div class="sh__section">
              <div class="sh__section-header">
                <i class="pi pi-map sh__section-icon"></i>
                <span class="sh__section-title">Preparación del Shadowing</span>
              </div>
              <div class="sh__prep-grid">
                <div class="sh__field sh__field--full">
                  <label class="sh__field-label">Objetivo de Observación</label>
                  <textarea
                    class="sh__field-textarea"
                    placeholder="¿Qué queremos aprender con este shadowing? ¿Qué comportamientos o flujos queremos entender? (Ej: cómo los doctores usan el software durante una consulta)"
                    [ngModel]="data().objetivo"
                    (ngModelChange)="updateField('objetivo', $event)"
                    rows="3"
                  ></textarea>
                </div>
                <div class="sh__field sh__field--full">
                  <label class="sh__field-label">Guía de Observación</label>
                  <textarea
                    class="sh__field-textarea"
                    placeholder="¿Qué categorías observar? Ej: flujo de trabajo, decisiones que toma, frustraciones, herramientas que usa, workarounds, contexto social, entorno físico..."
                    [ngModel]="data().guiaObservacion"
                    (ngModelChange)="updateField('guiaObservacion', $event)"
                    rows="3"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Sesiones -->
            <div class="sh__section sh__section--sesiones">
              <div class="sh__section-header">
                <i class="pi pi-users sh__section-icon"></i>
                <span class="sh__section-title">Sesiones de Shadowing</span>
                @if (data().sesiones.length) {
                  <span class="sh__count">{{ data().sesiones.length }}</span>
                }
                <span class="sh__hint">Mínimo 1 con observaciones para analizar</span>
                <button class="sh__btn-add" (click)="addSesion()">
                  <i class="pi pi-plus"></i> Agregar sesión
                </button>
              </div>

              @for (s of data().sesiones; track s.id; let si = $index) {
                <div class="sh__sesion" [class.sh__sesion--filled]="hasObservaciones(s)">

                  <!-- Header de la sesión -->
                  <div class="sh__sesion-header">
                    <div class="sh__sesion-num">Sesión {{ si + 1 }}</div>
                    <input
                      class="sh__sesion-participante"
                      type="text"
                      placeholder="Participante (ej: Dr. Martínez, usuario anónimo #3...)"
                      [ngModel]="s.participante"
                      (ngModelChange)="updateSesion(si, 'participante', $event)"
                    />
                    <div class="sh__tipo-badge">
                      <i [class]="'pi ' + getTipoIcon(s.tipo)"></i>
                      <span>{{ getTipoLabel(s.tipo) }}</span>
                    </div>
                    <button class="sh__sesion-remove" (click)="removeSesion(si)" title="Eliminar sesión">
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>

                  <!-- Metadatos de la sesión -->
                  <div class="sh__sesion-meta">
                    <div class="sh__field">
                      <label class="sh__field-label">Tipo de shadowing</label>
                      <select
                        class="sh__field-select"
                        [ngModel]="s.tipo"
                        (ngModelChange)="updateSesion(si, 'tipo', $event)"
                      >
                        @for (entry of tipoOptions; track entry.value) {
                          <option [value]="entry.value">{{ entry.label }} — {{ entry.description }}</option>
                        }
                      </select>
                    </div>
                    <div class="sh__field">
                      <label class="sh__field-label">Duración</label>
                      <input
                        class="sh__field-input"
                        type="text"
                        placeholder="Ej: 4 horas (mañana completa)"
                        [ngModel]="s.duracion"
                        (ngModelChange)="updateSesion(si, 'duracion', $event)"
                      />
                    </div>
                    <div class="sh__field sh__field--full">
                      <label class="sh__field-label">Contexto / Entorno</label>
                      <input
                        class="sh__field-input"
                        type="text"
                        placeholder="Ej: Consultorio con 2 recepcionistas, software de gestión médica, 15 pacientes/día"
                        [ngModel]="s.contexto"
                        (ngModelChange)="updateSesion(si, 'contexto', $event)"
                      />
                    </div>
                  </div>

                  <!-- Tabla de observaciones -->
                  <div class="sh__obs-section">
                    <div class="sh__obs-header">
                      <label class="sh__field-label">
                        <i class="pi pi-clock"></i>
                        Registro de Observaciones
                        @if (s.observaciones.length) {
                          <span class="sh__count sh__count--small">{{ s.observaciones.length }}</span>
                        }
                      </label>
                      <button class="sh__obs-add" (click)="addObservacion(si)">
                        <i class="pi pi-plus"></i> Agregar fila
                      </button>
                    </div>

                    @if (s.observaciones.length) {
                      <div class="sh__obs-table">
                        <div class="sh__obs-table-head">
                          <span>Hora</span>
                          <span>Observación</span>
                          <span>Insight</span>
                          <span></span>
                        </div>
                        @for (obs of s.observaciones; track obs.id; let oi = $index) {
                          <div class="sh__obs-row">
                            <input
                              class="sh__obs-input"
                              type="text"
                              placeholder="Ej: 9:30"
                              [ngModel]="obs.hora"
                              (ngModelChange)="updateObservacion(si, oi, 'hora', $event)"
                            />
                            <input
                              class="sh__obs-input"
                              type="text"
                              placeholder="¿Qué hizo o pasó?"
                              [ngModel]="obs.observacion"
                              (ngModelChange)="updateObservacion(si, oi, 'observacion', $event)"
                            />
                            <input
                              class="sh__obs-input"
                              type="text"
                              placeholder="¿Qué revela?"
                              [ngModel]="obs.insight"
                              (ngModelChange)="updateObservacion(si, oi, 'insight', $event)"
                            />
                            <button class="sh__obs-remove" (click)="removeObservacion(si, oi)">
                              <i class="pi pi-times"></i>
                            </button>
                          </div>
                        }
                      </div>
                    } @else {
                      <div class="sh__obs-empty">
                        <span>Agregá filas para documentar las observaciones en tiempo real</span>
                      </div>
                    }
                  </div>

                  <!-- Notas de la sesión -->
                  <div class="sh__field sh__field--full">
                    <label class="sh__field-label">Notas adicionales de la sesión</label>
                    <textarea
                      class="sh__field-textarea sh__field-textarea--sm"
                      placeholder="Contexto no capturable en la tabla, reflexiones post-sesión, validaciones con el usuario, qué confirmar en futuras sesiones..."
                      [ngModel]="s.notas"
                      (ngModelChange)="updateSesion(si, 'notas', $event)"
                      rows="2"
                    ></textarea>
                  </div>

                </div>
              }

              @if (data().sesiones.length === 0) {
                <div class="sh__sesiones-empty">
                  <i class="pi pi-eye"></i>
                  <span>Agregá la primera sesión para documentar tu shadowing</span>
                </div>
              }
            </div>

            <!-- Síntesis general -->
            <div class="sh__section">
              <div class="sh__section-header">
                <i class="pi pi-align-left sh__section-icon"></i>
                <span class="sh__section-title">Síntesis del Equipo</span>
              </div>
              <div class="sh__field">
                <label class="sh__field-label">Debrief y síntesis cross-sesiones</label>
                <textarea
                  class="sh__field-textarea"
                  placeholder="¿Qué patrones emergieron en múltiples sesiones? ¿Qué insight clave cambia el enfoque del proyecto? ¿Qué preguntas quedan abiertas? ¿Qué validar con los usuarios?"
                  [ngModel]="data().sintesis"
                  (ngModelChange)="updateField('sintesis', $event)"
                  rows="4"
                ></textarea>
              </div>
            </div>

          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    .sh {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 12px;
    }

    /* ─── Header ───────────────────────────────────────────────────── */
    .sh__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-shrink: 0;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--p-surface-200);
    }

    .sh__header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .sh__badge {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
      flex-shrink: 0;
    }

    .sh__title {
      display: block;
      font-weight: 700;
      font-size: 15px;
      color: var(--p-surface-900);
    }

    .sh__subtitle {
      display: block;
      font-size: 12px;
      color: var(--p-surface-500);
      margin-top: 2px;
    }

    .sh__header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    /* ─── Buttons ───────────────────────────────────────────────────── */
    .sh__btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.15s;
    }

    .sh__btn--ghost {
      background: transparent;
      border: 1px solid var(--p-surface-300);
      color: var(--p-surface-600);
    }

    .sh__btn--ghost:hover {
      background: var(--p-surface-100);
    }

    .sh__btn--active {
      background: var(--p-indigo-50);
      border-color: var(--p-indigo-200);
      color: var(--p-indigo-700);
    }

    .sh__btn--primary {
      background: var(--p-indigo-500);
      color: white;
    }

    .sh__btn--primary:hover:not(:disabled) {
      background: var(--p-indigo-600);
    }

    .sh__btn--primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .sh__btn-add {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      background: var(--p-indigo-50);
      border: 1px solid var(--p-indigo-200);
      color: var(--p-indigo-700);
      transition: all 0.15s;
      margin-left: auto;
    }

    .sh__btn-add:hover {
      background: var(--p-indigo-100);
    }

    /* ─── Content ───────────────────────────────────────────────────── */
    .sh__content {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
    }

    .sh__body {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* ─── Sections ──────────────────────────────────────────────────── */
    .sh__section {
      background: var(--p-surface-50);
      border: 1px solid var(--p-surface-200);
      border-radius: 12px;
      padding: 16px;
    }

    .sh__section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 14px;
      flex-wrap: wrap;
    }

    .sh__section-icon {
      color: var(--p-indigo-500);
      font-size: 15px;
    }

    .sh__section-title {
      font-weight: 600;
      font-size: 14px;
      color: var(--p-surface-800);
    }

    .sh__count {
      background: var(--p-indigo-100);
      color: var(--p-indigo-700);
      border-radius: 10px;
      padding: 2px 8px;
      font-size: 11px;
      font-weight: 600;
    }

    .sh__count--small {
      font-size: 10px;
      padding: 1px 6px;
    }

    .sh__hint {
      font-size: 11px;
      color: var(--p-surface-400);
      margin-left: 4px;
    }

    /* ─── Fields ────────────────────────────────────────────────────── */
    .sh__prep-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .sh__field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .sh__field--full {
      width: 100%;
    }

    .sh__field-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--p-surface-600);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .sh__field-input {
      width: 100%;
      padding: 8px 10px;
      border: 1px solid var(--p-surface-300);
      border-radius: 8px;
      font-size: 13px;
      background: white;
      color: var(--p-surface-800);
      outline: none;
      transition: border-color 0.15s;
      box-sizing: border-box;
    }

    .sh__field-input:focus {
      border-color: var(--p-indigo-400);
    }

    .sh__field-select {
      width: 100%;
      padding: 8px 10px;
      border: 1px solid var(--p-surface-300);
      border-radius: 8px;
      font-size: 13px;
      background: white;
      color: var(--p-surface-700);
      outline: none;
      cursor: pointer;
      box-sizing: border-box;
    }

    .sh__field-select:focus {
      border-color: var(--p-indigo-400);
    }

    .sh__field-textarea {
      width: 100%;
      padding: 8px 10px;
      border: 1px solid var(--p-surface-300);
      border-radius: 8px;
      font-size: 13px;
      background: white;
      color: var(--p-surface-800);
      outline: none;
      resize: vertical;
      transition: border-color 0.15s;
      box-sizing: border-box;
      font-family: inherit;
    }

    .sh__field-textarea:focus {
      border-color: var(--p-indigo-400);
    }

    .sh__field-textarea--sm {
      resize: none;
    }

    /* ─── Sesiones ──────────────────────────────────────────────────── */
    .sh__sesion {
      border: 1px solid var(--p-surface-200);
      border-radius: 10px;
      padding: 14px;
      margin-top: 10px;
      background: white;
      transition: border-color 0.15s;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .sh__sesion--filled {
      border-color: var(--p-indigo-200);
    }

    .sh__sesion-header {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .sh__sesion-num {
      background: var(--p-indigo-50);
      border: 1px solid var(--p-indigo-200);
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 700;
      color: var(--p-indigo-700);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .sh__sesion-participante {
      flex: 1;
      min-width: 180px;
      padding: 7px 10px;
      border: 1px solid var(--p-surface-300);
      border-radius: 8px;
      font-size: 13px;
      background: white;
      color: var(--p-surface-800);
      outline: none;
      transition: border-color 0.15s;
    }

    .sh__sesion-participante:focus {
      border-color: var(--p-indigo-400);
    }

    .sh__tipo-badge {
      display: flex;
      align-items: center;
      gap: 5px;
      background: var(--p-surface-100);
      border: 1px solid var(--p-surface-300);
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      color: var(--p-surface-600);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .sh__sesion-remove {
      padding: 6px 10px;
      border-radius: 6px;
      background: transparent;
      border: 1px solid var(--p-red-200);
      color: var(--p-red-400);
      cursor: pointer;
      font-size: 13px;
      transition: all 0.15s;
      flex-shrink: 0;
      margin-left: auto;
    }

    .sh__sesion-remove:hover {
      background: var(--p-red-50);
      color: var(--p-red-600);
    }

    .sh__sesion-meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    /* ─── Tabla de observaciones ────────────────────────────────────── */
    .sh__obs-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .sh__obs-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .sh__obs-add {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      border-radius: 5px;
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      background: var(--p-indigo-50);
      border: 1px solid var(--p-indigo-200);
      color: var(--p-indigo-700);
      transition: all 0.15s;
      margin-left: auto;
    }

    .sh__obs-add:hover {
      background: var(--p-indigo-100);
    }

    .sh__obs-table {
      border: 1px solid var(--p-surface-200);
      border-radius: 8px;
      overflow: hidden;
    }

    .sh__obs-table-head {
      display: grid;
      grid-template-columns: 80px 2fr 2fr 32px;
      background: var(--p-surface-100);
      border-bottom: 1px solid var(--p-surface-200);
      padding: 6px 10px;
      font-size: 11px;
      font-weight: 700;
      color: var(--p-surface-500);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .sh__obs-row {
      display: grid;
      grid-template-columns: 80px 2fr 2fr 32px;
      border-bottom: 1px solid var(--p-surface-100);
      align-items: center;
    }

    .sh__obs-row:last-child {
      border-bottom: none;
    }

    .sh__obs-input {
      width: 100%;
      padding: 8px 10px;
      border: none;
      border-right: 1px solid var(--p-surface-100);
      font-size: 13px;
      background: white;
      color: var(--p-surface-800);
      outline: none;
      box-sizing: border-box;
    }

    .sh__obs-input:focus {
      background: var(--p-indigo-50);
    }

    .sh__obs-remove {
      background: none;
      border: none;
      color: var(--p-surface-400);
      cursor: pointer;
      padding: 8px;
      font-size: 11px;
      transition: color 0.15s;
      justify-self: center;
    }

    .sh__obs-remove:hover {
      color: var(--p-red-400);
    }

    .sh__obs-empty {
      padding: 12px;
      background: var(--p-surface-50);
      border: 1px dashed var(--p-surface-300);
      border-radius: 6px;
      font-size: 12px;
      color: var(--p-surface-400);
      text-align: center;
    }

    /* ─── Empty states ──────────────────────────────────────────────── */
    .sh__sesiones-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 32px;
      color: var(--p-surface-400);
      font-size: 13px;
      text-align: center;
      border: 1px dashed var(--p-surface-300);
      border-radius: 8px;
      margin-top: 10px;
    }

    .sh__sesiones-empty i {
      font-size: 28px;
      opacity: 0.4;
    }

    /* ─── Responsive ────────────────────────────────────────────────── */
    @media (max-width: 640px) {
      .sh__sesion-meta {
        grid-template-columns: 1fr;
      }
      .sh__obs-table-head {
        display: none;
      }
      .sh__obs-row {
        grid-template-columns: 1fr 32px;
        grid-template-rows: auto auto auto;
      }
      .sh__obs-input {
        grid-column: 1;
        border-right: none;
        border-bottom: 1px solid var(--p-surface-100);
      }
      .sh__obs-remove {
        grid-column: 2;
        grid-row: 1 / 4;
      }
    }
  `],
})
export class ShadowingToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly shadowingService = inject(ShadowingService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<ShadowingData>({ ...EMPTY_SHADOWING });
  reports = signal<ShadowingReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly tipoOptions = Object.entries(TIPO_LABELS).map(([value, label]) => ({
    value: value as ShadowingTipo,
    label,
    description: TIPO_DESCRIPTIONS[value as ShadowingTipo],
  }));

  totalObservaciones = computed(() =>
    this.data().sesiones.reduce((sum, s) => sum + s.observaciones.length, 0)
  );

  canGenerate = computed(() =>
    this.data().sesiones.some(s => s.observaciones.length > 0)
  );

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;

    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as ShadowingData | undefined;
    const storedReports = (raw['reports'] as ShadowingReportVersionDto[]) ?? [];

    this.data.set(stored ?? { ...EMPTY_SHADOWING });
    this.reports.set(storedReports);
  }

  toggleReport(): void {
    this.showReport.set(!this.showReport());
  }

  // ─── Field updates ──────────────────────────────────────────────────────────

  updateField(field: keyof ShadowingData, value: unknown): void {
    this.data.set({ ...this.data(), [field]: value });
    this.scheduleSave();
  }

  // ─── Sesiones ───────────────────────────────────────────────────────────────

  addSesion(): void {
    this.data.set({ ...this.data(), sesiones: [...this.data().sesiones, EMPTY_SESION_SHADOWING()] });
    this.scheduleSave();
  }

  removeSesion(index: number): void {
    const sesiones = this.data().sesiones.filter((_, i) => i !== index);
    this.data.set({ ...this.data(), sesiones });
    this.scheduleSave();
  }

  updateSesion(index: number, field: keyof SesionShadowingDto, value: unknown): void {
    const sesiones = this.data().sesiones.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    );
    this.data.set({ ...this.data(), sesiones });
    this.scheduleSave();
  }

  hasObservaciones(s: SesionShadowingDto): boolean {
    return s.observaciones.length > 0;
  }

  getTipoLabel(tipo: ShadowingTipo): string {
    return TIPO_LABELS[tipo] ?? tipo;
  }

  getTipoIcon(tipo: ShadowingTipo): string {
    return TIPO_ICONS[tipo] ?? 'pi-eye';
  }

  // ─── Observaciones ──────────────────────────────────────────────────────────

  addObservacion(sesionIndex: number): void {
    const sesiones = this.data().sesiones.map((s, i) =>
      i === sesionIndex
        ? { ...s, observaciones: [...s.observaciones, EMPTY_OBSERVACION_SHADOWING()] }
        : s
    );
    this.data.set({ ...this.data(), sesiones });
    this.scheduleSave();
  }

  removeObservacion(sesionIndex: number, obsIndex: number): void {
    const sesiones = this.data().sesiones.map((s, i) =>
      i === sesionIndex
        ? { ...s, observaciones: s.observaciones.filter((_, oi) => oi !== obsIndex) }
        : s
    );
    this.data.set({ ...this.data(), sesiones });
    this.scheduleSave();
  }

  updateObservacion(sesionIndex: number, obsIndex: number, field: keyof ObservacionShadowingDto, value: string): void {
    const sesiones = this.data().sesiones.map((s, i) =>
      i === sesionIndex
        ? {
            ...s,
            observaciones: s.observaciones.map((obs, oi) =>
              oi === obsIndex ? { ...obs, [field]: value } : obs
            ),
          }
        : s
    );
    this.data.set({ ...this.data(), sesiones });
    this.scheduleSave();
  }

  // ─── AI analysis ────────────────────────────────────────────────────────────

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;

    this.analyzing.set(true);
    try {
      const result = await this.shadowingService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });

      const newVersion: ShadowingReportVersionDto = {
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

  // ─── Persistence ────────────────────────────────────────────────────────────

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

  private async persistData(reports: ShadowingReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
