import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { CustomerJourneyMapService } from '@core/services/customerJourneyMapService/customer-journey-map.service';
import { CustomerJourneyMapReportComponent } from './customer-journey-map-report.component';
import {
  CJM_FIELDS,
  CjmEtapa,
  CjmFieldConfig,
  CustomerJourneyMapData,
  CustomerJourneyMapReportVersionDto,
  EMPTY_CJM,
  EMPTY_CJM_ETAPA,
} from './customer-journey-map.types';

@Component({
  selector: 'app-customer-journey-map-tool',
  standalone: true,
  imports: [FormsModule, CustomerJourneyMapReportComponent],
  template: `
    <div class="cjm">

      <!-- Header -->
      <div class="cjm__header">
        <div class="cjm__header-left">
          <div class="cjm__badge">
            <i class="pi pi-map"></i>
          </div>
          <div class="cjm__title-block">
            <span class="cjm__title">Customer Journey Map</span>
            <span class="cjm__subtitle">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              } @else {
                {{ filledCount() }}/{{ data().etapas.length }} etapas con contenido
              }
            </span>
          </div>
        </div>
        <div class="cjm__header-actions">
          <button
            class="cjm__btn cjm__btn--ghost"
            (click)="toggleReport()"
            [class.cjm__btn--active]="showReport()"
          >
            <i class="pi pi-chart-line"></i>
            Informes {{ reports().length ? '(' + reports().length + ')' : '' }}
          </button>
          <button
            class="cjm__btn cjm__btn--primary"
            (click)="generateReport()"
            [disabled]="!canGenerate() || analyzing()"
            [title]="!canGenerate() ? 'Agregá al menos 2 etapas con contenido para analizar' : 'Generar informe con IA'"
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
      <div class="cjm__content">
        @if (showReport()) {
          <app-customer-journey-map-report [reports]="reports()" />
        } @else {

          <!-- Context strip -->
          <div class="cjm__context">
            <div class="cjm__context-field">
              <label class="cjm__context-label">
                <i class="pi pi-user"></i> Personaje / Persona
              </label>
              <input
                class="cjm__context-input"
                type="text"
                placeholder="Ej: María, 35 años, compradora online frecuente"
                [ngModel]="data().personaje"
                (ngModelChange)="onContextChange('personaje', $event)"
              />
            </div>
            <div class="cjm__context-field">
              <label class="cjm__context-label">
                <i class="pi pi-flag"></i> Escenario
              </label>
              <input
                class="cjm__context-input"
                type="text"
                placeholder="Ej: Usuario intentando comprar por primera vez en la app"
                [ngModel]="data().escenario"
                (ngModelChange)="onContextChange('escenario', $event)"
              />
            </div>
          </div>

          <!-- Timeline -->
          <div class="cjm__timeline">
            @for (etapa of data().etapas; track etapa.id; let i = $index) {
              <div class="cjm__etapa">

                <!-- Etapa header -->
                <div class="cjm__etapa-header">
                  <div class="cjm__etapa-number">{{ i + 1 }}</div>
                  <input
                    class="cjm__etapa-name"
                    type="text"
                    placeholder="Nombre de la etapa (Ej: Descubrimiento)"
                    [ngModel]="etapa.nombre"
                    (ngModelChange)="onEtapaNameChange(etapa.id, $event)"
                  />
                  <button
                    class="cjm__etapa-remove"
                    (click)="removeEtapa(etapa.id)"
                    title="Eliminar etapa"
                  >
                    <i class="pi pi-trash"></i>
                  </button>
                </div>

                <!-- Fields grid -->
                <div class="cjm__fields">
                  @for (field of cjmFields; track field.key) {
                    <div
                      class="cjm__field"
                      [style.background-color]="field.accentBg"
                      [style.border-color]="field.borderColor"
                    >
                      <div class="cjm__field-header" [style.color]="field.textColor">
                        <i class="pi {{ field.icon }}"></i>
                        <span>{{ field.label }}</span>
                        @if (getFieldItems(etapa, field.key).length > 0) {
                          <span
                            class="cjm__field-count"
                            [style.background-color]="field.accentColor"
                          >{{ getFieldItems(etapa, field.key).length }}</span>
                        }
                      </div>

                      <ul class="cjm__field-list">
                        @for (item of getFieldItems(etapa, field.key); track $index; let idx = $index) {
                          <li class="cjm__field-item">
                            <span class="cjm__field-dot" [style.background-color]="field.accentColor"></span>
                            <span class="cjm__field-item-text">{{ item }}</span>
                            <button
                              class="cjm__field-item-remove"
                              (click)="removeFieldItem(etapa.id, field.key, idx)"
                              title="Eliminar"
                            >
                              <i class="pi pi-times"></i>
                            </button>
                          </li>
                        }
                      </ul>

                      <div class="cjm__field-input-row">
                        <input
                          class="cjm__field-input"
                          type="text"
                          [placeholder]="field.placeholder"
                          [ngModel]="getNewText(etapa.id, field.key)"
                          (ngModelChange)="setNewText(etapa.id, field.key, $event)"
                          (keydown.enter)="addFieldItem(etapa.id, field.key)"
                          [style.border-color]="field.borderColor"
                        />
                        <button
                          class="cjm__field-add"
                          [style.background-color]="field.accentColor"
                          (click)="addFieldItem(etapa.id, field.key)"
                          [disabled]="!getNewText(etapa.id, field.key).trim()"
                          title="Agregar"
                        >
                          <i class="pi pi-plus"></i>
                        </button>
                      </div>
                    </div>
                  }
                </div>

              </div>
            }

            <!-- Add stage button -->
            <button class="cjm__add-etapa" (click)="addEtapa()">
              <i class="pi pi-plus-circle"></i>
              Agregar etapa
            </button>
          </div>

        }
      </div>

    </div>
  `,
  styles: [`
    .cjm {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 12px;
    }

    /* ─── Header ─────────────────────────────────────────────────── */
    .cjm__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-shrink: 0;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--p-surface-200);
    }

    .cjm__header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .cjm__badge {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      color: #1d4ed8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      flex-shrink: 0;
      box-shadow: 0 1px 3px rgba(29,78,216,0.15);
    }

    .cjm__title-block {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .cjm__title {
      font-family: 'Syne', sans-serif;
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--p-text-color);
      line-height: 1.2;
    }

    .cjm__subtitle {
      font-size: 0.72rem;
      color: var(--p-text-muted-color);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .cjm__header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* ─── Buttons ─────────────────────────────────────────────────── */
    .cjm__btn {
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

    .cjm__btn .pi { font-size: 0.8rem; }
    .cjm__btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .cjm__btn--ghost {
      background: transparent;
      border-color: var(--p-surface-300);
      color: var(--p-text-secondary-color);
    }

    .cjm__btn--ghost:hover:not(:disabled) { background: var(--p-surface-100); }

    .cjm__btn--ghost.cjm__btn--active {
      background: #eff6ff;
      border-color: #bfdbfe;
      color: #1d4ed8;
    }

    .cjm__btn--primary {
      background: #1d4ed8;
      color: white;
      border-color: #1d4ed8;
    }

    .cjm__btn--primary:hover:not(:disabled) { background: #1e40af; }

    /* ─── Content ─────────────────────────────────────────────────── */
    .cjm__content {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      gap: 12px;
    }

    /* ─── Context strip ───────────────────────────────────────────── */
    .cjm__context {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      flex-shrink: 0;
    }

    .cjm__context-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .cjm__context-label {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--p-text-muted-color);
      display: flex;
      align-items: center;
      gap: 4px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .cjm__context-label .pi { font-size: 0.68rem; }

    .cjm__context-input {
      padding: 7px 10px;
      border-radius: 8px;
      border: 1px solid var(--p-surface-300);
      font-size: 0.8125rem;
      background: var(--p-surface-0);
      color: var(--p-text-color);
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .cjm__context-input::placeholder { color: #9ca3af; }
    .cjm__context-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.15); }

    /* ─── Timeline ────────────────────────────────────────────────── */
    .cjm__timeline {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* ─── Etapa ───────────────────────────────────────────────────── */
    .cjm__etapa {
      border: 1px solid var(--p-surface-200);
      border-radius: 12px;
      padding: 14px;
      background: var(--p-surface-0);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .cjm__etapa-header {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .cjm__etapa-number {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
      color: white;
      font-family: 'Syne', sans-serif;
      font-size: 0.75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .cjm__etapa-name {
      flex: 1;
      padding: 6px 10px;
      border-radius: 8px;
      border: 1px solid var(--p-surface-300);
      font-size: 0.875rem;
      font-family: 'Syne', sans-serif;
      font-weight: 600;
      background: var(--p-surface-50);
      color: var(--p-text-color);
      outline: none;
      transition: border-color 0.15s;
    }

    .cjm__etapa-name::placeholder { color: #9ca3af; font-weight: 400; font-family: 'Outfit', sans-serif; }
    .cjm__etapa-name:focus { border-color: #3b82f6; }

    .cjm__etapa-remove {
      background: none;
      border: none;
      cursor: pointer;
      color: #9ca3af;
      padding: 4px 6px;
      border-radius: 6px;
      font-size: 0.75rem;
      transition: color 0.15s, background 0.15s;
      flex-shrink: 0;
    }

    .cjm__etapa-remove:hover { color: #ef4444; background: #fef2f2; }

    /* ─── Fields grid ─────────────────────────────────────────────── */
    .cjm__fields {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
    }

    .cjm__field {
      border-radius: 10px;
      padding: 10px;
      border: 1px solid transparent;
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .cjm__field-header {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      flex-shrink: 0;
    }

    .cjm__field-header .pi { font-size: 0.72rem; }

    .cjm__field-count {
      margin-left: auto;
      color: white;
      font-size: 0.6rem;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: 10px;
      line-height: 1.6;
    }

    /* ─── Field items ─────────────────────────────────────────────── */
    .cjm__field-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 3px;
      flex: 1;
      overflow-y: auto;
      min-height: 0;
      max-height: 120px;
    }

    .cjm__field-item {
      display: flex;
      align-items: flex-start;
      gap: 5px;
      font-size: 0.75rem;
      color: #374151;
      line-height: 1.4;
      padding: 3px 5px;
      border-radius: 5px;
      background: rgba(255,255,255,0.6);
    }

    .cjm__field-item:hover .cjm__field-item-remove { opacity: 1; }

    .cjm__field-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      margin-top: 4px;
      flex-shrink: 0;
    }

    .cjm__field-item-text {
      flex: 1;
      word-break: break-word;
    }

    .cjm__field-item-remove {
      opacity: 0;
      background: none;
      border: none;
      cursor: pointer;
      color: #9ca3af;
      padding: 0 1px;
      font-size: 0.6rem;
      flex-shrink: 0;
      transition: color 0.15s, opacity 0.15s;
      line-height: 1;
      margin-top: 2px;
    }

    .cjm__field-item-remove:hover { color: #ef4444; }

    /* ─── Field input ─────────────────────────────────────────────── */
    .cjm__field-input-row {
      display: flex;
      gap: 4px;
      align-items: center;
      flex-shrink: 0;
    }

    .cjm__field-input {
      flex: 1;
      padding: 5px 8px;
      border-radius: 6px;
      border: 1px solid;
      font-size: 0.72rem;
      background: rgba(255,255,255,0.8);
      color: var(--p-text-color);
      outline: none;
      min-width: 0;
      transition: border-color 0.15s;
    }

    .cjm__field-input::placeholder { color: #9ca3af; font-size: 0.68rem; }

    .cjm__field-add {
      width: 26px;
      height: 26px;
      border-radius: 6px;
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: filter 0.15s;
      font-size: 0.7rem;
    }

    .cjm__field-add:hover:not(:disabled) { filter: brightness(0.9); }
    .cjm__field-add:disabled { opacity: 0.4; cursor: not-allowed; }

    /* ─── Add stage ───────────────────────────────────────────────── */
    .cjm__add-etapa {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      border-radius: 12px;
      border: 2px dashed var(--p-surface-300);
      background: transparent;
      color: var(--p-text-muted-color);
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }

    .cjm__add-etapa:hover {
      border-color: #3b82f6;
      color: #1d4ed8;
      background: #eff6ff;
    }

    .cjm__add-etapa .pi { font-size: 1rem; }
  `],
})
export class CustomerJourneyMapToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly cjmService = inject(CustomerJourneyMapService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  // ─── State ────────────────────────────────────────────────────────────────
  data = signal<CustomerJourneyMapData>({ ...EMPTY_CJM });
  reports = signal<CustomerJourneyMapReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  // new-item texts keyed by `${etapaId}-${fieldKey}`
  newTexts = signal<Record<string, string>>({});

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly cjmFields: CjmFieldConfig[] = CJM_FIELDS;

  // ─── Computed ─────────────────────────────────────────────────────────────
  filledCount = computed(
    () => this.data().etapas.filter(e => e.nombre.trim() || this.hasAnyContent(e)).length
  );

  canGenerate = computed(
    () => this.data().etapas.filter(e => this.hasAnyContent(e)).length >= 2
  );

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;

    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as CustomerJourneyMapData | undefined;
    const storedReports = (raw['reports'] as CustomerJourneyMapReportVersionDto[]) ?? [];

    this.data.set(stored ? { ...EMPTY_CJM, ...stored } : { ...EMPTY_CJM });
    this.reports.set(storedReports);
  }

  // ─── Context ──────────────────────────────────────────────────────────────
  onContextChange(field: 'personaje' | 'escenario', value: string): void {
    this.data.set({ ...this.data(), [field]: value });
    this.scheduleSave();
  }

  // ─── Etapas ───────────────────────────────────────────────────────────────
  addEtapa(): void {
    this.data.set({ ...this.data(), etapas: [...this.data().etapas, EMPTY_CJM_ETAPA()] });
    this.scheduleSave();
  }

  removeEtapa(id: string): void {
    this.data.set({ ...this.data(), etapas: this.data().etapas.filter(e => e.id !== id) });
    this.scheduleSave();
  }

  onEtapaNameChange(id: string, nombre: string): void {
    this.data.set({
      ...this.data(),
      etapas: this.data().etapas.map(e => e.id === id ? { ...e, nombre } : e),
    });
    this.scheduleSave();
  }

  // ─── Field items ──────────────────────────────────────────────────────────
  getFieldItems(etapa: CjmEtapa, key: CjmFieldConfig['key']): string[] {
    return etapa[key] as string[];
  }

  addFieldItem(etapaId: string, key: CjmFieldConfig['key']): void {
    const textKey = `${etapaId}-${key}`;
    const trimmed = (this.newTexts()[textKey] ?? '').trim();
    if (!trimmed) return;

    this.data.set({
      ...this.data(),
      etapas: this.data().etapas.map(e => {
        if (e.id !== etapaId) return e;
        return { ...e, [key]: [...(e[key] as string[]), trimmed] };
      }),
    });
    this.newTexts.set({ ...this.newTexts(), [textKey]: '' });
    this.scheduleSave();
  }

  removeFieldItem(etapaId: string, key: CjmFieldConfig['key'], index: number): void {
    this.data.set({
      ...this.data(),
      etapas: this.data().etapas.map(e => {
        if (e.id !== etapaId) return e;
        const arr = [...(e[key] as string[])];
        arr.splice(index, 1);
        return { ...e, [key]: arr };
      }),
    });
    this.scheduleSave();
  }

  getNewText(etapaId: string, key: CjmFieldConfig['key']): string {
    return this.newTexts()[`${etapaId}-${key}`] ?? '';
  }

  setNewText(etapaId: string, key: CjmFieldConfig['key'], value: string): void {
    this.newTexts.set({ ...this.newTexts(), [`${etapaId}-${key}`]: value });
  }

  // ─── Report ───────────────────────────────────────────────────────────────
  toggleReport(): void {
    this.showReport.set(!this.showReport());
  }

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;

    this.analyzing.set(true);
    try {
      const result = await this.cjmService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });

      const newVersion: CustomerJourneyMapReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };

      const updated = [newVersion, ...this.reports()];
      this.reports.set(updated);
      await this.persistData(updated);
      this.showReport.set(true);
      this.uiDialog.showSuccess('Informe generado', 'El análisis del Customer Journey Map fue generado correctamente.');
    } catch (error) {
      this.uiDialog.showError('Error', `No se pudo generar el informe: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      this.analyzing.set(false);
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  private hasAnyContent(etapa: CjmEtapa): boolean {
    return CJM_FIELDS.some(f => (etapa[f.key] as string[]).length > 0);
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

  private async persistData(reports: CustomerJourneyMapReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
