import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { BuzzReportService } from '@core/services/buzzReportService/buzz-report.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { BuzzReportReportComponent } from './buzz-report-report.component';
import {
  BUZZ_REPORT_CANALES,
  BUZZ_REPORT_SENTIMENTS,
  BuzzReportCanal,
  BuzzReportData,
  BuzzReportMencion,
  BuzzReportSentiment,
  BuzzReportVersionDto,
  EMPTY_BUZZ_REPORT,
} from './buzz-report.types';

@Component({
  selector: 'app-buzz-report-tool',
  standalone: true,
  imports: [FormsModule, BuzzReportReportComponent],
  template: `
    <div class="br">

      <!-- Header -->
      <div class="br__header">
        <div class="br__header-left">
          <div class="br__badge">
            <i class="pi pi-bell"></i>
          </div>
          <div class="br__title-block">
            <span class="br__title">Buzz Report</span>
            <span class="br__subtitle">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              } @else {
                {{ data().menciones.length }} mención{{ data().menciones.length !== 1 ? 'es' : '' }} registrada{{ data().menciones.length !== 1 ? 's' : '' }}
              }
            </span>
          </div>
        </div>
        <div class="br__header-actions">
          <button
            class="br__btn br__btn--ghost"
            (click)="toggleReport()"
            [class.br__btn--active]="showReport()"
          >
            <i class="pi pi-chart-bar"></i>
            Informes {{ reports().length ? '(' + reports().length + ')' : '' }}
          </button>
          <button
            class="br__btn br__btn--primary"
            (click)="generateReport()"
            [disabled]="!canGenerate() || analyzing()"
            [title]="!canGenerate() ? 'Registrá al menos 3 menciones para analizar' : 'Generar informe con IA'"
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
      <div class="br__content">
        @if (showReport()) {
          <app-buzz-report-report [reports]="reports()" />
        } @else {
          <div class="br__body">

            <!-- Contexto -->
            <div class="br__context-strip">
              <div class="br__field">
                <label class="br__field-label">Marca / Tema</label>
                <input
                  class="br__field-input"
                  type="text"
                  placeholder="Ej: Nike Argentina, lanzamiento AirMax 2025..."
                  [ngModel]="data().marca"
                  (ngModelChange)="updateField('marca', $event)"
                />
              </div>
              <div class="br__field">
                <label class="br__field-label">Período de Monitoreo</label>
                <input
                  class="br__field-input"
                  type="text"
                  placeholder="Ej: 1-15 de marzo 2025, Q1 2025..."
                  [ngModel]="data().periodo"
                  (ngModelChange)="updateField('periodo', $event)"
                />
              </div>
            </div>

            <!-- Menciones -->
            <div class="br__section br__section--menciones">
              <div class="br__section-header">
                <i class="pi pi-comments br__section-icon"></i>
                <span class="br__section-title">Menciones</span>
                @if (data().menciones.length) {
                  <span class="br__count">{{ data().menciones.length }}</span>
                }
                <span class="br__hint">Mínimo 3 para analizar</span>

                <!-- Sentiment summary pills -->
                @if (data().menciones.length >= 3) {
                  <div class="br__sentiment-summary">
                    <span class="br__sent-pill br__sent-pill--pos">
                      {{ posCount() }} +
                    </span>
                    <span class="br__sent-pill br__sent-pill--neu">
                      {{ neuCount() }} —
                    </span>
                    <span class="br__sent-pill br__sent-pill--neg">
                      {{ negCount() }} –
                    </span>
                  </div>
                }
              </div>

              <!-- Lista de menciones -->
              @for (m of data().menciones; track m.id; let i = $index) {
                <div class="br__mencion" [class.br__mencion--pos]="m.sentiment === 'positivo'" [class.br__mencion--neg]="m.sentiment === 'negativo'" [class.br__mencion--neu]="m.sentiment === 'neutro'">
                  <div class="br__mencion-top">
                    <span
                      class="br__canal-pill"
                      [style.background-color]="getCanalConfig(m.canal).accentBg"
                      [style.color]="getCanalConfig(m.canal).accentColor"
                    >
                      <i class="pi {{ getCanalConfig(m.canal).icon }}"></i>
                      {{ getCanalConfig(m.canal).label }}
                    </span>
                    <div class="br__sentiment-toggle">
                      @for (s of sentiments; track s.value) {
                        <button
                          class="br__sentiment-btn"
                          [class.br__sentiment-btn--active]="m.sentiment === s.value"
                          [style.--s-color]="s.accentColor"
                          [style.--s-bg]="s.accentBg"
                          (click)="updateMencion(i, 'sentiment', s.value)"
                        >{{ s.label }}</button>
                      }
                    </div>
                    <button class="br__mencion-remove" (click)="removeMencion(i)" title="Eliminar">
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                  <div class="br__mencion-fields">
                    <input
                      class="br__mencion-input br__mencion-input--autor"
                      type="text"
                      placeholder="@usuario, Influencer, Medio..."
                      [ngModel]="m.autor"
                      (ngModelChange)="updateMencion(i, 'autor', $event)"
                    />
                    <textarea
                      class="br__mencion-textarea"
                      placeholder="Contenido de la mención o resumen del comentario..."
                      [ngModel]="m.contenido"
                      (ngModelChange)="updateMencion(i, 'contenido', $event)"
                      rows="2"
                    ></textarea>
                    <input
                      class="br__mencion-input"
                      type="text"
                      placeholder="Alcance / Impacto (ej: 45K impresiones, trending por 2hs...)"
                      [ngModel]="m.alcance"
                      (ngModelChange)="updateMencion(i, 'alcance', $event)"
                    />
                  </div>
                </div>
              }

              <!-- Formulario nueva mención -->
              <div class="br__new-mencion">
                <div class="br__canal-selector">
                  @for (canal of canales; track canal.value) {
                    <button
                      class="br__canal-btn"
                      [class.br__canal-btn--active]="newMencion().canal === canal.value"
                      [style.--canal-color]="canal.accentColor"
                      [style.--canal-bg]="canal.accentBg"
                      (click)="selectCanal(canal.value)"
                    >
                      <i class="pi {{ canal.icon }}"></i>
                      {{ canal.label }}
                    </button>
                  }
                </div>
                <div class="br__new-mencion-fields">
                  <div class="br__new-top-row">
                    <input
                      class="br__input br__input--autor"
                      type="text"
                      placeholder="@usuario o fuente..."
                      [ngModel]="newMencion().autor"
                      (ngModelChange)="setNewMencionField('autor', $event)"
                    />
                    <div class="br__sentiment-toggle">
                      @for (s of sentiments; track s.value) {
                        <button
                          class="br__sentiment-btn"
                          [class.br__sentiment-btn--active]="newMencion().sentiment === s.value"
                          [style.--s-color]="s.accentColor"
                          [style.--s-bg]="s.accentBg"
                          (click)="selectSentiment(s.value)"
                        >{{ s.label }}</button>
                      }
                    </div>
                  </div>
                  <textarea
                    class="br__input br__input--textarea"
                    placeholder="Contenido de la mención..."
                    [ngModel]="newMencion().contenido"
                    (ngModelChange)="setNewMencionField('contenido', $event)"
                    rows="2"
                  ></textarea>
                  <div class="br__new-bottom-row">
                    <input
                      class="br__input"
                      type="text"
                      placeholder="Alcance / Impacto..."
                      [ngModel]="newMencion().alcance"
                      (ngModelChange)="setNewMencionField('alcance', $event)"
                    />
                    <button
                      class="br__btn br__btn--add-mencion"
                      (click)="addMencion()"
                      [disabled]="!canAddMencion()"
                    >
                      <i class="pi pi-plus"></i>
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Síntesis -->
            <div class="br__section">
              <div class="br__section-header">
                <i class="pi pi-align-left br__section-icon"></i>
                <span class="br__section-title">Síntesis</span>
              </div>

              <div class="br__sintesis-grid">

                <!-- Temas recurrentes -->
                <div class="br__sintesis-block br__sintesis-block--temas">
                  <div class="br__sintesis-header">
                    <i class="pi pi-hashtag"></i>
                    <span>Temas Recurrentes</span>
                    @if (data().temasRecurrentes.length) {
                      <span class="br__sintesis-count br__sintesis-count--temas">{{ data().temasRecurrentes.length }}</span>
                    }
                  </div>
                  <ul class="br__sintesis-list">
                    @for (t of data().temasRecurrentes; track $index; let i = $index) {
                      <li class="br__sintesis-item">
                        <span class="br__sintesis-dot br__sintesis-dot--temas"></span>
                        <span class="br__sintesis-text">{{ t }}</span>
                        <button class="br__sintesis-remove" (click)="removeSintesisItem('temasRecurrentes', i)"><i class="pi pi-times"></i></button>
                      </li>
                    }
                  </ul>
                  <div class="br__input-row">
                    <input
                      class="br__input br__input--sintesis"
                      type="text"
                      placeholder="Ej: Precio elevado, problemas de entrega..."
                      [ngModel]="newSintesisTexts()['temasRecurrentes']"
                      (ngModelChange)="setNewSintesisText('temasRecurrentes', $event)"
                      (keydown.enter)="addSintesisItem('temasRecurrentes')"
                    />
                    <button class="br__add-btn br__add-btn--temas" (click)="addSintesisItem('temasRecurrentes')" [disabled]="!newSintesisTexts()['temasRecurrentes']?.trim()">
                      <i class="pi pi-plus"></i>
                    </button>
                  </div>
                </div>

                <!-- Voces influyentes -->
                <div class="br__sintesis-block br__sintesis-block--voces">
                  <div class="br__sintesis-header">
                    <i class="pi pi-megaphone"></i>
                    <span>Voces Influyentes</span>
                    @if (data().vocesInfluyentes.length) {
                      <span class="br__sintesis-count br__sintesis-count--voces">{{ data().vocesInfluyentes.length }}</span>
                    }
                  </div>
                  <ul class="br__sintesis-list">
                    @for (v of data().vocesInfluyentes; track $index; let i = $index) {
                      <li class="br__sintesis-item">
                        <span class="br__sintesis-dot br__sintesis-dot--voces"></span>
                        <span class="br__sintesis-text">{{ v }}</span>
                        <button class="br__sintesis-remove" (click)="removeSintesisItem('vocesInfluyentes', i)"><i class="pi pi-times"></i></button>
                      </li>
                    }
                  </ul>
                  <div class="br__input-row">
                    <input
                      class="br__input br__input--sintesis"
                      type="text"
                      placeholder="Ej: @influencer, periodista, experto del sector..."
                      [ngModel]="newSintesisTexts()['vocesInfluyentes']"
                      (ngModelChange)="setNewSintesisText('vocesInfluyentes', $event)"
                      (keydown.enter)="addSintesisItem('vocesInfluyentes')"
                    />
                    <button class="br__add-btn br__add-btn--voces" (click)="addSintesisItem('vocesInfluyentes')" [disabled]="!newSintesisTexts()['vocesInfluyentes']?.trim()">
                      <i class="pi pi-plus"></i>
                    </button>
                  </div>
                </div>

              </div>

              <!-- Sentiment overall -->
              <div class="br__sentiment-overall">
                <label class="br__field-label">Percepción General del Buzz</label>
                <textarea
                  class="br__field-textarea"
                  placeholder="Ej: El tono general es crítico en cuanto al servicio postventa pero muy positivo respecto al producto en sí. Se detecta frustración acumulada por demoras..."
                  [ngModel]="data().sentimentOverall"
                  (ngModelChange)="updateField('sentimentOverall', $event)"
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
    .br {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 12px;
    }

    /* ─── Header ───────────────────────────────────────────────────── */
    .br__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-shrink: 0;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--p-surface-200);
    }

    .br__header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .br__badge {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #ede9fe;
      color: #7c3aed;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      flex-shrink: 0;
    }

    .br__title-block {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .br__title {
      font-family: 'Syne', sans-serif;
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--p-text-color);
      line-height: 1.2;
    }

    .br__subtitle {
      font-size: 0.72rem;
      color: var(--p-text-muted-color);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .br__header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* ─── Buttons ──────────────────────────────────────────────────── */
    .br__btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s;
      white-space: nowrap;
    }

    .br__btn .pi { font-size: 0.8rem; }
    .br__btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .br__btn--ghost {
      background: transparent;
      border-color: var(--p-surface-300);
      color: var(--p-text-secondary-color);
    }

    .br__btn--ghost:hover:not(:disabled) { background: var(--p-surface-100); }
    .br__btn--ghost.br__btn--active { background: #fdf4ff; border-color: #e9d5ff; color: #7c3aed; }

    .br__btn--primary {
      background: #7c3aed;
      color: white;
      border-color: #7c3aed;
    }

    .br__btn--primary:hover:not(:disabled) { background: #6d28d9; }

    .br__btn--add-mencion {
      background: #7c3aed;
      color: white;
      border-color: #7c3aed;
      padding: 8px 16px;
      flex-shrink: 0;
    }

    .br__btn--add-mencion:hover:not(:disabled) { background: #6d28d9; }

    /* ─── Content ──────────────────────────────────────────────────── */
    .br__content {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
    }

    .br__body {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding-bottom: 20px;
    }

    /* ─── Context strip ────────────────────────────────────────────── */
    .br__context-strip {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .br__field {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .br__field-label {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--p-text-muted-color);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .br__field-input {
      width: 100%;
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid var(--p-surface-300);
      font-size: 0.875rem;
      background: var(--p-surface-0);
      color: var(--p-text-color);
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
      box-sizing: border-box;
    }

    .br__field-input::placeholder { color: #9ca3af; }
    .br__field-input:focus { border-color: #7c3aed; box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.15); }

    .br__field-textarea {
      width: 100%;
      padding: 8px 12px;
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

    .br__field-textarea::placeholder { color: #9ca3af; }
    .br__field-textarea:focus { border-color: #7c3aed; box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.15); }

    /* ─── Section ──────────────────────────────────────────────────── */
    .br__section {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .br__section--menciones {
      background: var(--p-surface-50);
      border-radius: 12px;
      padding: 14px;
      border: 1px solid var(--p-surface-200);
    }

    .br__section-header {
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

    .br__section-icon { color: #7c3aed; font-size: 0.8rem; }
    .br__section-title { flex: 1; }

    .br__count {
      background: #7c3aed;
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 10px;
      line-height: 1.6;
    }

    .br__hint {
      font-size: 0.67rem;
      color: var(--p-text-muted-color);
      font-family: inherit;
      text-transform: none;
      letter-spacing: 0;
      font-weight: 400;
    }

    .br__sentiment-summary {
      display: flex;
      gap: 4px;
      margin-left: auto;
    }

    .br__sent-pill {
      font-size: 0.65rem;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 10px;
      line-height: 1.5;
      font-family: inherit;
      text-transform: none;
      letter-spacing: 0;
    }

    .br__sent-pill--pos { background: #dcfce7; color: #16a34a; }
    .br__sent-pill--neu { background: #f3f4f6; color: #6b7280; }
    .br__sent-pill--neg { background: #fee2e2; color: #dc2626; }

    /* ─── Mencion card ─────────────────────────────────────────────── */
    .br__mencion {
      background: var(--p-surface-0);
      border-radius: 10px;
      border: 1px solid var(--p-surface-200);
      border-left-width: 3px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .br__mencion--pos { border-left-color: #16a34a; }
    .br__mencion--neu { border-left-color: #9ca3af; }
    .br__mencion--neg { border-left-color: #dc2626; }

    .br__mencion-top {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .br__canal-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 9px;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 600;
    }

    .br__canal-pill .pi { font-size: 0.68rem; }

    .br__sentiment-toggle {
      display: flex;
      gap: 3px;
    }

    .br__sentiment-btn {
      padding: 2px 8px;
      border-radius: 10px;
      border: 1px solid var(--p-surface-300);
      background: var(--p-surface-0);
      color: var(--p-text-muted-color);
      font-size: 0.68rem;
      cursor: pointer;
      transition: all 0.12s;
    }

    .br__sentiment-btn:hover { background: var(--s-bg, #f9fafb); color: var(--s-color, #374151); border-color: var(--s-color, #374151); }
    .br__sentiment-btn--active { background: var(--s-bg, #f9fafb); color: var(--s-color, #374151); border-color: var(--s-color, #374151); font-weight: 700; }

    .br__mencion-remove {
      margin-left: auto;
      background: none;
      border: none;
      cursor: pointer;
      color: #9ca3af;
      font-size: 0.75rem;
      padding: 4px;
      border-radius: 4px;
      transition: color 0.15s, background 0.15s;
    }

    .br__mencion-remove:hover { color: #ef4444; background: #fef2f2; }

    .br__mencion-fields {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .br__mencion-input {
      width: 100%;
      padding: 5px 9px;
      border-radius: 6px;
      border: 1px solid var(--p-surface-200);
      font-size: 0.8rem;
      background: var(--p-surface-50);
      color: var(--p-text-color);
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.15s;
    }

    .br__mencion-input--autor { font-weight: 600; }
    .br__mencion-input:focus { border-color: #7c3aed; }

    .br__mencion-textarea {
      width: 100%;
      padding: 5px 9px;
      border-radius: 6px;
      border: 1px solid var(--p-surface-200);
      font-size: 0.78rem;
      background: var(--p-surface-50);
      color: var(--p-text-color);
      outline: none;
      resize: vertical;
      font-family: inherit;
      line-height: 1.5;
      box-sizing: border-box;
      transition: border-color 0.15s;
    }

    .br__mencion-textarea:focus { border-color: #7c3aed; }

    /* ─── New mencion form ─────────────────────────────────────────── */
    .br__new-mencion {
      border: 1px dashed #c4b5fd;
      border-radius: 10px;
      padding: 12px;
      background: #fdf4ff;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .br__canal-selector {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }

    .br__canal-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 9px;
      border-radius: 20px;
      border: 1px solid var(--p-surface-300);
      background: var(--p-surface-0);
      color: var(--p-text-muted-color);
      font-size: 0.72rem;
      cursor: pointer;
      transition: all 0.15s;
    }

    .br__canal-btn .pi { font-size: 0.65rem; }
    .br__canal-btn:hover { background: var(--canal-bg, #fdf4ff); color: var(--canal-color, #7c3aed); border-color: var(--canal-color, #7c3aed); }
    .br__canal-btn--active { background: var(--canal-bg, #fdf4ff); color: var(--canal-color, #7c3aed); border-color: var(--canal-color, #7c3aed); font-weight: 600; }

    .br__new-mencion-fields {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .br__new-top-row {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .br__new-bottom-row {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .br__input {
      flex: 1;
      padding: 6px 10px;
      border-radius: 8px;
      border: 1px solid var(--p-surface-300);
      font-size: 0.8rem;
      background: rgba(255,255,255,0.8);
      color: var(--p-text-color);
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .br__input::placeholder { color: #9ca3af; }
    .br__input:focus { border-color: #7c3aed; box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.15); }

    .br__input--autor { font-weight: 600; }

    .br__input--textarea {
      resize: vertical;
      min-height: 56px;
      font-family: inherit;
    }

    .br__input--sintesis {
      border: 1px solid var(--p-surface-200);
      background: rgba(255,255,255,0.9);
    }

    .br__input-row {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .br__add-btn {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: filter 0.15s;
      font-size: 0.75rem;
    }

    .br__add-btn:hover:not(:disabled) { filter: brightness(0.9); }
    .br__add-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .br__add-btn--temas { background: #7c3aed; }
    .br__add-btn--voces { background: #db2777; }

    /* ─── Síntesis ─────────────────────────────────────────────────── */
    .br__sintesis-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .br__sintesis-block {
      border-radius: 10px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .br__sintesis-block--temas { background: #fdf4ff; border: 1px solid #e9d5ff; }
    .br__sintesis-block--voces { background: #fdf2f8; border: 1px solid #fbcfe8; }

    .br__sintesis-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .br__sintesis-header .pi { font-size: 0.7rem; }
    .br__sintesis-block--temas .br__sintesis-header { color: #7c3aed; }
    .br__sintesis-block--voces .br__sintesis-header { color: #db2777; }

    .br__sintesis-count {
      margin-left: auto;
      color: white;
      font-size: 0.63rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 10px;
      line-height: 1.6;
    }

    .br__sintesis-count--temas { background: #7c3aed; }
    .br__sintesis-count--voces { background: #db2777; }

    .br__sintesis-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }

    .br__sintesis-item {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      font-size: 0.78rem;
      color: #374151;
      line-height: 1.4;
      padding: 3px 5px;
      border-radius: 4px;
      background: rgba(255,255,255,0.6);
    }

    .br__sintesis-item:hover .br__sintesis-remove { opacity: 1; }

    .br__sintesis-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      margin-top: 4px;
      flex-shrink: 0;
    }

    .br__sintesis-dot--temas { background: #7c3aed; }
    .br__sintesis-dot--voces { background: #db2777; }

    .br__sintesis-text { flex: 1; word-break: break-word; }

    .br__sintesis-remove {
      opacity: 0;
      background: none;
      border: none;
      cursor: pointer;
      color: #9ca3af;
      padding: 0 2px;
      font-size: 0.6rem;
      flex-shrink: 0;
      transition: color 0.15s, opacity 0.15s;
      line-height: 1;
      margin-top: 2px;
    }

    .br__sintesis-remove:hover { color: #ef4444; }

    /* ─── Sentiment overall ────────────────────────────────────────── */
    .br__sentiment-overall {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
  `],
})
export class BuzzReportToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly buzzReportService = inject(BuzzReportService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  // ─── Estado ─────────────────────────────────────────────────────────────────
  data = signal<BuzzReportData>({ ...EMPTY_BUZZ_REPORT });
  reports = signal<BuzzReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  newMencion = signal<{ canal: BuzzReportCanal; sentiment: BuzzReportSentiment; autor: string; contenido: string; alcance: string }>({
    canal: 'twitter',
    sentiment: 'neutro',
    autor: '',
    contenido: '',
    alcance: '',
  });

  newSintesisTexts = signal<Record<string, string>>({
    temasRecurrentes: '',
    vocesInfluyentes: '',
  });

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly canales = BUZZ_REPORT_CANALES;
  readonly sentiments = BUZZ_REPORT_SENTIMENTS;

  // ─── Computed ────────────────────────────────────────────────────────────────
  canGenerate = computed(() => this.data().menciones.length >= 3);
  canAddMencion = computed(() => !!this.newMencion().contenido.trim());

  posCount = computed(() => this.data().menciones.filter(m => m.sentiment === 'positivo').length);
  neuCount = computed(() => this.data().menciones.filter(m => m.sentiment === 'neutro').length);
  negCount = computed(() => this.data().menciones.filter(m => m.sentiment === 'negativo').length);

  // ─── Lifecycle ───────────────────────────────────────────────────────────────
  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;

    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const storedData = raw['data'] as BuzzReportData | undefined;
    const storedReports = (raw['reports'] as BuzzReportVersionDto[]) ?? [];

    this.data.set(storedData ? { ...EMPTY_BUZZ_REPORT, ...storedData } : { ...EMPTY_BUZZ_REPORT });
    this.reports.set(storedReports);
  }

  // ─── Context fields ──────────────────────────────────────────────────────────
  updateField(field: 'marca' | 'periodo' | 'sentimentOverall', value: string): void {
    this.data.set({ ...this.data(), [field]: value });
    this.scheduleSave();
  }

  // ─── Menciones ───────────────────────────────────────────────────────────────
  addMencion(): void {
    const nm = this.newMencion();
    if (!nm.contenido.trim()) return;

    const nueva: BuzzReportMencion = {
      id: crypto.randomUUID(),
      canal: nm.canal,
      sentiment: nm.sentiment,
      autor: nm.autor.trim(),
      contenido: nm.contenido.trim(),
      alcance: nm.alcance.trim(),
    };

    this.data.set({ ...this.data(), menciones: [...this.data().menciones, nueva] });
    this.newMencion.set({ canal: 'twitter', sentiment: 'neutro', autor: '', contenido: '', alcance: '' });
    this.scheduleSave();
  }

  removeMencion(index: number): void {
    const arr = [...this.data().menciones];
    arr.splice(index, 1);
    this.data.set({ ...this.data(), menciones: arr });
    this.scheduleSave();
  }

  updateMencion(index: number, field: keyof BuzzReportMencion, value: string): void {
    const arr = this.data().menciones.map((m, i) =>
      i === index ? { ...m, [field]: value } : m
    );
    this.data.set({ ...this.data(), menciones: arr });
    this.scheduleSave();
  }

  selectCanal(canal: BuzzReportCanal): void {
    this.newMencion.set({ ...this.newMencion(), canal });
  }

  selectSentiment(sentiment: BuzzReportSentiment): void {
    this.newMencion.set({ ...this.newMencion(), sentiment });
  }

  setNewMencionField(field: 'autor' | 'contenido' | 'alcance', value: string): void {
    this.newMencion.set({ ...this.newMencion(), [field]: value });
  }

  getCanalConfig(canal: BuzzReportCanal) {
    return BUZZ_REPORT_CANALES.find(c => c.value === canal) ?? BUZZ_REPORT_CANALES[0];
  }

  // ─── Síntesis ────────────────────────────────────────────────────────────────
  addSintesisItem(key: 'temasRecurrentes' | 'vocesInfluyentes'): void {
    const trimmed = (this.newSintesisTexts()[key] ?? '').trim();
    if (!trimmed) return;
    this.data.set({ ...this.data(), [key]: [...this.data()[key], trimmed] });
    this.newSintesisTexts.set({ ...this.newSintesisTexts(), [key]: '' });
    this.scheduleSave();
  }

  removeSintesisItem(key: 'temasRecurrentes' | 'vocesInfluyentes', index: number): void {
    const arr = [...this.data()[key]];
    arr.splice(index, 1);
    this.data.set({ ...this.data(), [key]: arr });
    this.scheduleSave();
  }

  setNewSintesisText(key: string, value: string): void {
    this.newSintesisTexts.set({ ...this.newSintesisTexts(), [key]: value });
  }

  toggleReport(): void {
    this.showReport.set(!this.showReport());
  }

  // ─── Generate report ─────────────────────────────────────────────────────────
  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;

    this.analyzing.set(true);
    try {
      const result = await this.buzzReportService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });

      const newVersion: BuzzReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };

      const updatedReports = [newVersion, ...this.reports()];
      this.reports.set(updatedReports);

      await this.persistData(updatedReports);
      this.showReport.set(true);
      this.uiDialog.showSuccess('Informe generado', 'El Buzz Report fue generado y guardado correctamente.');
    } catch (error) {
      this.uiDialog.showError('Error', `No se pudo generar el informe: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      this.analyzing.set(false);
    }
  }

  // ─── Helpers privados ────────────────────────────────────────────────────────
  private scheduleSave(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.saveData(), 800);
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
    } catch {
      // silent
    } finally {
      this.saving.set(false);
    }
  }

  private async persistData(reports: BuzzReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;

    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
