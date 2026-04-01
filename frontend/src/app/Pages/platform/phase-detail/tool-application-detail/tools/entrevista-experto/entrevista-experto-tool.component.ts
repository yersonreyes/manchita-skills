import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { EntrevistaExpertoService } from '@core/services/entrevistaExpertoService/entrevista-experto.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { EntrevistaExpertoReportComponent } from './entrevista-experto-report.component';
import {
  EMPTY_ENTREVISTA_EXPERTO,
  EntrevistaExpertoData,
  EntrevistaExpertoRespuesta,
  EntrevistaExpertoReportVersionDto,
} from './entrevista-experto.types';

@Component({
  selector: 'app-entrevista-experto-tool',
  standalone: true,
  imports: [FormsModule, EntrevistaExpertoReportComponent],
  template: `
    <div class="ee">

      <!-- Header -->
      <div class="ee__header">
        <div class="ee__header-left">
          <div class="ee__badge">
            <i class="pi pi-graduation-cap"></i>
          </div>
          <div class="ee__title-block">
            <span class="ee__title">Entrevista con Experto</span>
            <span class="ee__subtitle">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              } @else {
                {{ filledCount() }}/{{ data().respuestas.length }} respuestas registradas
              }
            </span>
          </div>
        </div>
        <div class="ee__header-actions">
          <button
            class="ee__btn ee__btn--ghost"
            (click)="toggleReport()"
            [class.ee__btn--active]="showReport()"
          >
            <i class="pi pi-chart-bar"></i>
            Informes {{ reports().length ? '(' + reports().length + ')' : '' }}
          </button>
          <button
            class="ee__btn ee__btn--primary"
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
      <div class="ee__content">
        @if (showReport()) {
          <app-entrevista-experto-report [reports]="reports()" />
        } @else {
          <div class="ee__body">

            <!-- Perfil del experto -->
            <div class="ee__section">
              <div class="ee__section-header">
                <i class="pi pi-id-card ee__section-icon"></i>
                <span class="ee__section-title">Perfil del Experto</span>
              </div>
              <div class="ee__context-grid">
                <div class="ee__field">
                  <label class="ee__field-label">Nombre del Experto</label>
                  <input
                    class="ee__field-input"
                    type="text"
                    placeholder="Ej: Dr. Carlos Méndez"
                    [ngModel]="data().experto"
                    (ngModelChange)="updateField('experto', $event)"
                  />
                </div>
                <div class="ee__field">
                  <label class="ee__field-label">Área de Experticia</label>
                  <input
                    class="ee__field-input"
                    type="text"
                    placeholder="Ej: Fintech, Salud Digital, Logística..."
                    [ngModel]="data().experticia"
                    (ngModelChange)="updateField('experticia', $event)"
                  />
                </div>
                <div class="ee__field">
                  <label class="ee__field-label">Organización</label>
                  <input
                    class="ee__field-input"
                    type="text"
                    placeholder="Ej: Universidad de Buenos Aires"
                    [ngModel]="data().organizacion"
                    (ngModelChange)="updateField('organizacion', $event)"
                  />
                </div>
                <div class="ee__field">
                  <label class="ee__field-label">Cargo / Rol</label>
                  <input
                    class="ee__field-input"
                    type="text"
                    placeholder="Ej: Investigador Principal, CTO..."
                    [ngModel]="data().cargo"
                    (ngModelChange)="updateField('cargo', $event)"
                  />
                </div>
                <div class="ee__field">
                  <label class="ee__field-label">Fecha</label>
                  <input
                    class="ee__field-input"
                    type="text"
                    placeholder="Ej: 15/03/2025"
                    [ngModel]="data().fecha"
                    (ngModelChange)="updateField('fecha', $event)"
                  />
                </div>
              </div>
              <div class="ee__field">
                <label class="ee__field-label">Objetivos de la Entrevista</label>
                <textarea
                  class="ee__field-textarea"
                  placeholder="¿Qué conocimiento técnico o perspectivas buscamos obtener de este experto? ¿Qué hipótesis o decisiones queremos informar?"
                  [ngModel]="data().objetivos"
                  (ngModelChange)="updateField('objetivos', $event)"
                  rows="3"
                ></textarea>
              </div>
            </div>

            <!-- Preguntas y respuestas -->
            <div class="ee__section ee__section--qa">
              <div class="ee__section-header">
                <i class="pi pi-comments ee__section-icon"></i>
                <span class="ee__section-title">Preguntas y Respuestas</span>
                @if (data().respuestas.length) {
                  <span class="ee__count">{{ data().respuestas.length }}</span>
                }
                <span class="ee__hint">Mínimo 2 con respuesta para analizar</span>
                <button class="ee__btn-add-qa" (click)="addRespuesta()" title="Agregar pregunta">
                  <i class="pi pi-plus"></i>
                  Agregar pregunta
                </button>
              </div>

              @for (r of data().respuestas; track r.id; let i = $index) {
                <div class="ee__qa-item" [class.ee__qa-item--filled]="r.respuesta.trim()">
                  <div class="ee__qa-num">{{ i + 1 }}</div>
                  <div class="ee__qa-fields">
                    <div class="ee__qa-pregunta-row">
                      <input
                        class="ee__qa-pregunta"
                        type="text"
                        placeholder="Escribí la pregunta que hiciste al experto..."
                        [ngModel]="r.pregunta"
                        (ngModelChange)="updateRespuesta(i, 'pregunta', $event)"
                      />
                      <button class="ee__qa-remove" (click)="removeRespuesta(i)" title="Eliminar">
                        <i class="pi pi-trash"></i>
                      </button>
                    </div>
                    <textarea
                      class="ee__qa-respuesta"
                      placeholder="¿Qué respondió el experto? Registrá la respuesta técnica con el mayor detalle posible..."
                      [ngModel]="r.respuesta"
                      (ngModelChange)="updateRespuesta(i, 'respuesta', $event)"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              }

              @if (data().respuestas.length === 0) {
                <div class="ee__qa-empty">
                  <i class="pi pi-plus-circle"></i>
                  <span>Agregá la primera pregunta para empezar a registrar la entrevista con el experto</span>
                </div>
              }
            </div>

            <!-- Síntesis -->
            <div class="ee__section">
              <div class="ee__section-header">
                <i class="pi pi-align-left ee__section-icon"></i>
                <span class="ee__section-title">Síntesis</span>
              </div>

              <!-- Citas técnicas -->
              <div class="ee__field">
                <label class="ee__field-label">
                  <i class="pi pi-quote-right"></i>
                  Citas Técnicas Destacadas
                  @if (data().citasTecnicas.length) {
                    <span class="ee__count ee__count--small">{{ data().citasTecnicas.length }}</span>
                  }
                </label>
                <div class="ee__quotes-list">
                  @for (c of data().citasTecnicas; track $index; let i = $index) {
                    <div class="ee__quote-item">
                      <i class="pi pi-quote-left ee__quote-icon"></i>
                      <span class="ee__quote-text">{{ c }}</span>
                      <button class="ee__quote-remove" (click)="removeCita(i)">
                        <i class="pi pi-times"></i>
                      </button>
                    </div>
                  }
                </div>
                <div class="ee__input-row">
                  <input
                    class="ee__input"
                    type="text"
                    placeholder='Ej: "El mayor cuello de botella en este sector no es tecnológico, es regulatorio..."'
                    [ngModel]="newCita()"
                    (ngModelChange)="newCita.set($event)"
                    (keydown.enter)="addCita()"
                  />
                  <button
                    class="ee__add-btn"
                    (click)="addCita()"
                    [disabled]="!newCita().trim()"
                  >
                    <i class="pi pi-plus"></i>
                  </button>
                </div>
              </div>

              <!-- Observaciones -->
              <div class="ee__field">
                <label class="ee__field-label">Observaciones y Contexto Adicional</label>
                <textarea
                  class="ee__field-textarea"
                  placeholder="Conocimiento implícito compartido, contradicciones con otras fuentes, sesgos percibidos, lo que se insinuó pero no se dijo explícitamente..."
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
    .ee {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 12px;
    }

    /* ─── Header ───────────────────────────────────────────────────── */
    .ee__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-shrink: 0;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--p-surface-200);
    }

    .ee__header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .ee__badge {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #cffafe;
      color: #0891b2;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      flex-shrink: 0;
    }

    .ee__title-block {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .ee__title {
      font-family: 'Syne', sans-serif;
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--p-text-color);
      line-height: 1.2;
    }

    .ee__subtitle {
      font-size: 0.72rem;
      color: var(--p-text-muted-color);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .ee__header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* ─── Buttons ──────────────────────────────────────────────────── */
    .ee__btn {
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

    .ee__btn .pi { font-size: 0.8rem; }
    .ee__btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .ee__btn--ghost {
      background: transparent;
      border-color: var(--p-surface-300);
      color: var(--p-text-secondary-color);
    }

    .ee__btn--ghost:hover:not(:disabled) { background: var(--p-surface-100); }
    .ee__btn--ghost.ee__btn--active { background: #ecfeff; border-color: #a5f3fc; color: #0891b2; }

    .ee__btn--primary {
      background: #0891b2;
      color: white;
      border-color: #0891b2;
    }

    .ee__btn--primary:hover:not(:disabled) { background: #0e7490; }

    .ee__btn-add-qa {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 12px;
      border-radius: 8px;
      border: 1px solid #a5f3fc;
      background: #ecfeff;
      color: #0891b2;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      margin-left: auto;
    }

    .ee__btn-add-qa .pi { font-size: 0.7rem; }
    .ee__btn-add-qa:hover { background: #cffafe; }

    /* ─── Content ──────────────────────────────────────────────────── */
    .ee__content {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
    }

    .ee__body {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding-bottom: 20px;
    }

    /* ─── Section ──────────────────────────────────────────────────── */
    .ee__section {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .ee__section--qa {
      background: var(--p-surface-50);
      border-radius: 12px;
      padding: 14px;
      border: 1px solid var(--p-surface-200);
    }

    .ee__section-header {
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

    .ee__section-icon { color: #0891b2; font-size: 0.8rem; }

    .ee__count {
      background: #0891b2;
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 10px;
      line-height: 1.6;
    }

    .ee__count--small {
      font-size: 0.63rem;
      padding: 0px 5px;
      border-radius: 8px;
      margin-left: 4px;
      vertical-align: middle;
    }

    .ee__hint {
      font-size: 0.67rem;
      color: var(--p-text-muted-color);
      font-family: inherit;
      text-transform: none;
      letter-spacing: 0;
      font-weight: 400;
    }

    /* ─── Context grid ─────────────────────────────────────────────── */
    .ee__context-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
    }

    /* ─── Fields ───────────────────────────────────────────────────── */
    .ee__field {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .ee__field-label {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--p-text-muted-color);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .ee__field-label .pi { font-size: 0.68rem; color: #0891b2; }

    .ee__field-input {
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

    .ee__field-input::placeholder { color: #9ca3af; }
    .ee__field-input:focus { border-color: #0891b2; box-shadow: 0 0 0 2px rgba(8, 145, 178, 0.15); }

    .ee__field-textarea {
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

    .ee__field-textarea::placeholder { color: #9ca3af; }
    .ee__field-textarea:focus { border-color: #0891b2; box-shadow: 0 0 0 2px rgba(8, 145, 178, 0.15); }

    /* ─── Q&A ──────────────────────────────────────────────────────── */
    .ee__qa-item {
      background: var(--p-surface-0);
      border-radius: 10px;
      border: 1px solid var(--p-surface-200);
      border-left: 3px solid #a5f3fc;
      padding: 10px 12px;
      display: flex;
      gap: 10px;
      transition: border-left-color 0.2s;
    }

    .ee__qa-item--filled { border-left-color: #0891b2; }

    .ee__qa-num {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #cffafe;
      color: #0891b2;
      font-size: 0.68rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 2px;
      font-family: 'Syne', sans-serif;
    }

    .ee__qa-fields {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .ee__qa-pregunta-row {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .ee__qa-pregunta {
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

    .ee__qa-pregunta::placeholder { color: #9ca3af; font-weight: 400; }
    .ee__qa-pregunta:focus { border-color: #0891b2; }

    .ee__qa-remove {
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

    .ee__qa-remove:hover { color: #ef4444; background: #fef2f2; }

    .ee__qa-respuesta {
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

    .ee__qa-respuesta::placeholder { color: #9ca3af; }
    .ee__qa-respuesta:focus { border-color: #0891b2; }

    .ee__qa-empty {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      border: 1px dashed #a5f3fc;
      border-radius: 8px;
      color: #0e7490;
      font-size: 0.8rem;
    }

    .ee__qa-empty .pi { font-size: 1rem; }

    /* ─── Quotes ───────────────────────────────────────────────────── */
    .ee__quotes-list {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .ee__quote-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 8px 12px;
      background: #ecfeff;
      border: 1px solid #a5f3fc;
      border-radius: 8px;
      font-size: 0.82rem;
      color: #164e63;
      font-style: italic;
      line-height: 1.5;
    }

    .ee__quote-icon { color: #0891b2; font-size: 0.72rem; flex-shrink: 0; margin-top: 3px; }
    .ee__quote-text { flex: 1; }

    .ee__quote-remove {
      background: none;
      border: none;
      cursor: pointer;
      color: #67e8f9;
      font-size: 0.65rem;
      padding: 2px;
      flex-shrink: 0;
      transition: color 0.15s;
      line-height: 1;
      margin-top: 2px;
    }

    .ee__quote-remove:hover { color: #ef4444; }

    /* ─── Input row ────────────────────────────────────────────────── */
    .ee__input-row {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .ee__input {
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

    .ee__input::placeholder { color: #9ca3af; }
    .ee__input:focus { border-color: #0891b2; box-shadow: 0 0 0 2px rgba(8, 145, 178, 0.15); }

    .ee__add-btn {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      border: none;
      background: #0891b2;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: filter 0.15s;
      font-size: 0.75rem;
    }

    .ee__add-btn:hover:not(:disabled) { filter: brightness(0.9); }
    .ee__add-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  `],
})
export class EntrevistaExpertoToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly expertoService = inject(EntrevistaExpertoService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  // ─── Estado ─────────────────────────────────────────────────────────────────
  data = signal<EntrevistaExpertoData>({ ...EMPTY_ENTREVISTA_EXPERTO });
  reports = signal<EntrevistaExpertoReportVersionDto[]>([]);
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
    const storedData = raw['data'] as EntrevistaExpertoData | undefined;
    const storedReports = (raw['reports'] as EntrevistaExpertoReportVersionDto[]) ?? [];

    this.data.set(storedData ? { ...EMPTY_ENTREVISTA_EXPERTO, ...storedData } : { ...EMPTY_ENTREVISTA_EXPERTO });
    this.reports.set(storedReports);
  }

  // ─── Context fields ──────────────────────────────────────────────────────────
  updateField(field: 'experto' | 'experticia' | 'organizacion' | 'cargo' | 'fecha' | 'objetivos' | 'observaciones', value: string): void {
    this.data.set({ ...this.data(), [field]: value });
    this.scheduleSave();
  }

  // ─── Respuestas ──────────────────────────────────────────────────────────────
  addRespuesta(): void {
    const nueva: EntrevistaExpertoRespuesta = {
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

  // ─── Citas técnicas ──────────────────────────────────────────────────────────
  addCita(): void {
    const trimmed = this.newCita().trim();
    if (!trimmed) return;
    this.data.set({ ...this.data(), citasTecnicas: [...this.data().citasTecnicas, trimmed] });
    this.newCita.set('');
    this.scheduleSave();
  }

  removeCita(index: number): void {
    const arr = [...this.data().citasTecnicas];
    arr.splice(index, 1);
    this.data.set({ ...this.data(), citasTecnicas: arr });
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
      const result = await this.expertoService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });

      const newVersion: EntrevistaExpertoReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };

      const updatedReports = [newVersion, ...this.reports()];
      this.reports.set(updatedReports);

      await this.persistData(updatedReports);
      this.showReport.set(true);
      this.uiDialog.showSuccess('Análisis generado', 'El análisis de la entrevista con el experto fue generado y guardado correctamente.');
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

  private async persistData(reports: EntrevistaExpertoReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;

    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
