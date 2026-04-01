import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { BusquedaMediosService } from '@core/services/busquedaMediosService/busqueda-medios.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { BusquedaMediosReportComponent } from './busqueda-medios-report.component';
import {
  BUSQUEDA_MEDIOS_TIPOS,
  BusquedaMediosData,
  BusquedaMediosHallazgo,
  BusquedaMediosTipo,
  BusquedaMediosReportVersionDto,
  EMPTY_BUSQUEDA_MEDIOS,
  SINTESIS_FIELDS,
} from './busqueda-medios.types';

@Component({
  selector: 'app-busqueda-medios-tool',
  standalone: true,
  imports: [FormsModule, BusquedaMediosReportComponent],
  template: `
    <div class="bm">

      <!-- Header -->
      <div class="bm__header">
        <div class="bm__header-left">
          <div class="bm__badge">
            <i class="pi pi-search"></i>
          </div>
          <div class="bm__title-block">
            <span class="bm__title">Búsqueda de Medios</span>
            <span class="bm__subtitle">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              } @else {
                {{ data().hallazgos.length }} hallazgo{{ data().hallazgos.length !== 1 ? 's' : '' }} registrado{{ data().hallazgos.length !== 1 ? 's' : '' }}
              }
            </span>
          </div>
        </div>
        <div class="bm__header-actions">
          <button
            class="bm__btn bm__btn--ghost"
            (click)="toggleReport()"
            [class.bm__btn--active]="showReport()"
          >
            <i class="pi pi-chart-bar"></i>
            Informes {{ reports().length ? '(' + reports().length + ')' : '' }}
          </button>
          <button
            class="bm__btn bm__btn--primary"
            (click)="generateReport()"
            [disabled]="!canGenerate() || analyzing()"
            [title]="!canGenerate() ? 'Registrá al menos 3 hallazgos para analizar' : 'Generar informe con IA'"
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
      <div class="bm__content">
        @if (showReport()) {
          <app-busqueda-medios-report [reports]="reports()" />
        } @else {
          <div class="bm__body">

            <!-- Tema -->
            <div class="bm__section">
              <div class="bm__section-header">
                <i class="pi pi-tag bm__section-icon"></i>
                <span class="bm__section-title">Tema de Investigación</span>
              </div>
              <input
                class="bm__field-input"
                type="text"
                placeholder="Ej: Tendencias en packaging sostenible en Argentina..."
                [ngModel]="data().tema"
                (ngModelChange)="updateField('tema', $event)"
              />
            </div>

            <!-- Queries -->
            <div class="bm__section">
              <div class="bm__section-header">
                <i class="pi pi-search bm__section-icon"></i>
                <span class="bm__section-title">Queries de Búsqueda</span>
                @if (data().queries.length) {
                  <span class="bm__count">{{ data().queries.length }}</span>
                }
              </div>

              <div class="bm__chips">
                @for (q of data().queries; track $index; let i = $index) {
                  <span class="bm__chip">
                    {{ q }}
                    <button class="bm__chip-remove" (click)="removeQuery(i)" title="Eliminar">
                      <i class="pi pi-times"></i>
                    </button>
                  </span>
                }
              </div>

              <div class="bm__input-row">
                <input
                  class="bm__input"
                  type="text"
                  placeholder='Ej: "packaging sustentable" site:infobae.com'
                  [ngModel]="newQuery()"
                  (ngModelChange)="newQuery.set($event)"
                  (keydown.enter)="addQuery()"
                />
                <button
                  class="bm__add-btn"
                  (click)="addQuery()"
                  [disabled]="!newQuery().trim()"
                  title="Agregar query"
                >
                  <i class="pi pi-plus"></i>
                </button>
              </div>
            </div>

            <!-- Hallazgos -->
            <div class="bm__section bm__section--hallazgos">
              <div class="bm__section-header">
                <i class="pi pi-file-check bm__section-icon"></i>
                <span class="bm__section-title">Hallazgos</span>
                @if (data().hallazgos.length) {
                  <span class="bm__count">{{ data().hallazgos.length }}</span>
                }
                <span class="bm__hint">Mínimo 3 para analizar</span>
              </div>

              <!-- Lista de hallazgos -->
              @for (h of data().hallazgos; track h.id; let i = $index) {
                <div class="bm__hallazgo" [style.border-left-color]="getTipoConfig(h.tipo).accentColor">
                  <div class="bm__hallazgo-top">
                    <span
                      class="bm__tipo-pill"
                      [style.background-color]="getTipoConfig(h.tipo).accentBg"
                      [style.color]="getTipoConfig(h.tipo).accentColor"
                    >
                      <i class="pi {{ getTipoConfig(h.tipo).icon }}"></i>
                      {{ getTipoConfig(h.tipo).label }}
                    </span>
                    <button class="bm__hallazgo-remove" (click)="removeHallazgo(i)" title="Eliminar hallazgo">
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                  <div class="bm__hallazgo-fields">
                    <input
                      class="bm__hallazgo-input bm__hallazgo-input--titulo"
                      type="text"
                      placeholder="Título del artículo, post o recurso..."
                      [ngModel]="h.titulo"
                      (ngModelChange)="updateHallazgo(i, 'titulo', $event)"
                    />
                    <input
                      class="bm__hallazgo-input"
                      type="text"
                      placeholder="Fuente (ej: Clarín, LinkedIn, Reddit...)"
                      [ngModel]="h.fuente"
                      (ngModelChange)="updateHallazgo(i, 'fuente', $event)"
                    />
                    <textarea
                      class="bm__hallazgo-textarea"
                      placeholder="¿Cuál es el insight principal que encontraste?"
                      [ngModel]="h.insight"
                      (ngModelChange)="updateHallazgo(i, 'insight', $event)"
                      rows="2"
                    ></textarea>
                  </div>
                </div>
              }

              <!-- Formulario nuevo hallazgo -->
              <div class="bm__new-hallazgo">
                <div class="bm__tipo-selector">
                  @for (tipo of tipos; track tipo.value) {
                    <button
                      class="bm__tipo-btn"
                      [class.bm__tipo-btn--active]="newHallazgo().tipo === tipo.value"
                      [style.--tipo-color]="tipo.accentColor"
                      [style.--tipo-bg]="tipo.accentBg"
                      (click)="selectTipo(tipo.value)"
                    >
                      <i class="pi {{ tipo.icon }}"></i>
                      {{ tipo.label }}
                    </button>
                  }
                </div>
                <div class="bm__new-hallazgo-fields">
                  <input
                    class="bm__input bm__input--titulo"
                    type="text"
                    placeholder="Título del hallazgo..."
                    [ngModel]="newHallazgo().titulo"
                    (ngModelChange)="setNewHallazgoField('titulo', $event)"
                  />
                  <input
                    class="bm__input"
                    type="text"
                    placeholder="Fuente..."
                    [ngModel]="newHallazgo().fuente"
                    (ngModelChange)="setNewHallazgoField('fuente', $event)"
                  />
                  <div class="bm__new-hallazgo-bottom">
                    <textarea
                      class="bm__input bm__input--textarea"
                      placeholder="Insight principal..."
                      [ngModel]="newHallazgo().insight"
                      (ngModelChange)="setNewHallazgoField('insight', $event)"
                      rows="2"
                    ></textarea>
                    <button
                      class="bm__btn bm__btn--add-hallazgo"
                      (click)="addHallazgo()"
                      [disabled]="!canAddHallazgo()"
                      title="Agregar hallazgo"
                    >
                      <i class="pi pi-plus"></i>
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Síntesis -->
            <div class="bm__section">
              <div class="bm__section-header">
                <i class="pi pi-align-left bm__section-icon"></i>
                <span class="bm__section-title">Síntesis</span>
              </div>

              <div class="bm__sintesis-grid">
                @for (field of sintesisFields; track field.key) {
                  <div
                    class="bm__sintesis-block"
                    [style.background-color]="field.accentBg"
                    [style.border-color]="field.borderColor"
                  >
                    <div class="bm__sintesis-header" [style.color]="field.textColor">
                      <i class="pi {{ field.icon }}"></i>
                      <span>{{ field.label }}</span>
                      @if (data()[field.key].length) {
                        <span class="bm__sintesis-count" [style.background-color]="field.accentColor">
                          {{ data()[field.key].length }}
                        </span>
                      }
                    </div>

                    <ul class="bm__sintesis-list">
                      @for (item of data()[field.key]; track $index; let i = $index) {
                        <li class="bm__sintesis-item">
                          <span class="bm__sintesis-dot" [style.background-color]="field.accentColor"></span>
                          <span class="bm__sintesis-text">{{ item }}</span>
                          <button class="bm__sintesis-remove" (click)="removeSintesisItem(field.key, i)">
                            <i class="pi pi-times"></i>
                          </button>
                        </li>
                      }
                    </ul>

                    <div class="bm__input-row">
                      <input
                        class="bm__input"
                        type="text"
                        [style.border-color]="field.borderColor"
                        [placeholder]="field.placeholder"
                        [ngModel]="newSintesisTexts()[field.key]"
                        (ngModelChange)="setNewSintesisText(field.key, $event)"
                        (keydown.enter)="addSintesisItem(field.key)"
                      />
                      <button
                        class="bm__add-btn"
                        [style.background-color]="field.accentColor"
                        (click)="addSintesisItem(field.key)"
                        [disabled]="!newSintesisTexts()[field.key]?.trim()"
                      >
                        <i class="pi pi-plus"></i>
                      </button>
                    </div>
                  </div>
                }
              </div>

              <!-- Sentiment -->
              <div class="bm__sentiment">
                <label class="bm__sentiment-label">Sentiment General del Medio</label>
                <textarea
                  class="bm__sentiment-textarea"
                  placeholder="Ej: Tono predominantemente alarmista sobre el medio ambiente, pero con creciente optimismo en soluciones tecnológicas..."
                  [ngModel]="data().sentiment"
                  (ngModelChange)="updateField('sentiment', $event)"
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
    .bm {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 12px;
    }

    /* ─── Header ───────────────────────────────────────────────────── */
    .bm__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-shrink: 0;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--p-surface-200);
    }

    .bm__header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .bm__badge {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #ccfbf1;
      color: #0d9488;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      flex-shrink: 0;
    }

    .bm__title-block {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .bm__title {
      font-family: 'Syne', sans-serif;
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--p-text-color);
      line-height: 1.2;
    }

    .bm__subtitle {
      font-size: 0.72rem;
      color: var(--p-text-muted-color);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .bm__header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* ─── Buttons ──────────────────────────────────────────────────── */
    .bm__btn {
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

    .bm__btn .pi { font-size: 0.8rem; }
    .bm__btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .bm__btn--ghost {
      background: transparent;
      border-color: var(--p-surface-300);
      color: var(--p-text-secondary-color);
    }

    .bm__btn--ghost:hover:not(:disabled) { background: var(--p-surface-100); }
    .bm__btn--ghost.bm__btn--active { background: #f0fdfa; border-color: #99f6e4; color: #0d9488; }

    .bm__btn--primary {
      background: #0d9488;
      color: white;
      border-color: #0d9488;
    }

    .bm__btn--primary:hover:not(:disabled) { background: #0f766e; }

    .bm__btn--add-hallazgo {
      background: #0d9488;
      color: white;
      border-color: #0d9488;
      padding: 8px 16px;
      align-self: flex-end;
      flex-shrink: 0;
    }

    .bm__btn--add-hallazgo:hover:not(:disabled) { background: #0f766e; }

    /* ─── Content ──────────────────────────────────────────────────── */
    .bm__content {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
    }

    .bm__body {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding-bottom: 20px;
    }

    /* ─── Section ──────────────────────────────────────────────────── */
    .bm__section {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .bm__section-header {
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

    .bm__section-icon {
      color: #0d9488;
      font-size: 0.8rem;
    }

    .bm__section-title { flex: 1; }

    .bm__count {
      background: #0d9488;
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 10px;
      line-height: 1.6;
    }

    .bm__hint {
      font-size: 0.67rem;
      color: var(--p-text-muted-color);
      font-family: inherit;
      text-transform: none;
      letter-spacing: 0;
      font-weight: 400;
    }

    /* ─── Inputs ───────────────────────────────────────────────────── */
    .bm__field-input {
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

    .bm__field-input::placeholder { color: #9ca3af; }
    .bm__field-input:focus { border-color: #0d9488; box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.15); }

    .bm__input {
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

    .bm__input::placeholder { color: #9ca3af; }
    .bm__input:focus { border-color: #0d9488; box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.15); }

    .bm__input--titulo {
      font-weight: 600;
      font-size: 0.85rem;
    }

    .bm__input--textarea {
      resize: vertical;
      min-height: 56px;
      font-family: inherit;
    }

    .bm__input-row {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .bm__add-btn {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      border: none;
      background: #0d9488;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: filter 0.15s;
      font-size: 0.75rem;
    }

    .bm__add-btn:hover:not(:disabled) { filter: brightness(0.9); }
    .bm__add-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    /* ─── Chips (queries) ──────────────────────────────────────────── */
    .bm__chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .bm__chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: 20px;
      background: #f0fdfa;
      border: 1px solid #99f6e4;
      font-size: 0.78rem;
      color: #0f766e;
      font-weight: 500;
    }

    .bm__chip-remove {
      background: none;
      border: none;
      cursor: pointer;
      color: #5eead4;
      font-size: 0.6rem;
      padding: 0;
      line-height: 1;
      display: flex;
      align-items: center;
      transition: color 0.15s;
    }

    .bm__chip-remove:hover { color: #ef4444; }

    /* ─── Hallazgos ────────────────────────────────────────────────── */
    .bm__section--hallazgos {
      background: var(--p-surface-50);
      border-radius: 12px;
      padding: 14px;
      border: 1px solid var(--p-surface-200);
    }

    .bm__hallazgo {
      background: var(--p-surface-0);
      border-radius: 10px;
      border: 1px solid var(--p-surface-200);
      border-left-width: 3px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .bm__hallazgo-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .bm__tipo-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 600;
    }

    .bm__tipo-pill .pi { font-size: 0.68rem; }

    .bm__hallazgo-remove {
      background: none;
      border: none;
      cursor: pointer;
      color: #9ca3af;
      font-size: 0.75rem;
      padding: 4px;
      border-radius: 4px;
      transition: color 0.15s, background 0.15s;
    }

    .bm__hallazgo-remove:hover { color: #ef4444; background: #fef2f2; }

    .bm__hallazgo-fields {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .bm__hallazgo-input {
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

    .bm__hallazgo-input--titulo { font-weight: 600; }
    .bm__hallazgo-input:focus { border-color: #0d9488; }

    .bm__hallazgo-textarea {
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

    .bm__hallazgo-textarea:focus { border-color: #0d9488; }

    /* ─── New hallazgo form ─────────────────────────────────────────── */
    .bm__new-hallazgo {
      border: 1px dashed #99f6e4;
      border-radius: 10px;
      padding: 12px;
      background: #f0fdfa;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .bm__tipo-selector {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }

    .bm__tipo-btn {
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

    .bm__tipo-btn .pi { font-size: 0.65rem; }
    .bm__tipo-btn:hover { background: var(--tipo-bg, #f0fdfa); color: var(--tipo-color, #0d9488); border-color: var(--tipo-color, #0d9488); }
    .bm__tipo-btn--active { background: var(--tipo-bg, #f0fdfa); color: var(--tipo-color, #0d9488); border-color: var(--tipo-color, #0d9488); font-weight: 600; }

    .bm__new-hallazgo-fields {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .bm__new-hallazgo-bottom {
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }

    /* ─── Síntesis ─────────────────────────────────────────────────── */
    .bm__sintesis-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
    }

    .bm__sintesis-block {
      border-radius: 10px;
      padding: 12px;
      border: 1px solid;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .bm__sintesis-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .bm__sintesis-header .pi { font-size: 0.7rem; }

    .bm__sintesis-count {
      margin-left: auto;
      color: white;
      font-size: 0.63rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 10px;
      line-height: 1.6;
    }

    .bm__sintesis-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }

    .bm__sintesis-item {
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

    .bm__sintesis-item:hover .bm__sintesis-remove { opacity: 1; }

    .bm__sintesis-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      margin-top: 4px;
      flex-shrink: 0;
    }

    .bm__sintesis-text { flex: 1; word-break: break-word; }

    .bm__sintesis-remove {
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

    .bm__sintesis-remove:hover { color: #ef4444; }

    /* ─── Sentiment ─────────────────────────────────────────────────── */
    .bm__sentiment {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .bm__sentiment-label {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--p-text-muted-color);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .bm__sentiment-textarea {
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

    .bm__sentiment-textarea::placeholder { color: #9ca3af; }
    .bm__sentiment-textarea:focus { border-color: #0d9488; box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.15); }
  `],
})
export class BusquedaMediosToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly busquedaMediosService = inject(BusquedaMediosService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  // ─── Estado ─────────────────────────────────────────────────────────────────
  data = signal<BusquedaMediosData>({ ...EMPTY_BUSQUEDA_MEDIOS });
  reports = signal<BusquedaMediosReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  newQuery = signal('');
  newHallazgo = signal<{ tipo: BusquedaMediosTipo; titulo: string; fuente: string; insight: string }>({
    tipo: 'noticia',
    titulo: '',
    fuente: '',
    insight: '',
  });
  newSintesisTexts = signal<Record<string, string>>({
    tendencias: '',
    narrativas: '',
    gaps: '',
  });

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly tipos = BUSQUEDA_MEDIOS_TIPOS;
  readonly sintesisFields = SINTESIS_FIELDS;

  // ─── Computed ────────────────────────────────────────────────────────────────
  canGenerate = computed(() => this.data().hallazgos.length >= 3);

  canAddHallazgo = computed(() => !!this.newHallazgo().titulo.trim());

  // ─── Lifecycle ───────────────────────────────────────────────────────────────
  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;

    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const storedData = raw['data'] as BusquedaMediosData | undefined;
    const storedReports = (raw['reports'] as BusquedaMediosReportVersionDto[]) ?? [];

    this.data.set(storedData ? { ...EMPTY_BUSQUEDA_MEDIOS, ...storedData } : { ...EMPTY_BUSQUEDA_MEDIOS });
    this.reports.set(storedReports);
  }

  // ─── Tema & sentinel fields ──────────────────────────────────────────────────
  updateField(field: 'tema' | 'sentiment', value: string): void {
    this.data.set({ ...this.data(), [field]: value });
    this.scheduleSave();
  }

  // ─── Queries ─────────────────────────────────────────────────────────────────
  addQuery(): void {
    const trimmed = this.newQuery().trim();
    if (!trimmed) return;
    this.data.set({ ...this.data(), queries: [...this.data().queries, trimmed] });
    this.newQuery.set('');
    this.scheduleSave();
  }

  removeQuery(index: number): void {
    const arr = [...this.data().queries];
    arr.splice(index, 1);
    this.data.set({ ...this.data(), queries: arr });
    this.scheduleSave();
  }

  // ─── Hallazgos ───────────────────────────────────────────────────────────────
  addHallazgo(): void {
    const nh = this.newHallazgo();
    if (!nh.titulo.trim()) return;

    const nuevo: BusquedaMediosHallazgo = {
      id: crypto.randomUUID(),
      tipo: nh.tipo,
      titulo: nh.titulo.trim(),
      fuente: nh.fuente.trim(),
      insight: nh.insight.trim(),
    };

    this.data.set({ ...this.data(), hallazgos: [...this.data().hallazgos, nuevo] });
    this.newHallazgo.set({ tipo: 'noticia', titulo: '', fuente: '', insight: '' });
    this.scheduleSave();
  }

  removeHallazgo(index: number): void {
    const arr = [...this.data().hallazgos];
    arr.splice(index, 1);
    this.data.set({ ...this.data(), hallazgos: arr });
    this.scheduleSave();
  }

  updateHallazgo(index: number, field: keyof BusquedaMediosHallazgo, value: string): void {
    const arr = this.data().hallazgos.map((h, i) =>
      i === index ? { ...h, [field]: value } : h
    );
    this.data.set({ ...this.data(), hallazgos: arr });
    this.scheduleSave();
  }

  selectTipo(tipo: BusquedaMediosTipo): void {
    this.newHallazgo.set({ ...this.newHallazgo(), tipo });
  }

  setNewHallazgoField(field: 'titulo' | 'fuente' | 'insight', value: string): void {
    this.newHallazgo.set({ ...this.newHallazgo(), [field]: value });
  }

  getTipoConfig(tipo: BusquedaMediosTipo) {
    return BUSQUEDA_MEDIOS_TIPOS.find(t => t.value === tipo) ?? BUSQUEDA_MEDIOS_TIPOS[0];
  }

  // ─── Síntesis ────────────────────────────────────────────────────────────────
  addSintesisItem(key: 'tendencias' | 'narrativas' | 'gaps'): void {
    const trimmed = (this.newSintesisTexts()[key] ?? '').trim();
    if (!trimmed) return;
    this.data.set({ ...this.data(), [key]: [...this.data()[key], trimmed] });
    this.newSintesisTexts.set({ ...this.newSintesisTexts(), [key]: '' });
    this.scheduleSave();
  }

  removeSintesisItem(key: 'tendencias' | 'narrativas' | 'gaps', index: number): void {
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
      const result = await this.busquedaMediosService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });

      const newVersion: BusquedaMediosReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };

      const updatedReports = [newVersion, ...this.reports()];
      this.reports.set(updatedReports);

      await this.persistData(updatedReports);
      this.showReport.set(true);
      this.uiDialog.showSuccess('Informe generado', 'El análisis de medios fue generado y guardado correctamente.');
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

  private async persistData(reports: BusquedaMediosReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;

    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
