import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { RoadmapPrototipadoService } from '@core/services/roadmapPrototipadoService/roadmap-prototipado.service';
import { RoadmapPrototipadoReportComponent } from './roadmap-prototipado-report.component';
import {
  EMPTY_ROADMAP_PROTOTIPADO,
  FIDELIDAD_CONFIG,
  FaseDto,
  FeaturePrioridadDto,
  PrioridadFeature,
  PropositoPrototipo,
  PROPOSITO_CONFIG,
  PrototipoDto,
  RoadmapPrototipadoData,
  RoadmapPrototipadoReportVersionDto,
} from './roadmap-prototipado.types';

@Component({
  selector: 'app-roadmap-prototipado-tool',
  standalone: true,
  imports: [FormsModule, RoadmapPrototipadoReportComponent],
  template: `
    <div class="rp-tool">
      <!-- Header -->
      <div class="rp-tool__header">
        <div class="rp-tool__badge">RP</div>
        <div>
          <h2 class="rp-tool__title">Roadmap de Prototipado</h2>
          <p class="rp-tool__subtitle">Planificá la secuencia de prototipos — de lo más simple a lo más complejo</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="rp-tool__tabs">
        <button class="rp-tool__tab" [class.rp-tool__tab--active]="activeView() === 'form'" (click)="activeView.set('form')">
          <i class="pi pi-calendar"></i> Roadmap
        </button>
        <button class="rp-tool__tab" [class.rp-tool__tab--active]="activeView() === 'report'" (click)="activeView.set('report')">
          <i class="pi pi-chart-bar"></i> Análisis
          @if (reports().length > 0) {
            <span class="rp-tool__tab-badge">{{ reports().length }}</span>
          }
        </button>
      </div>

      @if (activeView() === 'form') {
        <div class="rp-tool__form">

          <!-- Contexto -->
          <div class="rp-section">
            <h3 class="rp-section__title">Contexto del proyecto</h3>

            <div class="rp-field">
              <label class="rp-field__label">¿Qué se está prototipando?</label>
              <textarea
                class="rp-field__textarea"
                rows="2"
                placeholder="Ej: Nueva feature de checkout para app de ecommerce. Objetivo: validar el flujo de compra con 3 métodos de pago distintos."
                [ngModel]="data().contexto"
                (ngModelChange)="patch({ contexto: $event })"
              ></textarea>
            </div>

            <div class="rp-two-col">
              <div class="rp-field">
                <label class="rp-field__label">Equipo</label>
                <input
                  class="rp-field__input"
                  type="text"
                  placeholder="Ej: 2 diseñadores, 1 product manager"
                  [ngModel]="data().equipo"
                  (ngModelChange)="patch({ equipo: $event })"
                />
              </div>
              <div class="rp-field">
                <label class="rp-field__label">Duración total</label>
                <input
                  class="rp-field__input"
                  type="text"
                  placeholder="Ej: 6 semanas"
                  [ngModel]="data().duracionTotal"
                  (ngModelChange)="patch({ duracionTotal: $event })"
                />
              </div>
            </div>

            <div class="rp-field">
              <label class="rp-field__label">Restricciones y dependencias</label>
              <div class="rp-chips">
                @for (r of data().restricciones; track $index) {
                  <div class="rp-chip rp-chip--warn">
                    <i class="pi pi-exclamation-triangle" style="font-size:.65rem;"></i>
                    <span>{{ r }}</span>
                    <button class="rp-chip__remove" (click)="removeRestriccion($index)"><i class="pi pi-times"></i></button>
                  </div>
                }
                <input
                  class="rp-chips__input"
                  type="text"
                  placeholder="+ Agregar restricción (ej: Dev freeze semana 5)..."
                  #restInput
                  (keydown.enter)="addRestriccion(restInput.value); restInput.value = ''"
                />
              </div>
            </div>
          </div>

          <!-- Fases del roadmap -->
          <div class="rp-section">
            <div class="rp-section__header">
              <h3 class="rp-section__title">Fases del roadmap</h3>
              <button class="rp-btn rp-btn--ghost" (click)="addFase()">
                <i class="pi pi-plus"></i> Agregar fase
              </button>
            </div>
            <p class="rp-section__hint">Cada fase agrupa prototipos con el mismo propósito. Empezá con Exploración.</p>

            @if (data().fases.length === 0) {
              <div class="rp-empty">
                <div class="rp-fases-ejemplo">
                  <div class="rp-fase-ejemplo">1. Exploración</div>
                  <i class="pi pi-arrow-right rp-arrow"></i>
                  <div class="rp-fase-ejemplo">2. Validación</div>
                  <i class="pi pi-arrow-right rp-arrow"></i>
                  <div class="rp-fase-ejemplo">3. Refinamiento</div>
                  <i class="pi pi-arrow-right rp-arrow"></i>
                  <div class="rp-fase-ejemplo">4. Lanzamiento</div>
                </div>
              </div>
            }

            @for (fase of data().fases; track fase.id; let fi = $index) {
              <div class="rp-fase">
                <!-- Fase header -->
                <div class="rp-fase__header">
                  <div class="rp-fase__num">{{ fi + 1 }}</div>
                  <input
                    class="rp-fase__nombre"
                    type="text"
                    placeholder="Nombre de la fase (ej: Exploración)"
                    [ngModel]="fase.nombre"
                    (ngModelChange)="updateFase(fase.id, 'nombre', $event)"
                  />
                  <input
                    class="rp-fase__semanas"
                    type="text"
                    placeholder="Semanas (ej: Sem 1-2)"
                    [ngModel]="fase.semanas"
                    (ngModelChange)="updateFase(fase.id, 'semanas', $event)"
                  />
                  <button class="rp-action-btn rp-action-btn--danger" (click)="removeFase(fase.id)">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>

                <textarea
                  class="rp-fase__objetivo"
                  rows="1"
                  placeholder="Objetivo de esta fase..."
                  [ngModel]="fase.objetivo"
                  (ngModelChange)="updateFase(fase.id, 'objetivo', $event)"
                ></textarea>

                <!-- Prototipos de la fase -->
                <div class="rp-prototipos">
                  @for (proto of fase.prototipos; track proto.id) {
                    <div class="rp-proto" [class.rp-proto--completado]="proto.completado">
                      <div class="rp-proto__line">
                        <!-- Checkbox completado -->
                        <label class="rp-check">
                          <input type="checkbox" [ngModel]="proto.completado" (ngModelChange)="updateProto(fase.id, proto.id, 'completado', $event)" />
                        </label>

                        <!-- Nombre -->
                        <input
                          class="rp-proto__input rp-proto__input--nombre"
                          type="text"
                          placeholder="Nombre del prototipo"
                          [ngModel]="proto.nombre"
                          (ngModelChange)="updateProto(fase.id, proto.id, 'nombre', $event)"
                        />

                        <!-- Fidelidad -->
                        <select
                          class="rp-proto__select"
                          [ngModel]="proto.fidelidad"
                          (ngModelChange)="updateProto(fase.id, proto.id, 'fidelidad', $event)"
                        >
                          @for (fi of fidelidadOptions; track fi.value) {
                            <option [value]="fi.value">{{ fi.label }}</option>
                          }
                        </select>

                        <!-- Propósito -->
                        <select
                          class="rp-proto__select"
                          [ngModel]="proto.proposito"
                          (ngModelChange)="updateProto(fase.id, proto.id, 'proposito', $event)"
                        >
                          @for (p of propositoOptions; track p.value) {
                            <option [value]="p.value">{{ p.label }}</option>
                          }
                        </select>

                        <button class="rp-action-btn rp-action-btn--danger" (click)="removeProto(fase.id, proto.id)">
                          <i class="pi pi-trash"></i>
                        </button>
                      </div>

                      <div class="rp-proto__meta">
                        <input
                          class="rp-proto__input"
                          type="text"
                          placeholder="Herramienta (Figma, papel, ProtoPie...)"
                          [ngModel]="proto.herramienta"
                          (ngModelChange)="updateProto(fase.id, proto.id, 'herramienta', $event)"
                        />
                        <input
                          class="rp-proto__input"
                          type="text"
                          placeholder="Entregable (ej: Flujo aprobado por product)"
                          [ngModel]="proto.entregable"
                          (ngModelChange)="updateProto(fase.id, proto.id, 'entregable', $event)"
                        />
                      </div>
                    </div>
                  }

                  <button class="rp-btn-add-proto" (click)="addProto(fase.id)">
                    <i class="pi pi-plus"></i> Agregar prototipo
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Priorización de features -->
          <div class="rp-section">
            <div class="rp-section__header">
              <h3 class="rp-section__title">Priorización de features</h3>
              <button class="rp-btn rp-btn--ghost" (click)="addFeature()">
                <i class="pi pi-plus"></i> Agregar
              </button>
            </div>
            <p class="rp-section__hint">¿Qué features se prototipan primero y por qué?</p>

            @if (data().features.length === 0) {
              <div class="rp-empty">
                <p>Listá las features y asignales una prioridad y fase del roadmap para justificar la secuencia.</p>
              </div>
            }

            @for (feat of data().features; track feat.id) {
              <div class="rp-feature">
                <div class="rp-feature__header">
                  <div class="rp-prio-btns">
                    <button class="rp-prio-btn" [class.rp-prio-btn--alta]="feat.prioridad === 'alta'" (click)="updateFeature(feat.id, 'prioridad', 'alta')">Alta</button>
                    <button class="rp-prio-btn" [class.rp-prio-btn--media]="feat.prioridad === 'media'" (click)="updateFeature(feat.id, 'prioridad', 'media')">Media</button>
                    <button class="rp-prio-btn" [class.rp-prio-btn--baja]="feat.prioridad === 'baja'" (click)="updateFeature(feat.id, 'prioridad', 'baja')">Baja</button>
                  </div>
                  <button class="rp-action-btn rp-action-btn--danger" (click)="removeFeature(feat.id)">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
                <div class="rp-feature__fields">
                  <input class="rp-field__input" type="text" placeholder="Nombre de la feature" [ngModel]="feat.nombre" (ngModelChange)="updateFeature(feat.id, 'nombre', $event)" />
                  <input class="rp-field__input" type="text" placeholder="Fase asignada (ej: Fase 2)" [ngModel]="feat.fase" (ngModelChange)="updateFeature(feat.id, 'fase', $event)" />
                </div>
                <input class="rp-field__input" type="text" placeholder="Razón de la prioridad (ej: Core del producto, depende de otros flujos)" [ngModel]="feat.razon" (ngModelChange)="updateFeature(feat.id, 'razon', $event)" />
              </div>
            }
          </div>

          <!-- Actions -->
          <div class="rp-tool__actions">
            <div class="rp-tool__save-status">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              }
            </div>
            <button class="rp-btn rp-btn--primary" [disabled]="!canGenerate() || analyzing()" (click)="analyze()">
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
        <div class="rp-tool__report">
          <app-roadmap-prototipado-report [versions]="reports()" />
        </div>
      }
    </div>
  `,
  styles: [`
    .rp-tool { display: flex; flex-direction: column; gap: 0; height: 100%; }
    .rp-tool__header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .rp-tool__badge {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: .75rem;
      background: #f59e0b;
      color: #fff;
      font-weight: 800;
      font-size: .85rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .rp-tool__title { margin: 0; font-size: 1.1rem; font-weight: 700; color: #111827; }
    .rp-tool__subtitle { margin: .125rem 0 0; font-size: .8rem; color: #6b7280; }
    .rp-tool__tabs {
      display: flex;
      gap: .25rem;
      padding: .75rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
    }
    .rp-tool__tab {
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
    .rp-tool__tab--active { background: #fff; color: #f59e0b; font-weight: 600; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
    .rp-tool__tab-badge {
      background: #f59e0b;
      color: #fff;
      font-size: .65rem;
      font-weight: 700;
      padding: .1rem .4rem;
      border-radius: 9999px;
    }
    .rp-tool__form {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .rp-tool__report { flex: 1; overflow-y: auto; padding: 1.25rem 1.5rem; }
    .rp-tool__actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: .75rem;
      border-top: 1px solid #e5e7eb;
    }
    .rp-tool__save-status { font-size: .8rem; color: #9ca3af; display: flex; align-items: center; gap: .4rem; }
    .rp-section {
      background: #f9fafb;
      border-radius: .875rem;
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: .75rem;
    }
    .rp-section__header { display: flex; align-items: center; justify-content: space-between; }
    .rp-section__title { margin: 0; font-size: .9rem; font-weight: 700; color: #111827; }
    .rp-section__hint { margin: -.25rem 0 0; font-size: .8rem; color: #9ca3af; }
    .rp-field { display: flex; flex-direction: column; gap: .375rem; }
    .rp-field__label { font-size: .8rem; font-weight: 600; color: #374151; }
    .rp-field__textarea {
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
    .rp-field__textarea:focus { border-color: #f59e0b; }
    .rp-field__input {
      width: 100%;
      border: 1px solid #e5e7eb;
      border-radius: .4rem;
      padding: .4rem .625rem;
      font-size: .8rem;
      font-family: inherit;
      outline: none;
      background: #fff;
      box-sizing: border-box;
      transition: border-color .15s;
    }
    .rp-field__input:focus { border-color: #f59e0b; }
    .rp-two-col { display: flex; gap: .75rem; }
    .rp-two-col .rp-field { flex: 1; }
    .rp-empty {
      padding: .75rem;
      background: #fff;
      border-radius: .625rem;
      border: 1px dashed #e5e7eb;
    }
    .rp-empty p { margin: 0; font-size: .8rem; color: #9ca3af; }
    .rp-fases-ejemplo {
      display: flex;
      align-items: center;
      gap: .5rem;
      flex-wrap: wrap;
    }
    .rp-fase-ejemplo {
      padding: .3rem .75rem;
      background: #fef3c7;
      border: 1px solid #fcd34d;
      border-radius: .375rem;
      font-size: .75rem;
      font-weight: 600;
      color: #92400e;
    }
    .rp-arrow { color: #9ca3af; font-size: .75rem; }
    .rp-fase {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-left: 3px solid #f59e0b;
      border-radius: .75rem;
      padding: .875rem;
      display: flex;
      flex-direction: column;
      gap: .625rem;
    }
    .rp-fase__header { display: flex; align-items: center; gap: .5rem; }
    .rp-fase__num {
      width: 1.625rem;
      height: 1.625rem;
      border-radius: 50%;
      background: #f59e0b;
      color: #fff;
      font-size: .75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .rp-fase__nombre {
      flex: 1;
      border: 1px solid #e5e7eb;
      border-radius: .4rem;
      padding: .375rem .625rem;
      font-size: .875rem;
      font-weight: 600;
      font-family: inherit;
      outline: none;
      background: #f9fafb;
      transition: border-color .15s;
    }
    .rp-fase__nombre:focus { border-color: #f59e0b; background: #fff; }
    .rp-fase__semanas {
      width: 8rem;
      flex-shrink: 0;
      border: 1px solid #e5e7eb;
      border-radius: .4rem;
      padding: .375rem .625rem;
      font-size: .8rem;
      font-family: inherit;
      outline: none;
      background: #fef3c7;
      color: #92400e;
      transition: border-color .15s;
    }
    .rp-fase__semanas:focus { border-color: #f59e0b; }
    .rp-fase__objetivo {
      width: 100%;
      border: 1px solid #e5e7eb;
      border-radius: .4rem;
      padding: .4rem .625rem;
      font-size: .8rem;
      font-family: inherit;
      resize: none;
      outline: none;
      background: #f9fafb;
      box-sizing: border-box;
      transition: border-color .15s;
    }
    .rp-fase__objetivo:focus { border-color: #f59e0b; background: #fff; }
    .rp-prototipos {
      display: flex;
      flex-direction: column;
      gap: .5rem;
      padding-left: .625rem;
      border-left: 2px solid #e5e7eb;
      margin-left: .25rem;
    }
    .rp-proto {
      display: flex;
      flex-direction: column;
      gap: .375rem;
      padding: .625rem;
      background: #f9fafb;
      border-radius: .5rem;
      border: 1px solid #e5e7eb;
      transition: opacity .15s;
    }
    .rp-proto--completado { opacity: .55; }
    .rp-proto__line { display: flex; align-items: center; gap: .5rem; }
    .rp-check { display: flex; align-items: center; cursor: pointer; }
    .rp-check input { cursor: pointer; accent-color: #f59e0b; width: 1rem; height: 1rem; }
    .rp-proto__input {
      flex: 1;
      border: 1px solid #e5e7eb;
      border-radius: .375rem;
      padding: .3rem .5rem;
      font-size: .8rem;
      font-family: inherit;
      outline: none;
      background: #fff;
      transition: border-color .15s;
    }
    .rp-proto__input:focus { border-color: #f59e0b; }
    .rp-proto__input--nombre { font-weight: 600; flex: 2; }
    .rp-proto__select {
      border: 1px solid #e5e7eb;
      border-radius: .375rem;
      padding: .3rem .4rem;
      font-size: .75rem;
      font-family: inherit;
      outline: none;
      background: #fff;
      cursor: pointer;
      transition: border-color .15s;
    }
    .rp-proto__select:focus { border-color: #f59e0b; }
    .rp-proto__meta { display: flex; gap: .5rem; }
    .rp-proto__meta .rp-proto__input { flex: 1; }
    .rp-btn-add-proto {
      display: flex;
      align-items: center;
      gap: .375rem;
      padding: .35rem .75rem;
      border-radius: .375rem;
      border: 1px dashed #d1d5db;
      background: transparent;
      color: #9ca3af;
      font-size: .8rem;
      cursor: pointer;
      transition: all .15s;
      align-self: flex-start;
    }
    .rp-btn-add-proto:hover { border-color: #f59e0b; color: #f59e0b; background: #fffbeb; }
    .rp-feature {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: .625rem;
      padding: .75rem;
      display: flex;
      flex-direction: column;
      gap: .5rem;
    }
    .rp-feature__header { display: flex; align-items: center; gap: .5rem; }
    .rp-feature__fields { display: flex; gap: .5rem; }
    .rp-feature__fields .rp-field__input { flex: 1; }
    .rp-prio-btns { display: flex; gap: .25rem; flex: 1; }
    .rp-prio-btn {
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
    .rp-prio-btn--alta { border-color: #ef4444; background: #fef2f2; color: #dc2626; font-weight: 700; }
    .rp-prio-btn--media { border-color: #f59e0b; background: #fffbeb; color: #b45309; font-weight: 700; }
    .rp-prio-btn--baja { border-color: #10b981; background: #d1fae5; color: #065f46; font-weight: 700; }
    .rp-action-btn {
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
    .rp-action-btn--danger:hover { color: #ef4444; border-color: #fecaca; background: #fef2f2; }
    .rp-chips { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; }
    .rp-chip {
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
    .rp-chip--warn { background: #fffbeb; border-color: #fcd34d; color: #92400e; }
    .rp-chip__remove {
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
    .rp-chip__remove:hover { opacity: 1; }
    .rp-chips__input {
      border: none;
      outline: none;
      font-size: .8rem;
      color: #374151;
      background: transparent;
      min-width: 8rem;
    }
    .rp-btn {
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
    .rp-btn--primary { background: #f59e0b; color: #fff; }
    .rp-btn--primary:hover:not(:disabled) { background: #d97706; }
    .rp-btn--primary:disabled { opacity: .5; cursor: not-allowed; }
    .rp-btn--ghost { background: transparent; color: #f59e0b; border: 1px solid #f59e0b; padding: .35rem .75rem; font-size: .8rem; }
    .rp-btn--ghost:hover { background: #fffbeb; }
  `],
})
export class RoadmapPrototipadoToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly roadmapPrototipadoService = inject(RoadmapPrototipadoService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<RoadmapPrototipadoData>({ ...EMPTY_ROADMAP_PROTOTIPADO });
  reports = signal<RoadmapPrototipadoReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  activeView = signal<'form' | 'report'>('form');

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly fidelidadOptions = Object.entries(FIDELIDAD_CONFIG).map(([value, cfg]) => ({ value, label: cfg.label }));
  readonly propositoOptions = Object.entries(PROPOSITO_CONFIG).map(([value, cfg]) => ({ value, label: cfg.label }));

  canGenerate = computed(() => {
    const d = this.data();
    return !!d.contexto.trim() && d.fases.length >= 1 && d.fases.some(f => f.prototipos.length >= 1);
  });

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;
    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as RoadmapPrototipadoData | undefined;
    this.data.set(stored ? { ...EMPTY_ROADMAP_PROTOTIPADO, ...stored } : { ...EMPTY_ROADMAP_PROTOTIPADO });
    this.reports.set((raw['reports'] as RoadmapPrototipadoReportVersionDto[]) ?? []);
  }

  patch(partial: Partial<RoadmapPrototipadoData>): void {
    this.data.set({ ...this.data(), ...partial });
    this.scheduleSave();
  }

  // Restricciones
  addRestriccion(value: string): void {
    const v = value.trim();
    if (!v) return;
    this.patch({ restricciones: [...this.data().restricciones, v] });
  }

  removeRestriccion(index: number): void {
    const arr = [...this.data().restricciones];
    arr.splice(index, 1);
    this.patch({ restricciones: arr });
  }

  // Fases
  addFase(): void {
    const fase: FaseDto = { id: crypto.randomUUID(), nombre: '', semanas: '', objetivo: '', prototipos: [] };
    this.patch({ fases: [...this.data().fases, fase] });
  }

  updateFase(id: string, field: keyof FaseDto, value: string): void {
    const fases = this.data().fases.map(f => f.id === id ? { ...f, [field]: value } : f);
    this.patch({ fases });
  }

  removeFase(id: string): void {
    this.patch({ fases: this.data().fases.filter(f => f.id !== id) });
  }

  // Prototipos dentro de fases
  addProto(faseId: string): void {
    const proto: PrototipoDto = {
      id: crypto.randomUUID(), nombre: '', fidelidad: 'low', proposito: 'explorar',
      herramienta: '', entregable: '', completado: false,
    };
    const fases = this.data().fases.map(f =>
      f.id === faseId ? { ...f, prototipos: [...f.prototipos, proto] } : f
    );
    this.patch({ fases });
  }

  updateProto(faseId: string, protoId: string, field: keyof PrototipoDto, value: string | boolean | PropositoPrototipo): void {
    const fases = this.data().fases.map(f => {
      if (f.id !== faseId) return f;
      return { ...f, prototipos: f.prototipos.map(p => p.id === protoId ? { ...p, [field]: value } : p) };
    });
    this.patch({ fases });
  }

  removeProto(faseId: string, protoId: string): void {
    const fases = this.data().fases.map(f => {
      if (f.id !== faseId) return f;
      return { ...f, prototipos: f.prototipos.filter(p => p.id !== protoId) };
    });
    this.patch({ fases });
  }

  // Features
  addFeature(): void {
    const feat: FeaturePrioridadDto = { id: crypto.randomUUID(), nombre: '', prioridad: 'alta', fase: '', razon: '' };
    this.patch({ features: [...this.data().features, feat] });
  }

  updateFeature(id: string, field: keyof FeaturePrioridadDto, value: string | PrioridadFeature): void {
    const features = this.data().features.map(f => f.id === id ? { ...f, [field]: value } : f);
    this.patch({ features });
  }

  removeFeature(id: string): void {
    this.patch({ features: this.data().features.filter(f => f.id !== id) });
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
      const res = await this.roadmapPrototipadoService.analyze({
        toolApplicationId: app.id,
        currentVersion: this.reports().length,
        data: this.data(),
      });
      const newVersion: RoadmapPrototipadoReportVersionDto = { version: res.version, generatedAt: res.generatedAt, report: res.report };
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
