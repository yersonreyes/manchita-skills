import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { HibridacionAgregacionService } from '@core/services/hibridacionAgregacionService/hibridacion-agregacion.service';
import { HibridacionAgregacionReportComponent } from './hibridacion-agregacion-report.component';
import {
  CombinacionDto,
  EMPTY_HIBRIDACION_AGREGACION,
  HibridacionAgregacionData,
  HibridacionAgregacionReportVersionDto,
  IdeaBaseDto,
  TECNICAS_AGREGACION,
} from './hibridacion-agregacion.types';

@Component({
  selector: 'app-hibridacion-agregacion-tool',
  standalone: true,
  imports: [FormsModule, HibridacionAgregacionReportComponent],
  template: `
    <div class="ha">

      <!-- Header -->
      <div class="ha__header">
        <div class="ha__header-left">
          <span class="ha__badge">HA</span>
          <div>
            <p class="ha__title">Hibridación por Agregación</p>
            <p class="ha__subtitle">
              {{ data().ideasBase.length }} idea{{ data().ideasBase.length === 1 ? '' : 's' }} base
              @if (data().combinaciones.length > 0) { · {{ data().combinaciones.length }} combinación{{ data().combinaciones.length === 1 ? '' : 'es' }} }
              @if (saving()) { <span class="ha__saving"> · guardando…</span> }
            </p>
          </div>
        </div>
        <div class="ha__header-actions">
          @if (reports().length > 0) {
            <button class="ha__btn-ghost" (click)="showReport.set(!showReport())">
              <i class="pi pi-file-check"></i>
              Informes ({{ reports().length }})
            </button>
          }
          <button
            class="ha__btn-primary"
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
        <app-hibridacion-agregacion-report [reports]="reports()" />
      } @else {

        <!-- Contexto y técnica -->
        <div class="ha__section">
          <label class="ha__label">Contexto del reto</label>
          <textarea
            class="ha__textarea ha__textarea--contexto"
            placeholder="¿Qué problema están resolviendo? ¿Qué oportunidad buscan aprovechar?"
            [ngModel]="data().contexto"
            (ngModelChange)="patchData({ contexto: $event })"
            rows="2"
          ></textarea>
          <select
            class="ha__select"
            [ngModel]="data().tecnica"
            (ngModelChange)="patchData({ tecnica: $event })"
          >
            <option value="">Técnica de agregación…</option>
            @for (t of tecnicas; track t.value) {
              <option [value]="t.value">{{ t.label }}</option>
            }
          </select>
        </div>

        <!-- Ideas base -->
        <div class="ha__section">
          <div class="ha__section-header">
            <p class="ha__label">Ideas base</p>
            <button class="ha__btn-add" (click)="addIdea()">
              <i class="pi pi-plus"></i> Agregar idea
            </button>
          </div>

          @if (data().ideasBase.length === 0) {
            <div class="ha__empty">
              <i class="pi pi-lightbulb"></i>
              <p>Agregá 2 o más ideas base para combinar. Cada una con sus elementos o features.</p>
            </div>
          }

          <div class="ha__ideas">
            @for (idea of data().ideasBase; track idea.id; let i = $index) {
              <div class="ha__idea">
                <div class="ha__idea-header">
                  <span class="ha__idea-badge">Idea {{ i + 1 }}</span>
                  <button class="ha__btn-remove" (click)="removeIdea(i)">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
                <input
                  type="text"
                  class="ha__input ha__input--nombre"
                  placeholder="Nombre de la idea (ej: App de delivery, Todoist…)"
                  [ngModel]="idea.nombre"
                  (ngModelChange)="updateIdea(i, 'nombre', $event)"
                />
                <textarea
                  class="ha__textarea"
                  placeholder="Descripción breve…"
                  [ngModel]="idea.descripcion"
                  (ngModelChange)="updateIdea(i, 'descripcion', $event)"
                  rows="2"
                ></textarea>
                <div class="ha__elementos-section">
                  <p class="ha__sublabel">Elementos / features:</p>
                  <div class="ha__chips">
                    @for (el of idea.elementos; track $index; let ei = $index) {
                      <span class="ha__chip">
                        {{ el }}
                        <button class="ha__chip-remove" (click)="removeElemento(i, ei)">×</button>
                      </span>
                    }
                    <input
                      type="text"
                      class="ha__chip-input"
                      placeholder="Feature y Enter…"
                      [ngModel]="elementoBuffers()[i]"
                      (ngModelChange)="setElementoBuffer(i, $event)"
                      (keydown.enter)="addElemento(i)"
                    />
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Combinaciones -->
        @if (data().ideasBase.length >= 2) {
          <div class="ha__section">
            <div class="ha__section-header">
              <p class="ha__label">Combinaciones</p>
              <button class="ha__btn-add" (click)="addCombinacion()">
                <i class="pi pi-plus"></i> Agregar combinación
              </button>
            </div>
            <p class="ha__sublabel-block">¿Qué elementos se combinan entre las ideas y qué resultado generan?</p>

            @if (data().combinaciones.length === 0) {
              <p class="ha__hint">Documentá las combinaciones de elementos más interesantes.</p>
            }

            <div class="ha__combinaciones">
              @for (comb of data().combinaciones; track comb.id; let ci = $index) {
                <div class="ha__combinacion">
                  <div class="ha__comb-row">
                    <input
                      type="text"
                      class="ha__input"
                      placeholder="Elemento A (ej: suscripción mensual)"
                      [ngModel]="comb.elementoA"
                      (ngModelChange)="updateCombinacion(ci, 'elementoA', $event)"
                    />
                    <span class="ha__comb-plus">+</span>
                    <input
                      type="text"
                      class="ha__input"
                      placeholder="Elemento B (ej: delivery a domicilio)"
                      [ngModel]="comb.elementoB"
                      (ngModelChange)="updateCombinacion(ci, 'elementoB', $event)"
                    />
                    <button class="ha__btn-remove" (click)="removeCombinacion(ci)">
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                  <textarea
                    class="ha__textarea"
                    placeholder="Resultado de esta combinación: ¿qué valor nuevo genera?"
                    [ngModel]="comb.resultado"
                    (ngModelChange)="updateCombinacion(ci, 'resultado', $event)"
                    rows="2"
                  ></textarea>
                </div>
              }
            </div>
          </div>
        }

        <!-- Idea híbrida resultante -->
        <div class="ha__section">
          <p class="ha__label">Idea híbrida resultante</p>
          <textarea
            class="ha__textarea ha__textarea--hibrida"
            placeholder="Describí la idea híbrida completa que surge de combinar los elementos seleccionados. ¿Cómo funciona el todo integrado?"
            [ngModel]="data().ideaHibrida"
            (ngModelChange)="patchData({ ideaHibrida: $event })"
            rows="4"
          ></textarea>
        </div>

        <!-- Propuesta de valor -->
        <div class="ha__section">
          <p class="ha__label">Propuesta de valor de la híbrida</p>
          <textarea
            class="ha__textarea"
            placeholder="¿Por qué la idea híbrida tiene más valor que cada parte por separado? ¿Qué problema resuelve mejor?"
            [ngModel]="data().propuestaValor"
            (ngModelChange)="patchData({ propuestaValor: $event })"
            rows="3"
          ></textarea>
        </div>

      }
    </div>
  `,
  styles: [`
    .ha { display: flex; flex-direction: column; gap: 0; }

    .ha__header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; border-bottom: 1px solid #fecdd3;
      background: linear-gradient(135deg, #fff1f2, #fff);
    }
    .ha__header-left { display: flex; align-items: center; gap: 10px; }
    .ha__badge {
      width: 34px; height: 34px; border-radius: 8px;
      background: linear-gradient(135deg, #e11d48, #f43f5e);
      color: #fff; font-size: 0.625rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      letter-spacing: 0.03em; flex-shrink: 0;
    }
    .ha__title { margin: 0; font-size: 0.875rem; font-weight: 700; color: #1f2937; }
    .ha__subtitle { margin: 0; font-size: 0.75rem; color: #6b7280; }
    .ha__saving { color: #f43f5e; font-style: italic; }

    .ha__header-actions { display: flex; gap: 8px; }
    .ha__btn-ghost {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 12px; border-radius: 8px; border: 1px solid #fecdd3;
      background: transparent; font-size: 0.8125rem; color: #e11d48;
      cursor: pointer; transition: background 0.15s;
    }
    .ha__btn-ghost:hover { background: #fff1f2; }
    .ha__btn-primary {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 8px; border: none;
      background: linear-gradient(135deg, #e11d48, #f43f5e);
      color: #fff; font-size: 0.8125rem; font-weight: 600;
      cursor: pointer; transition: opacity 0.15s;
    }
    .ha__btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

    .ha__section { padding: 14px 16px; border-bottom: 1px solid #ffe4e6; }
    .ha__section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
    .ha__label {
      font-size: 0.6875rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: #e11d48; margin: 0 0 8px;
    }
    .ha__sublabel { font-size: 0.72rem; color: #9ca3af; margin: 0; }
    .ha__sublabel-block { font-size: 0.72rem; color: #9ca3af; margin: -4px 0 8px; }
    .ha__hint { font-size: 0.8rem; color: #d1d5db; margin: 0; text-align: center; padding: 8px; }

    .ha__textarea {
      width: 100%; border: 1px solid #fecdd3; border-radius: 8px;
      padding: 8px 10px; font-size: 0.8125rem; color: #374151;
      background: #fff1f2; resize: vertical; box-sizing: border-box;
      font-family: inherit; line-height: 1.5;
    }
    .ha__textarea:focus { outline: none; border-color: #f43f5e; background: #fff; }
    .ha__textarea--contexto { border-left: 3px solid #e11d48; margin-bottom: 8px; }
    .ha__textarea--hibrida { border-left: 3px solid #e11d48; }

    .ha__select {
      width: 100%; border: 1px solid #fecdd3; border-radius: 8px;
      padding: 7px 10px; font-size: 0.8rem; color: #374151;
      background: #fff; cursor: pointer; font-family: inherit;
    }
    .ha__select:focus { outline: none; border-color: #f43f5e; }

    .ha__btn-add {
      display: flex; align-items: center; gap: 5px;
      padding: 5px 10px; border-radius: 6px;
      border: 1px dashed #f43f5e; background: transparent;
      font-size: 0.75rem; color: #e11d48; cursor: pointer; transition: all 0.15s;
    }
    .ha__btn-add:hover { background: #fff1f2; border-style: solid; }

    .ha__empty {
      display: flex; flex-direction: column; align-items: center; gap: 6px;
      padding: 20px; color: #9ca3af; text-align: center;
    }
    .ha__empty i { font-size: 1.4rem; color: #fecdd3; }
    .ha__empty p { font-size: 0.8125rem; margin: 0; max-width: 300px; }

    .ha__ideas { display: flex; flex-direction: column; gap: 10px; }
    .ha__idea {
      border: 1px solid #fecdd3; border-radius: 10px;
      padding: 12px; background: #fff1f2;
      display: flex; flex-direction: column; gap: 8px;
    }
    .ha__idea-header { display: flex; align-items: center; justify-content: space-between; }
    .ha__idea-badge {
      padding: 2px 8px; border-radius: 10px;
      background: #fecdd3; color: #9f1239;
      font-size: 0.7rem; font-weight: 700;
    }
    .ha__btn-remove {
      padding: 4px 6px; border-radius: 5px; border: none;
      background: transparent; color: #d1d5db; cursor: pointer; transition: color 0.15s;
    }
    .ha__btn-remove:hover { color: #ef4444; }

    .ha__input {
      width: 100%; border: 1px solid #fecdd3; border-radius: 6px;
      padding: 7px 10px; font-size: 0.8125rem; color: #374151;
      background: #fff; box-sizing: border-box; font-family: inherit;
    }
    .ha__input:focus { outline: none; border-color: #f43f5e; }
    .ha__input--nombre { font-weight: 600; }

    .ha__elementos-section { display: flex; flex-direction: column; gap: 4px; }
    .ha__chips { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; }
    .ha__chip {
      display: flex; align-items: center; gap: 4px;
      padding: 3px 9px; border-radius: 16px;
      background: #fecdd3; color: #9f1239; font-size: 0.76rem; font-weight: 500;
    }
    .ha__chip-remove {
      background: none; border: none; color: #e11d48;
      font-size: 1rem; line-height: 1; cursor: pointer; padding: 0;
    }
    .ha__chip-remove:hover { color: #ef4444; }
    .ha__chip-input {
      border: 1px dashed #fecdd3; border-radius: 16px;
      padding: 3px 10px; font-size: 0.76rem; color: #374151;
      background: transparent; outline: none; min-width: 130px; font-family: inherit;
    }
    .ha__chip-input:focus { border-color: #f43f5e; background: #fff; }

    .ha__combinaciones { display: flex; flex-direction: column; gap: 10px; }
    .ha__combinacion {
      border: 1px solid #fecdd3; border-radius: 8px;
      padding: 10px; background: #fff;
      display: flex; flex-direction: column; gap: 8px;
    }
    .ha__comb-row { display: flex; align-items: center; gap: 6px; }
    .ha__comb-row .ha__input { flex: 1; }
    .ha__comb-plus {
      font-size: 1.1rem; font-weight: 700; color: #e11d48; flex-shrink: 0;
    }
  `],
})
export class HibridacionAgregacionToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly hibridacionAgregacionService = inject(HibridacionAgregacionService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<HibridacionAgregacionData>({ ...EMPTY_HIBRIDACION_AGREGACION });
  reports = signal<HibridacionAgregacionReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);
  elementoBuffers = signal<Record<number, string | undefined>>({});

  readonly tecnicas = TECNICAS_AGREGACION;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  canGenerate = computed(() => {
    const d = this.data();
    return d.ideasBase.length >= 2 && d.ideaHibrida.trim().length > 0;
  });

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;
    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as HibridacionAgregacionData | undefined;
    const storedReports = (raw['reports'] as HibridacionAgregacionReportVersionDto[]) ?? [];
    this.data.set(stored ?? { ...EMPTY_HIBRIDACION_AGREGACION });
    this.reports.set(storedReports);
  }

  patchData(partial: Partial<HibridacionAgregacionData>): void {
    this.data.set({ ...this.data(), ...partial });
    this.scheduleSave();
  }

  addIdea(): void {
    const nueva: IdeaBaseDto = { id: crypto.randomUUID(), nombre: '', descripcion: '', elementos: [] };
    this.data.set({ ...this.data(), ideasBase: [...this.data().ideasBase, nueva] });
    this.scheduleSave();
  }

  removeIdea(index: number): void {
    this.data.set({ ...this.data(), ideasBase: this.data().ideasBase.filter((_, i) => i !== index) });
    this.scheduleSave();
  }

  updateIdea(index: number, field: 'nombre' | 'descripcion', value: string): void {
    const ideasBase = this.data().ideasBase.map((idea, i) =>
      i === index ? { ...idea, [field]: value } : idea,
    );
    this.data.set({ ...this.data(), ideasBase });
    this.scheduleSave();
  }

  setElementoBuffer(ideaIndex: number, value: string): void {
    this.elementoBuffers.set({ ...this.elementoBuffers(), [ideaIndex]: value });
  }

  addElemento(ideaIndex: number): void {
    const val = (this.elementoBuffers()[ideaIndex] ?? '').trim();
    if (!val) return;
    const ideasBase = this.data().ideasBase.map((idea, i) =>
      i === ideaIndex ? { ...idea, elementos: [...idea.elementos, val] } : idea,
    );
    this.data.set({ ...this.data(), ideasBase });
    this.elementoBuffers.set({ ...this.elementoBuffers(), [ideaIndex]: '' });
    this.scheduleSave();
  }

  removeElemento(ideaIndex: number, elementoIndex: number): void {
    const ideasBase = this.data().ideasBase.map((idea, i) =>
      i === ideaIndex ? { ...idea, elementos: idea.elementos.filter((_, ei) => ei !== elementoIndex) } : idea,
    );
    this.data.set({ ...this.data(), ideasBase });
    this.scheduleSave();
  }

  addCombinacion(): void {
    const nueva: CombinacionDto = { id: crypto.randomUUID(), elementoA: '', elementoB: '', resultado: '' };
    this.data.set({ ...this.data(), combinaciones: [...this.data().combinaciones, nueva] });
    this.scheduleSave();
  }

  removeCombinacion(index: number): void {
    this.data.set({ ...this.data(), combinaciones: this.data().combinaciones.filter((_, i) => i !== index) });
    this.scheduleSave();
  }

  updateCombinacion(index: number, field: keyof CombinacionDto, value: string): void {
    const combinaciones = this.data().combinaciones.map((c, i) =>
      i === index ? { ...c, [field]: value } : c,
    );
    this.data.set({ ...this.data(), combinaciones });
    this.scheduleSave();
  }

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;
    this.analyzing.set(true);
    try {
      const result = await this.hibridacionAgregacionService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });
      const newVersion: HibridacionAgregacionReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };
      const updated = [newVersion, ...this.reports()];
      this.reports.set(updated);
      await this.persistData(updated);
      this.showReport.set(true);
      this.uiDialog.showSuccess('Informe generado', 'El análisis de hibridación fue generado correctamente.');
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

  private async persistData(reports: HibridacionAgregacionReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
