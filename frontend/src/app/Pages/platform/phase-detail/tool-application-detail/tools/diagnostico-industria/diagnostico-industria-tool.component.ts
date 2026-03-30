import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { DiagnosticoIndustriaService } from '@core/services/diagnosticoIndustriaService/diagnostico-industria.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { DiagnosticoIndustriaReportComponent } from './diagnostico-industria-report.component';
import {
  DIAGNOSTICO_FORCES,
  EMPTY_INPUTS,
  DiagnosticoInputs,
  DiagnosticoReportVersionDto,
} from './diagnostico-industria.types';

@Component({
  selector: 'app-diagnostico-industria-tool',
  standalone: true,
  imports: [FormsModule, DiagnosticoIndustriaReportComponent],
  template: `
    <div class="diag">

      <!-- Header -->
      <div class="diag__header">
        <div class="diag__header-left">
          <div class="diag__badge">
            <i class="pi pi-chart-bar"></i>
          </div>
          <div class="diag__title-block">
            <span class="diag__title">Diagnóstico de la Industria</span>
            <span class="diag__subtitle">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              } @else {
                {{ filledCount() }}/6 fuerzas completadas
              }
            </span>
          </div>
        </div>
        <div class="diag__header-actions">
          <button
            class="diag__btn diag__btn--ghost"
            (click)="toggleReport()"
            [class.diag__btn--active]="showReport()"
          >
            <i class="pi pi-chart-bar"></i>
            Informes {{ reports().length ? '(' + reports().length + ')' : '' }}
          </button>
          <button
            class="diag__btn diag__btn--primary"
            (click)="generateReport()"
            [disabled]="!canGenerate() || analyzing()"
            [title]="!canGenerate() ? 'Completá al menos 2 fuerzas para analizar' : 'Generar informe con IA'"
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
      <div class="diag__content">
        @if (showReport()) {
          <app-diagnostico-industria-report [reports]="reports()" />
        } @else {
          <div class="diag__form">

            <!-- 5 Fuerzas -->
            @for (force of forces; track force.key) {
              <div
                class="diag__force"
                [style.background]="force.accentBg"
                [style.border-color]="force.borderColor"
              >
                <div class="diag__force-header">
                  <i class="pi {{ force.icon }}" [style.color]="force.textColor"></i>
                  <span class="diag__force-label" [style.color]="force.textColor">{{ force.label }}</span>
                  @if (inputs()[force.key]?.trim()) {
                    <span class="diag__force-check" [style.color]="force.textColor">
                      <i class="pi pi-check-circle"></i>
                    </span>
                  }
                </div>
                <p class="diag__force-hint">{{ force.description }}</p>
                <textarea
                  class="diag__textarea"
                  [placeholder]="force.placeholder"
                  [ngModel]="inputs()[force.key]"
                  (ngModelChange)="updateInput(force.key, $event)"
                  rows="3"
                  [style.--force-border]="force.borderColor"
                  [style.--force-accent]="force.accentColor"
                ></textarea>
              </div>
            }

            <!-- Separador -->
            <div class="diag__divider">
              <span>Contexto adicional</span>
            </div>

            <!-- Tendencias -->
            <div class="diag__force diag__force--trends">
              <div class="diag__force-header">
                <i class="pi pi-chart-line" style="color: #6b7280"></i>
                <span class="diag__force-label" style="color: #374151">Tendencias y contexto del sector</span>
                @if (inputs().tendencias.trim()) {
                  <span class="diag__force-check" style="color: #6b7280">
                    <i class="pi pi-check-circle"></i>
                  </span>
                }
              </div>
              <p class="diag__force-hint">Tendencias macro, regulación, tecnología, cambios sociales relevantes.</p>
              <textarea
                class="diag__textarea"
                placeholder="Ej: El sector está siendo impactado por IA generativa, la regulación de datos se está endureciendo..."
                [ngModel]="inputs().tendencias"
                (ngModelChange)="updateInput('tendencias', $event)"
                rows="4"
              ></textarea>
            </div>

          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    .diag {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 12px;
    }

    /* ─── Header ─────────────────────────────────────────────────── */
    .diag__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-shrink: 0;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--p-surface-200);
    }

    .diag__header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .diag__badge {
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

    .diag__title-block {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .diag__title {
      font-family: 'Syne', sans-serif;
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--p-text-color);
      line-height: 1.2;
    }

    .diag__subtitle {
      font-size: 0.72rem;
      color: var(--p-text-muted-color);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .diag__header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* ─── Buttons ─────────────────────────────────────────────────── */
    .diag__btn {
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

    .diag__btn--ghost {
      background: transparent;
      border-color: var(--p-surface-300);
      color: var(--p-text-secondary-color);

      &:hover:not(:disabled) { background: var(--p-surface-100); }
      &.diag__btn--active { background: var(--p-primary-50, #eff6ff); border-color: var(--p-primary-200, #bfdbfe); color: var(--p-primary-700, #1d4ed8); }
    }

    .diag__btn--primary {
      background: var(--p-primary-600, #0284c7);
      color: white;
      border-color: var(--p-primary-600, #0284c7);

      &:hover:not(:disabled) { background: var(--p-primary-700, #0369a1); }
    }

    /* ─── Content ─────────────────────────────────────────────────── */
    .diag__content {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }

    .diag__form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      overflow-y: auto;
      flex: 1;
      padding-right: 2px;
    }

    /* ─── Force cards ─────────────────────────────────────────────── */
    .diag__force {
      border-radius: 10px;
      padding: 12px 14px;
      border: 1px solid;
      display: flex;
      flex-direction: column;
      gap: 6px;

    }

    .diag__force--trends {
      background: var(--p-surface-50, #f9fafb);
      border-color: var(--p-surface-200);
    }

    .diag__force-header {
      display: flex;
      align-items: center;
      gap: 7px;

      .pi { font-size: 0.8rem; flex-shrink: 0; }
    }

    .diag__force-label {
      font-size: 0.75rem;
      font-weight: 700;
      font-family: 'Syne', sans-serif;
      flex: 1;
    }

    .diag__force-check {
      font-size: 0.75rem;
      opacity: 0.8;
    }

    .diag__force-hint {
      font-size: 0.72rem;
      color: var(--p-text-muted-color);
      margin: 0;
      line-height: 1.5;
    }

    .diag__textarea {
      width: 100%;
      box-sizing: border-box;
      resize: vertical;
      border-radius: 8px;
      border: 1px solid var(--force-border, var(--p-surface-300));
      padding: 8px 10px;
      font-size: 0.82rem;
      line-height: 1.6;
      background: rgba(255, 255, 255, 0.85);
      color: var(--p-text-color);
      outline: none;
      font-family: inherit;
      transition: border-color 0.15s, box-shadow 0.15s;

      &::placeholder { color: #9ca3af; font-size: 0.78rem; }
      &:focus {
        border-color: var(--force-accent, var(--p-primary-500));
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--force-accent, var(--p-primary-500)) 18%, transparent);
      }
    }

    /* ─── Divider ─────────────────────────────────────────────────── */
    .diag__divider {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 2px 0;

      &::before, &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: var(--p-surface-200);
      }

      span {
        font-size: 0.65rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--p-text-muted-color);
        white-space: nowrap;
      }
    }
  `],
})
export class DiagnosticoIndustriaToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly diagnosticoService = inject(DiagnosticoIndustriaService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  // ─── Estado ───────────────────────────────────────────────────────────────
  inputs = signal<DiagnosticoInputs>({ ...EMPTY_INPUTS });
  reports = signal<DiagnosticoReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly forces = DIAGNOSTICO_FORCES;

  // ─── Computed ─────────────────────────────────────────────────────────────
  filledCount = computed(() => {
    const inp = this.inputs();
    const forcesFilled = DIAGNOSTICO_FORCES.filter((f) => inp[f.key]?.trim().length > 0).length;
    const tendenciasFilled = inp.tendencias?.trim().length > 0 ? 1 : 0;
    return forcesFilled + tendenciasFilled;
  });

  canGenerate = computed(() => this.filledCount() >= 2);

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;

    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const storedInputs = raw['inputs'] as DiagnosticoInputs | undefined;
    const storedReports = (raw['reports'] as DiagnosticoReportVersionDto[]) ?? [];

    this.inputs.set(storedInputs ? { ...EMPTY_INPUTS, ...storedInputs } : { ...EMPTY_INPUTS });
    this.reports.set(storedReports);
  }

  // ─── Acciones ─────────────────────────────────────────────────────────────
  updateInput(key: keyof DiagnosticoInputs, value: string): void {
    this.inputs.set({ ...this.inputs(), [key]: value });
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
      const result = await this.diagnosticoService.analyze({
        toolApplicationId: app.id,
        inputs: this.inputs(),
        currentVersion: this.reports().length,
      });

      const newVersion: DiagnosticoReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };

      const updatedReports = [newVersion, ...this.reports()];
      this.reports.set(updatedReports);

      await this.persistData(updatedReports);
      this.showReport.set(true);
      this.uiDialog.showSuccess('Diagnóstico generado', 'El análisis de industria fue generado y guardado correctamente.');
    } catch (error) {
      this.uiDialog.showError('Error', `No se pudo generar el diagnóstico: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      this.analyzing.set(false);
    }
  }

  // ─── Privados ─────────────────────────────────────────────────────────────
  private scheduleSave(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.saveInputData(), 800);
  }

  private async saveInputData(): Promise<void> {
    const app = this.application();
    if (!app) return;

    this.saving.set(true);
    try {
      const currentData = (app.structuredData as Record<string, unknown>) ?? {};
      await this.toolApplicationService.update(app.id, {
        structuredData: { ...currentData, inputs: this.inputs() },
      });
      this.sessionSaved.emit();
    } catch {
      // silent — datos en memoria, no se pierden
    } finally {
      this.saving.set(false);
    }
  }

  private async persistData(reports: DiagnosticoReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;

    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, inputs: this.inputs(), reports },
    });
    this.sessionSaved.emit();
  }
}
