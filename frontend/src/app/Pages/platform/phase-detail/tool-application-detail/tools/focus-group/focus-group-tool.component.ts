import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { FocusGroupService } from '@core/services/focusGroupService/focus-group.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { FocusGroupReportComponent } from './focus-group-report.component';
import {
  EMPTY_FOCUS_GROUP,
  FocusGroupData,
  FocusGroupPreguntaDto,
  FocusGroupReportVersionDto,
} from './focus-group.types';

const FASES = ['Icebreaker', 'Warm-up', 'Principal', 'Síntesis'];

@Component({
  selector: 'app-focus-group-tool',
  standalone: true,
  imports: [FormsModule, FocusGroupReportComponent],
  template: `
    <div class="fg">

      <!-- Header -->
      <div class="fg__header">
        <div class="fg__header-left">
          <div class="fg__badge">
            <i class="pi pi-users"></i>
          </div>
          <div class="fg__title-block">
            <span class="fg__title">Focus Group</span>
            <span class="fg__subtitle">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              } @else {
                {{ filledCount() }}/{{ data().preguntas.length }} preguntas con respuesta
              }
            </span>
          </div>
        </div>
        <div class="fg__header-actions">
          <button
            class="fg__btn fg__btn--ghost"
            (click)="toggleReport()"
            [class.fg__btn--active]="showReport()"
          >
            <i class="pi pi-chart-bar"></i>
            Informes {{ reports().length ? '(' + reports().length + ')' : '' }}
          </button>
          <button
            class="fg__btn fg__btn--primary"
            (click)="generateReport()"
            [disabled]="!canGenerate() || analyzing()"
            [title]="!canGenerate() ? 'Completá al menos 2 respuestas grupales para analizar' : 'Generar análisis con IA'"
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
      <div class="fg__content">
        @if (showReport()) {
          <app-focus-group-report [reports]="reports()" />
        } @else {
          <div class="fg__body">

            <!-- Configuración del grupo -->
            <div class="fg__section">
              <div class="fg__section-header">
                <i class="pi pi-cog fg__section-icon"></i>
                <span class="fg__section-title">Configuración del Grupo</span>
              </div>
              <div class="fg__config-grid">
                <div class="fg__field fg__field--full">
                  <label class="fg__field-label">Objetivo de la Sesión</label>
                  <textarea
                    class="fg__field-textarea"
                    placeholder="¿Qué queremos aprender? ¿Qué hipótesis queremos explorar con el grupo?"
                    [ngModel]="data().objetivo"
                    (ngModelChange)="updateField('objetivo', $event)"
                    rows="3"
                  ></textarea>
                </div>
                <div class="fg__field fg__field--full">
                  <label class="fg__field-label">Perfil de los Participantes</label>
                  <input
                    class="fg__field-input"
                    type="text"
                    placeholder="Ej: Madres de 25-40 años, usuarios activos de apps de bienestar..."
                    [ngModel]="data().perfilParticipantes"
                    (ngModelChange)="updateField('perfilParticipantes', $event)"
                  />
                </div>
                <div class="fg__field">
                  <label class="fg__field-label">Cantidad de Participantes</label>
                  <input
                    class="fg__field-input"
                    type="text"
                    placeholder="Ej: 8 (recomendado 6-10)"
                    [ngModel]="data().cantidadParticipantes"
                    (ngModelChange)="updateField('cantidadParticipantes', $event)"
                  />
                </div>
                <div class="fg__field">
                  <label class="fg__field-label">Fecha</label>
                  <input
                    class="fg__field-input"
                    type="text"
                    placeholder="Ej: 15/03/2025"
                    [ngModel]="data().fecha"
                    (ngModelChange)="updateField('fecha', $event)"
                  />
                </div>
                <div class="fg__field">
                  <label class="fg__field-label">Ubicación</label>
                  <input
                    class="fg__field-input"
                    type="text"
                    placeholder="Ej: Presencial / Zoom / Remo"
                    [ngModel]="data().ubicacion"
                    (ngModelChange)="updateField('ubicacion', $event)"
                  />
                </div>
              </div>
            </div>

            <!-- Guía de discusión -->
            <div class="fg__section fg__section--qa">
              <div class="fg__section-header">
                <i class="pi pi-comments fg__section-icon"></i>
                <span class="fg__section-title">Guía de Discusión</span>
                @if (data().preguntas.length) {
                  <span class="fg__count">{{ data().preguntas.length }}</span>
                }
                <span class="fg__hint">Mínimo 2 con respuesta grupal para analizar</span>
                <button class="fg__btn-add" (click)="addPregunta()" title="Agregar pregunta">
                  <i class="pi pi-plus"></i>
                  Agregar pregunta
                </button>
              </div>

              @for (p of data().preguntas; track p.id; let i = $index) {
                <div class="fg__qa-item" [class.fg__qa-item--filled]="p.respuestasGrupales.trim()">
                  <div class="fg__qa-num">{{ i + 1 }}</div>
                  <div class="fg__qa-fields">
                    <div class="fg__qa-top-row">
                      <select
                        class="fg__qa-fase"
                        [ngModel]="p.fase"
                        (ngModelChange)="updatePregunta(i, 'fase', $event)"
                      >
                        @for (f of fases; track f) {
                          <option [value]="f">{{ f }}</option>
                        }
                      </select>
                      <input
                        class="fg__qa-pregunta"
                        type="text"
                        placeholder="Escribí la pregunta que planteaste al grupo..."
                        [ngModel]="p.pregunta"
                        (ngModelChange)="updatePregunta(i, 'pregunta', $event)"
                      />
                      <button class="fg__qa-remove" (click)="removePregunta(i)" title="Eliminar">
                        <i class="pi pi-trash"></i>
                      </button>
                    </div>
                    <textarea
                      class="fg__qa-respuesta"
                      placeholder="¿Qué respondió el grupo? Anotá las ideas, debates, consensos y disensos..."
                      [ngModel]="p.respuestasGrupales"
                      (ngModelChange)="updatePregunta(i, 'respuestasGrupales', $event)"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              }

              @if (data().preguntas.length === 0) {
                <div class="fg__qa-empty">
                  <i class="pi pi-plus-circle"></i>
                  <span>Agregá la primera pregunta para empezar a documentar la sesión</span>
                </div>
              }
            </div>

            <!-- Síntesis -->
            <div class="fg__section">
              <div class="fg__section-header">
                <i class="pi pi-align-left fg__section-icon"></i>
                <span class="fg__section-title">Síntesis</span>
              </div>

              <!-- Dinámicas grupales -->
              <div class="fg__field">
                <label class="fg__field-label">
                  <i class="pi pi-share-alt"></i>
                  Dinámicas Grupales
                </label>
                <textarea
                  class="fg__field-textarea"
                  placeholder="¿Quién influyó en quién? ¿Hubo consensos o disensos fuertes? ¿Quién lideró la conversación? ¿Qué sorprendió del grupo?"
                  [ngModel]="data().dinamicasGrupales"
                  (ngModelChange)="updateField('dinamicasGrupales', $event)"
                  rows="4"
                ></textarea>
              </div>

              <!-- Citas clave -->
              <div class="fg__field">
                <label class="fg__field-label">
                  <i class="pi pi-quote-right"></i>
                  Citas Clave
                  @if (data().citasClave.length) {
                    <span class="fg__count fg__count--small">{{ data().citasClave.length }}</span>
                  }
                </label>
                <div class="fg__quotes-list">
                  @for (c of data().citasClave; track $index; let i = $index) {
                    <div class="fg__quote-item">
                      <i class="pi pi-quote-left fg__quote-icon"></i>
                      <span class="fg__quote-text">{{ c }}</span>
                      <button class="fg__quote-remove" (click)="removeCita(i)">
                        <i class="pi pi-times"></i>
                      </button>
                    </div>
                  }
                </div>
                <div class="fg__input-row">
                  <input
                    class="fg__input"
                    type="text"
                    placeholder='Ej: "En el grupo nadie quería admitir que pagaba menos, pero todos lo hacían..."'
                    [ngModel]="newCita()"
                    (ngModelChange)="newCita.set($event)"
                    (keydown.enter)="addCita()"
                  />
                  <button
                    class="fg__add-btn"
                    (click)="addCita()"
                    [disabled]="!newCita().trim()"
                  >
                    <i class="pi pi-plus"></i>
                  </button>
                </div>
              </div>

              <!-- Observaciones -->
              <div class="fg__field">
                <label class="fg__field-label">Observaciones Generales</label>
                <textarea
                  class="fg__field-textarea"
                  placeholder="Clima general de la sesión, comportamientos no verbales, lo que no se dijo pero se sintió, si algún estímulo cambió la conversación..."
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
    .fg {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 12px;
    }

    /* ─── Header ───────────────────────────────────────────────────── */
    .fg__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-shrink: 0;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--p-surface-200);
    }

    .fg__header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .fg__badge {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #ede9fe;
      color: #7c3aed;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      flex-shrink: 0;
    }

    .fg__title-block {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .fg__title {
      font-family: 'Syne', sans-serif;
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--p-text-color);
      line-height: 1.2;
    }

    .fg__subtitle {
      font-size: 0.72rem;
      color: var(--p-text-muted-color);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .fg__header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* ─── Buttons ──────────────────────────────────────────────────── */
    .fg__btn {
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

    .fg__btn .pi { font-size: 0.8rem; }
    .fg__btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .fg__btn--ghost {
      background: transparent;
      border-color: var(--p-surface-300);
      color: var(--p-text-secondary-color);
    }

    .fg__btn--ghost:hover:not(:disabled) { background: var(--p-surface-100); }
    .fg__btn--ghost.fg__btn--active { background: #f5f3ff; border-color: #ddd6fe; color: #7c3aed; }

    .fg__btn--primary {
      background: #7c3aed;
      color: white;
      border-color: #7c3aed;
    }

    .fg__btn--primary:hover:not(:disabled) { background: #6d28d9; }

    .fg__btn-add {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 12px;
      border-radius: 8px;
      border: 1px solid #ddd6fe;
      background: #f5f3ff;
      color: #7c3aed;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      margin-left: auto;
    }

    .fg__btn-add .pi { font-size: 0.7rem; }
    .fg__btn-add:hover { background: #ede9fe; }

    /* ─── Content ──────────────────────────────────────────────────── */
    .fg__content {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
    }

    .fg__body {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding-bottom: 20px;
    }

    /* ─── Section ──────────────────────────────────────────────────── */
    .fg__section {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .fg__section--qa {
      background: var(--p-surface-50);
      border-radius: 12px;
      padding: 14px;
      border: 1px solid var(--p-surface-200);
    }

    .fg__section-header {
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

    .fg__section-icon { color: #7c3aed; font-size: 0.8rem; }

    .fg__section-title { flex: none; }

    .fg__count {
      background: #7c3aed;
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 10px;
      line-height: 1.6;
    }

    .fg__count--small {
      font-size: 0.63rem;
      padding: 0px 5px;
      border-radius: 8px;
      margin-left: 4px;
      vertical-align: middle;
    }

    .fg__hint {
      font-size: 0.67rem;
      color: var(--p-text-muted-color);
      font-family: inherit;
      text-transform: none;
      letter-spacing: 0;
      font-weight: 400;
    }

    /* ─── Config grid ──────────────────────────────────────────────── */
    .fg__config-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
    }

    .fg__field--full {
      grid-column: 1 / -1;
    }

    /* ─── Fields ───────────────────────────────────────────────────── */
    .fg__field {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .fg__field-label {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--p-text-muted-color);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .fg__field-label .pi { font-size: 0.68rem; color: #7c3aed; }

    .fg__field-input {
      width: 100%;
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid var(--p-surface-300);
      font-size: 0.875rem;
      background: var(--p-surface-0);
      color: var(--p-text-color);
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
      box-sizing: border-box;
    }

    .fg__field-input::placeholder { color: #9ca3af; }
    .fg__field-input:focus { border-color: #7c3aed; box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.15); }

    .fg__field-textarea {
      width: 100%;
      padding: 8px 12px;
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

    .fg__field-textarea::placeholder { color: #9ca3af; }
    .fg__field-textarea:focus { border-color: #7c3aed; box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.15); }

    /* ─── Q&A ──────────────────────────────────────────────────────── */
    .fg__qa-item {
      background: var(--p-surface-0);
      border-radius: 10px;
      border: 1px solid var(--p-surface-200);
      border-left: 3px solid #ddd6fe;
      padding: 10px 12px;
      display: flex;
      gap: 10px;
      transition: border-left-color 0.2s;
    }

    .fg__qa-item--filled { border-left-color: #7c3aed; }

    .fg__qa-num {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #ede9fe;
      color: #7c3aed;
      font-size: 0.68rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 2px;
      font-family: 'Syne', sans-serif;
    }

    .fg__qa-fields {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .fg__qa-top-row {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .fg__qa-fase {
      padding: 5px 8px;
      border-radius: 7px;
      border: 1px solid var(--p-surface-200);
      font-size: 0.72rem;
      font-weight: 600;
      background: #f5f3ff;
      color: #7c3aed;
      outline: none;
      cursor: pointer;
      flex-shrink: 0;
      transition: border-color 0.15s;
    }

    .fg__qa-fase:focus { border-color: #7c3aed; }

    .fg__qa-pregunta {
      flex: 1;
      padding: 6px 10px;
      border-radius: 7px;
      border: 1px solid var(--p-surface-200);
      font-size: 0.82rem;
      font-weight: 600;
      background: var(--p-surface-50);
      color: var(--p-text-color);
      outline: none;
      transition: border-color 0.15s;
    }

    .fg__qa-pregunta::placeholder { color: #9ca3af; font-weight: 400; }
    .fg__qa-pregunta:focus { border-color: #7c3aed; }

    .fg__qa-remove {
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

    .fg__qa-remove:hover { color: #ef4444; background: #fef2f2; }

    .fg__qa-respuesta {
      width: 100%;
      padding: 6px 10px;
      border-radius: 7px;
      border: 1px solid var(--p-surface-200);
      font-size: 0.8rem;
      background: var(--p-surface-0);
      color: var(--p-text-color);
      outline: none;
      resize: vertical;
      font-family: inherit;
      line-height: 1.5;
      box-sizing: border-box;
      transition: border-color 0.15s;
    }

    .fg__qa-respuesta::placeholder { color: #9ca3af; }
    .fg__qa-respuesta:focus { border-color: #7c3aed; }

    .fg__qa-empty {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      border: 1px dashed #ddd6fe;
      border-radius: 8px;
      color: #7c3aed;
      font-size: 0.8rem;
    }

    .fg__qa-empty .pi { font-size: 1rem; }

    /* ─── Quotes ───────────────────────────────────────────────────── */
    .fg__quotes-list {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .fg__quote-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 8px 12px;
      background: #f5f3ff;
      border: 1px solid #ddd6fe;
      border-radius: 8px;
      font-size: 0.82rem;
      color: #4c1d95;
      font-style: italic;
      line-height: 1.5;
    }

    .fg__quote-icon { color: #7c3aed; font-size: 0.72rem; flex-shrink: 0; margin-top: 3px; }
    .fg__quote-text { flex: 1; }

    .fg__quote-remove {
      background: none;
      border: none;
      cursor: pointer;
      color: #a78bfa;
      font-size: 0.65rem;
      padding: 2px;
      flex-shrink: 0;
      transition: color 0.15s;
      line-height: 1;
      margin-top: 2px;
    }

    .fg__quote-remove:hover { color: #ef4444; }

    /* ─── Input row ────────────────────────────────────────────────── */
    .fg__input-row {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .fg__input {
      flex: 1;
      padding: 6px 10px;
      border-radius: 8px;
      border: 1px solid var(--p-surface-300);
      font-size: 0.8rem;
      background: var(--p-surface-0);
      color: var(--p-text-color);
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
      font-style: italic;
    }

    .fg__input::placeholder { color: #9ca3af; }
    .fg__input:focus { border-color: #7c3aed; box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.15); }

    .fg__add-btn {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      border: none;
      background: #7c3aed;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: filter 0.15s;
      font-size: 0.75rem;
    }

    .fg__add-btn:hover:not(:disabled) { filter: brightness(0.9); }
    .fg__add-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  `],
})
export class FocusGroupToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly focusGroupService = inject(FocusGroupService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  // ─── Estado ─────────────────────────────────────────────────────────────────
  data = signal<FocusGroupData>({ ...EMPTY_FOCUS_GROUP });
  reports = signal<FocusGroupReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  newCita = signal('');

  readonly fases = FASES;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // ─── Computed ────────────────────────────────────────────────────────────────
  filledCount = computed(() => this.data().preguntas.filter(p => p.respuestasGrupales.trim()).length);
  canGenerate = computed(() => this.filledCount() >= 2);

  // ─── Lifecycle ───────────────────────────────────────────────────────────────
  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;

    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const storedData = raw['data'] as FocusGroupData | undefined;
    const storedReports = (raw['reports'] as FocusGroupReportVersionDto[]) ?? [];

    this.data.set(storedData ? { ...EMPTY_FOCUS_GROUP, ...storedData } : { ...EMPTY_FOCUS_GROUP });
    this.reports.set(storedReports);
  }

  // ─── Context fields ──────────────────────────────────────────────────────────
  updateField(field: keyof Omit<FocusGroupData, 'preguntas' | 'citasClave'>, value: string): void {
    this.data.set({ ...this.data(), [field]: value });
    this.scheduleSave();
  }

  // ─── Preguntas ───────────────────────────────────────────────────────────────
  addPregunta(): void {
    const nueva: FocusGroupPreguntaDto = {
      id: crypto.randomUUID(),
      fase: 'Principal',
      pregunta: '',
      respuestasGrupales: '',
    };
    this.data.set({ ...this.data(), preguntas: [...this.data().preguntas, nueva] });
    this.scheduleSave();
  }

  removePregunta(index: number): void {
    const arr = [...this.data().preguntas];
    arr.splice(index, 1);
    this.data.set({ ...this.data(), preguntas: arr });
    this.scheduleSave();
  }

  updatePregunta(index: number, field: 'fase' | 'pregunta' | 'respuestasGrupales', value: string): void {
    const arr = this.data().preguntas.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    );
    this.data.set({ ...this.data(), preguntas: arr });
    this.scheduleSave();
  }

  // ─── Citas clave ─────────────────────────────────────────────────────────────
  addCita(): void {
    const trimmed = this.newCita().trim();
    if (!trimmed) return;
    this.data.set({ ...this.data(), citasClave: [...this.data().citasClave, trimmed] });
    this.newCita.set('');
    this.scheduleSave();
  }

  removeCita(index: number): void {
    const arr = [...this.data().citasClave];
    arr.splice(index, 1);
    this.data.set({ ...this.data(), citasClave: arr });
    this.scheduleSave();
  }

  toggleReport(): void {
    this.showReport.set(!this.showReport());
  }

  // ─── Generate report ─────────────────────────────────────────────────────────
  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;

    this.analyzing.set(true);
    try {
      const result = await this.focusGroupService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });

      const newVersion: FocusGroupReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };

      const updatedReports = [newVersion, ...this.reports()];
      this.reports.set(updatedReports);

      await this.persistData(updatedReports);
      this.showReport.set(true);
      this.uiDialog.showSuccess('Análisis generado', 'El análisis del focus group fue generado y guardado correctamente.');
    } catch (error) {
      this.uiDialog.showError('Error', `No se pudo generar el análisis: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      this.analyzing.set(false);
    }
  }

  // ─── Helpers privados ────────────────────────────────────────────────────────
  private scheduleSave(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.saveData(), 800);
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

  private async persistData(reports: FocusGroupReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;

    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
