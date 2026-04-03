import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { DisenioEscenariosService } from '@core/services/disenioEscenariosService/disenio-escenarios.service';
import { DisenioEscenariosReportComponent } from './disenio-escenarios-report.component';
import {
  EMPTY_DISENIO_ESCENARIOS,
  EscenarioDto,
  DisenioEscenariosData,
  DisenioEscenariosReportVersionDto,
  PasoFlujoDto,
  TIPO_COLORS,
  TIPOS_ESCENARIO,
} from './disenio-escenarios.types';

@Component({
  selector: 'app-disenio-escenarios-tool',
  standalone: true,
  imports: [FormsModule, DisenioEscenariosReportComponent],
  template: `
    <div class="de">

      <!-- Header -->
      <div class="de__header">
        <div class="de__header-left">
          <span class="de__badge">DS</span>
          <div>
            <p class="de__title">Diseño de Escenarios</p>
            <p class="de__subtitle">
              {{ data().escenarios.length }} escenario{{ data().escenarios.length === 1 ? '' : 's' }}
              @if (escenariosConPasos() > 0) { · {{ escenariosConPasos() }} con flujo }
              @if (saving()) { <span class="de__saving"> · guardando…</span> }
            </p>
          </div>
        </div>
        <div class="de__header-actions">
          @if (reports().length > 0) {
            <button class="de__btn-ghost" (click)="showReport.set(!showReport())">
              <i class="pi pi-file-check"></i>
              Informes ({{ reports().length }})
            </button>
          }
          <button
            class="de__btn-primary"
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
        <app-disenio-escenarios-report [reports]="reports()" />
      } @else {

        <!-- Contexto general -->
        <div class="de__section">
          <label class="de__label">Contexto del producto / servicio</label>
          <textarea
            class="de__textarea de__textarea--contexto"
            placeholder="¿Qué producto o servicio estás diseñando? ¿Para quién? ¿Cuál es el contexto general? (ej: app de delivery para trabajadores de oficina en CDMX)"
            [ngModel]="data().contextoGeneral"
            (ngModelChange)="patchData({ contextoGeneral: $event })"
            rows="2"
          ></textarea>
        </div>

        <!-- Escenarios -->
        <div class="de__section">
          <div class="de__section-header">
            <p class="de__label">Escenarios</p>
            <button class="de__btn-add" (click)="addEscenario()">
              <i class="pi pi-plus"></i> Nuevo escenario
            </button>
          </div>

          @if (data().escenarios.length === 0) {
            <div class="de__empty">
              <i class="pi pi-map"></i>
              <p>Creá un escenario para visualizar cómo un usuario real interactúa con tu solución en una situación concreta.</p>
            </div>
          }

          <div class="de__escenarios">
            @for (e of data().escenarios; track e.id; let ei = $index) {
              <div class="de__escenario" [style.border-left-color]="tipoColor(e.tipo).border">
                <!-- Escenario header -->
                <div class="de__escenario-header" [style.background]="tipoColor(e.tipo).bg">
                  <div class="de__escenario-title-row">
                    <input
                      type="text"
                      class="de__input de__input--nombre"
                      placeholder="Nombre del escenario (ej: María pide comida desde el trabajo)"
                      [ngModel]="e.nombre"
                      (ngModelChange)="updateEscenario(ei, 'nombre', $event)"
                    />
                    <button class="de__btn-remove" (click)="removeEscenario(ei)">
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                  <div class="de__tipo-row">
                    @for (t of tiposEscenario; track t.value) {
                      <button
                        class="de__tipo-chip"
                        [class.de__tipo-chip--active]="e.tipo === t.value"
                        (click)="updateEscenario(ei, 'tipo', t.value)"
                      >{{ t.label }}</button>
                    }
                  </div>
                </div>

                <!-- Contexto del escenario -->
                <div class="de__escenario-body">
                  <div class="de__context-grid">
                    <div class="de__field">
                      <p class="de__field-label"><i class="pi pi-user"></i> Usuario</p>
                      <input
                        type="text"
                        class="de__input"
                        placeholder="¿Quién es? (ej: María, 32 años, diseñadora freelance)"
                        [ngModel]="e.usuario"
                        (ngModelChange)="updateEscenario(ei, 'usuario', $event)"
                      />
                    </div>
                    <div class="de__field">
                      <p class="de__field-label"><i class="pi pi-map-marker"></i> Dónde</p>
                      <input
                        type="text"
                        class="de__input"
                        placeholder="¿En qué contexto físico o digital?"
                        [ngModel]="e.donde"
                        (ngModelChange)="updateEscenario(ei, 'donde', $event)"
                      />
                    </div>
                    <div class="de__field">
                      <p class="de__field-label"><i class="pi pi-clock"></i> Cuándo</p>
                      <input
                        type="text"
                        class="de__input"
                        placeholder="¿En qué momento o circunstancia?"
                        [ngModel]="e.cuando"
                        (ngModelChange)="updateEscenario(ei, 'cuando', $event)"
                      />
                    </div>
                    <div class="de__field">
                      <p class="de__field-label"><i class="pi pi-target"></i> Objetivo</p>
                      <input
                        type="text"
                        class="de__input"
                        placeholder="¿Qué quiere lograr?"
                        [ngModel]="e.objetivo"
                        (ngModelChange)="updateEscenario(ei, 'objetivo', $event)"
                      />
                    </div>
                  </div>

                  <!-- Flujo de pasos -->
                  <div class="de__flujo">
                    <div class="de__flujo-header">
                      <p class="de__field-label">Flujo de pasos</p>
                      <button class="de__btn-add-small" (click)="addPaso(ei)">
                        <i class="pi pi-plus"></i> Paso
                      </button>
                    </div>

                    @if (e.pasos.length === 0) {
                      <p class="de__sublabel">Agregá los pasos que sigue el usuario — acción + emoción.</p>
                    }

                    <div class="de__pasos">
                      @for (p of e.pasos; track p.id; let pi = $index) {
                        <div class="de__paso">
                          <div class="de__paso-num">{{ pi + 1 }}</div>
                          <div class="de__paso-fields">
                            <input
                              type="text"
                              class="de__input de__input--accion"
                              placeholder="Acción del usuario → reacción del sistema (ej: Filtra por vegano → Ve opciones disponibles)"
                              [ngModel]="p.accion"
                              (ngModelChange)="updatePaso(ei, pi, 'accion', $event)"
                            />
                            <input
                              type="text"
                              class="de__input de__input--emocion"
                              placeholder="¿Qué siente? (ej: Alivio — 'ok, hay opciones')"
                              [ngModel]="p.emocion"
                              (ngModelChange)="updatePaso(ei, pi, 'emocion', $event)"
                            />
                          </div>
                          <button class="de__btn-remove de__btn-remove--sm" (click)="removePaso(ei, pi)">
                            <i class="pi pi-times"></i>
                          </button>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Oportunidades -->
                  <div class="de__oportunidades">
                    <div class="de__flujo-header">
                      <p class="de__field-label">Oportunidades de diseño</p>
                      <button class="de__btn-add-small" (click)="addOportunidad(ei)">
                        <i class="pi pi-plus"></i> Agregar
                      </button>
                    </div>
                    <div class="de__chips-input">
                      @for (o of e.oportunidades; track $index; let oi = $index) {
                        <div class="de__chip">
                          <input
                            type="text"
                            class="de__chip-input"
                            [ngModel]="o"
                            (ngModelChange)="updateOportunidad(ei, oi, $event)"
                            placeholder="Oportunidad o punto de mejora detectado…"
                          />
                          <button class="de__chip-remove" (click)="removeOportunidad(ei, oi)">
                            <i class="pi pi-times"></i>
                          </button>
                        </div>
                      }
                      @if (e.oportunidades.length === 0) {
                        <p class="de__sublabel">¿Dónde podés mejorar la experiencia? ¿Qué fricción encontraste?</p>
                      }
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

      }
    </div>
  `,
  styles: [`
    .de { display: flex; flex-direction: column; gap: 0; }

    .de__header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; border-bottom: 1px solid #fde68a;
      background: linear-gradient(135deg, #fffbeb, #fff);
    }
    .de__header-left { display: flex; align-items: center; gap: 10px; }
    .de__badge {
      width: 34px; height: 34px; border-radius: 8px;
      background: linear-gradient(135deg, #d97706, #f59e0b);
      color: #fff; font-size: 0.625rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      letter-spacing: 0.03em; flex-shrink: 0;
    }
    .de__title { margin: 0; font-size: 0.875rem; font-weight: 700; color: #1f2937; }
    .de__subtitle { margin: 0; font-size: 0.75rem; color: #6b7280; }
    .de__saving { color: #d97706; font-style: italic; }

    .de__header-actions { display: flex; gap: 8px; }
    .de__btn-ghost {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 12px; border-radius: 8px; border: 1px solid #fde68a;
      background: transparent; font-size: 0.8125rem; color: #d97706;
      cursor: pointer; transition: background 0.15s;
    }
    .de__btn-ghost:hover { background: #fffbeb; }
    .de__btn-primary {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 8px; border: none;
      background: linear-gradient(135deg, #d97706, #f59e0b);
      color: #fff; font-size: 0.8125rem; font-weight: 600;
      cursor: pointer; transition: opacity 0.15s;
    }
    .de__btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

    .de__section { padding: 14px 16px; border-bottom: 1px solid #fef3c7; }
    .de__section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .de__label {
      font-size: 0.6875rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: #d97706; margin: 0 0 6px; display: block;
    }
    .de__sublabel { font-size: 0.72rem; color: #9ca3af; margin: 0; }
    .de__field-label {
      display: flex; align-items: center; gap: 4px;
      font-size: 0.7rem; font-weight: 600; color: #92400e; margin: 0 0 4px;
    }
    .de__field-label .pi { font-size: 0.65rem; }

    .de__textarea {
      width: 100%; border: 1px solid #fde68a; border-radius: 8px;
      padding: 8px 10px; font-size: 0.8125rem; color: #374151;
      background: #fffbeb; resize: vertical; box-sizing: border-box;
      font-family: inherit; line-height: 1.5;
    }
    .de__textarea:focus { outline: none; border-color: #f59e0b; background: #fff; }
    .de__textarea--contexto { border-left: 3px solid #d97706; }

    .de__input {
      width: 100%; border: 1px solid #fde68a; border-radius: 8px;
      padding: 7px 10px; font-size: 0.8125rem; color: #374151;
      background: #fff; box-sizing: border-box; font-family: inherit;
    }
    .de__input:focus { outline: none; border-color: #f59e0b; }
    .de__input--nombre { font-weight: 600; font-size: 0.875rem; flex: 1; }
    .de__input--accion { flex: 2; }
    .de__input--emocion { flex: 1; border-left: 3px solid #f59e0b; background: #fffbeb; }

    .de__btn-add {
      display: flex; align-items: center; gap: 5px;
      padding: 5px 10px; border-radius: 6px;
      border: 1px dashed #f59e0b; background: transparent;
      font-size: 0.75rem; color: #d97706; cursor: pointer; transition: all 0.15s;
    }
    .de__btn-add:hover { background: #fffbeb; border-style: solid; }
    .de__btn-add-small {
      display: flex; align-items: center; gap: 4px;
      padding: 3px 8px; border-radius: 5px;
      border: 1px dashed #f59e0b; background: transparent;
      font-size: 0.7rem; color: #d97706; cursor: pointer; transition: all 0.15s;
    }
    .de__btn-add-small:hover { background: #fffbeb; border-style: solid; }
    .de__btn-remove {
      padding: 4px 6px; border-radius: 5px; border: none;
      background: transparent; color: #d1d5db; cursor: pointer; transition: color 0.15s;
    }
    .de__btn-remove:hover { color: #ef4444; }
    .de__btn-remove--sm { padding: 3px 5px; font-size: 0.7rem; }

    .de__empty {
      display: flex; flex-direction: column; align-items: center; gap: 6px;
      padding: 20px; color: #9ca3af; text-align: center;
    }
    .de__empty i { font-size: 1.4rem; color: #fde68a; }
    .de__empty p { font-size: 0.8125rem; margin: 0; max-width: 360px; }

    .de__escenarios { display: flex; flex-direction: column; gap: 14px; }
    .de__escenario {
      border: 1px solid #fde68a; border-left-width: 4px;
      border-radius: 10px; overflow: hidden; background: #fff;
    }
    .de__escenario-header { padding: 10px 12px; }
    .de__escenario-title-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .de__tipo-row { display: flex; flex-wrap: wrap; gap: 5px; }
    .de__tipo-chip {
      padding: 3px 8px; border-radius: 20px;
      border: 1px solid #e5e7eb; background: #fff;
      font-size: 0.7rem; color: #6b7280; cursor: pointer; transition: all 0.15s;
    }
    .de__tipo-chip:hover { border-color: #f59e0b; color: #d97706; }
    .de__tipo-chip--active {
      background: #d97706; border-color: #d97706;
      color: #fff; font-weight: 700;
    }

    .de__escenario-body { padding: 12px; display: flex; flex-direction: column; gap: 12px; }
    .de__context-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .de__field { display: flex; flex-direction: column; gap: 3px; }

    .de__flujo { display: flex; flex-direction: column; gap: 6px; }
    .de__flujo-header { display: flex; align-items: center; justify-content: space-between; }

    .de__pasos { display: flex; flex-direction: column; gap: 5px; }
    .de__paso {
      display: flex; align-items: center; gap: 6px;
    }
    .de__paso-num {
      width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
      background: #f59e0b; color: #fff;
      font-size: 0.65rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
    }
    .de__paso-fields { display: flex; gap: 6px; flex: 1; }

    .de__oportunidades { display: flex; flex-direction: column; gap: 6px; }
    .de__chips-input { display: flex; flex-direction: column; gap: 5px; }
    .de__chip {
      display: flex; align-items: center; gap: 6px;
      background: #fffbeb; border: 1px solid #fde68a;
      border-radius: 8px; padding: 4px 8px;
    }
    .de__chip-input {
      flex: 1; border: none; background: transparent;
      font-size: 0.8rem; color: #374151; font-family: inherit;
    }
    .de__chip-input:focus { outline: none; }
    .de__chip-remove {
      padding: 2px 4px; border: none; background: transparent;
      color: #d1d5db; cursor: pointer; font-size: 0.65rem; transition: color 0.15s;
    }
    .de__chip-remove:hover { color: #ef4444; }
  `],
})
export class DisenioEscenariosToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly disenioEscenariosService = inject(DisenioEscenariosService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<DisenioEscenariosData>({ ...EMPTY_DISENIO_ESCENARIOS });
  reports = signal<DisenioEscenariosReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  readonly tiposEscenario = TIPOS_ESCENARIO;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  canGenerate = computed(() => {
    const d = this.data();
    return d.escenarios.length >= 1 && d.escenarios.some(e => e.nombre.trim().length > 0 && e.pasos.length >= 1);
  });

  escenariosConPasos = computed(() => this.data().escenarios.filter(e => e.pasos.length > 0).length);

  tipoColor(tipo: string) {
    return TIPO_COLORS[tipo] ?? { bg: '#f9fafb', text: '#374151', border: '#e5e7eb' };
  }

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;
    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as DisenioEscenariosData | undefined;
    const storedReports = (raw['reports'] as DisenioEscenariosReportVersionDto[]) ?? [];
    this.data.set(stored ?? { ...EMPTY_DISENIO_ESCENARIOS });
    this.reports.set(storedReports);
  }

  patchData(partial: Partial<DisenioEscenariosData>): void {
    this.data.set({ ...this.data(), ...partial });
    this.scheduleSave();
  }

  addEscenario(): void {
    const nuevo: EscenarioDto = {
      id: crypto.randomUUID(),
      nombre: '',
      tipo: 'happy-path',
      usuario: '',
      donde: '',
      cuando: '',
      objetivo: '',
      pasos: [],
      oportunidades: [],
    };
    this.data.set({ ...this.data(), escenarios: [...this.data().escenarios, nuevo] });
    this.scheduleSave();
  }

  removeEscenario(index: number): void {
    this.data.set({ ...this.data(), escenarios: this.data().escenarios.filter((_, i) => i !== index) });
    this.scheduleSave();
  }

  updateEscenario(index: number, field: keyof EscenarioDto, value: string): void {
    const escenarios = this.data().escenarios.map((e, i) =>
      i === index ? { ...e, [field]: value } : e,
    );
    this.data.set({ ...this.data(), escenarios });
    this.scheduleSave();
  }

  addPaso(escIndex: number): void {
    const nuevo: PasoFlujoDto = {
      id: crypto.randomUUID(),
      accion: '',
      reaccionSistema: '',
      emocion: '',
    };
    const escenarios = this.data().escenarios.map((e, i) =>
      i === escIndex ? { ...e, pasos: [...e.pasos, nuevo] } : e,
    );
    this.data.set({ ...this.data(), escenarios });
    this.scheduleSave();
  }

  removePaso(escIndex: number, pasoIndex: number): void {
    const escenarios = this.data().escenarios.map((e, i) =>
      i === escIndex ? { ...e, pasos: e.pasos.filter((_, pi) => pi !== pasoIndex) } : e,
    );
    this.data.set({ ...this.data(), escenarios });
    this.scheduleSave();
  }

  updatePaso(escIndex: number, pasoIndex: number, field: keyof PasoFlujoDto, value: string): void {
    const escenarios = this.data().escenarios.map((e, i) => {
      if (i !== escIndex) return e;
      const pasos = e.pasos.map((p, pi) => pi === pasoIndex ? { ...p, [field]: value } : p);
      return { ...e, pasos };
    });
    this.data.set({ ...this.data(), escenarios });
    this.scheduleSave();
  }

  addOportunidad(escIndex: number): void {
    const escenarios = this.data().escenarios.map((e, i) =>
      i === escIndex ? { ...e, oportunidades: [...e.oportunidades, ''] } : e,
    );
    this.data.set({ ...this.data(), escenarios });
    this.scheduleSave();
  }

  removeOportunidad(escIndex: number, oIndex: number): void {
    const escenarios = this.data().escenarios.map((e, i) =>
      i === escIndex ? { ...e, oportunidades: e.oportunidades.filter((_, oi) => oi !== oIndex) } : e,
    );
    this.data.set({ ...this.data(), escenarios });
    this.scheduleSave();
  }

  updateOportunidad(escIndex: number, oIndex: number, value: string): void {
    const escenarios = this.data().escenarios.map((e, i) => {
      if (i !== escIndex) return e;
      const oportunidades = e.oportunidades.map((o, oi) => oi === oIndex ? value : o);
      return { ...e, oportunidades };
    });
    this.data.set({ ...this.data(), escenarios });
    this.scheduleSave();
  }

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;
    this.analyzing.set(true);
    try {
      const result = await this.disenioEscenariosService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });
      const newVersion: DisenioEscenariosReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };
      const updated = [newVersion, ...this.reports()];
      this.reports.set(updated);
      await this.persistData(updated);
      this.showReport.set(true);
      this.uiDialog.showSuccess('Informe generado', 'El análisis de escenarios fue generado correctamente.');
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

  private async persistData(reports: DisenioEscenariosReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
