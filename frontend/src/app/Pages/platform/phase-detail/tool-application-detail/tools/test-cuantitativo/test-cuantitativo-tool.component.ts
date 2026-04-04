import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { TestCuantitativoService } from '@core/services/testCuantitativoService/test-cuantitativo.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { TestCuantitativoReportComponent } from './test-cuantitativo-report.component';
import {
  EMPTY_TEST_CUANTITATIVO,
  METODO_OPTIONS,
  TestCuantitativoData,
  TestCuantitativoReportVersionDto,
  TestTareaDto,
} from './test-cuantitativo.types';

@Component({
  selector: 'app-test-cuantitativo-tool',
  standalone: true,
  imports: [FormsModule, TestCuantitativoReportComponent],
  template: `
    <div class="tc">

      <!-- Header -->
      <div class="tc__header">
        <div class="tc__header-left">
          <div class="tc__badge"><i class="pi pi-chart-bar"></i></div>
          <div class="tc__title-block">
            <span class="tc__title">Test Cuantitativo</span>
            <span class="tc__subtitle">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              } @else {
                {{ data().tareas.length }} tarea{{ data().tareas.length !== 1 ? 's' : '' }} · {{ totalMetricas() }} métricas registradas
              }
            </span>
          </div>
        </div>
        <div class="tc__header-actions">
          <button
            class="tc__btn tc__btn--ghost"
            (click)="showReport.set(!showReport())"
            [class.tc__btn--active]="showReport()"
          >
            @if (showReport()) {
              <i class="pi pi-arrow-left"></i> Formulario
            } @else {
              <i class="pi pi-chart-bar"></i>
              Informes {{ reports().length ? '(' + reports().length + ')' : '' }}
            }
          </button>
          <button
            class="tc__btn tc__btn--primary"
            (click)="generateReport()"
            [disabled]="!canGenerate() || analyzing()"
            [title]="!canGenerate() ? 'Registrá al menos 1 métrica para analizar' : 'Generar análisis con IA'"
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
      @if (showReport()) {
        <app-test-cuantitativo-report [reports]="reports()" />
      } @else {
        <div class="tc__body">

          <!-- Contexto -->
          <div class="tc__section">
            <div class="tc__section-title">
              <i class="pi pi-info-circle tc__section-icon"></i>
              Contexto del Test
            </div>
            <div class="tc__context-grid">
              <div class="tc__field">
                <label class="tc__label">Método</label>
                <select
                  class="tc__select"
                  [ngModel]="data().metodo"
                  (ngModelChange)="updateField('metodo', $event)"
                >
                  @for (opt of metodoOptions; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              </div>
              <div class="tc__field">
                <label class="tc__label">Participantes</label>
                <input
                  class="tc__input"
                  type="number"
                  min="1"
                  placeholder="Ej: 30"
                  [ngModel]="data().participantes ?? ''"
                  (ngModelChange)="updateNullableNumber('participantes', $event)"
                />
              </div>
            </div>
            <div class="tc__field">
              <label class="tc__label">Descripción del test</label>
              <textarea
                class="tc__textarea"
                rows="2"
                placeholder="¿Qué se está evaluando? ¿Qué hipótesis querés validar con estos datos?"
                [ngModel]="data().contexto"
                (ngModelChange)="updateField('contexto', $event)"
              ></textarea>
            </div>
          </div>

          <!-- Tareas -->
          <div class="tc__section tc__section--tareas">
            <div class="tc__section-header">
              <div class="tc__section-title">
                <i class="pi pi-list-check tc__section-icon"></i>
                Tareas Evaluadas
                @if (data().tareas.length) {
                  <span class="tc__count">{{ data().tareas.length }}</span>
                }
              </div>
              <button class="tc__btn-add" (click)="addTarea()">
                <i class="pi pi-plus"></i> Agregar tarea
              </button>
            </div>

            @for (tarea of data().tareas; track tarea.id; let i = $index) {
              <div class="tc__tarea" [class.tc__tarea--filled]="hasTareaMetric(tarea)">
                <div class="tc__tarea-num">{{ i + 1 }}</div>
                <div class="tc__tarea-body">
                  <div class="tc__tarea-top">
                    <input
                      class="tc__tarea-name"
                      type="text"
                      placeholder="Nombre de la tarea (ej: Completar checkout)"
                      [ngModel]="tarea.nombre"
                      (ngModelChange)="updateTarea(i, 'nombre', $event)"
                    />
                    <button class="tc__tarea-remove" (click)="removeTarea(i)" title="Eliminar tarea">
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                  <textarea
                    class="tc__textarea tc__textarea--sm"
                    rows="1"
                    placeholder="Descripción de la tarea (opcional)"
                    [ngModel]="tarea.descripcion"
                    (ngModelChange)="updateTarea(i, 'descripcion', $event)"
                  ></textarea>
                  <div class="tc__metrics-grid">
                    <div class="tc__metric">
                      <label class="tc__metric-label">✅ Éxito (%)</label>
                      <input
                        class="tc__metric-input"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="—"
                        [ngModel]="tarea.exito ?? ''"
                        (ngModelChange)="updateTareaMetric(i, 'exito', $event)"
                      />
                    </div>
                    <div class="tc__metric">
                      <label class="tc__metric-label">⏱ Tiempo (seg)</label>
                      <input
                        class="tc__metric-input"
                        type="number"
                        min="0"
                        placeholder="—"
                        [ngModel]="tarea.tiempoSegundos ?? ''"
                        (ngModelChange)="updateTareaMetric(i, 'tiempoSegundos', $event)"
                      />
                    </div>
                    <div class="tc__metric">
                      <label class="tc__metric-label">⚠️ Errores</label>
                      <input
                        class="tc__metric-input"
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="—"
                        [ngModel]="tarea.errores ?? ''"
                        (ngModelChange)="updateTareaMetric(i, 'errores', $event)"
                      />
                    </div>
                    <div class="tc__metric">
                      <label class="tc__metric-label">⭐ Satisfacción (1–5)</label>
                      <input
                        class="tc__metric-input"
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        placeholder="—"
                        [ngModel]="tarea.satisfaccion ?? ''"
                        (ngModelChange)="updateTareaMetric(i, 'satisfaccion', $event)"
                      />
                    </div>
                  </div>
                  <textarea
                    class="tc__textarea tc__textarea--sm"
                    rows="1"
                    placeholder="Observaciones adicionales de esta tarea..."
                    [ngModel]="tarea.notas"
                    (ngModelChange)="updateTarea(i, 'notas', $event)"
                  ></textarea>
                </div>
              </div>
            }

            @if (data().tareas.length === 0) {
              <div class="tc__empty">
                <i class="pi pi-plus-circle"></i>
                <span>Agregá la primera tarea para empezar a registrar métricas</span>
              </div>
            }
          </div>

          <!-- Scores globales -->
          <div class="tc__section">
            <div class="tc__section-title">
              <i class="pi pi-gauge tc__section-icon"></i>
              Scores Globales
            </div>
            <div class="tc__scores-grid">
              <div class="tc__score-card">
                <div class="tc__score-header">
                  <span class="tc__score-title">SUS</span>
                  <span class="tc__score-hint">System Usability Scale (0–100)</span>
                </div>
                <input
                  class="tc__score-input"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="—"
                  [ngModel]="data().sus ?? ''"
                  (ngModelChange)="updateNullableNumber('sus', $event)"
                />
                @if (data().sus !== null) {
                  <div class="tc__score-badge" [class]="susClass()">{{ susLabel() }}</div>
                }
              </div>
              <div class="tc__score-card">
                <div class="tc__score-header">
                  <span class="tc__score-title">NPS</span>
                  <span class="tc__score-hint">Net Promoter Score (−100 a 100)</span>
                </div>
                <input
                  class="tc__score-input"
                  type="number"
                  min="-100"
                  max="100"
                  placeholder="—"
                  [ngModel]="data().nps ?? ''"
                  (ngModelChange)="updateNullableNumber('nps', $event)"
                />
                @if (data().nps !== null) {
                  <div class="tc__score-badge" [class]="npsClass()">{{ npsLabel() }}</div>
                }
              </div>
            </div>
          </div>

          <!-- Notas generales -->
          <div class="tc__section">
            <div class="tc__section-title">
              <i class="pi pi-align-left tc__section-icon"></i>
              Notas Generales
            </div>
            <textarea
              class="tc__textarea"
              rows="3"
              placeholder="Contexto adicional, condiciones del test, anomalías observadas, etc."
              [ngModel]="data().notas"
              (ngModelChange)="updateField('notas', $event)"
            ></textarea>
          </div>

        </div>
      }
    </div>
  `,
  styles: [`
    .tc {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* ─── Header ──────────────────────────────────────────────────────── */
    .tc__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--p-surface-200);
      flex-shrink: 0;
    }

    .tc__header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .tc__badge {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #dbeafe;
      color: #2563eb;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      flex-shrink: 0;
    }

    .tc__title-block {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .tc__title {
      font-family: 'Syne', sans-serif;
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--p-text-color);
      line-height: 1.2;
    }

    .tc__subtitle {
      font-size: 0.72rem;
      color: var(--p-text-muted-color);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .tc__header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* ─── Buttons ─────────────────────────────────────────────────────── */
    .tc__btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 0.8125rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      border: 1px solid transparent;
      transition: opacity 0.15s, background 0.15s;
      white-space: nowrap;
    }

    .tc__btn .pi { font-size: 0.8rem; }
    .tc__btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .tc__btn--ghost {
      background: transparent;
      border-color: var(--p-surface-300);
      color: var(--p-text-secondary-color);
    }

    .tc__btn--ghost:hover:not(:disabled) { background: var(--p-surface-100); }
    .tc__btn--ghost.tc__btn--active { background: #eff6ff; border-color: #bfdbfe; color: #2563eb; }

    .tc__btn--primary {
      background: #2563eb;
      color: white;
      border-color: #2563eb;
    }

    .tc__btn--primary:hover:not(:disabled) { opacity: 0.9; }

    .tc__btn-add {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 12px;
      border-radius: 8px;
      border: 1px solid #bfdbfe;
      background: #eff6ff;
      color: #2563eb;
      font-size: 0.75rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: background 0.15s;
    }

    .tc__btn-add .pi { font-size: 0.7rem; }
    .tc__btn-add:hover { background: #dbeafe; }

    /* ─── Body ────────────────────────────────────────────────────────── */
    .tc__body {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* ─── Sections ────────────────────────────────────────────────────── */
    .tc__section {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .tc__section--tareas {
      background: var(--p-surface-50);
      border: 1px solid var(--p-surface-200);
      border-radius: 12px;
      padding: 14px;
      gap: 10px;
    }

    .tc__section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .tc__section-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: 'Syne', sans-serif;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--p-text-secondary-color);
    }

    .tc__section-icon { color: #2563eb; font-size: 0.8rem; }

    .tc__count {
      background: #2563eb;
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 10px;
      line-height: 1.6;
    }

    /* ─── Context grid ────────────────────────────────────────────────── */
    .tc__context-grid {
      display: grid;
      grid-template-columns: 1fr 140px;
      gap: 10px;
    }

    /* ─── Fields ──────────────────────────────────────────────────────── */
    .tc__field {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .tc__label {
      font-size: 0.78rem;
      color: #6b7280;
      font-weight: 500;
    }

    .tc__input, .tc__select {
      width: 100%;
      padding: 7px 10px;
      border-radius: 8px;
      border: 1px solid var(--p-surface-300);
      font-size: 0.875rem;
      background: var(--p-surface-0);
      color: var(--p-text-color);
      outline: none;
      font-family: inherit;
      box-sizing: border-box;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .tc__input:focus, .tc__select:focus { border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15); }
    .tc__input::placeholder { color: #9ca3af; }

    .tc__textarea {
      width: 100%;
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid var(--p-surface-300);
      font-size: 0.82rem;
      background: var(--p-surface-0);
      color: var(--p-text-color);
      outline: none;
      resize: vertical;
      font-family: inherit;
      line-height: 1.5;
      box-sizing: border-box;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .tc__textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15); }
    .tc__textarea::placeholder { color: #9ca3af; }
    .tc__textarea--sm { font-size: 0.78rem; }

    /* ─── Task cards ──────────────────────────────────────────────────── */
    .tc__tarea {
      background: var(--p-surface-0);
      border: 1px solid var(--p-surface-200);
      border-left: 3px solid #bfdbfe;
      border-radius: 10px;
      padding: 10px 12px;
      display: flex;
      gap: 10px;
      transition: border-left-color 0.2s;
    }

    .tc__tarea--filled { border-left-color: #2563eb; }

    .tc__tarea-num {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #dbeafe;
      color: #2563eb;
      font-size: 0.68rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 2px;
      font-family: 'Syne', sans-serif;
    }

    .tc__tarea-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .tc__tarea-top {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .tc__tarea-name {
      flex: 1;
      padding: 6px 10px;
      border-radius: 7px;
      border: 1px solid var(--p-surface-200);
      font-size: 0.82rem;
      font-weight: 600;
      background: var(--p-surface-50);
      color: var(--p-text-color);
      outline: none;
      font-family: inherit;
      transition: border-color 0.15s;
    }

    .tc__tarea-name::placeholder { color: #9ca3af; font-weight: 400; }
    .tc__tarea-name:focus { border-color: #2563eb; }

    .tc__tarea-remove {
      background: none;
      border: none;
      cursor: pointer;
      color: #9ca3af;
      font-size: 0.75rem;
      padding: 4px;
      border-radius: 4px;
      flex-shrink: 0;
      transition: color 0.15s, background 0.15s;
    }

    .tc__tarea-remove:hover { color: #ef4444; background: #fef2f2; }

    /* ─── Metrics grid ────────────────────────────────────────────────── */
    .tc__metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      background: var(--p-surface-50);
      border: 1px solid var(--p-surface-200);
      border-radius: 8px;
      padding: 10px;
    }

    .tc__metric {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .tc__metric-label {
      font-size: 0.68rem;
      color: #6b7280;
      font-weight: 500;
      white-space: nowrap;
    }

    .tc__metric-input {
      width: 100%;
      padding: 5px 8px;
      border-radius: 6px;
      border: 1px solid var(--p-surface-300);
      font-size: 0.82rem;
      font-weight: 600;
      background: var(--p-surface-0);
      color: var(--p-text-color);
      outline: none;
      font-family: inherit;
      text-align: center;
      box-sizing: border-box;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .tc__metric-input:focus { border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.12); }
    .tc__metric-input::placeholder { color: #d1d5db; font-weight: 400; }

    /* ─── Empty state ─────────────────────────────────────────────────── */
    .tc__empty {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      border: 1px dashed #bfdbfe;
      border-radius: 8px;
      color: #2563eb;
      font-size: 0.8rem;
    }

    .tc__empty .pi { font-size: 1rem; }

    /* ─── Global scores ───────────────────────────────────────────────── */
    .tc__scores-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .tc__score-card {
      background: var(--p-surface-50);
      border: 1px solid var(--p-surface-200);
      border-radius: 10px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .tc__score-header {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .tc__score-title {
      font-family: 'Syne', sans-serif;
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--p-text-color);
    }

    .tc__score-hint {
      font-size: 0.68rem;
      color: var(--p-text-muted-color);
    }

    .tc__score-input {
      width: 100%;
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid var(--p-surface-300);
      font-size: 1.125rem;
      font-weight: 700;
      font-family: inherit;
      text-align: center;
      background: var(--p-surface-0);
      color: var(--p-text-color);
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .tc__score-input:focus { border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15); }
    .tc__score-input::placeholder { color: #d1d5db; font-weight: 400; font-size: 0.875rem; }

    .tc__score-badge {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 20px;
      width: fit-content;
    }

    .tc__score-badge--excellent { background: #dcfce7; color: #15803d; }
    .tc__score-badge--good      { background: #dbeafe; color: #1d4ed8; }
    .tc__score-badge--ok        { background: #fef9c3; color: #854d0e; }
    .tc__score-badge--poor      { background: #fee2e2; color: #b91c1c; }
  `],
})
export class TestCuantitativoToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly testCuantitativoService = inject(TestCuantitativoService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  // ─── Estado ─────────────────────────────────────────────────────────────────
  data = signal<TestCuantitativoData>({ ...EMPTY_TEST_CUANTITATIVO });
  reports = signal<TestCuantitativoReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  readonly metodoOptions = METODO_OPTIONS;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // ─── Computed ────────────────────────────────────────────────────────────────
  totalMetricas = computed(() => {
    const d = this.data();
    let count = 0;
    for (const t of d.tareas) {
      if (t.exito !== null) count++;
      if (t.tiempoSegundos !== null) count++;
      if (t.errores !== null) count++;
      if (t.satisfaccion !== null) count++;
    }
    if (d.sus !== null) count++;
    if (d.nps !== null) count++;
    return count;
  });

  canGenerate = computed(() => this.totalMetricas() > 0);

  susLabel = computed(() => {
    const sus = this.data().sus;
    if (sus === null) return '';
    if (sus >= 85) return 'Sobresaliente';
    if (sus >= 68) return 'Bueno';
    if (sus >= 51) return 'Pobre';
    return 'Inaceptable';
  });

  susClass = computed(() => {
    const sus = this.data().sus;
    if (sus === null) return '';
    if (sus >= 85) return 'tc__score-badge tc__score-badge--excellent';
    if (sus >= 68) return 'tc__score-badge tc__score-badge--good';
    if (sus >= 51) return 'tc__score-badge tc__score-badge--ok';
    return 'tc__score-badge tc__score-badge--poor';
  });

  npsLabel = computed(() => {
    const nps = this.data().nps;
    if (nps === null) return '';
    if (nps >= 70) return 'Excelente';
    if (nps >= 30) return 'Bueno';
    if (nps >= 0) return 'Regular';
    return 'Crítico';
  });

  npsClass = computed(() => {
    const nps = this.data().nps;
    if (nps === null) return '';
    if (nps >= 70) return 'tc__score-badge tc__score-badge--excellent';
    if (nps >= 30) return 'tc__score-badge tc__score-badge--good';
    if (nps >= 0) return 'tc__score-badge tc__score-badge--ok';
    return 'tc__score-badge tc__score-badge--poor';
  });

  // ─── Lifecycle ───────────────────────────────────────────────────────────────
  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;

    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const storedData = raw['data'] as TestCuantitativoData | undefined;
    const storedReports = (raw['reports'] as TestCuantitativoReportVersionDto[]) ?? [];

    this.data.set(storedData ? { ...EMPTY_TEST_CUANTITATIVO, ...storedData } : { ...EMPTY_TEST_CUANTITATIVO });
    this.reports.set(storedReports);
  }

  // ─── Fields ──────────────────────────────────────────────────────────────────
  updateField(field: 'contexto' | 'metodo' | 'notas', value: string): void {
    this.data.set({ ...this.data(), [field]: value });
    this.scheduleSave();
  }

  updateNullableNumber(field: 'participantes' | 'sus' | 'nps', value: string | number): void {
    const parsed = value === '' || value === null ? null : Number(value);
    const val = parsed === null || isNaN(parsed) ? null : parsed;
    this.data.set({ ...this.data(), [field]: val });
    this.scheduleSave();
  }

  // ─── Tareas ──────────────────────────────────────────────────────────────────
  addTarea(): void {
    const nueva: TestTareaDto = {
      id: crypto.randomUUID(),
      nombre: '',
      descripcion: '',
      exito: null,
      tiempoSegundos: null,
      errores: null,
      satisfaccion: null,
      notas: '',
    };
    this.data.set({ ...this.data(), tareas: [...this.data().tareas, nueva] });
    this.scheduleSave();
  }

  removeTarea(index: number): void {
    const arr = [...this.data().tareas];
    arr.splice(index, 1);
    this.data.set({ ...this.data(), tareas: arr });
    this.scheduleSave();
  }

  updateTarea(index: number, field: 'nombre' | 'descripcion' | 'notas', value: string): void {
    const tareas = this.data().tareas.map((t, i) => i === index ? { ...t, [field]: value } : t);
    this.data.set({ ...this.data(), tareas });
    this.scheduleSave();
  }

  updateTareaMetric(index: number, field: 'exito' | 'tiempoSegundos' | 'errores' | 'satisfaccion', value: string | number): void {
    const parsed = value === '' || value === null ? null : Number(value);
    const val = parsed === null || isNaN(parsed) ? null : parsed;
    const tareas = this.data().tareas.map((t, i) => i === index ? { ...t, [field]: val } : t);
    this.data.set({ ...this.data(), tareas });
    this.scheduleSave();
  }

  hasTareaMetric(tarea: TestTareaDto): boolean {
    return tarea.exito !== null || tarea.tiempoSegundos !== null ||
      tarea.errores !== null || tarea.satisfaccion !== null;
  }

  // ─── Generate report ─────────────────────────────────────────────────────────
  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;

    this.analyzing.set(true);
    try {
      const result = await this.testCuantitativoService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });

      const newVersion: TestCuantitativoReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };

      const updatedReports = [newVersion, ...this.reports()];
      this.reports.set(updatedReports);
      await this.persistData(updatedReports);
      this.showReport.set(true);
      this.uiDialog.showSuccess('Análisis generado', 'El análisis del test cuantitativo fue generado correctamente.');
    } catch (error) {
      this.uiDialog.showError('Error', `No se pudo generar el análisis: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      this.analyzing.set(false);
    }
  }

  // ─── Helpers privados ────────────────────────────────────────────────────────
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

  private async persistData(reports: TestCuantitativoReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
