import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { InvestigacionRemotaService } from '@core/services/investigacionRemotaService/investigacion-remota.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { InvestigacionRemotaReportComponent } from './investigacion-remota-report.component';
import {
  EMPTY_INVESTIGACION_REMOTA,
  EMPTY_METODO,
  METODO_ICONS,
  METODO_LABELS,
  MetodoRemotoDto,
  MetodoRemotoTipo,
  InvestigacionRemotaData,
  InvestigacionRemotaReportVersionDto,
} from './investigacion-remota.types';

@Component({
  selector: 'app-investigacion-remota-tool',
  standalone: true,
  imports: [FormsModule, InvestigacionRemotaReportComponent],
  template: `
    <div class="ir">

      <!-- Header -->
      <div class="ir__header">
        <div class="ir__header-left">
          <div class="ir__badge">
            <i class="pi pi-wifi"></i>
          </div>
          <div class="ir__title-block">
            <span class="ir__title">Investigación Remota</span>
            <span class="ir__subtitle">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              } @else {
                {{ data().metodos.length }} método{{ data().metodos.length === 1 ? '' : 's' }} documentado{{ data().metodos.length === 1 ? '' : 's' }}
              }
            </span>
          </div>
        </div>
        <div class="ir__header-actions">
          <button
            class="ir__btn ir__btn--ghost"
            (click)="toggleReport()"
            [class.ir__btn--active]="showReport()"
          >
            <i class="pi pi-chart-bar"></i>
            Informes {{ reports().length ? '(' + reports().length + ')' : '' }}
          </button>
          <button
            class="ir__btn ir__btn--primary"
            (click)="generateReport()"
            [disabled]="!canGenerate() || analyzing()"
            [title]="!canGenerate() ? 'Agregá al menos 1 método con hallazgos para analizar' : 'Generar análisis con IA'"
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
      <div class="ir__content">
        @if (showReport()) {
          <app-investigacion-remota-report [reports]="reports()" />
        } @else {
          <div class="ir__body">

            <!-- Contexto de la investigación -->
            <div class="ir__section">
              <div class="ir__section-header">
                <i class="pi pi-map-marker ir__section-icon"></i>
                <span class="ir__section-title">Contexto de la Investigación</span>
              </div>
              <div class="ir__context-grid">
                <div class="ir__field ir__field--full">
                  <label class="ir__field-label">Objetivo General</label>
                  <textarea
                    class="ir__field-textarea"
                    placeholder="¿Qué queremos aprender con esta investigación remota? ¿Qué hipótesis queremos validar?"
                    [ngModel]="data().objetivo"
                    (ngModelChange)="updateField('objetivo', $event)"
                    rows="3"
                  ></textarea>
                </div>
                <div class="ir__field ir__field--full">
                  <label class="ir__field-label">Contexto / Descripción del Proyecto</label>
                  <textarea
                    class="ir__field-textarea"
                    placeholder="¿En qué etapa del proyecto estamos? ¿Por qué elegimos investigación remota en lugar de presencial?"
                    [ngModel]="data().contexto"
                    (ngModelChange)="updateField('contexto', $event)"
                    rows="2"
                  ></textarea>
                </div>
                <div class="ir__field">
                  <label class="ir__field-label">Fechas</label>
                  <input
                    class="ir__field-input"
                    type="text"
                    placeholder="Ej: 10/03 — 25/03/2025"
                    [ngModel]="data().fechas"
                    (ngModelChange)="updateField('fechas', $event)"
                  />
                </div>
                <div class="ir__field">
                  <label class="ir__field-label">Equipo Investigador</label>
                  <input
                    class="ir__field-input"
                    type="text"
                    placeholder="Ej: Ana (encuestas), Luis (entrevistas)"
                    [ngModel]="data().equipo"
                    (ngModelChange)="updateField('equipo', $event)"
                  />
                </div>
              </div>
            </div>

            <!-- Métodos -->
            <div class="ir__section ir__section--metodos">
              <div class="ir__section-header">
                <i class="pi pi-sliders-h ir__section-icon"></i>
                <span class="ir__section-title">Métodos de Investigación</span>
                @if (data().metodos.length) {
                  <span class="ir__count">{{ data().metodos.length }}</span>
                }
                <span class="ir__hint">Mínimo 1 con hallazgos para analizar</span>
                <button class="ir__btn-add" (click)="addMetodo()">
                  <i class="pi pi-plus"></i> Agregar método
                </button>
              </div>

              @for (m of data().metodos; track m.id; let i = $index) {
                <div class="ir__metodo" [class.ir__metodo--filled]="hasHallazgos(m)">
                  <div class="ir__metodo-header">
                    <div class="ir__metodo-tipo-badge">
                      <i [class]="'pi ' + getMetodoIcon(m.tipo)"></i>
                      <span>{{ getMetodoLabel(m.tipo) }}</span>
                    </div>
                    <select
                      class="ir__tipo-select"
                      [ngModel]="m.tipo"
                      (ngModelChange)="updateMetodo(i, 'tipo', $event)"
                    >
                      @for (entry of metodoOptions; track entry.value) {
                        <option [value]="entry.value">{{ entry.label }}</option>
                      }
                    </select>
                    <button class="ir__metodo-remove" (click)="removeMetodo(i)" title="Eliminar método">
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>

                  <div class="ir__metodo-fields">
                    <div class="ir__metodo-row">
                      <div class="ir__field">
                        <label class="ir__field-label">Objetivo del método</label>
                        <textarea
                          class="ir__field-textarea"
                          placeholder="¿Qué queremos aprender con este método específico?"
                          [ngModel]="m.objetivo"
                          (ngModelChange)="updateMetodo(i, 'objetivo', $event)"
                          rows="2"
                        ></textarea>
                      </div>
                      <div class="ir__field">
                        <label class="ir__field-label">Herramienta utilizada</label>
                        <input
                          class="ir__field-input"
                          type="text"
                          placeholder="Ej: Typeform, Zoom, Maze, OptimalWorkshop..."
                          [ngModel]="m.herramienta"
                          (ngModelChange)="updateMetodo(i, 'herramienta', $event)"
                        />
                        <label class="ir__field-label ir__field-label--mt">Participantes</label>
                        <input
                          class="ir__field-input"
                          type="text"
                          placeholder="Ej: 30 usuarios, 5-7 por segmento"
                          [ngModel]="m.participantes"
                          (ngModelChange)="updateMetodo(i, 'participantes', $event)"
                        />
                      </div>
                    </div>

                    <!-- Hallazgos -->
                    <div class="ir__field ir__field--full">
                      <label class="ir__field-label">
                        <i class="pi pi-star"></i>
                        Hallazgos Principales
                        @if (m.hallazgos.length) {
                          <span class="ir__count ir__count--small">{{ m.hallazgos.length }}</span>
                        }
                      </label>
                      <div class="ir__hallazgos-list">
                        @for (h of m.hallazgos; track $index; let hi = $index) {
                          <div class="ir__hallazgo-item">
                            <i class="pi pi-check-circle ir__hallazgo-icon"></i>
                            <span class="ir__hallazgo-text">{{ h }}</span>
                            <button class="ir__hallazgo-remove" (click)="removeHallazgo(i, hi)">
                              <i class="pi pi-times"></i>
                            </button>
                          </div>
                        }
                      </div>
                      <div class="ir__input-row">
                        <input
                          class="ir__input"
                          type="text"
                          placeholder='Ej: "70% usan la app en transporte público — no en escritorio"'
                          [ngModel]="newHallazgo()[i] || ''"
                          (ngModelChange)="setNewHallazgo(i, $event)"
                          (keydown.enter)="addHallazgo(i)"
                        />
                        <button
                          class="ir__add-btn"
                          (click)="addHallazgo(i)"
                          [disabled]="!(newHallazgo()[i]?.trim())"
                        >
                          <i class="pi pi-plus"></i>
                        </button>
                      </div>
                    </div>

                    <!-- Notas -->
                    <div class="ir__field ir__field--full">
                      <label class="ir__field-label">Notas adicionales</label>
                      <textarea
                        class="ir__field-textarea ir__field-textarea--sm"
                        placeholder="Limitaciones del método, contexto inesperado, próximos pasos..."
                        [ngModel]="m.notas"
                        (ngModelChange)="updateMetodo(i, 'notas', $event)"
                        rows="2"
                      ></textarea>
                    </div>
                  </div>
                </div>
              }

              @if (data().metodos.length === 0) {
                <div class="ir__metodos-empty">
                  <i class="pi pi-wifi"></i>
                  <span>Agregá el primer método para documentar tu investigación remota</span>
                </div>
              }
            </div>

            <!-- Observaciones generales -->
            <div class="ir__section">
              <div class="ir__section-header">
                <i class="pi pi-eye ir__section-icon"></i>
                <span class="ir__section-title">Síntesis y Observaciones</span>
              </div>
              <div class="ir__field">
                <label class="ir__field-label">Observaciones Generales</label>
                <textarea
                  class="ir__field-textarea"
                  placeholder="Lo inesperado, patrones que cruzaron los métodos, lo que los datos cuantitativos no capturan, próximos pasos sugeridos..."
                  [ngModel]="data().observaciones"
                  (ngModelChange)="updateField('observaciones', $event)"
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
    .ir {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 12px;
    }

    /* ─── Header ───────────────────────────────────────────────────── */
    .ir__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-shrink: 0;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--p-surface-200);
    }

    .ir__header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .ir__badge {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
      flex-shrink: 0;
    }

    .ir__title {
      display: block;
      font-weight: 700;
      font-size: 15px;
      color: var(--p-surface-900);
    }

    .ir__subtitle {
      display: block;
      font-size: 12px;
      color: var(--p-surface-500);
      margin-top: 2px;
    }

    .ir__header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    /* ─── Buttons ───────────────────────────────────────────────────── */
    .ir__btn {
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

    .ir__btn--ghost {
      background: transparent;
      border: 1px solid var(--p-surface-300);
      color: var(--p-surface-600);
    }

    .ir__btn--ghost:hover {
      background: var(--p-surface-100);
    }

    .ir__btn--active {
      background: var(--p-emerald-50);
      border-color: var(--p-emerald-200);
      color: var(--p-emerald-700);
    }

    .ir__btn--primary {
      background: var(--p-emerald-500);
      color: white;
    }

    .ir__btn--primary:hover:not(:disabled) {
      background: var(--p-emerald-600);
    }

    .ir__btn--primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .ir__btn-add {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      background: var(--p-emerald-50);
      border: 1px solid var(--p-emerald-200);
      color: var(--p-emerald-700);
      transition: all 0.15s;
      margin-left: auto;
    }

    .ir__btn-add:hover {
      background: var(--p-emerald-100);
    }

    .ir__add-btn {
      padding: 7px 12px;
      border-radius: 6px;
      background: var(--p-emerald-500);
      color: white;
      border: none;
      cursor: pointer;
      font-size: 13px;
      transition: background 0.15s;
      flex-shrink: 0;
    }

    .ir__add-btn:hover:not(:disabled) {
      background: var(--p-emerald-600);
    }

    .ir__add-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    /* ─── Content ───────────────────────────────────────────────────── */
    .ir__content {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
    }

    .ir__body {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* ─── Sections ──────────────────────────────────────────────────── */
    .ir__section {
      background: var(--p-surface-50);
      border: 1px solid var(--p-surface-200);
      border-radius: 12px;
      padding: 16px;
    }

    .ir__section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 14px;
      flex-wrap: wrap;
    }

    .ir__section-icon {
      color: var(--p-emerald-500);
      font-size: 15px;
    }

    .ir__section-title {
      font-weight: 600;
      font-size: 14px;
      color: var(--p-surface-800);
    }

    .ir__count {
      background: var(--p-emerald-100);
      color: var(--p-emerald-700);
      border-radius: 10px;
      padding: 2px 8px;
      font-size: 11px;
      font-weight: 600;
    }

    .ir__count--small {
      font-size: 10px;
      padding: 1px 6px;
    }

    .ir__hint {
      font-size: 11px;
      color: var(--p-surface-400);
      margin-left: 4px;
    }

    /* ─── Fields ────────────────────────────────────────────────────── */
    .ir__context-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .ir__field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .ir__field--full {
      grid-column: 1 / -1;
    }

    .ir__field-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--p-surface-600);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .ir__field-label--mt {
      margin-top: 10px;
    }

    .ir__field-input {
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

    .ir__field-input:focus {
      border-color: var(--p-emerald-400);
    }

    .ir__field-textarea {
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

    .ir__field-textarea:focus {
      border-color: var(--p-emerald-400);
    }

    .ir__field-textarea--sm {
      resize: none;
    }

    /* ─── Métodos ───────────────────────────────────────────────────── */
    .ir__metodo {
      border: 1px solid var(--p-surface-200);
      border-radius: 10px;
      padding: 14px;
      margin-top: 10px;
      background: white;
      transition: border-color 0.15s;
    }

    .ir__metodo--filled {
      border-color: var(--p-emerald-200);
    }

    .ir__metodo-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 14px;
    }

    .ir__metodo-tipo-badge {
      display: flex;
      align-items: center;
      gap: 5px;
      background: var(--p-emerald-50);
      border: 1px solid var(--p-emerald-200);
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 600;
      color: var(--p-emerald-700);
      white-space: nowrap;
      min-width: 160px;
    }

    .ir__tipo-select {
      flex: 1;
      padding: 6px 10px;
      border: 1px solid var(--p-surface-300);
      border-radius: 8px;
      font-size: 13px;
      background: white;
      color: var(--p-surface-700);
      outline: none;
      cursor: pointer;
    }

    .ir__tipo-select:focus {
      border-color: var(--p-emerald-400);
    }

    .ir__metodo-remove {
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

    .ir__metodo-remove:hover {
      background: var(--p-red-50);
      color: var(--p-red-600);
    }

    .ir__metodo-fields {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .ir__metodo-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    /* ─── Hallazgos ─────────────────────────────────────────────────── */
    .ir__hallazgos-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 8px;
    }

    .ir__hallazgo-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 7px 10px;
      background: var(--p-emerald-50);
      border: 1px solid var(--p-emerald-100);
      border-radius: 6px;
    }

    .ir__hallazgo-icon {
      color: var(--p-emerald-500);
      font-size: 13px;
      margin-top: 1px;
      flex-shrink: 0;
    }

    .ir__hallazgo-text {
      flex: 1;
      font-size: 13px;
      color: var(--p-surface-700);
      line-height: 1.4;
    }

    .ir__hallazgo-remove {
      background: none;
      border: none;
      color: var(--p-surface-400);
      cursor: pointer;
      padding: 2px 4px;
      border-radius: 4px;
      font-size: 11px;
      flex-shrink: 0;
      transition: color 0.15s;
    }

    .ir__hallazgo-remove:hover {
      color: var(--p-red-400);
    }

    .ir__input-row {
      display: flex;
      gap: 8px;
    }

    .ir__input {
      flex: 1;
      padding: 8px 10px;
      border: 1px solid var(--p-surface-300);
      border-radius: 8px;
      font-size: 13px;
      background: white;
      color: var(--p-surface-800);
      outline: none;
      transition: border-color 0.15s;
    }

    .ir__input:focus {
      border-color: var(--p-emerald-400);
    }

    /* ─── Empty states ──────────────────────────────────────────────── */
    .ir__metodos-empty {
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

    .ir__metodos-empty i {
      font-size: 28px;
      opacity: 0.4;
    }

    /* ─── Responsive ────────────────────────────────────────────────── */
    @media (max-width: 640px) {
      .ir__context-grid {
        grid-template-columns: 1fr;
      }
      .ir__metodo-row {
        grid-template-columns: 1fr;
      }
      .ir__metodo-tipo-badge {
        display: none;
      }
    }
  `],
})
export class InvestigacionRemotaToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly investigacionRemotaService = inject(InvestigacionRemotaService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<InvestigacionRemotaData>({ ...EMPTY_INVESTIGACION_REMOTA });
  reports = signal<InvestigacionRemotaReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);
  newHallazgo = signal<Record<number, string>>({});

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly metodoOptions = Object.entries(METODO_LABELS).map(([value, label]) => ({
    value: value as MetodoRemotoTipo,
    label,
  }));

  canGenerate = computed(() =>
    this.data().metodos.some(m => m.hallazgos.length > 0)
  );

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;

    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as InvestigacionRemotaData | undefined;
    const storedReports = (raw['reports'] as InvestigacionRemotaReportVersionDto[]) ?? [];

    this.data.set(stored ?? { ...EMPTY_INVESTIGACION_REMOTA });
    this.reports.set(storedReports);
  }

  toggleReport(): void {
    this.showReport.set(!this.showReport());
  }

  // ─── Field updates ──────────────────────────────────────────────────────────

  updateField(field: keyof InvestigacionRemotaData, value: unknown): void {
    this.data.set({ ...this.data(), [field]: value });
    this.scheduleSave();
  }

  // ─── Métodos ────────────────────────────────────────────────────────────────

  addMetodo(): void {
    this.data.set({ ...this.data(), metodos: [...this.data().metodos, EMPTY_METODO()] });
    this.scheduleSave();
  }

  removeMetodo(index: number): void {
    const metodos = this.data().metodos.filter((_, i) => i !== index);
    this.data.set({ ...this.data(), metodos });
    const nh = { ...this.newHallazgo() };
    delete nh[index];
    this.newHallazgo.set(nh);
    this.scheduleSave();
  }

  updateMetodo(index: number, field: keyof MetodoRemotoDto, value: unknown): void {
    const metodos = this.data().metodos.map((m, i) =>
      i === index ? { ...m, [field]: value } : m
    );
    this.data.set({ ...this.data(), metodos });
    this.scheduleSave();
  }

  // ─── Hallazgos ──────────────────────────────────────────────────────────────

  setNewHallazgo(metodoIndex: number, value: string): void {
    this.newHallazgo.set({ ...this.newHallazgo(), [metodoIndex]: value });
  }

  addHallazgo(metodoIndex: number): void {
    const text = this.newHallazgo()[metodoIndex]?.trim();
    if (!text) return;

    const metodos = this.data().metodos.map((m, i) =>
      i === metodoIndex ? { ...m, hallazgos: [...m.hallazgos, text] } : m
    );
    this.data.set({ ...this.data(), metodos });

    const nh = { ...this.newHallazgo() };
    nh[metodoIndex] = '';
    this.newHallazgo.set(nh);
    this.scheduleSave();
  }

  removeHallazgo(metodoIndex: number, hallazgoIndex: number): void {
    const metodos = this.data().metodos.map((m, i) =>
      i === metodoIndex
        ? { ...m, hallazgos: m.hallazgos.filter((_, hi) => hi !== hallazgoIndex) }
        : m
    );
    this.data.set({ ...this.data(), metodos });
    this.scheduleSave();
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  hasHallazgos(m: MetodoRemotoDto): boolean {
    return m.hallazgos.length > 0;
  }

  getMetodoLabel(tipo: MetodoRemotoTipo): string {
    return METODO_LABELS[tipo] ?? tipo;
  }

  getMetodoIcon(tipo: MetodoRemotoTipo): string {
    return METODO_ICONS[tipo] ?? 'pi-wrench';
  }

  // ─── AI analysis ────────────────────────────────────────────────────────────

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;

    this.analyzing.set(true);
    try {
      const result = await this.investigacionRemotaService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });

      const newVersion: InvestigacionRemotaReportVersionDto = {
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

  private async persistData(reports: InvestigacionRemotaReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
