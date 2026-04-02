import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { PovService } from '@core/services/povService/pov.service';
import { PovReportComponent } from './pov-report.component';
import { EMPTY_POV, PovData, PovItemDto, PovReportVersionDto } from './pov.types';

@Component({
  selector: 'app-pov-tool',
  standalone: true,
  imports: [FormsModule, PovReportComponent],
  template: `
    <div class="pov">

      <!-- Header -->
      <div class="pov__header">
        <div class="pov__header-left">
          <span class="pov__badge">POV</span>
          <div>
            <p class="pov__title">Point of View</p>
            <p class="pov__subtitle">
              {{ povsCompletos() }} POV{{ povsCompletos() === 1 ? '' : 's' }} completo{{ povsCompletos() === 1 ? '' : 's' }}
              @if (saving()) { <span class="pov__saving">· guardando…</span> }
            </p>
          </div>
        </div>
        <div class="pov__header-actions">
          @if (reports().length > 0) {
            <button class="pov__btn-ghost" (click)="showReport.set(!showReport())">
              <i class="pi pi-file-check"></i>
              Informes ({{ reports().length }})
            </button>
          }
          <button
            class="pov__btn-primary"
            [disabled]="!canGenerate() || analyzing()"
            (click)="generateReport()"
          >
            @if (analyzing()) {
              <i class="pi pi-spin pi-spinner"></i> Analizando…
            } @else {
              <i class="pi pi-sparkles"></i> Analizar
            }
          </button>
        </div>
      </div>

      <!-- Contexto de investigación -->
      <div class="pov__context">
        <label class="pov__label">Contexto de la investigación (opcional)</label>
        <textarea
          class="pov__textarea pov__textarea--context"
          rows="2"
          placeholder="Ej: Investigación con 12 freelancers en LATAM. Combinamos entrevistas + encuestas. Problema central: facturación y cobranza…"
          [ngModel]="data().contexto"
          (ngModelChange)="updateContexto($event)"
        ></textarea>
      </div>

      <!-- Reporte -->
      @if (showReport()) {
        <div class="pov__report-wrap">
          <app-pov-report [reports]="reports()" />
        </div>
      }

      <!-- POVs -->
      <div class="pov__list">
        @for (pov of data().povs; track pov.id; let i = $index) {
          <div class="pov__card">
            <div class="pov__card-header">
              <span class="pov__card-num">POV {{ i + 1 }}</span>
              <button class="pov__card-delete" (click)="removePov(i)" title="Eliminar">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <div class="pov__fields">
              <div class="pov__field">
                <label class="pov__field-label">Usuario</label>
                <input
                  class="pov__input"
                  type="text"
                  placeholder="Ej: María, emprendedora freelance de 32 años que trabaja desde su teléfono"
                  [ngModel]="pov.usuario"
                  (ngModelChange)="updatePov(i, 'usuario', $event)"
                />
              </div>
              <div class="pov__field">
                <label class="pov__field-label">Necesidad</label>
                <input
                  class="pov__input"
                  type="text"
                  placeholder="Ej: poder crear y enviar facturas profesionales instantáneamente"
                  [ngModel]="pov.necesidad"
                  (ngModelChange)="updatePov(i, 'necesidad', $event)"
                />
              </div>
              <div class="pov__field">
                <label class="pov__field-label">Insight (por qué es importante)</label>
                <textarea
                  class="pov__textarea"
                  rows="2"
                  placeholder="Ej: actualmente pierde clientes al no poder emitir facturas al momento, y el proceso manual le toma 2+ horas semanales"
                  [ngModel]="pov.insight"
                  (ngModelChange)="updatePov(i, 'insight', $event)"
                ></textarea>
              </div>
            </div>

            @if (pov.usuario.trim() && pov.necesidad.trim() && pov.insight.trim()) {
              <div class="pov__statement">
                <i class="pi pi-quote-left pov__quote-icon"></i>
                <p class="pov__statement-text">
                  <strong>{{ pov.usuario }}</strong> necesita <em>{{ pov.necesidad }}</em> porque {{ pov.insight }}.
                </p>
              </div>
            }
          </div>
        }

        <button class="pov__add" (click)="addPov()">
          <i class="pi pi-plus"></i>
          Agregar POV
        </button>
      </div>

    </div>
  `,
  styles: [`
    .pov { display: flex; flex-direction: column; gap: 16px; }

    .pov__header {
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px; flex-wrap: wrap;
    }
    .pov__header-left { display: flex; align-items: center; gap: 10px; }
    .pov__badge {
      width: 36px; height: 36px; border-radius: 10px;
      background: linear-gradient(135deg, #7c3aed, #6d28d9);
      color: #fff; font-size: 0.6rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      letter-spacing: 0.02em; flex-shrink: 0;
    }
    .pov__title { margin: 0; font-size: 0.9375rem; font-weight: 700; color: #111827; }
    .pov__subtitle { margin: 0; font-size: 0.78rem; color: #6b7280; }
    .pov__saving { color: #7c3aed; }

    .pov__header-actions { display: flex; gap: 8px; align-items: center; }

    .pov__btn-ghost {
      display: flex; align-items: center; gap: 5px;
      padding: 6px 12px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: transparent;
      font-size: 0.8125rem; color: var(--p-text-color); cursor: pointer;
      transition: background 0.15s;
    }
    .pov__btn-ghost:hover { background: var(--p-surface-100); }

    .pov__btn-primary {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 8px; border: none;
      background: linear-gradient(135deg, #7c3aed, #6d28d9);
      color: #fff; font-size: 0.8125rem; font-weight: 600; cursor: pointer;
      transition: opacity 0.15s;
    }
    .pov__btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
    .pov__btn-primary:not(:disabled):hover { opacity: 0.9; }

    .pov__context { display: flex; flex-direction: column; gap: 4px; }
    .pov__label { font-size: 0.78rem; font-weight: 600; color: #6b7280; }

    .pov__textarea {
      width: 100%; box-sizing: border-box;
      padding: 8px 10px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: var(--p-surface-0);
      font-size: 0.8125rem; color: var(--p-text-color); line-height: 1.5;
      resize: vertical; font-family: inherit;
      transition: border-color 0.15s;
    }
    .pov__textarea:focus { outline: none; border-color: #7c3aed; }

    .pov__input {
      width: 100%; box-sizing: border-box;
      padding: 8px 10px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: var(--p-surface-0);
      font-size: 0.8125rem; color: var(--p-text-color); font-family: inherit;
      transition: border-color 0.15s;
    }
    .pov__input:focus { outline: none; border-color: #7c3aed; }

    .pov__report-wrap { border-radius: 10px; overflow: hidden; }

    .pov__list { display: flex; flex-direction: column; gap: 12px; }

    .pov__card {
      display: flex; flex-direction: column; gap: 10px;
      padding: 14px; border-radius: 12px;
      border: 1px solid #ede9fe;
      background: #faf5ff;
    }

    .pov__card-header {
      display: flex; align-items: center; justify-content: space-between;
    }
    .pov__card-num {
      font-size: 0.75rem; font-weight: 700; color: #7c3aed;
      text-transform: uppercase; letter-spacing: 0.08em;
    }
    .pov__card-delete {
      width: 24px; height: 24px; border-radius: 6px; border: none;
      background: transparent; color: #9ca3af;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: color 0.15s, background 0.15s;
    }
    .pov__card-delete:hover { color: #ef4444; background: #fee2e2; }
    .pov__card-delete .pi { font-size: 0.7rem; }

    .pov__fields { display: flex; flex-direction: column; gap: 8px; }

    .pov__field { display: flex; flex-direction: column; gap: 4px; }
    .pov__field-label { font-size: 0.72rem; font-weight: 700; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.06em; }

    .pov__statement {
      display: flex; gap: 8px; align-items: flex-start;
      padding: 10px 12px; border-radius: 8px;
      background: rgba(124, 58, 237, 0.07); border-left: 3px solid #7c3aed;
    }
    .pov__quote-icon { color: #c4b5fd; font-size: 0.875rem; margin-top: 2px; flex-shrink: 0; }
    .pov__statement-text { margin: 0; font-size: 0.8125rem; color: #374151; line-height: 1.6; font-style: italic; }

    .pov__add {
      display: flex; align-items: center; gap: 6px; justify-content: center;
      width: 100%; padding: 10px; border-radius: 10px;
      border: 2px dashed #c4b5fd; background: transparent;
      font-size: 0.8125rem; color: #7c3aed; cursor: pointer;
      transition: background 0.15s;
    }
    .pov__add:hover { background: #f5f3ff; }
    .pov__add .pi { font-size: 0.75rem; }
  `],
})
export class PovToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly povService = inject(PovService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<PovData>({ ...EMPTY_POV });
  reports = signal<PovReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  povsCompletos = computed(() =>
    this.data().povs.filter(p => p.usuario.trim() && p.necesidad.trim() && p.insight.trim()).length
  );

  canGenerate = computed(() => this.povsCompletos() >= 1);

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;
    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as PovData | undefined;
    const storedReports = (raw['reports'] as PovReportVersionDto[]) ?? [];
    this.data.set(stored ?? { ...EMPTY_POV });
    this.reports.set(storedReports);
  }

  updateContexto(value: string): void {
    this.data.set({ ...this.data(), contexto: value });
    this.scheduleSave();
  }

  addPov(): void {
    const newPov: PovItemDto = { id: crypto.randomUUID(), usuario: '', necesidad: '', insight: '' };
    this.data.set({ ...this.data(), povs: [...this.data().povs, newPov] });
    this.scheduleSave();
  }

  updatePov(index: number, field: keyof PovItemDto, value: string): void {
    const povs = this.data().povs.map((p, i) => i === index ? { ...p, [field]: value } : p);
    this.data.set({ ...this.data(), povs });
    this.scheduleSave();
  }

  removePov(index: number): void {
    const povs = this.data().povs.filter((_, i) => i !== index);
    this.data.set({ ...this.data(), povs });
    this.scheduleSave();
  }

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;
    this.analyzing.set(true);
    try {
      const result = await this.povService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });
      const newVersion: PovReportVersionDto = {
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

  private async persistData(reports: PovReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
