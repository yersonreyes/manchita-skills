import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { VisitaCampoService } from '@core/services/visitaCampoService/visita-campo.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { VisitaCampoReportComponent } from './visita-campo-report.component';
import {
  EMPTY_HALLAZGO,
  EMPTY_VISITA,
  EMPTY_VISITA_CAMPO,
  HALLAZGO_TIPO_ICONS,
  HALLAZGO_TIPO_LABELS,
  HallazgoTipo,
  HallazgoVisitaDto,
  VisitaCampoData,
  VisitaCampoReportVersionDto,
  VisitaDto,
} from './visita-campo.types';

@Component({
  selector: 'app-visita-campo-tool',
  standalone: true,
  imports: [FormsModule, VisitaCampoReportComponent],
  template: `
    <div class="vc">

      <!-- Header -->
      <div class="vc__header">
        <div class="vc__header-left">
          <div class="vc__badge">
            <i class="pi pi-map"></i>
          </div>
          <div class="vc__title-block">
            <span class="vc__title">Visita de Campo</span>
            <span class="vc__subtitle">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              } @else {
                {{ data().visitas.length }} visita{{ data().visitas.length === 1 ? '' : 's' }} — {{ totalHallazgos() }} hallazgo{{ totalHallazgos() === 1 ? '' : 's' }}
              }
            </span>
          </div>
        </div>
        <div class="vc__header-actions">
          <button
            class="vc__btn vc__btn--ghost"
            (click)="toggleReport()"
            [class.vc__btn--active]="showReport()"
          >
            <i class="pi pi-chart-bar"></i>
            Informes {{ reports().length ? '(' + reports().length + ')' : '' }}
          </button>
          <button
            class="vc__btn vc__btn--primary"
            (click)="generateReport()"
            [disabled]="!canGenerate() || analyzing()"
            [title]="!canGenerate() ? 'Agregá al menos 1 visita con hallazgos para analizar' : 'Generar análisis con IA'"
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
      <div class="vc__content">
        @if (showReport()) {
          <app-visita-campo-report [reports]="reports()" />
        } @else {
          <div class="vc__body">

            <!-- Preparación -->
            <div class="vc__section">
              <div class="vc__section-header">
                <i class="pi pi-compass vc__section-icon"></i>
                <span class="vc__section-title">Preparación de la Visita</span>
              </div>
              <div class="vc__prep-grid">
                <div class="vc__field vc__field--full">
                  <label class="vc__field-label">Objetivo de la Visita</label>
                  <textarea
                    class="vc__field-textarea"
                    placeholder="¿Qué queremos entender visitando el contexto real? ¿Qué supuestos queremos validar o refutar? (Ej: cómo los meseros usan el POS durante un servicio completo)"
                    [ngModel]="data().objetivo"
                    (ngModelChange)="updateField('objetivo', $event)"
                    rows="3"
                  ></textarea>
                </div>
                <div class="vc__field vc__field--full">
                  <label class="vc__field-label">Guía de Visita</label>
                  <textarea
                    class="vc__field-textarea"
                    placeholder="¿Qué áreas observar? ¿Qué preguntas hacer? ¿Qué experimentar? Ej: 1) Cómo toman pedidos, 2) Cómo coordinan con cocina, 3) Cómo manejan errores, 4) Qué herramientas usan además del sistema..."
                    [ngModel]="data().guiaVisita"
                    (ngModelChange)="updateField('guiaVisita', $event)"
                    rows="3"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Visitas -->
            <div class="vc__section vc__section--visitas">
              <div class="vc__section-header">
                <i class="pi pi-map-marker vc__section-icon"></i>
                <span class="vc__section-title">Visitas Realizadas</span>
                @if (data().visitas.length) {
                  <span class="vc__count">{{ data().visitas.length }}</span>
                }
                <span class="vc__hint">Mínimo 1 con hallazgos para analizar</span>
                <button class="vc__btn-add" (click)="addVisita()">
                  <i class="pi pi-plus"></i> Agregar visita
                </button>
              </div>

              @for (v of data().visitas; track v.id; let vi = $index) {
                <div class="vc__visita" [class.vc__visita--filled]="hasHallazgos(v)">

                  <!-- Header de la visita -->
                  <div class="vc__visita-header">
                    <div class="vc__visita-num">Visita {{ vi + 1 }}</div>
                    <input
                      class="vc__visita-lugar"
                      type="text"
                      placeholder="Lugar (ej: Restaurante El Patio, oficina del cliente...)"
                      [ngModel]="v.lugar"
                      (ngModelChange)="updateVisita(vi, 'lugar', $event)"
                    />
                    <button class="vc__visita-remove" (click)="removeVisita(vi)" title="Eliminar visita">
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>

                  <!-- Metadatos de la visita -->
                  <div class="vc__visita-meta">
                    <div class="vc__field">
                      <label class="vc__field-label">Fecha</label>
                      <input
                        class="vc__field-input"
                        type="text"
                        placeholder="Ej: 15/04/2025"
                        [ngModel]="v.fecha"
                        (ngModelChange)="updateVisita(vi, 'fecha', $event)"
                      />
                    </div>
                    <div class="vc__field">
                      <label class="vc__field-label">Duración</label>
                      <input
                        class="vc__field-input"
                        type="text"
                        placeholder="Ej: 3 horas (almuerzo)"
                        [ngModel]="v.duracion"
                        (ngModelChange)="updateVisita(vi, 'duracion', $event)"
                      />
                    </div>
                    <div class="vc__field vc__field--full">
                      <label class="vc__field-label">Equipo</label>
                      <input
                        class="vc__field-input"
                        type="text"
                        placeholder="Ej: 3 diseñadores — Ana (observa), Luis (documenta), Marta (conversa)"
                        [ngModel]="v.equipo"
                        (ngModelChange)="updateVisita(vi, 'equipo', $event)"
                      />
                    </div>
                  </div>

                  <!-- Hallazgos de la visita -->
                  <div class="vc__hallazgos-section">
                    <div class="vc__hallazgos-header">
                      <label class="vc__field-label">
                        <i class="pi pi-star"></i>
                        Hallazgos
                        @if (v.hallazgos.length) {
                          <span class="vc__count vc__count--small">{{ v.hallazgos.length }}</span>
                        }
                      </label>
                      <button class="vc__hallazgo-add" (click)="addHallazgo(vi)">
                        <i class="pi pi-plus"></i> Agregar fila
                      </button>
                    </div>

                    @if (v.hallazgos.length) {
                      <div class="vc__hallazgos-table">
                        <div class="vc__hallazgos-head">
                          <span>Tipo</span>
                          <span>Observación / Hallazgo</span>
                          <span>Insight</span>
                          <span></span>
                        </div>
                        @for (h of v.hallazgos; track h.id; let hi = $index) {
                          <div class="vc__hallazgo-row">
                            <div class="vc__hallazgo-tipo-cell">
                              <select
                                class="vc__tipo-select"
                                [ngModel]="h.tipo"
                                (ngModelChange)="updateHallazgo(vi, hi, 'tipo', $event)"
                              >
                                @for (entry of tipoOptions; track entry.value) {
                                  <option [value]="entry.value">{{ entry.label }}</option>
                                }
                              </select>
                              <div class="vc__tipo-icon" [title]="getTipoLabel(h.tipo)">
                                <i [class]="'pi ' + getTipoIcon(h.tipo)"></i>
                              </div>
                            </div>
                            <input
                              class="vc__hallazgo-input"
                              type="text"
                              placeholder="¿Qué viste, preguntaste o hiciste?"
                              [ngModel]="h.observacion"
                              (ngModelChange)="updateHallazgo(vi, hi, 'observacion', $event)"
                            />
                            <input
                              class="vc__hallazgo-input"
                              type="text"
                              placeholder="¿Qué revela?"
                              [ngModel]="h.insight"
                              (ngModelChange)="updateHallazgo(vi, hi, 'insight', $event)"
                            />
                            <button class="vc__hallazgo-remove" (click)="removeHallazgo(vi, hi)">
                              <i class="pi pi-times"></i>
                            </button>
                          </div>
                        }
                      </div>
                    } @else {
                      <div class="vc__hallazgos-empty">
                        <span>Agregá filas para documentar observaciones, preguntas y experimentos de esta visita</span>
                      </div>
                    }
                  </div>

                  <!-- Notas de la visita -->
                  <div class="vc__field vc__field--full">
                    <label class="vc__field-label">Notas adicionales de la visita</label>
                    <textarea
                      class="vc__field-textarea vc__field-textarea--sm"
                      placeholder="Contexto del entorno, cosas que no caben en la tabla, sensaciones del equipo, qué confirmar en próximas visitas..."
                      [ngModel]="v.notas"
                      (ngModelChange)="updateVisita(vi, 'notas', $event)"
                      rows="2"
                    ></textarea>
                  </div>

                </div>
              }

              @if (data().visitas.length === 0) {
                <div class="vc__visitas-empty">
                  <i class="pi pi-map"></i>
                  <span>Agregá la primera visita para documentar tus hallazgos de campo</span>
                </div>
              }
            </div>

            <!-- Síntesis general -->
            <div class="vc__section">
              <div class="vc__section-header">
                <i class="pi pi-align-left vc__section-icon"></i>
                <span class="vc__section-title">Síntesis del Equipo</span>
              </div>
              <div class="vc__field">
                <label class="vc__field-label">Debrief y síntesis cross-visitas</label>
                <textarea
                  class="vc__field-textarea"
                  placeholder="¿Qué aprendimos en conjunto? ¿Qué supuestos se confirmaron o refutaron? ¿Qué insight clave cambia el enfoque del proyecto? ¿Qué necesitamos explorar más?"
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
    .vc {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 12px;
    }

    /* ─── Header ───────────────────────────────────────────────────── */
    .vc__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-shrink: 0;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--p-surface-200);
    }

    .vc__header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .vc__badge {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
      flex-shrink: 0;
    }

    .vc__title {
      display: block;
      font-weight: 700;
      font-size: 15px;
      color: var(--p-surface-900);
    }

    .vc__subtitle {
      display: block;
      font-size: 12px;
      color: var(--p-surface-500);
      margin-top: 2px;
    }

    .vc__header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    /* ─── Buttons ───────────────────────────────────────────────────── */
    .vc__btn {
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

    .vc__btn--ghost {
      background: transparent;
      border: 1px solid var(--p-surface-300);
      color: var(--p-surface-600);
    }

    .vc__btn--ghost:hover {
      background: var(--p-surface-100);
    }

    .vc__btn--active {
      background: var(--p-teal-50);
      border-color: var(--p-teal-200);
      color: var(--p-teal-700);
    }

    .vc__btn--primary {
      background: var(--p-teal-500);
      color: white;
    }

    .vc__btn--primary:hover:not(:disabled) {
      background: var(--p-teal-600);
    }

    .vc__btn--primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .vc__btn-add {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      background: var(--p-teal-50);
      border: 1px solid var(--p-teal-200);
      color: var(--p-teal-700);
      transition: all 0.15s;
      margin-left: auto;
    }

    .vc__btn-add:hover {
      background: var(--p-teal-100);
    }

    /* ─── Content ───────────────────────────────────────────────────── */
    .vc__content {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
    }

    .vc__body {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* ─── Sections ──────────────────────────────────────────────────── */
    .vc__section {
      background: var(--p-surface-50);
      border: 1px solid var(--p-surface-200);
      border-radius: 12px;
      padding: 16px;
    }

    .vc__section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 14px;
      flex-wrap: wrap;
    }

    .vc__section-icon {
      color: var(--p-teal-500);
      font-size: 15px;
    }

    .vc__section-title {
      font-weight: 600;
      font-size: 14px;
      color: var(--p-surface-800);
    }

    .vc__count {
      background: var(--p-teal-100);
      color: var(--p-teal-700);
      border-radius: 10px;
      padding: 2px 8px;
      font-size: 11px;
      font-weight: 600;
    }

    .vc__count--small {
      font-size: 10px;
      padding: 1px 6px;
    }

    .vc__hint {
      font-size: 11px;
      color: var(--p-surface-400);
      margin-left: 4px;
    }

    /* ─── Fields ────────────────────────────────────────────────────── */
    .vc__prep-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .vc__field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .vc__field--full {
      width: 100%;
    }

    .vc__field-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--p-surface-600);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .vc__field-input {
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

    .vc__field-input:focus {
      border-color: var(--p-teal-400);
    }

    .vc__field-textarea {
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

    .vc__field-textarea:focus {
      border-color: var(--p-teal-400);
    }

    .vc__field-textarea--sm {
      resize: none;
    }

    /* ─── Visitas ───────────────────────────────────────────────────── */
    .vc__visita {
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

    .vc__visita--filled {
      border-color: var(--p-teal-200);
    }

    .vc__visita-header {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .vc__visita-num {
      background: var(--p-teal-50);
      border: 1px solid var(--p-teal-200);
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 700;
      color: var(--p-teal-700);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .vc__visita-lugar {
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

    .vc__visita-lugar:focus {
      border-color: var(--p-teal-400);
    }

    .vc__visita-remove {
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

    .vc__visita-remove:hover {
      background: var(--p-red-50);
      color: var(--p-red-600);
    }

    .vc__visita-meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    /* ─── Tabla de hallazgos ────────────────────────────────────────── */
    .vc__hallazgos-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .vc__hallazgos-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .vc__hallazgo-add {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      border-radius: 5px;
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      background: var(--p-teal-50);
      border: 1px solid var(--p-teal-200);
      color: var(--p-teal-700);
      transition: all 0.15s;
      margin-left: auto;
    }

    .vc__hallazgo-add:hover {
      background: var(--p-teal-100);
    }

    .vc__hallazgos-table {
      border: 1px solid var(--p-surface-200);
      border-radius: 8px;
      overflow: hidden;
    }

    .vc__hallazgos-head {
      display: grid;
      grid-template-columns: 140px 2fr 2fr 32px;
      background: var(--p-surface-100);
      border-bottom: 1px solid var(--p-surface-200);
      padding: 6px 10px;
      font-size: 11px;
      font-weight: 700;
      color: var(--p-surface-500);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .vc__hallazgo-row {
      display: grid;
      grid-template-columns: 140px 2fr 2fr 32px;
      border-bottom: 1px solid var(--p-surface-100);
      align-items: center;
    }

    .vc__hallazgo-row:last-child {
      border-bottom: none;
    }

    .vc__hallazgo-tipo-cell {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      border-right: 1px solid var(--p-surface-100);
    }

    .vc__tipo-select {
      flex: 1;
      padding: 5px 6px;
      border: none;
      font-size: 11px;
      background: transparent;
      color: var(--p-surface-700);
      outline: none;
      cursor: pointer;
    }

    .vc__tipo-icon {
      color: var(--p-teal-500);
      font-size: 13px;
      flex-shrink: 0;
    }

    .vc__hallazgo-input {
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

    .vc__hallazgo-input:focus {
      background: var(--p-teal-50);
    }

    .vc__hallazgo-remove {
      background: none;
      border: none;
      color: var(--p-surface-400);
      cursor: pointer;
      padding: 8px;
      font-size: 11px;
      transition: color 0.15s;
      justify-self: center;
    }

    .vc__hallazgo-remove:hover {
      color: var(--p-red-400);
    }

    .vc__hallazgos-empty {
      padding: 12px;
      background: var(--p-surface-50);
      border: 1px dashed var(--p-surface-300);
      border-radius: 6px;
      font-size: 12px;
      color: var(--p-surface-400);
      text-align: center;
    }

    /* ─── Empty states ──────────────────────────────────────────────── */
    .vc__visitas-empty {
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

    .vc__visitas-empty i {
      font-size: 28px;
      opacity: 0.4;
    }

    /* ─── Responsive ────────────────────────────────────────────────── */
    @media (max-width: 640px) {
      .vc__visita-meta {
        grid-template-columns: 1fr;
      }
      .vc__hallazgos-head {
        display: none;
      }
      .vc__hallazgo-row {
        grid-template-columns: 1fr 32px;
        grid-template-rows: auto auto auto;
      }
      .vc__hallazgo-tipo-cell {
        grid-column: 1;
      }
      .vc__hallazgo-input {
        grid-column: 1;
        border-right: none;
        border-bottom: 1px solid var(--p-surface-100);
      }
      .vc__hallazgo-remove {
        grid-column: 2;
        grid-row: 1 / 4;
      }
    }
  `],
})
export class VisitaCampoToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly visitaCampoService = inject(VisitaCampoService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<VisitaCampoData>({ ...EMPTY_VISITA_CAMPO });
  reports = signal<VisitaCampoReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly tipoOptions = Object.entries(HALLAZGO_TIPO_LABELS).map(([value, label]) => ({
    value: value as HallazgoTipo,
    label,
  }));

  totalHallazgos = computed(() =>
    this.data().visitas.reduce((sum, v) => sum + v.hallazgos.length, 0)
  );

  canGenerate = computed(() =>
    this.data().visitas.some(v => v.hallazgos.length > 0)
  );

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;

    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as VisitaCampoData | undefined;
    const storedReports = (raw['reports'] as VisitaCampoReportVersionDto[]) ?? [];

    this.data.set(stored ?? { ...EMPTY_VISITA_CAMPO });
    this.reports.set(storedReports);
  }

  toggleReport(): void {
    this.showReport.set(!this.showReport());
  }

  // ─── Field updates ──────────────────────────────────────────────────────────

  updateField(field: keyof VisitaCampoData, value: unknown): void {
    this.data.set({ ...this.data(), [field]: value });
    this.scheduleSave();
  }

  // ─── Visitas ────────────────────────────────────────────────────────────────

  addVisita(): void {
    this.data.set({ ...this.data(), visitas: [...this.data().visitas, EMPTY_VISITA()] });
    this.scheduleSave();
  }

  removeVisita(index: number): void {
    const visitas = this.data().visitas.filter((_, i) => i !== index);
    this.data.set({ ...this.data(), visitas });
    this.scheduleSave();
  }

  updateVisita(index: number, field: keyof VisitaDto, value: unknown): void {
    const visitas = this.data().visitas.map((v, i) =>
      i === index ? { ...v, [field]: value } : v
    );
    this.data.set({ ...this.data(), visitas });
    this.scheduleSave();
  }

  hasHallazgos(v: VisitaDto): boolean {
    return v.hallazgos.length > 0;
  }

  getTipoLabel(tipo: HallazgoTipo): string {
    return HALLAZGO_TIPO_LABELS[tipo] ?? tipo;
  }

  getTipoIcon(tipo: HallazgoTipo): string {
    return HALLAZGO_TIPO_ICONS[tipo] ?? 'pi-star';
  }

  // ─── Hallazgos ──────────────────────────────────────────────────────────────

  addHallazgo(visitaIndex: number): void {
    const visitas = this.data().visitas.map((v, i) =>
      i === visitaIndex
        ? { ...v, hallazgos: [...v.hallazgos, EMPTY_HALLAZGO()] }
        : v
    );
    this.data.set({ ...this.data(), visitas });
    this.scheduleSave();
  }

  removeHallazgo(visitaIndex: number, hallazgoIndex: number): void {
    const visitas = this.data().visitas.map((v, i) =>
      i === visitaIndex
        ? { ...v, hallazgos: v.hallazgos.filter((_, hi) => hi !== hallazgoIndex) }
        : v
    );
    this.data.set({ ...this.data(), visitas });
    this.scheduleSave();
  }

  updateHallazgo(visitaIndex: number, hallazgoIndex: number, field: keyof HallazgoVisitaDto, value: string): void {
    const visitas = this.data().visitas.map((v, i) =>
      i === visitaIndex
        ? {
            ...v,
            hallazgos: v.hallazgos.map((h, hi) =>
              hi === hallazgoIndex ? { ...h, [field]: value } : h
            ),
          }
        : v
    );
    this.data.set({ ...this.data(), visitas });
    this.scheduleSave();
  }

  // ─── AI analysis ────────────────────────────────────────────────────────────

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;

    this.analyzing.set(true);
    try {
      const result = await this.visitaCampoService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });

      const newVersion: VisitaCampoReportVersionDto = {
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

  private async persistData(reports: VisitaCampoReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
