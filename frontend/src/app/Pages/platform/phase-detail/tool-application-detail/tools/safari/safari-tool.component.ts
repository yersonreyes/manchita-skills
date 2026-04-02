import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { SafariService } from '@core/services/safariService/safari.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { SafariReportComponent } from './safari-report.component';
import {
  EMPTY_OBSERVACION,
  EMPTY_SAFARI,
  EMPTY_SESION,
  ObservacionDto,
  SafariData,
  SafariReportVersionDto,
  SesionSafariDto,
} from './safari.types';

@Component({
  selector: 'app-safari-tool',
  standalone: true,
  imports: [FormsModule, SafariReportComponent],
  template: `
    <div class="sf">

      <!-- Header -->
      <div class="sf__header">
        <div class="sf__header-left">
          <div class="sf__badge">
            <i class="pi pi-map-marker"></i>
          </div>
          <div class="sf__title-block">
            <span class="sf__title">Safari / Design Safari</span>
            <span class="sf__subtitle">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              } @else {
                {{ data().sesiones.length }} sesión{{ data().sesiones.length === 1 ? '' : 'es' }} — {{ totalObservaciones() }} observacion{{ totalObservaciones() === 1 ? '' : 'es' }}
              }
            </span>
          </div>
        </div>
        <div class="sf__header-actions">
          <button
            class="sf__btn sf__btn--ghost"
            (click)="toggleReport()"
            [class.sf__btn--active]="showReport()"
          >
            <i class="pi pi-chart-bar"></i>
            Informes {{ reports().length ? '(' + reports().length + ')' : '' }}
          </button>
          <button
            class="sf__btn sf__btn--primary"
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
      <div class="sf__content">
        @if (showReport()) {
          <app-safari-report [reports]="reports()" />
        } @else {
          <div class="sf__body">

            <!-- Preparación del safari -->
            <div class="sf__section">
              <div class="sf__section-header">
                <i class="pi pi-compass sf__section-icon"></i>
                <span class="sf__section-title">Preparación del Safari</span>
              </div>
              <div class="sf__prep-grid">
                <div class="sf__field sf__field--full">
                  <label class="sf__field-label">Objetivo de Observación</label>
                  <textarea
                    class="sf__field-textarea"
                    placeholder="¿Qué queremos observar y aprender en este safari? ¿Qué hipótesis queremos validar? (Ej: cómo las personas hacen ejercicio en casa)"
                    [ngModel]="data().objetivo"
                    (ngModelChange)="updateField('objetivo', $event)"
                    rows="3"
                  ></textarea>
                </div>
                <div class="sf__field sf__field--full">
                  <label class="sf__field-label">Guía de Observación</label>
                  <textarea
                    class="sf__field-textarea"
                    placeholder="¿Qué prestar atención? Listá los focos: contexto físico, acciones del usuario, pain points, workarounds, emociones, dinámicas sociales..."
                    [ngModel]="data().guiaObservacion"
                    (ngModelChange)="updateField('guiaObservacion', $event)"
                    rows="3"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Sesiones de observación -->
            <div class="sf__section sf__section--sesiones">
              <div class="sf__section-header">
                <i class="pi pi-binoculars sf__section-icon"></i>
                <span class="sf__section-title">Sesiones de Observación</span>
                @if (data().sesiones.length) {
                  <span class="sf__count">{{ data().sesiones.length }}</span>
                }
                <span class="sf__hint">Mínimo 1 con observaciones para analizar</span>
                <button class="sf__btn-add" (click)="addSesion()">
                  <i class="pi pi-plus"></i> Agregar sesión
                </button>
              </div>

              @for (s of data().sesiones; track s.id; let si = $index) {
                <div class="sf__sesion" [class.sf__sesion--filled]="hasObservaciones(s)">
                  <div class="sf__sesion-header">
                    <div class="sf__sesion-num">Safari {{ si + 1 }}</div>
                    <input
                      class="sf__sesion-ubicacion"
                      type="text"
                      placeholder="Ubicación (ej: Gym CDMX, Apartamento pequeño...)"
                      [ngModel]="s.ubicacion"
                      (ngModelChange)="updateSesion(si, 'ubicacion', $event)"
                    />
                    <button class="sf__sesion-remove" (click)="removeSesion(si)" title="Eliminar sesión">
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>

                  <div class="sf__sesion-meta">
                    <div class="sf__field">
                      <label class="sf__field-label">Duración</label>
                      <input
                        class="sf__field-input"
                        type="text"
                        placeholder="Ej: 2 horas"
                        [ngModel]="s.duracion"
                        (ngModelChange)="updateSesion(si, 'duracion', $event)"
                      />
                    </div>
                    <div class="sf__field">
                      <label class="sf__field-label">Equipo</label>
                      <input
                        class="sf__field-input"
                        type="text"
                        placeholder="Ej: 2 diseñadores"
                        [ngModel]="s.equipo"
                        (ngModelChange)="updateSesion(si, 'equipo', $event)"
                      />
                    </div>
                  </div>

                  <!-- Observaciones de la sesión -->
                  <div class="sf__obs-section">
                    <div class="sf__obs-header">
                      <label class="sf__field-label">
                        <i class="pi pi-eye"></i>
                        Observaciones
                        @if (s.observaciones.length) {
                          <span class="sf__count sf__count--small">{{ s.observaciones.length }}</span>
                        }
                      </label>
                      <button class="sf__obs-add" (click)="addObservacion(si)">
                        <i class="pi pi-plus"></i> Agregar fila
                      </button>
                    </div>

                    @if (s.observaciones.length) {
                      <div class="sf__obs-table">
                        <div class="sf__obs-table-head">
                          <span>Momento</span>
                          <span>Observación</span>
                          <span>Insight</span>
                          <span></span>
                        </div>
                        @for (obs of s.observaciones; track obs.id; let oi = $index) {
                          <div class="sf__obs-row">
                            <input
                              class="sf__obs-input"
                              type="text"
                              placeholder="Ej: Entrada"
                              [ngModel]="obs.momento"
                              (ngModelChange)="updateObservacion(si, oi, 'momento', $event)"
                            />
                            <input
                              class="sf__obs-input"
                              type="text"
                              placeholder="¿Qué viste?"
                              [ngModel]="obs.observacion"
                              (ngModelChange)="updateObservacion(si, oi, 'observacion', $event)"
                            />
                            <input
                              class="sf__obs-input"
                              type="text"
                              placeholder="¿Qué significa?"
                              [ngModel]="obs.insight"
                              (ngModelChange)="updateObservacion(si, oi, 'insight', $event)"
                            />
                            <button class="sf__obs-remove" (click)="removeObservacion(si, oi)">
                              <i class="pi pi-times"></i>
                            </button>
                          </div>
                        }
                      </div>
                    } @else {
                      <div class="sf__obs-empty">
                        <span>Agregá filas para documentar las observaciones de esta sesión</span>
                      </div>
                    }
                  </div>

                  <!-- Notas de la sesión -->
                  <div class="sf__field sf__field--full">
                    <label class="sf__field-label">Notas adicionales de la sesión</label>
                    <textarea
                      class="sf__field-textarea sf__field-textarea--sm"
                      placeholder="Contexto inesperado, limitaciones, reflexiones del equipo después del safari..."
                      [ngModel]="s.notas"
                      (ngModelChange)="updateSesion(si, 'notas', $event)"
                      rows="2"
                    ></textarea>
                  </div>

                </div>
              }

              @if (data().sesiones.length === 0) {
                <div class="sf__sesiones-empty">
                  <i class="pi pi-map-marker"></i>
                  <span>Agregá la primera sesión de observación para documentar tu safari</span>
                </div>
              }
            </div>

            <!-- Síntesis general -->
            <div class="sf__section">
              <div class="sf__section-header">
                <i class="pi pi-align-left sf__section-icon"></i>
                <span class="sf__section-title">Síntesis del Equipo</span>
              </div>
              <div class="sf__field">
                <label class="sf__field-label">Debrief y síntesis cross-sesiones</label>
                <textarea
                  class="sf__field-textarea"
                  placeholder="¿Qué aprendimos en conjunto? ¿Qué patrones emergieron? ¿Qué cambió en nuestra perspectiva después del safari? ¿Cómo conecta con lo que estamos diseñando?"
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
    .sf {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 12px;
    }

    /* ─── Header ───────────────────────────────────────────────────── */
    .sf__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-shrink: 0;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--p-surface-200);
    }

    .sf__header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .sf__badge {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
      flex-shrink: 0;
    }

    .sf__title {
      display: block;
      font-weight: 700;
      font-size: 15px;
      color: var(--p-surface-900);
    }

    .sf__subtitle {
      display: block;
      font-size: 12px;
      color: var(--p-surface-500);
      margin-top: 2px;
    }

    .sf__header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    /* ─── Buttons ───────────────────────────────────────────────────── */
    .sf__btn {
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

    .sf__btn--ghost {
      background: transparent;
      border: 1px solid var(--p-surface-300);
      color: var(--p-surface-600);
    }

    .sf__btn--ghost:hover {
      background: var(--p-surface-100);
    }

    .sf__btn--active {
      background: var(--p-amber-50);
      border-color: var(--p-amber-200);
      color: var(--p-amber-700);
    }

    .sf__btn--primary {
      background: var(--p-amber-500);
      color: white;
    }

    .sf__btn--primary:hover:not(:disabled) {
      background: var(--p-amber-600);
    }

    .sf__btn--primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .sf__btn-add {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      background: var(--p-amber-50);
      border: 1px solid var(--p-amber-200);
      color: var(--p-amber-700);
      transition: all 0.15s;
      margin-left: auto;
    }

    .sf__btn-add:hover {
      background: var(--p-amber-100);
    }

    /* ─── Content ───────────────────────────────────────────────────── */
    .sf__content {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
    }

    .sf__body {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* ─── Sections ──────────────────────────────────────────────────── */
    .sf__section {
      background: var(--p-surface-50);
      border: 1px solid var(--p-surface-200);
      border-radius: 12px;
      padding: 16px;
    }

    .sf__section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 14px;
      flex-wrap: wrap;
    }

    .sf__section-icon {
      color: var(--p-amber-500);
      font-size: 15px;
    }

    .sf__section-title {
      font-weight: 600;
      font-size: 14px;
      color: var(--p-surface-800);
    }

    .sf__count {
      background: var(--p-amber-100);
      color: var(--p-amber-700);
      border-radius: 10px;
      padding: 2px 8px;
      font-size: 11px;
      font-weight: 600;
    }

    .sf__count--small {
      font-size: 10px;
      padding: 1px 6px;
    }

    .sf__hint {
      font-size: 11px;
      color: var(--p-surface-400);
      margin-left: 4px;
    }

    /* ─── Fields ────────────────────────────────────────────────────── */
    .sf__prep-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .sf__field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .sf__field--full {
      width: 100%;
    }

    .sf__field-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--p-surface-600);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .sf__field-input {
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

    .sf__field-input:focus {
      border-color: var(--p-amber-400);
    }

    .sf__field-textarea {
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

    .sf__field-textarea:focus {
      border-color: var(--p-amber-400);
    }

    .sf__field-textarea--sm {
      resize: none;
    }

    /* ─── Sesiones ──────────────────────────────────────────────────── */
    .sf__sesion {
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

    .sf__sesion--filled {
      border-color: var(--p-amber-200);
    }

    .sf__sesion-header {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .sf__sesion-num {
      background: var(--p-amber-50);
      border: 1px solid var(--p-amber-200);
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 700;
      color: var(--p-amber-700);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .sf__sesion-ubicacion {
      flex: 1;
      padding: 7px 10px;
      border: 1px solid var(--p-surface-300);
      border-radius: 8px;
      font-size: 13px;
      background: white;
      color: var(--p-surface-800);
      outline: none;
      transition: border-color 0.15s;
    }

    .sf__sesion-ubicacion:focus {
      border-color: var(--p-amber-400);
    }

    .sf__sesion-remove {
      padding: 6px 10px;
      border-radius: 6px;
      background: transparent;
      border: 1px solid var(--p-red-200);
      color: var(--p-red-400);
      cursor: pointer;
      font-size: 13px;
      transition: all 0.15s;
      flex-shrink: 0;
    }

    .sf__sesion-remove:hover {
      background: var(--p-red-50);
      color: var(--p-red-600);
    }

    .sf__sesion-meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    /* ─── Tabla de observaciones ────────────────────────────────────── */
    .sf__obs-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .sf__obs-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .sf__obs-add {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      border-radius: 5px;
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      background: var(--p-amber-50);
      border: 1px solid var(--p-amber-200);
      color: var(--p-amber-700);
      transition: all 0.15s;
      margin-left: auto;
    }

    .sf__obs-add:hover {
      background: var(--p-amber-100);
    }

    .sf__obs-table {
      border: 1px solid var(--p-surface-200);
      border-radius: 8px;
      overflow: hidden;
    }

    .sf__obs-table-head {
      display: grid;
      grid-template-columns: 1fr 2fr 2fr 32px;
      gap: 0;
      background: var(--p-surface-100);
      border-bottom: 1px solid var(--p-surface-200);
      padding: 6px 10px;
      font-size: 11px;
      font-weight: 700;
      color: var(--p-surface-500);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .sf__obs-row {
      display: grid;
      grid-template-columns: 1fr 2fr 2fr 32px;
      gap: 0;
      border-bottom: 1px solid var(--p-surface-100);
      align-items: center;
    }

    .sf__obs-row:last-child {
      border-bottom: none;
    }

    .sf__obs-input {
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

    .sf__obs-input:focus {
      background: var(--p-amber-50);
    }

    .sf__obs-remove {
      background: none;
      border: none;
      color: var(--p-surface-400);
      cursor: pointer;
      padding: 8px;
      font-size: 11px;
      transition: color 0.15s;
      justify-self: center;
    }

    .sf__obs-remove:hover {
      color: var(--p-red-400);
    }

    .sf__obs-empty {
      padding: 12px;
      background: var(--p-surface-50);
      border: 1px dashed var(--p-surface-300);
      border-radius: 6px;
      font-size: 12px;
      color: var(--p-surface-400);
      text-align: center;
    }

    /* ─── Empty states ──────────────────────────────────────────────── */
    .sf__sesiones-empty {
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

    .sf__sesiones-empty i {
      font-size: 28px;
      opacity: 0.4;
    }

    /* ─── Responsive ────────────────────────────────────────────────── */
    @media (max-width: 640px) {
      .sf__sesion-meta {
        grid-template-columns: 1fr;
      }
      .sf__obs-table-head {
        display: none;
      }
      .sf__obs-row {
        grid-template-columns: 1fr 32px;
        grid-template-rows: auto auto auto;
      }
      .sf__obs-input {
        grid-column: 1;
        border-right: none;
        border-bottom: 1px solid var(--p-surface-100);
      }
      .sf__obs-remove {
        grid-column: 2;
        grid-row: 1 / 4;
      }
    }
  `],
})
export class SafariToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly safariService = inject(SafariService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<SafariData>({ ...EMPTY_SAFARI });
  reports = signal<SafariReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

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
    const stored = raw['data'] as SafariData | undefined;
    const storedReports = (raw['reports'] as SafariReportVersionDto[]) ?? [];

    this.data.set(stored ?? { ...EMPTY_SAFARI });
    this.reports.set(storedReports);
  }

  toggleReport(): void {
    this.showReport.set(!this.showReport());
  }

  // ─── Field updates ──────────────────────────────────────────────────────────

  updateField(field: keyof SafariData, value: unknown): void {
    this.data.set({ ...this.data(), [field]: value });
    this.scheduleSave();
  }

  // ─── Sesiones ───────────────────────────────────────────────────────────────

  addSesion(): void {
    this.data.set({ ...this.data(), sesiones: [...this.data().sesiones, EMPTY_SESION()] });
    this.scheduleSave();
  }

  removeSesion(index: number): void {
    const sesiones = this.data().sesiones.filter((_, i) => i !== index);
    this.data.set({ ...this.data(), sesiones });
    this.scheduleSave();
  }

  updateSesion(index: number, field: keyof SesionSafariDto, value: unknown): void {
    const sesiones = this.data().sesiones.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    );
    this.data.set({ ...this.data(), sesiones });
    this.scheduleSave();
  }

  hasObservaciones(s: SesionSafariDto): boolean {
    return s.observaciones.length > 0;
  }

  // ─── Observaciones ──────────────────────────────────────────────────────────

  addObservacion(sesionIndex: number): void {
    const sesiones = this.data().sesiones.map((s, i) =>
      i === sesionIndex
        ? { ...s, observaciones: [...s.observaciones, EMPTY_OBSERVACION()] }
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

  updateObservacion(sesionIndex: number, obsIndex: number, field: keyof ObservacionDto, value: string): void {
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
      const result = await this.safariService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });

      const newVersion: SafariReportVersionDto = {
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

  private async persistData(reports: SafariReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
