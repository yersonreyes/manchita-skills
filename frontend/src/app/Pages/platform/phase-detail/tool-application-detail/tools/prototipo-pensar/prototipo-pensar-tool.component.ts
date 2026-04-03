import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { PrototipoPensarService } from '@core/services/prototipoPensarService/prototipo-pensar.service';
import { PrototipoPensarReportComponent } from './prototipo-pensar-report.component';
import {
  EMPTY_PROTOTIPO_PENSAR,
  IteracionDto,
  PrototipoPensarData,
  PrototipoPensarReportVersionDto,
  TIPOS_ITERACION,
  TipoIteracion,
} from './prototipo-pensar.types';

@Component({
  selector: 'app-prototipo-pensar-tool',
  standalone: true,
  imports: [FormsModule, PrototipoPensarReportComponent],
  template: `
    <div class="pp-tool">
      <!-- Header -->
      <div class="pp-tool__header">
        <div class="pp-tool__badge">PP</div>
        <div>
          <h2 class="pp-tool__title">Prototipo para Pensar</h2>
          <p class="pp-tool__subtitle">Explorá ideas iterando rápido — pensar con las manos</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="pp-tool__tabs">
        <button class="pp-tool__tab" [class.pp-tool__tab--active]="activeView() === 'form'" (click)="activeView.set('form')">
          <i class="pi pi-pencil"></i> Iteraciones
        </button>
        <button class="pp-tool__tab" [class.pp-tool__tab--active]="activeView() === 'report'" (click)="activeView.set('report')">
          <i class="pi pi-lightbulb"></i> Análisis
          @if (reports().length > 0) {
            <span class="pp-tool__tab-badge">{{ reports().length }}</span>
          }
        </button>
      </div>

      @if (activeView() === 'form') {
        <div class="pp-tool__form">

          <!-- Pregunta e hipótesis -->
          <div class="pp-section">
            <h3 class="pp-section__title">Qué queremos explorar</h3>
            <div class="pp-field">
              <label class="pp-field__label">Pregunta o hipótesis a responder</label>
              <textarea
                class="pp-field__textarea"
                rows="2"
                placeholder="Ej: ¿Cuál es la mejor estructura de navegación para que los usuarios encuentren sus transacciones rápido?"
                [ngModel]="data().preguntaExplorar"
                (ngModelChange)="patch({ preguntaExplorar: $event })"
              ></textarea>
            </div>
            <div class="pp-field">
              <label class="pp-field__label">Contexto del problema</label>
              <textarea
                class="pp-field__textarea"
                rows="2"
                placeholder="Ej: App de banking para millennials — los usuarios reportan dificultad para encontrar el historial de transacciones"
                [ngModel]="data().contexto"
                (ngModelChange)="patch({ contexto: $event })"
              ></textarea>
            </div>
          </div>

          <!-- Iteraciones -->
          <div class="pp-section">
            <div class="pp-section__header">
              <h3 class="pp-section__title">Iteraciones</h3>
              <button class="pp-btn pp-btn--ghost" (click)="addIteracion()">
                <i class="pi pi-plus"></i> Nueva iteración
              </button>
            </div>

            @if (data().iteraciones.length === 0) {
              <div class="pp-empty">
                <p>Cada iteración es una ronda de prototipado. Empezá con un sketch rápido y evolucioná desde ahí.</p>
                <div class="pp-evolution">
                  <span class="pp-evolution__step">Sketch</span>
                  <i class="pi pi-arrow-right"></i>
                  <span class="pp-evolution__step">Wireframe</span>
                  <i class="pi pi-arrow-right"></i>
                  <span class="pp-evolution__step">Alta fidelidad</span>
                  <i class="pi pi-arrow-right"></i>
                  <span class="pp-evolution__step">Código</span>
                </div>
              </div>
            }

            @for (iter of data().iteraciones; track iter.id; let i = $index) {
              <div class="pp-iteracion" [class.pp-iteracion--descartada]="iter.descartada">
                <!-- Número + tipo + acciones -->
                <div class="pp-iteracion__header">
                  <div class="pp-iteracion__num">{{ i + 1 }}</div>
                  <div class="pp-tipos">
                    @for (tipo of tiposIteracion; track tipo.value) {
                      <button
                        class="pp-tipo-btn"
                        [class.pp-tipo-btn--active]="iter.tipo === tipo.value"
                        (click)="updateIteracion(iter.id, 'tipo', tipo.value)"
                      >{{ tipo.label }}</button>
                    }
                  </div>
                  <div class="pp-iteracion__actions">
                    <button
                      class="pp-action-btn"
                      [class.pp-action-btn--active]="iter.descartada"
                      (click)="toggleDescartada(iter.id)"
                      title="Marcar como descartada"
                    >
                      <i class="pi pi-ban"></i>
                    </button>
                    <button class="pp-action-btn pp-action-btn--danger" (click)="removeIteracion(iter.id)">
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                </div>

                <!-- Herramienta y duración -->
                <div class="pp-iteracion__meta">
                  <input
                    class="pp-iteracion__input"
                    type="text"
                    placeholder="Herramienta (Figma, papel, Balsamiq...)"
                    [ngModel]="iter.herramienta"
                    (ngModelChange)="updateIteracion(iter.id, 'herramienta', $event)"
                  />
                  <input
                    class="pp-iteracion__input pp-iteracion__input--short"
                    type="text"
                    placeholder="Duración (ej: 30 min)"
                    [ngModel]="iter.duracion"
                    (ngModelChange)="updateIteracion(iter.id, 'duracion', $event)"
                  />
                </div>

                <!-- Descripción -->
                <textarea
                  class="pp-iteracion__desc"
                  rows="2"
                  placeholder="Qué exploraste en esta iteración..."
                  [ngModel]="iter.descripcion"
                  (ngModelChange)="updateIteracion(iter.id, 'descripcion', $event)"
                ></textarea>

                <!-- Aprendizajes -->
                <div class="pp-chips pp-chips--compact">
                  @for (ap of iter.aprendizajes; track $index) {
                    <div class="pp-chip pp-chip--violet">
                      <span>{{ ap }}</span>
                      <button class="pp-chip__remove" (click)="removeAprendizaje(iter.id, $index)">
                        <i class="pi pi-times"></i>
                      </button>
                    </div>
                  }
                  <input
                    class="pp-chips__input"
                    type="text"
                    placeholder="+ Agregar aprendizaje..."
                    #apInput
                    (keydown.enter)="addAprendizaje(iter.id, apInput.value); apInput.value = ''"
                  />
                </div>
              </div>
            }
          </div>

          <!-- Decisión final -->
          <div class="pp-section">
            <h3 class="pp-section__title">Decisión final</h3>
            <p class="pp-section__hint">¿Qué dirección eligió el equipo para avanzar?</p>
            <textarea
              class="pp-field__textarea"
              rows="3"
              placeholder="Ej: Elegimos la navegación con bottom nav + búsqueda global. Descartamos el sidebar porque era demasiado complejo para el contexto mobile."
              [ngModel]="data().decisionFinal"
              (ngModelChange)="patch({ decisionFinal: $event })"
            ></textarea>
          </div>

          <!-- Próximos pasos -->
          <div class="pp-section">
            <h3 class="pp-section__title">Próximos pasos</h3>
            <div class="pp-chips">
              @for (paso of data().proximosPasos; track $index) {
                <div class="pp-chip">
                  <span>{{ paso }}</span>
                  <button class="pp-chip__remove" (click)="removePaso($index)">
                    <i class="pi pi-times"></i>
                  </button>
                </div>
              }
              <input
                class="pp-chips__input"
                type="text"
                placeholder="+ Agregar paso..."
                #pasoInput
                (keydown.enter)="addPaso(pasoInput.value); pasoInput.value = ''"
              />
            </div>
          </div>

          <!-- Actions -->
          <div class="pp-tool__actions">
            <div class="pp-tool__save-status">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              }
            </div>
            <button
              class="pp-btn pp-btn--primary"
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
        <div class="pp-tool__report">
          <app-prototipo-pensar-report [versions]="reports()" />
        </div>
      }
    </div>
  `,
  styles: [`
    .pp-tool {
      display: flex;
      flex-direction: column;
      gap: 0;
      height: 100%;
    }
    .pp-tool__header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .pp-tool__badge {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: .75rem;
      background: #7c3aed;
      color: #fff;
      font-weight: 800;
      font-size: .85rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .pp-tool__title { margin: 0; font-size: 1.1rem; font-weight: 700; color: #111827; }
    .pp-tool__subtitle { margin: .125rem 0 0; font-size: .8rem; color: #6b7280; }
    .pp-tool__tabs {
      display: flex;
      gap: .25rem;
      padding: .75rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
    }
    .pp-tool__tab {
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
    .pp-tool__tab--active { background: #fff; color: #7c3aed; font-weight: 600; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
    .pp-tool__tab-badge {
      background: #7c3aed;
      color: #fff;
      font-size: .65rem;
      font-weight: 700;
      padding: .1rem .4rem;
      border-radius: 9999px;
    }
    .pp-tool__form {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .pp-tool__report {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem 1.5rem;
    }
    .pp-tool__actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: .75rem;
      border-top: 1px solid #e5e7eb;
    }
    .pp-tool__save-status { font-size: .8rem; color: #9ca3af; display: flex; align-items: center; gap: .4rem; }
    .pp-section {
      background: #f9fafb;
      border-radius: .875rem;
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: .75rem;
    }
    .pp-section__header { display: flex; align-items: center; justify-content: space-between; }
    .pp-section__title { margin: 0; font-size: .9rem; font-weight: 700; color: #111827; }
    .pp-section__hint { margin: -.25rem 0 0; font-size: .8rem; color: #9ca3af; }
    .pp-field { display: flex; flex-direction: column; gap: .375rem; }
    .pp-field__label { font-size: .8rem; font-weight: 600; color: #374151; }
    .pp-field__textarea {
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
    .pp-field__textarea:focus { border-color: #7c3aed; }
    .pp-empty {
      padding: .75rem;
      background: #fff;
      border-radius: .625rem;
      border: 1px dashed #e5e7eb;
      display: flex;
      flex-direction: column;
      gap: .75rem;
    }
    .pp-empty p { margin: 0; font-size: .8rem; color: #9ca3af; }
    .pp-evolution {
      display: flex;
      align-items: center;
      gap: .5rem;
      flex-wrap: wrap;
    }
    .pp-evolution__step {
      padding: .25rem .625rem;
      background: #f3f4f6;
      border-radius: .375rem;
      font-size: .75rem;
      font-weight: 600;
      color: #374151;
    }
    .pp-evolution .pi-arrow-right { color: #9ca3af; font-size: .75rem; }
    .pp-iteracion {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: .75rem;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: .625rem;
      transition: opacity .15s;
    }
    .pp-iteracion--descartada { opacity: .5; }
    .pp-iteracion__header { display: flex; align-items: center; gap: .625rem; }
    .pp-iteracion__num {
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 50%;
      background: #7c3aed;
      color: #fff;
      font-size: .75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .pp-tipos { display: flex; gap: .375rem; flex-wrap: wrap; flex: 1; }
    .pp-tipo-btn {
      padding: .25rem .625rem;
      border-radius: .375rem;
      border: 1px solid #e5e7eb;
      background: #f9fafb;
      font-size: .75rem;
      font-weight: 500;
      color: #6b7280;
      cursor: pointer;
      transition: all .15s;
    }
    .pp-tipo-btn--active { border-color: #7c3aed; background: #f5f3ff; color: #7c3aed; font-weight: 700; }
    .pp-iteracion__actions { display: flex; gap: .375rem; }
    .pp-action-btn {
      width: 1.75rem;
      height: 1.75rem;
      border-radius: .375rem;
      border: 1px solid #e5e7eb;
      background: transparent;
      cursor: pointer;
      color: #9ca3af;
      font-size: .75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all .15s;
    }
    .pp-action-btn--active { color: #ef4444; border-color: #fecaca; background: #fef2f2; }
    .pp-action-btn--danger:hover { color: #ef4444; border-color: #fecaca; background: #fef2f2; }
    .pp-iteracion__meta { display: flex; gap: .625rem; }
    .pp-iteracion__input {
      flex: 1;
      border: 1px solid #e5e7eb;
      border-radius: .4rem;
      padding: .4rem .625rem;
      font-size: .8rem;
      font-family: inherit;
      outline: none;
      background: #f9fafb;
      transition: border-color .15s;
    }
    .pp-iteracion__input:focus { border-color: #7c3aed; background: #fff; }
    .pp-iteracion__input--short { flex: 0 0 8rem; }
    .pp-iteracion__desc {
      width: 100%;
      border: 1px solid #e5e7eb;
      border-radius: .4rem;
      padding: .5rem .625rem;
      font-size: .8rem;
      font-family: inherit;
      resize: vertical;
      outline: none;
      background: #f9fafb;
      box-sizing: border-box;
      transition: border-color .15s;
    }
    .pp-iteracion__desc:focus { border-color: #7c3aed; background: #fff; }
    .pp-chips { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; }
    .pp-chips--compact { background: #f9fafb; border-radius: .4rem; padding: .4rem .625rem; }
    .pp-chip {
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
    .pp-chip--violet { background: #f5f3ff; border-color: #ddd6fe; color: #5b21b6; }
    .pp-chip__remove {
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
    .pp-chip__remove:hover { opacity: 1; }
    .pp-chips__input {
      border: none;
      outline: none;
      font-size: .8rem;
      color: #374151;
      background: transparent;
      min-width: 8rem;
    }
    .pp-btn {
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
    .pp-btn--primary { background: #7c3aed; color: #fff; }
    .pp-btn--primary:hover:not(:disabled) { background: #6d28d9; }
    .pp-btn--primary:disabled { opacity: .5; cursor: not-allowed; }
    .pp-btn--ghost { background: transparent; color: #7c3aed; border: 1px solid #7c3aed; padding: .35rem .75rem; font-size: .8rem; }
    .pp-btn--ghost:hover { background: #f5f3ff; }
  `],
})
export class PrototipoPensarToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly prototipoPensarService = inject(PrototipoPensarService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<PrototipoPensarData>({ ...EMPTY_PROTOTIPO_PENSAR });
  reports = signal<PrototipoPensarReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  activeView = signal<'form' | 'report'>('form');

  readonly tiposIteracion = TIPOS_ITERACION;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  canGenerate = computed(() => {
    const d = this.data();
    return !!d.preguntaExplorar.trim() && d.iteraciones.length >= 1;
  });

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;
    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as PrototipoPensarData | undefined;
    this.data.set(stored ? { ...EMPTY_PROTOTIPO_PENSAR, ...stored } : { ...EMPTY_PROTOTIPO_PENSAR });
    this.reports.set((raw['reports'] as PrototipoPensarReportVersionDto[]) ?? []);
  }

  patch(partial: Partial<PrototipoPensarData>): void {
    this.data.set({ ...this.data(), ...partial });
    this.scheduleSave();
  }

  // Iteraciones
  addIteracion(): void {
    const iter: IteracionDto = {
      id: crypto.randomUUID(),
      tipo: null,
      descripcion: '',
      herramienta: '',
      duracion: '',
      aprendizajes: [],
      descartada: false,
    };
    this.patch({ iteraciones: [...this.data().iteraciones, iter] });
  }

  updateIteracion(id: string, field: keyof IteracionDto, value: string | boolean): void {
    const iteraciones = this.data().iteraciones.map(it =>
      it.id === id ? { ...it, [field]: value } : it
    );
    this.patch({ iteraciones });
  }

  toggleDescartada(id: string): void {
    const iteraciones = this.data().iteraciones.map(it =>
      it.id === id ? { ...it, descartada: !it.descartada } : it
    );
    this.patch({ iteraciones });
  }

  removeIteracion(id: string): void {
    this.patch({ iteraciones: this.data().iteraciones.filter(it => it.id !== id) });
  }

  addAprendizaje(iterId: string, value: string): void {
    const v = value.trim();
    if (!v) return;
    const iteraciones = this.data().iteraciones.map(it =>
      it.id === iterId ? { ...it, aprendizajes: [...it.aprendizajes, v] } : it
    );
    this.patch({ iteraciones });
  }

  removeAprendizaje(iterId: string, index: number): void {
    const iteraciones = this.data().iteraciones.map(it => {
      if (it.id !== iterId) return it;
      const ap = [...it.aprendizajes];
      ap.splice(index, 1);
      return { ...it, aprendizajes: ap };
    });
    this.patch({ iteraciones });
  }

  // Próximos pasos
  addPaso(value: string): void {
    const v = value.trim();
    if (!v) return;
    this.patch({ proximosPasos: [...this.data().proximosPasos, v] });
  }

  removePaso(index: number): void {
    const arr = [...this.data().proximosPasos];
    arr.splice(index, 1);
    this.patch({ proximosPasos: arr });
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
      const res = await this.prototipoPensarService.analyze({
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
