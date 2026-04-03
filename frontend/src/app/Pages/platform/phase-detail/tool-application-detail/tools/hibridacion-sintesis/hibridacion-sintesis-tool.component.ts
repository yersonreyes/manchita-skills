import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { HibridacionSintesisService } from '@core/services/hibridacionSintesisService/hibridacion-sintesis.service';
import { HibridacionSintesisReportComponent } from './hibridacion-sintesis-report.component';
import {
  ConceptoBaseDto,
  EMPTY_HIBRIDACION_SINTESIS,
  HibridacionSintesisData,
  HibridacionSintesisReportVersionDto,
  NIVELES_SINTESIS,
} from './hibridacion-sintesis.types';

@Component({
  selector: 'app-hibridacion-sintesis-tool',
  standalone: true,
  imports: [FormsModule, HibridacionSintesisReportComponent],
  template: `
    <div class="hs">

      <!-- Header -->
      <div class="hs__header">
        <div class="hs__header-left">
          <span class="hs__badge">HS</span>
          <div>
            <p class="hs__title">Hibridación por Síntesis</p>
            <p class="hs__subtitle">
              {{ data().conceptosBase.length }} concepto{{ data().conceptosBase.length === 1 ? '' : 's' }} base
              @if (data().nivelSintesis) { · nivel {{ nivelLabel() }} }
              @if (data().ideaSintetizada.trim()) { · idea sintetizada definida }
              @if (saving()) { <span class="hs__saving"> · guardando…</span> }
            </p>
          </div>
        </div>
        <div class="hs__header-actions">
          @if (reports().length > 0) {
            <button class="hs__btn-ghost" (click)="showReport.set(!showReport())">
              <i class="pi pi-file-check"></i>
              Informes ({{ reports().length }})
            </button>
          }
          <button
            class="hs__btn-primary"
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
        <app-hibridacion-sintesis-report [reports]="reports()" />
      } @else {

        <!-- Contexto -->
        <div class="hs__section">
          <label class="hs__label">Contexto / desafío</label>
          <textarea
            class="hs__textarea hs__textarea--contexto"
            placeholder="¿Qué problema o desafío buscan resolver? ¿Qué tipo de innovación necesitan? (ej: rediseñar el modelo de aprendizaje universitario)"
            [ngModel]="data().contexto"
            (ngModelChange)="patchData({ contexto: $event })"
            rows="2"
          ></textarea>
        </div>

        <!-- Conceptos base -->
        <div class="hs__section">
          <div class="hs__section-header">
            <p class="hs__label">Conceptos base a sintetizar</p>
            <button class="hs__btn-add" (click)="addConcepto()">
              <i class="pi pi-plus"></i> Agregar concepto
            </button>
          </div>
          <p class="hs__sublabel">
            En síntesis, no sumás conceptos — los fusionás para crear algo cualitativamente nuevo.
            Identificá la ESENCIA de cada uno: ¿qué hace que funcione?
          </p>

          @if (data().conceptosBase.length === 0) {
            <div class="hs__empty">
              <i class="pi pi-objects-column"></i>
              <p>¿Cuáles son los dos o más conceptos que van a sintetizar? No busquen similitudes — busquen tensión creativa.</p>
            </div>
          }

          <div class="hs__conceptos">
            @for (c of data().conceptosBase; track c.id; let i = $index) {
              <div class="hs__concepto">
                <div class="hs__concepto-header">
                  <div class="hs__concepto-num">{{ i + 1 }}</div>
                  <input
                    type="text"
                    class="hs__input hs__input--nombre"
                    placeholder="Nombre del concepto (ej: Universidad, Videojuego, Sistema inmunológico…)"
                    [ngModel]="c.nombre"
                    (ngModelChange)="updateConcepto(i, 'nombre', $event)"
                  />
                  <button class="hs__btn-remove" (click)="removeConcepto(i)">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
                <div class="hs__concepto-body">
                  <div class="hs__field">
                    <p class="hs__field-label">Descripción breve</p>
                    <textarea
                      class="hs__textarea"
                      placeholder="¿Qué es y cómo funciona este concepto?"
                      [ngModel]="c.descripcion"
                      (ngModelChange)="updateConcepto(i, 'descripcion', $event)"
                      rows="2"
                    ></textarea>
                  </div>
                  <div class="hs__field-row">
                    <div class="hs__field">
                      <p class="hs__field-label">Esencia (¿qué lo hace funcionar?)</p>
                      <textarea
                        class="hs__textarea hs__textarea--esencia"
                        placeholder="¿Cuál es el principio subyacente? (ej: 'credencial de conocimiento + progresión por niveles + comunidad de pares')"
                        [ngModel]="c.esencia"
                        (ngModelChange)="updateConcepto(i, 'esencia', $event)"
                        rows="2"
                      ></textarea>
                    </div>
                    <div class="hs__field">
                      <p class="hs__field-label">¿Qué aporta a la síntesis?</p>
                      <textarea
                        class="hs__textarea hs__textarea--contribucion"
                        placeholder="¿Qué elemento de este concepto querés llevar a la síntesis? (ej: 'el sistema de progresión visible y el status social de los logros')"
                        [ngModel]="c.contribucion"
                        (ngModelChange)="updateConcepto(i, 'contribucion', $event)"
                        rows="2"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Puntos de conexión -->
        <div class="hs__section">
          <div class="hs__section-header">
            <p class="hs__label">Puntos de conexión entre conceptos</p>
            <button class="hs__btn-add" (click)="addPuntoConexion()">
              <i class="pi pi-plus"></i> Agregar
            </button>
          </div>
          <p class="hs__sublabel">
            ¿En qué aspectos los conceptos se TOCAN aunque sean de mundos distintos?
            Esos puntos de tensión creativa son donde nace la síntesis.
          </p>
          <div class="hs__chips-input">
            @for (punto of data().puntosConexion; track $index; let i = $index) {
              <div class="hs__chip">
                <input
                  type="text"
                  class="hs__chip-input"
                  [ngModel]="punto"
                  (ngModelChange)="updatePuntoConexion(i, $event)"
                  placeholder="Punto de conexión…"
                />
                <button class="hs__chip-remove" (click)="removePuntoConexion(i)">
                  <i class="pi pi-times"></i>
                </button>
              </div>
            }
            @if (data().puntosConexion.length === 0) {
              <p class="hs__sublabel">Ej: "Ambos crean progresión y status visible", "Los dos generan comunidades de práctica"</p>
            }
          </div>
        </div>

        <!-- Nivel de síntesis -->
        <div class="hs__section">
          <label class="hs__label">Nivel de síntesis</label>
          <p class="hs__sublabel">¿En qué nivel opera la fusión que están creando?</p>
          <div class="hs__niveles">
            @for (n of niveles; track n.value) {
              <button
                class="hs__nivel-btn"
                [class.hs__nivel-btn--active]="data().nivelSintesis === n.value"
                (click)="patchData({ nivelSintesis: n.value })"
              >
                <span class="hs__nivel-label">{{ n.label }}</span>
              </button>
            }
          </div>
        </div>

        <!-- Idea sintetizada -->
        <div class="hs__section">
          <label class="hs__label">Idea sintetizada</label>
          <p class="hs__sublabel">
            Describí la nueva idea que surge de la síntesis. No es "A más B" — es algo nuevo que no
            existiría sin la fusión de ambos conceptos.
          </p>
          <textarea
            class="hs__textarea hs__textarea--idea"
            placeholder="¿Cómo funciona la nueva idea? ¿Qué la hace cualitativamente diferente a sus conceptos origen? (ej: 'plataforma de aprendizaje donde las credenciales académicas son logros coleccionables ligados a proyectos reales, con rankings por industria y guild de mentores')"
            [ngModel]="data().ideaSintetizada"
            (ngModelChange)="patchData({ ideaSintetizada: $event })"
            rows="4"
          ></textarea>
        </div>

        <!-- Nuevo paradigma -->
        <div class="hs__section">
          <label class="hs__label">Nuevo paradigma (opcional)</label>
          <input
            type="text"
            class="hs__input"
            placeholder="¿Cómo nominarías el nuevo modelo mental que crea esta síntesis? (ej: 'aprendizaje gamificado con credenciales de industria')"
            [ngModel]="data().nuevoParadigma"
            (ngModelChange)="patchData({ nuevoParadigma: $event })"
          />
        </div>

      }
    </div>
  `,
  styles: [`
    .hs { display: flex; flex-direction: column; gap: 0; }

    .hs__header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; border-bottom: 1px solid #c7d2fe;
      background: linear-gradient(135deg, #eef2ff, #fff);
    }
    .hs__header-left { display: flex; align-items: center; gap: 10px; }
    .hs__badge {
      width: 34px; height: 34px; border-radius: 8px;
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      color: #fff; font-size: 0.625rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      letter-spacing: 0.03em; flex-shrink: 0;
    }
    .hs__title { margin: 0; font-size: 0.875rem; font-weight: 700; color: #1f2937; }
    .hs__subtitle { margin: 0; font-size: 0.75rem; color: #6b7280; }
    .hs__saving { color: #6366f1; font-style: italic; }

    .hs__header-actions { display: flex; gap: 8px; }
    .hs__btn-ghost {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 12px; border-radius: 8px; border: 1px solid #c7d2fe;
      background: transparent; font-size: 0.8125rem; color: #4f46e5;
      cursor: pointer; transition: background 0.15s;
    }
    .hs__btn-ghost:hover { background: #eef2ff; }
    .hs__btn-primary {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 8px; border: none;
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      color: #fff; font-size: 0.8125rem; font-weight: 600;
      cursor: pointer; transition: opacity 0.15s;
    }
    .hs__btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

    .hs__section { padding: 14px 16px; border-bottom: 1px solid #e0e7ff; }
    .hs__section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
    .hs__label {
      font-size: 0.6875rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: #4f46e5; margin: 0 0 6px; display: block;
    }
    .hs__sublabel { font-size: 0.72rem; color: #9ca3af; margin: 0 0 10px; }

    .hs__textarea {
      width: 100%; border: 1px solid #c7d2fe; border-radius: 8px;
      padding: 8px 10px; font-size: 0.8125rem; color: #374151;
      background: #eef2ff; resize: vertical; box-sizing: border-box;
      font-family: inherit; line-height: 1.5;
    }
    .hs__textarea:focus { outline: none; border-color: #6366f1; background: #fff; }
    .hs__textarea--contexto { border-left: 3px solid #4f46e5; }
    .hs__textarea--esencia { border-left: 3px solid #6366f1; background: #f5f3ff; }
    .hs__textarea--contribucion { border-left: 3px solid #818cf8; background: #f5f3ff; }
    .hs__textarea--idea { border-left: 3px solid #4f46e5; }

    .hs__input {
      width: 100%; border: 1px solid #c7d2fe; border-radius: 8px;
      padding: 7px 10px; font-size: 0.8125rem; color: #374151;
      background: #fff; box-sizing: border-box; font-family: inherit;
    }
    .hs__input:focus { outline: none; border-color: #6366f1; }
    .hs__input--nombre { font-weight: 600; }

    .hs__btn-add {
      display: flex; align-items: center; gap: 5px;
      padding: 5px 10px; border-radius: 6px;
      border: 1px dashed #6366f1; background: transparent;
      font-size: 0.75rem; color: #4f46e5; cursor: pointer; transition: all 0.15s;
    }
    .hs__btn-add:hover { background: #eef2ff; border-style: solid; }
    .hs__btn-remove {
      padding: 4px 6px; border-radius: 5px; border: none;
      background: transparent; color: #d1d5db; cursor: pointer; transition: color 0.15s;
    }
    .hs__btn-remove:hover { color: #ef4444; }

    .hs__empty {
      display: flex; flex-direction: column; align-items: center; gap: 6px;
      padding: 20px; color: #9ca3af; text-align: center;
    }
    .hs__empty i { font-size: 1.4rem; color: #c7d2fe; }
    .hs__empty p { font-size: 0.8125rem; margin: 0; max-width: 340px; }

    .hs__conceptos { display: flex; flex-direction: column; gap: 12px; }
    .hs__concepto {
      border: 1px solid #c7d2fe; border-radius: 10px;
      overflow: hidden; background: #f5f3ff;
    }
    .hs__concepto-header {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 12px; border-bottom: 1px solid #e0e7ff; background: #eef2ff;
    }
    .hs__concepto-num {
      width: 22px; height: 22px; border-radius: 50%;
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      color: #fff; font-size: 0.6875rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .hs__concepto-header .hs__input { flex: 1; }
    .hs__concepto-body { padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; }

    .hs__field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .hs__field { display: flex; flex-direction: column; gap: 4px; }
    .hs__field-label { font-size: 0.7rem; font-weight: 600; color: #4338ca; margin: 0; }

    .hs__chips-input { display: flex; flex-direction: column; gap: 6px; }
    .hs__chip {
      display: flex; align-items: center; gap: 6px;
      background: #eef2ff; border: 1px solid #c7d2fe;
      border-radius: 8px; padding: 4px 8px;
    }
    .hs__chip-input {
      flex: 1; border: none; background: transparent;
      font-size: 0.8125rem; color: #374151; font-family: inherit;
    }
    .hs__chip-input:focus { outline: none; }
    .hs__chip-remove {
      padding: 2px 4px; border: none; background: transparent;
      color: #a5b4fc; cursor: pointer; font-size: 0.65rem; transition: color 0.15s;
    }
    .hs__chip-remove:hover { color: #ef4444; }

    .hs__niveles { display: flex; flex-direction: column; gap: 6px; }
    .hs__nivel-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 9px 12px; border-radius: 8px;
      border: 1px solid #c7d2fe; background: #fff;
      cursor: pointer; transition: all 0.15s; text-align: left;
    }
    .hs__nivel-btn:hover { background: #eef2ff; border-color: #a5b4fc; }
    .hs__nivel-btn--active { background: #eef2ff; border-color: #4f46e5; border-width: 2px; }
    .hs__nivel-label { font-size: 0.8125rem; color: #374151; font-weight: 500; }
    .hs__nivel-btn--active .hs__nivel-label { color: #4f46e5; font-weight: 700; }
  `],
})
export class HibridacionSintesisToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly hibridacionSintesisService = inject(HibridacionSintesisService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<HibridacionSintesisData>({ ...EMPTY_HIBRIDACION_SINTESIS });
  reports = signal<HibridacionSintesisReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  readonly niveles = NIVELES_SINTESIS;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  canGenerate = computed(() => {
    const d = this.data();
    return (
      d.conceptosBase.length >= 2 &&
      d.nivelSintesis.length > 0 &&
      d.ideaSintetizada.trim().length > 0
    );
  });

  nivelLabel = computed(() => {
    const n = NIVELES_SINTESIS.find(n => n.value === this.data().nivelSintesis);
    return n ? n.label.split(' — ')[0] : '';
  });

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;
    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as HibridacionSintesisData | undefined;
    const storedReports = (raw['reports'] as HibridacionSintesisReportVersionDto[]) ?? [];
    this.data.set(stored ?? { ...EMPTY_HIBRIDACION_SINTESIS });
    this.reports.set(storedReports);
  }

  patchData(partial: Partial<HibridacionSintesisData>): void {
    this.data.set({ ...this.data(), ...partial });
    this.scheduleSave();
  }

  addConcepto(): void {
    const nuevo: ConceptoBaseDto = {
      id: crypto.randomUUID(),
      nombre: '',
      descripcion: '',
      esencia: '',
      contribucion: '',
    };
    this.data.set({ ...this.data(), conceptosBase: [...this.data().conceptosBase, nuevo] });
    this.scheduleSave();
  }

  removeConcepto(index: number): void {
    this.data.set({ ...this.data(), conceptosBase: this.data().conceptosBase.filter((_, i) => i !== index) });
    this.scheduleSave();
  }

  updateConcepto(index: number, field: keyof ConceptoBaseDto, value: string): void {
    const conceptosBase = this.data().conceptosBase.map((c, i) =>
      i === index ? { ...c, [field]: value } : c,
    );
    this.data.set({ ...this.data(), conceptosBase });
    this.scheduleSave();
  }

  addPuntoConexion(): void {
    this.data.set({ ...this.data(), puntosConexion: [...this.data().puntosConexion, ''] });
    this.scheduleSave();
  }

  removePuntoConexion(index: number): void {
    this.data.set({ ...this.data(), puntosConexion: this.data().puntosConexion.filter((_, i) => i !== index) });
    this.scheduleSave();
  }

  updatePuntoConexion(index: number, value: string): void {
    const puntosConexion = this.data().puntosConexion.map((p, i) => i === index ? value : p);
    this.data.set({ ...this.data(), puntosConexion });
    this.scheduleSave();
  }

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;
    this.analyzing.set(true);
    try {
      const result = await this.hibridacionSintesisService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });
      const newVersion: HibridacionSintesisReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };
      const updated = [newVersion, ...this.reports()];
      this.reports.set(updated);
      await this.persistData(updated);
      this.showReport.set(true);
      this.uiDialog.showSuccess('Informe generado', 'El análisis de síntesis fue generado correctamente.');
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

  private async persistData(reports: HibridacionSintesisReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
