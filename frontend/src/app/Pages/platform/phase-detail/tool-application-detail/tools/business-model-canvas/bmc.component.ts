import { Component, OnChanges, inject, input, output, signal, computed } from '@angular/core';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { BmcService } from '@core/services/bmcService/bmc.service';
import { BmcBlocksDto } from '@core/services/bmcService/bmc.req.dto';
import { BmcReportVersionDto } from '@core/services/bmcService/bmc.res.dto';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { BmcCanvasComponent } from './bmc-canvas.component';
import { BmcBlockEditorComponent, BmcFieldChange } from './bmc-block-editor.component';
import { BmcReportComponent } from './bmc-report.component';
import { BMC_BLOCKS, BMC_BLOCKS_MAP, REQUIRED_BLOCK_KEYS } from './bmc-config';
import { Tooltip } from 'primeng/tooltip';

const EMPTY_BLOCKS: BmcBlocksDto = {
  propuestaDeValor:      { problemasQueResuelve: '', beneficiosClave: '', productoServicio: '' },
  segmentosDeClientes:   { clientePrincipal: '', caracteristicas: '', necesidadQueResuelves: '' },
  canales:               { comoLlegasAlCliente: '', etapaDelFunnel: '', costoEficiencia: '' },
  relacionesConClientes: { tipoDeRelacion: '', adquisicion: '', retencion: '' },
  fuentesDeIngreso:      { comoGenerasIngresos: '', modeloDePrecio: '', disposicionAPagar: '' },
  recursosClaves:        { recursosNecesarios: '', tipoDeRecurso: '', masCritico: '' },
  actividadesClaves:     { actividadesPrincipales: '', produccionVsServicio: '', diferenciadoras: '' },
  asociacionesClaves:    { sociosPrincipales: '', queTercerizan: '', motivacion: '' },
  estructuraDeCostos:    { costosPrincipales: '', costosFijosVsVariables: '', economiaDeEscala: '' },
};

@Component({
  selector: 'app-bmc',
  standalone: true,
  imports: [BmcCanvasComponent, BmcBlockEditorComponent, BmcReportComponent, Tooltip],
  templateUrl: './bmc.component.html',
  styleUrl: './bmc.component.sass',
})
export class BmcComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly bmcService = inject(BmcService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  // ─── Estado ──────────────────────────────────────────────────────────────
  blocks = signal<BmcBlocksDto>({ ...EMPTY_BLOCKS });
  reports = signal<BmcReportVersionDto[]>([]);
  activeBlockKey = signal<string>('propuestaDeValor');
  saving = signal(false);
  analyzing = signal(false);
  showReport = signal(false);

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // ─── Computed ─────────────────────────────────────────────────────────────
  activeBlockConfig = computed(() => BMC_BLOCKS_MAP[this.activeBlockKey()] ?? null);

  blocksAsData = computed(() => this.blocks() as unknown as Record<string, Record<string, string>>);

  canGenerate = computed(() => {
    const data = this.blocksAsData();
    return REQUIRED_BLOCK_KEYS.every((key) => {
      const blockData = data[key];
      const config = BMC_BLOCKS_MAP[key];
      return config && blockData && config.fields.some((f) => !!blockData[f.key]?.trim());
    });
  });

  filledBlocksCount = computed(() => {
    const data = this.blocksAsData();
    return BMC_BLOCKS.filter((b) => {
      const blockData = data[b.key];
      return blockData && b.fields.some((f) => !!blockData[f.key]?.trim());
    }).length;
  });

  missingRequiredBlocks = computed(() => {
    const data = this.blocksAsData();
    return REQUIRED_BLOCK_KEYS
      .filter((key) => {
        const blockData = data[key];
        const config = BMC_BLOCKS_MAP[key];
        return !config || !blockData || config.fields.every((f) => !blockData[f.key]?.trim());
      })
      .map((key) => BMC_BLOCKS_MAP[key]?.label ?? key);
  });

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;

    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    const storedBlocks = raw['blocks'] as BmcBlocksDto | undefined;
    const storedReports = (raw['reports'] as BmcReportVersionDto[]) ?? [];

    this.blocks.set(storedBlocks ? { ...EMPTY_BLOCKS, ...storedBlocks } : { ...EMPTY_BLOCKS });
    this.reports.set(storedReports);
  }

  // ─── Acciones ─────────────────────────────────────────────────────────────
  onBlockSelected(blockKey: string): void {
    this.activeBlockKey.set(blockKey);
    this.showReport.set(false);
  }

  onFieldChanged(change: BmcFieldChange): void {
    const current = this.blocks();
    const blockData = (current as unknown as Record<string, Record<string, string>>)[change.blockKey] ?? {};
    const updated = {
      ...current,
      [change.blockKey]: { ...blockData, [change.fieldKey]: change.value },
    };
    this.blocks.set(updated as unknown as BmcBlocksDto);
    this.scheduleSave();
  }

  async generateReport(): Promise<void> {
    const app = this.application();
    if (!app || this.analyzing()) return;

    this.analyzing.set(true);
    try {
      const result = await this.bmcService.analyze({
        toolApplicationId: app.id,
        blocks: this.blocks(),
        currentVersion: this.reports().length,
      });

      const newVersion: BmcReportVersionDto = {
        version: result.version,
        generatedAt: result.generatedAt,
        report: result.report,
      };

      const updatedReports = [newVersion, ...this.reports()];
      this.reports.set(updatedReports);

      await this.persistData(updatedReports);
      this.showReport.set(true);
      this.uiDialog.showSuccess('Informe generado', 'El informe fue generado y guardado correctamente.');
    } catch (error) {
      this.uiDialog.showError('Error', `No se pudo generar el informe: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      this.analyzing.set(false);
    }
  }

  toggleReport(): void {
    this.showReport.set(!this.showReport());
  }

  // ─── Helpers privados ──────────────────────────────────────────────────────
  private scheduleSave(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.saveBlocks(), 800);
  }

  private async saveBlocks(): Promise<void> {
    const app = this.application();
    if (!app) return;

    this.saving.set(true);
    try {
      const currentData = (app.structuredData as Record<string, unknown>) ?? {};
      await this.toolApplicationService.update(app.id, {
        structuredData: { ...currentData, blocks: this.blocks() },
      });
      this.sessionSaved.emit();
    } catch {
      // silent — el usuario no pierde data, está en memoria
    } finally {
      this.saving.set(false);
    }
  }

  private async persistData(reports: BmcReportVersionDto[]): Promise<void> {
    const app = this.application();
    if (!app) return;

    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, blocks: this.blocks(), reports },
    });
    this.sessionSaved.emit();
  }
}
