import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { ProjectBudgetService } from '@core/services/projectBudgetService/project-budget.service';
import { ProjectIncomeService } from '@core/services/projectIncomeService/project-income.service';
import { ProjectService } from '@core/services/projectService/project.service';
import { AssetsService } from '@core/services/assetsService/assets.service';
import {
  CreateRecursoReqDto,
  EstadoPago,
  FrecuenciaCosto,
  TipoRecurso,
  UpdateRecursoReqDto,
} from '@core/services/projectBudgetService/project-budget.req.dto';
import {
  AdjuntoResDto,
  BudgetSummaryResDto,
  DesgloseMensualItemResDto,
  RecursoResDto,
} from '@core/services/projectBudgetService/project-budget.res.dto';
import {
  CreateIngresoReqDto,
  EstadoCobro,
  UpdateIngresoReqDto,
} from '@core/services/projectIncomeService/project-income.req.dto';
import {
  IngresoAdjuntoResDto,
  IngresoResDto,
  IngresoSummaryResDto,
} from '@core/services/projectIncomeService/project-income.res.dto';
import { Moneda } from '@core/services/projectService/project.req.dto';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { Dialog } from 'primeng/dialog';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Tooltip } from 'primeng/tooltip';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { DecimalPipe } from '@angular/common';

