import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { KeyFactsService } from '@core/services/keyFactsService/key-facts.service';
import { KeyFactsReportComponent } from './key-facts-report.component';
import { EMPTY_KEY_FACTS, KeyFactDto, KeyFactsData, KeyFactsReportVersionDto } from './key-facts.types';

@Component({
  selector: 'app-key-facts-tool',
  standalone: true,
  imports: [FormsModule, KeyFactsReportComponent],
  template: `
    <div class="kf">

      <!-- Header -->
      <div class="kf__header">
        <div class="kf__header-left">
          <span class="kf__badge">KF</span>
          <div>
            <p class="kf__title">Key Facts</p>
            <p class="kf__subtitle">
              {{ factsConDescripcion() }} hecho{{ factsConDescripcion() === 1 ? '' : 's' }} documentado{{ factsConDescripcion() === 1 ? '' : 's' }}
              @if (saving()) { <span class="kf__saving">· guardando…</span> }
            </p>
          </div>
        </div>
        <div class="kf__header-actions">
          @if (reports().length > 0) {
            <button class="kf__btn-ghost" (click)="showReport.set(!showReport())">
              <i class="pi pi-file-check"></i>
              Informes ({{ reports().length }})
            </button>
          }
          <button
            class="kf__btn-primary"
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

      <!-- Contexto -->
      <div class="kf__context">
        <label class="kf__label">Contexto de la investigación (opcional)</label>
        <textarea
          class="kf__textarea kf__textarea--context"
          rows="2"
          placeholder="Ej: Investigación con 12 usuarios de e-commerce, agosto 2025. Combinamos entrevistas semiestructuradas y análisis de analytics…"
          [ngModel]="data().contexto"
          (ngModelChange)="updateContexto($event)"
        ></textarea>
      </div>

      <!-- Report -->
      @if (showReport()) {
        <div class="kf__report-wrap">
          <app-key-facts-report [reports]="reports()" />
        </div>
      }

      <!-- Facts list -->
      <div class="kf__facts">
        @for (fact of data().facts; track fact.id; let i = $index) {
          <div class="kf__fact">
            <div class="kf__fact-num">{{ i + 1 }}</div>
            <div class="kf__fact-body">
              <textarea
                class="kf__textarea kf__textarea--fact"
                rows="2"
                placeholder="El hecho verificable con su dato concreto. Ej: 68% de usuarios abandona el checkout antes de completar la compra."
                [ngModel]="fact.descripcion"
                (ngModelChange)="updateFact(i, 'descripcion', $event)"
              ></textarea>
              <div class="kf__fact-meta">
                <input
                  class="kf__input"
                  type="text"
                  placeholder="Fuente (ej: Analytics, Entrevista #3, A/B Test)"
                  [ngModel]="fact.fuente"
                  (ngModelChange)="updateFact(i, 'fuente', $event)"
                />
                <input
                  class="kf__input kf__input--implicacion"
                  type="text"
                  placeholder="Implicación: qué hacer con este hecho"
                  [ngModel]="fact.implicacion"
                  (ngModelChange)="updateFact(i, 'implicacion', $event)"
                />
              </div>
            </div>
            <button class="kf__fact-delete" (click)="removeFact(i)" title="Eliminar hecho">
              <i class="pi pi-times"></i>
            </button>
          </div>
        }

        <!-- Add fact -->
        <button class="kf__add" (click)="addFact()">
          <i class="pi pi-plus"></i>
          Agregar hecho
        </button>
      </div>

    </div>
  `,
  styles: [`
    .kf { display: flex; flex-direction: column; gap: 16px; }

    .kf__header {
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px; flex-wrap: wrap;
    }
    .kf__header-left { display: flex; align-items: center; gap: 10px; }
    .kf__badge {
      width: 36px; height: 36px; border-radius: 10px;
      background: linear-gradient(135deg, #0d9488, #0f766e);
      color: #fff; font-size: 0.7rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      letter-spacing: 0.02em; flex-shrink: 0;
    }
    .kf__title { margin: 0; font-size: 0.9375rem; font-weight: 700; color: #111827; }
    .kf__subtitle { margin: 0; font-size: 0.78rem; color: #6b7280; }
    .kf__saving { color: #0d9488; }

    .kf__header-actions { display: flex; gap: 8px; align-items: center; }

    .kf__btn-ghost {
      display: flex; align-items: center; gap: 5px;
      padding: 6px 12px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: transparent;
      font-size: 0.8125rem; color: var(--p-text-color); cursor: pointer;
      transition: background 0.15s;
    }
    .kf__btn-ghost:hover { background: var(--p-surface-100); }

    .kf__btn-primary {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 8px; border: none;
      background: linear-gradient(135deg, #0d9488, #0f766e);
      color: #fff; font-size: 0.8125rem; font-weight: 600; cursor: pointer;
      transition: opacity 0.15s;
    }
    .kf__btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
    .kf__btn-primary:not(:disabled):hover { opacity: 0.9; }

    .kf__context { display: flex; flex-direction: column; gap: 4px; }
    .kf__label { font-size: 0.78rem; font-weight: 600; color: #6b7280; }

    .kf__textarea {
      width: 100%; box-sizing: border-box;
      padding: 8px 10px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: var(--p-surface-0);
      font-size: 0.8125rem; color: var(--p-text-color); line-height: 1.5;
      resize: vertical; font-family: inherit;
      transition: border-color 0.15s;
    }
    .kf__textarea:focus { outline: none; border-color: #0d9488; }
    .kf__textarea--context { rows: 2; }
    .kf__textarea--fact { rows: 2; }

    .kf__input {
      flex: 1; padding: 6px 10px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: var(--p-surface-0);
      font-size: 0.8rem; color: var(--p-text-color); font-family: inherit;
      transition: border-color 0.15s;
    }
    .kf__input:focus { outline: none; border-color: #0d9488; }
    .kf__input--implicacion { flex: 1.5; }

    .kf__report-wrap { border-radius: 10px; overflow: hidden; }

    .kf__facts { display: flex; flex-direction: column; gap: 10px; }

    .kf__fact {
      display: grid; grid-template-columns: 28px 1fr 28px;
      gap: 10px; align-items: start;
      padding: 12px; border-radius: 10px;
      border: 1px solid var(--p-surface-200);
      background: var(--p-surface-50);
    }

    .kf__fact-num {
      width: 24px; height: 24px; border-radius: 6px;
      background: #ccfbf1; color: #0f766e;
      font-size: 0.75rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      margin-top: 4px; flex-shrink: 0;
    }

    .kf__fact-body { display: flex; flex-direction: column; gap: 6px; }

    .kf__fact-meta { display: flex; gap: 6px; flex-wrap: wrap; }

    .kf__fact-delete {
      width: 24px; height: 24px; border-radius: 6px; border: none;
      background: transparent; color: #9ca3af;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; margin-top: 4px; flex-shrink: 0;
      transition: color 0.15s, background 0.15s;
    }
    .kf__fact-delete:hover { color: #ef4444; background: #fee2e2; }
    .kf__fact-delete .pi { font-size: 0.7rem; }

    .kf__add {
      display: flex; align-items: center; gap: 6px; justify-content: center;
      width: 100%; padding: 10px; border-radius: 10px;
      border: 2px dashed #99f6e4; background: transparent;
      font-size: 0.8125rem; color: #0d9488; cursor: pointer;
      transition: background 0.15s;
    }
    .kf__add:hover { background: #f0fdfa; }
    .kf__add .pi { font-size: 0.75rem; }
  `],
})
export class KeyFactsToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly keyFactsService = inject(KeyFactsService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<KeyFactsData>({ ...EMPTY_KEY_FACTS });
  reports = signal<KeyFactsReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  factsConDescripcion = computed(() => this.data().facts.filter(f => f.descripcion.trim()).length);

  canGenerate = computed(() => this.data().facts.filter(f => f.descripcion.trim()).length >= 3);

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;
    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as KeyFactsData | undefined;
    const storedReports = (raw['reports'] as KeyFactsReportVersionDto[]) ?? [];
    this.data.set(stored ?? { ...EMPTY_KEY_FACTS });
    this.reports.set(storedReports);
  }

  updateContexto(value: string): void {
    this.data.set({ ...this.data(), contexto: value });
    this.scheduleSave();
  }

  addFact(): void {
    const newFact: KeyFactDto = {
      id: crypto.randomUUID(),
      descripcion: '',
      fuente: '',
      implicacion: '',
    };
    this.data.set({ ...this.data(), facts: [...this.data().facts, newFact] });
    this.scheduleSave();
  }

  updateFact(index: number, field: keyof KeyFactDto, value: string): void {
    const facts = this.data().facts.map((f, i) => i === index ? { ...f, [field]: value } : f);
    this.data.set({ ...this.data(), facts });
    this.scheduleSave();
  }

  removeFact(index: number): void {
    const facts = this.data().facts.filter((_, i) => i !== index);
    this.data.set({ ...this.data(), facts });
    this.scheduleSave();
  }

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;
    this.analyzing.set(true);
    try {
      const result = await this.keyFactsService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });
      const newVersion: KeyFactsReportVersionDto = {
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

  private async persistData(reports: KeyFactsReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
