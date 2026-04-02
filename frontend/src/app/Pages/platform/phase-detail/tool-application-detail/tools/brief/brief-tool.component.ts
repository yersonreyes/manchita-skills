import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { BriefService } from '@core/services/briefService/brief.service';
import { BriefReportComponent } from './brief-report.component';
import { EMPTY_BRIEF, BriefData, BriefReportVersionDto } from './brief.types';

@Component({
  selector: 'app-brief-tool',
  standalone: true,
  imports: [FormsModule, BriefReportComponent],
  template: `
    <div class="br">

      <!-- Header -->
      <div class="br__header">
        <div class="br__header-left">
          <span class="br__badge">BR</span>
          <div>
            <p class="br__title">Brief de Proyecto</p>
            <p class="br__subtitle">
              {{ seccionesCompletas() }}/5 secciones clave completadas
              @if (saving()) { <span class="br__saving">· guardando…</span> }
            </p>
          </div>
        </div>
        <div class="br__header-actions">
          @if (reports().length > 0) {
            <button class="br__btn-ghost" (click)="showReport.set(!showReport())">
              <i class="pi pi-file-check"></i>
              Informes ({{ reports().length }})
            </button>
          }
          <button
            class="br__btn-primary"
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

      <!-- Reporte -->
      @if (showReport()) {
        <div class="br__report-wrap">
          <app-brief-report [reports]="reports()" />
        </div>
      }

      <!-- 1. Contexto -->
      <div class="br__section">
        <p class="br__section-title"><i class="pi pi-info-circle"></i> 1. Contexto</p>
        <textarea
          class="br__textarea"
          rows="3"
          placeholder="¿Por qué existe este proyecto? Contexto del negocio, el problema, la oportunidad. Ej: La app actual tiene un rating de 3.2 estrellas. El equipo quiere mejorar la retención y conversion antes del Q3."
          [ngModel]="data().contexto"
          (ngModelChange)="update('contexto', $event)"
        ></textarea>
      </div>

      <!-- 2. Objetivos -->
      <div class="br__section">
        <p class="br__section-title"><i class="pi pi-flag"></i> 2. Objetivos</p>
        <input
          class="br__input"
          type="text"
          placeholder="Objetivo principal (SMART): Ej: Aumentar el checkout completion rate de 45% a 60% en 6 meses"
          [ngModel]="data().objetivoPrincipal"
          (ngModelChange)="update('objetivoPrincipal', $event)"
        />
        <div class="br__chips-row">
          @for (obj of data().objetivosSecundarios; track $index; let i = $index) {
            <span class="br__chip">
              {{ obj }}
              <button class="br__chip-remove" (click)="removeFromList('objetivosSecundarios', i)">
                <i class="pi pi-times"></i>
              </button>
            </span>
          }
          <input
            class="br__chip-input"
            type="text"
            placeholder="+ objetivo secundario (Enter)"
            [ngModel]="newObjetivo()"
            (ngModelChange)="newObjetivo.set($event)"
            (keydown.enter)="addToList('objetivosSecundarios', newObjetivo(), newObjetivo)"
          />
        </div>
      </div>

      <!-- 3. Usuario target -->
      <div class="br__section">
        <p class="br__section-title"><i class="pi pi-user"></i> 3. Usuario Target</p>
        <textarea
          class="br__textarea"
          rows="2"
          placeholder="Perfil del usuario principal basado en investigación. Ej: Mujeres 25-45 años, compradoras frecuentes de fashion, urbanas, usan principalmente mobile para shopping."
          [ngModel]="data().usuarioTarget"
          (ngModelChange)="update('usuarioTarget', $event)"
        ></textarea>
      </div>

      <!-- 4. Scope -->
      <div class="br__section">
        <p class="br__section-title"><i class="pi pi-th-large"></i> 4. Scope</p>
        <div class="br__scope-grid">
          <div class="br__scope-col">
            <p class="br__scope-label br__scope-label--in">In Scope</p>
            <div class="br__chips-col">
              @for (item of data().inScope; track $index; let i = $index) {
                <span class="br__chip br__chip--in">
                  {{ item }}
                  <button class="br__chip-remove" (click)="removeFromList('inScope', i)">
                    <i class="pi pi-times"></i>
                  </button>
                </span>
              }
              <input
                class="br__chip-input"
                type="text"
                placeholder="+ agregar (Enter)"
                [ngModel]="newInScope()"
                (ngModelChange)="newInScope.set($event)"
                (keydown.enter)="addToList('inScope', newInScope(), newInScope)"
              />
            </div>
          </div>
          <div class="br__scope-col">
            <p class="br__scope-label br__scope-label--out">Out of Scope</p>
            <div class="br__chips-col">
              @for (item of data().outScope; track $index; let i = $index) {
                <span class="br__chip br__chip--out">
                  {{ item }}
                  <button class="br__chip-remove" (click)="removeFromList('outScope', i)">
                    <i class="pi pi-times"></i>
                  </button>
                </span>
              }
              <input
                class="br__chip-input"
                type="text"
                placeholder="+ agregar (Enter)"
                [ngModel]="newOutScope()"
                (ngModelChange)="newOutScope.set($event)"
                (keydown.enter)="addToList('outScope', newOutScope(), newOutScope)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 5. Restricciones -->
      <div class="br__section">
        <p class="br__section-title"><i class="pi pi-lock"></i> 5. Restricciones</p>
        <div class="br__fields-grid">
          <div class="br__field">
            <label class="br__field-label">Timeline</label>
            <input class="br__input" type="text" placeholder="Ej: 12 semanas (4 discovery + 4 design + 4 dev)"
              [ngModel]="data().timeline" (ngModelChange)="update('timeline', $event)" />
          </div>
          <div class="br__field">
            <label class="br__field-label">Budget</label>
            <input class="br__input" type="text" placeholder="Ej: $50k para research y diseño"
              [ngModel]="data().budget" (ngModelChange)="update('budget', $event)" />
          </div>
          <div class="br__field">
            <label class="br__field-label">Restricciones técnicas</label>
            <input class="br__input" type="text" placeholder="Ej: React Native, design system existente, WCAG AA"
              [ngModel]="data().restriccionesTech" (ngModelChange)="update('restriccionesTech', $event)" />
          </div>
          <div class="br__field">
            <label class="br__field-label">Otras restricciones</label>
            <input class="br__input" type="text" placeholder="Ej: acceso limitado a usuarios, regulaciones, etc."
              [ngModel]="data().otrasRestricciones" (ngModelChange)="update('otrasRestricciones', $event)" />
          </div>
        </div>
      </div>

      <!-- 6. Stakeholders -->
      <div class="br__section">
        <p class="br__section-title"><i class="pi pi-users"></i> 6. Stakeholders</p>
        <div class="br__fields-grid">
          <div class="br__field">
            <label class="br__field-label">Decision maker</label>
            <input class="br__input" type="text" placeholder="Ej: VP Product"
              [ngModel]="data().decisionMaker" (ngModelChange)="update('decisionMaker', $event)" />
          </div>
          <div class="br__field">
            <label class="br__field-label">Contacto principal</label>
            <input class="br__input" type="text" placeholder="Ej: Product Manager (María López)"
              [ngModel]="data().contacto" (ngModelChange)="update('contacto', $event)" />
          </div>
          <div class="br__field br__field--full">
            <label class="br__field-label">Equipo involucrado</label>
            <input class="br__input" type="text" placeholder="Ej: 1 PM, 2 Designers, 3 Devs, 1 QA"
              [ngModel]="data().equipo" (ngModelChange)="update('equipo', $event)" />
          </div>
        </div>
      </div>

      <!-- 7. Entregables -->
      <div class="br__section">
        <p class="br__section-title"><i class="pi pi-paperclip"></i> 7. Entregables</p>
        <div class="br__chips-row">
          @for (item of data().entregables; track $index; let i = $index) {
            <span class="br__chip br__chip--neutral">
              {{ item }}
              <button class="br__chip-remove" (click)="removeFromList('entregables', i)">
                <i class="pi pi-times"></i>
              </button>
            </span>
          }
          <input
            class="br__chip-input"
            type="text"
            placeholder="+ entregable (Enter). Ej: Prototipo interactivo"
            [ngModel]="newEntregable()"
            (ngModelChange)="newEntregable.set($event)"
            (keydown.enter)="addToList('entregables', newEntregable(), newEntregable)"
          />
        </div>
      </div>

      <!-- 8. Métricas de éxito -->
      <div class="br__section">
        <p class="br__section-title"><i class="pi pi-chart-line"></i> 8. Métricas de Éxito</p>
        <div class="br__chips-row">
          @for (item of data().metricasExito; track $index; let i = $index) {
            <span class="br__chip br__chip--success">
              {{ item }}
              <button class="br__chip-remove" (click)="removeFromList('metricasExito', i)">
                <i class="pi pi-times"></i>
              </button>
            </span>
          }
          <input
            class="br__chip-input"
            type="text"
            placeholder="+ métrica (Enter). Ej: Checkout completion: 45% → 60%"
            [ngModel]="newMetrica()"
            (ngModelChange)="newMetrica.set($event)"
            (keydown.enter)="addToList('metricasExito', newMetrica(), newMetrica)"
          />
        </div>
      </div>

      <!-- 9. Riesgos -->
      <div class="br__section">
        <p class="br__section-title"><i class="pi pi-exclamation-triangle"></i> 9. Riesgos</p>
        <div class="br__chips-row">
          @for (item of data().riesgos; track $index; let i = $index) {
            <span class="br__chip br__chip--risk">
              {{ item }}
              <button class="br__chip-remove" (click)="removeFromList('riesgos', i)">
                <i class="pi pi-times"></i>
              </button>
            </span>
          }
          <input
            class="br__chip-input"
            type="text"
            placeholder="+ riesgo (Enter). Ej: Timeline ajustado — mitigar con scope claro"
            [ngModel]="newRiesgo()"
            (ngModelChange)="newRiesgo.set($event)"
            (keydown.enter)="addToList('riesgos', newRiesgo(), newRiesgo)"
          />
        </div>
      </div>

      <!-- 10. Timeline / Milestones -->
      <div class="br__section">
        <p class="br__section-title"><i class="pi pi-calendar"></i> 10. Timeline / Milestones</p>
        <textarea
          class="br__textarea"
          rows="3"
          placeholder="Ej: W1-4: Research y análisis. W5-8: Diseño e iteración. W9-12: Handoff y validación con desarrollo."
          [ngModel]="data().timelineMilestones"
          (ngModelChange)="update('timelineMilestones', $event)"
        ></textarea>
      </div>

    </div>
  `,
  styles: [`
    .br { display: flex; flex-direction: column; gap: 14px; }

    .br__header {
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px; flex-wrap: wrap;
    }
    .br__header-left { display: flex; align-items: center; gap: 10px; }
    .br__badge {
      width: 36px; height: 36px; border-radius: 10px;
      background: linear-gradient(135deg, #1d4ed8, #1e40af);
      color: #fff; font-size: 0.7rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      letter-spacing: 0.02em; flex-shrink: 0;
    }
    .br__title { margin: 0; font-size: 0.9375rem; font-weight: 700; color: #111827; }
    .br__subtitle { margin: 0; font-size: 0.78rem; color: #6b7280; }
    .br__saving { color: #1d4ed8; }

    .br__header-actions { display: flex; gap: 8px; align-items: center; }

    .br__btn-ghost {
      display: flex; align-items: center; gap: 5px;
      padding: 6px 12px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: transparent;
      font-size: 0.8125rem; color: var(--p-text-color); cursor: pointer;
      transition: background 0.15s;
    }
    .br__btn-ghost:hover { background: var(--p-surface-100); }

    .br__btn-primary {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 8px; border: none;
      background: linear-gradient(135deg, #1d4ed8, #1e40af);
      color: #fff; font-size: 0.8125rem; font-weight: 600; cursor: pointer;
      transition: opacity 0.15s;
    }
    .br__btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
    .br__btn-primary:not(:disabled):hover { opacity: 0.9; }

    .br__report-wrap { border-radius: 10px; overflow: hidden; }

    .br__section {
      display: flex; flex-direction: column; gap: 8px;
      padding: 12px 14px; border-radius: 10px;
      border: 1px solid var(--p-surface-200);
      background: var(--p-surface-50);
    }

    .br__section-title {
      margin: 0; font-size: 0.78rem; font-weight: 700;
      color: #1d4ed8; text-transform: uppercase; letter-spacing: 0.06em;
      display: flex; align-items: center; gap: 6px;
    }
    .br__section-title .pi { font-size: 0.7rem; }

    .br__textarea {
      width: 100%; box-sizing: border-box;
      padding: 8px 10px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: var(--p-surface-0);
      font-size: 0.8125rem; color: var(--p-text-color); line-height: 1.5;
      resize: vertical; font-family: inherit;
      transition: border-color 0.15s;
    }
    .br__textarea:focus { outline: none; border-color: #1d4ed8; }

    .br__input {
      width: 100%; box-sizing: border-box;
      padding: 8px 10px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: var(--p-surface-0);
      font-size: 0.8125rem; color: var(--p-text-color); font-family: inherit;
      transition: border-color 0.15s;
    }
    .br__input:focus { outline: none; border-color: #1d4ed8; }

    .br__fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .br__field { display: flex; flex-direction: column; gap: 4px; }
    .br__field--full { grid-column: 1 / -1; }
    .br__field-label { font-size: 0.72rem; font-weight: 600; color: #6b7280; }

    .br__scope-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .br__scope-col { display: flex; flex-direction: column; gap: 6px; }
    .br__scope-label { margin: 0; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
    .br__scope-label--in { color: #15803d; }
    .br__scope-label--out { color: #b91c1c; }

    .br__chips-row {
      display: flex; flex-wrap: wrap; gap: 5px; align-items: center;
      padding: 6px 8px; border-radius: 8px;
      border: 1px solid var(--p-surface-200);
      background: rgba(255,255,255,0.6); min-height: 36px;
    }
    .br__chips-col {
      display: flex; flex-direction: column; gap: 4px;
      padding: 6px 8px; border-radius: 8px;
      border: 1px solid var(--p-surface-200);
      background: rgba(255,255,255,0.6); min-height: 36px;
    }

    .br__chip {
      display: flex; align-items: center; gap: 4px;
      padding: 3px 8px; border-radius: 20px;
      background: #dbeafe; color: #1e40af;
      font-size: 0.75rem; font-weight: 500;
    }
    .br__chip--in { background: #dcfce7; color: #15803d; }
    .br__chip--out { background: #fee2e2; color: #b91c1c; }
    .br__chip--neutral { background: #e0e7ff; color: #3730a3; }
    .br__chip--success { background: #d1fae5; color: #065f46; }
    .br__chip--risk { background: #fef3c7; color: #92400e; }
    .br__chip-remove {
      width: 14px; height: 14px; border: none; background: transparent;
      color: inherit; cursor: pointer; padding: 0;
      display: flex; align-items: center; justify-content: center; opacity: 0.6;
    }
    .br__chip-remove:hover { opacity: 1; }
    .br__chip-remove .pi { font-size: 0.6rem; }

    .br__chip-input {
      flex: 1; min-width: 100px; border: none; background: transparent;
      font-size: 0.78rem; color: var(--p-text-color); font-family: inherit;
      outline: none; padding: 2px 4px;
    }
  `],
})
export class BriefToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly briefService = inject(BriefService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<BriefData>({ ...EMPTY_BRIEF });
  reports = signal<BriefReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  newObjetivo = signal('');
  newInScope = signal('');
  newOutScope = signal('');
  newEntregable = signal('');
  newMetrica = signal('');
  newRiesgo = signal('');

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  seccionesCompletas = computed(() => {
    const d = this.data();
    let count = 0;
    if (d.contexto.trim()) count++;
    if (d.objetivoPrincipal.trim()) count++;
    if (d.usuarioTarget.trim()) count++;
    if (d.inScope.length > 0 || d.outScope.length > 0) count++;
    if (d.timeline.trim() || d.budget.trim()) count++;
    return count;
  });

  canGenerate = computed(() => {
    const d = this.data();
    return d.contexto.trim().length > 0 && d.objetivoPrincipal.trim().length > 0;
  });

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;
    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as BriefData | undefined;
    const storedReports = (raw['reports'] as BriefReportVersionDto[]) ?? [];
    this.data.set(stored ?? { ...EMPTY_BRIEF });
    this.reports.set(storedReports);
  }

  update(field: keyof BriefData, value: string): void {
    this.data.set({ ...this.data(), [field]: value });
    this.scheduleSave();
  }

  addToList(field: keyof BriefData, value: string, resetSignal: ReturnType<typeof signal<string>>): void {
    const trimmed = value.trim();
    if (!trimmed) return;
    const current = this.data()[field] as string[];
    this.data.set({ ...this.data(), [field]: [...current, trimmed] });
    resetSignal.set('');
    this.scheduleSave();
  }

  removeFromList(field: keyof BriefData, index: number): void {
    const current = this.data()[field] as string[];
    this.data.set({ ...this.data(), [field]: current.filter((_, i) => i !== index) });
    this.scheduleSave();
  }

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;
    this.analyzing.set(true);
    try {
      const result = await this.briefService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });
      const newVersion: BriefReportVersionDto = {
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

  private async persistData(reports: BriefReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
