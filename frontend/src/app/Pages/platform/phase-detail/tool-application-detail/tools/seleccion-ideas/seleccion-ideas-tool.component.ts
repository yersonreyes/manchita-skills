import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { SeleccionIdeasService } from '@core/services/seleccionIdeasService/seleccion-ideas.service';
import { SeleccionIdeasReportComponent } from './seleccion-ideas-report.component';
import {
  EMPTY_SELECCION_IDEAS,
  IdeaEstadoSeleccion,
  IdeaSeleccionDto,
  METODOS_SELECCION,
  SeleccionIdeasData,
  SeleccionIdeasReportVersionDto,
} from './seleccion-ideas.types';

@Component({
  selector: 'app-seleccion-ideas-tool',
  standalone: true,
  imports: [FormsModule, SeleccionIdeasReportComponent],
  template: `
    <div class="si">

      <!-- Header -->
      <div class="si__header">
        <div class="si__header-left">
          <span class="si__badge">SI</span>
          <div>
            <p class="si__title">Selección de Ideas</p>
            <p class="si__subtitle">
              {{ data().ideas.length }} idea{{ data().ideas.length === 1 ? '' : 's' }}
              @if (ideasSeleccionadas() > 0) { · <span class="si__stat--sel">{{ ideasSeleccionadas() }} seleccionada{{ ideasSeleccionadas() === 1 ? '' : 's' }}</span> }
              @if (data().criterios.length > 0) { · {{ data().criterios.length }} criterio{{ data().criterios.length === 1 ? '' : 's' }} }
              @if (saving()) { <span class="si__saving"> · guardando…</span> }
            </p>
          </div>
        </div>
        <div class="si__header-actions">
          @if (reports().length > 0) {
            <button class="si__btn-ghost" (click)="showReport.set(!showReport())">
              <i class="pi pi-file-check"></i>
              Informes ({{ reports().length }})
            </button>
          }
          <button
            class="si__btn-primary"
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

      <!-- Contexto y método -->
      <div class="si__row">
        <div class="si__section si__section--grow">
          <label class="si__label">Contexto</label>
          <textarea
            class="si__textarea"
            rows="2"
            placeholder="Ej: Selección de ideas de la sesión de brainstorming para reducir abandono en checkout. 25 ideas generadas."
            [ngModel]="data().contexto"
            (ngModelChange)="updateField('contexto', $event)"
          ></textarea>
        </div>
        <div class="si__section si__section--shrink">
          <label class="si__label">Método de selección</label>
          <select
            class="si__select"
            [ngModel]="data().metodo"
            (ngModelChange)="updateField('metodo', $event)"
          >
            <option value="">Seleccioná…</option>
            @for (m of metodos; track m.value) {
              <option [value]="m.value">{{ m.label }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Criterios de evaluación -->
      <div class="si__section">
        <div class="si__criteria-header">
          <label class="si__label">Criterios de evaluación</label>
          <button class="si__btn-add-small" (click)="addCriterio()">
            <i class="pi pi-plus"></i> Agregar criterio
          </button>
        </div>
        @if (data().criterios.length > 0) {
          <div class="si__criteria-list">
            @for (c of data().criterios; track c.id; let i = $index) {
              <div class="si__criterio">
                <input
                  class="si__criterio-nombre"
                  type="text"
                  placeholder="Nombre del criterio…"
                  [ngModel]="c.nombre"
                  (ngModelChange)="updateCriterio(i, 'nombre', $event)"
                />
                <div class="si__criterio-peso-wrap">
                  <input
                    class="si__criterio-peso"
                    type="number"
                    min="1"
                    max="100"
                    placeholder="Peso %"
                    [ngModel]="c.peso"
                    (ngModelChange)="updateCriterioPeso(i, +$event)"
                  />
                  <span class="si__criterio-peso-pct">%</span>
                </div>
                <button class="si__criterio-del" (click)="removeCriterio(i)">
                  <i class="pi pi-times"></i>
                </button>
              </div>
            }
            @if (totalPeso() !== 100 && data().criterios.length > 0) {
              <p class="si__peso-warning">
                <i class="pi pi-exclamation-triangle"></i>
                Los pesos suman {{ totalPeso() }}% (idealmente deben sumar 100%)
              </p>
            }
          </div>
        } @else {
          <p class="si__criteria-hint">
            Definí los criterios y sus pesos para calcular el score ponderado de cada idea. Ej: "Impacto en usuario" (30%), "Viabilidad técnica" (25%)…
          </p>
        }
      </div>

      <!-- Reporte -->
      @if (showReport()) {
        <div class="si__report-wrap">
          <app-seleccion-ideas-report [reports]="reports()" />
        </div>
      }

      <!-- Ideas -->
      <div class="si__ideas-header">
        <span class="si__ideas-title">Ideas a evaluar</span>
        <button class="si__btn-add" (click)="addIdea()">
          <i class="pi pi-plus"></i> Agregar idea
        </button>
      </div>

      <div class="si__list">
        @for (idea of sortedIdeas(); track idea.id; let i = $index) {
          <div class="si__card"
            [class.si__card--seleccionada]="idea.estado === 'seleccionada'"
            [class.si__card--backlog]="idea.estado === 'backlog'"
            [class.si__card--descartada]="idea.estado === 'descartada'"
          >
            <div class="si__card-top">
              <!-- Score badge -->
              @if (data().criterios.length > 0) {
                <span class="si__score-badge" [class.si__score-badge--high]="ideaScores().get(idea.id)! >= 4">
                  {{ ideaScores().get(idea.id)?.toFixed(1) ?? '—' }}
                </span>
              }

              <input
                class="si__idea-input"
                type="text"
                placeholder="Describí la idea…"
                [ngModel]="idea.texto"
                (ngModelChange)="updateIdea(idea.id, 'texto', $event)"
              />

              <!-- Estado -->
              <div class="si__estado-btns">
                <button
                  class="si__estado-btn"
                  [class.si__estado-btn--pendiente]="idea.estado === 'pendiente'"
                  title="Pendiente"
                  (click)="setEstado(idea.id, 'pendiente')"
                ><i class="pi pi-circle"></i></button>
                <button
                  class="si__estado-btn"
                  [class.si__estado-btn--sel]="idea.estado === 'seleccionada'"
                  title="Seleccionada"
                  (click)="setEstado(idea.id, 'seleccionada')"
                ><i class="pi pi-check-circle"></i></button>
                <button
                  class="si__estado-btn"
                  [class.si__estado-btn--backlog]="idea.estado === 'backlog'"
                  title="Backlog (más adelante)"
                  (click)="setEstado(idea.id, 'backlog')"
                ><i class="pi pi-clock"></i></button>
                <button
                  class="si__estado-btn"
                  [class.si__estado-btn--desc]="idea.estado === 'descartada'"
                  title="Descartada"
                  (click)="setEstado(idea.id, 'descartada')"
                ><i class="pi pi-times-circle"></i></button>
              </div>

              <button class="si__card-delete" (click)="removeIdea(idea.id)" title="Eliminar">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <!-- Scores por criterio -->
            @if (data().criterios.length > 0) {
              <div class="si__scores">
                @for (c of data().criterios; track c.id) {
                  <div class="si__score-row">
                    <span class="si__score-label">{{ c.nombre || 'Criterio' }}</span>
                    <div class="si__score-btns">
                      @for (v of [1,2,3,4,5]; track v) {
                        <button
                          class="si__score-btn"
                          [class.si__score-btn--active]="(allScores().get(idea.id)?.get(c.id) ?? 0) === v"
                          (click)="setScore(idea.id, c.id, v)"
                        >{{ v }}</button>
                      }
                    </div>
                    <span class="si__score-peso">{{ c.peso }}%</span>
                  </div>
                }
              </div>
            }

            <!-- Siguiente paso (solo para seleccionadas/backlog) -->
            @if (idea.estado === 'seleccionada' || idea.estado === 'backlog') {
              <input
                class="si__next-input"
                type="text"
                [placeholder]="idea.estado === 'seleccionada' ? 'Siguiente paso concreto…' : 'Cuándo revisar esta idea…'"
                [ngModel]="idea.siguientePaso"
                (ngModelChange)="updateIdea(idea.id, 'siguientePaso', $event)"
              />
            }
          </div>
        }

        @if (data().ideas.length === 0) {
          <div class="si__empty">
            <i class="pi pi-list-check"></i>
            <p>Agregá las ideas que querés evaluar. Definí criterios para calcular un score ponderado automáticamente.</p>
          </div>
        }
      </div>

      <!-- Decisión final -->
      @if (data().ideas.length > 0) {
        <div class="si__section">
          <label class="si__label">Decisión final del equipo</label>
          <textarea
            class="si__textarea si__textarea--decision"
            rows="2"
            placeholder="Ej: Priorizar guest checkout y progress bar para el MVP. El 1-click queda en backlog para fase 2."
            [ngModel]="data().decision"
            (ngModelChange)="updateField('decision', $event)"
          ></textarea>
        </div>
      }

    </div>
  `,
  styles: [`
    .si { display: flex; flex-direction: column; gap: 16px; }

    .si__header {
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px; flex-wrap: wrap;
    }
    .si__header-left { display: flex; align-items: center; gap: 10px; }
    .si__badge {
      width: 36px; height: 36px; border-radius: 10px;
      background: linear-gradient(135deg, #c026d3, #a21caf);
      color: #fff; font-size: 0.6rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      letter-spacing: 0.02em; flex-shrink: 0;
    }
    .si__title { margin: 0; font-size: 0.9375rem; font-weight: 700; color: #111827; }
    .si__subtitle { margin: 0; font-size: 0.78rem; color: #6b7280; }
    .si__stat--sel { color: #c026d3; font-weight: 600; }
    .si__saving { color: #c026d3; }

    .si__header-actions { display: flex; gap: 8px; align-items: center; }

    .si__btn-ghost {
      display: flex; align-items: center; gap: 5px;
      padding: 6px 12px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: transparent;
      font-size: 0.8125rem; color: var(--p-text-color); cursor: pointer;
      transition: background 0.15s;
    }
    .si__btn-ghost:hover { background: var(--p-surface-100); }

    .si__btn-primary {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 8px; border: none;
      background: linear-gradient(135deg, #c026d3, #a21caf);
      color: #fff; font-size: 0.8125rem; font-weight: 600; cursor: pointer;
      transition: opacity 0.15s;
    }
    .si__btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
    .si__btn-primary:not(:disabled):hover { opacity: 0.9; }

    .si__row { display: flex; gap: 10px; align-items: flex-start; }
    .si__section { display: flex; flex-direction: column; gap: 4px; }
    .si__section--grow { flex: 1; }
    .si__section--shrink { flex: 0 0 220px; }
    .si__label { font-size: 0.78rem; font-weight: 600; color: #6b7280; }

    .si__textarea {
      width: 100%; box-sizing: border-box;
      padding: 8px 10px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: var(--p-surface-0);
      font-size: 0.8125rem; color: var(--p-text-color); line-height: 1.5;
      resize: vertical; font-family: inherit; transition: border-color 0.15s;
    }
    .si__textarea:focus { outline: none; border-color: #c026d3; }
    .si__textarea--decision { border-color: #f5d0fe; background: #fdf4ff; }
    .si__textarea--decision:focus { border-color: #c026d3; }

    .si__select {
      width: 100%; box-sizing: border-box;
      padding: 8px 10px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: var(--p-surface-0);
      font-size: 0.8125rem; color: var(--p-text-color); font-family: inherit;
      transition: border-color 0.15s; cursor: pointer;
    }
    .si__select:focus { outline: none; border-color: #c026d3; }

    .si__criteria-header { display: flex; align-items: center; justify-content: space-between; }
    .si__btn-add-small {
      display: flex; align-items: center; gap: 4px;
      padding: 4px 8px; border-radius: 6px; border: none;
      background: #fae8ff; color: #a21caf;
      font-size: 0.75rem; font-weight: 600; cursor: pointer;
      transition: background 0.15s;
    }
    .si__btn-add-small:hover { background: #f5d0fe; }
    .si__btn-add-small .pi { font-size: 0.65rem; }

    .si__criteria-list { display: flex; flex-direction: column; gap: 4px; margin-top: 6px; }
    .si__criterio {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 8px; border-radius: 8px;
      border: 1px solid var(--p-surface-200); background: var(--p-surface-0);
    }
    .si__criterio-nombre {
      flex: 1; border: none; outline: none; background: transparent;
      font-size: 0.8125rem; color: var(--p-text-color); font-family: inherit;
    }
    .si__criterio-peso-wrap { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }
    .si__criterio-peso {
      width: 50px; padding: 3px 5px; border-radius: 5px;
      border: 1px solid var(--p-surface-300); background: var(--p-surface-0);
      font-size: 0.8125rem; color: var(--p-text-color); font-family: inherit;
      text-align: right;
    }
    .si__criterio-peso:focus { outline: none; border-color: #c026d3; }
    .si__criterio-peso-pct { font-size: 0.72rem; color: #6b7280; }
    .si__criterio-del {
      width: 20px; height: 20px; border-radius: 4px; border: none;
      background: transparent; color: #d1d5db; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: color 0.15s, background 0.15s;
    }
    .si__criterio-del:hover { color: #ef4444; background: #fee2e2; }
    .si__criterio-del .pi { font-size: 0.6rem; }

    .si__criteria-hint { margin: 4px 0 0; font-size: 0.78rem; color: #9ca3af; line-height: 1.5; }

    .si__peso-warning {
      display: flex; align-items: center; gap: 5px;
      font-size: 0.72rem; color: #d97706; margin: 2px 0 0;
    }
    .si__peso-warning .pi { font-size: 0.72rem; }

    .si__report-wrap { border-radius: 10px; overflow: hidden; }

    .si__ideas-header {
      display: flex; align-items: center; justify-content: space-between;
      padding-bottom: 4px; border-bottom: 1px solid var(--p-surface-200);
    }
    .si__ideas-title { font-size: 0.8125rem; font-weight: 700; color: #374151; }
    .si__btn-add {
      display: flex; align-items: center; gap: 5px;
      padding: 5px 10px; border-radius: 7px; border: none;
      background: #fae8ff; color: #a21caf;
      font-size: 0.78rem; font-weight: 600; cursor: pointer;
      transition: background 0.15s;
    }
    .si__btn-add:hover { background: #f5d0fe; }
    .si__btn-add .pi { font-size: 0.7rem; }

    .si__list { display: flex; flex-direction: column; gap: 8px; }

    .si__card {
      padding: 10px 12px; border-radius: 10px;
      border: 1px solid var(--p-surface-200); background: var(--p-surface-0);
      display: flex; flex-direction: column; gap: 8px;
      transition: border-color 0.15s;
    }
    .si__card--seleccionada { border-color: #f5d0fe; background: #fdf4ff; }
    .si__card--backlog { border-color: #fef08a; background: #fefce8; }
    .si__card--descartada { opacity: 0.5; }

    .si__card-top {
      display: flex; align-items: center; gap: 6px;
    }

    .si__score-badge {
      flex-shrink: 0; padding: 2px 7px; border-radius: 12px;
      background: #f3e8ff; color: #7e22ce;
      font-size: 0.72rem; font-weight: 800; min-width: 36px; text-align: center;
    }
    .si__score-badge--high { background: #fae8ff; color: #c026d3; }

    .si__idea-input {
      flex: 1; border: none; background: transparent; outline: none;
      font-size: 0.8125rem; color: var(--p-text-color); font-family: inherit;
      font-weight: 500;
    }

    .si__estado-btns { display: flex; gap: 2px; flex-shrink: 0; }
    .si__estado-btn {
      width: 22px; height: 22px; border: none; background: transparent;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; border-radius: 4px; color: #d1d5db;
      transition: color 0.15s, background 0.15s;
    }
    .si__estado-btn .pi { font-size: 0.78rem; }
    .si__estado-btn:hover { background: var(--p-surface-100); color: #6b7280; }
    .si__estado-btn--pendiente { color: #6b7280; }
    .si__estado-btn--sel { color: #16a34a; }
    .si__estado-btn--backlog { color: #d97706; }
    .si__estado-btn--desc { color: #9ca3af; }

    .si__card-delete {
      width: 20px; height: 20px; border-radius: 4px; border: none;
      background: transparent; color: #d1d5db; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: color 0.15s, background 0.15s;
    }
    .si__card-delete:hover { color: #ef4444; background: #fee2e2; }
    .si__card-delete .pi { font-size: 0.6rem; }

    .si__scores { display: flex; flex-direction: column; gap: 4px; }
    .si__score-row {
      display: flex; align-items: center; gap: 8px;
    }
    .si__score-label {
      font-size: 0.72rem; color: #6b7280; min-width: 120px; max-width: 160px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .si__score-btns { display: flex; gap: 3px; }
    .si__score-btn {
      width: 24px; height: 24px; border-radius: 5px;
      border: 1px solid var(--p-surface-300); background: transparent;
      font-size: 0.72rem; font-weight: 600; color: #6b7280;
      cursor: pointer; transition: all 0.1s;
      display: flex; align-items: center; justify-content: center;
    }
    .si__score-btn:hover { border-color: #c026d3; color: #c026d3; background: #fdf4ff; }
    .si__score-btn--active { background: #c026d3; border-color: #c026d3; color: #fff; }
    .si__score-peso {
      font-size: 0.68rem; color: #9ca3af; margin-left: auto;
    }

    .si__next-input {
      width: 100%; box-sizing: border-box;
      border: none; border-top: 1px solid var(--p-surface-200); background: transparent;
      padding-top: 6px; outline: none;
      font-size: 0.78rem; color: #6b7280; font-family: inherit; font-style: italic;
    }

    .si__empty {
      display: flex; flex-direction: column; align-items: center;
      gap: 6px; padding: 24px 16px; text-align: center;
      border: 2px dashed #f5d0fe; border-radius: 10px; color: #9ca3af;
    }
    .si__empty i { font-size: 1.25rem; color: #f5d0fe; }
    .si__empty p { margin: 0; font-size: 0.8125rem; }
  `],
})
export class SeleccionIdeasToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly seleccionIdeasService = inject(SeleccionIdeasService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<SeleccionIdeasData>({ ...EMPTY_SELECCION_IDEAS });
  reports = signal<SeleccionIdeasReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  readonly metodos = METODOS_SELECCION;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  ideasSeleccionadas = computed(() => this.data().ideas.filter(i => i.estado === 'seleccionada').length);

  totalPeso = computed(() => this.data().criterios.reduce((s, c) => s + (c.peso || 0), 0));

  ideaScores = computed(() => {
    const criterios = this.data().criterios;
    const totalPeso = criterios.reduce((s, c) => s + (c.peso || 0), 0);
    return new Map(this.data().ideas.map(idea => {
      if (!criterios.length || totalPeso === 0) return [idea.id, 0] as [string, number];
      const weighted = criterios.reduce((s, c) => {
        const p = idea.puntuaciones.find(pu => pu.criterioId === c.id);
        return s + (p?.valor ?? 0) * (c.peso || 0);
      }, 0);
      return [idea.id, weighted / totalPeso] as [string, number];
    }));
  });

  allScores = computed(() => {
    const map = new Map<string, Map<string, number>>();
    for (const idea of this.data().ideas) {
      const criterioMap = new Map<string, number>();
      for (const p of idea.puntuaciones) {
        criterioMap.set(p.criterioId, p.valor);
      }
      map.set(idea.id, criterioMap);
    }
    return map;
  });

  sortedIdeas = computed(() => {
    const scores = this.ideaScores();
    return [...this.data().ideas].sort((a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0));
  });

  canGenerate = computed(() => this.data().ideas.length >= 2 && this.data().criterios.length >= 1);

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;
    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as SeleccionIdeasData | undefined;
    const storedReports = (raw['reports'] as SeleccionIdeasReportVersionDto[]) ?? [];
    this.data.set(stored ?? { ...EMPTY_SELECCION_IDEAS });
    this.reports.set(storedReports);
  }

  updateField(field: 'contexto' | 'metodo' | 'decision', value: string): void {
    this.data.set({ ...this.data(), [field]: value });
    this.scheduleSave();
  }

  addCriterio(): void {
    const newId = crypto.randomUUID();
    const newCriterio = { id: newId, nombre: '', peso: 20 };
    const updatedIdeas = this.data().ideas.map(idea => ({
      ...idea,
      puntuaciones: [...idea.puntuaciones, { criterioId: newId, valor: 0 }],
    }));
    this.data.set({ ...this.data(), criterios: [...this.data().criterios, newCriterio], ideas: updatedIdeas });
    this.scheduleSave();
  }

  updateCriterio(index: number, field: 'nombre', value: string): void {
    const criterios = this.data().criterios.map((c, i) => i === index ? { ...c, [field]: value } : c);
    this.data.set({ ...this.data(), criterios });
    this.scheduleSave();
  }

  updateCriterioPeso(index: number, value: number): void {
    const criterios = this.data().criterios.map((c, i) => i === index ? { ...c, peso: isNaN(value) ? 0 : Math.max(0, Math.min(100, value)) } : c);
    this.data.set({ ...this.data(), criterios });
    this.scheduleSave();
  }

  removeCriterio(index: number): void {
    const removedId = this.data().criterios[index]?.id;
    const criterios = this.data().criterios.filter((_, i) => i !== index);
    const ideas = this.data().ideas.map(idea => ({
      ...idea,
      puntuaciones: idea.puntuaciones.filter(p => p.criterioId !== removedId),
    }));
    this.data.set({ ...this.data(), criterios, ideas });
    this.scheduleSave();
  }

  addIdea(): void {
    const puntuaciones = this.data().criterios.map(c => ({ criterioId: c.id, valor: 0 }));
    const newIdea: IdeaSeleccionDto = {
      id: crypto.randomUUID(), texto: '', puntuaciones, estado: 'pendiente', siguientePaso: '',
    };
    this.data.set({ ...this.data(), ideas: [...this.data().ideas, newIdea] });
    this.scheduleSave();
  }

  updateIdea(id: string, field: 'texto' | 'siguientePaso', value: string): void {
    const ideas = this.data().ideas.map(idea => idea.id === id ? { ...idea, [field]: value } : idea);
    this.data.set({ ...this.data(), ideas });
    this.scheduleSave();
  }

  setEstado(id: string, estado: IdeaEstadoSeleccion): void {
    const ideas = this.data().ideas.map(idea => idea.id === id ? { ...idea, estado } : idea);
    this.data.set({ ...this.data(), ideas });
    this.scheduleSave();
  }

  setScore(ideaId: string, criterioId: string, valor: number): void {
    const ideas = this.data().ideas.map(idea => {
      if (idea.id !== ideaId) return idea;
      const hasPuntuacion = idea.puntuaciones.some(p => p.criterioId === criterioId);
      const puntuaciones = hasPuntuacion
        ? idea.puntuaciones.map(p => p.criterioId === criterioId ? { ...p, valor } : p)
        : [...idea.puntuaciones, { criterioId, valor }];
      return { ...idea, puntuaciones };
    });
    this.data.set({ ...this.data(), ideas });
    this.scheduleSave();
  }

  removeIdea(id: string): void {
    this.data.set({ ...this.data(), ideas: this.data().ideas.filter(i => i.id !== id) });
    this.scheduleSave();
  }

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;
    this.analyzing.set(true);
    try {
      const scores = this.ideaScores();
      const result = await this.seleccionIdeasService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        ideaScores: Object.fromEntries(scores),
        currentVersion: this.reports().length,
      });
      const newVersion: SeleccionIdeasReportVersionDto = {
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

  private async persistData(reports: SeleccionIdeasReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
