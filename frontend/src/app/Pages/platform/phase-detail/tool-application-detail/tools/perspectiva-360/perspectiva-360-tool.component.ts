import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { Perspectiva360Service } from '@core/services/perspectiva360Service/perspectiva-360.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { Perspectiva360ReportComponent } from './perspectiva-360-report.component';
import {
  EMPTY_PERSPECTIVA_360,
  PERSPECTIVA_CONFIG,
  Perspectiva360Data,
  Perspectiva360ReportVersionDto,
  PerspectivaSectionDto,
} from './perspectiva-360.types';

@Component({
  selector: 'app-perspectiva-360-tool',
  standalone: true,
  imports: [FormsModule, Perspectiva360ReportComponent],
  template: `
    <div class="p360">

      <!-- Header -->
      <div class="p360__header">
        <div class="p360__header-left">
          <div class="p360__badge">
            <i class="pi pi-eye"></i>
          </div>
          <div class="p360__title-block">
            <span class="p360__title">Perspectiva 360</span>
            <span class="p360__subtitle">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              } @else {
                {{ completedCount() }} de 7 perspectivas con insights
              }
            </span>
          </div>
        </div>
        <div class="p360__header-actions">
          <button
            class="p360__btn p360__btn--ghost"
            (click)="toggleReport()"
            [class.p360__btn--active]="showReport()"
          >
            <i class="pi pi-chart-bar"></i>
            Informes {{ reports().length ? '(' + reports().length + ')' : '' }}
          </button>
          <button
            class="p360__btn p360__btn--primary"
            (click)="generateReport()"
            [disabled]="!canGenerate() || analyzing()"
            [title]="!canGenerate() ? 'Completá al menos 2 perspectivas para analizar' : 'Generar análisis con IA'"
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
      <div class="p360__content">
        @if (showReport()) {
          <app-perspectiva-360-report [reports]="reports()" />
        } @else {
          <div class="p360__body">

            <!-- Objeto de estudio -->
            <div class="p360__objeto-section">
              <label class="p360__objeto-label">
                <i class="pi pi-crosshairs"></i>
                Objeto de Estudio
              </label>
              <input
                class="p360__objeto-input"
                type="text"
                placeholder="¿Qué producto, servicio o problema estás analizando?"
                [ngModel]="data().objeto"
                (ngModelChange)="updateField('objeto', $event)"
              />
            </div>

            <!-- Perspectivas grid -->
            <div class="p360__grid">
              @for (config of perspectivas; track config.key) {
                <div
                  class="p360__card"
                  [class.p360__card--filled]="hasInsights(config.key)"
                  [style.--accent]="config.color"
                >
                  <div class="p360__card-header">
                    <div class="p360__card-icon-wrap" [style.background]="config.color + '20'" [style.color]="config.color">
                      <i [class]="'pi ' + config.icon"></i>
                    </div>
                    <div class="p360__card-meta">
                      <span class="p360__card-title">{{ config.label }}</span>
                      <span class="p360__card-pregunta">{{ config.pregunta }}</span>
                    </div>
                    @if (hasInsights(config.key)) {
                      <span class="p360__card-count" [style.background]="config.color + '20'" [style.color]="config.color">
                        {{ getSection(config.key).insights.length }}
                      </span>
                    }
                  </div>

                  <!-- Insights list -->
                  <div class="p360__insights-list">
                    @for (ins of getSection(config.key).insights; track $index; let i = $index) {
                      <div class="p360__insight-item" [style.border-left-color]="config.color">
                        <span class="p360__insight-text">{{ ins }}</span>
                        <button class="p360__insight-remove" (click)="removeInsight(config.key, i)">
                          <i class="pi pi-times"></i>
                        </button>
                      </div>
                    }
                  </div>

                  <!-- Add insight -->
                  <div class="p360__add-row">
                    <input
                      class="p360__add-input"
                      type="text"
                      [placeholder]="config.placeholder"
                      [ngModel]="newInsight()[config.key] || ''"
                      (ngModelChange)="setNewInsight(config.key, $event)"
                      (keydown.enter)="addInsight(config.key)"
                    />
                    <button
                      class="p360__add-btn"
                      [style.background]="config.color"
                      (click)="addInsight(config.key)"
                      [disabled]="!(newInsight()[config.key]?.trim())"
                    >
                      <i class="pi pi-plus"></i>
                    </button>
                  </div>

                  <!-- Fuentes y notas -->
                  <div class="p360__card-footer">
                    <input
                      class="p360__footer-input"
                      type="text"
                      placeholder="Fuentes de información..."
                      [ngModel]="getSection(config.key).fuentes"
                      (ngModelChange)="updateSection(config.key, 'fuentes', $event)"
                    />
                  </div>
                </div>
              }
            </div>

            <!-- Síntesis -->
            <div class="p360__sintesis-section">
              <div class="p360__sintesis-header">
                <i class="pi pi-lightbulb p360__sintesis-icon"></i>
                <span class="p360__sintesis-title">Síntesis y Visión Consolidada</span>
              </div>
              <textarea
                class="p360__sintesis-textarea"
                placeholder="¿Qué insight emerge de ver todas las perspectivas juntas? ¿Dónde están las tensiones? ¿Cuál es la oportunidad clave?"
                [ngModel]="data().sintesis"
                (ngModelChange)="updateField('sintesis', $event)"
                rows="4"
              ></textarea>
            </div>

          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    .p360 {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 12px;
    }

    /* ─── Header ───────────────────────────────────────────────────── */
    .p360__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-shrink: 0;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--p-surface-200);
    }

    .p360__header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .p360__badge {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
      flex-shrink: 0;
    }

    .p360__title {
      display: block;
      font-weight: 700;
      font-size: 15px;
      color: var(--p-surface-900);
    }

    .p360__subtitle {
      display: block;
      font-size: 12px;
      color: var(--p-surface-500);
      margin-top: 2px;
    }

    .p360__header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    /* ─── Buttons ───────────────────────────────────────────────────── */
    .p360__btn {
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

    .p360__btn--ghost {
      background: transparent;
      border: 1px solid var(--p-surface-300);
      color: var(--p-surface-600);
    }

    .p360__btn--ghost:hover {
      background: var(--p-surface-100);
    }

    .p360__btn--active {
      background: var(--p-blue-50);
      border-color: var(--p-blue-200);
      color: var(--p-blue-700);
    }

    .p360__btn--primary {
      background: #6366f1;
      color: white;
    }

    .p360__btn--primary:hover:not(:disabled) {
      background: #4f46e5;
    }

    .p360__btn--primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* ─── Content ───────────────────────────────────────────────────── */
    .p360__content {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
    }

    .p360__body {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* ─── Objeto ────────────────────────────────────────────────────── */
    .p360__objeto-section {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--p-surface-50);
      border: 1px solid var(--p-surface-200);
      border-radius: 10px;
      padding: 12px 14px;
    }

    .p360__objeto-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
      color: var(--p-surface-600);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .p360__objeto-input {
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

    .p360__objeto-input:focus {
      border-color: #6366f1;
    }

    /* ─── Grid ──────────────────────────────────────────────────────── */
    .p360__grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 12px;
    }

    /* ─── Cards ─────────────────────────────────────────────────────── */
    .p360__card {
      background: white;
      border: 1px solid var(--p-surface-200);
      border-radius: 12px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: border-color 0.15s;
    }

    .p360__card--filled {
      border-color: var(--accent, var(--p-surface-300));
      border-opacity: 0.4;
    }

    .p360__card-header {
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }

    .p360__card-icon-wrap {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
    }

    .p360__card-meta {
      flex: 1;
      min-width: 0;
    }

    .p360__card-title {
      display: block;
      font-size: 13px;
      font-weight: 700;
      color: var(--p-surface-800);
    }

    .p360__card-pregunta {
      display: block;
      font-size: 11px;
      color: var(--p-surface-500);
      margin-top: 2px;
      line-height: 1.3;
    }

    .p360__card-count {
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 10px;
      flex-shrink: 0;
    }

    /* ─── Insights ──────────────────────────────────────────────────── */
    .p360__insights-list {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .p360__insight-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 6px 8px;
      background: var(--p-surface-50);
      border-radius: 6px;
      border-left: 3px solid transparent;
    }

    .p360__insight-text {
      flex: 1;
      font-size: 12px;
      color: var(--p-surface-700);
      line-height: 1.4;
    }

    .p360__insight-remove {
      background: none;
      border: none;
      color: var(--p-surface-400);
      cursor: pointer;
      padding: 2px;
      border-radius: 4px;
      font-size: 10px;
      flex-shrink: 0;
      transition: color 0.15s;
    }

    .p360__insight-remove:hover {
      color: var(--p-red-400);
    }

    /* ─── Add row ───────────────────────────────────────────────────── */
    .p360__add-row {
      display: flex;
      gap: 6px;
    }

    .p360__add-input {
      flex: 1;
      padding: 7px 10px;
      border: 1px solid var(--p-surface-300);
      border-radius: 7px;
      font-size: 12px;
      background: white;
      color: var(--p-surface-800);
      outline: none;
      transition: border-color 0.15s;
    }

    .p360__add-input:focus {
      border-color: #6366f1;
    }

    .p360__add-btn {
      padding: 7px 10px;
      border-radius: 7px;
      color: white;
      border: none;
      cursor: pointer;
      font-size: 12px;
      transition: opacity 0.15s;
      flex-shrink: 0;
    }

    .p360__add-btn:hover:not(:disabled) {
      opacity: 0.85;
    }

    .p360__add-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    /* ─── Card footer ───────────────────────────────────────────────── */
    .p360__card-footer {
      border-top: 1px solid var(--p-surface-100);
      padding-top: 8px;
    }

    .p360__footer-input {
      width: 100%;
      padding: 5px 8px;
      border: 1px solid var(--p-surface-200);
      border-radius: 6px;
      font-size: 11px;
      background: var(--p-surface-50);
      color: var(--p-surface-600);
      outline: none;
      transition: border-color 0.15s;
      box-sizing: border-box;
    }

    .p360__footer-input:focus {
      border-color: #6366f1;
    }

    /* ─── Síntesis ──────────────────────────────────────────────────── */
    .p360__sintesis-section {
      background: var(--p-surface-50);
      border: 1px solid var(--p-surface-200);
      border-radius: 12px;
      padding: 16px;
    }

    .p360__sintesis-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .p360__sintesis-icon {
      color: #6366f1;
      font-size: 15px;
    }

    .p360__sintesis-title {
      font-weight: 600;
      font-size: 14px;
      color: var(--p-surface-800);
    }

    .p360__sintesis-textarea {
      width: 100%;
      padding: 10px 12px;
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

    .p360__sintesis-textarea:focus {
      border-color: #6366f1;
    }

    /* ─── Responsive ────────────────────────────────────────────────── */
    @media (max-width: 640px) {
      .p360__grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class Perspectiva360ToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly perspectiva360Service = inject(Perspectiva360Service);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<Perspectiva360Data>({ ...EMPTY_PERSPECTIVA_360 });
  reports = signal<Perspectiva360ReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);
  newInsight = signal<Record<string, string>>({});

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly perspectivas = PERSPECTIVA_CONFIG;

  completedCount = computed(() =>
    PERSPECTIVA_CONFIG.filter(c => this.data()[c.key].insights.length > 0).length
  );

  canGenerate = computed(() => this.completedCount() >= 2);

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;

    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as Perspectiva360Data | undefined;
    const storedReports = (raw['reports'] as Perspectiva360ReportVersionDto[]) ?? [];

    this.data.set(stored ?? { ...EMPTY_PERSPECTIVA_360 });
    this.reports.set(storedReports);
  }

  toggleReport(): void {
    this.showReport.set(!this.showReport());
  }

  // ─── Field updates ──────────────────────────────────────────────────────────

  updateField(field: 'objeto' | 'sintesis', value: string): void {
    this.data.set({ ...this.data(), [field]: value });
    this.scheduleSave();
  }

  updateSection(
    key: keyof Omit<Perspectiva360Data, 'objeto' | 'sintesis'>,
    field: keyof PerspectivaSectionDto,
    value: string,
  ): void {
    const current = this.data()[key];
    this.data.set({ ...this.data(), [key]: { ...current, [field]: value } });
    this.scheduleSave();
  }

  // ─── Insights ───────────────────────────────────────────────────────────────

  getSection(key: keyof Omit<Perspectiva360Data, 'objeto' | 'sintesis'>): PerspectivaSectionDto {
    return this.data()[key];
  }

  hasInsights(key: keyof Omit<Perspectiva360Data, 'objeto' | 'sintesis'>): boolean {
    return this.data()[key].insights.length > 0;
  }

  setNewInsight(key: string, value: string): void {
    this.newInsight.set({ ...this.newInsight(), [key]: value });
  }

  addInsight(key: keyof Omit<Perspectiva360Data, 'objeto' | 'sintesis'>): void {
    const text = this.newInsight()[key]?.trim();
    if (!text) return;
    const section = this.data()[key];
    this.data.set({ ...this.data(), [key]: { ...section, insights: [...section.insights, text] } });
    this.newInsight.set({ ...this.newInsight(), [key]: '' });
    this.scheduleSave();
  }

  removeInsight(key: keyof Omit<Perspectiva360Data, 'objeto' | 'sintesis'>, index: number): void {
    const section = this.data()[key];
    this.data.set({
      ...this.data(),
      [key]: { ...section, insights: section.insights.filter((_, i) => i !== index) },
    });
    this.scheduleSave();
  }

  // ─── AI analysis ────────────────────────────────────────────────────────────

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;

    this.analyzing.set(true);
    try {
      const result = await this.perspectiva360Service.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });

      const newVersion: Perspectiva360ReportVersionDto = {
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

  private async persistData(reports: Perspectiva360ReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
