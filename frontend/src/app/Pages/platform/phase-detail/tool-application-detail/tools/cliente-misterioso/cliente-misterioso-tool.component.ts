import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { ClienteMisteriosoService } from '@core/services/clienteMisteriosoService/cliente-misterioso.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { ClienteMisteriosoReportComponent } from './cliente-misterioso-report.component';
import {
  CANAL_ICONS,
  CANAL_LABELS,
  EMPTY_CLIENTE_MISTERIOSO,
  EMPTY_ISSUE,
  EMPTY_PASO,
  EMPTY_VISITA,
  IMPACTO_COLORS,
  ClienteMisteriosoData,
  ClienteMisteriosoReportVersionDto,
  CanalMisterioso,
  ImpactoIssue,
  IssueDto,
  PasoVisitaDto,
  VisitaMisteriosaDto,
} from './cliente-misterioso.types';

@Component({
  selector: 'app-cliente-misterioso-tool',
  standalone: true,
  imports: [FormsModule, ClienteMisteriosoReportComponent],
  template: `
    <div class="cm">

      <!-- Header -->
      <div class="cm__header">
        <div class="cm__header-left">
          <div class="cm__badge">
            <i class="pi pi-eye-slash"></i>
          </div>
          <div class="cm__title-block">
            <span class="cm__title">Cliente Misterioso</span>
            <span class="cm__subtitle">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              } @else {
                {{ data().visitas.length }} visita{{ data().visitas.length === 1 ? '' : 's' }} documentada{{ data().visitas.length === 1 ? '' : 's' }}
              }
            </span>
          </div>
        </div>
        <div class="cm__header-actions">
          <button
            class="cm__btn cm__btn--ghost"
            (click)="toggleReport()"
            [class.cm__btn--active]="showReport()"
          >
            <i class="pi pi-chart-bar"></i>
            Informes {{ reports().length ? '(' + reports().length + ')' : '' }}
          </button>
          <button
            class="cm__btn cm__btn--primary"
            (click)="generateReport()"
            [disabled]="!canGenerate() || analyzing()"
            [title]="!canGenerate() ? 'Documentá al menos 1 visita con issues o pasos para analizar' : 'Generar análisis con IA'"
          >
            @if (analyzing()) {
              <i class="pi pi-spin pi-spinner"></i> Analizando...
            } @else {
              <i class="pi pi-sparkles"></i> Analizar
            }
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="cm__content">
        @if (showReport()) {
          <app-cliente-misterioso-report [reports]="reports()" />
        } @else {
          <div class="cm__body">

            <!-- Planificación -->
            <div class="cm__section">
              <div class="cm__section-header">
                <i class="pi pi-map-marker cm__section-icon"></i>
                <span class="cm__section-title">Planificación</span>
              </div>
              <div class="cm__context-grid">
                <div class="cm__field cm__field--full">
                  <label class="cm__field-label">Objetivo de la Evaluación</label>
                  <textarea
                    class="cm__field-textarea"
                    placeholder="¿Qué queremos evaluar con este mystery shop? ¿Qué problema o hipótesis queremos validar?"
                    [ngModel]="data().objetivo"
                    (ngModelChange)="updateField('objetivo', $event)"
                    rows="2"
                  ></textarea>
                </div>
                <div class="cm__field cm__field--full">
                  <label class="cm__field-label">Criterios de Evaluación</label>
                  <textarea
                    class="cm__field-textarea"
                    placeholder="¿Qué áreas evaluamos? Ej: tiempo de respuesta, facilidad de uso, calidad de atención, consistencia entre canales..."
                    [ngModel]="data().criterios"
                    (ngModelChange)="updateField('criterios', $event)"
                    rows="2"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Visitas -->
            <div class="cm__section cm__section--visitas">
              <div class="cm__section-header">
                <i class="pi pi-user-secret cm__section-icon"></i>
                <span class="cm__section-title">Visitas Mystery Shop</span>
                @if (data().visitas.length) {
                  <span class="cm__count">{{ data().visitas.length }}</span>
                }
                <button class="cm__btn-add" (click)="addVisita()">
                  <i class="pi pi-plus"></i> Nueva visita
                </button>
              </div>

              @for (v of data().visitas; track v.id; let vi = $index) {
                <div class="cm__visita" [class.cm__visita--filled]="v.issues.length > 0 || v.pasos.length > 0">

                  <!-- Visita header -->
                  <div class="cm__visita-header">
                    <div class="cm__visita-canal-badge">
                      <i [class]="'pi ' + getCanalIcon(v.canal)"></i>
                      <span>{{ getCanalLabel(v.canal) }}</span>
                    </div>
                    <select
                      class="cm__canal-select"
                      [ngModel]="v.canal"
                      (ngModelChange)="updateVisita(vi, 'canal', $event)"
                    >
                      @for (entry of canalOptions; track entry.value) {
                        <option [value]="entry.value">{{ entry.label }}</option>
                      }
                    </select>
                    <input
                      class="cm__fecha-input"
                      type="text"
                      placeholder="Fecha y hora"
                      [ngModel]="v.fecha"
                      (ngModelChange)="updateVisita(vi, 'fecha', $event)"
                    />
                    <div class="cm__score-wrap">
                      <span class="cm__score-label">Score</span>
                      <div class="cm__score-stars">
                        @for (s of [1,2,3,4,5]; track s) {
                          <button
                            class="cm__star"
                            [class.cm__star--active]="v.scoreGeneral >= s"
                            (click)="updateVisita(vi, 'scoreGeneral', s)"
                          >★</button>
                        }
                      </div>
                      <span class="cm__score-num">{{ v.scoreGeneral }}/5</span>
                    </div>
                    <button class="cm__visita-remove" (click)="removeVisita(vi)" title="Eliminar visita">
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>

                  <!-- Escenario -->
                  <div class="cm__field">
                    <label class="cm__field-label">Escenario / Tarea ejecutada</label>
                    <input
                      class="cm__field-input"
                      type="text"
                      placeholder="Ej: Usuario nuevo intenta crear cuenta y realizar primera compra"
                      [ngModel]="v.escenario"
                      (ngModelChange)="updateVisita(vi, 'escenario', $event)"
                    />
                  </div>

                  <div class="cm__visita-body">
                    <!-- Pasos -->
                    <div class="cm__sub-section">
                      <div class="cm__sub-header">
                        <i class="pi pi-list cm__sub-icon"></i>
                        <span class="cm__sub-title">Pasos Realizados</span>
                        @if (v.pasos.length) {
                          <span class="cm__count cm__count--small">{{ v.pasos.length }}</span>
                        }
                        <button class="cm__btn-add-sm" (click)="addPaso(vi)">
                          <i class="pi pi-plus"></i> Paso
                        </button>
                      </div>

                      @for (p of v.pasos; track p.id; let pi = $index) {
                        <div class="cm__paso">
                          <span class="cm__paso-num">{{ pi + 1 }}</span>
                          <input
                            class="cm__paso-desc"
                            type="text"
                            placeholder="Descripción del paso..."
                            [ngModel]="p.descripcion"
                            (ngModelChange)="updatePaso(vi, pi, 'descripcion', $event)"
                          />
                          <input
                            class="cm__paso-tiempo"
                            type="text"
                            placeholder="Tiempo"
                            [ngModel]="p.tiempoDesc"
                            (ngModelChange)="updatePaso(vi, pi, 'tiempoDesc', $event)"
                          />
                          <input
                            class="cm__paso-notas"
                            type="text"
                            placeholder="Notas / observaciones..."
                            [ngModel]="p.notas"
                            (ngModelChange)="updatePaso(vi, pi, 'notas', $event)"
                          />
                          <button class="cm__paso-remove" (click)="removePaso(vi, pi)">
                            <i class="pi pi-times"></i>
                          </button>
                        </div>
                      }

                      @if (v.pasos.length === 0) {
                        <div class="cm__sub-empty">Documentá los pasos realizados durante la visita</div>
                      }
                    </div>

                    <!-- Issues -->
                    <div class="cm__sub-section">
                      <div class="cm__sub-header">
                        <i class="pi pi-exclamation-circle cm__sub-icon"></i>
                        <span class="cm__sub-title">Issues Encontrados</span>
                        @if (v.issues.length) {
                          <span class="cm__count cm__count--small">{{ v.issues.length }}</span>
                        }
                        <button class="cm__btn-add-sm cm__btn-add-sm--issue" (click)="addIssue(vi)">
                          <i class="pi pi-plus"></i> Issue
                        </button>
                      </div>

                      @for (issue of v.issues; track issue.id; let ii = $index) {
                        <div class="cm__issue">
                          <select
                            class="cm__issue-impacto"
                            [ngModel]="issue.impacto"
                            (ngModelChange)="updateIssue(vi, ii, 'impacto', $event)"
                            [style.border-color]="getImpactoColor(issue.impacto)"
                          >
                            <option value="alto">Alto</option>
                            <option value="medio">Medio</option>
                            <option value="bajo">Bajo</option>
                          </select>
                          <input
                            class="cm__issue-area"
                            type="text"
                            placeholder="Área (UX, Atención...)"
                            [ngModel]="issue.area"
                            (ngModelChange)="updateIssue(vi, ii, 'area', $event)"
                          />
                          <input
                            class="cm__issue-desc"
                            type="text"
                            placeholder="Descripción del problema encontrado..."
                            [ngModel]="issue.descripcion"
                            (ngModelChange)="updateIssue(vi, ii, 'descripcion', $event)"
                          />
                          <button class="cm__issue-remove" (click)="removeIssue(vi, ii)">
                            <i class="pi pi-times"></i>
                          </button>
                        </div>
                      }

                      @if (v.issues.length === 0) {
                        <div class="cm__sub-empty">Documentá los problemas o fricciones encontrados</div>
                      }
                    </div>
                  </div>

                  <!-- Observaciones de la visita -->
                  <div class="cm__field">
                    <label class="cm__field-label">Observaciones Generales de la Visita</label>
                    <textarea
                      class="cm__field-textarea cm__field-textarea--sm"
                      placeholder="Lo que no encaja en los pasos ni issues: sensaciones, contexto, comparaciones..."
                      [ngModel]="v.observaciones"
                      (ngModelChange)="updateVisita(vi, 'observaciones', $event)"
                      rows="2"
                    ></textarea>
                  </div>

                </div>
              }

              @if (data().visitas.length === 0) {
                <div class="cm__visitas-empty">
                  <i class="pi pi-eye-slash"></i>
                  <span>Agregá la primera visita para documentar tu mystery shop</span>
                </div>
              }
            </div>

            <!-- Síntesis -->
            <div class="cm__section">
              <div class="cm__section-header">
                <i class="pi pi-eye cm__section-icon"></i>
                <span class="cm__section-title">Síntesis y Observaciones</span>
              </div>
              <div class="cm__field">
                <label class="cm__field-label">Observaciones Generales</label>
                <textarea
                  class="cm__field-textarea"
                  placeholder="Patrones que cruzaron canales o visitas, lo más sorprendente, comparaciones con benchmarks..."
                  [ngModel]="data().observacionesGenerales"
                  (ngModelChange)="updateField('observacionesGenerales', $event)"
                  rows="3"
                ></textarea>
              </div>
            </div>

          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    .cm {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 12px;
    }

    /* ─── Header ───────────────────────────────────────────────────── */
    .cm__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-shrink: 0;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--p-surface-200);
    }

    .cm__header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .cm__badge {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
      flex-shrink: 0;
    }

    .cm__title {
      display: block;
      font-weight: 700;
      font-size: 15px;
      color: var(--p-surface-900);
    }

    .cm__subtitle {
      display: block;
      font-size: 12px;
      color: var(--p-surface-500);
      margin-top: 2px;
    }

    .cm__header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    /* ─── Buttons ───────────────────────────────────────────────────── */
    .cm__btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.15s;
    }

    .cm__btn--ghost {
      background: transparent;
      border: 1px solid var(--p-surface-300);
      color: var(--p-surface-600);
    }

    .cm__btn--ghost:hover {
      background: var(--p-surface-100);
    }

    .cm__btn--active {
      background: var(--p-violet-50);
      border-color: var(--p-violet-200);
      color: var(--p-violet-700);
    }

    .cm__btn--primary {
      background: var(--p-violet-500);
      color: white;
    }

    .cm__btn--primary:hover:not(:disabled) {
      background: var(--p-violet-600);
    }

    .cm__btn--primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .cm__btn-add {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      background: var(--p-violet-50);
      border: 1px solid var(--p-violet-200);
      color: var(--p-violet-700);
      transition: all 0.15s;
      margin-left: auto;
    }

    .cm__btn-add:hover {
      background: var(--p-violet-100);
    }

    .cm__btn-add-sm {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: 5px;
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      background: var(--p-surface-100);
      border: 1px solid var(--p-surface-300);
      color: var(--p-surface-600);
      transition: all 0.15s;
      margin-left: auto;
    }

    .cm__btn-add-sm:hover {
      background: var(--p-surface-200);
    }

    .cm__btn-add-sm--issue {
      background: var(--p-red-50);
      border-color: var(--p-red-200);
      color: var(--p-red-600);
    }

    .cm__btn-add-sm--issue:hover {
      background: var(--p-red-100);
    }

    /* ─── Content ───────────────────────────────────────────────────── */
    .cm__content {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
    }

    .cm__body {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* ─── Sections ──────────────────────────────────────────────────── */
    .cm__section {
      background: var(--p-surface-50);
      border: 1px solid var(--p-surface-200);
      border-radius: 12px;
      padding: 16px;
    }

    .cm__section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 14px;
      flex-wrap: wrap;
    }

    .cm__section-icon {
      color: var(--p-violet-500);
      font-size: 15px;
    }

    .cm__section-title {
      font-weight: 600;
      font-size: 14px;
      color: var(--p-surface-800);
    }

    .cm__count {
      background: var(--p-violet-100);
      color: var(--p-violet-700);
      border-radius: 10px;
      padding: 2px 8px;
      font-size: 11px;
      font-weight: 600;
    }

    .cm__count--small {
      font-size: 10px;
      padding: 1px 6px;
    }

    /* ─── Fields ────────────────────────────────────────────────────── */
    .cm__context-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .cm__field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .cm__field--full {
      width: 100%;
    }

    .cm__field-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--p-surface-600);
    }

    .cm__field-input {
      width: 100%;
      padding: 8px 10px;
      border: 1px solid var(--p-surface-300);
      border-radius: 8px;
      font-size: 13px;
      background: white;
      color: var(--p-surface-800);
      outline: none;
      transition: border-color 0.15s;
      box-sizing: border-box;
    }

    .cm__field-input:focus {
      border-color: var(--p-violet-400);
    }

    .cm__field-textarea {
      width: 100%;
      padding: 8px 10px;
      border: 1px solid var(--p-surface-300);
      border-radius: 8px;
      font-size: 13px;
      background: white;
      color: var(--p-surface-800);
      outline: none;
      resize: vertical;
      transition: border-color 0.15s;
      box-sizing: border-box;
      font-family: inherit;
    }

    .cm__field-textarea:focus {
      border-color: var(--p-violet-400);
    }

    .cm__field-textarea--sm {
      resize: none;
    }

    /* ─── Visitas ───────────────────────────────────────────────────── */
    .cm__visita {
      border: 1px solid var(--p-surface-200);
      border-radius: 10px;
      padding: 14px;
      margin-top: 10px;
      background: white;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: border-color 0.15s;
    }

    .cm__visita--filled {
      border-color: var(--p-violet-200);
    }

    .cm__visita-header {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .cm__visita-canal-badge {
      display: flex;
      align-items: center;
      gap: 5px;
      background: var(--p-violet-50);
      border: 1px solid var(--p-violet-200);
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 600;
      color: var(--p-violet-700);
      white-space: nowrap;
      min-width: 140px;
    }

    .cm__canal-select {
      flex: 1;
      min-width: 140px;
      padding: 6px 10px;
      border: 1px solid var(--p-surface-300);
      border-radius: 8px;
      font-size: 13px;
      background: white;
      color: var(--p-surface-700);
      outline: none;
      cursor: pointer;
    }

    .cm__canal-select:focus {
      border-color: var(--p-violet-400);
    }

    .cm__fecha-input {
      flex: 1;
      min-width: 120px;
      padding: 6px 10px;
      border: 1px solid var(--p-surface-300);
      border-radius: 8px;
      font-size: 13px;
      background: white;
      color: var(--p-surface-700);
      outline: none;
      transition: border-color 0.15s;
    }

    .cm__fecha-input:focus {
      border-color: var(--p-violet-400);
    }

    .cm__score-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .cm__score-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--p-surface-500);
    }

    .cm__score-stars {
      display: flex;
      gap: 2px;
    }

    .cm__star {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: var(--p-surface-300);
      padding: 0;
      line-height: 1;
      transition: color 0.1s;
    }

    .cm__star--active {
      color: var(--p-yellow-400);
    }

    .cm__star:hover {
      color: var(--p-yellow-400);
    }

    .cm__score-num {
      font-size: 12px;
      font-weight: 600;
      color: var(--p-surface-600);
      min-width: 28px;
    }

    .cm__visita-remove {
      padding: 6px 10px;
      border-radius: 6px;
      background: transparent;
      border: 1px solid var(--p-red-200);
      color: var(--p-red-400);
      cursor: pointer;
      font-size: 13px;
      transition: all 0.15s;
      flex-shrink: 0;
    }

    .cm__visita-remove:hover {
      background: var(--p-red-50);
      color: var(--p-red-600);
    }

    .cm__visita-body {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    /* ─── Sub-sections (pasos e issues) ────────────────────────────── */
    .cm__sub-section {
      background: var(--p-surface-50);
      border: 1px solid var(--p-surface-200);
      border-radius: 8px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .cm__sub-header {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .cm__sub-icon {
      font-size: 13px;
      color: var(--p-surface-500);
    }

    .cm__sub-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--p-surface-600);
    }

    .cm__sub-empty {
      font-size: 12px;
      color: var(--p-surface-400);
      text-align: center;
      padding: 8px;
    }

    /* ─── Pasos ─────────────────────────────────────────────────────── */
    .cm__paso {
      display: grid;
      grid-template-columns: 20px 1fr 80px 1fr 24px;
      gap: 6px;
      align-items: center;
    }

    .cm__paso-num {
      font-size: 11px;
      font-weight: 700;
      color: var(--p-surface-500);
      text-align: center;
      background: var(--p-surface-100);
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .cm__paso-desc {
      padding: 5px 8px;
      border: 1px solid var(--p-surface-300);
      border-radius: 6px;
      font-size: 12px;
      background: white;
      color: var(--p-surface-800);
      outline: none;
    }

    .cm__paso-desc:focus {
      border-color: var(--p-violet-300);
    }

    .cm__paso-tiempo {
      padding: 5px 8px;
      border: 1px solid var(--p-surface-300);
      border-radius: 6px;
      font-size: 12px;
      background: white;
      color: var(--p-surface-600);
      outline: none;
      text-align: center;
    }

    .cm__paso-tiempo:focus {
      border-color: var(--p-violet-300);
    }

    .cm__paso-notas {
      padding: 5px 8px;
      border: 1px solid var(--p-surface-300);
      border-radius: 6px;
      font-size: 12px;
      background: white;
      color: var(--p-surface-600);
      outline: none;
    }

    .cm__paso-notas:focus {
      border-color: var(--p-violet-300);
    }

    .cm__paso-remove {
      background: none;
      border: none;
      color: var(--p-surface-400);
      cursor: pointer;
      padding: 2px;
      border-radius: 4px;
      font-size: 11px;
      transition: color 0.15s;
    }

    .cm__paso-remove:hover {
      color: var(--p-red-400);
    }

    /* ─── Issues ────────────────────────────────────────────────────── */
    .cm__issue {
      display: grid;
      grid-template-columns: 70px 80px 1fr 24px;
      gap: 6px;
      align-items: center;
    }

    .cm__issue-impacto {
      padding: 4px 6px;
      border: 2px solid var(--p-surface-300);
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      background: white;
      color: var(--p-surface-700);
      outline: none;
      cursor: pointer;
    }

    .cm__issue-area {
      padding: 5px 8px;
      border: 1px solid var(--p-surface-300);
      border-radius: 6px;
      font-size: 12px;
      background: white;
      color: var(--p-surface-600);
      outline: none;
    }

    .cm__issue-area:focus {
      border-color: var(--p-violet-300);
    }

    .cm__issue-desc {
      padding: 5px 8px;
      border: 1px solid var(--p-surface-300);
      border-radius: 6px;
      font-size: 12px;
      background: white;
      color: var(--p-surface-800);
      outline: none;
    }

    .cm__issue-desc:focus {
      border-color: var(--p-violet-300);
    }

    .cm__issue-remove {
      background: none;
      border: none;
      color: var(--p-surface-400);
      cursor: pointer;
      padding: 2px;
      border-radius: 4px;
      font-size: 11px;
      transition: color 0.15s;
    }

    .cm__issue-remove:hover {
      color: var(--p-red-400);
    }

    /* ─── Empty states ──────────────────────────────────────────────── */
    .cm__visitas-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 32px;
      color: var(--p-surface-400);
      font-size: 13px;
      text-align: center;
      border: 1px dashed var(--p-surface-300);
      border-radius: 8px;
      margin-top: 10px;
    }

    .cm__visitas-empty i {
      font-size: 28px;
      opacity: 0.4;
    }

    /* ─── Responsive ────────────────────────────────────────────────── */
    @media (max-width: 640px) {
      .cm__visita-body {
        grid-template-columns: 1fr;
      }
      .cm__visita-canal-badge {
        display: none;
      }
      .cm__paso {
        grid-template-columns: 20px 1fr 24px;
      }
      .cm__paso-tiempo, .cm__paso-notas {
        display: none;
      }
      .cm__issue {
        grid-template-columns: 70px 1fr 24px;
      }
      .cm__issue-area {
        display: none;
      }
    }
  `],
})
export class ClienteMisteriosoToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly clienteMisteriosoService = inject(ClienteMisteriosoService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<ClienteMisteriosoData>({ ...EMPTY_CLIENTE_MISTERIOSO });
  reports = signal<ClienteMisteriosoReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly canalOptions = Object.entries(CANAL_LABELS).map(([value, label]) => ({
    value: value as CanalMisterioso,
    label,
  }));

  canGenerate = computed(() =>
    this.data().visitas.some(v => v.issues.length > 0 || v.pasos.length > 0)
  );

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;

    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as ClienteMisteriosoData | undefined;
    const storedReports = (raw['reports'] as ClienteMisteriosoReportVersionDto[]) ?? [];

    this.data.set(stored ?? { ...EMPTY_CLIENTE_MISTERIOSO });
    this.reports.set(storedReports);
  }

  toggleReport(): void {
    this.showReport.set(!this.showReport());
  }

  // ─── Field updates ──────────────────────────────────────────────────────────

  updateField(field: keyof ClienteMisteriosoData, value: unknown): void {
    this.data.set({ ...this.data(), [field]: value });
    this.scheduleSave();
  }

  // ─── Visitas ────────────────────────────────────────────────────────────────

  addVisita(): void {
    this.data.set({ ...this.data(), visitas: [...this.data().visitas, EMPTY_VISITA()] });
    this.scheduleSave();
  }

  removeVisita(index: number): void {
    this.data.set({ ...this.data(), visitas: this.data().visitas.filter((_, i) => i !== index) });
    this.scheduleSave();
  }

  updateVisita(index: number, field: keyof VisitaMisteriosaDto, value: unknown): void {
    const visitas = this.data().visitas.map((v, i) =>
      i === index ? { ...v, [field]: value } : v
    );
    this.data.set({ ...this.data(), visitas });
    this.scheduleSave();
  }

  // ─── Pasos ──────────────────────────────────────────────────────────────────

  addPaso(visitaIndex: number): void {
    const visitas = this.data().visitas.map((v, i) =>
      i === visitaIndex ? { ...v, pasos: [...v.pasos, EMPTY_PASO()] } : v
    );
    this.data.set({ ...this.data(), visitas });
    this.scheduleSave();
  }

  removePaso(visitaIndex: number, pasoIndex: number): void {
    const visitas = this.data().visitas.map((v, i) =>
      i === visitaIndex ? { ...v, pasos: v.pasos.filter((_, pi) => pi !== pasoIndex) } : v
    );
    this.data.set({ ...this.data(), visitas });
    this.scheduleSave();
  }

  updatePaso(visitaIndex: number, pasoIndex: number, field: keyof PasoVisitaDto, value: unknown): void {
    const visitas = this.data().visitas.map((v, i) => {
      if (i !== visitaIndex) return v;
      const pasos = v.pasos.map((p, pi) =>
        pi === pasoIndex ? { ...p, [field]: value } : p
      );
      return { ...v, pasos };
    });
    this.data.set({ ...this.data(), visitas });
    this.scheduleSave();
  }

  // ─── Issues ─────────────────────────────────────────────────────────────────

  addIssue(visitaIndex: number): void {
    const visitas = this.data().visitas.map((v, i) =>
      i === visitaIndex ? { ...v, issues: [...v.issues, EMPTY_ISSUE()] } : v
    );
    this.data.set({ ...this.data(), visitas });
    this.scheduleSave();
  }

  removeIssue(visitaIndex: number, issueIndex: number): void {
    const visitas = this.data().visitas.map((v, i) =>
      i === visitaIndex ? { ...v, issues: v.issues.filter((_, ii) => ii !== issueIndex) } : v
    );
    this.data.set({ ...this.data(), visitas });
    this.scheduleSave();
  }

  updateIssue(visitaIndex: number, issueIndex: number, field: keyof IssueDto, value: unknown): void {
    const visitas = this.data().visitas.map((v, i) => {
      if (i !== visitaIndex) return v;
      const issues = v.issues.map((issue, ii) =>
        ii === issueIndex ? { ...issue, [field]: value } : issue
      );
      return { ...v, issues };
    });
    this.data.set({ ...this.data(), visitas });
    this.scheduleSave();
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  getCanalLabel(canal: CanalMisterioso): string {
    return CANAL_LABELS[canal] ?? canal;
  }

  getCanalIcon(canal: CanalMisterioso): string {
    return CANAL_ICONS[canal] ?? 'pi-wrench';
  }

  getImpactoColor(impacto: ImpactoIssue): string {
    return IMPACTO_COLORS[impacto] ?? '#6b7280';
  }

  // ─── AI analysis ────────────────────────────────────────────────────────────

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;

    this.analyzing.set(true);
    try {
      const result = await this.clienteMisteriosoService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });

      const newVersion: ClienteMisteriosoReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };

      const updated = [newVersion, ...this.reports()];
      this.reports.set(updated);
      await this.persistData(updated);
      this.showReport.set(true);
      this.uiDialog.showSuccess('Informe generado', 'El análisis fue generado correctamente.');
    } catch (error) {
      this.uiDialog.showError('Error', `No se pudo generar el informe: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      this.analyzing.set(false);
    }
  }

  // ─── Persistence ────────────────────────────────────────────────────────────

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

  private async persistData(reports: ClienteMisteriosoReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
