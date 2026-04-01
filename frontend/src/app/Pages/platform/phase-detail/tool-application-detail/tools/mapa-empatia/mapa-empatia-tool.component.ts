import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { MapaEmpatiaService } from '@core/services/mapaEmpatiaService/mapa-empatia.service';
import { MapaEmpatiaReportComponent } from './mapa-empatia-report.component';
import {
  EMPTY_MAPA_EMPATIA,
  MAPA_EMPATIA_QUADRANTS,
  MapaEmpatiaData,
  MapaEmpatiaKey,
  MapaEmpatiaReportVersionDto,
} from './mapa-empatia.types';

@Component({
  selector: 'app-mapa-empatia-tool',
  standalone: true,
  imports: [FormsModule, MapaEmpatiaReportComponent],
  template: `
    <div class="me">

      <!-- Header -->
      <div class="me__header">
        <div class="me__header-left">
          <div class="me__badge">
            <i class="pi pi-heart"></i>
          </div>
          <div class="me__title-block">
            <span class="me__title">Mapa de Empatía</span>
            <span class="me__subtitle">
              @if (saving()) {
                <i class="pi pi-spin pi-spinner"></i> Guardando...
              } @else {
                {{ filledCount() }}/6 cuadrantes completados
              }
            </span>
          </div>
        </div>
        <div class="me__header-actions">
          <button
            class="me__btn me__btn--ghost"
            (click)="showReport.set(!showReport())"
            [class.me__btn--active]="showReport()"
          >
            <i class="pi pi-chart-bar"></i>
            Informes {{ reports().length ? '(' + reports().length + ')' : '' }}
          </button>
          <button
            class="me__btn me__btn--primary"
            (click)="generateReport()"
            [disabled]="!canGenerate() || analyzing()"
            [title]="!canGenerate() ? 'Completá al menos 3 cuadrantes para analizar' : 'Generar informe con IA'"
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
      <div class="me__content">
        @if (showReport()) {
          <app-mapa-empatia-report [reports]="reports()" />
        } @else {

          <!-- Context strip -->
          <div class="me__context">
            <div class="me__context-field">
              <label class="me__context-label">
                <i class="pi pi-user"></i> Usuario
              </label>
              <input
                class="me__context-input"
                type="text"
                [ngModel]="data().usuario"
                (ngModelChange)="onFieldChange('usuario', $event)"
                placeholder="Ej: María, freelancer de diseño"
              />
            </div>
            <div class="me__context-field">
              <label class="me__context-label">
                <i class="pi pi-map-marker"></i> Contexto
              </label>
              <input
                class="me__context-input"
                type="text"
                [ngModel]="data().contexto"
                (ngModelChange)="onFieldChange('contexto', $event)"
                placeholder="Ej: Fin de mes, gestionando proyectos simultáneos"
              />
            </div>
          </div>

          <!-- Quadrants grid -->
          <div class="me__grid">
            @for (q of quadrants; track q.key) {
              <div
                class="me__quadrant"
                [style.background-color]="q.accentBg"
                [style.border-color]="q.borderColor"
              >
                <div class="me__quadrant-header" [style.color]="q.textColor">
                  <i class="pi {{ q.icon }}"></i>
                  <span>{{ q.label }}</span>
                  @if (data()[q.key].length > 0) {
                    <span class="me__badge-count" [style.background-color]="q.accentColor">
                      {{ data()[q.key].length }}
                    </span>
                  }
                </div>

                <ul class="me__list">
                  @for (item of data()[q.key]; track $index; let i = $index) {
                    <li class="me__item">
                      <span class="me__item-dot" [style.background-color]="q.accentColor"></span>
                      <span class="me__item-text">{{ item }}</span>
                      <button
                        class="me__item-remove"
                        (click)="removeItem(q.key, i)"
                        title="Eliminar"
                      >
                        <i class="pi pi-times"></i>
                      </button>
                    </li>
                  }
                </ul>

                <div class="me__input-row">
                  <input
                    class="me__input"
                    type="text"
                    [placeholder]="q.placeholder"
                    [ngModel]="newItemTexts()[q.key]"
                    (ngModelChange)="updateNewItemText(q.key, $event)"
                    (keydown.enter)="addItem(q.key, newItemTexts()[q.key])"
                    [style.border-color]="q.borderColor"
                    [style.--focus-color]="q.accentColor"
                  />
                  <button
                    class="me__add-btn"
                    [style.background-color]="q.accentColor"
                    (click)="addItem(q.key, newItemTexts()[q.key])"
                    [disabled]="!newItemTexts()[q.key].trim()"
                    title="Agregar"
                  >
                    <i class="pi pi-plus"></i>
                  </button>
                </div>
              </div>
            }
          </div>

        }
      </div>

    </div>
  `,
  styles: [`
    .me {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 12px;
    }

    /* ─── Header ─────────────────────────────────────────────────── */
    .me__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-shrink: 0;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--p-surface-200);
    }

    .me__header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .me__badge {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #fff1f2;
      color: #be123c;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      flex-shrink: 0;
    }

    .me__title-block {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .me__title {
      font-family: 'Syne', sans-serif;
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--p-text-color);
      line-height: 1.2;
    }

    .me__subtitle {
      font-size: 0.72rem;
      color: var(--p-text-muted-color);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .me__header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* ─── Buttons ─────────────────────────────────────────────────── */
    .me__btn {
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

    .me__btn .pi { font-size: 0.8rem; }
    .me__btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .me__btn--ghost {
      background: transparent;
      border-color: var(--p-surface-300);
      color: var(--p-text-secondary-color);
    }

    .me__btn--ghost:hover:not(:disabled) { background: var(--p-surface-100); }
    .me__btn--ghost.me__btn--active { background: #fff1f2; border-color: #fecdd3; color: #be123c; }

    .me__btn--primary {
      background: var(--p-primary-600, #0284c7);
      color: white;
      border-color: var(--p-primary-600, #0284c7);
    }

    .me__btn--primary:hover:not(:disabled) { background: var(--p-primary-700, #0369a1); }

    /* ─── Content ─────────────────────────────────────────────────── */
    .me__content {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* ─── Context strip ───────────────────────────────────────────── */
    .me__context {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      flex-shrink: 0;
    }

    .me__context-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .me__context-label {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--p-text-secondary-color);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .me__context-label .pi { font-size: 0.7rem; }

    .me__context-input {
      padding: 7px 10px;
      border-radius: 8px;
      border: 1px solid var(--p-surface-300);
      font-size: 0.8125rem;
      background: var(--p-surface-0);
      color: var(--p-text-color);
      outline: none;
      transition: border-color 0.15s;
      width: 100%;
      box-sizing: border-box;
    }

    .me__context-input::placeholder { color: #9ca3af; }
    .me__context-input:focus { border-color: #f43f5e; box-shadow: 0 0 0 2px rgba(244, 63, 94, 0.12); }

    /* ─── Grid ────────────────────────────────────────────────────── */
    .me__grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      flex: 1;
      min-height: 0;
    }

    /* ─── Quadrant ────────────────────────────────────────────────── */
    .me__quadrant {
      border-radius: 12px;
      padding: 12px;
      border: 1px solid transparent;
      display: flex;
      flex-direction: column;
      gap: 8px;
      overflow: hidden;
    }

    .me__quadrant-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      flex-shrink: 0;
    }

    .me__quadrant-header .pi { font-size: 0.8rem; }

    .me__badge-count {
      margin-left: auto;
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 10px;
      line-height: 1.6;
    }

    /* ─── Items list ──────────────────────────────────────────────── */
    .me__list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      overflow-y: auto;
      min-height: 0;
    }

    .me__item {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      font-size: 0.8125rem;
      color: #374151;
      line-height: 1.4;
      padding: 4px 6px;
      border-radius: 6px;
      background: rgba(255,255,255,0.6);
    }

    .me__item:hover .me__item-remove { opacity: 1; }

    .me__item-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      margin-top: 4px;
      flex-shrink: 0;
    }

    .me__item-text {
      flex: 1;
      word-break: break-word;
    }

    .me__item-remove {
      opacity: 0;
      background: none;
      border: none;
      cursor: pointer;
      color: #9ca3af;
      padding: 0 2px;
      font-size: 0.65rem;
      flex-shrink: 0;
      transition: color 0.15s, opacity 0.15s;
      line-height: 1;
      margin-top: 2px;
    }

    .me__item-remove:hover { color: #ef4444; }

    /* ─── Input row ───────────────────────────────────────────────── */
    .me__input-row {
      display: flex;
      gap: 6px;
      align-items: center;
      flex-shrink: 0;
    }

    .me__input {
      flex: 1;
      padding: 6px 10px;
      border-radius: 8px;
      border: 1px solid;
      font-size: 0.8rem;
      background: rgba(255,255,255,0.8);
      color: var(--p-text-color);
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .me__input::placeholder { color: #9ca3af; }
    .me__input:focus { box-shadow: 0 0 0 2px color-mix(in srgb, var(--focus-color, #3b82f6) 20%, transparent); }

    .me__add-btn {
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

    .me__add-btn:hover:not(:disabled) { filter: brightness(0.9); }
    .me__add-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  `],
})
export class MapaEmpatiaToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly mapaEmpatiaService = inject(MapaEmpatiaService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  // ─── Estado ───────────────────────────────────────────────────────────────
  data = signal<MapaEmpatiaData>({ ...EMPTY_MAPA_EMPATIA });
  reports = signal<MapaEmpatiaReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);
  newItemTexts = signal<Record<MapaEmpatiaKey, string>>({
    ve: '',
    oye: '',
    piensa: '',
    siente: '',
    dice: '',
    hace: '',
  });

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly quadrants = MAPA_EMPATIA_QUADRANTS;

  // ─── Computed ─────────────────────────────────────────────────────────────
  filledCount = computed(
    () => MAPA_EMPATIA_QUADRANTS.filter(q => this.data()[q.key].length > 0).length
  );

  canGenerate = computed(
    () => MAPA_EMPATIA_QUADRANTS.filter(q => this.data()[q.key].length > 0).length >= 3
  );

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;

    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as MapaEmpatiaData | undefined;
    const storedReports = (raw['reports'] as MapaEmpatiaReportVersionDto[]) ?? [];

    this.data.set(stored ? { ...EMPTY_MAPA_EMPATIA, ...stored } : { ...EMPTY_MAPA_EMPATIA });
    this.reports.set(storedReports);
  }

  // ─── Acciones ─────────────────────────────────────────────────────────────
  onFieldChange(field: 'usuario' | 'contexto', value: string): void {
    this.data.set({ ...this.data(), [field]: value });
    this.scheduleSave();
  }

  addItem(key: MapaEmpatiaKey, text: string): void {
    const trimmed = text.trim();
    if (!trimmed) return;

    this.data.set({ ...this.data(), [key]: [...this.data()[key], trimmed] });
    this.newItemTexts.set({ ...this.newItemTexts(), [key]: '' });
    this.scheduleSave();
  }

  removeItem(key: MapaEmpatiaKey, index: number): void {
    const arr = [...this.data()[key]];
    arr.splice(index, 1);
    this.data.set({ ...this.data(), [key]: arr });
    this.scheduleSave();
  }

  updateNewItemText(key: MapaEmpatiaKey, value: string): void {
    this.newItemTexts.set({ ...this.newItemTexts(), [key]: value });
  }

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;

    this.analyzing.set(true);
    try {
      const result = await this.mapaEmpatiaService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });

      const newVersion: MapaEmpatiaReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };

      const updatedReports = [newVersion, ...this.reports()];
      this.reports.set(updatedReports);

      await this.persistData(updatedReports);
      this.showReport.set(true);
      this.uiDialog.showSuccess('Informe generado', 'El análisis del Mapa de Empatía fue generado correctamente.');
    } catch (error) {
      this.uiDialog.showError('Error', `No se pudo generar el informe: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      this.analyzing.set(false);
    }
  }

  // ─── Helpers privados ──────────────────────────────────────────────────────
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
    } catch {
      // silent
    } finally {
      this.saving.set(false);
    }
  }

  private async persistData(reports: MapaEmpatiaReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;

    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
