import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { HibridacionTraslacionService } from '@core/services/hibridacionTraslacionService/hibridacion-traslacion.service';
import { HibridacionTraslacionReportComponent } from './hibridacion-traslacion-report.component';
import {
  EMPTY_HIBRIDACION_TRASLACION,
  FUENTES_TRASLACION,
  HibridacionTraslacionData,
  HibridacionTraslacionReportVersionDto,
  TraslacionDto,
} from './hibridacion-traslacion.types';

@Component({
  selector: 'app-hibridacion-traslacion-tool',
  standalone: true,
  imports: [FormsModule, HibridacionTraslacionReportComponent],
  template: `
    <div class="ht">

      <!-- Header -->
      <div class="ht__header">
        <div class="ht__header-left">
          <span class="ht__badge">HT</span>
          <div>
            <p class="ht__title">Hibridación por Traslación</p>
            <p class="ht__subtitle">
              {{ data().traslaciones.length }} traslación{{ data().traslaciones.length === 1 ? '' : 'es' }}
              @if (data().ideaResultante.trim()) { · idea resultante definida }
              @if (saving()) { <span class="ht__saving"> · guardando…</span> }
            </p>
          </div>
        </div>
        <div class="ht__header-actions">
          @if (reports().length > 0) {
            <button class="ht__btn-ghost" (click)="showReport.set(!showReport())">
              <i class="pi pi-file-check"></i>
              Informes ({{ reports().length }})
            </button>
          }
          <button
            class="ht__btn-primary"
            [disabled]="!canGenerate() || analyzing()"
            (click)="generateReport()"
          >
            @if (analyzing()) {
              <i class="pi pi-spin pi-spinner"></i> Analizando…
            } @else {
              <i class="pi pi-sparkles"></i> Analizar
            }
          </button>
        </div>
      </div>

      @if (showReport() && reports().length > 0) {
        <app-hibridacion-traslacion-report [reports]="reports()" />
      } @else {

        <!-- Problema y contexto -->
        <div class="ht__section">
          <label class="ht__label">Problema a resolver</label>
          <textarea
            class="ht__textarea ht__textarea--problema"
            placeholder="¿Qué problema buscan solucionar? ¿Qué no está funcionando con las soluciones actuales?"
            [ngModel]="data().problema"
            (ngModelChange)="patchData({ problema: $event })"
            rows="2"
          ></textarea>
          <label class="ht__label">Contexto / industria</label>
          <input
            type="text"
            class="ht__input"
            placeholder="¿En qué industria o contexto opera el problema? (ej: ecommerce, salud, educación)"
            [ngModel]="data().contexto"
            (ngModelChange)="patchData({ contexto: $event })"
          />
        </div>

        <!-- Traslaciones -->
        <div class="ht__section">
          <div class="ht__section-header">
            <p class="ht__label">Traslaciones</p>
            <button class="ht__btn-add" (click)="addTraslacion()">
              <i class="pi pi-plus"></i> Agregar traslación
            </button>
          </div>
          <p class="ht__sublabel">Identificá mecanismos de otros dominios y traducílos al problema actual.</p>

          @if (data().traslaciones.length === 0) {
            <div class="ht__empty">
              <i class="pi pi-arrow-right-arrow-left"></i>
              <p>¿Quién más tiene este problema? ¿Cómo lo resuelven en otra industria o contexto?</p>
            </div>
          }

          <div class="ht__traslaciones">
            @for (t of data().traslaciones; track t.id; let i = $index) {
              <div class="ht__traslacion">
                <div class="ht__traslacion-header">
                  <div class="ht__traslacion-top">
                    <input
                      type="text"
                      class="ht__input ht__input--dominio"
                      placeholder="Dominio origen (ej: Juegos MMORPG, Aviación, Naturaleza…)"
                      [ngModel]="t.dominioOrigen"
                      (ngModelChange)="updateTraslacion(i, 'dominioOrigen', $event)"
                    />
                    <select
                      class="ht__select ht__select--tipo"
                      [ngModel]="t.fuenteTipo"
                      (ngModelChange)="updateTraslacion(i, 'fuenteTipo', $event)"
                    >
                      <option value="">Fuente…</option>
                      @for (f of fuentes; track f.value) {
                        <option [value]="f.value">{{ f.label }}</option>
                      }
                    </select>
                    <button class="ht__btn-remove" (click)="removeTraslacion(i)">
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                </div>

                <div class="ht__traslacion-body">
                  <div class="ht__field-row">
                    <div class="ht__field">
                      <p class="ht__field-label">Mecanismo subyacente</p>
                      <textarea
                        class="ht__textarea"
                        placeholder="¿Qué mecanismo o principio usan en ese dominio? (ej: sistema de niveles con progresión visible)"
                        [ngModel]="t.mecanismo"
                        (ngModelChange)="updateTraslacion(i, 'mecanismo', $event)"
                        rows="2"
                      ></textarea>
                    </div>
                    <div class="ht__field">
                      <p class="ht__field-label">¿Cómo lo resuelven allá?</p>
                      <textarea
                        class="ht__textarea"
                        placeholder="Descripción concreta de su solución en el dominio origen (ej: el jugador sube de nivel, desbloquea zonas y equipo exclusivo)"
                        [ngModel]="t.como"
                        (ngModelChange)="updateTraslacion(i, 'como', $event)"
                        rows="2"
                      ></textarea>
                    </div>
                  </div>

                  <div class="ht__arrow-row">
                    <div class="ht__arrow-line"></div>
                    <span class="ht__arrow-label">Traducción →</span>
                    <div class="ht__arrow-line"></div>
                  </div>

                  <div class="ht__field">
                    <p class="ht__field-label">¿Cómo se traduce a tu contexto?</p>
                    <textarea
                      class="ht__textarea ht__textarea--traduccion"
                      placeholder="¿Cómo adaptarías ese mecanismo al problema actual? (ej: en lugar de 'puntos canjeables', el usuario tiene 'nivel de miembro' que desbloquea beneficios exclusivos)"
                      [ngModel]="t.traduccion"
                      (ngModelChange)="updateTraslacion(i, 'traduccion', $event)"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Mecanismo clave e idea resultante -->
        <div class="ht__section">
          <label class="ht__label">Mecanismo clave trasladado</label>
          <input
            type="text"
            class="ht__input"
            placeholder="¿Cuál es el mecanismo central que se está trasladando? (ej: 'progresión con status visible')"
            [ngModel]="data().mecanismoClave"
            (ngModelChange)="patchData({ mecanismoClave: $event })"
          />
        </div>

        <div class="ht__section">
          <label class="ht__label">Idea resultante</label>
          <textarea
            class="ht__textarea ht__textarea--idea"
            placeholder="Describí la idea completa que surge de aplicar el(los) mecanismo(s) trasladado(s) a tu contexto. ¿Cómo funciona la solución?"
            [ngModel]="data().ideaResultante"
            (ngModelChange)="patchData({ ideaResultante: $event })"
            rows="4"
          ></textarea>
        </div>

      }
    </div>
  `,
  styles: [`
    .ht { display: flex; flex-direction: column; gap: 0; }

    .ht__header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; border-bottom: 1px solid #a5f3fc;
      background: linear-gradient(135deg, #ecfeff, #fff);
    }
    .ht__header-left { display: flex; align-items: center; gap: 10px; }
    .ht__badge {
      width: 34px; height: 34px; border-radius: 8px;
      background: linear-gradient(135deg, #0891b2, #06b6d4);
      color: #fff; font-size: 0.625rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      letter-spacing: 0.03em; flex-shrink: 0;
    }
    .ht__title { margin: 0; font-size: 0.875rem; font-weight: 700; color: #1f2937; }
    .ht__subtitle { margin: 0; font-size: 0.75rem; color: #6b7280; }
    .ht__saving { color: #06b6d4; font-style: italic; }

    .ht__header-actions { display: flex; gap: 8px; }
    .ht__btn-ghost {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 12px; border-radius: 8px; border: 1px solid #a5f3fc;
      background: transparent; font-size: 0.8125rem; color: #0891b2;
      cursor: pointer; transition: background 0.15s;
    }
    .ht__btn-ghost:hover { background: #ecfeff; }
    .ht__btn-primary {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 8px; border: none;
      background: linear-gradient(135deg, #0891b2, #06b6d4);
      color: #fff; font-size: 0.8125rem; font-weight: 600;
      cursor: pointer; transition: opacity 0.15s;
    }
    .ht__btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

    .ht__section { padding: 14px 16px; border-bottom: 1px solid #cffafe; }
    .ht__section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
    .ht__label {
      font-size: 0.6875rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: #0891b2; margin: 0 0 6px; display: block;
    }
    .ht__sublabel { font-size: 0.72rem; color: #9ca3af; margin: 0 0 10px; }

    .ht__textarea {
      width: 100%; border: 1px solid #a5f3fc; border-radius: 8px;
      padding: 8px 10px; font-size: 0.8125rem; color: #374151;
      background: #ecfeff; resize: vertical; box-sizing: border-box;
      font-family: inherit; line-height: 1.5;
    }
    .ht__textarea:focus { outline: none; border-color: #06b6d4; background: #fff; }
    .ht__textarea--problema { border-left: 3px solid #0891b2; margin-bottom: 10px; }
    .ht__textarea--idea { border-left: 3px solid #0891b2; }
    .ht__textarea--traduccion { border-left: 3px solid #06b6d4; background: #f0fdff; }

    .ht__input {
      width: 100%; border: 1px solid #a5f3fc; border-radius: 8px;
      padding: 7px 10px; font-size: 0.8125rem; color: #374151;
      background: #fff; box-sizing: border-box; font-family: inherit;
    }
    .ht__input:focus { outline: none; border-color: #06b6d4; }
    .ht__input--dominio { font-weight: 600; }

    .ht__select {
      border: 1px solid #a5f3fc; border-radius: 8px;
      padding: 7px 10px; font-size: 0.8rem; color: #374151;
      background: #fff; cursor: pointer; font-family: inherit;
    }
    .ht__select:focus { outline: none; border-color: #06b6d4; }
    .ht__select--tipo { flex-shrink: 0; }

    .ht__btn-add {
      display: flex; align-items: center; gap: 5px;
      padding: 5px 10px; border-radius: 6px;
      border: 1px dashed #06b6d4; background: transparent;
      font-size: 0.75rem; color: #0891b2; cursor: pointer; transition: all 0.15s;
    }
    .ht__btn-add:hover { background: #ecfeff; border-style: solid; }
    .ht__btn-remove {
      padding: 4px 6px; border-radius: 5px; border: none;
      background: transparent; color: #d1d5db; cursor: pointer; transition: color 0.15s;
    }
    .ht__btn-remove:hover { color: #ef4444; }

    .ht__empty {
      display: flex; flex-direction: column; align-items: center; gap: 6px;
      padding: 20px; color: #9ca3af; text-align: center;
    }
    .ht__empty i { font-size: 1.4rem; color: #a5f3fc; }
    .ht__empty p { font-size: 0.8125rem; margin: 0; max-width: 320px; }

    .ht__traslaciones { display: flex; flex-direction: column; gap: 12px; }
    .ht__traslacion {
      border: 1px solid #a5f3fc; border-radius: 10px;
      overflow: hidden; background: #f0fdff;
    }
    .ht__traslacion-header { padding: 10px 12px; border-bottom: 1px solid #cffafe; background: #ecfeff; }
    .ht__traslacion-top { display: flex; align-items: center; gap: 6px; }
    .ht__traslacion-top .ht__input { flex: 1; }

    .ht__traslacion-body { padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; }

    .ht__field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .ht__field { display: flex; flex-direction: column; gap: 4px; }
    .ht__field-label { font-size: 0.7rem; font-weight: 600; color: #0e7490; margin: 0; }

    .ht__arrow-row {
      display: flex; align-items: center; gap: 8px;
      margin: 2px 0;
    }
    .ht__arrow-line { flex: 1; height: 1px; background: #a5f3fc; }
    .ht__arrow-label {
      font-size: 0.72rem; font-weight: 700; color: #0891b2;
      white-space: nowrap; flex-shrink: 0;
    }
  `],
})
export class HibridacionTraslacionToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly hibridacionTraslacionService = inject(HibridacionTraslacionService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<HibridacionTraslacionData>({ ...EMPTY_HIBRIDACION_TRASLACION });
  reports = signal<HibridacionTraslacionReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  readonly fuentes = FUENTES_TRASLACION;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  canGenerate = computed(() => {
    const d = this.data();
    return d.problema.trim().length > 0 && d.traslaciones.length >= 1 && d.ideaResultante.trim().length > 0;
  });

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;
    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as HibridacionTraslacionData | undefined;
    const storedReports = (raw['reports'] as HibridacionTraslacionReportVersionDto[]) ?? [];
    this.data.set(stored ?? { ...EMPTY_HIBRIDACION_TRASLACION });
    this.reports.set(storedReports);
  }

  patchData(partial: Partial<HibridacionTraslacionData>): void {
    this.data.set({ ...this.data(), ...partial });
    this.scheduleSave();
  }

  addTraslacion(): void {
    const nueva: TraslacionDto = {
      id: crypto.randomUUID(),
      dominioOrigen: '',
      fuenteTipo: '',
      mecanismo: '',
      como: '',
      traduccion: '',
    };
    this.data.set({ ...this.data(), traslaciones: [...this.data().traslaciones, nueva] });
    this.scheduleSave();
  }

  removeTraslacion(index: number): void {
    this.data.set({ ...this.data(), traslaciones: this.data().traslaciones.filter((_, i) => i !== index) });
    this.scheduleSave();
  }

  updateTraslacion(index: number, field: keyof TraslacionDto, value: string): void {
    const traslaciones = this.data().traslaciones.map((t, i) =>
      i === index ? { ...t, [field]: value } : t,
    );
    this.data.set({ ...this.data(), traslaciones });
    this.scheduleSave();
  }

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;
    this.analyzing.set(true);
    try {
      const result = await this.hibridacionTraslacionService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });
      const newVersion: HibridacionTraslacionReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };
      const updated = [newVersion, ...this.reports()];
      this.reports.set(updated);
      await this.persistData(updated);
      this.showReport.set(true);
      this.uiDialog.showSuccess('Informe generado', 'El análisis de traslación fue generado correctamente.');
    } catch (error) {
      this.uiDialog.showError('Error', `No se pudo generar el informe: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      this.analyzing.set(false);
    }
  }

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

  private async persistData(reports: HibridacionTraslacionReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
