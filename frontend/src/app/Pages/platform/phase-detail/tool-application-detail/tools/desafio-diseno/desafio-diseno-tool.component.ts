import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { DesafioDisenoService } from '@core/services/desafioDisenoService/desafio-diseno.service';
import { DesafioDisenoReportComponent } from './desafio-diseno-report.component';
import { EMPTY_DESAFIO_DISENO, DesafioDisenoData, DesafioItemDto, DesafioDisenoReportVersionDto } from './desafio-diseno.types';

@Component({
  selector: 'app-desafio-diseno-tool',
  standalone: true,
  imports: [FormsModule, DesafioDisenoReportComponent],
  template: `
    <div class="dd">

      <!-- Header -->
      <div class="dd__header">
        <div class="dd__header-left">
          <span class="dd__badge">DC</span>
          <div>
            <p class="dd__title">Desafío de Diseño</p>
            <p class="dd__subtitle">
              {{ desafiosCompletos() }} desafío{{ desafiosCompletos() === 1 ? '' : 's' }} definido{{ desafiosCompletos() === 1 ? '' : 's' }}
              @if (saving()) { <span class="dd__saving">· guardando…</span> }
            </p>
          </div>
        </div>
        <div class="dd__header-actions">
          @if (reports().length > 0) {
            <button class="dd__btn-ghost" (click)="showReport.set(!showReport())">
              <i class="pi pi-file-check"></i>
              Informes ({{ reports().length }})
            </button>
          }
          <button
            class="dd__btn-primary"
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

      <!-- Contexto del proyecto -->
      <div class="dd__context">
        <label class="dd__label">Contexto del proyecto (opcional)</label>
        <textarea
          class="dd__textarea dd__textarea--context"
          rows="2"
          placeholder="Ej: App de salud para pacientes crónicos, mercado LATAM. Restricciones: sin notificaciones push en iOS. Objetivo: mejorar adherencia al tratamiento…"
          [ngModel]="data().contexto"
          (ngModelChange)="updateContexto($event)"
        ></textarea>
      </div>

      <!-- Reporte -->
      @if (showReport()) {
        <div class="dd__report-wrap">
          <app-desafio-diseno-report [reports]="reports()" />
        </div>
      }

      <!-- Desafíos -->
      <div class="dd__list">
        @for (desafio of data().desafios; track desafio.id; let i = $index) {
          <div class="dd__card">
            <div class="dd__card-header">
              <span class="dd__card-num">Desafío {{ i + 1 }}</span>
              <button class="dd__card-delete" (click)="removeDesafio(i)" title="Eliminar">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <div class="dd__fields">
              <div class="dd__field-row">
                <div class="dd__field">
                  <label class="dd__field-label">Acción — ¿Qué vamos a hacer?</label>
                  <input
                    class="dd__input"
                    type="text"
                    placeholder="Ej: reducir el tiempo de checkout, ayudar a recordar medicamentos"
                    [ngModel]="desafio.accion"
                    (ngModelChange)="updateDesafio(i, 'accion', $event)"
                  />
                </div>
                <div class="dd__field">
                  <label class="dd__field-label">Usuario — ¿Para quién?</label>
                  <input
                    class="dd__input"
                    type="text"
                    placeholder="Ej: pacientes crónicos, usuarios móviles en LATAM"
                    [ngModel]="desafio.usuario"
                    (ngModelChange)="updateDesafio(i, 'usuario', $event)"
                  />
                </div>
              </div>
              <div class="dd__field-row">
                <div class="dd__field">
                  <label class="dd__field-label">Contexto / Restricciones — ¿En qué marco?</label>
                  <input
                    class="dd__input"
                    type="text"
                    placeholder="Ej: dentro de su rutina diaria, sin añadir nuevos dispositivos"
                    [ngModel]="desafio.contexto"
                    (ngModelChange)="updateDesafio(i, 'contexto', $event)"
                  />
                </div>
                <div class="dd__field">
                  <label class="dd__field-label">Resultado esperado — ¿Qué beneficio?</label>
                  <input
                    class="dd__input"
                    type="text"
                    placeholder="Ej: mejorar su adherencia al tratamiento en un 30%"
                    [ngModel]="desafio.resultado"
                    (ngModelChange)="updateDesafio(i, 'resultado', $event)"
                  />
                </div>
              </div>
            </div>

            <!-- Constraints -->
            <div class="dd__chips-section">
              <label class="dd__chips-label">Constraints adicionales</label>
              <div class="dd__chips">
                @for (c of desafio.constraints; track $index; let ci = $index) {
                  <span class="dd__chip">
                    {{ c }}
                    <button class="dd__chip-remove" (click)="removeChip(i, 'constraints', ci)">
                      <i class="pi pi-times"></i>
                    </button>
                  </span>
                }
                <input
                  class="dd__chip-input"
                  type="text"
                  placeholder="+ constraint"
                  [ngModel]="newConstraint()[i]"
                  (ngModelChange)="setNewConstraint(i, $event)"
                  (keydown.enter)="addChip(i, 'constraints')"
                />
              </div>
            </div>

            <!-- Criterios de éxito -->
            <div class="dd__chips-section">
              <label class="dd__chips-label">Criterios de éxito</label>
              <div class="dd__chips">
                @for (c of desafio.criteriosExito; track $index; let ci = $index) {
                  <span class="dd__chip dd__chip--success">
                    {{ c }}
                    <button class="dd__chip-remove" (click)="removeChip(i, 'criteriosExito', ci)">
                      <i class="pi pi-times"></i>
                    </button>
                  </span>
                }
                <input
                  class="dd__chip-input"
                  type="text"
                  placeholder="+ criterio"
                  [ngModel]="newCriterio()[i]"
                  (ngModelChange)="setNewCriterio(i, $event)"
                  (keydown.enter)="addChip(i, 'criteriosExito')"
                />
              </div>
            </div>

            <!-- Preview enunciado -->
            @if (desafio.accion.trim() && desafio.usuario.trim()) {
              <div class="dd__statement">
                <i class="pi pi-question-circle dd__statement-icon"></i>
                <p class="dd__statement-text">
                  ¿Cómo podemos <strong>{{ desafio.accion }}</strong>
                  @if (desafio.usuario) { para <em>{{ desafio.usuario }}</em> }
                  @if (desafio.contexto) { dentro de <em>{{ desafio.contexto }}</em> }
                  @if (desafio.resultado) { para <em>{{ desafio.resultado }}</em> }?
                </p>
              </div>
            }
          </div>
        }

        <button class="dd__add" (click)="addDesafio()">
          <i class="pi pi-plus"></i>
          Agregar desafío
        </button>
      </div>

    </div>
  `,
  styles: [`
    .dd { display: flex; flex-direction: column; gap: 16px; }

    .dd__header {
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px; flex-wrap: wrap;
    }
    .dd__header-left { display: flex; align-items: center; gap: 10px; }
    .dd__badge {
      width: 36px; height: 36px; border-radius: 10px;
      background: linear-gradient(135deg, #d97706, #b45309);
      color: #fff; font-size: 0.7rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      letter-spacing: 0.02em; flex-shrink: 0;
    }
    .dd__title { margin: 0; font-size: 0.9375rem; font-weight: 700; color: #111827; }
    .dd__subtitle { margin: 0; font-size: 0.78rem; color: #6b7280; }
    .dd__saving { color: #d97706; }

    .dd__header-actions { display: flex; gap: 8px; align-items: center; }

    .dd__btn-ghost {
      display: flex; align-items: center; gap: 5px;
      padding: 6px 12px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: transparent;
      font-size: 0.8125rem; color: var(--p-text-color); cursor: pointer;
      transition: background 0.15s;
    }
    .dd__btn-ghost:hover { background: var(--p-surface-100); }

    .dd__btn-primary {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 8px; border: none;
      background: linear-gradient(135deg, #d97706, #b45309);
      color: #fff; font-size: 0.8125rem; font-weight: 600; cursor: pointer;
      transition: opacity 0.15s;
    }
    .dd__btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
    .dd__btn-primary:not(:disabled):hover { opacity: 0.9; }

    .dd__context { display: flex; flex-direction: column; gap: 4px; }
    .dd__label { font-size: 0.78rem; font-weight: 600; color: #6b7280; }

    .dd__textarea {
      width: 100%; box-sizing: border-box;
      padding: 8px 10px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: var(--p-surface-0);
      font-size: 0.8125rem; color: var(--p-text-color); line-height: 1.5;
      resize: vertical; font-family: inherit;
      transition: border-color 0.15s;
    }
    .dd__textarea:focus { outline: none; border-color: #d97706; }

    .dd__input {
      width: 100%; box-sizing: border-box;
      padding: 8px 10px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: var(--p-surface-0);
      font-size: 0.8125rem; color: var(--p-text-color); font-family: inherit;
      transition: border-color 0.15s;
    }
    .dd__input:focus { outline: none; border-color: #d97706; }

    .dd__report-wrap { border-radius: 10px; overflow: hidden; }

    .dd__list { display: flex; flex-direction: column; gap: 12px; }

    .dd__card {
      display: flex; flex-direction: column; gap: 10px;
      padding: 14px; border-radius: 12px;
      border: 1px solid #fde68a;
      background: #fffbeb;
    }

    .dd__card-header {
      display: flex; align-items: center; justify-content: space-between;
    }
    .dd__card-num {
      font-size: 0.75rem; font-weight: 700; color: #d97706;
      text-transform: uppercase; letter-spacing: 0.08em;
    }
    .dd__card-delete {
      width: 24px; height: 24px; border-radius: 6px; border: none;
      background: transparent; color: #9ca3af;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: color 0.15s, background 0.15s;
    }
    .dd__card-delete:hover { color: #ef4444; background: #fee2e2; }
    .dd__card-delete .pi { font-size: 0.7rem; }

    .dd__fields { display: flex; flex-direction: column; gap: 8px; }
    .dd__field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

    .dd__field { display: flex; flex-direction: column; gap: 4px; }
    .dd__field-label { font-size: 0.72rem; font-weight: 700; color: #b45309; text-transform: uppercase; letter-spacing: 0.06em; }

    .dd__chips-section { display: flex; flex-direction: column; gap: 4px; }
    .dd__chips-label { font-size: 0.72rem; font-weight: 600; color: #6b7280; }

    .dd__chips {
      display: flex; flex-wrap: wrap; gap: 5px; align-items: center;
      padding: 6px 8px; border-radius: 8px;
      border: 1px solid var(--p-surface-200);
      background: rgba(255,255,255,0.6); min-height: 36px;
    }

    .dd__chip {
      display: flex; align-items: center; gap: 4px;
      padding: 3px 8px; border-radius: 20px;
      background: #fed7aa; color: #92400e;
      font-size: 0.75rem; font-weight: 500;
    }
    .dd__chip--success { background: #d1fae5; color: #065f46; }
    .dd__chip-remove {
      width: 14px; height: 14px; border: none; background: transparent;
      color: inherit; cursor: pointer; padding: 0;
      display: flex; align-items: center; justify-content: center; opacity: 0.6;
    }
    .dd__chip-remove:hover { opacity: 1; }
    .dd__chip-remove .pi { font-size: 0.6rem; }

    .dd__chip-input {
      flex: 1; min-width: 100px; border: none; background: transparent;
      font-size: 0.78rem; color: var(--p-text-color); font-family: inherit;
      outline: none; padding: 2px 4px;
    }

    .dd__statement {
      display: flex; gap: 8px; align-items: flex-start;
      padding: 10px 12px; border-radius: 8px;
      background: rgba(255,255,255,0.8); border-left: 3px solid #d97706;
    }
    .dd__statement-icon { color: #fbbf24; font-size: 0.875rem; margin-top: 2px; flex-shrink: 0; }
    .dd__statement-text { margin: 0; font-size: 0.8125rem; color: #374151; line-height: 1.6; }

    .dd__add {
      display: flex; align-items: center; gap: 6px; justify-content: center;
      width: 100%; padding: 10px; border-radius: 10px;
      border: 2px dashed #fde68a; background: transparent;
      font-size: 0.8125rem; color: #d97706; cursor: pointer;
      transition: background 0.15s;
    }
    .dd__add:hover { background: #fffbeb; }
    .dd__add .pi { font-size: 0.75rem; }
  `],
})
export class DesafioDisenoToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly desafioDisenoService = inject(DesafioDisenoService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<DesafioDisenoData>({ ...EMPTY_DESAFIO_DISENO });
  reports = signal<DesafioDisenoReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  newConstraint = signal<Record<number, string | undefined>>({});
  newCriterio = signal<Record<number, string | undefined>>({});

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  desafiosCompletos = computed(() =>
    this.data().desafios.filter(d => d.accion.trim() && d.usuario.trim()).length
  );

  canGenerate = computed(() => this.desafiosCompletos() >= 1);

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;
    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as DesafioDisenoData | undefined;
    const storedReports = (raw['reports'] as DesafioDisenoReportVersionDto[]) ?? [];
    this.data.set(stored ?? { ...EMPTY_DESAFIO_DISENO });
    this.reports.set(storedReports);
  }

  updateContexto(value: string): void {
    this.data.set({ ...this.data(), contexto: value });
    this.scheduleSave();
  }

  addDesafio(): void {
    const newDesafio: DesafioItemDto = {
      id: crypto.randomUUID(),
      accion: '', usuario: '', contexto: '', resultado: '',
      constraints: [], criteriosExito: [],
    };
    this.data.set({ ...this.data(), desafios: [...this.data().desafios, newDesafio] });
    this.scheduleSave();
  }

  updateDesafio(index: number, field: keyof DesafioItemDto, value: string): void {
    const desafios = this.data().desafios.map((d, i) => i === index ? { ...d, [field]: value } : d);
    this.data.set({ ...this.data(), desafios });
    this.scheduleSave();
  }

  removeDesafio(index: number): void {
    const desafios = this.data().desafios.filter((_, i) => i !== index);
    this.data.set({ ...this.data(), desafios });
    this.scheduleSave();
  }

  setNewConstraint(index: number, value: string): void {
    this.newConstraint.set({ ...this.newConstraint(), [index]: value });
  }

  setNewCriterio(index: number, value: string): void {
    this.newCriterio.set({ ...this.newCriterio(), [index]: value });
  }

  addChip(index: number, field: 'constraints' | 'criteriosExito'): void {
    const isConstraint = field === 'constraints';
    const buffer = isConstraint ? this.newConstraint() : this.newCriterio();
    const value = (buffer[index] ?? '').trim();
    if (!value) return;

    const desafios = this.data().desafios.map((d, i) => {
      if (i !== index) return d;
      return { ...d, [field]: [...d[field], value] };
    });
    this.data.set({ ...this.data(), desafios });

    if (isConstraint) {
      this.newConstraint.set({ ...this.newConstraint(), [index]: '' });
    } else {
      this.newCriterio.set({ ...this.newCriterio(), [index]: '' });
    }
    this.scheduleSave();
  }

  removeChip(desafioIndex: number, field: 'constraints' | 'criteriosExito', chipIndex: number): void {
    const desafios = this.data().desafios.map((d, i) => {
      if (i !== desafioIndex) return d;
      return { ...d, [field]: d[field].filter((_, ci) => ci !== chipIndex) };
    });
    this.data.set({ ...this.data(), desafios });
    this.scheduleSave();
  }

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;
    this.analyzing.set(true);
    try {
      const result = await this.desafioDisenoService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });
      const newVersion: DesafioDisenoReportVersionDto = {
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

  private async persistData(reports: DesafioDisenoReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
