import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { MvpService } from '@core/services/mvpService/mvp.service';
import { MvpReportComponent } from './mvp-report.component';
import {
  AprendizajeDto,
  CATEGORIA_CONFIG,
  EMPTY_MVP,
  FeatureMvpDto,
  MvpData,
  MvpReportVersionDto,
  TIPOS_MVP,
  ValorEsfuerzo,
  calcularCategoria,
} from './mvp.types';

@Component({
  selector: 'app-mvp-tool',
  standalone: true,
  imports: [FormsModule, MvpReportComponent],
  template: `
    <div class="mvp-tool">
      <!-- Header -->
      <div class="mvp-tool__header">
        <div class="mvp-tool__badge">MVP</div>
        <div>
          <h2 class="mvp-tool__title">Mínimo Producto Viable</h2>
          <p class="mvp-tool__subtitle">Definí qué buildear primero — validá rápido, aprendé más</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mvp-tool__tabs">
        <button class="mvp-tool__tab" [class.mvp-tool__tab--active]="activeView() === 'form'" (click)="activeView.set('form')">
          <i class="pi pi-rocket"></i> MVP
        </button>
        <button class="mvp-tool__tab" [class.mvp-tool__tab--active]="activeView() === 'report'" (click)="activeView.set('report')">
          <i class="pi pi-chart-line"></i> Análisis
          @if (reports().length > 0) {
            <span class="mvp-tool__tab-badge">{{ reports().length }}</span>
          }
        </button>
      </div>

      @if (activeView() === 'form') {
        <div class="mvp-tool__form">

          <!-- Hipótesis y tipo -->
          <div class="mvp-section">
            <h3 class="mvp-section__title">Hipótesis y tipo de MVP</h3>

            <div class="mvp-field">
              <label class="mvp-field__label">Hipótesis principal a validar</label>
              <textarea
                class="mvp-field__textarea"
                rows="2"
                placeholder="Ej: Creemos que los dueños de restaurantes pagarán $30/mes por una app que automatice sus reservas, porque hoy las gestionan manualmente por teléfono y pierden clientes."
                [ngModel]="data().hipotesisPrincipal"
                (ngModelChange)="patch({ hipotesisPrincipal: $event })"
              ></textarea>
            </div>

            <div class="mvp-field">
              <label class="mvp-field__label">Tipo de MVP</label>
              <div class="mvp-tipos">
                @for (t of tiposMvp; track t.value) {
                  <button
                    class="mvp-tipo-btn"
                    [class.mvp-tipo-btn--active]="data().tipo === t.value"
                    (click)="patch({ tipo: t.value })"
                    [title]="t.descripcion"
                  >{{ t.label }}</button>
                }
              </div>
            </div>

            <div class="mvp-field">
              <label class="mvp-field__label">Core feature — la única cosa que debe funcionar</label>
              <textarea
                class="mvp-field__textarea"
                rows="2"
                placeholder="Ej: El usuario puede crear una reserva eligiendo fecha, hora y cantidad de personas. Solo eso. Nada más."
                [ngModel]="data().coreFeature"
                (ngModelChange)="patch({ coreFeature: $event })"
              ></textarea>
            </div>
          </div>

          <!-- Matriz de features -->
          <div class="mvp-section">
            <div class="mvp-section__header">
              <h3 class="mvp-section__title">Priorización de features</h3>
              <button class="mvp-btn mvp-btn--ghost" (click)="addFeature()">
                <i class="pi pi-plus"></i> Agregar feature
              </button>
            </div>
            <p class="mvp-section__hint">Clasificá cada feature según su valor para el usuario y el esfuerzo de implementación.</p>

            @if (data().features.length === 0) {
              <div class="mvp-empty">
                <div class="mvp-matriz-legend">
                  <div class="mvp-legend-item mvp-legend-item--mvp">MVP ✓ Alto valor + Bajo esfuerzo</div>
                  <div class="mvp-legend-item mvp-legend-item--later">Later — Alto valor + Alto esfuerzo</div>
                  <div class="mvp-legend-item mvp-legend-item--mandatory">Mandatory — Bajo valor + Bajo esfuerzo</div>
                  <div class="mvp-legend-item mvp-legend-item--drop">Drop — Bajo valor + Alto esfuerzo</div>
                </div>
              </div>
            }

            @for (feat of data().features; track feat.id) {
              <div class="mvp-feature" [style.border-color]="categoriaConfig(feat).border" [style.background]="feat.incluida ? 'white' : '#fafafa'">
                <div class="mvp-feature__header">
                  <span class="mvp-categoria-badge" [style.color]="categoriaConfig(feat).color" [style.background]="categoriaConfig(feat).bg" [style.border-color]="categoriaConfig(feat).border">
                    {{ categoriaConfig(feat).label }}
                  </span>
                  <label class="mvp-toggle">
                    <input type="checkbox" [ngModel]="feat.incluida" (ngModelChange)="updateFeature(feat.id, 'incluida', $event)" />
                    <span class="mvp-toggle__label">{{ feat.incluida ? 'Incluida' : 'Excluida' }}</span>
                  </label>
                  <button class="mvp-action-btn mvp-action-btn--danger" (click)="removeFeature(feat.id)">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>

                <input
                  class="mvp-input"
                  type="text"
                  placeholder="Nombre de la feature"
                  [ngModel]="feat.nombre"
                  (ngModelChange)="updateFeature(feat.id, 'nombre', $event)"
                />

                <div class="mvp-feature__matrix">
                  <div class="mvp-matrix-group">
                    <span class="mvp-matrix-label">Valor para usuario</span>
                    <div class="mvp-matrix-btns">
                      <button class="mvp-matrix-btn" [class.mvp-matrix-btn--alto]="feat.valorUsuario === 'alto'" (click)="updateFeature(feat.id, 'valorUsuario', 'alto')">Alto</button>
                      <button class="mvp-matrix-btn" [class.mvp-matrix-btn--bajo]="feat.valorUsuario === 'bajo'" (click)="updateFeature(feat.id, 'valorUsuario', 'bajo')">Bajo</button>
                    </div>
                  </div>
                  <div class="mvp-matrix-group">
                    <span class="mvp-matrix-label">Esfuerzo de implementación</span>
                    <div class="mvp-matrix-btns">
                      <button class="mvp-matrix-btn" [class.mvp-matrix-btn--alto]="feat.esfuerzo === 'alto'" (click)="updateFeature(feat.id, 'esfuerzo', 'alto')">Alto</button>
                      <button class="mvp-matrix-btn" [class.mvp-matrix-btn--bajo]="feat.esfuerzo === 'bajo'" (click)="updateFeature(feat.id, 'esfuerzo', 'bajo')">Bajo</button>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Criterios de lanzamiento -->
          <div class="mvp-section">
            <h3 class="mvp-section__title">Criterios de lanzamiento</h3>
            <p class="mvp-section__hint">¿Qué debe cumplir el MVP para estar listo? Definilos antes de buildear.</p>
            <div class="mvp-chips">
              @for (c of data().criteriosLanzamiento; track $index) {
                <div class="mvp-chip mvp-chip--green">
                  <i class="pi pi-check" style="font-size:.65rem;"></i>
                  <span>{{ c }}</span>
                  <button class="mvp-chip__remove" (click)="removeCriterio($index)"><i class="pi pi-times"></i></button>
                </div>
              }
              <input
                class="mvp-chips__input"
                type="text"
                placeholder="+ Agregar criterio (ej: Usuario puede completar la tarea core)..."
                #criterioInput
                (keydown.enter)="addCriterio(criterioInput.value); criterioInput.value = ''"
              />
            </div>
          </div>

          <!-- Métricas y aprendizajes -->
          <div class="mvp-section">
            <h3 class="mvp-section__title">Métricas a medir</h3>
            <p class="mvp-section__hint">¿Cómo van a saber si la hipótesis se validó? Solo métricas accionables.</p>
            <div class="mvp-chips">
              @for (m of data().metricas; track $index) {
                <div class="mvp-chip">
                  <span>{{ m }}</span>
                  <button class="mvp-chip__remove" (click)="removeMetrica($index)"><i class="pi pi-times"></i></button>
                </div>
              }
              <input
                class="mvp-chips__input"
                type="text"
                placeholder="+ Agregar métrica (ej: % de usuarios que completan el onboarding)..."
                #metricaInput
                (keydown.enter)="addMetrica(metricaInput.value); metricaInput.value = ''"
              />
            </div>
          </div>

          <!-- Aprendizajes post-lanzamiento -->
          <div class="mvp-section">
            <div class="mvp-section__header">
              <h3 class="mvp-section__title">Aprendizajes (post-lanzamiento)</h3>
              <button class="mvp-btn mvp-btn--ghost" (click)="addAprendizaje()">
                <i class="pi pi-plus"></i> Agregar
              </button>
            </div>
            <p class="mvp-section__hint">Completá después de lanzar — ¿qué hipótesis se validaron?</p>

            @if (data().aprendizajes.length === 0) {
              <div class="mvp-empty">
                <p>Después de lanzar el MVP, registrá aquí qué hipótesis se validaron y cuáles no.</p>
              </div>
            }

            @for (ap of data().aprendizajes; track ap.id) {
              <div class="mvp-aprendizaje">
                <div class="mvp-aprendizaje__header">
                  <div class="mvp-validacion-btns">
                    <button class="mvp-val-btn" [class.mvp-val-btn--validada]="ap.validada === true" (click)="updateAprendizaje(ap.id, 'validada', true)">
                      <i class="pi pi-check"></i> Validada
                    </button>
                    <button class="mvp-val-btn" [class.mvp-val-btn--invalidada]="ap.validada === false" (click)="updateAprendizaje(ap.id, 'validada', false)">
                      <i class="pi pi-times"></i> Invalidada
                    </button>
                    <button class="mvp-val-btn" [class.mvp-val-btn--pendiente]="ap.validada === null" (click)="updateAprendizaje(ap.id, 'validada', null)">
                      Pendiente
                    </button>
                  </div>
                  <button class="mvp-action-btn mvp-action-btn--danger" (click)="removeAprendizaje(ap.id)">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
                <input class="mvp-input" type="text" placeholder="Hipótesis (ej: Los usuarios van a pagar $30/mes)" [ngModel]="ap.hipotesis" (ngModelChange)="updateAprendizaje(ap.id, 'hipotesis', $event)" />
                <input class="mvp-input" type="text" placeholder="Métrica observada (ej: 40 de 100 usuarios completaron el pago)" [ngModel]="ap.metrica" (ngModelChange)="updateAprendizaje(ap.id, 'metrica', $event)" />
                <textarea class="mvp-textarea" rows="2" placeholder="Resultado y análisis — qué aprendieron y qué van a cambiar" [ngModel]="ap.resultado" (ngModelChange)="updateAprendizaje(ap.id, 'resultado', $event)"></textarea>
              </div>
            }
          </div>

          <!-- Actions -->
          <div class="mvp-tool__actions">
            <div class="mvp-tool__save-status">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              }
            </div>
            <button class="mvp-btn mvp-btn--primary" [disabled]="!canGenerate() || analyzing()" (click)="analyze()">
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
        <div class="mvp-tool__report">
          <app-mvp-report [versions]="reports()" />
        </div>
      }
    </div>
  `,
  styles: [`
    .mvp-tool { display: flex; flex-direction: column; gap: 0; height: 100%; }
    .mvp-tool__header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .mvp-tool__badge {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: .75rem;
      background: #10b981;
      color: #fff;
      font-weight: 800;
      font-size: .7rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      letter-spacing: .05em;
    }
    .mvp-tool__title { margin: 0; font-size: 1.1rem; font-weight: 700; color: #111827; }
    .mvp-tool__subtitle { margin: .125rem 0 0; font-size: .8rem; color: #6b7280; }
    .mvp-tool__tabs {
      display: flex;
      gap: .25rem;
      padding: .75rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
    }
    .mvp-tool__tab {
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
    .mvp-tool__tab--active { background: #fff; color: #10b981; font-weight: 600; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
    .mvp-tool__tab-badge {
      background: #10b981;
      color: #fff;
      font-size: .65rem;
      font-weight: 700;
      padding: .1rem .4rem;
      border-radius: 9999px;
    }
    .mvp-tool__form {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .mvp-tool__report { flex: 1; overflow-y: auto; padding: 1.25rem 1.5rem; }
    .mvp-tool__actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: .75rem;
      border-top: 1px solid #e5e7eb;
    }
    .mvp-tool__save-status { font-size: .8rem; color: #9ca3af; display: flex; align-items: center; gap: .4rem; }
    .mvp-section {
      background: #f9fafb;
      border-radius: .875rem;
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: .75rem;
    }
    .mvp-section__header { display: flex; align-items: center; justify-content: space-between; }
    .mvp-section__title { margin: 0; font-size: .9rem; font-weight: 700; color: #111827; }
    .mvp-section__hint { margin: -.25rem 0 0; font-size: .8rem; color: #9ca3af; }
    .mvp-field { display: flex; flex-direction: column; gap: .375rem; }
    .mvp-field__label { font-size: .8rem; font-weight: 600; color: #374151; }
    .mvp-field__textarea {
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
    .mvp-field__textarea:focus { border-color: #10b981; }
    .mvp-tipos { display: flex; gap: .375rem; flex-wrap: wrap; }
    .mvp-tipo-btn {
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
    .mvp-tipo-btn--active { border-color: #10b981; background: #d1fae5; color: #065f46; font-weight: 700; }
    .mvp-empty {
      padding: .75rem;
      background: #fff;
      border-radius: .625rem;
      border: 1px dashed #e5e7eb;
    }
    .mvp-empty p { margin: 0; font-size: .8rem; color: #9ca3af; }
    .mvp-matriz-legend { display: flex; flex-wrap: wrap; gap: .5rem; }
    .mvp-legend-item {
      font-size: .75rem;
      font-weight: 600;
      padding: .25rem .625rem;
      border-radius: .375rem;
      border: 1px solid;
    }
    .mvp-legend-item--mvp { color: #15803d; background: #f0fdf4; border-color: #86efac; }
    .mvp-legend-item--later { color: #b45309; background: #fffbeb; border-color: #fcd34d; }
    .mvp-legend-item--mandatory { color: #0369a1; background: #e0f2fe; border-color: #7dd3fc; }
    .mvp-legend-item--drop { color: #dc2626; background: #fef2f2; border-color: #fca5a5; }
    .mvp-feature {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: .75rem;
      padding: .875rem;
      display: flex;
      flex-direction: column;
      gap: .5rem;
    }
    .mvp-feature__header { display: flex; align-items: center; gap: .5rem; }
    .mvp-categoria-badge {
      font-size: .7rem;
      font-weight: 700;
      padding: .2rem .625rem;
      border-radius: .375rem;
      border: 1px solid;
      white-space: nowrap;
    }
    .mvp-toggle { display: flex; align-items: center; gap: .375rem; cursor: pointer; margin-left: auto; }
    .mvp-toggle input { cursor: pointer; accent-color: #10b981; }
    .mvp-toggle__label { font-size: .75rem; font-weight: 600; color: #374151; }
    .mvp-feature__matrix { display: flex; gap: 1rem; }
    .mvp-matrix-group { display: flex; flex-direction: column; gap: .25rem; flex: 1; }
    .mvp-matrix-label { font-size: .7rem; font-weight: 600; color: #6b7280; }
    .mvp-matrix-btns { display: flex; gap: .25rem; }
    .mvp-matrix-btn {
      flex: 1;
      padding: .3rem;
      border-radius: .375rem;
      border: 1px solid #e5e7eb;
      background: #f9fafb;
      font-size: .75rem;
      font-weight: 500;
      color: #6b7280;
      cursor: pointer;
      transition: all .15s;
    }
    .mvp-matrix-btn--alto { border-color: #f59e0b; background: #fffbeb; color: #b45309; font-weight: 700; }
    .mvp-matrix-btn--bajo { border-color: #10b981; background: #d1fae5; color: #065f46; font-weight: 700; }
    .mvp-aprendizaje {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: .75rem;
      padding: .875rem;
      display: flex;
      flex-direction: column;
      gap: .5rem;
    }
    .mvp-aprendizaje__header { display: flex; align-items: center; gap: .5rem; }
    .mvp-validacion-btns { display: flex; gap: .25rem; flex: 1; }
    .mvp-val-btn {
      display: flex;
      align-items: center;
      gap: .25rem;
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
    .mvp-val-btn--validada { border-color: #10b981; background: #d1fae5; color: #065f46; font-weight: 700; }
    .mvp-val-btn--invalidada { border-color: #ef4444; background: #fef2f2; color: #dc2626; font-weight: 700; }
    .mvp-val-btn--pendiente { border-color: #9ca3af; background: #f3f4f6; color: #374151; font-weight: 600; }
    .mvp-action-btn {
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
    .mvp-action-btn--danger:hover { color: #ef4444; border-color: #fecaca; background: #fef2f2; }
    .mvp-input {
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
    .mvp-input:focus { border-color: #10b981; background: #fff; }
    .mvp-textarea {
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
    .mvp-textarea:focus { border-color: #10b981; background: #fff; }
    .mvp-chips { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; }
    .mvp-chip {
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
    .mvp-chip--green { background: #d1fae5; border-color: #6ee7b7; color: #065f46; }
    .mvp-chip__remove {
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
    .mvp-chip__remove:hover { opacity: 1; }
    .mvp-chips__input {
      border: none;
      outline: none;
      font-size: .8rem;
      color: #374151;
      background: transparent;
      min-width: 8rem;
    }
    .mvp-btn {
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
    .mvp-btn--primary { background: #10b981; color: #fff; }
    .mvp-btn--primary:hover:not(:disabled) { background: #059669; }
    .mvp-btn--primary:disabled { opacity: .5; cursor: not-allowed; }
    .mvp-btn--ghost { background: transparent; color: #10b981; border: 1px solid #10b981; padding: .35rem .75rem; font-size: .8rem; }
    .mvp-btn--ghost:hover { background: #d1fae5; }
  `],
})
export class MvpToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly mvpService = inject(MvpService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<MvpData>({ ...EMPTY_MVP });
  reports = signal<MvpReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  activeView = signal<'form' | 'report'>('form');

  readonly tiposMvp = TIPOS_MVP;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  categoriaConfig = (feat: FeatureMvpDto) => CATEGORIA_CONFIG[calcularCategoria(feat)];

  canGenerate = computed(() => {
    const d = this.data();
    return !!d.hipotesisPrincipal.trim() && !!d.tipo && !!d.coreFeature.trim();
  });

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;
    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as MvpData | undefined;
    this.data.set(stored ? { ...EMPTY_MVP, ...stored } : { ...EMPTY_MVP });
    this.reports.set((raw['reports'] as MvpReportVersionDto[]) ?? []);
  }

  patch(partial: Partial<MvpData>): void {
    this.data.set({ ...this.data(), ...partial });
    this.scheduleSave();
  }

  // Features
  addFeature(): void {
    const feat: FeatureMvpDto = { id: crypto.randomUUID(), nombre: '', valorUsuario: 'alto', esfuerzo: 'bajo', incluida: true };
    this.patch({ features: [...this.data().features, feat] });
  }

  updateFeature(id: string, field: keyof FeatureMvpDto, value: string | boolean | ValorEsfuerzo): void {
    const features = this.data().features.map(f => f.id === id ? { ...f, [field]: value } : f);
    this.patch({ features });
  }

  removeFeature(id: string): void {
    this.patch({ features: this.data().features.filter(f => f.id !== id) });
  }

  // Criterios
  addCriterio(value: string): void {
    const v = value.trim();
    if (!v) return;
    this.patch({ criteriosLanzamiento: [...this.data().criteriosLanzamiento, v] });
  }

  removeCriterio(index: number): void {
    const arr = [...this.data().criteriosLanzamiento];
    arr.splice(index, 1);
    this.patch({ criteriosLanzamiento: arr });
  }

  // Métricas
  addMetrica(value: string): void {
    const v = value.trim();
    if (!v) return;
    this.patch({ metricas: [...this.data().metricas, v] });
  }

  removeMetrica(index: number): void {
    const arr = [...this.data().metricas];
    arr.splice(index, 1);
    this.patch({ metricas: arr });
  }

  // Aprendizajes
  addAprendizaje(): void {
    const ap: AprendizajeDto = { id: crypto.randomUUID(), hipotesis: '', metrica: '', resultado: '', validada: null };
    this.patch({ aprendizajes: [...this.data().aprendizajes, ap] });
  }

  updateAprendizaje(id: string, field: keyof AprendizajeDto, value: string | boolean | null): void {
    const aprendizajes = this.data().aprendizajes.map(a => a.id === id ? { ...a, [field]: value } : a);
    this.patch({ aprendizajes });
  }

  removeAprendizaje(id: string): void {
    this.patch({ aprendizajes: this.data().aprendizajes.filter(a => a.id !== id) });
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
      const res = await this.mvpService.analyze({
        toolApplicationId: app.id,
        currentVersion: this.reports().length,
        data: this.data(),
      });
      const newVersion: MvpReportVersionDto = { version: res.version, generatedAt: res.generatedAt, report: res.report };
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
