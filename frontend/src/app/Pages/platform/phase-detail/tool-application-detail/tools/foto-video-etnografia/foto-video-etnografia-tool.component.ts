import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { FotoVideoEtnografiaService } from '@core/services/fotoVideoEtnografiaService/foto-video-etnografia.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { FotoVideoEtnografiaReportComponent } from './foto-video-etnografia-report.component';
import {
  EMPTY_FOTO_VIDEO_ETNOGRAFIA,
  FotoVideoEtnografiaData,
  FotoVideoRegistroDto,
  FotoVideoEtnografiaReportVersionDto,
} from './foto-video-etnografia.types';

@Component({
  selector: 'app-foto-video-etnografia-tool',
  standalone: true,
  imports: [FormsModule, FotoVideoEtnografiaReportComponent],
  template: `
    <div class="fve">

      <!-- Header -->
      <div class="fve__header">
        <div class="fve__header-left">
          <div class="fve__badge">
            <i class="pi pi-camera"></i>
          </div>
          <div class="fve__title-block">
            <span class="fve__title">Foto-Vídeo Etnografía</span>
            <span class="fve__subtitle">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              } @else {
                {{ data().registros.length }} registros visuales documentados
              }
            </span>
          </div>
        </div>
        <div class="fve__header-actions">
          <button
            class="fve__btn fve__btn--ghost"
            (click)="toggleReport()"
            [class.fve__btn--active]="showReport()"
          >
            <i class="pi pi-chart-bar"></i>
            Informes {{ reports().length ? '(' + reports().length + ')' : '' }}
          </button>
          <button
            class="fve__btn fve__btn--primary"
            (click)="generateReport()"
            [disabled]="!canGenerate() || analyzing()"
            [title]="!canGenerate() ? 'Agregá al menos 2 registros con observación para analizar' : 'Generar análisis con IA'"
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
      <div class="fve__content">
        @if (showReport()) {
          <app-foto-video-etnografia-report [reports]="reports()" />
        } @else {
          <div class="fve__body">

            <!-- Contexto de la investigación -->
            <div class="fve__section">
              <div class="fve__section-header">
                <i class="pi pi-map-marker fve__section-icon"></i>
                <span class="fve__section-title">Contexto de la Investigación</span>
              </div>
              <div class="fve__context-grid">
                <div class="fve__field fve__field--full">
                  <label class="fve__field-label">Objetivo de Campo</label>
                  <textarea
                    class="fve__field-textarea"
                    placeholder="¿Qué queremos observar y documentar visualmente? ¿Qué podemos recoger de manera visual de nuestro cliente y su contexto?"
                    [ngModel]="data().objetivo"
                    (ngModelChange)="updateField('objetivo', $event)"
                    rows="3"
                  ></textarea>
                </div>
                <div class="fve__field fve__field--full">
                  <label class="fve__field-label">Descripción del Contexto / Escenario</label>
                  <textarea
                    class="fve__field-textarea"
                    placeholder="¿Dónde se realizó la investigación? Describí los escenarios visitados y el entorno del usuario..."
                    [ngModel]="data().contexto"
                    (ngModelChange)="updateField('contexto', $event)"
                    rows="2"
                  ></textarea>
                </div>
                <div class="fve__field">
                  <label class="fve__field-label">Fechas de Salida</label>
                  <input
                    class="fve__field-input"
                    type="text"
                    placeholder="Ej: 10/03, 14/03, 18/03/2025"
                    [ngModel]="data().fechasSalida"
                    (ngModelChange)="updateField('fechasSalida', $event)"
                  />
                </div>
                <div class="fve__field">
                  <label class="fve__field-label">Equipo Investigador</label>
                  <input
                    class="fve__field-input"
                    type="text"
                    placeholder="Ej: Ana (fotografía), Luis (video), María (notas)"
                    [ngModel]="data().equipo"
                    (ngModelChange)="updateField('equipo', $event)"
                  />
                </div>
              </div>
            </div>

            <!-- Registros visuales -->
            <div class="fve__section fve__section--registros">
              <div class="fve__section-header">
                <i class="pi pi-images fve__section-icon"></i>
                <span class="fve__section-title">Registros Visuales</span>
                @if (data().registros.length) {
                  <span class="fve__count">{{ data().registros.length }}</span>
                }
                <span class="fve__hint">Mínimo 2 con observación para analizar</span>
                <button class="fve__btn-add" (click)="addRegistro('foto')" title="Agregar foto">
                  <i class="pi pi-camera"></i> Foto
                </button>
                <button class="fve__btn-add fve__btn-add--video" (click)="addRegistro('video')" title="Agregar video">
                  <i class="pi pi-video"></i> Video
                </button>
              </div>

              @for (r of data().registros; track r.id; let i = $index) {
                <div class="fve__registro" [class.fve__registro--filled]="r.observacion.trim()">
                  <div class="fve__registro-tipo" [class.fve__registro-tipo--video]="r.tipo === 'video'">
                    <i [class]="r.tipo === 'foto' ? 'pi pi-camera' : 'pi pi-video'"></i>
                    <span>{{ r.tipo === 'foto' ? 'Foto' : 'Video' }}</span>
                  </div>
                  <div class="fve__registro-fields">
                    <div class="fve__registro-top">
                      <input
                        class="fve__registro-titulo"
                        type="text"
                        placeholder="Título o descripción breve del visual..."
                        [ngModel]="r.titulo"
                        (ngModelChange)="updateRegistro(i, 'titulo', $event)"
                      />
                      <button class="fve__registro-remove" (click)="removeRegistro(i)" title="Eliminar">
                        <i class="pi pi-trash"></i>
                      </button>
                    </div>

                    <!-- URL + preview -->
                    <input
                      class="fve__url-input"
                      type="text"
                      placeholder="URL de la foto o video (YouTube, Google Drive, imagen directa...)"
                      [ngModel]="r.url"
                      (ngModelChange)="updateRegistro(i, 'url', $event)"
                    />
                    @if (r.url?.trim()) {
                      @if (getMediaType(r.url) === 'image') {
                        <img class="fve__preview-img" [src]="r.url" [alt]="r.titulo" />
                      } @else if (getMediaType(r.url) === 'youtube') {
                        <iframe class="fve__preview-embed" [src]="getYouTubeEmbedUrl(r.url)" frameborder="0" allowfullscreen></iframe>
                      } @else if (getMediaType(r.url) === 'vimeo') {
                        <iframe class="fve__preview-embed" [src]="getVimeoEmbedUrl(r.url)" frameborder="0" allowfullscreen></iframe>
                      } @else if (getMediaType(r.url) === 'video') {
                        <video class="fve__preview-video" [src]="r.url" controls></video>
                      } @else {
                        <a class="fve__preview-link" [href]="r.url" target="_blank" rel="noopener noreferrer">
                          <i class="pi pi-external-link"></i> Ver recurso visual
                        </a>
                      }
                    }

                    <div class="fve__registro-meta">
                      <input
                        class="fve__meta-input"
                        type="text"
                        placeholder="Lugar / espacio"
                        [ngModel]="r.lugar"
                        (ngModelChange)="updateRegistro(i, 'lugar', $event)"
                      />
                      <input
                        class="fve__meta-input"
                        type="text"
                        placeholder="Sujeto u objeto fotografiado"
                        [ngModel]="r.sujeto"
                        (ngModelChange)="updateRegistro(i, 'sujeto', $event)"
                      />
                    </div>
                    <textarea
                      class="fve__registro-obs"
                      placeholder="¿Qué muestra este visual? ¿Qué comportamiento, objeto o situación captura?"
                      [ngModel]="r.observacion"
                      (ngModelChange)="updateRegistro(i, 'observacion', $event)"
                      rows="2"
                    ></textarea>
                    <textarea
                      class="fve__registro-insight"
                      placeholder="¿Qué revela sobre el usuario o su contexto? ¿Qué workaround o necesidad evidencia?"
                      [ngModel]="r.insight"
                      (ngModelChange)="updateRegistro(i, 'insight', $event)"
                      rows="2"
                    ></textarea>
                  </div>
                </div>
              }

              @if (data().registros.length === 0) {
                <div class="fve__registros-empty">
                  <i class="pi pi-camera"></i>
                  <span>Agregá el primer registro visual para documentar la investigación de campo</span>
                </div>
              }
            </div>

            <!-- Síntesis visual -->
            <div class="fve__section">
              <div class="fve__section-header">
                <i class="pi pi-eye fve__section-icon"></i>
                <span class="fve__section-title">Síntesis Visual</span>
              </div>

              <!-- Patrones emergentes -->
              <div class="fve__field">
                <label class="fve__field-label">
                  <i class="pi pi-objects-column"></i>
                  Patrones Visuales Emergentes
                </label>
                <textarea
                  class="fve__field-textarea"
                  placeholder="¿Qué temas, comportamientos u objetos se repiten en múltiples registros? ¿Qué patrones emergen del conjunto de visuales?"
                  [ngModel]="data().patronesVisuales"
                  (ngModelChange)="updateField('patronesVisuales', $event)"
                  rows="3"
                ></textarea>
              </div>

              <!-- Citas visuales -->
              <div class="fve__field">
                <label class="fve__field-label">
                  <i class="pi pi-star"></i>
                  Momentos Clave Capturados
                  @if (data().citasVisuales.length) {
                    <span class="fve__count fve__count--small">{{ data().citasVisuales.length }}</span>
                  }
                </label>
                <div class="fve__citas-list">
                  @for (c of data().citasVisuales; track $index; let i = $index) {
                    <div class="fve__cita-item">
                      <i class="pi pi-image fve__cita-icon"></i>
                      <span class="fve__cita-text">{{ c }}</span>
                      <button class="fve__cita-remove" (click)="removeCita(i)">
                        <i class="pi pi-times"></i>
                      </button>
                    </div>
                  }
                </div>
                <div class="fve__input-row">
                  <input
                    class="fve__input"
                    type="text"
                    placeholder='Ej: "La libreta con cuentas manuscritas detrás del mostrador — el CRM analógico del almacenero..."'
                    [ngModel]="newCita()"
                    (ngModelChange)="newCita.set($event)"
                    (keydown.enter)="addCita()"
                  />
                  <button
                    class="fve__add-btn"
                    (click)="addCita()"
                    [disabled]="!newCita().trim()"
                  >
                    <i class="pi pi-plus"></i>
                  </button>
                </div>
              </div>

              <!-- Observaciones generales -->
              <div class="fve__field">
                <label class="fve__field-label">Observaciones Generales</label>
                <textarea
                  class="fve__field-textarea"
                  placeholder="Lo inesperado, lo que desafió los supuestos del equipo, lo que no se capturó pero se vivió durante el campo..."
                  [ngModel]="data().observaciones"
                  (ngModelChange)="updateField('observaciones', $event)"
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
    .fve {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 12px;
    }

    /* ─── Header ───────────────────────────────────────────────────── */
    .fve__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-shrink: 0;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--p-surface-200);
    }

    .fve__header-left { display: flex; align-items: center; gap: 10px; }

    .fve__badge {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #cffafe;
      color: #0891b2;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      flex-shrink: 0;
    }

    .fve__title-block { display: flex; flex-direction: column; gap: 1px; }

    .fve__title {
      font-family: 'Syne', sans-serif;
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--p-text-color);
      line-height: 1.2;
    }

    .fve__subtitle {
      font-size: 0.72rem;
      color: var(--p-text-muted-color);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .fve__header-actions { display: flex; align-items: center; gap: 8px; }

    /* ─── Buttons ──────────────────────────────────────────────────── */
    .fve__btn {
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

    .fve__btn .pi { font-size: 0.8rem; }
    .fve__btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .fve__btn--ghost {
      background: transparent;
      border-color: var(--p-surface-300);
      color: var(--p-text-secondary-color);
    }

    .fve__btn--ghost:hover:not(:disabled) { background: var(--p-surface-100); }
    .fve__btn--ghost.fve__btn--active { background: #ecfeff; border-color: #a5f3fc; color: #0891b2; }

    .fve__btn--primary {
      background: #0891b2;
      color: white;
      border-color: #0891b2;
    }

    .fve__btn--primary:hover:not(:disabled) { background: #0e7490; }

    .fve__btn-add {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 10px;
      border-radius: 8px;
      border: 1px solid #a5f3fc;
      background: #ecfeff;
      color: #0891b2;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }

    .fve__btn-add .pi { font-size: 0.7rem; }
    .fve__btn-add:hover { background: #cffafe; }

    .fve__btn-add--video {
      border-color: #c4b5fd;
      background: #f5f3ff;
      color: #7c3aed;
    }

    .fve__btn-add--video:hover { background: #ede9fe; }

    /* ─── Content ──────────────────────────────────────────────────── */
    .fve__content { flex: 1; min-height: 0; overflow-y: auto; }

    .fve__body { display: flex; flex-direction: column; gap: 20px; padding-bottom: 20px; }

    /* ─── Section ──────────────────────────────────────────────────── */
    .fve__section { display: flex; flex-direction: column; gap: 10px; }

    .fve__section--registros {
      background: var(--p-surface-50);
      border-radius: 12px;
      padding: 14px;
      border: 1px solid var(--p-surface-200);
    }

    .fve__section-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: 'Syne', sans-serif;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--p-text-secondary-color);
      flex-wrap: wrap;
    }

    .fve__section-icon { color: #0891b2; font-size: 0.8rem; }

    .fve__count {
      background: #0891b2;
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 10px;
      line-height: 1.6;
    }

    .fve__count--small {
      font-size: 0.63rem;
      padding: 0 5px;
      border-radius: 8px;
      margin-left: 4px;
      vertical-align: middle;
    }

    .fve__hint {
      font-size: 0.67rem;
      color: var(--p-text-muted-color);
      font-family: inherit;
      text-transform: none;
      letter-spacing: 0;
      font-weight: 400;
    }

    /* ─── Context grid ─────────────────────────────────────────────── */
    .fve__context-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .fve__field--full { grid-column: 1 / -1; }

    /* ─── Fields ───────────────────────────────────────────────────── */
    .fve__field { display: flex; flex-direction: column; gap: 5px; }

    .fve__field-label {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--p-text-muted-color);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .fve__field-label .pi { font-size: 0.68rem; color: #0891b2; }

    .fve__field-input {
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

    .fve__field-input::placeholder { color: #9ca3af; }
    .fve__field-input:focus { border-color: #0891b2; box-shadow: 0 0 0 2px rgba(8, 145, 178, 0.15); }

    .fve__field-textarea {
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

    .fve__field-textarea::placeholder { color: #9ca3af; }
    .fve__field-textarea:focus { border-color: #0891b2; box-shadow: 0 0 0 2px rgba(8, 145, 178, 0.15); }

    /* ─── Registros ────────────────────────────────────────────────── */
    .fve__registro {
      background: var(--p-surface-0);
      border-radius: 10px;
      border: 1px solid var(--p-surface-200);
      border-left: 3px solid #a5f3fc;
      padding: 10px 12px;
      display: flex;
      gap: 10px;
      transition: border-left-color 0.2s;
    }

    .fve__registro--filled { border-left-color: #0891b2; }

    .fve__registro-tipo {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      width: 44px;
      flex-shrink: 0;
      padding: 6px 4px;
      border-radius: 8px;
      background: #ecfeff;
      color: #0891b2;
      font-size: 0.6rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .fve__registro-tipo .pi { font-size: 1rem; }

    .fve__registro-tipo--video {
      background: #f5f3ff;
      color: #7c3aed;
    }

    .fve__registro-fields { flex: 1; display: flex; flex-direction: column; gap: 6px; }

    .fve__registro-top { display: flex; gap: 6px; align-items: center; }

    .fve__registro-titulo {
      flex: 1;
      padding: 6px 10px;
      border-radius: 7px;
      border: 1px solid var(--p-surface-200);
      font-size: 0.82rem;
      font-weight: 600;
      background: var(--p-surface-50);
      color: var(--p-text-color);
      outline: none;
      transition: border-color 0.15s;
    }

    .fve__registro-titulo::placeholder { color: #9ca3af; font-weight: 400; }
    .fve__registro-titulo:focus { border-color: #0891b2; }

    .fve__registro-remove {
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

    .fve__registro-remove:hover { color: #ef4444; background: #fef2f2; }

    .fve__registro-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }

    .fve__meta-input {
      padding: 5px 8px;
      border-radius: 6px;
      border: 1px solid var(--p-surface-200);
      font-size: 0.75rem;
      background: var(--p-surface-0);
      color: var(--p-text-color);
      outline: none;
      transition: border-color 0.15s;
    }

    .fve__meta-input::placeholder { color: #9ca3af; }
    .fve__meta-input:focus { border-color: #0891b2; }

    .fve__url-input {
      width: 100%;
      padding: 5px 8px;
      border-radius: 6px;
      border: 1px dashed var(--p-surface-300);
      font-size: 0.75rem;
      background: var(--p-surface-0);
      color: var(--p-text-color);
      outline: none;
      transition: border-color 0.15s;
      box-sizing: border-box;
      font-style: italic;
    }

    .fve__url-input::placeholder { color: #9ca3af; }
    .fve__url-input:focus { border-color: #0891b2; border-style: solid; }

    .fve__preview-img {
      width: 100%;
      max-height: 220px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid var(--p-surface-200);
    }

    .fve__preview-embed {
      width: 100%;
      height: 200px;
      border-radius: 8px;
      border: 1px solid var(--p-surface-200);
    }

    .fve__preview-video {
      width: 100%;
      max-height: 220px;
      border-radius: 8px;
      border: 1px solid var(--p-surface-200);
    }

    .fve__preview-link {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.78rem;
      color: #0891b2;
      text-decoration: none;
      padding: 5px 10px;
      border-radius: 6px;
      border: 1px solid #a5f3fc;
      background: #ecfeff;
      transition: background 0.15s;
    }

    .fve__preview-link:hover { background: #cffafe; }
    .fve__preview-link .pi { font-size: 0.72rem; }

    .fve__registro-obs {
      width: 100%;
      padding: 6px 10px;
      border-radius: 7px;
      border: 1px solid var(--p-surface-200);
      font-size: 0.8rem;
      background: var(--p-surface-0);
      color: var(--p-text-color);
      outline: none;
      resize: vertical;
      font-family: inherit;
      line-height: 1.5;
      box-sizing: border-box;
      transition: border-color 0.15s;
    }

    .fve__registro-obs::placeholder { color: #9ca3af; }
    .fve__registro-obs:focus { border-color: #0891b2; }

    .fve__registro-insight {
      width: 100%;
      padding: 6px 10px;
      border-radius: 7px;
      border: 1px solid #a5f3fc;
      font-size: 0.8rem;
      background: #ecfeff;
      color: var(--p-text-color);
      outline: none;
      resize: vertical;
      font-family: inherit;
      line-height: 1.5;
      box-sizing: border-box;
      transition: border-color 0.15s;
    }

    .fve__registro-insight::placeholder { color: #67e8f9; }
    .fve__registro-insight:focus { border-color: #0891b2; }

    .fve__registros-empty {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      border: 1px dashed #a5f3fc;
      border-radius: 8px;
      color: #0891b2;
      font-size: 0.8rem;
    }

    .fve__registros-empty .pi { font-size: 1rem; }

    /* ─── Citas visuales ───────────────────────────────────────────── */
    .fve__citas-list { display: flex; flex-direction: column; gap: 5px; }

    .fve__cita-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 8px 12px;
      background: #ecfeff;
      border: 1px solid #a5f3fc;
      border-radius: 8px;
      font-size: 0.82rem;
      color: #164e63;
      font-style: italic;
      line-height: 1.5;
    }

    .fve__cita-icon { color: #0891b2; font-size: 0.72rem; flex-shrink: 0; margin-top: 3px; }
    .fve__cita-text { flex: 1; }

    .fve__cita-remove {
      background: none;
      border: none;
      cursor: pointer;
      color: #67e8f9;
      font-size: 0.65rem;
      padding: 2px;
      flex-shrink: 0;
      transition: color 0.15s;
      line-height: 1;
      margin-top: 2px;
    }

    .fve__cita-remove:hover { color: #ef4444; }

    /* ─── Input row ────────────────────────────────────────────────── */
    .fve__input-row { display: flex; gap: 6px; align-items: center; }

    .fve__input {
      flex: 1;
      padding: 6px 10px;
      border-radius: 8px;
      border: 1px solid var(--p-surface-300);
      font-size: 0.8rem;
      background: var(--p-surface-0);
      color: var(--p-text-color);
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
      font-style: italic;
    }

    .fve__input::placeholder { color: #9ca3af; }
    .fve__input:focus { border-color: #0891b2; box-shadow: 0 0 0 2px rgba(8, 145, 178, 0.15); }

    .fve__add-btn {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      border: none;
      background: #0891b2;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: filter 0.15s;
      font-size: 0.75rem;
    }

    .fve__add-btn:hover:not(:disabled) { filter: brightness(0.9); }
    .fve__add-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  `],
})
export class FotoVideoEtnografiaToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly fotoVideoService = inject(FotoVideoEtnografiaService);
  private readonly uiDialog = inject(UiDialogService);
  private readonly sanitizer = inject(DomSanitizer);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  // ─── Estado ─────────────────────────────────────────────────────────────────
  data = signal<FotoVideoEtnografiaData>({ ...EMPTY_FOTO_VIDEO_ETNOGRAFIA });
  reports = signal<FotoVideoEtnografiaReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  newCita = signal('');

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // ─── Computed ────────────────────────────────────────────────────────────────
  filledCount = computed(() => this.data().registros.filter(r => r.observacion.trim()).length);
  canGenerate = computed(() => this.filledCount() >= 2);

  // ─── Lifecycle ───────────────────────────────────────────────────────────────
  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;

    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const storedData = raw['data'] as FotoVideoEtnografiaData | undefined;
    const storedReports = (raw['reports'] as FotoVideoEtnografiaReportVersionDto[]) ?? [];

    this.data.set(storedData ? { ...EMPTY_FOTO_VIDEO_ETNOGRAFIA, ...storedData } : { ...EMPTY_FOTO_VIDEO_ETNOGRAFIA });
    this.reports.set(storedReports);
  }

  // ─── Context fields ──────────────────────────────────────────────────────────
  updateField(field: keyof Omit<FotoVideoEtnografiaData, 'registros' | 'citasVisuales'>, value: string): void {
    this.data.set({ ...this.data(), [field]: value });
    this.scheduleSave();
  }

  // ─── Registros ───────────────────────────────────────────────────────────────
  // ─── Media helpers ───────────────────────────────────────────────────────────
  getMediaType(url: string): 'image' | 'youtube' | 'vimeo' | 'video' | 'link' {
    const lower = url.toLowerCase();
    if (/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/.test(lower)) return 'image';
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
    if (lower.includes('vimeo.com')) return 'vimeo';
    if (/\.(mp4|webm|ogg|mov)(\?.*)?$/.test(lower)) return 'video';
    return 'link';
  }

  getYouTubeEmbedUrl(url: string): SafeResourceUrl {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
    const id = match?.[1] ?? '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${id}`);
  }

  getVimeoEmbedUrl(url: string): SafeResourceUrl {
    const match = url.match(/vimeo\.com\/(\d+)/);
    const id = match?.[1] ?? '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://player.vimeo.com/video/${id}`);
  }

  // ─── Registros ───────────────────────────────────────────────────────────────
  addRegistro(tipo: 'foto' | 'video'): void {
    const nuevo: FotoVideoRegistroDto = {
      id: crypto.randomUUID(),
      tipo,
      titulo: '',
      url: '',
      lugar: '',
      sujeto: '',
      observacion: '',
      insight: '',
    };
    this.data.set({ ...this.data(), registros: [...this.data().registros, nuevo] });
    this.scheduleSave();
  }

  removeRegistro(index: number): void {
    const arr = [...this.data().registros];
    arr.splice(index, 1);
    this.data.set({ ...this.data(), registros: arr });
    this.scheduleSave();
  }

  updateRegistro(index: number, field: keyof FotoVideoRegistroDto, value: string): void {
    const arr = this.data().registros.map((r, i) =>
      i === index ? { ...r, [field]: value } : r
    );
    this.data.set({ ...this.data(), registros: arr });
    this.scheduleSave();
  }

  // ─── Citas visuales ──────────────────────────────────────────────────────────
  addCita(): void {
    const trimmed = this.newCita().trim();
    if (!trimmed) return;
    this.data.set({ ...this.data(), citasVisuales: [...this.data().citasVisuales, trimmed] });
    this.newCita.set('');
    this.scheduleSave();
  }

  removeCita(index: number): void {
    const arr = [...this.data().citasVisuales];
    arr.splice(index, 1);
    this.data.set({ ...this.data(), citasVisuales: arr });
    this.scheduleSave();
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
      const result = await this.fotoVideoService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });

      const newVersion: FotoVideoEtnografiaReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };

      const updatedReports = [newVersion, ...this.reports()];
      this.reports.set(updatedReports);

      await this.persistData(updatedReports);
      this.showReport.set(true);
      this.uiDialog.showSuccess('Análisis generado', 'El análisis de la investigación visual fue generado y guardado correctamente.');
    } catch (error) {
      this.uiDialog.showError('Error', `No se pudo generar el análisis: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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

  private async persistData(reports: FotoVideoEtnografiaReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;

    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
