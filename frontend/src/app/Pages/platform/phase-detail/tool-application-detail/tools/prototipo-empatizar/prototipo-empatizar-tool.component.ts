import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { PrototipoEmpatizarService } from '@core/services/prototipoEmpatizarService/prototipo-empatizar.service';
import { PrototipoEmpatizarReportComponent } from './prototipo-empatizar-report.component';
import {
  EMPTY_PROTOTIPO_EMPATIZAR,
  PasoSesionDto,
  PrototipoEmpatizarData,
  PrototipoEmpatizarReportVersionDto,
  TIPOS_PROTOTIPO,
  TipoPrototipo,
} from './prototipo-empatizar.types';

@Component({
  selector: 'app-prototipo-empatizar-tool',
  standalone: true,
  imports: [FormsModule, PrototipoEmpatizarReportComponent],
  template: `
    <div class="pe-tool">
      <!-- Header -->
      <div class="pe-tool__header">
        <div class="pe-tool__badge">PE</div>
        <div>
          <h2 class="pe-tool__title">Prototipo para Empatizar</h2>
          <p class="pe-tool__subtitle">Viví la experiencia del usuario para entender sus emociones y fricciones</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="pe-tool__tabs">
        <button class="pe-tool__tab" [class.pe-tool__tab--active]="activeView() === 'form'" (click)="activeView.set('form')">
          <i class="pi pi-pencil"></i> Sesión
        </button>
        <button class="pe-tool__tab" [class.pe-tool__tab--active]="activeView() === 'report'" (click)="activeView.set('report')">
          <i class="pi pi-heart"></i> Análisis
          @if (reports().length > 0) {
            <span class="pe-tool__tab-badge">{{ reports().length }}</span>
          }
        </button>
      </div>

      @if (activeView() === 'form') {
        <div class="pe-tool__form">

          <!-- Tipo de prototipo -->
          <div class="pe-section">
            <h3 class="pe-section__title">Tipo de prototipo</h3>
            <div class="pe-tipo-grid">
              @for (tipo of tiposPrototipo; track tipo.value) {
                <button
                  class="pe-tipo-card"
                  [class.pe-tipo-card--active]="data().tipoPrototipo === tipo.value"
                  (click)="selectTipo(tipo.value)"
                >
                  <span class="pe-tipo-card__label">{{ tipo.label }}</span>
                  <span class="pe-tipo-card__desc">{{ tipo.descripcion }}</span>
                </button>
              }
            </div>
          </div>

          <!-- Objetivo y contexto -->
          <div class="pe-section">
            <h3 class="pe-section__title">Objetivo y contexto</h3>
            <div class="pe-field">
              <label class="pe-field__label">¿Qué queremos sentir / entender?</label>
              <textarea
                class="pe-field__textarea"
                rows="3"
                placeholder="Ej: Entender la frustración de completar un formulario con limitaciones visuales"
                [ngModel]="data().objetivo"
                (ngModelChange)="patch({ objetivo: $event })"
              ></textarea>
            </div>
            <div class="pe-field">
              <label class="pe-field__label">Contexto / situación a recrear</label>
              <textarea
                class="pe-field__textarea"
                rows="2"
                placeholder="Ej: Checkout de e-commerce con limitaciones visuales y de tiempo"
                [ngModel]="data().contexto"
                (ngModelChange)="patch({ contexto: $event })"
              ></textarea>
            </div>
          </div>

          <!-- Participantes -->
          <div class="pe-section">
            <h3 class="pe-section__title">Participantes del equipo</h3>
            <div class="pe-chips">
              @for (p of data().participantes; track $index) {
                <div class="pe-chip">
                  <span>{{ p }}</span>
                  <button class="pe-chip__remove" (click)="removeParticipante($index)">
                    <i class="pi pi-times"></i>
                  </button>
                </div>
              }
              <input
                class="pe-chips__input"
                type="text"
                placeholder="+ Agregar participante..."
                #participanteInput
                (keydown.enter)="addParticipante(participanteInput.value); participanteInput.value = ''"
              />
            </div>
          </div>

          <!-- Pasos de la sesión -->
          <div class="pe-section">
            <div class="pe-section__header">
              <h3 class="pe-section__title">Pasos de la sesión</h3>
              <button class="pe-btn pe-btn--ghost" (click)="addPaso()">
                <i class="pi pi-plus"></i> Agregar paso
              </button>
            </div>

            @if (data().pasos.length === 0) {
              <p class="pe-empty-hint">Documentá los pasos que siguió el equipo durante el prototipo.</p>
            }

            @for (paso of data().pasos; track paso.id; let i = $index) {
              <div class="pe-paso">
                <div class="pe-paso__number">{{ i + 1 }}</div>
                <div class="pe-paso__content">
                  <input
                    class="pe-paso__input"
                    type="text"
                    placeholder="Descripción del paso..."
                    [ngModel]="paso.descripcion"
                    (ngModelChange)="updatePaso(paso.id, 'descripcion', $event)"
                  />
                  <input
                    class="pe-paso__observation"
                    type="text"
                    placeholder="Observación / lo que sentimos..."
                    [ngModel]="paso.observacion"
                    (ngModelChange)="updatePaso(paso.id, 'observacion', $event)"
                  />
                </div>
                <button class="pe-paso__remove" (click)="removePaso(paso.id)">
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            }
          </div>

          <!-- Insights emocionales -->
          <div class="pe-section">
            <h3 class="pe-section__title">Insights emocionales</h3>
            <p class="pe-section__hint">¿Qué emociones o reacciones inesperadas observaste?</p>
            <div class="pe-chips">
              @for (insight of data().insightsEmocionales; track $index) {
                <div class="pe-chip pe-chip--teal">
                  <span>{{ insight }}</span>
                  <button class="pe-chip__remove" (click)="removeInsight($index)">
                    <i class="pi pi-times"></i>
                  </button>
                </div>
              }
              <input
                class="pe-chips__input"
                type="text"
                placeholder="+ Agregar insight..."
                #insightInput
                (keydown.enter)="addInsight(insightInput.value); insightInput.value = ''"
              />
            </div>
          </div>

          <!-- Fricciones -->
          <div class="pe-section">
            <h3 class="pe-section__title">Fricciones identificadas</h3>
            <p class="pe-section__hint">Momentos de dificultad, frustración o confusión.</p>
            <div class="pe-chips">
              @for (f of data().friccionesIdentificadas; track $index) {
                <div class="pe-chip pe-chip--red">
                  <span>{{ f }}</span>
                  <button class="pe-chip__remove" (click)="removeFriccion($index)">
                    <i class="pi pi-times"></i>
                  </button>
                </div>
              }
              <input
                class="pe-chips__input"
                type="text"
                placeholder="+ Agregar fricción..."
                #friccionInput
                (keydown.enter)="addFriccion(friccionInput.value); friccionInput.value = ''"
              />
            </div>
          </div>

          <!-- Supuestos -->
          <div class="pe-section">
            <h3 class="pe-section__title">Supuestos a validar</h3>
            <p class="pe-section__hint">¿Qué creíamos sobre el usuario que queremos confirmar o refutar?</p>
            <div class="pe-chips">
              @for (s of data().supuestosValidados; track $index) {
                <div class="pe-chip pe-chip--amber">
                  <span>{{ s }}</span>
                  <button class="pe-chip__remove" (click)="removeSupuesto($index)">
                    <i class="pi pi-times"></i>
                  </button>
                </div>
              }
              <input
                class="pe-chips__input"
                type="text"
                placeholder="+ Agregar supuesto..."
                #supuestoInput
                (keydown.enter)="addSupuesto(supuestoInput.value); supuestoInput.value = ''"
              />
            </div>
          </div>

          <!-- Notas adicionales -->
          <div class="pe-section">
            <h3 class="pe-section__title">Notas adicionales</h3>
            <textarea
              class="pe-field__textarea"
              rows="3"
              placeholder="Observaciones, contexto o detalles que no encajan en los campos anteriores..."
              [ngModel]="data().notas"
              (ngModelChange)="patch({ notas: $event })"
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="pe-tool__actions">
            <div class="pe-tool__save-status">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              }
            </div>
            <button
              class="pe-btn pe-btn--primary"
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
        <div class="pe-tool__report">
          <app-prototipo-empatizar-report [versions]="reports()" />
        </div>
      }
    </div>
  `,
  styles: [`
    .pe-tool {
      display: flex;
      flex-direction: column;
      gap: 0;
      height: 100%;
    }
    .pe-tool__header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .pe-tool__badge {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: .75rem;
      background: #0d9488;
      color: #fff;
      font-weight: 800;
      font-size: .85rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .pe-tool__title { margin: 0; font-size: 1.1rem; font-weight: 700; color: #111827; }
    .pe-tool__subtitle { margin: .125rem 0 0; font-size: .8rem; color: #6b7280; }
    .pe-tool__tabs {
      display: flex;
      gap: .25rem;
      padding: .75rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
    }
    .pe-tool__tab {
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
    .pe-tool__tab--active { background: #fff; color: #0d9488; font-weight: 600; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
    .pe-tool__tab-badge {
      background: #0d9488;
      color: #fff;
      font-size: .65rem;
      font-weight: 700;
      padding: .1rem .4rem;
      border-radius: 9999px;
    }
    .pe-tool__form {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .pe-tool__report {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem 1.5rem;
    }
    .pe-tool__actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: .75rem;
      border-top: 1px solid #e5e7eb;
    }
    .pe-tool__save-status { font-size: .8rem; color: #9ca3af; display: flex; align-items: center; gap: .4rem; }
    .pe-section {
      background: #f9fafb;
      border-radius: .875rem;
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: .75rem;
    }
    .pe-section__header { display: flex; align-items: center; justify-content: space-between; }
    .pe-section__title { margin: 0; font-size: .9rem; font-weight: 700; color: #111827; }
    .pe-section__hint { margin: -.25rem 0 0; font-size: .8rem; color: #9ca3af; }
    .pe-field { display: flex; flex-direction: column; gap: .375rem; }
    .pe-field__label { font-size: .8rem; font-weight: 600; color: #374151; }
    .pe-field__textarea {
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
    .pe-field__textarea:focus { border-color: #0d9488; }
    .pe-tipo-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: .625rem;
    }
    .pe-tipo-card {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: .2rem;
      padding: .75rem 1rem;
      border-radius: .625rem;
      border: 2px solid #e5e7eb;
      background: #fff;
      cursor: pointer;
      text-align: left;
      transition: all .15s;
    }
    .pe-tipo-card--active { border-color: #0d9488; background: #f0fdfa; }
    .pe-tipo-card__label { font-size: .875rem; font-weight: 700; color: #111827; }
    .pe-tipo-card__desc { font-size: .75rem; color: #6b7280; }
    .pe-chips {
      display: flex;
      flex-wrap: wrap;
      gap: .5rem;
      align-items: center;
    }
    .pe-chip {
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
    .pe-chip--teal { background: #f0fdfa; border-color: #99f6e4; color: #0f766e; }
    .pe-chip--red { background: #fef2f2; border-color: #fecaca; color: #dc2626; }
    .pe-chip--amber { background: #fffbeb; border-color: #fde68a; color: #b45309; }
    .pe-chip__remove {
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
    .pe-chip__remove:hover { opacity: 1; }
    .pe-chips__input {
      border: none;
      outline: none;
      font-size: .8rem;
      color: #374151;
      background: transparent;
      min-width: 8rem;
    }
    .pe-paso {
      display: flex;
      align-items: flex-start;
      gap: .75rem;
      padding: .75rem;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: .625rem;
    }
    .pe-paso__number {
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 50%;
      background: #0d9488;
      color: #fff;
      font-size: .75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .pe-paso__content { flex: 1; display: flex; flex-direction: column; gap: .5rem; }
    .pe-paso__input, .pe-paso__observation {
      width: 100%;
      border: 1px solid #e5e7eb;
      border-radius: .4rem;
      padding: .5rem .625rem;
      font-size: .875rem;
      font-family: inherit;
      outline: none;
      background: #f9fafb;
      box-sizing: border-box;
      transition: border-color .15s;
    }
    .pe-paso__input:focus, .pe-paso__observation:focus { border-color: #0d9488; background: #fff; }
    .pe-paso__observation { font-size: .8rem; color: #6b7280; }
    .pe-paso__remove {
      border: none;
      background: transparent;
      cursor: pointer;
      color: #9ca3af;
      padding: .25rem;
      font-size: .75rem;
      transition: color .15s;
      flex-shrink: 0;
    }
    .pe-paso__remove:hover { color: #ef4444; }
    .pe-empty-hint { margin: 0; font-size: .8rem; color: #9ca3af; font-style: italic; }
    .pe-btn {
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
    .pe-btn--primary { background: #0d9488; color: #fff; }
    .pe-btn--primary:hover:not(:disabled) { background: #0f766e; }
    .pe-btn--primary:disabled { opacity: .5; cursor: not-allowed; }
    .pe-btn--ghost { background: transparent; color: #0d9488; border: 1px solid #0d9488; padding: .35rem .75rem; font-size: .8rem; }
    .pe-btn--ghost:hover { background: #f0fdfa; }
  `],
})
export class PrototipoEmpatizarToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly prototipoEmpatizarService = inject(PrototipoEmpatizarService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<PrototipoEmpatizarData>({ ...EMPTY_PROTOTIPO_EMPATIZAR });
  reports = signal<PrototipoEmpatizarReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  activeView = signal<'form' | 'report'>('form');

  readonly tiposPrototipo = TIPOS_PROTOTIPO;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  canGenerate = computed(() => {
    const d = this.data();
    return !!d.tipoPrototipo && !!d.objetivo.trim() && d.pasos.length >= 1;
  });

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;
    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as PrototipoEmpatizarData | undefined;
    this.data.set(stored ? { ...EMPTY_PROTOTIPO_EMPATIZAR, ...stored } : { ...EMPTY_PROTOTIPO_EMPATIZAR });
    this.reports.set((raw['reports'] as PrototipoEmpatizarReportVersionDto[]) ?? []);
  }

  patch(partial: Partial<PrototipoEmpatizarData>): void {
    this.data.set({ ...this.data(), ...partial });
    this.scheduleSave();
  }

  selectTipo(tipo: TipoPrototipo): void {
    this.patch({ tipoPrototipo: tipo });
  }

  // Participantes
  addParticipante(value: string): void {
    const v = value.trim();
    if (!v) return;
    this.patch({ participantes: [...this.data().participantes, v] });
  }
  removeParticipante(index: number): void {
    const arr = [...this.data().participantes];
    arr.splice(index, 1);
    this.patch({ participantes: arr });
  }

  // Pasos
  addPaso(): void {
    const paso: PasoSesionDto = { id: crypto.randomUUID(), descripcion: '', observacion: '' };
    this.patch({ pasos: [...this.data().pasos, paso] });
  }
  updatePaso(id: string, field: keyof PasoSesionDto, value: string): void {
    const pasos = this.data().pasos.map(p => p.id === id ? { ...p, [field]: value } : p);
    this.patch({ pasos });
  }
  removePaso(id: string): void {
    this.patch({ pasos: this.data().pasos.filter(p => p.id !== id) });
  }

  // Insights
  addInsight(value: string): void {
    const v = value.trim();
    if (!v) return;
    this.patch({ insightsEmocionales: [...this.data().insightsEmocionales, v] });
  }
  removeInsight(index: number): void {
    const arr = [...this.data().insightsEmocionales];
    arr.splice(index, 1);
    this.patch({ insightsEmocionales: arr });
  }

  // Fricciones
  addFriccion(value: string): void {
    const v = value.trim();
    if (!v) return;
    this.patch({ friccionesIdentificadas: [...this.data().friccionesIdentificadas, v] });
  }
  removeFriccion(index: number): void {
    const arr = [...this.data().friccionesIdentificadas];
    arr.splice(index, 1);
    this.patch({ friccionesIdentificadas: arr });
  }

  // Supuestos
  addSupuesto(value: string): void {
    const v = value.trim();
    if (!v) return;
    this.patch({ supuestosValidados: [...this.data().supuestosValidados, v] });
  }
  removeSupuesto(index: number): void {
    const arr = [...this.data().supuestosValidados];
    arr.splice(index, 1);
    this.patch({ supuestosValidados: arr });
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
      const res = await this.prototipoEmpatizarService.analyze({
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
