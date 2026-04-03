import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { PrototipoFisicoService } from '@core/services/prototipoFisicoService/prototipo-fisico.service';
import { PrototipoFisicoReportComponent } from './prototipo-fisico-report.component';
import {
  EMPTY_ITERACION_FISICA,
  EMPTY_PROTOTIPO_FISICO,
  IteracionFisicaDto,
  MATERIALES_FISICOS,
  NIVELES_FIDELIDAD,
  PrototipoFisicoData,
  PrototipoFisicoReportVersionDto,
  ResultadoFisico,
  MaterialFisico,
  NivelFidelidad,
} from './prototipo-fisico.types';

@Component({
  selector: 'app-prototipo-fisico-tool',
  standalone: true,
  imports: [FormsModule, PrototipoFisicoReportComponent],
  template: `
    <div class="pf-tool">
      <!-- Header -->
      <div class="pf-tool__header">
        <div class="pf-tool__badge">PF</div>
        <div>
          <h2 class="pf-tool__title">Prototipo Físico</h2>
          <p class="pf-tool__subtitle">Construí y testeá representaciones tangibles del producto</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="pf-tool__tabs">
        <button class="pf-tool__tab" [class.pf-tool__tab--active]="activeView() === 'form'" (click)="activeView.set('form')">
          <i class="pi pi-box"></i> Iteraciones
        </button>
        <button class="pf-tool__tab" [class.pf-tool__tab--active]="activeView() === 'report'" (click)="activeView.set('report')">
          <i class="pi pi-sparkles"></i> Análisis
          @if (reports().length > 0) {
            <span class="pf-tool__tab-badge">{{ reports().length }}</span>
          }
        </button>
      </div>

      @if (activeView() === 'form') {
        <div class="pf-tool__form">

          <!-- Objetivo y producto -->
          <div class="pf-section">
            <h3 class="pf-section__title">Contexto del prototipo</h3>
            <div class="pf-field">
              <label class="pf-field__label">¿Qué querés validar con este prototipo?</label>
              <textarea
                class="pf-field__textarea"
                rows="2"
                placeholder="Ej: Validar que el ángulo de salida del dispensador no genera salpicaduras y que el mecanismo es operables con una sola mano"
                [ngModel]="data().objetivo"
                (ngModelChange)="patch({ objetivo: $event })"
              ></textarea>
            </div>
            <div class="pf-field">
              <label class="pf-field__label">Descripción del producto a prototipar</label>
              <textarea
                class="pf-field__textarea"
                rows="2"
                placeholder="Ej: Dispensador de jabón para baño público — forma cilíndrica, mecanismo de palanca, recarga por la parte superior"
                [ngModel]="data().productoDescripcion"
                (ngModelChange)="patch({ productoDescripcion: $event })"
              ></textarea>
            </div>
          </div>

          <!-- Iteraciones -->
          <div class="pf-section">
            <div class="pf-section__header">
              <h3 class="pf-section__title">Iteraciones físicas</h3>
              <button class="pf-btn pf-btn--ghost" (click)="addIteracion()">
                <i class="pi pi-plus"></i> Nueva iteración
              </button>
            </div>

            @if (data().iteraciones.length === 0) {
              <div class="pf-empty">
                <p>Cada iteración es un ciclo de fabricar → testear → aprender. Empezá con el material más barato.</p>
                <div class="pf-evolution">
                  <span class="pf-evolution__step">Cartón</span>
                  <i class="pi pi-arrow-right"></i>
                  <span class="pf-evolution__step">Foam</span>
                  <i class="pi pi-arrow-right"></i>
                  <span class="pf-evolution__step">Impresión 3D</span>
                  <i class="pi pi-arrow-right"></i>
                  <span class="pf-evolution__step">Producción</span>
                </div>
              </div>
            }

            @for (iter of data().iteraciones; track iter.id; let i = $index) {
              <div class="pf-iteracion">
                <!-- Header iteración -->
                <div class="pf-iteracion__header">
                  <div class="pf-iteracion__num">{{ i + 1 }}</div>
                  <div class="pf-materiales">
                    @for (mat of materiales; track mat.value) {
                      <button
                        class="pf-mat-btn"
                        [class.pf-mat-btn--active]="iter.material === mat.value"
                        (click)="updateIteracion(iter.id, 'material', mat.value)"
                        [title]="mat.costo ? 'Costo: ' + mat.costo : ''"
                      >{{ mat.label }}</button>
                    }
                  </div>
                  <button class="pf-action-btn pf-action-btn--danger" (click)="removeIteracion(iter.id)">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>

                <!-- Material otro (si aplica) -->
                @if (iter.material === 'otro') {
                  <input
                    class="pf-iteracion__input"
                    type="text"
                    placeholder="¿Qué material usaste?"
                    [ngModel]="iter.materialOtro"
                    (ngModelChange)="updateIteracion(iter.id, 'materialOtro', $event)"
                  />
                }

                <!-- Nivel de fidelidad -->
                <div class="pf-niveles">
                  @for (niv of niveles; track niv.value) {
                    <button
                      class="pf-nivel-btn"
                      [class.pf-nivel-btn--active]="iter.nivel === niv.value"
                      (click)="updateIteracion(iter.id, 'nivel', niv.value)"
                    >
                      <span class="pf-nivel-btn__label">{{ niv.label }}</span>
                      <span class="pf-nivel-btn__desc">{{ niv.descripcion }}</span>
                    </button>
                  }
                </div>

                <!-- Descripción y tiempo -->
                <div class="pf-iteracion__meta">
                  <textarea
                    class="pf-iteracion__desc"
                    rows="2"
                    placeholder="Qué fabricaste en esta iteración..."
                    [ngModel]="iter.descripcion"
                    (ngModelChange)="updateIteracion(iter.id, 'descripcion', $event)"
                  ></textarea>
                  <input
                    class="pf-iteracion__input pf-iteracion__input--time"
                    type="text"
                    placeholder="Tiempo de fabricación (ej: 2 horas)"
                    [ngModel]="iter.tiempoFabricacion"
                    (ngModelChange)="updateIteracion(iter.id, 'tiempoFabricacion', $event)"
                  />
                </div>

                <!-- Test realizado -->
                <div class="pf-field">
                  <label class="pf-field__label--small">Test realizado</label>
                  <input
                    class="pf-iteracion__input"
                    type="text"
                    placeholder="Ej: ¿Es cómodo sostenerlo con una mano? — 5 usuarios"
                    [ngModel]="iter.testRealizado"
                    (ngModelChange)="updateIteracion(iter.id, 'testRealizado', $event)"
                  />
                </div>

                <!-- Resultado del test -->
                <div class="pf-resultado-btns">
                  <button
                    class="pf-resultado-btn pf-resultado-btn--exitoso"
                    [class.pf-resultado-btn--active-exitoso]="iter.resultado === 'exitoso'"
                    (click)="updateIteracion(iter.id, 'resultado', 'exitoso')"
                  ><i class="pi pi-check"></i> Exitoso</button>
                  <button
                    class="pf-resultado-btn pf-resultado-btn--ajustes"
                    [class.pf-resultado-btn--active-ajustes]="iter.resultado === 'con-ajustes'"
                    (click)="updateIteracion(iter.id, 'resultado', 'con-ajustes')"
                  ><i class="pi pi-minus"></i> Con ajustes</button>
                  <button
                    class="pf-resultado-btn pf-resultado-btn--fallido"
                    [class.pf-resultado-btn--active-fallido]="iter.resultado === 'fallido'"
                    (click)="updateIteracion(iter.id, 'resultado', 'fallido')"
                  ><i class="pi pi-times"></i> Fallido</button>
                </div>

                <!-- Hallazgos de la iteración -->
                <div class="pf-chips pf-chips--compact">
                  @for (h of iter.hallazgos; track $index) {
                    <div class="pf-chip pf-chip--amber">
                      <span>{{ h }}</span>
                      <button class="pf-chip__remove" (click)="removeHallazgo(iter.id, $index)">
                        <i class="pi pi-times"></i>
                      </button>
                    </div>
                  }
                  <input
                    class="pf-chips__input"
                    type="text"
                    placeholder="+ Agregar hallazgo..."
                    #hallInput
                    (keydown.enter)="addHallazgo(iter.id, hallInput.value); hallInput.value = ''"
                  />
                </div>
              </div>
            }
          </div>

          <!-- Hallazgos globales -->
          <div class="pf-section">
            <h3 class="pf-section__title">Hallazgos globales del proceso</h3>
            <p class="pf-section__hint">Patrones o problemas que emergieron a lo largo de todas las iteraciones</p>
            <div class="pf-chips">
              @for (h of data().hallazgosGlobales; track $index) {
                <div class="pf-chip pf-chip--amber">
                  <span>{{ h }}</span>
                  <button class="pf-chip__remove" (click)="removeHallazgoGlobal($index)">
                    <i class="pi pi-times"></i>
                  </button>
                </div>
              }
              <input
                class="pf-chips__input"
                type="text"
                placeholder="+ Agregar hallazgo..."
                #globalInput
                (keydown.enter)="addHallazgoGlobal(globalInput.value); globalInput.value = ''"
              />
            </div>
          </div>

          <!-- Costo y decisión -->
          <div class="pf-section">
            <h3 class="pf-section__title">Resultado del proceso</h3>
            <div class="pf-row">
              <div class="pf-field pf-field--flex">
                <label class="pf-field__label">Costo total en materiales</label>
                <input
                  class="pf-iteracion__input"
                  type="text"
                  placeholder="Ej: $150 en materiales"
                  [ngModel]="data().costoTotal"
                  (ngModelChange)="patch({ costoTotal: $event })"
                />
              </div>
            </div>
            <div class="pf-field">
              <label class="pf-field__label">Decisión final</label>
              <textarea
                class="pf-field__textarea"
                rows="3"
                placeholder="Ej: El diseño final ajusta el ángulo de dispensación 15° y agrega un grip texturizado en la palanca. Aprobado para fabricar molde de producción."
                [ngModel]="data().decisionFinal"
                (ngModelChange)="patch({ decisionFinal: $event })"
              ></textarea>
            </div>
          </div>

          <!-- Actions -->
          <div class="pf-tool__actions">
            <div class="pf-tool__save-status">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              }
            </div>
            <button
              class="pf-btn pf-btn--primary"
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
        <div class="pf-tool__report">
          <app-prototipo-fisico-report [versions]="reports()" />
        </div>
      }
    </div>
  `,
  styles: [`
    .pf-tool {
      display: flex;
      flex-direction: column;
      gap: 0;
      height: 100%;
    }
    .pf-tool__header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .pf-tool__badge {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: .75rem;
      background: #b45309;
      color: #fff;
      font-weight: 800;
      font-size: .85rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .pf-tool__title { margin: 0; font-size: 1.1rem; font-weight: 700; color: #111827; }
    .pf-tool__subtitle { margin: .125rem 0 0; font-size: .8rem; color: #6b7280; }
    .pf-tool__tabs {
      display: flex;
      gap: .25rem;
      padding: .75rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
    }
    .pf-tool__tab {
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
    .pf-tool__tab--active { background: #fff; color: #b45309; font-weight: 600; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
    .pf-tool__tab-badge {
      background: #b45309;
      color: #fff;
      font-size: .65rem;
      font-weight: 700;
      padding: .1rem .4rem;
      border-radius: 9999px;
    }
    .pf-tool__form {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .pf-tool__report {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem 1.5rem;
    }
    .pf-tool__actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: .75rem;
      border-top: 1px solid #e5e7eb;
    }
    .pf-tool__save-status { font-size: .8rem; color: #9ca3af; display: flex; align-items: center; gap: .4rem; }
    .pf-section {
      background: #f9fafb;
      border-radius: .875rem;
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: .75rem;
    }
    .pf-section__header { display: flex; align-items: center; justify-content: space-between; }
    .pf-section__title { margin: 0; font-size: .9rem; font-weight: 700; color: #111827; }
    .pf-section__hint { margin: -.25rem 0 0; font-size: .8rem; color: #9ca3af; }
    .pf-field { display: flex; flex-direction: column; gap: .375rem; }
    .pf-field--flex { flex: 1; }
    .pf-field__label { font-size: .8rem; font-weight: 600; color: #374151; }
    .pf-field__label--small { font-size: .75rem; font-weight: 600; color: #6b7280; }
    .pf-field__textarea {
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
    .pf-field__textarea:focus { border-color: #b45309; }
    .pf-row { display: flex; gap: 1rem; }
    .pf-empty {
      padding: .75rem;
      background: #fff;
      border-radius: .625rem;
      border: 1px dashed #e5e7eb;
      display: flex;
      flex-direction: column;
      gap: .75rem;
    }
    .pf-empty p { margin: 0; font-size: .8rem; color: #9ca3af; }
    .pf-evolution { display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; }
    .pf-evolution__step {
      padding: .25rem .625rem;
      background: #fef3c7;
      border-radius: .375rem;
      font-size: .75rem;
      font-weight: 600;
      color: #92400e;
    }
    .pf-evolution .pi-arrow-right { color: #9ca3af; font-size: .75rem; }
    .pf-iteracion {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: .75rem;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: .625rem;
    }
    .pf-iteracion__header { display: flex; align-items: center; gap: .625rem; }
    .pf-iteracion__num {
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 50%;
      background: #b45309;
      color: #fff;
      font-size: .75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .pf-materiales { display: flex; gap: .375rem; flex-wrap: wrap; flex: 1; }
    .pf-mat-btn {
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
    .pf-mat-btn--active { border-color: #b45309; background: #fef3c7; color: #92400e; font-weight: 700; }
    .pf-action-btn {
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
    .pf-action-btn--danger:hover { color: #ef4444; border-color: #fecaca; background: #fef2f2; }
    .pf-niveles { display: grid; grid-template-columns: repeat(4, 1fr); gap: .5rem; }
    .pf-nivel-btn {
      padding: .5rem .75rem;
      border-radius: .5rem;
      border: 1px solid #e5e7eb;
      background: #f9fafb;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: .125rem;
      text-align: center;
      align-items: center;
      transition: all .15s;
    }
    .pf-nivel-btn--active { border-color: #b45309; background: #fef3c7; }
    .pf-nivel-btn__label { font-size: .75rem; font-weight: 700; color: #374151; }
    .pf-nivel-btn--active .pf-nivel-btn__label { color: #92400e; }
    .pf-nivel-btn__desc { font-size: .65rem; color: #9ca3af; }
    .pf-iteracion__meta { display: flex; flex-direction: column; gap: .5rem; }
    .pf-iteracion__desc {
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
    .pf-iteracion__desc:focus { border-color: #b45309; background: #fff; }
    .pf-iteracion__input {
      width: 100%;
      border: 1px solid #e5e7eb;
      border-radius: .4rem;
      padding: .4rem .625rem;
      font-size: .8rem;
      font-family: inherit;
      outline: none;
      background: #f9fafb;
      box-sizing: border-box;
      transition: border-color .15s;
    }
    .pf-iteracion__input:focus { border-color: #b45309; background: #fff; }
    .pf-iteracion__input--time { width: auto; flex: 0 0 auto; }
    .pf-resultado-btns { display: flex; gap: .5rem; }
    .pf-resultado-btn {
      flex: 1;
      padding: .4rem .625rem;
      border-radius: .5rem;
      border: 1px solid #e5e7eb;
      background: #f9fafb;
      font-size: .8rem;
      font-weight: 500;
      color: #6b7280;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: .3rem;
      transition: all .15s;
    }
    .pf-resultado-btn--active-exitoso { background: #f0fdf4; border-color: #16a34a; color: #15803d; font-weight: 700; }
    .pf-resultado-btn--active-ajustes { background: #fffbeb; border-color: #d97706; color: #b45309; font-weight: 700; }
    .pf-resultado-btn--active-fallido { background: #fef2f2; border-color: #ef4444; color: #dc2626; font-weight: 700; }
    .pf-chips { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; }
    .pf-chips--compact { background: #f9fafb; border-radius: .4rem; padding: .4rem .625rem; }
    .pf-chip {
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
    .pf-chip--amber { background: #fef3c7; border-color: #fcd34d; color: #92400e; }
    .pf-chip__remove {
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
    .pf-chip__remove:hover { opacity: 1; }
    .pf-chips__input {
      border: none;
      outline: none;
      font-size: .8rem;
      color: #374151;
      background: transparent;
      min-width: 8rem;
    }
    .pf-btn {
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
    .pf-btn--primary { background: #b45309; color: #fff; }
    .pf-btn--primary:hover:not(:disabled) { background: #92400e; }
    .pf-btn--primary:disabled { opacity: .5; cursor: not-allowed; }
    .pf-btn--ghost { background: transparent; color: #b45309; border: 1px solid #b45309; padding: .35rem .75rem; font-size: .8rem; }
    .pf-btn--ghost:hover { background: #fef3c7; }
  `],
})
export class PrototipoFisicoToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly prototipoFisicoService = inject(PrototipoFisicoService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<PrototipoFisicoData>({ ...EMPTY_PROTOTIPO_FISICO });
  reports = signal<PrototipoFisicoReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  activeView = signal<'form' | 'report'>('form');

  readonly materiales = MATERIALES_FISICOS;
  readonly niveles = NIVELES_FIDELIDAD;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  canGenerate = computed(() => {
    const d = this.data();
    return !!d.objetivo.trim() && d.iteraciones.length >= 1;
  });

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;
    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as PrototipoFisicoData | undefined;
    this.data.set(stored ? { ...EMPTY_PROTOTIPO_FISICO, ...stored } : { ...EMPTY_PROTOTIPO_FISICO });
    this.reports.set((raw['reports'] as PrototipoFisicoReportVersionDto[]) ?? []);
  }

  patch(partial: Partial<PrototipoFisicoData>): void {
    this.data.set({ ...this.data(), ...partial });
    this.scheduleSave();
  }

  // Iteraciones
  addIteracion(): void {
    const iter: IteracionFisicaDto = { id: crypto.randomUUID(), ...EMPTY_ITERACION_FISICA };
    this.patch({ iteraciones: [...this.data().iteraciones, iter] });
  }

  updateIteracion(id: string, field: keyof IteracionFisicaDto, value: string | MaterialFisico | NivelFidelidad | ResultadoFisico | null): void {
    const iteraciones = this.data().iteraciones.map(it =>
      it.id === id ? { ...it, [field]: value } : it
    );
    this.patch({ iteraciones });
  }

  removeIteracion(id: string): void {
    this.patch({ iteraciones: this.data().iteraciones.filter(it => it.id !== id) });
  }

  addHallazgo(iterId: string, value: string): void {
    const v = value.trim();
    if (!v) return;
    const iteraciones = this.data().iteraciones.map(it =>
      it.id === iterId ? { ...it, hallazgos: [...it.hallazgos, v] } : it
    );
    this.patch({ iteraciones });
  }

  removeHallazgo(iterId: string, index: number): void {
    const iteraciones = this.data().iteraciones.map(it => {
      if (it.id !== iterId) return it;
      const h = [...it.hallazgos];
      h.splice(index, 1);
      return { ...it, hallazgos: h };
    });
    this.patch({ iteraciones });
  }

  addHallazgoGlobal(value: string): void {
    const v = value.trim();
    if (!v) return;
    this.patch({ hallazgosGlobales: [...this.data().hallazgosGlobales, v] });
  }

  removeHallazgoGlobal(index: number): void {
    const arr = [...this.data().hallazgosGlobales];
    arr.splice(index, 1);
    this.patch({ hallazgosGlobales: arr });
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
      const res = await this.prototipoFisicoService.analyze({
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