interface SelectOption<T = string> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-project-budget',
  standalone: true,
  imports: [
    FormsModule,
    DecimalPipe,
    PageHeaderComponent,
    HasPermissionDirective,
    Button,
    DatePicker,
    Dialog,
    InputNumber,
    InputText,
    Select,
    Textarea,
    ToggleSwitch,
    Tooltip,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
  ],
  templateUrl: './project-budget.component.html',
  styleUrl: './project-budget.component.sass',
})
export class ProjectBudgetComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly budgetService = inject(ProjectBudgetService);
  private readonly incomeService = inject(ProjectIncomeService);
  private readonly projectService = inject(ProjectService);
  private readonly assetsService = inject(AssetsService);
  private readonly uiDialog = inject(UiDialogService);

  projectId = signal<number>(0);
  projectName = signal('');
  loading = signal(false);
  saving = signal(false);

  summary = signal<BudgetSummaryResDto | null>(null);

  // Budget editing
  editingBudget = signal(false);
  budgetForm = { presupuesto: 0, moneda: 'USD' as Moneda };

  // Recurso dialog
  recursoDialogVisible = signal(false);
  editingRecurso = signal<RecursoResDto | null>(null);
  recursoForm = this.getEmptyRecursoForm();
  ivaPresetValue = signal<number>(0);

  // Desglose mensual
  desgloseVisible = signal(false);
  desgloseMensual = signal<DesgloseMensualItemResDto[]>([]);
  mesSeleccionado = signal<string | null>(null);
  loadingDesglose = signal(false);

  // Adjuntos
  uploadingAdjunto = signal(false);

  // Computed
  healthStatus = computed(() => {
    const s = this.summary();
    if (!s || s.presupuesto <= 0) return 'neutral' as const;
    if (s.porcentajeUsado >= 100) return 'danger' as const;
    if (s.porcentajeUsado >= 80) return 'warning' as const;
    return 'healthy' as const;
  });

  saldoClass = computed(() => {
    const s = this.summary();
    if (!s) return '';
    return s.saldo >= 0 ? 'saldo--positivo' : 'saldo--negativo';
  });

  progressValue = computed(() => {
    const s = this.summary();
    if (!s || s.presupuesto <= 0) return 0;
    return Math.min(s.porcentajeUsado, 100);
  });

  monedaSymbol = computed(() => {
    const m = this.summary()?.moneda;
    const symbols: Record<string, string> = {
      USD: '$', EUR: '\u20AC', ARS: '$', BRL: 'R$', CLP: '$',
      COP: '$', MXN: '$', PEN: 'S/', UYU: '$', PYG: '\u20B2',
      BOB: 'Bs', VES: 'Bs.D', CRC: '\u20A1', DOP: 'RD$',
      GTQ: 'Q', HNL: 'L', NIO: 'C$', PAB: 'B/.', CUP: '$',
    };
    return symbols[m ?? 'USD'] ?? '$';
  });

  monedaCode = computed(() => this.summary()?.moneda ?? 'USD');

  groupedRecursos = computed(() => {
    const recursos = this.summary()?.recursos ?? [];
    const groups: Record<TipoRecurso, RecursoResDto[]> = {
      PERSONA: [], SERVIDOR: [], LICENCIA: [], HERRAMIENTA: [], SERVICIO: [], OTRO: [],
    };
    for (const r of recursos) {
      groups[r.tipo].push(r);
    }
    return Object.entries(groups)
      .filter(([, items]) => items.length > 0)
      .map(([tipo, items]) => ({
        tipo: tipo as TipoRecurso,
        label: this.getTipoLabel(tipo as TipoRecurso),
        icon: this.getTipoIcon(tipo as TipoRecurso),
        items,
        subtotal: items.reduce((sum, r) => sum + r.costoTotal, 0),
      }));
  });

  estadoStats = computed(() => {
    const s = this.summary();
    return {
      pendientes: s?.recursosPendientes ?? 0,
      pagados: s?.recursosPagados ?? 0,
    };
  });

  mesSeleccionadoData = computed(() => {
    const mes = this.mesSeleccionado();
    if (!mes) return null;
    return this.desgloseMensual().find((d) => d.mes === mes) ?? null;
  });

  // IVA preview computed from form
  formValorNeto = computed(() => this.recursoForm.costo);
  formValorIva = computed(() => this.recursoForm.costo * (this.recursoForm.ivaPorcentaje / 100));
  formValorBruto = computed(() => this.recursoForm.costo + this.formValorIva());
  formCostoTotal = computed(() => this.formValorBruto() * (this.recursoForm.cantidad ?? 1));

  // Options
  readonly monedaOptions: SelectOption<Moneda>[] = [
    { label: 'USD ($)', value: 'USD' },
    { label: 'EUR (\u20AC)', value: 'EUR' },
    { label: 'ARS ($)', value: 'ARS' },
    { label: 'BRL (R$)', value: 'BRL' },
    { label: 'CLP ($)', value: 'CLP' },
    { label: 'COP ($)', value: 'COP' },
    { label: 'MXN ($)', value: 'MXN' },
    { label: 'PEN (S/)', value: 'PEN' },
    { label: 'UYU ($)', value: 'UYU' },
    { label: 'PYG (\u20B2)', value: 'PYG' },
    { label: 'BOB (Bs)', value: 'BOB' },
    { label: 'VES (Bs.D)', value: 'VES' },
    { label: 'CRC (\u20A1)', value: 'CRC' },
    { label: 'DOP (RD$)', value: 'DOP' },
    { label: 'GTQ (Q)', value: 'GTQ' },
    { label: 'HNL (L)', value: 'HNL' },
    { label: 'NIO (C$)', value: 'NIO' },
    { label: 'PAB (B/.)', value: 'PAB' },
    { label: 'CUP ($)', value: 'CUP' },
  ];

  readonly tipoRecursoOptions: SelectOption<TipoRecurso>[] = [
    { label: 'Persona', value: 'PERSONA' },
    { label: 'Servidor', value: 'SERVIDOR' },
    { label: 'Licencia', value: 'LICENCIA' },
    { label: 'Herramienta', value: 'HERRAMIENTA' },
    { label: 'Servicio', value: 'SERVICIO' },
    { label: 'Otro', value: 'OTRO' },
  ];

  readonly frecuenciaOptions: SelectOption<FrecuenciaCosto>[] = [
    { label: 'Pago unico', value: 'UNICO' },
    { label: 'Semanal', value: 'SEMANAL' },
    { label: 'Mensual', value: 'MENSUAL' },
    { label: 'Anual', value: 'ANUAL' },
  ];

  readonly estadoPagoOptions: SelectOption<EstadoPago>[] = [
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'Pagado', value: 'PAGADO' },
    { label: 'Vencido', value: 'VENCIDO' },
  ];

  readonly ivaPresets: SelectOption<number>[] = [
    { label: 'Exento (0%)', value: 0 },
    { label: 'Argentina (21%)', value: 21 },
    { label: 'Chile (19%)', value: 19 },
    { label: 'Colombia (19%)', value: 19 },
    { label: 'Mexico (16%)', value: 16 },
    { label: 'Peru (18%)', value: 18 },
    { label: 'Uruguay (22%)', value: 22 },
    { label: 'Brasil (17%)', value: 17 },
    { label: 'Paraguay (10%)', value: 10 },
    { label: 'Bolivia (13%)', value: 13 },
    { label: 'Costa Rica (13%)', value: 13 },
    { label: 'Rep. Dominicana (18%)', value: 18 },
    { label: 'Guatemala (12%)', value: 12 },
    { label: 'Panama (7%)', value: 7 },
    { label: 'Personalizado', value: -1 },
  ];

  // ─── Helpers ──────────────────────────────────────────────────────────────

  getTipoIcon(tipo: TipoRecurso): string {
    const map: Record<TipoRecurso, string> = {
      PERSONA: 'pi pi-user', SERVIDOR: 'pi pi-server', LICENCIA: 'pi pi-file',
      HERRAMIENTA: 'pi pi-wrench', SERVICIO: 'pi pi-box', OTRO: 'pi pi-tag',
    };
    return map[tipo] ?? 'pi pi-tag';
  }

  getTipoLabel(tipo: TipoRecurso): string {
    return this.tipoRecursoOptions.find((o) => o.value === tipo)?.label ?? tipo;
  }

  getTipoColor(tipo: TipoRecurso): string {
    const map: Record<TipoRecurso, string> = {
      PERSONA: 'tipo--persona', SERVIDOR: 'tipo--servidor', LICENCIA: 'tipo--licencia',
      HERRAMIENTA: 'tipo--herramienta', SERVICIO: 'tipo--servicio', OTRO: 'tipo--otro',
    };
    return map[tipo] ?? 'tipo--otro';
  }

  getFrecuenciaLabel(freq: FrecuenciaCosto): string {
    return this.frecuenciaOptions.find((o) => o.value === freq)?.label ?? freq;
  }

  getFrecuenciaShort(freq: FrecuenciaCosto): string {
    const map: Record<FrecuenciaCosto, string> = {
      UNICO: 'unico', SEMANAL: '/sem', MENSUAL: '/mes', ANUAL: '/anio',
    };
    return map[freq] ?? '';
  }

  getEstadoBadgeClass(estado: EstadoPago): string {
    const map: Record<EstadoPago, string> = {
      PENDIENTE: 'estado-badge--pendiente',
      PAGADO: 'estado-badge--pagado',
      VENCIDO: 'estado-badge--vencido',
    };
    return map[estado] ?? '';
  }

  getEstadoLabel(estado: EstadoPago): string {
    return this.estadoPagoOptions.find((o) => o.value === estado)?.label ?? estado;
  }

  formatMesLabel(mes: string): string {
    const [year, month] = mes.split('-');
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${monthNames[+month - 1]} ${year}`;
  }

  formatFechaRecurso(recurso: RecursoResDto): string {
    if (!recurso.fechaInicio) return '';
    const d = new Date(recurso.fechaInicio);
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    if (recurso.esRecurrente && recurso.duracionMeses > 1) {
      return `${label} \u2014 ${recurso.duracionMeses} meses`;
    }
    return label;
  }

  private getEmptyRecursoForm() {
    return {
      nombre: '',
      tipo: 'PERSONA' as TipoRecurso,
      costo: 0,
      frecuencia: 'MENSUAL' as FrecuenciaCosto,
      cantidad: 1,
      notas: '',
      fechaInicio: undefined as string | undefined,
      duracionMeses: 1,
      esRecurrente: false,
      ivaPorcentaje: 0,
      estadoPago: 'PENDIENTE' as EstadoPago,
      fechaInicioDate: null as Date | null,
    };
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.projectId.set(id);
    this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    try {
      const [summary, project, incomeSummary] = await Promise.all([
        this.budgetService.getSummary(this.projectId()),
        this.projectService.getById(this.projectId()),
        this.incomeService.getSummary(this.projectId()).catch(() => null),
      ]);
      this.summary.set(summary);
      this.projectName.set(project.nombre);
      if (incomeSummary) {
        this.incomeSummary.set(incomeSummary);
      }
    } catch {
      this.uiDialog.showError('Error', 'No se pudo cargar el presupuesto');
    } finally {
      this.loading.set(false);
    }
  }

  goBack() {
    this.router.navigate(['/platform/projects', this.projectId()]);
  }

  // ─── Budget editing ───────────────────────────────────────────────────────
  startEditBudget() {
    const s = this.summary();
    this.budgetForm.presupuesto = s?.presupuesto ?? 0;
    this.budgetForm.moneda = s?.moneda ?? 'USD';
    this.editingBudget.set(true);
  }

  cancelEditBudget() {
    this.editingBudget.set(false);
  }

  async saveBudget() {
    this.saving.set(true);
    try {
      const result = await this.budgetService.updateBudget(this.projectId(), this.budgetForm);
      this.summary.set(result);
      this.editingBudget.set(false);
      this.uiDialog.showSuccess('Listo', 'Presupuesto actualizado');
    } catch {
      this.uiDialog.showError('Error', 'No se pudo actualizar el presupuesto');
    } finally {
      this.saving.set(false);
    }
  }

  // ─── Recurso CRUD ─────────────────────────────────────────────────────────
  openCreateRecurso() {
    this.editingRecurso.set(null);
    this.recursoForm = this.getEmptyRecursoForm();
    this.ivaPresetValue.set(0);
    this.recursoDialogVisible.set(true);
  }

  openEditRecurso(recurso: RecursoResDto) {
    this.editingRecurso.set(recurso);
    this.recursoForm = {
      nombre: recurso.nombre,
      tipo: recurso.tipo,
      costo: recurso.costo,
      frecuencia: recurso.frecuencia,
      cantidad: recurso.cantidad,
      notas: recurso.notas ?? '',
      fechaInicio: recurso.fechaInicio ?? undefined,
      duracionMeses: recurso.duracionMeses,
      esRecurrente: recurso.esRecurrente,
      ivaPorcentaje: recurso.ivaPorcentaje,
      estadoPago: recurso.estadoPago,
      fechaInicioDate: recurso.fechaInicio ? new Date(recurso.fechaInicio) : null,
    };
    // Try to match a preset
    const matchingPreset = this.ivaPresets.find(
      (p) => p.value === recurso.ivaPorcentaje && p.value !== -1,
    );
    this.ivaPresetValue.set(matchingPreset ? matchingPreset.value : -1);
    this.recursoDialogVisible.set(true);
  }

  onIvaPresetChange(value: number) {
    this.ivaPresetValue.set(value);
    if (value >= 0) {
      this.recursoForm.ivaPorcentaje = value;
    }
  }

  onFechaInicioChange(date: Date | null) {
    this.recursoForm.fechaInicioDate = date;
    this.recursoForm.fechaInicio = date ? date.toISOString() : undefined;
  }

  async submitRecurso() {
    if (!this.recursoForm.nombre.trim() || this.recursoForm.costo <= 0) {
      this.uiDialog.showWarn('Atencion', 'Completa nombre y costo');
      return;
    }

    this.saving.set(true);
    try {
      const { fechaInicioDate, ...formData } = this.recursoForm;
      const editing = this.editingRecurso();
      if (editing) {
        const dto: UpdateRecursoReqDto = { ...formData };
        await this.budgetService.updateRecurso(this.projectId(), editing.id, dto);
        this.uiDialog.showSuccess('Listo', 'Recurso actualizado');
      } else {
        await this.budgetService.createRecurso(this.projectId(), formData);
        this.uiDialog.showSuccess('Listo', 'Recurso creado');
      }
      this.recursoDialogVisible.set(false);
      await this.loadData();
      if (this.desgloseVisible()) {
        await this.loadDesglose();
      }
    } catch {
      this.uiDialog.showError('Error', 'No se pudo guardar el recurso');
    } finally {
      this.saving.set(false);
    }
  }

  async deleteRecurso(recurso: RecursoResDto) {
    const confirmed = await this.uiDialog.confirm({
      header: 'Eliminar recurso',
      message: `\u00BFEliminar "${recurso.nombre}"? Esta accion no se puede deshacer.`,
    });
    if (!confirmed) return;

    try {
      await this.budgetService.deleteRecurso(this.projectId(), recurso.id);
      this.uiDialog.showSuccess('Listo', 'Recurso eliminado');
      await this.loadData();
      if (this.desgloseVisible()) {
        await this.loadDesglose();
      }
    } catch {
      this.uiDialog.showError('Error', 'No se pudo eliminar el recurso');
    }
  }

  async cambiarEstadoPago(recurso: RecursoResDto, estado: EstadoPago) {
    try {
      await this.budgetService.updateRecurso(this.projectId(), recurso.id, { estadoPago: estado });
      await this.loadData();
    } catch {
      this.uiDialog.showError('Error', 'No se pudo actualizar el estado');
    }
  }

  // ─── Adjuntos ─────────────────────────────────────────────────────────────
  async onFileSelected(event: Event, recurso: RecursoResDto) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploadingAdjunto.set(true);
    try {
      const url = await this.assetsService.uploadDocument(file);
      const tipo = file.type.startsWith('image/') ? 'IMAGE' as const : 'PDF' as const;
      await this.budgetService.createAdjunto(this.projectId(), recurso.id, {
        nombre: file.name,
        url,
        tipo,
        size: file.size,
      });
      this.uiDialog.showSuccess('Listo', 'Archivo adjuntado');
      await this.loadData();
    } catch {
      this.uiDialog.showError('Error', 'No se pudo subir el archivo');
    } finally {
      this.uploadingAdjunto.set(false);
      input.value = '';
    }
  }

  async deleteAdjunto(recurso: RecursoResDto, adjunto: AdjuntoResDto) {
    const confirmed = await this.uiDialog.confirm({
      header: 'Eliminar adjunto',
      message: `\u00BFEliminar "${adjunto.nombre}"?`,
    });
    if (!confirmed) return;

    try {
      await this.budgetService.deleteAdjunto(this.projectId(), recurso.id, adjunto.id);
      this.uiDialog.showSuccess('Listo', 'Adjunto eliminado');
      await this.loadData();
    } catch {
      this.uiDialog.showError('Error', 'No se pudo eliminar el adjunto');
    }
  }

  formatFileSize(bytes: number | null | undefined): string {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // ─── Desglose mensual ─────────────────────────────────────────────────────
  async toggleDesglose() {
    if (this.desgloseVisible()) {
      this.desgloseVisible.set(false);
      return;
    }
    await this.loadDesglose();
    this.desgloseVisible.set(true);
  }

  private async loadDesglose() {
    this.loadingDesglose.set(true);
    try {
      const data = await this.budgetService.getDesgloseMensual(this.projectId());
      this.desgloseMensual.set(data);
      if (data.length > 0 && !this.mesSeleccionado()) {
        this.mesSeleccionado.set(data[0].mes);
      }
    } catch {
      this.uiDialog.showError('Error', 'No se pudo cargar el desglose');
    } finally {
      this.loadingDesglose.set(false);
    }
  }

  selectMes(mes: string) {
    this.mesSeleccionado.set(mes);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── INGRESOS ─────────────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════

  activeTab = signal<number>(0);
  incomeSummary = signal<IngresoSummaryResDto | null>(null);
  loadingIncome = signal(false);

  // Ingreso dialog
  ingresoDialogVisible = signal(false);
  editingIngreso = signal<IngresoResDto | null>(null);
  ingresoForm = this.getEmptyIngresoForm();
  ingresoIvaPresetValue = signal<number>(0);

  // Ingreso adjuntos
  uploadingIngresoAdjunto = signal(false);

  // Filter
  ingresoFilterEstado = signal<EstadoCobro | ''>('');
  ingresoFilterEmpresa = signal('');

  // Computed
  ingresoHealthStatus = computed(() => {
    const s = this.incomeSummary();
    if (!s || s.totalEsperado <= 0) return 'neutral' as const;
    if (s.porcentajeCobrado >= 80) return 'healthy' as const;
    if (s.porcentajeCobrado >= 50) return 'warning' as const;
    return 'danger' as const;
  });

  filteredIngresos = computed(() => {
    const ingresos = this.incomeSummary()?.ingresos ?? [];
    const estado = this.ingresoFilterEstado();
    const empresa = this.ingresoFilterEmpresa().toLowerCase();

    return ingresos.filter((i) => {
      if (estado && i.estadoCobro !== estado) return false;
      if (empresa && !i.empresaPagadora.toLowerCase().includes(empresa)) return false;
      return true;
    });
  });

  empresasPagadoras = computed(() => {
    const ingresos = this.incomeSummary()?.ingresos ?? [];
    const unique = [...new Set(ingresos.map((i) => i.empresaPagadora))];
    return unique.sort();
  });

  // Combined dashboard
  flujoNeto = computed(() => {
    const cobrado = this.incomeSummary()?.totalCobrado ?? 0;
    const gastado = this.summary()?.totalBruto ?? 0;
    return cobrado - gastado;
  });

  flujoNetoClass = computed(() => {
    return this.flujoNeto() >= 0 ? 'saldo--positivo' : 'saldo--negativo';
  });

  // Form IVA computed
  ingresoFormValorNeto = computed(() => this.ingresoForm.monto);
  ingresoFormValorIva = computed(() => this.ingresoForm.monto * (this.ingresoForm.ivaPorcentaje / 100));
  ingresoFormValorBruto = computed(() => this.ingresoForm.monto + this.ingresoFormValorIva());

  // Options
  readonly estadoCobroOptions: SelectOption<EstadoCobro>[] = [
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'Cobrado', value: 'COBRADO' },
    { label: 'Vencido', value: 'VENCIDO' },
  ];

  readonly estadoCobroFilterOptions: SelectOption<EstadoCobro | ''>[] = [
    { label: 'Todos', value: '' },
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'Cobrado', value: 'COBRADO' },
    { label: 'Vencido', value: 'VENCIDO' },
  ];

  // ─── Helpers ──────────────────────────────────────────────────────────────

  getEstadoCobroBadgeClass(estado: EstadoCobro): string {
    const map: Record<EstadoCobro, string> = {
      PENDIENTE: 'estado-badge--pendiente',
      COBRADO: 'estado-badge--pagado',
      VENCIDO: 'estado-badge--vencido',
    };
    return map[estado] ?? '';
  }

  getEstadoCobroLabel(estado: EstadoCobro): string {
    return this.estadoCobroOptions.find((o) => o.value === estado)?.label ?? estado;
  }

  isIngresoProximoVencer(ingreso: IngresoResDto): boolean {
    if (ingreso.estadoCobro !== 'PENDIENTE') return false;
    const vencimiento = new Date(ingreso.fechaVencimiento);
    const now = new Date();
    const diffDays = (vencimiento.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7 && diffDays >= 0;
  }

  isIngresoVencido(ingreso: IngresoResDto): boolean {
    return ingreso.estadoCobro === 'VENCIDO';
  }

  getIngresoRowClass(ingreso: IngresoResDto): string {
    if (this.isIngresoVencido(ingreso)) return 'ingreso-row--vencido';
    if (this.isIngresoProximoVencer(ingreso)) return 'ingreso-row--proximo';
    return '';
  }

  formatFechaIngreso(fecha: string | null | undefined): string {
    if (!fecha) return '—';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  private getEmptyIngresoForm() {
    return {
      concepto: '',
      monto: 0,
      moneda: undefined as Moneda | undefined,
      empresaPagadora: '',
      contactoPagadora: '',
      emailPagadora: '',
      numeroFactura: '',
      fechaEmision: undefined as string | undefined,
      fechaEmisionDate: null as Date | null,
      fechaVencimiento: undefined as string | undefined,
      fechaVencimientoDate: null as Date | null,
      fechaCobro: undefined as string | undefined,
      fechaCobroDate: null as Date | null,
      estadoCobro: 'PENDIENTE' as EstadoCobro,
      notas: '',
      ivaPorcentaje: 0,
    };
  }

  // ─── Income data loading ──────────────────────────────────────────────────

  async loadIncome() {
    this.loadingIncome.set(true);
    try {
      const summary = await this.incomeService.getSummary(this.projectId());
      this.incomeSummary.set(summary);
    } catch {
      this.uiDialog.showError('Error', 'No se pudieron cargar los ingresos');
    } finally {
      this.loadingIncome.set(false);
    }
  }

  onTabChange(index: string | number) {
    const idx = +index;
    this.activeTab.set(idx);
    if (idx === 1 && !this.incomeSummary()) {
      this.loadIncome();
    }
  }

  // ─── Ingreso CRUD ─────────────────────────────────────────────────────────

  openCreateIngreso() {
    this.editingIngreso.set(null);
    this.ingresoForm = this.getEmptyIngresoForm();
    this.ingresoIvaPresetValue.set(0);
    this.ingresoDialogVisible.set(true);
  }

  openEditIngreso(ingreso: IngresoResDto) {
    this.editingIngreso.set(ingreso);
    this.ingresoForm = {
      concepto: ingreso.concepto,
      monto: ingreso.monto,
      moneda: ingreso.moneda ?? undefined,
      empresaPagadora: ingreso.empresaPagadora,
      contactoPagadora: ingreso.contactoPagadora ?? '',
      emailPagadora: ingreso.emailPagadora ?? '',
      numeroFactura: ingreso.numeroFactura ?? '',
      fechaEmision: ingreso.fechaEmision ?? undefined,
      fechaEmisionDate: ingreso.fechaEmision ? new Date(ingreso.fechaEmision) : null,
      fechaVencimiento: ingreso.fechaVencimiento,
      fechaVencimientoDate: new Date(ingreso.fechaVencimiento),
      fechaCobro: ingreso.fechaCobro ?? undefined,
      fechaCobroDate: ingreso.fechaCobro ? new Date(ingreso.fechaCobro) : null,
      estadoCobro: ingreso.estadoCobro,
      notas: ingreso.notas ?? '',
      ivaPorcentaje: ingreso.ivaPorcentaje,
    };
    const matchingPreset = this.ivaPresets.find(
      (p) => p.value === ingreso.ivaPorcentaje && p.value !== -1,
    );
    this.ingresoIvaPresetValue.set(matchingPreset ? matchingPreset.value : -1);
    this.ingresoDialogVisible.set(true);
  }

  onIngresoIvaPresetChange(value: number) {
    this.ingresoIvaPresetValue.set(value);
    if (value >= 0) {
      this.ingresoForm.ivaPorcentaje = value;
    }
  }

  onIngresoFechaEmisionChange(date: Date | null) {
    this.ingresoForm.fechaEmisionDate = date;
    this.ingresoForm.fechaEmision = date ? date.toISOString() : undefined;
  }

  onIngresoFechaVencimientoChange(date: Date | null) {
    this.ingresoForm.fechaVencimientoDate = date;
    this.ingresoForm.fechaVencimiento = date ? date.toISOString() : undefined;
  }

  onIngresoFechaCobroChange(date: Date | null) {
    this.ingresoForm.fechaCobroDate = date;
    this.ingresoForm.fechaCobro = date ? date.toISOString() : undefined;
  }

  async submitIngreso() {
    if (!this.ingresoForm.concepto.trim() || this.ingresoForm.monto <= 0) {
      this.uiDialog.showWarn('Atencion', 'Completa concepto y monto');
      return;
    }
    if (!this.ingresoForm.empresaPagadora.trim()) {
      this.uiDialog.showWarn('Atencion', 'Indica la empresa pagadora');
      return;
    }
    if (!this.ingresoForm.fechaVencimiento) {
      this.uiDialog.showWarn('Atencion', 'Indica la fecha de vencimiento');
      return;
    }

    this.saving.set(true);
    try {
      const editing = this.editingIngreso();
      const { fechaEmisionDate, fechaVencimientoDate, fechaCobroDate, ...formData } = this.ingresoForm;

      if (editing) {
        const dto: UpdateIngresoReqDto = {
          ...formData,
          moneda: formData.moneda || undefined,
        };
        await this.incomeService.update(this.projectId(), editing.id, dto);
        this.uiDialog.showSuccess('Listo', 'Ingreso actualizado');
      } else {
        const dto: CreateIngresoReqDto = {
          ...formData,
          concepto: formData.concepto,
          monto: formData.monto,
          empresaPagadora: formData.empresaPagadora,
          fechaVencimiento: formData.fechaVencimiento!,
          moneda: formData.moneda || undefined,
        };
        await this.incomeService.create(this.projectId(), dto);
        this.uiDialog.showSuccess('Listo', 'Ingreso creado');
      }
      this.ingresoDialogVisible.set(false);
      await this.loadIncome();
    } catch {
      this.uiDialog.showError('Error', 'No se pudo guardar el ingreso');
    } finally {
      this.saving.set(false);
    }
  }

  async deleteIngreso(ingreso: IngresoResDto) {
    const confirmed = await this.uiDialog.confirm({
      header: 'Eliminar ingreso',
      message: `\u00BFEliminar "${ingreso.concepto}"? Esta accion no se puede deshacer.`,
    });
    if (!confirmed) return;

    try {
      await this.incomeService.remove(this.projectId(), ingreso.id);
      this.uiDialog.showSuccess('Listo', 'Ingreso eliminado');
      await this.loadIncome();
    } catch {
      this.uiDialog.showError('Error', 'No se pudo eliminar el ingreso');
    }
  }

  async cambiarEstadoCobro(ingreso: IngresoResDto, estado: EstadoCobro) {
    try {
      const dto: UpdateIngresoReqDto = { estadoCobro: estado };
      if (estado === 'COBRADO') {
        dto.fechaCobro = new Date().toISOString();
      }
      await this.incomeService.update(this.projectId(), ingreso.id, dto);
      await this.loadIncome();
    } catch {
      this.uiDialog.showError('Error', 'No se pudo actualizar el estado');
    }
  }

  // ─── Ingreso Adjuntos ─────────────────────────────────────────────────────

  async onIngresoFileSelected(event: Event, ingreso: IngresoResDto) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploadingIngresoAdjunto.set(true);
    try {
      const url = await this.assetsService.uploadDocument(file);
      const tipo = file.type.startsWith('image/') ? 'IMAGE' as const : 'PDF' as const;
      await this.incomeService.createAdjunto(this.projectId(), ingreso.id, {
        nombre: file.name,
        url,
        tipo,
        size: file.size,
      });
      this.uiDialog.showSuccess('Listo', 'Archivo adjuntado');
      await this.loadIncome();
    } catch {
      this.uiDialog.showError('Error', 'No se pudo subir el archivo');
    } finally {
      this.uploadingIngresoAdjunto.set(false);
      input.value = '';
    }
  }

  async deleteIngresoAdjunto(ingreso: IngresoResDto, adjunto: IngresoAdjuntoResDto) {
    const confirmed = await this.uiDialog.confirm({
      header: 'Eliminar adjunto',
      message: `\u00BFEliminar "${adjunto.nombre}"?`,
    });
    if (!confirmed) return;

    try {
      await this.incomeService.deleteAdjunto(this.projectId(), ingreso.id, adjunto.id);
      this.uiDialog.showSuccess('Listo', 'Adjunto eliminado');
      await this.loadIncome();
    } catch {
      this.uiDialog.showError('Error', 'No se pudo eliminar el adjunto');
    }
  }
}
