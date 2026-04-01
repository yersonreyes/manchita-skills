import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { EntrevistaCualitativaService } from '@core/services/entrevistaCualitativaService/entrevista-cualitativa.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { EntrevistaCualitativaReportComponent } from './entrevista-cualitativa-report.component';
import {
  EMPTY_ENTREVISTA_CUALITATIVA,
  EntrevistaCualitativaData,
  EntrevistaCualitativaRespuesta,
  EntrevistaCualitativaReportVersionDto,
} from './entrevista-cualitativa.types';

@Component({
  selector: 'app-entrevista-cualitativa-tool',
  standalone: true,
  imports: [FormsModule, EntrevistaCualitativaReportComponent],
  template: `
    <div class="eq">

      <!-- Header -->
      <div class="eq__header">
        <div class="eq__header-left">
          <div class="eq__badge">
            <i class="pi pi-microphone"></i>
          </div>
          <div class="eq__title-block">
            <span class="eq__title">Entrevista Cualitativa</span>
            <span class="eq__subtitle">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              } @else {
                {{ filledCount() }}/{{ data().respuestas.length }} respuestas completadas
              }
            </span>
          </div>
        </div>
        <div class="eq__header-actions">
          <button
            class="eq__btn eq__btn--ghost"
            (click)="toggleReport()"
            [class.eq__btn--active]="showReport()"
          >
            <i class="pi pi-chart-bar"></i>
            Informes {{ reports().length ? '(' + reports().length + ')' : '' }}
          </button>
          <button
            class="eq__btn eq__btn--primary"
            (click)="generateReport()"
            [disabled]="!canGenerate() || analyzing()"
            [title]="!canGenerate() ? 'Completá al menos 2 respuestas para analizar' : 'Generar análisis con IA'"
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
      <div class="eq__content">
        @if (showReport()) {
          <app-entrevista-cualitativa-report [reports]="reports()" />
        } @else {
          <div class="eq__body">

            <!-- Contexto de la entrevista -->
            <div class="eq__section">
              <div class="eq__section-header">
                <i class="pi pi-user eq__section-icon"></i>
                <span class="eq__section-title">Contexto de la Entrevista</span>
              </div>
              <div class="eq__context-grid">
                <div class="eq__field">
                  <label class="eq__field-label">Nombre / Alias del Entrevistado</label>
                  <input
                    class="eq__field-input"
                    type="text"
                    placeholder="Ej: Usuario 01, María G...."
                    [ngModel]="data().entrevistado"
                    (ngModelChange)="updateField('entrevistado', $event)"
                  />
                </div>
                <div class="eq__field">
                  <label class="eq__field-label">Perfil / Rol</label>
                  <input
                    class="eq__field-input"
                    type="text"
                    placeholder="Ej: Madre de 35 años, emprendedora tech..."
                    [ngModel]="data().perfil"
                    (ngModelChange)="updateField('perfil', $event)"
                  />
                </div>
                <div class="eq__field">
                  <label class="eq__field-label">Fecha</label>
                  <input
                    class="eq__field-input"
                    type="text"
                    placeholder="Ej: 15/03/2025"
                    [ngModel]="data().fecha"
                    (ngModelChange)="updateField('fecha', $event)"
                  />
                </div>
              </div>
              <div class="eq__field">
                <label class="eq__field-label">Objetivos de la Entrevista</label>
                <textarea
                  class="eq__field-textarea"
                  placeholder="¿Qué queremos aprender con esta entrevista? ¿Qué hipótesis queremos validar o explorar?"
                  [ngModel]="data().objetivos"
                  (ngModelChange)="updateField('objetivos', $event)"
                  rows="3"
                ></textarea>
              </div>
            </div>

            <!-- Preguntas y respuestas -->
            <div class="eq__section eq__section--qa">
              <div class="eq__section-header">
                <i class="pi pi-comments eq__section-icon"></i>
                <span class="eq__section-title">Preguntas y Respuestas</span>
                @if (data().respuestas.length) {
                  <span class="eq__count">{{ data().respuestas.length }}</span>
                }
                <span class="eq__hint">Mínimo 2 con respuesta para analizar</span>
                <button class="eq__btn-add-qa" (click)="addRespuesta()" title="Agregar pregunta">
                  <i class="pi pi-plus"></i>
                  Agregar pregunta
                </button>
              </div>

              @for (r of data().respuestas; track r.id; let i = $index) {
                <div class="eq__qa-item" [class.eq__qa-item--filled]="r.respuesta.trim()">
                  <div class="eq__qa-num">{{ i + 1 }}</div>
                  <div class="eq__qa-fields">
                    <div class="eq__qa-pregunta-row">
                      <input
                        class="eq__qa-pregunta"
                        type="text"
                        placeholder="Escribí la pregunta que hiciste..."
                        [ngModel]="r.pregunta"
                        (ngModelChange)="updateRespuesta(i, 'pregunta', $event)"
                      />
                      <button class="eq__qa-remove" (click)="removeRespuesta(i)" title="Eliminar">
                        <i class="pi pi-trash"></i>
                      </button>
                    </div>
                    <textarea
                      class="eq__qa-respuesta"
                      placeholder="¿Qué respondió el entrevistado? Anotá con sus propias palabras..."
                      [ngModel]="r.respuesta"
                      (ngModelChange)="updateRespuesta(i, 'respuesta', $event)"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              }

              @if (data().respuestas.length === 0) {
                <div class="eq__qa-empty">
                  <i class="pi pi-plus-circle"></i>
                  <span>Agregá la primera pregunta para empezar a registrar la entrevista</span>
                </div>
              }
            </div>

            <!-- Síntesis -->
            <div class="eq__section">
              <div class="eq__section-header">
                <i class="pi pi-align-left eq__section-icon"></i>
                <span class="eq__section-title">Síntesis</span>
              </div>

              <!-- Citas clave -->
              <div class="eq__field">
                <label class="eq__field-label">
                  <i class="pi pi-quote-right"></i>
                  Citas Clave
                  @if (data().citasClave.length) {
                    <span class="eq__count eq__count--small">{{ data().citasClave.length }}</span>
                  }
                </label>
                <div class="eq__quotes-list">
                  @for (c of data().citasClave; track $index; let i = $index) {
                    <div class="eq__quote-item">
                      <i class="pi pi-quote-left eq__quote-icon"></i>
                      <span class="eq__quote-text">{{ c }}</span>
                      <button class="eq__quote-remove" (click)="removeCita(i)">
                        <i class="pi pi-times"></i>
                      </button>
                    </div>
                  }
                </div>
                <div class="eq__input-row">
                  <input
                    class="eq__input"
                    type="text"
                    placeholder='Ej: "Nunca sé cuánto tiempo me va a llevar, eso me genera ansiedad..."'
                    [ngModel]="newCita()"
                    (ngModelChange)="newCita.set($event)"
                    (keydown.enter)="addCita()"
                  />
                  <button
                    class="eq__add-btn"
                    (click)="addCita()"
                    [disabled]="!newCita().trim()"
                  >
                    <i class="pi pi-plus"></i>
                  </button>
                </div>
              </div>

              <!-- Observaciones -->
              <div class="eq__field">
                <label class="eq__field-label">Observaciones Generales</label>
                <textarea
                  class="eq__field-textarea"
                  placeholder="Comportamiento no verbal, clima de la entrevista, contradicciones, lo que no se dijo pero se sintió..."
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
    .eq {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 12px;
    }

    /* ─── Header ───────────────────────────────────────────────────── */
    .eq__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-shrink: 0;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--p-surface-200);
    }

    .eq__header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .eq__badge {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #ffedd5;
      color: #ea580c;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      flex-shrink: 0;
    }

    .eq__title-block {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .eq__title {
      font-family: 'Syne', sans-serif;
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--p-text-color);
      line-height: 1.2;
    }

    .eq__subtitle {
      font-size: 0.72rem;
      color: var(--p-text-muted-color);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .eq__header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* ─── Buttons ──────────────────────────────────────────────────── */
    .eq__btn {
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

    .eq__btn .pi { font-size: 0.8rem; }
    .eq__btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .eq__btn--ghost {
      background: transparent;
      border-color: var(--p-surface-300);
      color: var(--p-text-secondary-color);
    }

    .eq__btn--ghost:hover:not(:disabled) { background: var(--p-surface-100); }
    .eq__btn--ghost.eq__btn--active { background: #fff7ed; border-color: #fed7aa; color: #ea580c; }

    .eq__btn--primary {
      background: #ea580c;
      color: white;
      border-color: #ea580c;
    }

    .eq__btn--primary:hover:not(:disabled) { background: #c2410c; }

    .eq__btn-add-qa {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 12px;
      border-radius: 8px;
      border: 1px solid #fed7aa;
      background: #fff7ed;
      color: #ea580c;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      margin-left: auto;
    }

    .eq__btn-add-qa .pi { font-size: 0.7rem; }
    .eq__btn-add-qa:hover { background: #ffedd5; }

    /* ─── Content ──────────────────────────────────────────────────── */
    .eq__content {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
    }

    .eq__body {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding-bottom: 20px;
    }

    /* ─── Section ──────────────────────────────────────────────────── */
    .eq__section {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .eq__section--qa {
      background: var(--p-surface-50);
      border-radius: 12px;
      padding: 14px;
      border: 1px solid var(--p-surface-200);
    }

    .eq__section-header {
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

    .eq__section-icon { color: #ea580c; font-size: 0.8rem; }

    .eq__count {
      background: #ea580c;
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 10px;
      line-height: 1.6;
    }

    .eq__count--small {
      font-size: 0.63rem;
      padding: 0px 5px;
      border-radius: 8px;
      margin-left: 4px;
      vertical-align: middle;
    }

    .eq__hint {
      font-size: 0.67rem;
      color: var(--p-text-muted-color);
      font-family: inherit;
      text-transform: none;
      letter-spacing: 0;
      font-weight: 400;
    }

    /* ─── Context grid ─────────────────────────────────────────────── */
    .eq__context-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 140px;
      gap: 10px;
    }

    /* ─── Fields ───────────────────────────────────────────────────── */
    .eq__field {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .eq__field-label {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--p-text-muted-color);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .eq__field-label .pi { font-size: 0.68rem; color: #ea580c; }

    .eq__field-input {
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

    .eq__field-input::placeholder { color: #9ca3af; }
    .eq__field-input:focus { border-color: #ea580c; box-shadow: 0 0 0 2px rgba(234, 88, 12, 0.15); }

    .eq__field-textarea {
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

    .eq__field-textarea::placeholder { color: #9ca3af; }
    .eq__field-textarea:focus { border-color: #ea580c; box-shadow: 0 0 0 2px rgba(234, 88, 12, 0.15); }

    /* ─── Q&A ──────────────────────────────────────────────────────── */
    .eq__qa-item {
      background: var(--p-surface-0);
      border-radius: 10px;
      border: 1px solid var(--p-surface-200);
      border-left: 3px solid #fed7aa;
      padding: 10px 12px;
      display: flex;
      gap: 10px;
      transition: border-left-color 0.2s;
    }

    .eq__qa-item--filled { border-left-color: #ea580c; }

    .eq__qa-num {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #ffedd5;
      color: #ea580c;
      font-size: 0.68rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 2px;
      font-family: 'Syne', sans-serif;
    }

    .eq__qa-fields {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .eq__qa-pregunta-row {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .eq__qa-pregunta {
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

    .eq__qa-pregunta::placeholder { color: #9ca3af; font-weight: 400; }
    .eq__qa-pregunta:focus { border-color: #ea580c; }

    .eq__qa-remove {
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

    .eq__qa-remove:hover { color: #ef4444; background: #fef2f2; }

    .eq__qa-respuesta {
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

    .eq__qa-respuesta::placeholder { color: #9ca3af; }
    .eq__qa-respuesta:focus { border-color: #ea580c; }

    .eq__qa-empty {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      border: 1px dashed #fed7aa;
      border-radius: 8px;
      color: #f97316;
      font-size: 0.8rem;
    }

    .eq__qa-empty .pi { font-size: 1rem; }

    /* ─── Quotes ───────────────────────────────────────────────────── */
    .eq__quotes-list {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .eq__quote-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 8px 12px;
      background: #fff7ed;
      border: 1px solid #fed7aa;
      border-radius: 8px;
      font-size: 0.82rem;
      color: #7c2d12;
      font-style: italic;
      line-height: 1.5;
    }

    .eq__quote-icon { color: #ea580c; font-size: 0.72rem; flex-shrink: 0; margin-top: 3px; }
    .eq__quote-text { flex: 1; }

    .eq__quote-remove {
      background: none;
      border: none;
      cursor: pointer;
      color: #fca07a;
      font-size: 0.65rem;
      padding: 2px;
      flex-shrink: 0;
      transition: color 0.15s;
      line-height: 1;
      margin-top: 2px;
    }

    .eq__quote-remove:hover { color: #ef4444; }

    /* ─── Input row ────────────────────────────────────────────────── */
    .eq__input-row {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .eq__input {
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

    .eq__input::placeholder { color: #9ca3af; }
    .eq__input:focus { border-color: #ea580c; box-shadow: 0 0 0 2px rgba(234, 88, 12, 0.15); }

    .eq__add-btn {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      border: none;
      background: #ea580c;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: filter 0.15s;
      font-size: 0.75rem;
    }

    .eq__add-btn:hover:not(:disabled) { filter: brightness(0.9); }
    .eq__add-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  `],
})
export class EntrevistaCualitativaToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly entrevistaService = inject(EntrevistaCualitativaService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  // ─── Estado ─────────────────────────────────────────────────────────────────
  data = signal<EntrevistaCualitativaData>({ ...EMPTY_ENTREVISTA_CUALITATIVA });
  reports = signal<EntrevistaCualitativaReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  newCita = signal('');

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // ─── Computed ────────────────────────────────────────────────────────────────
  filledCount = computed(() => this.data().respuestas.filter(r => r.respuesta.trim()).length);
  canGenerate = computed(() => this.filledCount() >= 2);

  // ─── Lifecycle ───────────────────────────────────────────────────────────────
  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;

    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const storedData = raw['data'] as EntrevistaCualitativaData | undefined;
    const storedReports = (raw['reports'] as EntrevistaCualitativaReportVersionDto[]) ?? [];

    this.data.set(storedData ? { ...EMPTY_ENTREVISTA_CUALITATIVA, ...storedData } : { ...EMPTY_ENTREVISTA_CUALITATIVA });
    this.reports.set(storedReports);
  }

  // ─── Context fields ──────────────────────────────────────────────────────────
  updateField(field: 'entrevistado' | 'perfil' | 'fecha' | 'objetivos' | 'observaciones', value: string): void {
    this.data.set({ ...this.data(), [field]: value });
    this.scheduleSave();
  }

  // ─── Respuestas ──────────────────────────────────────────────────────────────
  addRespuesta(): void {
    const nueva: EntrevistaCualitativaRespuesta = {
      id: crypto.randomUUID(),
      pregunta: '',
      respuesta: '',
    };
    this.data.set({ ...this.data(), respuestas: [...this.data().respuestas, nueva] });
    this.scheduleSave();
  }

  removeRespuesta(index: number): void {
    const arr = [...this.data().respuestas];
    arr.splice(index, 1);
    this.data.set({ ...this.data(), respuestas: arr });
    this.scheduleSave();
  }

  updateRespuesta(index: number, field: 'pregunta' | 'respuesta', value: string): void {
    const arr = this.data().respuestas.map((r, i) =>
      i === index ? { ...r, [field]: value } : r
    );
    this.data.set({ ...this.data(), respuestas: arr });
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
      const result = await this.entrevistaService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });

      const newVersion: EntrevistaCualitativaReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };

      const updatedReports = [newVersion, ...this.reports()];
      this.reports.set(updatedReports);

      await this.persistData(updatedReports);
      this.showReport.set(true);
      this.uiDialog.showSuccess('Análisis generado', 'El análisis de la entrevista fue generado y guardado correctamente.');
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

  private async persistData(reports: EntrevistaCualitativaReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;

    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
