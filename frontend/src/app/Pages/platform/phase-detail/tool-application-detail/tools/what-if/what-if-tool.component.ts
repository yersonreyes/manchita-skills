import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { WhatIfService } from '@core/services/whatIfService/what-if.service';
import { WhatIfReportComponent } from './what-if-report.component';
import {
  EMPTY_WHAT_IF,
  TIPOS_WHAT_IF,
  WhatIfData,
  WhatIfPreguntaDto,
  WhatIfReportVersionDto,
} from './what-if.types';

@Component({
  selector: 'app-what-if-tool',
  standalone: true,
  imports: [FormsModule, WhatIfReportComponent],
  template: `
    <div class="wi">

      <!-- Header -->
      <div class="wi__header">
        <div class="wi__header-left">
          <span class="wi__badge">WI</span>
          <div>
            <p class="wi__title">What If</p>
            <p class="wi__subtitle">
              {{ data().preguntas.length }} pregunta{{ data().preguntas.length === 1 ? '' : 's' }}
              @if (seleccionadas() > 0) { · <span class="wi__stat--sel">{{ seleccionadas() }} seleccionada{{ seleccionadas() === 1 ? '' : 's' }}</span> }
              @if (saving()) { <span class="wi__saving"> · guardando…</span> }
            </p>
          </div>
        </div>
        <div class="wi__header-actions">
          @if (reports().length > 0) {
            <button class="wi__btn-ghost" (click)="showReport.set(!showReport())">
              <i class="pi pi-file-check"></i>
              Informes ({{ reports().length }})
            </button>
          }
          <button
            class="wi__btn-primary"
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

      @if (showReport() && reports().length > 0) {
        <app-what-if-report [reports]="reports()" />
      } @else {

        <!-- Contexto -->
        <div class="wi__section">
          <label class="wi__label">¿Qué estás diseñando / cuál es el reto?</label>
          <textarea
            class="wi__textarea wi__textarea--contexto"
            placeholder="Describí brevemente el problema o la oportunidad que están explorando…"
            [ngModel]="data().contexto"
            (ngModelChange)="patchData({ contexto: $event })"
            rows="3"
          ></textarea>
        </div>

        <!-- Preguntas What If -->
        <div class="wi__section">
          <div class="wi__section-header">
            <p class="wi__label">Preguntas What If</p>
            <button class="wi__btn-add" (click)="addPregunta()">
              <i class="pi pi-plus"></i> Agregar pregunta
            </button>
          </div>

          @if (data().preguntas.length === 0) {
            <div class="wi__empty">
              <i class="pi pi-question-circle"></i>
              <p>¿Qué pasaría si…? Agregá preguntas para explorar posibilidades sin límites.</p>
            </div>
          }

          <div class="wi__preguntas">
            @for (p of data().preguntas; track p.id; let i = $index) {
              <div class="wi__pregunta" [class.wi__pregunta--sel]="p.seleccionada">
                <div class="wi__pregunta-header">
                  <span class="wi__pregunta-num">{{ i + 1 }}</span>
                  <div class="wi__pregunta-controls">
                    <button
                      class="wi__btn-sel"
                      [class.wi__btn-sel--active]="p.seleccionada"
                      (click)="toggleSeleccionada(i)"
                    >
                      <i class="pi" [class.pi-star-fill]="p.seleccionada" [class.pi-star]="!p.seleccionada"></i>
                      {{ p.seleccionada ? 'Seleccionada' : 'Seleccionar' }}
                    </button>
                    <button class="wi__btn-remove" (click)="removePregunta(i)">
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                </div>

                <div class="wi__pregunta-body">
                  <div class="wi__field-prefix">
                    <span class="wi__prefix-text">¿Qué pasaría si…</span>
                    <input
                      type="text"
                      class="wi__input wi__input--pregunta"
                      placeholder="…no existieran los passwords?"
                      [ngModel]="p.pregunta"
                      (ngModelChange)="updatePregunta(i, 'pregunta', $event)"
                    />
                    <span class="wi__prefix-text wi__prefix-text--end">?</span>
                  </div>

                  <select
                    class="wi__select"
                    [ngModel]="p.tipo"
                    (ngModelChange)="updatePregunta(i, 'tipo', $event)"
                  >
                    <option value="">Tipo de What If…</option>
                    @for (t of tiposWhatIf; track t.value) {
                      <option [value]="t.value">{{ t.label }}</option>
                    }
                  </select>

                  <textarea
                    class="wi__textarea"
                    placeholder="Exploración: ¿qué implicaría? ¿cómo cambiaría el producto/servicio?"
                    [ngModel]="p.exploracion"
                    (ngModelChange)="updatePregunta(i, 'exploracion', $event)"
                    rows="2"
                  ></textarea>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Insights clave del equipo -->
        <div class="wi__section">
          <p class="wi__label">Insights clave (opcionales)</p>
          <p class="wi__sublabel">¿Qué patrones o descubrimientos surgieron al explorar las preguntas?</p>
          <div class="wi__chips">
            @for (ins of data().insightsClave; track $index; let i = $index) {
              <span class="wi__chip">
                {{ ins }}
                <button class="wi__chip-remove" (click)="removeInsight(i)">×</button>
              </span>
            }
            <input
              type="text"
              class="wi__chip-input"
              placeholder="Insight y Enter…"
              [ngModel]="insightBuffer()"
              (ngModelChange)="insightBuffer.set($event)"
              (keydown.enter)="addInsight()"
            />
          </div>
        </div>

      }
    </div>
  `,
  styles: [`
    .wi { display: flex; flex-direction: column; gap: 0; }

    .wi__header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; border-bottom: 1px solid #e9d5ff;
      background: linear-gradient(135deg, #faf5ff, #fff);
    }
    .wi__header-left { display: flex; align-items: center; gap: 10px; }
    .wi__badge {
      width: 34px; height: 34px; border-radius: 8px;
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      color: #fff; font-size: 0.625rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      letter-spacing: 0.03em; flex-shrink: 0;
    }
    .wi__title { margin: 0; font-size: 0.875rem; font-weight: 700; color: #1f2937; }
    .wi__subtitle { margin: 0; font-size: 0.75rem; color: #6b7280; }
    .wi__stat--sel { color: #7c3aed; font-weight: 600; }
    .wi__saving { color: #a855f7; font-style: italic; }

    .wi__header-actions { display: flex; gap: 8px; }
    .wi__btn-ghost {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 12px; border-radius: 8px; border: 1px solid #e9d5ff;
      background: transparent; font-size: 0.8125rem; color: #7c3aed;
      cursor: pointer; transition: background 0.15s;
    }
    .wi__btn-ghost:hover { background: #f5f3ff; }
    .wi__btn-primary {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 8px; border: none;
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      color: #fff; font-size: 0.8125rem; font-weight: 600;
      cursor: pointer; transition: opacity 0.15s;
    }
    .wi__btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

    .wi__section { padding: 14px 16px; border-bottom: 1px solid #f3e8ff; }
    .wi__section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
    .wi__label {
      font-size: 0.6875rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: #7c3aed; margin: 0 0 8px;
    }
    .wi__sublabel { font-size: 0.75rem; color: #9ca3af; margin: -4px 0 8px; }

    .wi__textarea {
      width: 100%; border: 1px solid #e9d5ff; border-radius: 8px;
      padding: 8px 10px; font-size: 0.8125rem; color: #374151;
      background: #faf5ff; resize: vertical; box-sizing: border-box;
      font-family: inherit; line-height: 1.5;
    }
    .wi__textarea:focus { outline: none; border-color: #a855f7; background: #fff; }
    .wi__textarea--contexto { border-left: 3px solid #7c3aed; }

    .wi__btn-add {
      display: flex; align-items: center; gap: 5px;
      padding: 5px 10px; border-radius: 6px;
      border: 1px dashed #a855f7; background: transparent;
      font-size: 0.75rem; color: #7c3aed; cursor: pointer; transition: all 0.15s;
    }
    .wi__btn-add:hover { background: #f5f3ff; border-style: solid; }

    .wi__empty {
      display: flex; flex-direction: column; align-items: center; gap: 6px;
      padding: 24px; color: #9ca3af; text-align: center;
    }
    .wi__empty i { font-size: 1.5rem; color: #c4b5fd; }
    .wi__empty p { font-size: 0.8125rem; margin: 0; max-width: 300px; }

    .wi__preguntas { display: flex; flex-direction: column; gap: 10px; }

    .wi__pregunta {
      border: 1px solid #e9d5ff; border-radius: 10px;
      background: #faf5ff; overflow: hidden; transition: border-color 0.15s;
    }
    .wi__pregunta--sel { border-color: #a855f7; background: linear-gradient(135deg, #fdf4ff, #faf5ff); }

    .wi__pregunta-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 10px; border-bottom: 1px solid #f3e8ff; background: rgba(255,255,255,0.6);
    }
    .wi__pregunta-num {
      width: 22px; height: 22px; border-radius: 50%;
      background: #e9d5ff; color: #7c3aed;
      font-size: 0.7rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
    }
    .wi__pregunta-controls { display: flex; align-items: center; gap: 6px; }

    .wi__btn-sel {
      display: flex; align-items: center; gap: 4px;
      padding: 3px 8px; border-radius: 5px;
      border: 1px solid #e9d5ff; background: transparent;
      font-size: 0.72rem; color: #9ca3af; cursor: pointer; transition: all 0.15s;
    }
    .wi__btn-sel--active { background: #f5f3ff; border-color: #a855f7; color: #7c3aed; font-weight: 600; }
    .wi__btn-remove {
      padding: 4px 6px; border-radius: 5px; border: none;
      background: transparent; color: #d1d5db; cursor: pointer; transition: color 0.15s;
    }
    .wi__btn-remove:hover { color: #ef4444; }

    .wi__pregunta-body { padding: 10px; display: flex; flex-direction: column; gap: 8px; }

    .wi__field-prefix { display: flex; align-items: center; gap: 6px; }
    .wi__prefix-text { font-size: 0.8rem; color: #7c3aed; font-weight: 600; white-space: nowrap; flex-shrink: 0; }
    .wi__prefix-text--end { color: #7c3aed; }

    .wi__input {
      flex: 1; border: 1px solid #e9d5ff; border-radius: 6px;
      padding: 6px 10px; font-size: 0.8125rem; color: #374151;
      background: #fff; box-sizing: border-box; font-family: inherit;
    }
    .wi__input:focus { outline: none; border-color: #a855f7; }
    .wi__input--pregunta { font-style: italic; }

    .wi__select {
      width: 100%; border: 1px solid #e9d5ff; border-radius: 6px;
      padding: 6px 10px; font-size: 0.8rem; color: #374151;
      background: #fff; cursor: pointer; font-family: inherit;
    }
    .wi__select:focus { outline: none; border-color: #a855f7; }

    .wi__chips { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
    .wi__chip {
      display: flex; align-items: center; gap: 5px;
      padding: 4px 10px; border-radius: 20px;
      background: #ede9fe; color: #5b21b6; font-size: 0.78rem; font-weight: 500;
    }
    .wi__chip-remove {
      background: none; border: none; color: #7c3aed;
      font-size: 1rem; line-height: 1; cursor: pointer; padding: 0;
    }
    .wi__chip-remove:hover { color: #ef4444; }
    .wi__chip-input {
      border: 1px dashed #c4b5fd; border-radius: 20px;
      padding: 4px 12px; font-size: 0.78rem; color: #374151;
      background: transparent; outline: none; min-width: 160px; font-family: inherit;
    }
    .wi__chip-input:focus { border-color: #a855f7; background: #faf5ff; }
  `],
})
export class WhatIfToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly whatIfService = inject(WhatIfService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<WhatIfData>({ ...EMPTY_WHAT_IF });
  reports = signal<WhatIfReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);
  insightBuffer = signal('');

  readonly tiposWhatIf = TIPOS_WHAT_IF;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  seleccionadas = computed(() => this.data().preguntas.filter(p => p.seleccionada).length);

  canGenerate = computed(() => {
    const d = this.data();
    return d.contexto.trim().length > 0 && d.preguntas.length >= 3;
  });

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;
    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as WhatIfData | undefined;
    const storedReports = (raw['reports'] as WhatIfReportVersionDto[]) ?? [];
    this.data.set(stored ?? { ...EMPTY_WHAT_IF });
    this.reports.set(storedReports);
  }

  patchData(partial: Partial<WhatIfData>): void {
    this.data.set({ ...this.data(), ...partial });
    this.scheduleSave();
  }

  addPregunta(): void {
    const nueva: WhatIfPreguntaDto = {
      id: crypto.randomUUID(),
      pregunta: '',
      tipo: '',
      exploracion: '',
      seleccionada: false,
    };
    this.data.set({ ...this.data(), preguntas: [...this.data().preguntas, nueva] });
    this.scheduleSave();
  }

  removePregunta(index: number): void {
    const preguntas = this.data().preguntas.filter((_, i) => i !== index);
    this.data.set({ ...this.data(), preguntas });
    this.scheduleSave();
  }

  updatePregunta(index: number, field: keyof WhatIfPreguntaDto, value: string): void {
    const preguntas = this.data().preguntas.map((p, i) =>
      i === index ? { ...p, [field]: value } : p,
    );
    this.data.set({ ...this.data(), preguntas });
    this.scheduleSave();
  }

  toggleSeleccionada(index: number): void {
    const preguntas = this.data().preguntas.map((p, i) =>
      i === index ? { ...p, seleccionada: !p.seleccionada } : p,
    );
    this.data.set({ ...this.data(), preguntas });
    this.scheduleSave();
  }

  addInsight(): void {
    const val = this.insightBuffer().trim();
    if (!val) return;
    this.data.set({ ...this.data(), insightsClave: [...this.data().insightsClave, val] });
    this.insightBuffer.set('');
    this.scheduleSave();
  }

  removeInsight(index: number): void {
    const insightsClave = this.data().insightsClave.filter((_, i) => i !== index);
    this.data.set({ ...this.data(), insightsClave });
    this.scheduleSave();
  }

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;
    this.analyzing.set(true);
    try {
      const result = await this.whatIfService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });
      const newVersion: WhatIfReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };
      const updated = [newVersion, ...this.reports()];
      this.reports.set(updated);
      await this.persistData(updated);
      this.showReport.set(true);
      this.uiDialog.showSuccess('Informe generado', 'El análisis de What If fue generado correctamente.');
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

  private async persistData(reports: WhatIfReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
