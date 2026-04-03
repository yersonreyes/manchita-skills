import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { PrototipoMostrarService } from '@core/services/prototipoMostrarService/prototipo-mostrar.service';
import { PrototipoMostrarReportComponent } from './prototipo-mostrar-report.component';
import {
  EMPTY_PROTOTIPO_MOSTRAR,
  NIVELES_DEMO,
  NivelDemo,
  PreguntaAnticipada,
  PrototipoMostrarData,
  PrototipoMostrarReportVersionDto,
} from './prototipo-mostrar.types';

@Component({
  selector: 'app-prototipo-mostrar-tool',
  standalone: true,
  imports: [FormsModule, PrototipoMostrarReportComponent],
  template: `
    <div class="pm-tool">
      <!-- Header -->
      <div class="pm-tool__header">
        <div class="pm-tool__badge">PM</div>
        <div>
          <h2 class="pm-tool__title">Prototipo para Mostrar</h2>
          <p class="pm-tool__subtitle">Preparás una demo que cuenta una historia convincente y obtiene buy-in</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="pm-tool__tabs">
        <button class="pm-tool__tab" [class.pm-tool__tab--active]="activeView() === 'form'" (click)="activeView.set('form')">
          <i class="pi pi-pencil"></i> Preparación
        </button>
        <button class="pm-tool__tab" [class.pm-tool__tab--active]="activeView() === 'report'" (click)="activeView.set('report')">
          <i class="pi pi-eye"></i> Análisis
          @if (reports().length > 0) {
            <span class="pm-tool__tab-badge">{{ reports().length }}</span>
          }
        </button>
      </div>

      @if (activeView() === 'form') {
        <div class="pm-tool__form">

          <!-- Audiencia y nivel -->
          <div class="pm-section">
            <h3 class="pm-section__title">Audiencia y formato</h3>
            <div class="pm-field">
              <label class="pm-field__label">¿A quién vas a presentar?</label>
              <input
                class="pm-field__input"
                type="text"
                placeholder="Ej: Board de directores, potenciales clientes B2B, usuarios beta..."
                [ngModel]="data().audiencia"
                (ngModelChange)="patch({ audiencia: $event })"
              />
            </div>

            <div class="pm-field">
              <label class="pm-field__label">Nivel de la demo</label>
              <div class="pm-nivel-grid">
                @for (nivel of nivelesDemo; track nivel.value) {
                  <button
                    class="pm-nivel-card"
                    [class.pm-nivel-card--active]="data().nivelDemo === nivel.value"
                    (click)="patch({ nivelDemo: nivel.value })"
                  >
                    <span class="pm-nivel-card__label">{{ nivel.label }}</span>
                    <span class="pm-nivel-card__desc">{{ nivel.descripcion }}</span>
                    <span class="pm-nivel-card__audience">Para: {{ nivel.audiencia }}</span>
                  </button>
                }
              </div>
            </div>
          </div>

          <!-- Mensaje y problema -->
          <div class="pm-section">
            <h3 class="pm-section__title">El mensaje</h3>
            <div class="pm-field">
              <label class="pm-field__label">Mensaje clave — ¿qué querés que la audiencia entienda y recuerde?</label>
              <textarea
                class="pm-field__textarea"
                rows="2"
                placeholder="Ej: Esta herramienta reduce el tiempo de checkout en un 40% para usuarios adultos mayores"
                [ngModel]="data().mensajeClave"
                (ngModelChange)="patch({ mensajeClave: $event })"
              ></textarea>
            </div>
            <div class="pm-field">
              <label class="pm-field__label">Problema que resuelve — el dolor del usuario o del negocio</label>
              <textarea
                class="pm-field__textarea"
                rows="2"
                placeholder="Ej: Los adultos mayores abandonan el checkout porque los botones son pequeños y el flujo es confuso"
                [ngModel]="data().problemaQueResuelve"
                (ngModelChange)="patch({ problemaQueResuelve: $event })"
              ></textarea>
            </div>
          </div>

          <!-- Beneficios -->
          <div class="pm-section">
            <h3 class="pm-section__title">Beneficios a destacar</h3>
            <p class="pm-section__hint">¿Qué valor concreto va a ver la audiencia?</p>
            <div class="pm-chips">
              @for (b of data().beneficiosDestacados; track $index) {
                <div class="pm-chip pm-chip--rose">
                  <span>{{ b }}</span>
                  <button class="pm-chip__remove" (click)="removeBeneficio($index)">
                    <i class="pi pi-times"></i>
                  </button>
                </div>
              }
              <input
                class="pm-chips__input"
                type="text"
                placeholder="+ Agregar beneficio..."
                #beneficioInput
                (keydown.enter)="addBeneficio(beneficioInput.value); beneficioInput.value = ''"
              />
            </div>
          </div>

          <!-- Herramientas -->
          <div class="pm-section">
            <h3 class="pm-section__title">Herramientas usadas</h3>
            <p class="pm-section__hint">Figma, Loom, Pitch, Canva, Framer...</p>
            <div class="pm-chips">
              @for (h of data().herramientasUsadas; track $index) {
                <div class="pm-chip">
                  <span>{{ h }}</span>
                  <button class="pm-chip__remove" (click)="removeHerramienta($index)">
                    <i class="pi pi-times"></i>
                  </button>
                </div>
              }
              <input
                class="pm-chips__input"
                type="text"
                placeholder="+ Agregar herramienta..."
                #herramientaInput
                (keydown.enter)="addHerramienta(herramientaInput.value); herramientaInput.value = ''"
              />
            </div>
          </div>

          <!-- Q&A anticipado -->
          <div class="pm-section">
            <div class="pm-section__header">
              <h3 class="pm-section__title">Preguntas anticipadas</h3>
              <button class="pm-btn pm-btn--ghost" (click)="addPregunta()">
                <i class="pi pi-plus"></i> Agregar
              </button>
            </div>
            <p class="pm-section__hint">Preparate para las preguntas difíciles antes de la presentación.</p>

            @for (qa of data().preguntasAnticipadas; track qa.id) {
              <div class="pm-qa">
                <div class="pm-qa__q">
                  <span class="pm-qa__label">Q</span>
                  <input
                    class="pm-qa__input"
                    type="text"
                    placeholder="Pregunta difícil que puede surgir..."
                    [ngModel]="qa.pregunta"
                    (ngModelChange)="updatePregunta(qa.id, 'pregunta', $event)"
                  />
                  <button class="pm-qa__remove" (click)="removePregunta(qa.id)">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
                <div class="pm-qa__a">
                  <span class="pm-qa__label pm-qa__label--a">A</span>
                  <textarea
                    class="pm-qa__answer"
                    rows="2"
                    placeholder="Tu respuesta preparada..."
                    [ngModel]="qa.respuesta"
                    (ngModelChange)="updatePregunta(qa.id, 'respuesta', $event)"
                  ></textarea>
                </div>
              </div>
            }
          </div>

          <!-- Resultados post-presentación -->
          <div class="pm-section">
            <h3 class="pm-section__title">Resultados de la presentación</h3>
            <p class="pm-section__hint">Completá después de la presentación.</p>
            <textarea
              class="pm-field__textarea"
              rows="3"
              placeholder="¿Qué pasó? ¿Se aprobó el presupuesto? ¿Qué reacciones hubo? ¿Qué preguntas surgieron que no anticipaste?"
              [ngModel]="data().resultadosPresentacion"
              (ngModelChange)="patch({ resultadosPresentacion: $event })"
            ></textarea>
            <div class="pm-chips pm-chips--feedback">
              <span class="pm-chips__label">Feedback recibido:</span>
              @for (f of data().feedbackRecibido; track $index) {
                <div class="pm-chip pm-chip--amber">
                  <span>{{ f }}</span>
                  <button class="pm-chip__remove" (click)="removeFeedback($index)">
                    <i class="pi pi-times"></i>
                  </button>
                </div>
              }
              <input
                class="pm-chips__input"
                type="text"
                placeholder="+ Agregar feedback..."
                #feedbackInput
                (keydown.enter)="addFeedback(feedbackInput.value); feedbackInput.value = ''"
              />
            </div>
          </div>

          <!-- Actions -->
          <div class="pm-tool__actions">
            <div class="pm-tool__save-status">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              }
            </div>
            <button
              class="pm-btn pm-btn--primary"
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
        <div class="pm-tool__report">
          <app-prototipo-mostrar-report [versions]="reports()" />
        </div>
      }
    </div>
  `,
  styles: [`
    .pm-tool {
      display: flex;
      flex-direction: column;
      gap: 0;
      height: 100%;
    }
    .pm-tool__header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .pm-tool__badge {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: .75rem;
      background: #e11d48;
      color: #fff;
      font-weight: 800;
      font-size: .85rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .pm-tool__title { margin: 0; font-size: 1.1rem; font-weight: 700; color: #111827; }
    .pm-tool__subtitle { margin: .125rem 0 0; font-size: .8rem; color: #6b7280; }
    .pm-tool__tabs {
      display: flex;
      gap: .25rem;
      padding: .75rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
    }
    .pm-tool__tab {
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
    .pm-tool__tab--active { background: #fff; color: #e11d48; font-weight: 600; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
    .pm-tool__tab-badge {
      background: #e11d48;
      color: #fff;
      font-size: .65rem;
      font-weight: 700;
      padding: .1rem .4rem;
      border-radius: 9999px;
    }
    .pm-tool__form {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .pm-tool__report {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem 1.5rem;
    }
    .pm-tool__actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: .75rem;
      border-top: 1px solid #e5e7eb;
    }
    .pm-tool__save-status { font-size: .8rem; color: #9ca3af; display: flex; align-items: center; gap: .4rem; }
    .pm-section {
      background: #f9fafb;
      border-radius: .875rem;
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: .75rem;
    }
    .pm-section__header { display: flex; align-items: center; justify-content: space-between; }
    .pm-section__title { margin: 0; font-size: .9rem; font-weight: 700; color: #111827; }
    .pm-section__hint { margin: -.25rem 0 0; font-size: .8rem; color: #9ca3af; }
    .pm-field { display: flex; flex-direction: column; gap: .375rem; }
    .pm-field__label { font-size: .8rem; font-weight: 600; color: #374151; }
    .pm-field__input {
      width: 100%;
      border: 1px solid #e5e7eb;
      border-radius: .5rem;
      padding: .5rem .75rem;
      font-size: .875rem;
      font-family: inherit;
      outline: none;
      background: #fff;
      box-sizing: border-box;
      transition: border-color .15s;
    }
    .pm-field__input:focus { border-color: #e11d48; }
    .pm-field__textarea {
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
    .pm-field__textarea:focus { border-color: #e11d48; }
    .pm-nivel-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: .625rem;
    }
    .pm-nivel-card {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: .15rem;
      padding: .75rem 1rem;
      border-radius: .625rem;
      border: 2px solid #e5e7eb;
      background: #fff;
      cursor: pointer;
      text-align: left;
      transition: all .15s;
    }
    .pm-nivel-card--active { border-color: #e11d48; background: #fff1f2; }
    .pm-nivel-card__label { font-size: .875rem; font-weight: 700; color: #111827; }
    .pm-nivel-card__desc { font-size: .75rem; color: #6b7280; }
    .pm-nivel-card__audience { font-size: .7rem; color: #9ca3af; font-style: italic; }
    .pm-chips { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; }
    .pm-chips--feedback { flex-direction: column; align-items: flex-start; }
    .pm-chips__label { font-size: .8rem; font-weight: 600; color: #374151; }
    .pm-chip {
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
    .pm-chip--rose { background: #fff1f2; border-color: #fecdd3; color: #be123c; }
    .pm-chip--amber { background: #fffbeb; border-color: #fde68a; color: #b45309; }
    .pm-chip__remove {
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
    .pm-chip__remove:hover { opacity: 1; }
    .pm-chips__input {
      border: none;
      outline: none;
      font-size: .8rem;
      color: #374151;
      background: transparent;
      min-width: 8rem;
    }
    .pm-qa {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: .625rem;
      overflow: hidden;
    }
    .pm-qa__q {
      display: flex;
      align-items: center;
      gap: .625rem;
      padding: .625rem .75rem;
      background: #fff1f2;
      border-bottom: 1px solid #fecdd3;
    }
    .pm-qa__a {
      display: flex;
      align-items: flex-start;
      gap: .625rem;
      padding: .625rem .75rem;
    }
    .pm-qa__label {
      width: 1.25rem;
      height: 1.25rem;
      border-radius: .25rem;
      background: #e11d48;
      color: #fff;
      font-size: .65rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .pm-qa__label--a { background: #6b7280; }
    .pm-qa__input {
      flex: 1;
      border: none;
      outline: none;
      font-size: .875rem;
      font-family: inherit;
      background: transparent;
      color: #111827;
    }
    .pm-qa__answer {
      flex: 1;
      border: none;
      outline: none;
      font-size: .875rem;
      font-family: inherit;
      background: transparent;
      color: #374151;
      resize: none;
    }
    .pm-qa__remove {
      border: none;
      background: transparent;
      cursor: pointer;
      color: #9ca3af;
      padding: .25rem;
      font-size: .75rem;
      transition: color .15s;
      flex-shrink: 0;
    }
    .pm-qa__remove:hover { color: #ef4444; }
    .pm-btn {
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
    .pm-btn--primary { background: #e11d48; color: #fff; }
    .pm-btn--primary:hover:not(:disabled) { background: #be123c; }
    .pm-btn--primary:disabled { opacity: .5; cursor: not-allowed; }
    .pm-btn--ghost { background: transparent; color: #e11d48; border: 1px solid #e11d48; padding: .35rem .75rem; font-size: .8rem; }
    .pm-btn--ghost:hover { background: #fff1f2; }
  `],
})
export class PrototipoMostrarToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly prototipoMostrarService = inject(PrototipoMostrarService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<PrototipoMostrarData>({ ...EMPTY_PROTOTIPO_MOSTRAR });
  reports = signal<PrototipoMostrarReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  activeView = signal<'form' | 'report'>('form');

  readonly nivelesDemo = NIVELES_DEMO;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  canGenerate = computed(() => {
    const d = this.data();
    return !!d.audiencia.trim() && !!d.mensajeClave.trim() && !!d.nivelDemo;
  });

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;
    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as PrototipoMostrarData | undefined;
    this.data.set(stored ? { ...EMPTY_PROTOTIPO_MOSTRAR, ...stored } : { ...EMPTY_PROTOTIPO_MOSTRAR });
    this.reports.set((raw['reports'] as PrototipoMostrarReportVersionDto[]) ?? []);
  }

  patch(partial: Partial<PrototipoMostrarData>): void {
    this.data.set({ ...this.data(), ...partial });
    this.scheduleSave();
  }

  // Beneficios
  addBeneficio(value: string): void {
    const v = value.trim();
    if (!v) return;
    this.patch({ beneficiosDestacados: [...this.data().beneficiosDestacados, v] });
  }
  removeBeneficio(index: number): void {
    const arr = [...this.data().beneficiosDestacados];
    arr.splice(index, 1);
    this.patch({ beneficiosDestacados: arr });
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

  // Q&A
  addPregunta(): void {
    const qa: PreguntaAnticipada = { id: crypto.randomUUID(), pregunta: '', respuesta: '' };
    this.patch({ preguntasAnticipadas: [...this.data().preguntasAnticipadas, qa] });
  }
  updatePregunta(id: string, field: keyof PreguntaAnticipada, value: string): void {
    const arr = this.data().preguntasAnticipadas.map(q => q.id === id ? { ...q, [field]: value } : q);
    this.patch({ preguntasAnticipadas: arr });
  }
  removePregunta(id: string): void {
    this.patch({ preguntasAnticipadas: this.data().preguntasAnticipadas.filter(q => q.id !== id) });
  }

  // Feedback
  addFeedback(value: string): void {
    const v = value.trim();
    if (!v) return;
    this.patch({ feedbackRecibido: [...this.data().feedbackRecibido, v] });
  }
  removeFeedback(index: number): void {
    const arr = [...this.data().feedbackRecibido];
    arr.splice(index, 1);
    this.patch({ feedbackRecibido: arr });
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
      const res = await this.prototipoMostrarService.analyze({
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
