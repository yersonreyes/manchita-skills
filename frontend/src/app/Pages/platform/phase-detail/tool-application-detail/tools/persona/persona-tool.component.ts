import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { PersonaService } from '@core/services/personaService/persona.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { PersonaReportComponent } from './persona-report.component';
import {
  EMPTY_PERSONA,
  PERSONA_TIPO_LABELS,
  PersonaData,
  PersonaReportVersionDto,
  PersonaTipo,
} from './persona.types';

@Component({
  selector: 'app-persona-tool',
  standalone: true,
  imports: [FormsModule, PersonaReportComponent],
  template: `
    <div class="persona">

      <!-- Header -->
      <div class="persona__header">
        <div class="persona__header-left">
          <div class="persona__badge">
            <i class="pi pi-user"></i>
          </div>
          <div class="persona__title-block">
            <span class="persona__title">User Persona</span>
            <span class="persona__subtitle">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              } @else {
                {{ filledSections() }}/4 secciones completadas
              }
            </span>
          </div>
        </div>
        <div class="persona__header-actions">
          <button
            class="persona__btn persona__btn--ghost"
            (click)="toggleReport()"
            [class.persona__btn--active]="showReport()"
          >
            <i class="pi pi-chart-bar"></i>
            Informes {{ reports().length ? '(' + reports().length + ')' : '' }}
          </button>
          <button
            class="persona__btn persona__btn--primary"
            (click)="generateReport()"
            [disabled]="!canGenerate() || analyzing()"
            [title]="!canGenerate() ? 'Completá al menos nombre y un item de motivaciones o frustraciones' : 'Generar informe con IA'"
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
      <div class="persona__content">
        @if (showReport()) {
          <app-persona-report [reports]="reports()" />
        } @else {

          <!-- Identidad -->
          <div class="persona__section-card">
            <div class="persona__section-header">
              <i class="pi pi-id-card"></i>
              <span>Identidad</span>
            </div>
            <div class="persona__fields-row">
              <div class="persona__field persona__field--flex">
                <label>Nombre</label>
                <input
                  class="persona__input"
                  type="text"
                  placeholder="Ej: María"
                  [ngModel]="data().nombre"
                  (ngModelChange)="onFieldChange('nombre', $event)"
                />
              </div>
              <div class="persona__field persona__field--flex">
                <label>Apodo / Arquetipo</label>
                <input
                  class="persona__input"
                  type="text"
                  placeholder="Ej: La Inversora Cuidadosa"
                  [ngModel]="data().apodo"
                  (ngModelChange)="onFieldChange('apodo', $event)"
                />
              </div>
              <div class="persona__field">
                <label>Tipo</label>
                <select
                  class="persona__select"
                  [ngModel]="data().tipo"
                  (ngModelChange)="onFieldChange('tipo', $event)"
                >
                  @for (entry of tipoOptions; track entry.value) {
                    <option [value]="entry.value">{{ entry.label }}</option>
                  }
                </select>
              </div>
            </div>
          </div>

          <!-- Demográficos -->
          <div class="persona__section-card">
            <div class="persona__section-header">
              <i class="pi pi-info-circle"></i>
              <span>Demográficos</span>
            </div>
            <div class="persona__fields-row">
              <div class="persona__field">
                <label>Edad</label>
                <input
                  class="persona__input"
                  type="text"
                  placeholder="Ej: 32 años"
                  [ngModel]="data().edad"
                  (ngModelChange)="onFieldChange('edad', $event)"
                />
              </div>
              <div class="persona__field persona__field--flex">
                <label>Profesión</label>
                <input
                  class="persona__input"
                  type="text"
                  placeholder="Ej: Diseñadora UX"
                  [ngModel]="data().profesion"
                  (ngModelChange)="onFieldChange('profesion', $event)"
                />
              </div>
              <div class="persona__field persona__field--flex">
                <label>Ubicación</label>
                <input
                  class="persona__input"
                  type="text"
                  placeholder="Ej: Ciudad de México"
                  [ngModel]="data().ubicacion"
                  (ngModelChange)="onFieldChange('ubicacion', $event)"
                />
              </div>
              <div class="persona__field persona__field--flex">
                <label>Ingresos</label>
                <input
                  class="persona__input"
                  type="text"
                  placeholder="Ej: $25,000-35,000 MXN/mes"
                  [ngModel]="data().ingresos"
                  (ngModelChange)="onFieldChange('ingresos', $event)"
                />
              </div>
            </div>
          </div>

          <!-- Biografía -->
          <div class="persona__section-card">
            <div class="persona__section-header">
              <i class="pi pi-book"></i>
              <span>Biografía / Historia</span>
            </div>
            <textarea
              class="persona__textarea"
              rows="3"
              placeholder="Describí el contexto de vida y trabajo de esta persona. ¿Qué la trajo hasta acá? ¿Cuál es su día a día?"
              [ngModel]="data().bio"
              (ngModelChange)="onFieldChange('bio', $event)"
            ></textarea>
          </div>

          <!-- Motivaciones y Frustraciones -->
          <div class="persona__two-col">

            <!-- Motivaciones -->
            <div class="persona__section-card persona__section-card--goals">
              <div class="persona__section-header persona__section-header--goals">
                <i class="pi pi-flag"></i>
                <span>Motivaciones / Goals</span>
                @if (data().motivaciones.length) {
                  <span class="persona__count">{{ data().motivaciones.length }}</span>
                }
              </div>
              <ul class="persona__list">
                @for (item of data().motivaciones; track $index; let i = $index) {
                  <li class="persona__list-item persona__list-item--goal">
                    <span class="persona__item-dot persona__item-dot--goal"></span>
                    <span class="persona__item-text">{{ item }}</span>
                    <button class="persona__item-remove" (click)="removeItem('motivaciones', i)" title="Eliminar">
                      <i class="pi pi-times"></i>
                    </button>
                  </li>
                }
              </ul>
              <div class="persona__input-row">
                <input
                  class="persona__input persona__input--goals"
                  type="text"
                  placeholder="Agregar motivación..."
                  [ngModel]="newMotivacion()"
                  (ngModelChange)="newMotivacion.set($event)"
                  (keydown.enter)="addItem('motivaciones', newMotivacion())"
                />
                <button
                  class="persona__add-btn persona__add-btn--goal"
                  (click)="addItem('motivaciones', newMotivacion())"
                  [disabled]="!newMotivacion().trim()"
                  title="Agregar"
                >
                  <i class="pi pi-plus"></i>
                </button>
              </div>
            </div>

            <!-- Frustraciones -->
            <div class="persona__section-card persona__section-card--frustrations">
              <div class="persona__section-header persona__section-header--frustrations">
                <i class="pi pi-exclamation-triangle"></i>
                <span>Frustraciones / Pain Points</span>
                @if (data().frustraciones.length) {
                  <span class="persona__count persona__count--frustrations">{{ data().frustraciones.length }}</span>
                }
              </div>
              <ul class="persona__list">
                @for (item of data().frustraciones; track $index; let i = $index) {
                  <li class="persona__list-item persona__list-item--frustration">
                    <span class="persona__item-dot persona__item-dot--frustration"></span>
                    <span class="persona__item-text">{{ item }}</span>
                    <button class="persona__item-remove" (click)="removeItem('frustraciones', i)" title="Eliminar">
                      <i class="pi pi-times"></i>
                    </button>
                  </li>
                }
              </ul>
              <div class="persona__input-row">
                <input
                  class="persona__input persona__input--frustrations"
                  type="text"
                  placeholder="Agregar frustración..."
                  [ngModel]="newFrustracion()"
                  (ngModelChange)="newFrustracion.set($event)"
                  (keydown.enter)="addItem('frustraciones', newFrustracion())"
                />
                <button
                  class="persona__add-btn persona__add-btn--frustration"
                  (click)="addItem('frustraciones', newFrustracion())"
                  [disabled]="!newFrustracion().trim()"
                  title="Agregar"
                >
                  <i class="pi pi-plus"></i>
                </button>
              </div>
            </div>

          </div>

          <!-- Comportamiento -->
          <div class="persona__section-card">
            <div class="persona__section-header">
              <i class="pi pi-desktop"></i>
              <span>Comportamiento / Tecnología</span>
            </div>
            <textarea
              class="persona__textarea"
              rows="2"
              placeholder="¿Cómo usa la tecnología? ¿Qué canales prefiere? ¿Cómo aprende y se informa?"
              [ngModel]="data().comportamiento"
              (ngModelChange)="onFieldChange('comportamiento', $event)"
            ></textarea>
          </div>

          <!-- Cita -->
          <div class="persona__section-card persona__section-card--quote">
            <div class="persona__section-header">
              <i class="pi pi-quote-left"></i>
              <span>Cita representativa</span>
            </div>
            <input
              class="persona__input persona__input--quote"
              type="text"
              placeholder='Ej: "Necesito algo que me explique en palabras simples qué está pasando con mi dinero."'
              [ngModel]="data().cita"
              (ngModelChange)="onFieldChange('cita', $event)"
            />
          </div>

        }
      </div>

    </div>
  `,
  styles: [`
    .persona {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 12px;
    }

    /* ─── Header ─────────────────────────────────────────────────── */
    .persona__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-shrink: 0;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--p-surface-200);
    }

    .persona__header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .persona__badge {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: var(--p-primary-100, #e0f2fe);
      color: var(--p-primary-600, #0284c7);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      flex-shrink: 0;
    }

    .persona__title-block {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .persona__title {
      font-family: 'Syne', sans-serif;
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--p-text-color);
      line-height: 1.2;
    }

    .persona__subtitle {
      font-size: 0.72rem;
      color: var(--p-text-muted-color);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .persona__header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* ─── Buttons ─────────────────────────────────────────────────── */
    .persona__btn {
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

      .pi { font-size: 0.8rem; }

      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .persona__btn--ghost {
      background: transparent;
      border-color: var(--p-surface-300);
      color: var(--p-text-secondary-color);

      &:hover:not(:disabled) { background: var(--p-surface-100); }
      &.persona__btn--active { background: var(--p-primary-50, #eff6ff); border-color: var(--p-primary-200, #bfdbfe); color: var(--p-primary-700, #1d4ed8); }
    }

    .persona__btn--primary {
      background: var(--p-primary-600, #0284c7);
      color: white;
      border-color: var(--p-primary-600, #0284c7);

      &:hover:not(:disabled) { background: var(--p-primary-700, #0369a1); }
    }

    /* ─── Content ─────────────────────────────────────────────────── */
    .persona__content {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
      overflow-y: auto;
    }

    /* ─── Section cards ───────────────────────────────────────────── */
    .persona__section-card {
      border-radius: 12px;
      padding: 12px;
      border: 1px solid var(--p-surface-200);
      background-color: var(--p-surface-50, #fafafa);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .persona__section-card--goals {
      border-color: #bbf7d0;
      background-color: #f0fdf4;
    }

    .persona__section-card--frustrations {
      border-color: #fecaca;
      background-color: #fef2f2;
    }

    .persona__section-card--quote {
      border-color: #fde68a;
      background-color: #fffbeb;
    }

    .persona__section-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--p-text-muted-color);
      flex-shrink: 0;

      .pi { font-size: 0.75rem; }
    }

    .persona__section-header--goals { color: #15803d; }
    .persona__section-header--frustrations { color: #b91c1c; }

    .persona__count {
      margin-left: auto;
      background-color: #22c55e;
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 10px;
      line-height: 1.6;
    }

    .persona__count--frustrations { background-color: #ef4444; }

    /* ─── Fields ──────────────────────────────────────────────────── */
    .persona__fields-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .persona__field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 120px;

      label {
        font-size: 0.7rem;
        font-weight: 600;
        color: var(--p-text-muted-color);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
    }

    .persona__field--flex { flex: 1; }

    .persona__input {
      padding: 6px 10px;
      border-radius: 8px;
      border: 1px solid var(--p-surface-300);
      font-size: 0.8125rem;
      background: white;
      color: var(--p-text-color);
      outline: none;
      width: 100%;
      transition: border-color 0.15s, box-shadow 0.15s;

      &::placeholder { color: #9ca3af; }
      &:focus { border-color: var(--p-primary-400, #38bdf8); box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.15); }
    }

    .persona__input--goals:focus { border-color: #22c55e; box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.15); }
    .persona__input--frustrations:focus { border-color: #ef4444; box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.15); }
    .persona__input--quote { font-style: italic; }

    .persona__select {
      padding: 6px 10px;
      border-radius: 8px;
      border: 1px solid var(--p-surface-300);
      font-size: 0.8125rem;
      background: white;
      color: var(--p-text-color);
      outline: none;
      cursor: pointer;
      width: 100%;

      &:focus { border-color: var(--p-primary-400, #38bdf8); box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.15); }
    }

    .persona__textarea {
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid var(--p-surface-300);
      font-size: 0.8125rem;
      background: white;
      color: var(--p-text-color);
      outline: none;
      resize: vertical;
      width: 100%;
      font-family: inherit;
      line-height: 1.5;
      transition: border-color 0.15s;

      &::placeholder { color: #9ca3af; }
      &:focus { border-color: var(--p-primary-400, #38bdf8); box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.15); }
    }

    /* ─── Two-col layout ──────────────────────────────────────────── */
    .persona__two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    /* ─── List items ──────────────────────────────────────────────── */
    .persona__list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }

    .persona__list-item {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      font-size: 0.8125rem;
      color: #374151;
      line-height: 1.4;
      padding: 4px 6px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.6);

      &:hover .persona__item-remove { opacity: 1; }
    }

    .persona__item-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      margin-top: 4px;
      flex-shrink: 0;
    }

    .persona__item-dot--goal { background-color: #22c55e; }
    .persona__item-dot--frustration { background-color: #ef4444; }

    .persona__item-text { flex: 1; word-break: break-word; }

    .persona__item-remove {
      opacity: 0;
      background: none;
      border: none;
      cursor: pointer;
      color: #9ca3af;
      padding: 0 2px;
      font-size: 0.65rem;
      flex-shrink: 0;
      transition: color 0.15s, opacity 0.15s;
      line-height: 1;
      margin-top: 2px;

      &:hover { color: #ef4444; }
    }

    /* ─── Input rows ──────────────────────────────────────────────── */
    .persona__input-row {
      display: flex;
      gap: 6px;
      align-items: center;
      flex-shrink: 0;
    }

    .persona__add-btn {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: filter 0.15s;
      font-size: 0.75rem;

      &:hover:not(:disabled) { filter: brightness(0.9); }
      &:disabled { opacity: 0.4; cursor: not-allowed; }
    }

    .persona__add-btn--goal { background-color: #22c55e; }
    .persona__add-btn--frustration { background-color: #ef4444; }
  `],
})
export class PersonaToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly personaService = inject(PersonaService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  // ─── Estado ───────────────────────────────────────────────────────────────
  data = signal<PersonaData>({ ...EMPTY_PERSONA });
  reports = signal<PersonaReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);
  newMotivacion = signal('');
  newFrustracion = signal('');

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly tipoOptions = Object.entries(PERSONA_TIPO_LABELS).map(([value, label]) => ({
    value: value as PersonaTipo,
    label,
  }));

  // ─── Computed ─────────────────────────────────────────────────────────────
  filledSections = computed(() => {
    const d = this.data();
    let count = 0;
    if (d.nombre.trim()) count++;
    if (d.bio.trim()) count++;
    if (d.motivaciones.length > 0) count++;
    if (d.frustraciones.length > 0) count++;
    return count;
  });

  canGenerate = computed(() => {
    const d = this.data();
    return d.nombre.trim().length > 0 && (d.motivaciones.length > 0 || d.frustraciones.length > 0);
  });

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;

    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as PersonaData | undefined;
    const storedReports = (raw['reports'] as PersonaReportVersionDto[]) ?? [];

    this.data.set(stored ? { ...EMPTY_PERSONA, ...stored } : { ...EMPTY_PERSONA });
    this.reports.set(storedReports);
  }

  // ─── Acciones ─────────────────────────────────────────────────────────────
  onFieldChange(field: keyof PersonaData, value: string): void {
    this.data.set({ ...this.data(), [field]: value });
    this.scheduleSave();
  }

  addItem(field: 'motivaciones' | 'frustraciones', text: string): void {
    const trimmed = text.trim();
    if (!trimmed) return;

    this.data.set({ ...this.data(), [field]: [...this.data()[field], trimmed] });
    if (field === 'motivaciones') this.newMotivacion.set('');
    else this.newFrustracion.set('');
    this.scheduleSave();
  }

  removeItem(field: 'motivaciones' | 'frustraciones', index: number): void {
    const arr = [...this.data()[field]];
    arr.splice(index, 1);
    this.data.set({ ...this.data(), [field]: arr });
    this.scheduleSave();
  }

  toggleReport(): void {
    this.showReport.set(!this.showReport());
  }

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;

    this.analyzing.set(true);
    try {
      const result = await this.personaService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });

      const newVersion: PersonaReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };

      const updated = [newVersion, ...this.reports()];
      this.reports.set(updated);
      await this.persistData(updated);
      this.showReport.set(true);
      this.uiDialog.showSuccess('Informe generado', 'El análisis de la persona fue generado correctamente.');
    } catch (error) {
      this.uiDialog.showError('Error', `No se pudo generar el informe: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      this.analyzing.set(false);
    }
  }

  // ─── Helpers privados ──────────────────────────────────────────────────────
  private scheduleSave(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => void this.saveData(), 800);
  }

  private async saveData(): Promise<void> {
    const app = this.application();
    if (!app) return;
    this.saving.set(true);
    try {
      const current = (app.structuredData as Record<string, unknown>) ?? {};
      await this.toolApplicationService.update(app.id, {
        structuredData: { ...current, data: this.data() },
      });
      this.sessionSaved.emit();
    } catch { /* silent */ }
    finally { this.saving.set(false); }
  }

  private async persistData(reports: PersonaReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const current = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...current, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
