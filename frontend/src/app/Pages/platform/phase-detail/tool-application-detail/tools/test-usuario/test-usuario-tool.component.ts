import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { TestUsuarioService } from '@core/services/testUsuarioService/test-usuario.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { TestUsuarioReportComponent } from './test-usuario-report.component';
import {
  EMPTY_TEST_USUARIO,
  ExitoTarea,
  SesionTestDto,
  TareaObservadaDto,
  TIPO_OPTIONS,
  TestUsuarioData,
  TestUsuarioReportVersionDto,
} from './test-usuario.types';

@Component({
  selector: 'app-test-usuario-tool',
  standalone: true,
  imports: [FormsModule, TestUsuarioReportComponent],
  template: `
    <div class="tu">

      <!-- Header -->
      <div class="tu__header">
        <div class="tu__header-left">
          <div class="tu__badge"><i class="pi pi-eye"></i></div>
          <div class="tu__title-block">
            <span class="tu__title">Test de Usuario</span>
            <span class="tu__subtitle">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              } @else {
                {{ data().sesiones.length }} sesión{{ data().sesiones.length !== 1 ? 'es' : '' }} · {{ totalTareas() }} tarea{{ totalTareas() !== 1 ? 's' : '' }} observadas
              }
            </span>
          </div>
        </div>
        <div class="tu__header-actions">
          <button
            class="tu__btn tu__btn--ghost"
            (click)="showReport.set(!showReport())"
            [class.tu__btn--active]="showReport()"
          >
            @if (showReport()) {
              <i class="pi pi-arrow-left"></i> Formulario
            } @else {
              <i class="pi pi-chart-bar"></i>
              Informes {{ reports().length ? '(' + reports().length + ')' : '' }}
            }
          </button>
          <button
            class="tu__btn tu__btn--primary"
            (click)="generateReport()"
            [disabled]="!canGenerate() || analyzing()"
            [title]="!canGenerate() ? 'Agregá al menos 1 sesión con 1 tarea para analizar' : 'Generar análisis con IA'"
          >
            @if (analyzing()) {
              <i class="pi pi-spin pi-spinner"></i> Analizando...
            } @else {
              <i class="pi pi-sparkles"></i> Analizar
            }
          </button>
        </div>
      </div>

      @if (showReport()) {
        <app-test-usuario-report [reports]="reports()" />
      } @else {
        <div class="tu__body">

          <!-- Contexto -->
          <div class="tu__section">
            <div class="tu__section-title">
              <i class="pi pi-info-circle tu__section-icon"></i>
              Contexto del Test
            </div>
            <div class="tu__field">
              <label class="tu__label">Objetivos del test</label>
              <textarea
                class="tu__textarea"
                rows="2"
                placeholder="¿Qué queremos descubrir? ¿Qué hipótesis de diseño queremos validar o refutar?"
                [ngModel]="data().objetivos"
                (ngModelChange)="updateField('objetivos', $event)"
              ></textarea>
            </div>
            <div class="tu__field">
              <label class="tu__label">Prototipo / URL</label>
              <input
                class="tu__input"
                type="text"
                placeholder="Ej: Link de Figma, versión de la app, descripción del prototipo usado"
                [ngModel]="data().prototipo"
                (ngModelChange)="updateField('prototipo', $event)"
              />
            </div>
          </div>

          <!-- Sesiones -->
          <div class="tu__section tu__section--sesiones">
            <div class="tu__section-header">
              <div class="tu__section-title">
                <i class="pi pi-users tu__section-icon"></i>
                Sesiones de Testing
                @if (data().sesiones.length) {
                  <span class="tu__count">{{ data().sesiones.length }}</span>
                }
                <span class="tu__hint">5 usuarios encuentran ~85% de los problemas</span>
              </div>
              <button class="tu__btn-add" (click)="addSesion()">
                <i class="pi pi-plus"></i> Agregar sesión
              </button>
            </div>

            @for (sesion of data().sesiones; track sesion.id; let si = $index) {
              <div class="tu__sesion">

                <!-- Sesión header -->
                <div class="tu__sesion-header">
                  <div class="tu__sesion-num">{{ si + 1 }}</div>
                  <div class="tu__sesion-meta">
                    <input
                      class="tu__sesion-name"
                      type="text"
                      placeholder="Nombre / alias del participante"
                      [ngModel]="sesion.participante"
                      (ngModelChange)="updateSesion(si, 'participante', $event)"
                    />
                    <input
                      class="tu__sesion-perfil"
                      type="text"
                      placeholder="Perfil / rol"
                      [ngModel]="sesion.perfil"
                      (ngModelChange)="updateSesion(si, 'perfil', $event)"
                    />
                    <input
                      class="tu__sesion-fecha"
                      type="text"
                      placeholder="Fecha"
                      [ngModel]="sesion.fecha"
                      (ngModelChange)="updateSesion(si, 'fecha', $event)"
                    />
                    <select
                      class="tu__sesion-tipo"
                      [ngModel]="sesion.tipo"
                      (ngModelChange)="updateSesion(si, 'tipo', $event)"
                    >
                      @for (opt of tipoOptions; track opt.value) {
                        <option [value]="opt.value">{{ opt.label }}</option>
                      }
                    </select>
                  </div>
                  <button class="tu__sesion-remove" (click)="removeSesion(si)" title="Eliminar sesión">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>

                <!-- Tareas de la sesión -->
                <div class="tu__tareas">
                  <div class="tu__tareas-header">
                    <span class="tu__tareas-label">
                      <i class="pi pi-list-check"></i>
                      Tareas observadas
                    </span>
                    <button class="tu__btn-add-sm" (click)="addTarea(si)">
                      <i class="pi pi-plus"></i> Tarea
                    </button>
                  </div>

                  @for (tarea of sesion.tareas; track tarea.id; let ti = $index) {
                    <div class="tu__tarea">
                      <div class="tu__tarea-row">
                        <input
                          class="tu__tarea-nombre"
                          type="text"
                          placeholder="Nombre de la tarea (ej: Completar checkout)"
                          [ngModel]="tarea.nombre"
                          (ngModelChange)="updateTarea(si, ti, 'nombre', $event)"
                        />
                        <div class="tu__exito-btns">
                          <button
                            class="tu__exito-btn tu__exito-btn--si"
                            [class.tu__exito-btn--active]="tarea.exito === 'si'"
                            (click)="toggleExito(si, ti, 'si')"
                            title="Completó"
                          >✅</button>
                          <button
                            class="tu__exito-btn tu__exito-btn--parcial"
                            [class.tu__exito-btn--active]="tarea.exito === 'parcial'"
                            (click)="toggleExito(si, ti, 'parcial')"
                            title="Parcial"
                          >⚠️</button>
                          <button
                            class="tu__exito-btn tu__exito-btn--no"
                            [class.tu__exito-btn--active]="tarea.exito === 'no'"
                            (click)="toggleExito(si, ti, 'no')"
                            title="No completó"
                          >❌</button>
                        </div>
                        <input
                          class="tu__tarea-tiempo"
                          type="number"
                          min="0"
                          placeholder="s"
                          [ngModel]="tarea.tiempoSegundos ?? ''"
                          (ngModelChange)="updateTareaNumber(si, ti, $event)"
                          title="Tiempo en segundos"
                        />
                        <button class="tu__tarea-remove" (click)="removeTarea(si, ti)" title="Eliminar tarea">
                          <i class="pi pi-times"></i>
                        </button>
                      </div>
                      <textarea
                        class="tu__textarea tu__textarea--sm"
                        rows="1"
                        placeholder="¿Qué hizo el usuario? ¿Dónde se confundió? ¿Qué dijo mientras ejecutaba la tarea?"
                        [ngModel]="tarea.observaciones"
                        (ngModelChange)="updateTarea(si, ti, 'observaciones', $event)"
                      ></textarea>
                    </div>
                  }

                  @if (sesion.tareas.length === 0) {
                    <div class="tu__tareas-empty">
                      <i class="pi pi-plus-circle"></i>
                      <span>Agregá las tareas que observaste en esta sesión</span>
                    </div>
                  }
                </div>

                <!-- Hallazgos + citas -->
                <div class="tu__sesion-sintesis">
                  <div class="tu__field">
                    <label class="tu__label"><i class="pi pi-align-left"></i> Hallazgos de la sesión</label>
                    <textarea
                      class="tu__textarea tu__textarea--sm"
                      rows="2"
                      placeholder="Comportamiento no verbal, patrones, contradicciones, lo que sorprendió..."
                      [ngModel]="sesion.hallazgos"
                      (ngModelChange)="updateSesion(si, 'hallazgos', $event)"
                    ></textarea>
                  </div>
                  <div class="tu__field">
                    <label class="tu__label"><i class="pi pi-quote-right"></i> Citas destacadas</label>
                    <div class="tu__citas-list">
                      @for (c of sesion.citas; track $index; let ci = $index) {
                        <div class="tu__cita-item">
                          <i class="pi pi-quote-left tu__cita-icon"></i>
                          <span class="tu__cita-text">{{ c }}</span>
                          <button class="tu__cita-remove" (click)="removeCita(si, ci)">
                            <i class="pi pi-times"></i>
                          </button>
                        </div>
                      }
                    </div>
                    <div class="tu__input-row">
                      <input
                        class="tu__input tu__input--italic"
                        type="text"
                        placeholder='"Nunca supe que había que hacer clic ahí..."'
                        [ngModel]="newCita()[si] ?? ''"
                        (ngModelChange)="setNewCita(si, $event)"
                        (keydown.enter)="addCita(si)"
                      />
                      <button
                        class="tu__add-btn"
                        (click)="addCita(si)"
                        [disabled]="!(newCita()[si]?.trim())"
                      >
                        <i class="pi pi-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            }

            @if (data().sesiones.length === 0) {
              <div class="tu__empty">
                <i class="pi pi-plus-circle"></i>
                <span>Agregá la primera sesión para empezar a registrar el test</span>
              </div>
            }
          </div>

          <!-- Notas generales -->
          <div class="tu__section">
            <div class="tu__section-title">
              <i class="pi pi-align-left tu__section-icon"></i>
              Notas Generales
            </div>
            <textarea
              class="tu__textarea"
              rows="3"
              placeholder="Contexto del test, condiciones generales, anomalías o información que afecte la interpretación..."
              [ngModel]="data().notas"
              (ngModelChange)="updateField('notas', $event)"
            ></textarea>
          </div>

        </div>
      }
    </div>
  `,
  styles: [`
    .tu {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* ─── Header ──────────────────────────────────────────────────────── */
    .tu__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--p-surface-200);
      flex-shrink: 0;
    }

    .tu__header-left { display: flex; align-items: center; gap: 10px; }

    .tu__badge {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #d1fae5;
      color: #059669;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      flex-shrink: 0;
    }

    .tu__title-block { display: flex; flex-direction: column; gap: 1px; }

    .tu__title {
      font-family: 'Syne', sans-serif;
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--p-text-color);
      line-height: 1.2;
    }

    .tu__subtitle {
      font-size: 0.72rem;
      color: var(--p-text-muted-color);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .tu__header-actions { display: flex; align-items: center; gap: 8px; }

    /* ─── Buttons ─────────────────────────────────────────────────────── */
    .tu__btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 0.8125rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      border: 1px solid transparent;
      transition: opacity 0.15s, background 0.15s;
      white-space: nowrap;
    }

    .tu__btn .pi { font-size: 0.8rem; }
    .tu__btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .tu__btn--ghost {
      background: transparent;
      border-color: var(--p-surface-300);
      color: var(--p-text-secondary-color);
    }

    .tu__btn--ghost:hover:not(:disabled) { background: var(--p-surface-100); }
    .tu__btn--ghost.tu__btn--active { background: #ecfdf5; border-color: #a7f3d0; color: #059669; }

    .tu__btn--primary { background: #059669; color: white; border-color: #059669; }
    .tu__btn--primary:hover:not(:disabled) { opacity: 0.9; }

    .tu__btn-add {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 12px;
      border-radius: 8px;
      border: 1px solid #a7f3d0;
      background: #ecfdf5;
      color: #059669;
      font-size: 0.75rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: background 0.15s;
    }

    .tu__btn-add .pi { font-size: 0.7rem; }
    .tu__btn-add:hover { background: #d1fae5; }

    .tu__btn-add-sm {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px solid #a7f3d0;
      background: #ecfdf5;
      color: #059669;
      font-size: 0.68rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: background 0.15s;
    }

    .tu__btn-add-sm:hover { background: #d1fae5; }

    /* ─── Body ────────────────────────────────────────────────────────── */
    .tu__body { display: flex; flex-direction: column; gap: 20px; }

    /* ─── Sections ────────────────────────────────────────────────────── */
    .tu__section { display: flex; flex-direction: column; gap: 10px; }

    .tu__section--sesiones {
      background: var(--p-surface-50);
      border: 1px solid var(--p-surface-200);
      border-radius: 12px;
      padding: 14px;
    }

    .tu__section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .tu__section-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: 'Syne', sans-serif;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--p-text-secondary-color);
    }

    .tu__section-icon { color: #059669; font-size: 0.8rem; }

    .tu__count {
      background: #059669;
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 10px;
      line-height: 1.6;
    }

    .tu__hint {
      font-size: 0.67rem;
      color: var(--p-text-muted-color);
      font-family: inherit;
      text-transform: none;
      letter-spacing: 0;
      font-weight: 400;
    }

    /* ─── Fields ──────────────────────────────────────────────────────── */
    .tu__field { display: flex; flex-direction: column; gap: 5px; }

    .tu__label {
      font-size: 0.78rem;
      color: #6b7280;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .tu__label .pi { font-size: 0.68rem; color: #059669; }

    .tu__input {
      width: 100%;
      padding: 7px 10px;
      border-radius: 8px;
      border: 1px solid var(--p-surface-300);
      font-size: 0.875rem;
      background: var(--p-surface-0);
      color: var(--p-text-color);
      outline: none;
      font-family: inherit;
      box-sizing: border-box;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .tu__input:focus { border-color: #059669; box-shadow: 0 0 0 2px rgba(5, 150, 105, 0.15); }
    .tu__input::placeholder { color: #9ca3af; }
    .tu__input--italic { font-style: italic; font-size: 0.8rem; }

    .tu__textarea {
      width: 100%;
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid var(--p-surface-300);
      font-size: 0.82rem;
      background: var(--p-surface-0);
      color: var(--p-text-color);
      outline: none;
      resize: vertical;
      font-family: inherit;
      line-height: 1.5;
      box-sizing: border-box;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .tu__textarea:focus { border-color: #059669; box-shadow: 0 0 0 2px rgba(5, 150, 105, 0.15); }
    .tu__textarea::placeholder { color: #9ca3af; }
    .tu__textarea--sm { font-size: 0.78rem; }

    /* ─── Session cards ───────────────────────────────────────────────── */
    .tu__sesion {
      background: var(--p-surface-0);
      border: 1px solid var(--p-surface-200);
      border-left: 3px solid #a7f3d0;
      border-radius: 10px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .tu__sesion-header {
      display: flex;
      gap: 10px;
      align-items: flex-start;
    }

    .tu__sesion-num {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #d1fae5;
      color: #059669;
      font-size: 0.7rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 2px;
      font-family: 'Syne', sans-serif;
    }

    .tu__sesion-meta {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 1fr 110px 130px;
      gap: 6px;
    }

    .tu__sesion-name, .tu__sesion-perfil, .tu__sesion-fecha, .tu__sesion-tipo {
      padding: 6px 10px;
      border-radius: 7px;
      border: 1px solid var(--p-surface-200);
      font-size: 0.8rem;
      background: var(--p-surface-50);
      color: var(--p-text-color);
      outline: none;
      font-family: inherit;
      box-sizing: border-box;
      transition: border-color 0.15s;
    }

    .tu__sesion-name { font-weight: 600; }
    .tu__sesion-name::placeholder, .tu__sesion-perfil::placeholder, .tu__sesion-fecha::placeholder { color: #9ca3af; font-weight: 400; }
    .tu__sesion-name:focus, .tu__sesion-perfil:focus, .tu__sesion-fecha:focus, .tu__sesion-tipo:focus { border-color: #059669; }

    .tu__sesion-remove {
      background: none;
      border: none;
      cursor: pointer;
      color: #9ca3af;
      font-size: 0.75rem;
      padding: 4px;
      border-radius: 4px;
      flex-shrink: 0;
      transition: color 0.15s, background 0.15s;
    }

    .tu__sesion-remove:hover { color: #ef4444; background: #fef2f2; }

    /* ─── Task observations ───────────────────────────────────────────── */
    .tu__tareas {
      background: var(--p-surface-50);
      border-radius: 8px;
      border: 1px solid var(--p-surface-200);
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .tu__tareas-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .tu__tareas-label {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.68rem;
      font-weight: 600;
      color: var(--p-text-muted-color);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .tu__tareas-label .pi { font-size: 0.65rem; color: #059669; }

    .tu__tarea {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .tu__tarea-row {
      display: flex;
      gap: 5px;
      align-items: center;
    }

    .tu__tarea-nombre {
      flex: 1;
      padding: 5px 8px;
      border-radius: 6px;
      border: 1px solid var(--p-surface-200);
      font-size: 0.78rem;
      font-weight: 500;
      background: var(--p-surface-0);
      color: var(--p-text-color);
      outline: none;
      font-family: inherit;
      transition: border-color 0.15s;
    }

    .tu__tarea-nombre::placeholder { color: #9ca3af; font-weight: 400; }
    .tu__tarea-nombre:focus { border-color: #059669; }

    .tu__exito-btns {
      display: flex;
      gap: 2px;
      flex-shrink: 0;
    }

    .tu__exito-btn {
      width: 26px;
      height: 26px;
      border-radius: 5px;
      border: 1px solid var(--p-surface-200);
      background: var(--p-surface-50);
      cursor: pointer;
      font-size: 0.7rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
      opacity: 0.45;
    }

    .tu__exito-btn:hover { opacity: 0.8; }
    .tu__exito-btn--active { opacity: 1; border-color: transparent; }
    .tu__exito-btn--si.tu__exito-btn--active { background: #d1fae5; }
    .tu__exito-btn--parcial.tu__exito-btn--active { background: #fef9c3; }
    .tu__exito-btn--no.tu__exito-btn--active { background: #fee2e2; }

    .tu__tarea-tiempo {
      width: 54px;
      padding: 5px 6px;
      border-radius: 6px;
      border: 1px solid var(--p-surface-200);
      font-size: 0.75rem;
      font-weight: 600;
      background: var(--p-surface-0);
      color: var(--p-text-color);
      outline: none;
      font-family: inherit;
      text-align: center;
      flex-shrink: 0;
      transition: border-color 0.15s;
    }

    .tu__tarea-tiempo::placeholder { color: #d1d5db; font-weight: 400; }
    .tu__tarea-tiempo:focus { border-color: #059669; }

    .tu__tarea-remove {
      background: none;
      border: none;
      cursor: pointer;
      color: #9ca3af;
      font-size: 0.68rem;
      padding: 3px;
      border-radius: 4px;
      flex-shrink: 0;
      transition: color 0.15s;
    }

    .tu__tarea-remove:hover { color: #ef4444; }

    .tu__tareas-empty {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 10px;
      border: 1px dashed #a7f3d0;
      border-radius: 6px;
      color: #059669;
      font-size: 0.75rem;
    }

    .tu__tareas-empty .pi { font-size: 0.9rem; }

    /* ─── Session synthesis ───────────────────────────────────────────── */
    .tu__sesion-sintesis { display: flex; flex-direction: column; gap: 10px; }

    /* ─── Quotes ──────────────────────────────────────────────────────── */
    .tu__citas-list { display: flex; flex-direction: column; gap: 4px; }

    .tu__cita-item {
      display: flex;
      align-items: flex-start;
      gap: 7px;
      padding: 6px 10px;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 7px;
      font-size: 0.78rem;
      color: #065f46;
      font-style: italic;
      line-height: 1.5;
    }

    .tu__cita-icon { color: #059669; font-size: 0.65rem; flex-shrink: 0; margin-top: 3px; }
    .tu__cita-text { flex: 1; }

    .tu__cita-remove {
      background: none;
      border: none;
      cursor: pointer;
      color: #6ee7b7;
      font-size: 0.62rem;
      padding: 2px;
      flex-shrink: 0;
      transition: color 0.15s;
      line-height: 1;
    }

    .tu__cita-remove:hover { color: #ef4444; }

    /* ─── Input row ───────────────────────────────────────────────────── */
    .tu__input-row { display: flex; gap: 6px; align-items: center; }

    .tu__add-btn {
      width: 28px;
      height: 28px;
      border-radius: 7px;
      border: none;
      background: #059669;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 0.72rem;
      transition: opacity 0.15s;
    }

    .tu__add-btn:hover:not(:disabled) { opacity: 0.85; }
    .tu__add-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    /* ─── Empty ───────────────────────────────────────────────────────── */
    .tu__empty {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      border: 1px dashed #a7f3d0;
      border-radius: 8px;
      color: #059669;
      font-size: 0.8rem;
    }

    .tu__empty .pi { font-size: 1rem; }
  `],
})
export class TestUsuarioToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly testUsuarioService = inject(TestUsuarioService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  // ─── Estado ─────────────────────────────────────────────────────────────────
  data = signal<TestUsuarioData>({ ...EMPTY_TEST_USUARIO });
  reports = signal<TestUsuarioReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  // Map: sessionIdx → newCita text
  newCita = signal<Record<number, string | undefined>>({});

  readonly tipoOptions = TIPO_OPTIONS;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // ─── Computed ────────────────────────────────────────────────────────────────
  totalTareas = computed(() => this.data().sesiones.reduce((acc, s) => acc + s.tareas.length, 0));
  canGenerate = computed(() => this.data().sesiones.some(s => s.tareas.length > 0));

  // ─── Lifecycle ───────────────────────────────────────────────────────────────
  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;
    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const storedData = raw['data'] as TestUsuarioData | undefined;
    const storedReports = (raw['reports'] as TestUsuarioReportVersionDto[]) ?? [];
    this.data.set(storedData ? { ...EMPTY_TEST_USUARIO, ...storedData } : { ...EMPTY_TEST_USUARIO });
    this.reports.set(storedReports);
  }

  // ─── Context fields ──────────────────────────────────────────────────────────
  updateField(field: 'objetivos' | 'prototipo' | 'notas', value: string): void {
    this.data.set({ ...this.data(), [field]: value });
    this.scheduleSave();
  }

  // ─── Sesiones ────────────────────────────────────────────────────────────────
  addSesion(): void {
    const nueva: SesionTestDto = {
      id: crypto.randomUUID(),
      participante: '',
      perfil: '',
      fecha: '',
      tipo: 'moderado',
      tareas: [],
      hallazgos: '',
      citas: [],
    };
    this.data.set({ ...this.data(), sesiones: [...this.data().sesiones, nueva] });
    this.scheduleSave();
  }

  removeSesion(index: number): void {
    const arr = [...this.data().sesiones];
    arr.splice(index, 1);
    this.data.set({ ...this.data(), sesiones: arr });
    this.scheduleSave();
  }

  updateSesion(index: number, field: keyof Omit<SesionTestDto, 'id' | 'tareas' | 'citas'>, value: string): void {
    const sesiones = this.data().sesiones.map((s, i) => i === index ? { ...s, [field]: value } : s);
    this.data.set({ ...this.data(), sesiones });
    this.scheduleSave();
  }

  // ─── Tareas ──────────────────────────────────────────────────────────────────
  addTarea(sesionIdx: number): void {
    const nueva: TareaObservadaDto = {
      id: crypto.randomUUID(),
      nombre: '',
      exito: null,
      tiempoSegundos: null,
      observaciones: '',
    };
    const sesiones = this.data().sesiones.map((s, i) =>
      i === sesionIdx ? { ...s, tareas: [...s.tareas, nueva] } : s
    );
    this.data.set({ ...this.data(), sesiones });
    this.scheduleSave();
  }

  removeTarea(sesionIdx: number, tareaIdx: number): void {
    const sesiones = this.data().sesiones.map((s, i) => {
      if (i !== sesionIdx) return s;
      const tareas = [...s.tareas];
      tareas.splice(tareaIdx, 1);
      return { ...s, tareas };
    });
    this.data.set({ ...this.data(), sesiones });
    this.scheduleSave();
  }

  updateTarea(sesionIdx: number, tareaIdx: number, field: 'nombre' | 'observaciones', value: string): void {
    const sesiones = this.data().sesiones.map((s, si) => {
      if (si !== sesionIdx) return s;
      const tareas = s.tareas.map((t, ti) => ti === tareaIdx ? { ...t, [field]: value } : t);
      return { ...s, tareas };
    });
    this.data.set({ ...this.data(), sesiones });
    this.scheduleSave();
  }

  updateTareaNumber(sesionIdx: number, tareaIdx: number, value: string | number): void {
    const parsed = value === '' || value === null ? null : Number(value);
    const val = parsed === null || isNaN(parsed) ? null : parsed;
    const sesiones = this.data().sesiones.map((s, si) => {
      if (si !== sesionIdx) return s;
      const tareas = s.tareas.map((t, ti) => ti === tareaIdx ? { ...t, tiempoSegundos: val } : t);
      return { ...s, tareas };
    });
    this.data.set({ ...this.data(), sesiones });
    this.scheduleSave();
  }

  toggleExito(sesionIdx: number, tareaIdx: number, value: ExitoTarea): void {
    const sesiones = this.data().sesiones.map((s, si) => {
      if (si !== sesionIdx) return s;
      const tareas = s.tareas.map((t, ti) => {
        if (ti !== tareaIdx) return t;
        return { ...t, exito: t.exito === value ? null : value };
      });
      return { ...s, tareas };
    });
    this.data.set({ ...this.data(), sesiones });
    this.scheduleSave();
  }

  // ─── Citas ───────────────────────────────────────────────────────────────────
  setNewCita(sesionIdx: number, value: string): void {
    this.newCita.set({ ...this.newCita(), [sesionIdx]: value });
  }

  addCita(sesionIdx: number): void {
    const trimmed = (this.newCita()[sesionIdx] ?? '').trim();
    if (!trimmed) return;
    const sesiones = this.data().sesiones.map((s, i) =>
      i === sesionIdx ? { ...s, citas: [...s.citas, trimmed] } : s
    );
    this.data.set({ ...this.data(), sesiones });
    this.newCita.set({ ...this.newCita(), [sesionIdx]: '' });
    this.scheduleSave();
  }

  removeCita(sesionIdx: number, citaIdx: number): void {
    const sesiones = this.data().sesiones.map((s, i) => {
      if (i !== sesionIdx) return s;
      const citas = [...s.citas];
      citas.splice(citaIdx, 1);
      return { ...s, citas };
    });
    this.data.set({ ...this.data(), sesiones });
    this.scheduleSave();
  }

  // ─── Generate report ─────────────────────────────────────────────────────────
  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;

    this.analyzing.set(true);
    try {
      const result = await this.testUsuarioService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });

      const newVersion: TestUsuarioReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };

      const updatedReports = [newVersion, ...this.reports()];
      this.reports.set(updatedReports);
      await this.persistData(updatedReports);
      this.showReport.set(true);
      this.uiDialog.showSuccess('Análisis generado', 'El análisis del test de usuario fue generado correctamente.');
    } catch (error) {
      this.uiDialog.showError('Error', `No se pudo generar el análisis: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      this.analyzing.set(false);
    }
  }

  // ─── Helpers privados ────────────────────────────────────────────────────────
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

  private async persistData(reports: TestUsuarioReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
