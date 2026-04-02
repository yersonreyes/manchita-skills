import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { InsightsClusterService } from '@core/services/insightsClusterService/insights-cluster.service';
import { InsightsClusterReportComponent } from './insights-cluster-report.component';
import {
  EMPTY_INSIGHTS_CLUSTER,
  IMPACTO_COLORS,
  IMPACTO_LABELS,
  ImpactoInsight,
  InsightClusterDto,
  InsightItemDto,
  InsightsClusterData,
  InsightsClusterReportVersionDto,
} from './insights-cluster.types';

@Component({
  selector: 'app-insights-cluster-tool',
  standalone: true,
  imports: [FormsModule, InsightsClusterReportComponent],
  template: `
    <div class="ic">

      <!-- Header -->
      <div class="ic__header">
        <div class="ic__header-left">
          <span class="ic__badge">IC</span>
          <div>
            <p class="ic__title">Insights Cluster</p>
            <p class="ic__subtitle">
              {{ data().clusters.length }} cluster{{ data().clusters.length === 1 ? '' : 's' }},
              {{ totalInsights() }} insight{{ totalInsights() === 1 ? '' : 's' }}
              @if (saving()) { <span class="ic__saving">· guardando…</span> }
            </p>
          </div>
        </div>
        <div class="ic__header-actions">
          @if (reports().length > 0) {
            <button class="ic__btn-ghost" (click)="showReport.set(!showReport())">
              <i class="pi pi-file-check"></i>
              Informes ({{ reports().length }})
            </button>
          }
          <button
            class="ic__btn-primary"
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

      <!-- Contexto -->
      <div class="ic__context">
        <label class="ic__label">Contexto de la investigación (opcional)</label>
        <textarea
          class="ic__textarea"
          rows="2"
          placeholder="Ej: 20 entrevistas con usuarios de e-commerce + 2 focus groups. El objetivo era entender barreras en el proceso de compra…"
          [ngModel]="data().contexto"
          (ngModelChange)="updateContexto($event)"
        ></textarea>
      </div>

      <!-- Report -->
      @if (showReport()) {
        <div class="ic__report-wrap">
          <app-insights-cluster-report [reports]="reports()" />
        </div>
      }

      <!-- Clusters -->
      <div class="ic__clusters">
        @for (cluster of data().clusters; track cluster.id; let ci = $index) {
          <div class="ic__cluster">
            <!-- Cluster header -->
            <div class="ic__cluster-header">
              <input
                class="ic__cluster-name"
                type="text"
                placeholder="Nombre del cluster (ej: Facilidad de Uso)"
                [ngModel]="cluster.nombre"
                (ngModelChange)="updateClusterNombre(ci, $event)"
              />
              <button class="ic__cluster-delete" (click)="removeCluster(ci)" title="Eliminar cluster">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <!-- Insights del cluster -->
            <div class="ic__insights">
              @for (insight of cluster.insights; track insight.id; let ii = $index) {
                <div class="ic__insight">
                  <span
                    class="ic__insight-badge"
                    [style.background]="impactoColor(insight.impacto).bg"
                    [style.color]="impactoColor(insight.impacto).text"
                  >
                    {{ impactoLabel(insight.impacto) }}
                  </span>
                  <p class="ic__insight-text">{{ insight.texto }}</p>
                  <button class="ic__insight-delete" (click)="removeInsight(ci, ii)" title="Eliminar insight">
                    <i class="pi pi-times"></i>
                  </button>
                </div>
              }
            </div>

            <!-- Add insight form -->
            <div class="ic__add-insight">
              <select
                class="ic__select"
                [ngModel]="newImpactos()[cluster.id] ?? 'alto'"
                (ngModelChange)="setNewImpacto(cluster.id, $event)"
              >
                <option value="alto">Alto</option>
                <option value="medio">Medio</option>
                <option value="bajo">Bajo</option>
              </select>
              <input
                class="ic__insight-input"
                type="text"
                placeholder="Escribí el insight y presioná Enter…"
                [ngModel]="newTexts()[cluster.id] ?? ''"
                (ngModelChange)="setNewText(cluster.id, $event)"
                (keydown.enter)="addInsight(ci)"
              />
              <button
                class="ic__add-insight-btn"
                [disabled]="!(newTexts()[cluster.id]?.trim())"
                (click)="addInsight(ci)"
              >
                <i class="pi pi-plus"></i>
              </button>
            </div>
          </div>
        }

        <!-- Add cluster -->
        <button class="ic__add-cluster" (click)="addCluster()">
          <i class="pi pi-plus"></i>
          Agregar cluster
        </button>
      </div>

    </div>
  `,
  styles: [`
    .ic { display: flex; flex-direction: column; gap: 16px; }

    .ic__header {
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px; flex-wrap: wrap;
    }
    .ic__header-left { display: flex; align-items: center; gap: 10px; }
    .ic__badge {
      width: 36px; height: 36px; border-radius: 10px;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: #fff; font-size: 0.7rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      letter-spacing: 0.02em; flex-shrink: 0;
    }
    .ic__title { margin: 0; font-size: 0.9375rem; font-weight: 700; color: #111827; }
    .ic__subtitle { margin: 0; font-size: 0.78rem; color: #6b7280; }
    .ic__saving { color: #6366f1; }

    .ic__header-actions { display: flex; gap: 8px; align-items: center; }

    .ic__btn-ghost {
      display: flex; align-items: center; gap: 5px;
      padding: 6px 12px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: transparent;
      font-size: 0.8125rem; color: var(--p-text-color); cursor: pointer;
      transition: background 0.15s;
    }
    .ic__btn-ghost:hover { background: var(--p-surface-100); }

    .ic__btn-primary {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 8px; border: none;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: #fff; font-size: 0.8125rem; font-weight: 600; cursor: pointer;
      transition: opacity 0.15s;
    }
    .ic__btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
    .ic__btn-primary:not(:disabled):hover { opacity: 0.9; }

    .ic__context { display: flex; flex-direction: column; gap: 4px; }
    .ic__label { font-size: 0.78rem; font-weight: 600; color: #6b7280; }

    .ic__textarea {
      width: 100%; box-sizing: border-box;
      padding: 8px 10px; border-radius: 8px;
      border: 1px solid var(--p-surface-300); background: var(--p-surface-0);
      font-size: 0.8125rem; color: var(--p-text-color); line-height: 1.5;
      resize: vertical; font-family: inherit;
      transition: border-color 0.15s;
    }
    .ic__textarea:focus { outline: none; border-color: #6366f1; }

    .ic__report-wrap { border-radius: 10px; overflow: hidden; }

    .ic__clusters { display: flex; flex-direction: column; gap: 12px; }

    .ic__cluster {
      border: 1px solid var(--p-surface-200); border-radius: 12px;
      background: var(--p-surface-50); overflow: hidden;
    }

    .ic__cluster-header {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 12px; border-bottom: 1px solid var(--p-surface-200);
      background: var(--p-surface-0);
    }

    .ic__cluster-name {
      flex: 1; padding: 5px 8px; border-radius: 6px;
      border: 1px solid transparent; background: transparent;
      font-size: 0.875rem; font-weight: 700; color: #4338ca;
      font-family: inherit; transition: border-color 0.15s, background 0.15s;
    }
    .ic__cluster-name:hover { border-color: #c7d2fe; background: #eef2ff; }
    .ic__cluster-name:focus { outline: none; border-color: #6366f1; background: #eef2ff; }
    .ic__cluster-name::placeholder { color: #a5b4fc; font-weight: 400; }

    .ic__cluster-delete {
      width: 24px; height: 24px; border-radius: 6px; border: none;
      background: transparent; color: #9ca3af;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; flex-shrink: 0; transition: color 0.15s, background 0.15s;
    }
    .ic__cluster-delete:hover { color: #ef4444; background: #fee2e2; }
    .ic__cluster-delete .pi { font-size: 0.7rem; }

    .ic__insights { display: flex; flex-direction: column; gap: 0; }

    .ic__insight {
      display: flex; align-items: flex-start; gap: 8px;
      padding: 8px 12px; border-bottom: 1px solid var(--p-surface-100);
    }

    .ic__insight-badge {
      flex-shrink: 0; padding: 2px 6px; border-radius: 4px;
      font-size: 0.675rem; font-weight: 700; letter-spacing: 0.04em;
      text-transform: uppercase; margin-top: 1px;
    }

    .ic__insight-text {
      flex: 1; margin: 0; font-size: 0.8125rem; color: var(--p-text-color);
      line-height: 1.5;
    }

    .ic__insight-delete {
      width: 20px; height: 20px; border-radius: 4px; border: none;
      background: transparent; color: #d1d5db;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; flex-shrink: 0; margin-top: 2px;
      transition: color 0.15s, background 0.15s;
    }
    .ic__insight-delete:hover { color: #ef4444; background: #fee2e2; }
    .ic__insight-delete .pi { font-size: 0.6rem; }

    .ic__add-insight {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 12px;
    }

    .ic__select {
      flex-shrink: 0; padding: 5px 6px; border-radius: 6px;
      border: 1px solid var(--p-surface-300); background: var(--p-surface-0);
      font-size: 0.775rem; color: var(--p-text-color); font-family: inherit;
      transition: border-color 0.15s;
    }
    .ic__select:focus { outline: none; border-color: #6366f1; }

    .ic__insight-input {
      flex: 1; padding: 5px 8px; border-radius: 6px;
      border: 1px solid var(--p-surface-300); background: var(--p-surface-0);
      font-size: 0.8rem; color: var(--p-text-color); font-family: inherit;
      transition: border-color 0.15s;
    }
    .ic__insight-input:focus { outline: none; border-color: #6366f1; }

    .ic__add-insight-btn {
      width: 28px; height: 28px; border-radius: 6px; border: none;
      background: #6366f1; color: #fff; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: opacity 0.15s;
    }
    .ic__add-insight-btn:disabled { opacity: 0.35; cursor: not-allowed; }
    .ic__add-insight-btn:not(:disabled):hover { opacity: 0.85; }
    .ic__add-insight-btn .pi { font-size: 0.7rem; }

    .ic__add-cluster {
      display: flex; align-items: center; gap: 6px; justify-content: center;
      width: 100%; padding: 10px; border-radius: 12px;
      border: 2px dashed #c7d2fe; background: transparent;
      font-size: 0.8125rem; color: #6366f1; cursor: pointer;
      transition: background 0.15s;
    }
    .ic__add-cluster:hover { background: #eef2ff; }
    .ic__add-cluster .pi { font-size: 0.75rem; }
  `],
})
export class InsightsClusterToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly insightsClusterService = inject(InsightsClusterService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  data = signal<InsightsClusterData>({ ...EMPTY_INSIGHTS_CLUSTER });
  reports = signal<InsightsClusterReportVersionDto[]>([]);
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  // Buffers para los campos de nuevo insight por cluster (key = cluster.id)
  newTexts = signal<Record<string, string | undefined>>({});
  newImpactos = signal<Record<string, ImpactoInsight | undefined>>({});

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  totalInsights = computed(() =>
    this.data().clusters.reduce((sum, c) => sum + c.insights.length, 0)
  );

  canGenerate = computed(() =>
    this.data().clusters.filter(c => c.insights.length > 0).length >= 2
  );

  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;
    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const stored = raw['data'] as InsightsClusterData | undefined;
    const storedReports = (raw['reports'] as InsightsClusterReportVersionDto[]) ?? [];
    this.data.set(stored ?? { ...EMPTY_INSIGHTS_CLUSTER });
    this.reports.set(storedReports);
  }

  impactoLabel(impacto: ImpactoInsight): string {
    return IMPACTO_LABELS[impacto];
  }

  impactoColor(impacto: ImpactoInsight): { bg: string; text: string } {
    return IMPACTO_COLORS[impacto];
  }

  updateContexto(value: string): void {
    this.data.set({ ...this.data(), contexto: value });
    this.scheduleSave();
  }

  addCluster(): void {
    const newCluster: InsightClusterDto = {
      id: crypto.randomUUID(),
      nombre: '',
      insights: [],
    };
    this.data.set({ ...this.data(), clusters: [...this.data().clusters, newCluster] });
    this.scheduleSave();
  }

  updateClusterNombre(index: number, nombre: string): void {
    const clusters = this.data().clusters.map((c, i) => i === index ? { ...c, nombre } : c);
    this.data.set({ ...this.data(), clusters });
    this.scheduleSave();
  }

  removeCluster(index: number): void {
    const clusters = this.data().clusters.filter((_, i) => i !== index);
    this.data.set({ ...this.data(), clusters });
    this.scheduleSave();
  }

  setNewText(clusterId: string, value: string): void {
    this.newTexts.set({ ...this.newTexts(), [clusterId]: value });
  }

  setNewImpacto(clusterId: string, value: ImpactoInsight): void {
    this.newImpactos.set({ ...this.newImpactos(), [clusterId]: value });
  }

  addInsight(clusterIndex: number): void {
    const cluster = this.data().clusters[clusterIndex];
    if (!cluster) return;
    const texto = this.newTexts()[cluster.id]?.trim();
    if (!texto) return;
    const impacto = this.newImpactos()[cluster.id] ?? 'alto';
    const newInsight: InsightItemDto = {
      id: crypto.randomUUID(),
      texto,
      impacto,
    };
    const clusters = this.data().clusters.map((c, i) =>
      i === clusterIndex ? { ...c, insights: [...c.insights, newInsight] } : c
    );
    this.data.set({ ...this.data(), clusters });
    // Limpiar buffer
    const texts = { ...this.newTexts() };
    delete texts[cluster.id];
    this.newTexts.set(texts);
    this.scheduleSave();
  }

  removeInsight(clusterIndex: number, insightIndex: number): void {
    const clusters = this.data().clusters.map((c, ci) =>
      ci === clusterIndex
        ? { ...c, insights: c.insights.filter((_, ii) => ii !== insightIndex) }
        : c
    );
    this.data.set({ ...this.data(), clusters });
    this.scheduleSave();
  }

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;
    this.analyzing.set(true);
    try {
      const result = await this.insightsClusterService.analyze({
        toolApplicationId: app.id,
        data: this.data(),
        currentVersion: this.reports().length,
      });
      const newVersion: InsightsClusterReportVersionDto = {
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

  private async persistData(reports: InsightsClusterReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;
    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, data: this.data(), reports },
    });
    this.sessionSaved.emit();
  }
}
