import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { MetaforaProblemaService } from '@core/services/metaforaProblemaService/metafora-problema.service';
import { MetaforaProblemaReportComponent } from './metafora-problema-report.component';
import { EMPTY_METAFORA_PROBLEMA, MetaforaItemDto, MetaforaProblemaData, MetaforaProblemaReportVersionDto } from './metafora-problema.types';

@Component({
  selector: 'app-metafora-problema-tool',
  standalone: true,
  imports: [FormsModule, MetaforaProblemaReportComponent],
  template: `
    <div class="mp">

      <!-- Header -->
      <div class="mp__header">
        <div class="mp__header-left">
          <span class="mp__badge">MP</span>
          <div>
            <p class="mp__title">Metáfora del Problema</p>
            <p class="mp__subtitle">
              {{ metaforasCompletas() }} metáfora{{ metaforasCompletas() === 1 ? '' : 's' }} completa{{ metaforasCompletas() === 1 ? '' : 's' }}
              @if (saving()) { <span class="mp__saving">· guardando…</span> }
            </p>
          </div>
        </div>
        <div class="mp__header-actions">
          @if (reports().length > 0) {
            <button class="mp__btn-ghost" (click)="showReport.set(!showReport())">
              <i class="pi pi-file-check"></i>
              Informes ({{ reports().length }})
            </button>
          }
          <button
            class="mp__btn-primary"
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

      <!-- Problema original -->
      <div class="mp__section">
        <label class="mp__label">Problema original</label>
        <textarea
          class="mp__textarea mp__textarea--tall"
          rows="3"
          placeholder="Ej: Los usuarios no encuentran respuestas en la app de soporte y terminan contactando soporte humano, generando altos costos operativos y frustración."
          [ngModel]="data().problemaOriginal"
          (ngModelChange)="updateField('problemaOriginal', $event)"
        ></textarea>
      </div>

      <!-- Reporte -->
      @if (showReport()) {
        <div class="mp__report-wrap">
          <app-metafora-problema-report [reports]="reports()" />
        </div>
      }

      <!-- Metáforas -->
      <div class="mp__list">
        @for (m of data().metaforas; track m.id; let i = $index) {
          <div class="mp__card">
            <div class="mp__card-header">
              <span class="mp__card-num">Metáfora {{ i + 1 }}</span>
              <button class="mp__card-delete" (click)="removeMetafora(i)" title="Eliminar">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <div class="mp__fields">
              <div class="mp__field">
                <label class="mp__field-label">Título de la metáfora</label>
                <input
                  class="mp__input"
                  type="text"
                  placeholder='Ej: "Como una biblioteca sin índice"'
                  [ngModel]="m.titulo"
                  (ngModelChange)="updateMetafora(i, 'titulo', $event)"
                />
              </div>

              <div class="mp__field-row">
                <div class="mp__field mp__field--grow">
                  <label class="mp__field-label">Tipo de metáfora</label>
                  <select
                    class="mp__select"
                    [ngModel]="m.tipo"
                    (ngModelChange)="updateMetafora(i, 'tipo', $event)"
                  >
                    <option value="">Seleccioná un tipo…</option>
                    <option value="Mundo físico">Mundo físico</option>
                    <option value="Naturaleza">Naturaleza</option>
                    <option value="Vida cotidiana">Vida cotidiana</option>
                    <option value="Otro dominio">Otro dominio</option>
                  </select>
                </div>
              </div>

              <div class="mp__field">
                <label class="mp__field-label">Descripción / Elaboración</label>
                <textarea
                  class="mp__textarea"
                  rows="2"
                  placeholder="Ej: Hay muchísima información pero no se puede encontrar. Tenés que leer todo para encontrar lo que buscás…"
                  [ngModel]="m.descripcion"
                  (ngModelChange)="updateMetafora(i, 'descripcion', $event)"
                ></textarea>
              </div>

              <!-- Insights -->
              <div class="mp__field">
                <label class="mp__field-label">Insights derivados</label>
                <div class="mp__chips">
                  @for (ins of m.insights; track $index; let j = $index) {
                    <span class="mp__chip">
                      {{ ins }}
                      <button class="mp__chip-remove" (click)="removeInsight(i, j)">
                        <i class="pi pi-times"></i>
                      </button>
                    </span>
                  }
                  <input
                    class="mp__chip-input"
                    type="text"
                    placeholder="Agregar insight…"
                    [ngModel]="insightBuffers()[i]"
                    (ngModelChange)="setInsightBuffer(i, $event)"
                    (keydown.enter)="addInsight(i)"
                  />
                </div>
              </div>
            </div>
          </div>
        }

        <button class="mp__add" (click)="addMetafora()">
          <i class="pi pi-plus"></i>
          Agregar metáfora
        </button>
      </div>

      <!-- Metáfora seleccionada -->
      @if (data().metaforas.length > 0) {
        <div class="mp__section">
          <label class="mp__label">Metáfora seleccionada</label>
          <p class="mp__hint">¿Con cuál metáfora te quedás? Escribí el enunciado final para usar con el equipo.</p>
          <textarea
            class="mp__textarea mp__textarea--selected"
            rows="2"
            placeholder='Ej: "La app de soporte es como una biblioteca sin índice — tiene todo lo que el usuario necesita, pero no puede encontrarlo."'
            [ngModel]="data().metaforaSeleccionada"
            (ngModelChange)="updateField('metaforaSeleccionada', $event)"
          ></textarea>
        </div>
      }

    </div>
  `,
  styles: [`
    .mp { display: flex; flex-direction: column; gap: 16px; }

    .mp__header {
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px; flex-wrap: wrap;
    }
    .mp__header-left { display: flex; align-items: center; gap: 10px; }
    .mp__badge {
      width: 36px; height: 36px; border-radius: 10px;
      background: linear-gradient(135deg, #ea580c, #c2410c);
      color: #fff; font-size: 0.6rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      letter-spacing: 0.02em; flex-shrink: 0;
    }
    .mp__title { margin: 0; font-size: 0.9375rem; font-weight: 700; color: #111827; }
    .mp__subtitle { margin: 0; font-size: 0.78rem; color: #6b7280; }
    .mp__saving { color: #ea580c; }

    .mp__header-actions { display: flex; gap: 8px; align-items: center; }

    .mp__btn-ghost {
      display: flex; align-items: center; gap: 5px;
      padding: 6px 12px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: transparent;
      font-size: 0.8125rem; color: var(--p-text-color); cursor: pointer;
      transition: background 0.15s;
    }
    .mp__btn-ghost:hover { background: var(--p-surface-100); }

    .mp__btn-primary {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 8px; border: none;
      background: linear-gradient(135deg, #ea580c, #c2410c);
      color: #fff; font-size: 0.8125rem; font-weight: 600; cursor: pointer;
      transition: opacity 0.15s;
    }
    .mp__btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
    .mp__btn-primary:not(:disabled):hover { opacity: 0.9; }

    .mp__section { display: flex; flex-direction: column; gap: 4px; }
    .mp__label { font-size: 0.78rem; font-weight: 600; color: #6b7280; }
    .mp__hint { margin: 0 0 4px; font-size: 0.75rem; color: #9ca3af; }

    .mp__textarea {
      width: 100%; box-sizing: border-box;
      padding: 8px 10px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: var(--p-surface-0);
      font-size: 0.8125rem; color: var(--p-text-color); line-height: 1.5;
      resize: vertical; font-family: inherit;
      transition: border-color 0.15s;
    }
    .mp__textarea:focus { outline: none; border-color: #ea580c; }
    .mp__textarea--tall { min-height: 72px; }
    .mp__textarea--selected { border-color: #fed7aa; background: #fff7ed; }
    .mp__textarea--selected:focus { border-color: #ea580c; }

    .mp__input {
      width: 100%; box-sizing: border-box;
      padding: 8px 10px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: var(--p-surface-0);
      font-size: 0.8125rem; color: var(--p-text-color); font-family: inherit;
      transition: border-color 0.15s;
    }
    .mp__input:focus { outline: none; border-color: #ea580c; }

    .mp__select {
      width: 100%; box-sizing: border-box;
      padding: 8px 10px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: var(--p-surface-0);
      font-size: 0.8125rem; color: var(--p-text-color); font-family: inherit;
      transition: border-color 0.15s; cursor: pointer;
    }
    .mp__select:focus { outline: none; border-color: #ea580c; }

    .mp__report-wrap { border-radius: 10px; overflow: hidden; }

    .mp__list { display: flex; flex-direction: column; gap: 12px; }

    .mp__card {
      display: flex; flex-direction: column; gap: 10px;
      padding: 14px; border-radius: 12px;
      border: 1px solid #fed7aa;
      background: #fff7ed;
    }

    .mp__card-header {
      display: flex; align-items: center; justify-content: space-between;
    }
    .mp__card-num {
      font-size: 0.75rem; font-weight: 700; color: #ea580c;
      text-transform: uppercase; letter-spacing: 0.08em;
    }
    .mp__card-delete {
      width: 24px; height: 24px; border-radius: 6px; border: none;
      background: transparent; color: #9ca3af;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: color 0.15s, background 0.15s;
    }
    .mp__card-delete:hover { color: #ef4444; background: #fee2e2; }
    .mp__card-delete .pi { font-size: 0.7rem; }

    .mp__fields { display: flex; flex-direction: column; gap: 8px; }
    .mp__field { display: flex; flex-direction: column; gap: 4px; }
    .mp__field-row { display: flex; gap: 8px; }
    .mp__field--grow { flex: 1; }
    .mp__field-label { font-size: 0.72rem; font-weight: 700; color: #ea580c; text-transform: uppercase; letter-spacing: 0.06em; }

    .mp__chips {
      display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
      min-height: 36px; padding: 6px 8px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: var(--p-surface-0);
    }
    .mp__chip {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 8px; border-radius: 20px;
      background: #ffedd5; color: #9a3412;
      font-size: 0.75rem; font-weight: 500;
    }
    .mp__chip-remove {
      border: none; background: transparent; color: #c2410c;
      cursor: pointer; padding: 0; line-height: 1; display: flex;
    }
    .mp__chip-remove .pi { font-size: 0.6rem; }
    .mp__chip-input {
      flex: 1; min-width: 120px; border: none; outline: none;
      background: transparent; font-size: 0.8125rem; color: var(--p-text-color);
      font-family: inherit;
    }

    .mp__add {
      display: flex; align-items: center; gap: 6px; justify-content: center;
      width: 100%; padding: 10px; border-radius: 10px;
      border: 2px dashed #fed7aa; background: transparent;
      font-size: 0.8125rem; color: #ea580c; cursor: pointer;
      transition: background 0.15s;
    }
    .mp__add:hover { background: #fff7ed; }
    .mp__add .pi { font-size: 0.75rem; }
  `],
})
export class MetaforaProblemaToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly metaforaProblemaService = inject(MetaforaProblemaService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<MetaforaProblemaData>({ ...EMPTY_METAFORA_PROBLEMA });
  reports = signal<MetaforaProblemaReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  insightBuffers = signal<Record<number, string | undefined>>({});

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  metaforasCompletas = computed(() =>
    this.data().metaforas.filter(m => m.titulo.trim() && m.insights.length > 0).length
  );

  canGenerate = computed(() => this.metaforasCompletas() >= 1);

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;
    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as MetaforaProblemaData | undefined;
    const storedReports = (raw['reports'] as MetaforaProblemaReportVersionDto[]) ?? [];
    this.data.set(stored ?? { ...EMPTY_METAFORA_PROBLEMA });
    this.reports.set(storedReports);
  }

  updateField(field: 'problemaOriginal' | 'metaforaSeleccionada', value: string): void {
    this.data.set({ ...this.data(), [field]: value });
    this.scheduleSave();
  }

  addMetafora(): void {
    const newM: MetaforaItemDto = { id: crypto.randomUUID(), titulo: '', descripcion: '', tipo: '', insights: [] };
    this.data.set({ ...this.data(), metaforas: [...this.data().metaforas, newM] });
    this.scheduleSave();
  }

  updateMetafora(index: number, field: keyof MetaforaItemDto, value: string): void {
    const metaforas = this.data().metaforas.map((m, i) => i === index ? { ...m, [field]: value } : m);
    this.data.set({ ...this.data(), metaforas });
    this.scheduleSave();
  }

  removeMetafora(index: number): void {
    const metaforas = this.data().metaforas.filter((_, i) => i !== index);
    this.data.set({ ...this.data(), metaforas });
    this.scheduleSave();
  }

  setInsightBuffer(index: number, value: string): void {
    this.insightBuffers.set({ ...this.insightBuffers(), [index]: value });
  }

  addInsight(index: number): void {
    const value = (this.insightBuffers()[index] ?? '').trim();
    if (!value) return;
    const metaforas = this.data().metaforas.map((m, i) =>
      i === index ? { ...m, insights: [...m.insights, value] } : m
    );
    this.data.set({ ...this.data(), metaforas });
    this.insightBuffers.set({ ...this.insightBuffers(), [index]: '' });
    this.scheduleSave();
  }

  removeInsight(metaforaIndex: number, insightIndex: number): void {
    const metaforas = this.data().metaforas.map((m, i) =>
      i === metaforaIndex ? { ...m, insights: m.insights.filter((_, j) => j !== insightIndex) } : m
    );
    this.data.set({ ...this.data(), metaforas });
    this.scheduleSave();
  }

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;
    this.analyzing.set(true);
    try {
      const result = await this.metaforaProblemaService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });
      const newVersion: MetaforaProblemaReportVersionDto = {
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

  private async persistData(reports: MetaforaProblemaReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
