import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { PrototipoFuncionalService } from '@core/services/prototipoFuncionalService/prototipo-funcional.service';
import { PrototipoFuncionalReportComponent } from './prototipo-funcional-report.component';
import {
  EMPTY_PROTOTIPO_FUNCIONAL,
  EstadoFlujo,
  FeatureDto,
  FlujoCriticoDto,
  HallazgoDto,
  PrioridadFeature,
  PrototipoFuncionalData,
  PrototipoFuncionalReportVersionDto,
  TIPOS_PROTOTIPO,
  TipoHallazgo,
  TipoPrototipoFuncional,
} from './prototipo-funcional.types';

@Component({
  selector: 'app-prototipo-funcional-tool',
  standalone: true,
  imports: [FormsModule, PrototipoFuncionalReportComponent],
  template: `
    <div class="pf-tool">
      <!-- Header -->
      <div class="pf-tool__header">
        <div class="pf-tool__badge">PF</div>
        <div>
          <h2 class="pf-tool__title">Prototipo Funcional</h2>
          <p class="pf-tool__subtitle">Construí algo que realmente funciona — testá flujos reales con usuarios reales</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="pf-tool__tabs">
        <button class="pf-tool__tab" [class.pf-tool__tab--active]="activeView() === 'form'" (click)="activeView.set('form')">
          <i class="pi pi-code"></i> Prototipo
        </button>
        <button class="pf-tool__tab" [class.pf-tool__tab--active]="activeView() === 'report'" (click)="activeView.set('report')">
          <i class="pi pi-chart-bar"></i> Análisis
          @if (reports().length > 0) {
            <span class="pf-tool__tab-badge">{{ reports().length }}</span>
          }
        </button>
      </div>

      @if (activeView() === 'form') {
        <div class="pf-tool__form">

          <!-- Objetivo y tipo -->
          <div class="pf-section">
            <h3 class="pf-section__title">Configuración del prototipo</h3>
            <div class="pf-field">
              <label class="pf-field__label">Objetivo del prototipo</label>
              <textarea
                class="pf-field__textarea"
                rows="2"
                placeholder="Ej: Validar que los usuarios pueden completar el flujo de pago con la nueva interfaz en menos de 3 minutos"
                [ngModel]="data().objetivo"
                (ngModelChange)="patch({ objetivo: $event })"
              ></textarea>
            </div>

            <div class="pf-field">
              <label class="pf-field__label">Tipo de prototipo</label>
              <div class="pf-tipos">
                @for (t of tiposPrototipo; track t.value) {
                  <button
                    class="pf-tipo-btn"
                    [class.pf-tipo-btn--active]="data().tipo === t.value"
                    (click)="patch({ tipo: t.value })"
                    [title]="t.descripcion"
                  >{{ t.label }}</button>
                }
              </div>
            </div>

            <div class="pf-field">
              <label class="pf-field__label">Herramientas usadas para construirlo</label>
              <div class="pf-chips">
                @for (h of data().herramientas; track $index) {
                  <div class="pf-chip">
                    <span>{{ h }}</span>
                    <button class="pf-chip__remove" (click)="removeHerramienta($index)">
                      <i class="pi pi-times"></i>
                    </button>
                  </div>
                }
                <input
                  class="pf-chips__input"
                  type="text"
                  placeholder="+ Agregar herramienta (Figma, React, Firebase...)"
                  #hInput
                  (keydown.enter)="addHerramienta(hInput.value); hInput.value = ''"
                />
              </div>
            </div>
          </div>

          <!-- Flujos críticos -->
          <div class="pf-section">
            <div class="pf-section__header">
              <h3 class="pf-section__title">Flujos críticos</h3>
              <button class="pf-btn pf-btn--ghost" (click)="addFlujo()">
                <i class="pi pi-plus"></i> Agregar flujo
              </button>
            </div>
            <p class="pf-section__hint">¿Qué debe funcionar? Solo lo que es imprescindible para testear.</p>

            @if (data().flujosCriticos.length === 0) {
              <div class="pf-empty">
                <p>Definí los flujos que el prototipo debe ejecutar correctamente para que el testing sea válido.</p>
              </div>
            }

            @for (flujo of data().flujosCriticos; track flujo.id) {
              <div class="pf-flujo">
                <div class="pf-flujo__header">
                  <div class="pf-estados">
                    <button
                      class="pf-estado-btn"
                      [class.pf-estado-btn--pendiente]="flujo.estado === 'pendiente'"
                      (click)="updateFlujo(flujo.id, 'estado', 'pendiente')"
                    >Pendiente</button>
                    <button
                      class="pf-estado-btn"
                      [class.pf-estado-btn--funcionando]="flujo.estado === 'funcionando'"
                      (click)="updateFlujo(flujo.id, 'estado', 'funcionando')"
                    >Funcionando</button>
                    <button
                      class="pf-estado-btn"
                      [class.pf-estado-btn--bugs]="flujo.estado === 'con-bugs'"
                      (click)="updateFlujo(flujo.id, 'estado', 'con-bugs')"
                    >Con bugs</button>
                  </div>
                  <button class="pf-action-btn pf-action-btn--danger" (click)="removeFlujo(flujo.id)">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
                <input
                  class="pf-input"
                  type="text"
                  placeholder="Nombre del flujo (ej: Flujo de pago con tarjeta)"
                  [ngModel]="flujo.nombre"
                  (ngModelChange)="updateFlujo(flujo.id, 'nombre', $event)"
                />
                <textarea
                  class="pf-textarea"
                  rows="2"
                  placeholder="Describí qué pasos incluye este flujo y qué debe poder hacer el usuario..."
                  [ngModel]="flujo.descripcion"
                  (ngModelChange)="updateFlujo(flujo.id, 'descripcion', $event)"
                ></textarea>
              </div>
            }
          </div>

          <!-- Features priorizadas -->
          <div class="pf-section">
            <div class="pf-section__header">
              <h3 class="pf-section__title">Features priorizadas</h3>
              <button class="pf-btn pf-btn--ghost" (click)="addFeature()">
                <i class="pi pi-plus"></i> Agregar feature
              </button>
            </div>
            <p class="pf-section__hint">Solo lo esencial. ¿Qué se incluyó y qué quedó fuera?</p>

            @if (data().features.length === 0) {
              <div class="pf-empty">
                <p>Listá las features y marcá cuáles se incluyeron en el prototipo y cuáles se dejaron para después.</p>
              </div>
            }

            @for (feat of data().features; track feat.id) {
              <div class="pf-feature" [class.pf-feature--excluida]="!feat.incluida">
                <div class="pf-feature__header">
                  <label class="pf-toggle">
                    <input type="checkbox" [ngModel]="feat.incluida" (ngModelChange)="updateFeature(feat.id, 'incluida', $event)" />
                    <span class="pf-toggle__label">{{ feat.incluida ? 'Incluida' : 'Excluida' }}</span>
                  </label>
                  <div class="pf-prioridades">
                    <button class="pf-prio-btn" [class.pf-prio-btn--alta]="feat.prioridad === 'alta'" (click)="updateFeature(feat.id, 'prioridad', 'alta')">Alta</button>
                    <button class="pf-prio-btn" [class.pf-prio-btn--media]="feat.prioridad === 'media'" (click)="updateFeature(feat.id, 'prioridad', 'media')">Media</button>
                    <button class="pf-prio-btn" [class.pf-prio-btn--baja]="feat.prioridad === 'baja'" (click)="updateFeature(feat.id, 'prioridad', 'baja')">Baja</button>
                  </div>
                  <button class="pf-action-btn pf-action-btn--danger" (click)="removeFeature(feat.id)">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
                <input
                  class="pf-input"
                  type="text"
                  placeholder="Nombre de la feature"
                  [ngModel]="feat.nombre"
                  (ngModelChange)="updateFeature(feat.id, 'nombre', $event)"
                />
                <input
                  class="pf-input pf-input--secondary"
                  type="text"
                  placeholder="Notas (por qué se excluyó, qué condición necesita...)"
                  [ngModel]="feat.notas"
                  (ngModelChange)="updateFeature(feat.id, 'notas', $event)"
                />
              </div>
            }
          </div>

          <!-- Hallazgos del testing -->
          <div class="pf-section">
            <div class="pf-section__header">
              <h3 class="pf-section__title">Hallazgos del testing</h3>
              <button class="pf-btn pf-btn--ghost" (click)="addHallazgo()">
                <i class="pi pi-plus"></i> Agregar hallazgo
              </button>
            </div>
            <p class="pf-section__hint">Bugs, problemas de UX y issues de performance encontrados con usuarios reales.</p>

            @if (data().hallazgos.length === 0) {
              <div class="pf-empty">
                <p>Registrá los issues encontrados durante las sesiones de testing. Clasificalos para priorizar el backlog.</p>
              </div>
            }

            @for (h of data().hallazgos; track h.id) {
              <div class="pf-hallazgo" [class.pf-hallazgo--resuelto]="h.resuelto">
                <div class="pf-hallazgo__header">
                  <div class="pf-tipos-h">
                    <button class="pf-tipo-h-btn" [class.pf-tipo-h-btn--funcional]="h.tipo === 'funcional'" (click)="updateHallazgo(h.id, 'tipo', 'funcional')">Funcional</button>
                    <button class="pf-tipo-h-btn" [class.pf-tipo-h-btn--ux]="h.tipo === 'ux'" (click)="updateHallazgo(h.id, 'tipo', 'ux')">UX</button>
                    <button class="pf-tipo-h-btn" [class.pf-tipo-h-btn--performance]="h.tipo === 'performance'" (click)="updateHallazgo(h.id, 'tipo', 'performance')">Performance</button>
                  </div>
                  <label class="pf-toggle">
                    <input type="checkbox" [ngModel]="h.resuelto" (ngModelChange)="updateHallazgo(h.id, 'resuelto', $event)" />
                    <span class="pf-toggle__label">{{ h.resuelto ? 'Resuelto' : 'Pendiente' }}</span>
                  </label>
                  <button class="pf-action-btn pf-action-btn--danger" (click)="removeHallazgo(h.id)">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
                <textarea
                  class="pf-textarea"
                  rows="2"
                  placeholder="Descripción del hallazgo — qué pasó, en qué flujo, qué impacto tiene..."
                  [ngModel]="h.descripcion"
                  (ngModelChange)="updateHallazgo(h.id, 'descripcion', $event)"
                ></textarea>
              </div>
            }
          </div>

          <!-- Próximos pasos -->
          <div class="pf-section">
            <h3 class="pf-section__title">Próximos pasos</h3>
            <div class="pf-chips">
              @for (paso of data().proximosPasos; track $index) {
                <div class="pf-chip">
                  <span>{{ paso }}</span>
                  <button class="pf-chip__remove" (click)="removePaso($index)">
                    <i class="pi pi-times"></i>
                  </button>
                </div>
              }
              <input
                class="pf-chips__input"
                type="text"
                placeholder="+ Agregar paso..."
                #pasoInput
                (keydown.enter)="addPaso(pasoInput.value); pasoInput.value = ''"
              />
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
          <app-prototipo-funcional-report [versions]="reports()" />
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
      background: #0ea5e9;
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
    .pf-tool__tab--active { background: #fff; color: #0ea5e9; font-weight: 600; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
    .pf-tool__tab-badge {
      background: #0ea5e9;
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
    .pf-field__label { font-size: .8rem; font-weight: 600; color: #374151; }
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
    .pf-field__textarea:focus { border-color: #0ea5e9; }
    .pf-tipos { display: flex; gap: .375rem; flex-wrap: wrap; }
    .pf-tipo-btn {
      padding: .35rem .75rem;
      border-radius: .375rem;
      border: 1px solid #e5e7eb;
      background: #fff;
      font-size: .8rem;
      font-weight: 500;
      color: #6b7280;
      cursor: pointer;
      transition: all .15s;
    }
    .pf-tipo-btn--active { border-color: #0ea5e9; background: #e0f2fe; color: #0369a1; font-weight: 700; }
    .pf-empty {
      padding: .75rem;
      background: #fff;
      border-radius: .625rem;
      border: 1px dashed #e5e7eb;
    }
    .pf-empty p { margin: 0; font-size: .8rem; color: #9ca3af; }
    .pf-flujo {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: .75rem;
      padding: .875rem;
      display: flex;
      flex-direction: column;
      gap: .5rem;
    }
    .pf-flujo__header { display: flex; align-items: center; gap: .5rem; }
    .pf-estados { display: flex; gap: .25rem; flex: 1; }
    .pf-estado-btn {
      padding: .2rem .625rem;
      border-radius: .375rem;
      border: 1px solid #e5e7eb;
      background: #f9fafb;
      font-size: .75rem;
      font-weight: 500;
      color: #6b7280;
      cursor: pointer;
      transition: all .15s;
    }
    .pf-estado-btn--pendiente { border-color: #f59e0b; background: #fffbeb; color: #b45309; font-weight: 700; }
    .pf-estado-btn--funcionando { border-color: #16a34a; background: #f0fdf4; color: #15803d; font-weight: 700; }
    .pf-estado-btn--bugs { border-color: #ef4444; background: #fef2f2; color: #dc2626; font-weight: 700; }
    .pf-feature {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: .75rem;
      padding: .875rem;
      display: flex;
      flex-direction: column;
      gap: .5rem;
      transition: opacity .15s;
    }
    .pf-feature--excluida { opacity: .6; }
    .pf-feature__header { display: flex; align-items: center; gap: .5rem; }
    .pf-toggle { display: flex; align-items: center; gap: .375rem; cursor: pointer; }
    .pf-toggle input { cursor: pointer; accent-color: #0ea5e9; }
    .pf-toggle__label { font-size: .75rem; font-weight: 600; color: #374151; }
    .pf-prioridades { display: flex; gap: .25rem; flex: 1; }
    .pf-prio-btn {
      padding: .2rem .5rem;
      border-radius: .375rem;
      border: 1px solid #e5e7eb;
      background: #f9fafb;
      font-size: .7rem;
      font-weight: 500;
      color: #6b7280;
      cursor: pointer;
      transition: all .15s;
    }
    .pf-prio-btn--alta { border-color: #ef4444; background: #fef2f2; color: #dc2626; font-weight: 700; }
    .pf-prio-btn--media { border-color: #f59e0b; background: #fffbeb; color: #b45309; font-weight: 700; }
    .pf-prio-btn--baja { border-color: #16a34a; background: #f0fdf4; color: #15803d; font-weight: 700; }
    .pf-hallazgo {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: .75rem;
      padding: .875rem;
      display: flex;
      flex-direction: column;
      gap: .5rem;
      transition: opacity .15s;
    }
    .pf-hallazgo--resuelto { opacity: .55; }
    .pf-hallazgo__header { display: flex; align-items: center; gap: .5rem; }
    .pf-tipos-h { display: flex; gap: .25rem; flex: 1; }
    .pf-tipo-h-btn {
      padding: .2rem .5rem;
      border-radius: .375rem;
      border: 1px solid #e5e7eb;
      background: #f9fafb;
      font-size: .7rem;
      font-weight: 500;
      color: #6b7280;
      cursor: pointer;
      transition: all .15s;
    }
    .pf-tipo-h-btn--funcional { border-color: #ef4444; background: #fef2f2; color: #dc2626; font-weight: 700; }
    .pf-tipo-h-btn--ux { border-color: #8b5cf6; background: #f5f3ff; color: #6d28d9; font-weight: 700; }
    .pf-tipo-h-btn--performance { border-color: #f59e0b; background: #fffbeb; color: #b45309; font-weight: 700; }
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
    .pf-input {
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
    .pf-input:focus { border-color: #0ea5e9; background: #fff; }
    .pf-input--secondary { background: #f3f4f6; font-size: .75rem; color: #6b7280; }
    .pf-textarea {
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
    .pf-textarea:focus { border-color: #0ea5e9; background: #fff; }
    .pf-chips { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; }
    .pf-chip {
      display: flex;
      align-items: center;
      gap: .375rem;
      padding: .3rem .625rem;
      border-radius: 9999px;
      background: #e0f2fe;
      border: 1px solid #bae6fd;
      font-size: .8rem;
      color: #0369a1;
    }
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
    .pf-btn--primary { background: #0ea5e9; color: #fff; }
    .pf-btn--primary:hover:not(:disabled) { background: #0284c7; }
    .pf-btn--primary:disabled { opacity: .5; cursor: not-allowed; }
    .pf-btn--ghost { background: transparent; color: #0ea5e9; border: 1px solid #0ea5e9; padding: .35rem .75rem; font-size: .8rem; }
    .pf-btn--ghost:hover { background: #e0f2fe; }
  `],
})
export class PrototipoFuncionalToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly prototipoFuncionalService = inject(PrototipoFuncionalService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<PrototipoFuncionalData>({ ...EMPTY_PROTOTIPO_FUNCIONAL });
  reports = signal<PrototipoFuncionalReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  activeView = signal<'form' | 'report'>('form');

  readonly tiposPrototipo = TIPOS_PROTOTIPO;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  canGenerate = computed(() => {
    const d = this.data();
    return !!d.objetivo.trim() && d.flujosCriticos.length >= 1;
  });

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;
    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as PrototipoFuncionalData | undefined;
    this.data.set(stored ? { ...EMPTY_PROTOTIPO_FUNCIONAL, ...stored } : { ...EMPTY_PROTOTIPO_FUNCIONAL });
    this.reports.set((raw['reports'] as PrototipoFuncionalReportVersionDto[]) ?? []);
  }

  patch(partial: Partial<PrototipoFuncionalData>): void {
    this.data.set({ ...this.data(), ...partial });
    this.scheduleSave();
  }

  // Herramientas
  addHerramienta(value: string): void {
    const v = value.trim();
    if (!v) return;
    this.patch({ herramientas: [...this.data().herramientas, v] });
  }

  removeHerramienta(index: number): void {
    const arr = [...this.data().herramientas];
    arr.splice(index, 1);
    this.patch({ herramientas: arr });
  }

  // Flujos críticos
  addFlujo(): void {
    const flujo: FlujoCriticoDto = { id: crypto.randomUUID(), nombre: '', descripcion: '', estado: 'pendiente' };
    this.patch({ flujosCriticos: [...this.data().flujosCriticos, flujo] });
  }

  updateFlujo(id: string, field: keyof FlujoCriticoDto, value: string | EstadoFlujo): void {
    const flujosCriticos = this.data().flujosCriticos.map(f => f.id === id ? { ...f, [field]: value } : f);
    this.patch({ flujosCriticos });
  }

  removeFlujo(id: string): void {
    this.patch({ flujosCriticos: this.data().flujosCriticos.filter(f => f.id !== id) });
  }

  // Features
  addFeature(): void {
    const feat: FeatureDto = { id: crypto.randomUUID(), nombre: '', prioridad: 'alta', incluida: true, notas: '' };
    this.patch({ features: [...this.data().features, feat] });
  }

  updateFeature(id: string, field: keyof FeatureDto, value: string | boolean | PrioridadFeature): void {
    const features = this.data().features.map(f => f.id === id ? { ...f, [field]: value } : f);
    this.patch({ features });
  }

  removeFeature(id: string): void {
    this.patch({ features: this.data().features.filter(f => f.id !== id) });
  }

  // Hallazgos
  addHallazgo(): void {
    const h: HallazgoDto = { id: crypto.randomUUID(), tipo: 'funcional', descripcion: '', resuelto: false };
    this.patch({ hallazgos: [...this.data().hallazgos, h] });
  }

  updateHallazgo(id: string, field: keyof HallazgoDto, value: string | boolean | TipoHallazgo): void {
    const hallazgos = this.data().hallazgos.map(h => h.id === id ? { ...h, [field]: value } : h);
    this.patch({ hallazgos });
  }

  removeHallazgo(id: string): void {
    this.patch({ hallazgos: this.data().hallazgos.filter(h => h.id !== id) });
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
      const res = await this.prototipoFuncionalService.analyze({
        toolApplicationId: app.id,
        currentVersion: this.reports().length,
        data: this.data(),
      });
      const newVersion: PrototipoFuncionalReportVersionDto = { version: res.version, generatedAt: res.generatedAt, report: res.report };
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
