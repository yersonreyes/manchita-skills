import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { BrainstormingService } from '@core/services/brainstormingService/brainstorming.service';
import { BrainstormingReportComponent } from './brainstorming-report.component';
import { EMPTY_BRAINSTORMING, IdeaBrainstormingDto, BrainstormingData, BrainstormingReportVersionDto, TECNICAS_BRAINSTORMING } from './brainstorming.types';

@Component({
  selector: 'app-brainstorming-tool',
  standalone: true,
  imports: [FormsModule, BrainstormingReportComponent],
  template: `
    <div class="bs">

      <!-- Header -->
      <div class="bs__header">
        <div class="bs__header-left">
          <span class="bs__badge">BS</span>
          <div>
            <p class="bs__title">Brainstorming</p>
            <p class="bs__subtitle">
              {{ data().ideas.length }} idea{{ data().ideas.length === 1 ? '' : 's' }}
              @if (data().topIdeas.length) { · <span class="bs__stat--top">{{ data().topIdeas.length }} top</span> }
              @if (saving()) { <span class="bs__saving"> · guardando…</span> }
            </p>
          </div>
        </div>
        <div class="bs__header-actions">
          @if (reports().length > 0) {
            <button class="bs__btn-ghost" (click)="showReport.set(!showReport())">
              <i class="pi pi-file-check"></i>
              Informes ({{ reports().length }})
            </button>
          }
          <button
            class="bs__btn-primary"
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

      <!-- Reto -->
      <div class="bs__section">
        <label class="bs__label">Reto / Pregunta de brainstorming</label>
        <textarea
          class="bs__textarea bs__textarea--reto"
          rows="2"
          placeholder="Ej: ¿Cómo podríamos reducir el abandono en el checkout de nuestra app?"
          [ngModel]="data().reto"
          (ngModelChange)="updateField('reto', $event)"
        ></textarea>
      </div>

      <!-- Técnica y participantes -->
      <div class="bs__row">
        <div class="bs__section bs__section--grow">
          <label class="bs__label">Técnica utilizada</label>
          <select
            class="bs__select"
            [ngModel]="data().tecnica"
            (ngModelChange)="updateField('tecnica', $event)"
          >
            <option value="">Seleccioná una técnica…</option>
            @for (t of tecnicas; track t.value) {
              <option [value]="t.value">{{ t.label }}</option>
            }
          </select>
        </div>
        <div class="bs__section bs__section--shrink">
          <label class="bs__label">Participantes</label>
          <input
            class="bs__input"
            type="text"
            placeholder="Ej: 6 personas"
            [ngModel]="data().participantes"
            (ngModelChange)="updateField('participantes', $event)"
          />
        </div>
      </div>

      <!-- Reporte -->
      @if (showReport()) {
        <div class="bs__report-wrap">
          <app-brainstorming-report [reports]="reports()" />
        </div>
      }

      <!-- Ideas -->
      <div class="bs__ideas-header">
        <span class="bs__ideas-title">Ideas generadas</span>
        <button class="bs__btn-add" (click)="addIdea()">
          <i class="pi pi-plus"></i> Agregar idea
        </button>
      </div>

      <div class="bs__list">
        @for (idea of data().ideas; track idea.id; let i = $index) {
          <div class="bs__card">
            <div class="bs__card-body">
              <input
                class="bs__idea-input"
                type="text"
                placeholder="Describí la idea…"
                [ngModel]="idea.texto"
                (ngModelChange)="updateIdea(i, 'texto', $event)"
              />
              <input
                class="bs__cluster-input"
                type="text"
                placeholder="Cluster / Categoría (opcional)"
                [ngModel]="idea.cluster"
                (ngModelChange)="updateIdea(i, 'cluster', $event)"
              />
            </div>

            <!-- Votos -->
            <div class="bs__votos">
              <button class="bs__voto-btn" (click)="decrementarVotos(i)" [disabled]="idea.votos === 0">
                <i class="pi pi-minus"></i>
              </button>
              <span class="bs__voto-count">{{ idea.votos }}</span>
              <button class="bs__voto-btn" (click)="incrementarVotos(i)">
                <i class="pi pi-plus"></i>
              </button>
            </div>

            <button class="bs__card-delete" (click)="removeIdea(i)" title="Eliminar">
              <i class="pi pi-times"></i>
            </button>
          </div>
        }

        @if (data().ideas.length === 0) {
          <div class="bs__empty">
            <i class="pi pi-lightbulb"></i>
            <p>Agregá las ideas de la sesión. Podés registrar el cluster al que pertenece y la cantidad de votos que recibió.</p>
          </div>
        }
      </div>

      <!-- Top Ideas -->
      <div class="bs__section">
        <label class="bs__label">Top ideas seleccionadas</label>
        <p class="bs__hint">Las ideas que avanzarán al prototipado o siguiente etapa (Enter para agregar)</p>
        <div class="bs__chips">
          @for (top of data().topIdeas; track $index; let i = $index) {
            <span class="bs__chip">
              <i class="pi pi-trophy"></i>
              {{ top }}
              <button class="bs__chip-remove" (click)="removeTopIdea(i)">
                <i class="pi pi-times"></i>
              </button>
            </span>
          }
          <input
            class="bs__chip-input"
            type="text"
            placeholder="Agregar idea top…"
            [ngModel]="topIdeaBuffer()"
            (ngModelChange)="topIdeaBuffer.set($event)"
            (keydown.enter)="addTopIdea()"
          />
        </div>
      </div>

      <!-- Notas -->
      <div class="bs__section">
        <label class="bs__label">Notas del facilitador (opcional)</label>
        <textarea
          class="bs__textarea"
          rows="2"
          placeholder="Observaciones sobre la dinámica, patrones encontrados, próximos pasos…"
          [ngModel]="data().notas"
          (ngModelChange)="updateField('notas', $event)"
        ></textarea>
      </div>

    </div>
  `,
  styles: [`
    .bs { display: flex; flex-direction: column; gap: 16px; }

    .bs__header {
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px; flex-wrap: wrap;
    }
    .bs__header-left { display: flex; align-items: center; gap: 10px; }
    .bs__badge {
      width: 36px; height: 36px; border-radius: 10px;
      background: linear-gradient(135deg, #16a34a, #15803d);
      color: #fff; font-size: 0.6rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      letter-spacing: 0.02em; flex-shrink: 0;
    }
    .bs__title { margin: 0; font-size: 0.9375rem; font-weight: 700; color: #111827; }
    .bs__subtitle { margin: 0; font-size: 0.78rem; color: #6b7280; }
    .bs__stat--top { color: #16a34a; font-weight: 600; }
    .bs__saving { color: #16a34a; }

    .bs__header-actions { display: flex; gap: 8px; align-items: center; }

    .bs__btn-ghost {
      display: flex; align-items: center; gap: 5px;
      padding: 6px 12px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: transparent;
      font-size: 0.8125rem; color: var(--p-text-color); cursor: pointer;
      transition: background 0.15s;
    }
    .bs__btn-ghost:hover { background: var(--p-surface-100); }

    .bs__btn-primary {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 8px; border: none;
      background: linear-gradient(135deg, #16a34a, #15803d);
      color: #fff; font-size: 0.8125rem; font-weight: 600; cursor: pointer;
      transition: opacity 0.15s;
    }
    .bs__btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
    .bs__btn-primary:not(:disabled):hover { opacity: 0.9; }

    .bs__section { display: flex; flex-direction: column; gap: 4px; }
    .bs__section--grow { flex: 1; }
    .bs__section--shrink { flex: 0 0 160px; }
    .bs__label { font-size: 0.78rem; font-weight: 600; color: #6b7280; }
    .bs__hint { margin: 0 0 4px; font-size: 0.75rem; color: #9ca3af; }

    .bs__row { display: flex; gap: 10px; align-items: flex-start; }

    .bs__textarea {
      width: 100%; box-sizing: border-box;
      padding: 8px 10px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: var(--p-surface-0);
      font-size: 0.8125rem; color: var(--p-text-color); line-height: 1.5;
      resize: vertical; font-family: inherit; transition: border-color 0.15s;
    }
    .bs__textarea:focus { outline: none; border-color: #16a34a; }
    .bs__textarea--reto { border-left: 3px solid #16a34a; }

    .bs__input {
      width: 100%; box-sizing: border-box;
      padding: 8px 10px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: var(--p-surface-0);
      font-size: 0.8125rem; color: var(--p-text-color); font-family: inherit;
      transition: border-color 0.15s;
    }
    .bs__input:focus { outline: none; border-color: #16a34a; }

    .bs__select {
      width: 100%; box-sizing: border-box;
      padding: 8px 10px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: var(--p-surface-0);
      font-size: 0.8125rem; color: var(--p-text-color); font-family: inherit;
      transition: border-color 0.15s; cursor: pointer;
    }
    .bs__select:focus { outline: none; border-color: #16a34a; }

    .bs__report-wrap { border-radius: 10px; overflow: hidden; }

    .bs__ideas-header {
      display: flex; align-items: center; justify-content: space-between;
      padding-bottom: 4px; border-bottom: 1px solid var(--p-surface-200);
    }
    .bs__ideas-title { font-size: 0.8125rem; font-weight: 700; color: #374151; }
    .bs__btn-add {
      display: flex; align-items: center; gap: 5px;
      padding: 5px 10px; border-radius: 7px; border: none;
      background: #dcfce7; color: #15803d;
      font-size: 0.78rem; font-weight: 600; cursor: pointer;
      transition: background 0.15s;
    }
    .bs__btn-add:hover { background: #bbf7d0; }
    .bs__btn-add .pi { font-size: 0.7rem; }

    .bs__list { display: flex; flex-direction: column; gap: 6px; }

    .bs__card {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 10px; border-radius: 10px;
      border: 1px solid var(--p-surface-200); background: var(--p-surface-0);
      transition: border-color 0.15s;
    }
    .bs__card:hover { border-color: #bbf7d0; }

    .bs__card-body { flex: 1; display: flex; flex-direction: column; gap: 3px; }

    .bs__idea-input {
      width: 100%; box-sizing: border-box;
      border: none; background: transparent; outline: none;
      font-size: 0.8125rem; color: var(--p-text-color); font-family: inherit;
      font-weight: 500;
    }
    .bs__cluster-input {
      width: 100%; box-sizing: border-box;
      border: none; background: transparent; outline: none;
      font-size: 0.72rem; color: #9ca3af; font-family: inherit;
    }

    .bs__votos {
      display: flex; align-items: center; gap: 4px; flex-shrink: 0;
    }
    .bs__voto-btn {
      width: 22px; height: 22px; border-radius: 5px;
      border: 1px solid var(--p-surface-300); background: transparent;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: #6b7280; transition: all 0.15s;
    }
    .bs__voto-btn:hover:not(:disabled) { background: #dcfce7; border-color: #bbf7d0; color: #16a34a; }
    .bs__voto-btn:disabled { opacity: 0.35; cursor: not-allowed; }
    .bs__voto-btn .pi { font-size: 0.6rem; }
    .bs__voto-count {
      min-width: 24px; text-align: center;
      font-size: 0.8rem; font-weight: 700; color: #374151;
    }

    .bs__card-delete {
      width: 22px; height: 22px; border-radius: 5px; border: none;
      background: transparent; color: #d1d5db; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: color 0.15s, background 0.15s;
    }
    .bs__card-delete:hover { color: #ef4444; background: #fee2e2; }
    .bs__card-delete .pi { font-size: 0.65rem; }

    .bs__empty {
      display: flex; flex-direction: column; align-items: center;
      gap: 6px; padding: 24px 16px; text-align: center;
      border: 2px dashed #bbf7d0; border-radius: 10px; color: #9ca3af;
    }
    .bs__empty i { font-size: 1.25rem; color: #bbf7d0; }
    .bs__empty p { margin: 0; font-size: 0.8125rem; }

    .bs__chips {
      display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
      min-height: 38px; padding: 6px 8px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: var(--p-surface-0);
    }
    .bs__chip {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 10px; border-radius: 20px;
      background: #dcfce7; color: #166534;
      font-size: 0.75rem; font-weight: 600;
    }
    .bs__chip .pi-trophy { font-size: 0.7rem; color: #16a34a; }
    .bs__chip-remove {
      border: none; background: transparent; color: #15803d;
      cursor: pointer; padding: 0; line-height: 1; display: flex;
    }
    .bs__chip-remove .pi { font-size: 0.6rem; }
    .bs__chip-input {
      flex: 1; min-width: 140px; border: none; outline: none;
      background: transparent; font-size: 0.8125rem; color: var(--p-text-color);
      font-family: inherit;
    }
  `],
})
export class BrainstormingToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly brainstormingService = inject(BrainstormingService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<BrainstormingData>({ ...EMPTY_BRAINSTORMING });
  reports = signal<BrainstormingReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  topIdeaBuffer = signal('');
  readonly tecnicas = TECNICAS_BRAINSTORMING;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  canGenerate = computed(() =>
    !!this.data().reto.trim() && this.data().ideas.length >= 3
  );

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;
    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as BrainstormingData | undefined;
    const storedReports = (raw['reports'] as BrainstormingReportVersionDto[]) ?? [];
    this.data.set(stored ?? { ...EMPTY_BRAINSTORMING });
    this.reports.set(storedReports);
  }

  updateField(field: 'reto' | 'tecnica' | 'participantes' | 'notas', value: string): void {
    this.data.set({ ...this.data(), [field]: value });
    this.scheduleSave();
  }

  addIdea(): void {
    const newIdea: IdeaBrainstormingDto = { id: crypto.randomUUID(), texto: '', cluster: '', votos: 0 };
    this.data.set({ ...this.data(), ideas: [...this.data().ideas, newIdea] });
    this.scheduleSave();
  }

  updateIdea(index: number, field: 'texto' | 'cluster', value: string): void {
    const ideas = this.data().ideas.map((idea, i) => i === index ? { ...idea, [field]: value } : idea);
    this.data.set({ ...this.data(), ideas });
    this.scheduleSave();
  }

  incrementarVotos(index: number): void {
    const ideas = this.data().ideas.map((idea, i) => i === index ? { ...idea, votos: idea.votos + 1 } : idea);
    this.data.set({ ...this.data(), ideas });
    this.scheduleSave();
  }

  decrementarVotos(index: number): void {
    const ideas = this.data().ideas.map((idea, i) =>
      i === index && idea.votos > 0 ? { ...idea, votos: idea.votos - 1 } : idea
    );
    this.data.set({ ...this.data(), ideas });
    this.scheduleSave();
  }

  removeIdea(index: number): void {
    this.data.set({ ...this.data(), ideas: this.data().ideas.filter((_, i) => i !== index) });
    this.scheduleSave();
  }

  addTopIdea(): void {
    const value = this.topIdeaBuffer().trim();
    if (!value) return;
    this.data.set({ ...this.data(), topIdeas: [...this.data().topIdeas, value] });
    this.topIdeaBuffer.set('');
    this.scheduleSave();
  }

  removeTopIdea(index: number): void {
    this.data.set({ ...this.data(), topIdeas: this.data().topIdeas.filter((_, i) => i !== index) });
    this.scheduleSave();
  }

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;
    this.analyzing.set(true);
    try {
      const result = await this.brainstormingService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });
      const newVersion: BrainstormingReportVersionDto = {
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

  private async persistData(reports: BrainstormingReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
