import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { SesionCocreacionService } from '@core/services/sesionCocreacionService/sesion-cocreacion.service';
import { SesionCocreacionReportComponent } from './sesion-cocreacion-report.component';
import {
  EMPTY_SESION_COCREACION,
  FASES_SESION,
  IdeaDto,
  MODALIDADES,
  ParticipanteDto,
  PERFILES_PARTICIPANTES,
  SesionCocreacionData,
  SesionCocreacionReportVersionDto,
  TECNICAS_SUGERIDAS,
} from './sesion-cocreacion.types';

@Component({
  selector: 'app-sesion-cocreacion-tool',
  standalone: true,
  imports: [FormsModule, SesionCocreacionReportComponent],
  template: `
    <div class="sc">

      <!-- Header -->
      <div class="sc__header">
        <div class="sc__header-left">
          <span class="sc__badge">SC</span>
          <div>
            <p class="sc__title">Sesión de Cocreación</p>
            <p class="sc__subtitle">
              {{ data().ideas.length }} idea{{ data().ideas.length === 1 ? '' : 's' }}
              @if (ideasSeleccionadas() > 0) { · {{ ideasSeleccionadas() }} seleccionada{{ ideasSeleccionadas() === 1 ? '' : 's' }} }
              @if (data().participantes.length > 0) { · {{ totalParticipantes() }} participante{{ totalParticipantes() === 1 ? '' : 's' }} }
              @if (saving()) { <span class="sc__saving"> · guardando…</span> }
            </p>
          </div>
        </div>
        <div class="sc__header-actions">
          @if (reports().length > 0) {
            <button class="sc__btn-ghost" (click)="showReport.set(!showReport())">
              <i class="pi pi-file-check"></i>
              Informes ({{ reports().length }})
            </button>
          }
          <button
            class="sc__btn-primary"
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
        <app-sesion-cocreacion-report [reports]="reports()" />
      } @else {

        <!-- Contexto de la sesión -->
        <div class="sc__section">
          <label class="sc__label">Objetivo de la sesión</label>
          <textarea
            class="sc__textarea sc__textarea--objetivo"
            placeholder="¿Qué problema o desafío van a resolver juntos? ¿Qué quieren lograr con esta sesión? (ej: diseñar una nueva función de ahorro para la app)"
            [ngModel]="data().objetivo"
            (ngModelChange)="patchData({ objetivo: $event })"
            rows="2"
          ></textarea>

          <div class="sc__row">
            <div class="sc__field">
              <label class="sc__label">Modalidad</label>
              <div class="sc__modalidades">
                @for (m of modalidades; track m.value) {
                  <button
                    class="sc__mod-btn"
                    [class.sc__mod-btn--active]="data().modalidad === m.value"
                    (click)="patchData({ modalidad: m.value })"
                  >{{ m.label }}</button>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Participantes -->
        <div class="sc__section">
          <div class="sc__section-header">
            <p class="sc__label">Participantes</p>
            <button class="sc__btn-add" (click)="addParticipante()">
              <i class="pi pi-plus"></i> Agregar perfil
            </button>
          </div>

          @if (data().participantes.length === 0) {
            <p class="sc__sublabel">¿Quiénes van a participar? Mezclá usuarios, equipo y stakeholders.</p>
          }

          <div class="sc__participantes">
            @for (p of data().participantes; track p.id; let i = $index) {
              <div class="sc__participante">
                <select
                  class="sc__select"
                  [ngModel]="p.perfil"
                  (ngModelChange)="updateParticipante(i, 'perfil', $event)"
                >
                  <option value="">Seleccionar perfil…</option>
                  @for (perf of perfilesSugeridos; track perf) {
                    <option [value]="perf">{{ perf }}</option>
                  }
                </select>
                <input
                  type="text"
                  class="sc__input sc__input--perfil-custom"
                  placeholder="O escribí el perfil…"
                  [ngModel]="p.perfil"
                  (ngModelChange)="updateParticipante(i, 'perfil', $event)"
                />
                <div class="sc__cantidad-ctrl">
                  <button class="sc__qty-btn" (click)="cambiarCantidad(i, -1)" [disabled]="p.cantidad <= 1">-</button>
                  <span class="sc__qty-val">{{ p.cantidad }}</span>
                  <button class="sc__qty-btn" (click)="cambiarCantidad(i, 1)">+</button>
                </div>
                <button class="sc__btn-remove" (click)="removeParticipante(i)">
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            }
          </div>
        </div>

        <!-- Fases cumplidas -->
        <div class="sc__section">
          <p class="sc__label">Fases de la sesión</p>
          <p class="sc__sublabel">¿Qué fases se cumplieron?</p>
          <div class="sc__fases">
            @for (f of fasesSesion; track f.value) {
              <button
                class="sc__fase-btn"
                [class.sc__fase-btn--active]="data().fasesCumplidas.includes(f.value)"
                (click)="toggleFase(f.value)"
              >
                <i class="pi" [class.pi-check-circle]="data().fasesCumplidas.includes(f.value)" [class.pi-circle]="!data().fasesCumplidas.includes(f.value)"></i>
                <span class="sc__fase-label">{{ f.label }}</span>
                <span class="sc__fase-desc">{{ f.desc }}</span>
              </button>
            }
          </div>
        </div>

        <!-- Técnicas usadas -->
        <div class="sc__section">
          <p class="sc__label">Técnicas utilizadas</p>
          <div class="sc__tecnicas-grid">
            @for (t of tecnicasSugeridas; track t) {
              <button
                class="sc__tecnica-chip"
                [class.sc__tecnica-chip--active]="data().tecnicasUsadas.includes(t)"
                (click)="toggleTecnica(t)"
              >{{ t }}</button>
            }
          </div>
        </div>

        <!-- Ideas generadas -->
        <div class="sc__section">
          <div class="sc__section-header">
            <p class="sc__label">Ideas generadas</p>
            <button class="sc__btn-add" (click)="addIdea()">
              <i class="pi pi-plus"></i> Agregar idea
            </button>
          </div>
          <p class="sc__sublabel">Documentá las ideas que surgieron en la sesión, los votos que recibió cada una y marcá las que el grupo seleccionó para avanzar.</p>

          @if (data().ideas.length === 0) {
            <div class="sc__empty">
              <i class="pi pi-lightbulb"></i>
              <p>Agregá las ideas que surgieron durante la sesión — de todos los grupos.</p>
            </div>
          }

          <div class="sc__ideas">
            @for (idea of data().ideas; track idea.id; let i = $index) {
              <div class="sc__idea" [class.sc__idea--seleccionada]="idea.seleccionada">
                <div class="sc__idea-left">
                  <input
                    type="text"
                    class="sc__input sc__input--grupo"
                    placeholder="Equipo / Grupo…"
                    [ngModel]="idea.grupo"
                    (ngModelChange)="updateIdea(i, 'grupo', $event)"
                  />
                  <textarea
                    class="sc__textarea sc__textarea--idea"
                    placeholder="Describí la idea… (ej: Reto de ahorro — gamificar con niveles de progreso visible)"
                    [ngModel]="idea.descripcion"
                    (ngModelChange)="updateIdea(i, 'descripcion', $event)"
                    rows="2"
                  ></textarea>
                </div>
                <div class="sc__idea-right">
                  <div class="sc__votos">
                    <button class="sc__qty-btn" (click)="cambiarVotos(i, -1)" [disabled]="idea.votos <= 0">-</button>
                    <div class="sc__votos-display">
                      <span class="sc__votos-num">{{ idea.votos }}</span>
                      <span class="sc__votos-label">votos</span>
                    </div>
                    <button class="sc__qty-btn" (click)="cambiarVotos(i, 1)">+</button>
                  </div>
                  <button
                    class="sc__star-btn"
                    [class.sc__star-btn--active]="idea.seleccionada"
                    (click)="toggleIdeaSeleccionada(i)"
                    title="Marcar como seleccionada"
                  >
                    <i class="pi" [class.pi-star-fill]="idea.seleccionada" [class.pi-star]="!idea.seleccionada"></i>
                  </button>
                  <button class="sc__btn-remove" (click)="removeIdea(i)">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Decisiones -->
        <div class="sc__section">
          <div class="sc__section-header">
            <p class="sc__label">Decisiones tomadas</p>
            <button class="sc__btn-add" (click)="addDecision()">
              <i class="pi pi-plus"></i> Agregar
            </button>
          </div>
          <div class="sc__chips-input">
            @for (d of data().decisiones; track $index; let i = $index) {
              <div class="sc__chip">
                <input
                  type="text"
                  class="sc__chip-input"
                  [ngModel]="d"
                  (ngModelChange)="updateDecision(i, $event)"
                  placeholder="¿Qué decidió el grupo? (ej: Prototipar el Reto de Ahorro con Redondeo automático)"
                />
                <button class="sc__chip-remove" (click)="removeDecision(i)">
                  <i class="pi pi-times"></i>
                </button>
              </div>
            }
            @if (data().decisiones.length === 0) {
              <p class="sc__sublabel">¿Qué se decidió avanzar? ¿Qué ideas se descartaron y por qué?</p>
            }
          </div>
        </div>

        <!-- Aprendizajes -->
        <div class="sc__section">
          <div class="sc__section-header">
            <p class="sc__label">Aprendizajes del equipo</p>
            <button class="sc__btn-add" (click)="addAprendizaje()">
              <i class="pi pi-plus"></i> Agregar
            </button>
          </div>
          <div class="sc__chips-input">
            @for (a of data().aprendizajes; track $index; let i = $index) {
              <div class="sc__chip">
                <input
                  type="text"
                  class="sc__chip-input"
                  [ngModel]="a"
                  (ngModelChange)="updateAprendizaje(i, $event)"
                  placeholder="¿Qué aprendió el equipo de esta sesión? ¿Qué sorprendió?"
                />
                <button class="sc__chip-remove" (click)="removeAprendizaje(i)">
                  <i class="pi pi-times"></i>
                </button>
              </div>
            }
            @if (data().aprendizajes.length === 0) {
              <p class="sc__sublabel">Insights del proceso — qué funcionó, qué no, qué sorprendió.</p>
            }
          </div>
        </div>

      }
    </div>
  `,
  styles: [`
    .sc { display: flex; flex-direction: column; gap: 0; }

    .sc__header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; border-bottom: 1px solid #f0abfc;
      background: linear-gradient(135deg, #fdf4ff, #fff);
    }
    .sc__header-left { display: flex; align-items: center; gap: 10px; }
    .sc__badge {
      width: 34px; height: 34px; border-radius: 8px;
      background: linear-gradient(135deg, #c026d3, #d946ef);
      color: #fff; font-size: 0.625rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      letter-spacing: 0.03em; flex-shrink: 0;
    }
    .sc__title { margin: 0; font-size: 0.875rem; font-weight: 700; color: #1f2937; }
    .sc__subtitle { margin: 0; font-size: 0.75rem; color: #6b7280; }
    .sc__saving { color: #c026d3; font-style: italic; }

    .sc__header-actions { display: flex; gap: 8px; }
    .sc__btn-ghost {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 12px; border-radius: 8px; border: 1px solid #f0abfc;
      background: transparent; font-size: 0.8125rem; color: #c026d3;
      cursor: pointer; transition: background 0.15s;
    }
    .sc__btn-ghost:hover { background: #fdf4ff; }
    .sc__btn-primary {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 8px; border: none;
      background: linear-gradient(135deg, #c026d3, #d946ef);
      color: #fff; font-size: 0.8125rem; font-weight: 600;
      cursor: pointer; transition: opacity 0.15s;
    }
    .sc__btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

    .sc__section { padding: 14px 16px; border-bottom: 1px solid #fae8ff; }
    .sc__section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .sc__label {
      font-size: 0.6875rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: #c026d3; margin: 0 0 6px; display: block;
    }
    .sc__sublabel { font-size: 0.72rem; color: #9ca3af; margin: 0 0 8px; }

    .sc__row { display: flex; gap: 12px; margin-top: 10px; }
    .sc__field { display: flex; flex-direction: column; gap: 4px; flex: 1; }

    .sc__textarea {
      width: 100%; border: 1px solid #f0abfc; border-radius: 8px;
      padding: 8px 10px; font-size: 0.8125rem; color: #374151;
      background: #fdf4ff; resize: vertical; box-sizing: border-box;
      font-family: inherit; line-height: 1.5;
    }
    .sc__textarea:focus { outline: none; border-color: #d946ef; background: #fff; }
    .sc__textarea--objetivo { border-left: 3px solid #c026d3; }
    .sc__textarea--idea { background: #fff; border-left: 3px solid #e879f9; }

    .sc__input {
      width: 100%; border: 1px solid #f0abfc; border-radius: 8px;
      padding: 7px 10px; font-size: 0.8125rem; color: #374151;
      background: #fff; box-sizing: border-box; font-family: inherit;
    }
    .sc__input:focus { outline: none; border-color: #d946ef; }
    .sc__input--grupo { font-weight: 600; font-size: 0.75rem; }
    .sc__input--perfil-custom { flex: 1; }

    .sc__select {
      border: 1px solid #f0abfc; border-radius: 8px;
      padding: 7px 10px; font-size: 0.8rem; color: #374151;
      background: #fff; cursor: pointer; font-family: inherit;
      flex-shrink: 0;
    }
    .sc__select:focus { outline: none; border-color: #d946ef; }

    .sc__modalidades { display: flex; gap: 6px; flex-wrap: wrap; }
    .sc__mod-btn {
      padding: 5px 12px; border-radius: 20px;
      border: 1px solid #f0abfc; background: #fff;
      font-size: 0.8rem; color: #6b7280; cursor: pointer; transition: all 0.15s;
    }
    .sc__mod-btn:hover { border-color: #d946ef; color: #c026d3; }
    .sc__mod-btn--active { background: #c026d3; border-color: #c026d3; color: #fff; font-weight: 700; }

    .sc__btn-add {
      display: flex; align-items: center; gap: 5px;
      padding: 5px 10px; border-radius: 6px;
      border: 1px dashed #d946ef; background: transparent;
      font-size: 0.75rem; color: #c026d3; cursor: pointer; transition: all 0.15s;
    }
    .sc__btn-add:hover { background: #fdf4ff; border-style: solid; }
    .sc__btn-remove {
      padding: 4px 6px; border-radius: 5px; border: none;
      background: transparent; color: #d1d5db; cursor: pointer; transition: color 0.15s;
    }
    .sc__btn-remove:hover { color: #ef4444; }

    .sc__empty {
      display: flex; flex-direction: column; align-items: center; gap: 6px;
      padding: 20px; color: #9ca3af; text-align: center;
    }
    .sc__empty i { font-size: 1.4rem; color: #f0abfc; }
    .sc__empty p { font-size: 0.8125rem; margin: 0; max-width: 320px; }

    .sc__participantes { display: flex; flex-direction: column; gap: 6px; }
    .sc__participante {
      display: flex; align-items: center; gap: 6px;
    }

    .sc__cantidad-ctrl { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
    .sc__qty-btn {
      width: 24px; height: 24px; border-radius: 6px; border: 1px solid #f0abfc;
      background: #fff; color: #c026d3; font-size: 0.875rem; font-weight: 700;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.15s;
    }
    .sc__qty-btn:hover:not(:disabled) { background: #fdf4ff; }
    .sc__qty-btn:disabled { opacity: 0.35; cursor: not-allowed; }
    .sc__qty-val {
      min-width: 20px; text-align: center;
      font-size: 0.8125rem; font-weight: 700; color: #374151;
    }

    .sc__fases { display: flex; flex-direction: column; gap: 5px; }
    .sc__fase-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 12px; border-radius: 8px;
      border: 1px solid #f0abfc; background: #fff;
      cursor: pointer; transition: all 0.15s; text-align: left;
    }
    .sc__fase-btn:hover { background: #fdf4ff; }
    .sc__fase-btn--active { background: #fdf4ff; border-color: #c026d3; }
    .sc__fase-btn--active .sc__fase-label { color: #c026d3; }
    .sc__fase-btn .pi { font-size: 0.9rem; color: #d1d5db; flex-shrink: 0; }
    .sc__fase-btn--active .pi { color: #c026d3; }
    .sc__fase-label { font-size: 0.8125rem; font-weight: 600; color: #374151; flex-shrink: 0; }
    .sc__fase-desc { font-size: 0.72rem; color: #9ca3af; }

    .sc__tecnicas-grid { display: flex; flex-wrap: wrap; gap: 6px; }
    .sc__tecnica-chip {
      padding: 4px 10px; border-radius: 20px;
      border: 1px solid #f0abfc; background: #fff;
      font-size: 0.775rem; color: #6b7280; cursor: pointer; transition: all 0.15s;
    }
    .sc__tecnica-chip:hover { border-color: #d946ef; color: #c026d3; }
    .sc__tecnica-chip--active { background: #fdf4ff; border-color: #c026d3; color: #c026d3; font-weight: 700; }

    .sc__ideas { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
    .sc__idea {
      display: flex; gap: 8px; align-items: flex-start;
      padding: 10px 12px; border-radius: 10px;
      border: 1px solid #f0abfc; background: #fdf4ff;
      transition: border-color 0.15s;
    }
    .sc__idea--seleccionada { border-color: #c026d3; border-width: 2px; background: #fdf4ff; }
    .sc__idea-left { display: flex; flex-direction: column; gap: 5px; flex: 1; }
    .sc__idea-right { display: flex; flex-direction: column; align-items: center; gap: 8px; flex-shrink: 0; }

    .sc__votos { display: flex; flex-direction: column; align-items: center; gap: 3px; }
    .sc__votos-display { display: flex; flex-direction: column; align-items: center; }
    .sc__votos-num { font-size: 1.125rem; font-weight: 800; color: #c026d3; line-height: 1; }
    .sc__votos-label { font-size: 0.6rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; }

    .sc__star-btn {
      width: 28px; height: 28px; border-radius: 50%; border: 1px solid #f0abfc;
      background: transparent; color: #d1d5db; cursor: pointer; font-size: 0.875rem;
      display: flex; align-items: center; justify-content: center; transition: all 0.15s;
    }
    .sc__star-btn:hover { border-color: #d946ef; color: #d946ef; }
    .sc__star-btn--active { border-color: #c026d3; color: #c026d3; background: #fdf4ff; }

    .sc__chips-input { display: flex; flex-direction: column; gap: 5px; }
    .sc__chip {
      display: flex; align-items: center; gap: 6px;
      background: #fdf4ff; border: 1px solid #f0abfc;
      border-radius: 8px; padding: 5px 8px;
    }
    .sc__chip-input {
      flex: 1; border: none; background: transparent;
      font-size: 0.8125rem; color: #374151; font-family: inherit;
    }
    .sc__chip-input:focus { outline: none; }
    .sc__chip-remove {
      padding: 2px 4px; border: none; background: transparent;
      color: #d1d5db; cursor: pointer; font-size: 0.65rem; transition: color 0.15s;
    }
    .sc__chip-remove:hover { color: #ef4444; }
  `],
})
export class SesionCocreacionToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly sesionCocreacionService = inject(SesionCocreacionService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<SesionCocreacionData>({ ...EMPTY_SESION_COCREACION });
  reports = signal<SesionCocreacionReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  readonly modalidades = MODALIDADES;
  readonly fasesSesion = FASES_SESION;
  readonly tecnicasSugeridas = TECNICAS_SUGERIDAS;
  readonly perfilesSugeridos = PERFILES_PARTICIPANTES;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  canGenerate = computed(() => {
    const d = this.data();
    return d.objetivo.trim().length > 0 && d.ideas.length >= 2;
  });

  ideasSeleccionadas = computed(() => this.data().ideas.filter(i => i.seleccionada).length);

  totalParticipantes = computed(() => this.data().participantes.reduce((sum, p) => sum + p.cantidad, 0));

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;
    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as SesionCocreacionData | undefined;
    const storedReports = (raw['reports'] as SesionCocreacionReportVersionDto[]) ?? [];
    this.data.set(stored ?? { ...EMPTY_SESION_COCREACION });
    this.reports.set(storedReports);
  }

  patchData(partial: Partial<SesionCocreacionData>): void {
    this.data.set({ ...this.data(), ...partial });
    this.scheduleSave();
  }

  addParticipante(): void {
    const nuevo: ParticipanteDto = { id: crypto.randomUUID(), perfil: '', cantidad: 1 };
    this.data.set({ ...this.data(), participantes: [...this.data().participantes, nuevo] });
    this.scheduleSave();
  }

  removeParticipante(index: number): void {
    this.data.set({ ...this.data(), participantes: this.data().participantes.filter((_, i) => i !== index) });
    this.scheduleSave();
  }

  updateParticipante(index: number, field: keyof ParticipanteDto, value: string): void {
    const participantes = this.data().participantes.map((p, i) =>
      i === index ? { ...p, [field]: value } : p,
    );
    this.data.set({ ...this.data(), participantes });
    this.scheduleSave();
  }

  cambiarCantidad(index: number, delta: number): void {
    const participantes = this.data().participantes.map((p, i) => {
      if (i !== index) return p;
      return { ...p, cantidad: Math.max(1, p.cantidad + delta) };
    });
    this.data.set({ ...this.data(), participantes });
    this.scheduleSave();
  }

  toggleFase(value: string): void {
    const fases = this.data().fasesCumplidas;
    const updated = fases.includes(value) ? fases.filter(f => f !== value) : [...fases, value];
    this.patchData({ fasesCumplidas: updated });
  }

  toggleTecnica(tecnica: string): void {
    const tecnicas = this.data().tecnicasUsadas;
    const updated = tecnicas.includes(tecnica) ? tecnicas.filter(t => t !== tecnica) : [...tecnicas, tecnica];
    this.patchData({ tecnicasUsadas: updated });
  }

  addIdea(): void {
    const nueva: IdeaDto = {
      id: crypto.randomUUID(),
      grupo: '',
      descripcion: '',
      votos: 0,
      seleccionada: false,
    };
    this.data.set({ ...this.data(), ideas: [...this.data().ideas, nueva] });
    this.scheduleSave();
  }

  removeIdea(index: number): void {
    this.data.set({ ...this.data(), ideas: this.data().ideas.filter((_, i) => i !== index) });
    this.scheduleSave();
  }

  updateIdea(index: number, field: keyof IdeaDto, value: string): void {
    const ideas = this.data().ideas.map((idea, i) =>
      i === index ? { ...idea, [field]: value } : idea,
    );
    this.data.set({ ...this.data(), ideas });
    this.scheduleSave();
  }

  cambiarVotos(index: number, delta: number): void {
    const ideas = this.data().ideas.map((idea, i) => {
      if (i !== index) return idea;
      return { ...idea, votos: Math.max(0, idea.votos + delta) };
    });
    this.data.set({ ...this.data(), ideas });
    this.scheduleSave();
  }

  toggleIdeaSeleccionada(index: number): void {
    const ideas = this.data().ideas.map((idea, i) =>
      i === index ? { ...idea, seleccionada: !idea.seleccionada } : idea,
    );
    this.data.set({ ...this.data(), ideas });
    this.scheduleSave();
  }

  addDecision(): void {
    this.data.set({ ...this.data(), decisiones: [...this.data().decisiones, ''] });
    this.scheduleSave();
  }

  removeDecision(index: number): void {
    this.data.set({ ...this.data(), decisiones: this.data().decisiones.filter((_, i) => i !== index) });
    this.scheduleSave();
  }

  updateDecision(index: number, value: string): void {
    const decisiones = this.data().decisiones.map((d, i) => i === index ? value : d);
    this.data.set({ ...this.data(), decisiones });
    this.scheduleSave();
  }

  addAprendizaje(): void {
    this.data.set({ ...this.data(), aprendizajes: [...this.data().aprendizajes, ''] });
    this.scheduleSave();
  }

  removeAprendizaje(index: number): void {
    this.data.set({ ...this.data(), aprendizajes: this.data().aprendizajes.filter((_, i) => i !== index) });
    this.scheduleSave();
  }

  updateAprendizaje(index: number, value: string): void {
    const aprendizajes = this.data().aprendizajes.map((a, i) => i === index ? value : a);
    this.data.set({ ...this.data(), aprendizajes });
    this.scheduleSave();
  }

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;
    this.analyzing.set(true);
    try {
      const result = await this.sesionCocreacionService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });
      const newVersion: SesionCocreacionReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };
      const updated = [newVersion, ...this.reports()];
      this.reports.set(updated);
      await this.persistData(updated);
      this.showReport.set(true);
      this.uiDialog.showSuccess('Informe generado', 'El análisis de la sesión fue generado correctamente.');
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

  private async persistData(reports: SesionCocreacionReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
