import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { PrototipoRapidoService } from '@core/services/prototipoRapidoService/prototipo-rapido.service';
import { PrototipoRapidoReportComponent } from './prototipo-rapido-report.component';
import {
  DECISIONES,
  DecisionPrototipo,
  EMPTY_PROTOTIPO_RAPIDO,
  PrototipoRapidoData,
  PrototipoRapidoReportVersionDto,
  ResultadoTest,
  SesionTestDto,
  TECNICAS_PROTOTIPO,
  TecnicaPrototipo,
} from './prototipo-rapido.types';

@Component({
  selector: 'app-prototipo-rapido-tool',
  standalone: true,
  imports: [FormsModule, PrototipoRapidoReportComponent],
  template: `
    <div class="pr-tool">
      <!-- Header -->
      <div class="pr-tool__header">
        <div class="pr-tool__badge">PR</div>
        <div>
          <h2 class="pr-tool__title">Prototipo Rápido</h2>
          <p class="pr-tool__subtitle">Aprendé rápido, fallá barato, iterá antes de invertir</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="pr-tool__tabs">
        <button class="pr-tool__tab" [class.pr-tool__tab--active]="activeView() === 'form'" (click)="activeView.set('form')">
          <i class="pi pi-bolt"></i> Prototipo
        </button>
        <button class="pr-tool__tab" [class.pr-tool__tab--active]="activeView() === 'report'" (click)="activeView.set('report')">
          <i class="pi pi-chart-bar"></i> Análisis
          @if (reports().length > 0) {
            <span class="pr-tool__tab-badge">{{ reports().length }}</span>
          }
        </button>
      </div>

      @if (activeView() === 'form') {
        <div class="pr-tool__form">

          <!-- Pregunta a validar -->
          <div class="pr-section">
            <h3 class="pr-section__title">Hipótesis a validar</h3>
            <div class="pr-field">
              <label class="pr-field__label">¿Qué querés aprender con este prototipo?</label>
              <textarea
                class="pr-field__textarea"
                rows="2"
                placeholder="Ej: ¿Los usuarios entienden el flujo de compra rápida sin instrucciones?"
                [ngModel]="data().preguntaValidar"
                (ngModelChange)="patch({ preguntaValidar: $event })"
              ></textarea>
            </div>
          </div>

          <!-- Técnica y tiempo -->
          <div class="pr-section">
            <h3 class="pr-section__title">Técnica y construcción</h3>

            <div class="pr-tecnica-grid">
              @for (tec of tecnicas; track tec.value) {
                <button
                  class="pr-tecnica-card"
                  [class.pr-tecnica-card--active]="data().tecnica === tec.value"
                  (click)="patch({ tecnica: tec.value })"
                >
                  <span class="pr-tecnica-card__label">{{ tec.label }}</span>
                  <span class="pr-tecnica-card__tiempo">{{ tec.tiempo }}</span>
                  <span class="pr-tecnica-card__material">{{ tec.material }}</span>
                </button>
              }
            </div>

            <div class="pr-row">
              <div class="pr-field pr-field--half">
                <label class="pr-field__label">Tiempo invertido</label>
                <input
                  class="pr-field__input"
                  type="text"
                  placeholder="Ej: 45 min, 2 horas..."
                  [ngModel]="data().tiempoInvertido"
                  (ngModelChange)="patch({ tiempoInvertido: $event })"
                />
              </div>
            </div>

            <div class="pr-field">
              <label class="pr-field__label">Descripción del prototipo</label>
              <textarea
                class="pr-field__textarea"
                rows="2"
                placeholder="Qué construiste — el happy path cubierto, qué dejaste afuera..."
                [ngModel]="data().descripcionPrototipo"
                (ngModelChange)="patch({ descripcionPrototipo: $event })"
              ></textarea>
            </div>

            <div class="pr-field">
              <label class="pr-field__label">Herramientas usadas</label>
              <div class="pr-chips">
                @for (h of data().herramientasUsadas; track $index) {
                  <div class="pr-chip">
                    <span>{{ h }}</span>
                    <button class="pr-chip__remove" (click)="removeHerramienta($index)">
                      <i class="pi pi-times"></i>
                    </button>
                  </div>
                }
                <input
                  class="pr-chips__input"
                  type="text"
                  placeholder="+ Agregar herramienta..."
                  #herramientaInput
                  (keydown.enter)="addHerramienta(herramientaInput.value); herramientaInput.value = ''"
                />
              </div>
            </div>
          </div>

          <!-- Sesiones de test -->
          <div class="pr-section">
            <div class="pr-section__header">
              <h3 class="pr-section__title">Sesiones de testing</h3>
              <button class="pr-btn pr-btn--ghost" (click)="addSesion()">
                <i class="pi pi-plus"></i> Agregar usuario
              </button>
            </div>
            <p class="pr-section__hint">Documentá cada sesión de testing — 3 a 5 usuarios es suficiente.</p>

            @if (data().sesionesTest.length === 0) {
              <div class="pr-tasa-hint">
                <i class="pi pi-users"></i>
                <span>Agregá sesiones para calcular la tasa de éxito</span>
              </div>
            } @else {
              <div class="pr-tasa-bar">
                <span class="pr-tasa-bar__label">Tasa de éxito:</span>
                <span class="pr-tasa-bar__value">{{ tasaExito() }}%</span>
                <span class="pr-tasa-bar__detail">({{ exitosCount() }}/{{ data().sesionesTest.length }} usuarios)</span>
              </div>
            }

            @for (sesion of data().sesionesTest; track sesion.id; let i = $index) {
              <div class="pr-sesion">
                <div class="pr-sesion__header">
                  <span class="pr-sesion__num">U{{ i + 1 }}</span>
                  <input
                    class="pr-sesion__usuario"
                    type="text"
                    placeholder="Descripción del usuario (ej: Ana, 35 años, compradora online)"
                    [ngModel]="sesion.usuario"
                    (ngModelChange)="updateSesion(sesion.id, 'usuario', $event)"
                  />
                  <div class="pr-resultado-btns">
                    <button
                      class="pr-resultado-btn pr-resultado-btn--exito"
                      [class.pr-resultado-btn--active]="sesion.resultado === 'exito'"
                      (click)="updateSesionResultado(sesion.id, 'exito')"
                      title="Éxito"
                    ><i class="pi pi-check"></i></button>
                    <button
                      class="pr-resultado-btn pr-resultado-btn--parcial"
                      [class.pr-resultado-btn--active]="sesion.resultado === 'parcial'"
                      (click)="updateSesionResultado(sesion.id, 'parcial')"
                      title="Parcial"
                    ><i class="pi pi-minus"></i></button>
                    <button
                      class="pr-resultado-btn pr-resultado-btn--fallo"
                      [class.pr-resultado-btn--active]="sesion.resultado === 'fallo'"
                      (click)="updateSesionResultado(sesion.id, 'fallo')"
                      title="Fallo"
                    ><i class="pi pi-times"></i></button>
                  </div>
                  <button class="pr-sesion__remove" (click)="removeSesion(sesion.id)">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
                <textarea
                  class="pr-sesion__feedback"
                  rows="2"
                  placeholder="Feedback o observación de la sesión..."
                  [ngModel]="sesion.feedback"
                  (ngModelChange)="updateSesion(sesion.id, 'feedback', $event)"
                ></textarea>
              </div>
            }
          </div>

          <!-- Hallazgos -->
          <div class="pr-section">
            <h3 class="pr-section__title">Hallazgos clave</h3>
            <p class="pr-section__hint">Lo que aprendiste — esto es más valioso que el prototipo.</p>
            <div class="pr-chips">
              @for (h of data().hallazgos; track $index) {
                <div class="pr-chip pr-chip--orange">
                  <span>{{ h }}</span>
                  <button class="pr-chip__remove" (click)="removeHallazgo($index)">
                    <i class="pi pi-times"></i>
                  </button>
                </div>
              }
              <input
                class="pr-chips__input"
                type="text"
                placeholder="+ Agregar hallazgo..."
                #hallazgoInput
                (keydown.enter)="addHallazgo(hallazgoInput.value); hallazgoInput.value = ''"
              />
            </div>
          </div>

          <!-- Decisión -->
          <div class="pr-section">
            <h3 class="pr-section__title">Decisión</h3>
            <div class="pr-decision-grid">
              @for (d of decisiones; track d.value) {
                <button
                  class="pr-decision-card"
                  [class.pr-decision-card--active]="data().decision === d.value"
                  (click)="patch({ decision: d.value })"
                >
                  <span class="pr-decision-card__label">{{ d.label }}</span>
                  <span class="pr-decision-card__desc">{{ d.descripcion }}</span>
                </button>
              }
            </div>

            <div class="pr-field">
              <label class="pr-field__label">Próximas iteraciones o pasos</label>
              <div class="pr-chips">
                @for (p of data().iteracionesSiguientes; track $index) {
                  <div class="pr-chip">
                    <span>{{ p }}</span>
                    <button class="pr-chip__remove" (click)="removeIteracion($index)">
                      <i class="pi pi-times"></i>
                    </button>
                  </div>
                }
                <input
                  class="pr-chips__input"
                  type="text"
                  placeholder="+ Agregar paso..."
                  #iteracionInput
                  (keydown.enter)="addIteracion(iteracionInput.value); iteracionInput.value = ''"
                />
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="pr-tool__actions">
            <div class="pr-tool__save-status">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              }
            </div>
            <button
              class="pr-btn pr-btn--primary"
              [disabled]="!canGenerate() || analyzing()"
              (click)="analyze()"
            >
              @if (analyzing()) {
                <i class="pi pi-spin pi-spinner"></i> Analizando...
              } @else {
                <i class="pi pi-sparkles"></i> Generar análisis
              }
            </button>
          </div>
        </div>
      }

      @if (activeView() === 'report') {
        <div class="pr-tool__report">
          <app-prototipo-rapido-report [versions]="reports()" />
        </div>
      }
    </div>
  `,
  styles: [`
    .pr-tool {
      display: flex;
      flex-direction: column;
      gap: 0;
      height: 100%;
    }
    .pr-tool__header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .pr-tool__badge {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: .75rem;
      background: #ea580c;
      color: #fff;
      font-weight: 800;
      font-size: .85rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .pr-tool__title { margin: 0; font-size: 1.1rem; font-weight: 700; color: #111827; }
    .pr-tool__subtitle { margin: .125rem 0 0; font-size: .8rem; color: #6b7280; }
    .pr-tool__tabs {
      display: flex;
      gap: .25rem;
      padding: .75rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
    }
    .pr-tool__tab {
      display: flex;
      align-items: center;
      gap: .4rem;
      padding: .4rem .875rem;
      border-radius: .5rem;
      border: none;
      background: transparent;
      color: #6b7280;
      font-size: .875rem;
      cursor: pointer;
      transition: all .15s;
    }
    .pr-tool__tab--active { background: #fff; color: #ea580c; font-weight: 600; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
    .pr-tool__tab-badge {
      background: #ea580c;
      color: #fff;
      font-size: .65rem;
      font-weight: 700;
      padding: .1rem .4rem;
      border-radius: 9999px;
    }
    .pr-tool__form {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .pr-tool__report {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem 1.5rem;
    }
    .pr-tool__actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: .75rem;
      border-top: 1px solid #e5e7eb;
    }
    .pr-tool__save-status { font-size: .8rem; color: #9ca3af; display: flex; align-items: center; gap: .4rem; }
    .pr-section {
      background: #f9fafb;
      border-radius: .875rem;
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: .75rem;
    }
    .pr-section__header { display: flex; align-items: center; justify-content: space-between; }
    .pr-section__title { margin: 0; font-size: .9rem; font-weight: 700; color: #111827; }
    .pr-section__hint { margin: -.25rem 0 0; font-size: .8rem; color: #9ca3af; }
    .pr-row { display: flex; gap: .75rem; }
    .pr-field { display: flex; flex-direction: column; gap: .375rem; }
    .pr-field--half { flex: 0 0 12rem; }
    .pr-field__label { font-size: .8rem; font-weight: 600; color: #374151; }
    .pr-field__input {
      border: 1px solid #e5e7eb;
      border-radius: .5rem;
      padding: .5rem .75rem;
      font-size: .875rem;
      font-family: inherit;
      outline: none;
      background: #fff;
      transition: border-color .15s;
    }
    .pr-field__input:focus { border-color: #ea580c; }
    .pr-field__textarea {
      width: 100%;
      border: 1px solid #e5e7eb;
      border-radius: .5rem;
      padding: .625rem .75rem;
      font-size: .875rem;
      font-family: inherit;
      resize: vertical;
      outline: none;
      background: #fff;
      box-sizing: border-box;
      transition: border-color .15s;
    }
    .pr-field__textarea:focus { border-color: #ea580c; }
    .pr-tecnica-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: .5rem;
    }
    .pr-tecnica-card {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: .15rem;
      padding: .625rem .875rem;
      border-radius: .625rem;
      border: 2px solid #e5e7eb;
      background: #fff;
      cursor: pointer;
      text-align: left;
      transition: all .15s;
    }
    .pr-tecnica-card--active { border-color: #ea580c; background: #fff7ed; }
    .pr-tecnica-card__label { font-size: .8rem; font-weight: 700; color: #111827; }
    .pr-tecnica-card__tiempo { font-size: .7rem; font-weight: 600; color: #ea580c; }
    .pr-tecnica-card__material { font-size: .7rem; color: #6b7280; }
    .pr-chips { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; }
    .pr-chip {
      display: flex;
      align-items: center;
      gap: .375rem;
      padding: .3rem .625rem;
      border-radius: 9999px;
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      font-size: .8rem;
      color: #374151;
    }
    .pr-chip--orange { background: #fff7ed; border-color: #fed7aa; color: #9a3412; }
    .pr-chip__remove {
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      cursor: pointer;
      color: inherit;
      opacity: .6;
      padding: 0;
      font-size: .65rem;
      transition: opacity .15s;
    }
    .pr-chip__remove:hover { opacity: 1; }
    .pr-chips__input {
      border: none;
      outline: none;
      font-size: .8rem;
      color: #374151;
      background: transparent;
      min-width: 8rem;
    }
    .pr-tasa-hint {
      display: flex;
      align-items: center;
      gap: .5rem;
      font-size: .8rem;
      color: #9ca3af;
      font-style: italic;
      padding: .5rem;
    }
    .pr-tasa-bar {
      display: flex;
      align-items: center;
      gap: .5rem;
      background: #fff;
      border-radius: .5rem;
      padding: .5rem .75rem;
      border: 1px solid #e5e7eb;
    }
    .pr-tasa-bar__label { font-size: .8rem; font-weight: 600; color: #374151; }
    .pr-tasa-bar__value { font-size: 1.25rem; font-weight: 800; color: #ea580c; }
    .pr-tasa-bar__detail { font-size: .75rem; color: #9ca3af; }
    .pr-sesion {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: .625rem;
      overflow: hidden;
    }
    .pr-sesion__header {
      display: flex;
      align-items: center;
      gap: .5rem;
      padding: .5rem .75rem;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }
    .pr-sesion__num {
      font-size: .7rem;
      font-weight: 800;
      color: #ea580c;
      background: #fff7ed;
      border: 1px solid #fed7aa;
      border-radius: .25rem;
      padding: .1rem .4rem;
      flex-shrink: 0;
    }
    .pr-sesion__usuario {
      flex: 1;
      border: none;
      outline: none;
      font-size: .8rem;
      font-family: inherit;
      background: transparent;
      color: #374151;
    }
    .pr-resultado-btns { display: flex; gap: .25rem; flex-shrink: 0; }
    .pr-resultado-btn {
      width: 1.5rem;
      height: 1.5rem;
      border-radius: .25rem;
      border: 1px solid #e5e7eb;
      background: #fff;
      cursor: pointer;
      font-size: .65rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all .15s;
      color: #9ca3af;
    }
    .pr-resultado-btn--exito.pr-resultado-btn--active { background: #dcfce7; border-color: #86efac; color: #16a34a; }
    .pr-resultado-btn--parcial.pr-resultado-btn--active { background: #fef9c3; border-color: #fde047; color: #ca8a04; }
    .pr-resultado-btn--fallo.pr-resultado-btn--active { background: #fee2e2; border-color: #fca5a5; color: #dc2626; }
    .pr-sesion__remove {
      border: none;
      background: transparent;
      cursor: pointer;
      color: #9ca3af;
      padding: .25rem;
      font-size: .7rem;
      transition: color .15s;
      flex-shrink: 0;
    }
    .pr-sesion__remove:hover { color: #ef4444; }
    .pr-sesion__feedback {
      width: 100%;
      border: none;
      outline: none;
      padding: .625rem .75rem;
      font-size: .8rem;
      font-family: inherit;
      background: transparent;
      color: #374151;
      resize: none;
      box-sizing: border-box;
    }
    .pr-decision-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: .625rem;
    }
    .pr-decision-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: .2rem;
      padding: .75rem;
      border-radius: .625rem;
      border: 2px solid #e5e7eb;
      background: #fff;
      cursor: pointer;
      transition: all .15s;
    }
    .pr-decision-card--active { border-color: #ea580c; background: #fff7ed; }
    .pr-decision-card__label { font-size: .875rem; font-weight: 700; color: #111827; }
    .pr-decision-card__desc { font-size: .75rem; color: #6b7280; }
    .pr-btn {
      display: inline-flex;
      align-items: center;
      gap: .4rem;
      padding: .5rem 1rem;
      border-radius: .5rem;
      font-size: .875rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all .15s;
    }
    .pr-btn--primary { background: #ea580c; color: #fff; }
    .pr-btn--primary:hover:not(:disabled) { background: #c2410c; }
    .pr-btn--primary:disabled { opacity: .5; cursor: not-allowed; }
    .pr-btn--ghost { background: transparent; color: #ea580c; border: 1px solid #ea580c; padding: .35rem .75rem; font-size: .8rem; }
    .pr-btn--ghost:hover { background: #fff7ed; }
  `],
})
export class PrototipoRapidoToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly prototipoRapidoService = inject(PrototipoRapidoService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<PrototipoRapidoData>({ ...EMPTY_PROTOTIPO_RAPIDO });
  reports = signal<PrototipoRapidoReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  activeView = signal<'form' | 'report'>('form');

  readonly tecnicas = TECNICAS_PROTOTIPO;
  readonly decisiones = DECISIONES;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  tasaExito = computed(() => {
    const s = this.data().sesionesTest;
    if (!s.length) return 0;
    const exitosos = s.filter(t => t.resultado === 'exito').length;
    return Math.round((exitosos / s.length) * 100);
  });

  exitosCount = computed(() => this.data().sesionesTest.filter(t => t.resultado === 'exito').length);

  canGenerate = computed(() => {
    const d = this.data();
    return !!d.preguntaValidar.trim() && !!d.tecnica && d.sesionesTest.length >= 1;
  });

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;
    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as PrototipoRapidoData | undefined;
    this.data.set(stored ? { ...EMPTY_PROTOTIPO_RAPIDO, ...stored } : { ...EMPTY_PROTOTIPO_RAPIDO });
    this.reports.set((raw['reports'] as PrototipoRapidoReportVersionDto[]) ?? []);
  }

  patch(partial: Partial<PrototipoRapidoData>): void {
    this.data.set({ ...this.data(), ...partial });
    this.scheduleSave();
  }

  // Herramientas
  addHerramienta(value: string): void {
    const v = value.trim();
    if (!v) return;
    this.patch({ herramientasUsadas: [...this.data().herramientasUsadas, v] });
  }
  removeHerramienta(index: number): void {
    const arr = [...this.data().herramientasUsadas];
    arr.splice(index, 1);
    this.patch({ herramientasUsadas: arr });
  }

  // Sesiones de test
  addSesion(): void {
    const sesion: SesionTestDto = { id: crypto.randomUUID(), usuario: '', resultado: 'exito', feedback: '' };
    this.patch({ sesionesTest: [...this.data().sesionesTest, sesion] });
  }
  updateSesion(id: string, field: keyof SesionTestDto, value: string): void {
    const arr = this.data().sesionesTest.map(s => s.id === id ? { ...s, [field]: value } : s);
    this.patch({ sesionesTest: arr });
  }
  updateSesionResultado(id: string, resultado: ResultadoTest): void {
    const arr = this.data().sesionesTest.map(s => s.id === id ? { ...s, resultado } : s);
    this.patch({ sesionesTest: arr });
  }
  removeSesion(id: string): void {
    this.patch({ sesionesTest: this.data().sesionesTest.filter(s => s.id !== id) });
  }

  // Hallazgos
  addHallazgo(value: string): void {
    const v = value.trim();
    if (!v) return;
    this.patch({ hallazgos: [...this.data().hallazgos, v] });
  }
  removeHallazgo(index: number): void {
    const arr = [...this.data().hallazgos];
    arr.splice(index, 1);
    this.patch({ hallazgos: arr });
  }

  // Iteraciones siguientes
  addIteracion(value: string): void {
    const v = value.trim();
    if (!v) return;
    this.patch({ iteracionesSiguientes: [...this.data().iteracionesSiguientes, v] });
  }
  removeIteracion(index: number): void {
    const arr = [...this.data().iteracionesSiguientes];
    arr.splice(index, 1);
    this.patch({ iteracionesSiguientes: arr });
  }

  private scheduleSave(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.saveData(), 800);
  }

  private async saveData(): Promise<void> {
    const app = this.application();
    if (!app) return;
    this.saving.set(true);
    try {
      await this.toolApplicationService.update(app.id, {
        structuredData: { data: this.data(), reports: this.reports() },
      });
      this.sessionSaved.emit();
    } finally {
      this.saving.set(false);
    }
  }

  async analyze(): Promise<void> {
    const app = this.application();
    if (!app || !this.canGenerate()) return;
    this.analyzing.set(true);
    try {
      const res = await this.prototipoRapidoService.analyze({
        toolApplicationId: app.id,
        currentVersion: this.reports().length,
        data: this.data(),
      });
      const newVersion = { version: res.version, generatedAt: res.generatedAt, report: res.report };
      this.reports.update(r => [newVersion, ...r]);
      await this.saveData();
      this.activeView.set('report');
    } catch {
      this.uiDialog.showError('Error', 'No se pudo generar el análisis');
    } finally {
      this.analyzing.set(false);
    }
  }
}
