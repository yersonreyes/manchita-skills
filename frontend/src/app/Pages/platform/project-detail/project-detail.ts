import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CatalogService } from '@core/services/catalogService/catalog.service';
import { DesignPhaseResDto, ToolResDto } from '@core/services/catalogService/catalog.res.dto';
import { PhaseStatus, CreateProjectPhaseReqDto } from '@core/services/projectPhaseService/project-phase.req.dto';
import { ProjectPhaseResDto } from '@core/services/projectPhaseService/project-phase.res.dto';
import { ProjectPhaseService } from '@core/services/projectPhaseService/project-phase.service';
import { ProjectResDto } from '@core/services/projectService/project.res.dto';
import { ProjectService } from '@core/services/projectService/project.service';
import { CreateToolApplicationReqDto, ToolApplicationStatus } from '@core/services/toolApplicationService/tool-application.req.dto';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';
import { ToolApplicationDetailComponent } from '../phase-detail/tool-application-detail/tool-application-detail';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Dialog } from 'primeng/dialog';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';

interface SelectOption<T> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    FormsModule,
    Button,
    Card,
    Dialog,
    Tag,
    Tooltip,
    Select,
    InputNumber,
    InputText,
    HasPermissionDirective,
    PageHeaderComponent,
    ToolApplicationDetailComponent,
  ],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.sass',
})
export class ProjectDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);
  private readonly projectPhaseService = inject(ProjectPhaseService);
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly catalogService = inject(CatalogService);
  private readonly uiDialog = inject(UiDialogService);

  projectId = 0;

  // ─── Estado de la página ──────────────────────────────────────────────────
  project = signal<ProjectResDto | null>(null);
  phases = signal<ProjectPhaseResDto[]>([]);
  phaseTools = signal<Record<number, ToolApplicationResDto[]>>({});
  designPhases = signal<DesignPhaseResDto[]>([]);
  tools = signal<ToolResDto[]>([]);
  loading = signal(false);

  // ─── Dialog agregar fase ──────────────────────────────────────────────────
  addPhaseDialogVisible = signal(false);
  addPhaseForm = {
    phaseId: null as number | null,
    orden: 1,
    estado: 'NOT_STARTED' as PhaseStatus,
  };

  // ─── Dialog agregar herramienta ───────────────────────────────────────────
  addToolDialogVisible = signal(false);
  targetPhase = signal<ProjectPhaseResDto | null>(null);
  addToolForm = {
    toolId: null as number | null,
    titulo: '',
    estado: 'PENDING' as ToolApplicationStatus,
  };

  // ─── Dialog editar herramienta ────────────────────────────────────────────
  selectedApplication = signal<ToolApplicationResDto | null>(null);
  detailDialogVisible = signal(false);

  // ─── Opciones de selects ──────────────────────────────────────────────────
  readonly estadoOptions: SelectOption<PhaseStatus>[] = [
    { label: 'No iniciada', value: 'NOT_STARTED' },
    { label: 'En progreso', value: 'IN_PROGRESS' },
    { label: 'Completada', value: 'COMPLETED' },
  ];

  readonly toolEstadoOptions: SelectOption<ToolApplicationStatus>[] = [
    { label: 'Pendiente', value: 'PENDING' },
    { label: 'En progreso', value: 'IN_PROGRESS' },
    { label: 'Completada', value: 'COMPLETED' },
  ];

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    void this.loadProject();
    void this.loadPhases();
    void this.loadDesignPhases();
    void this.loadTools();
  }

  async loadProject(): Promise<void> {
    try {
      const project = await this.projectService.getById(this.projectId);
      this.project.set(project);
    } catch {
      // Error manejado por el builder
    }
  }

  async loadPhases(): Promise<void> {
    this.loading.set(true);
    try {
      const phases = await this.projectPhaseService.getByProject(this.projectId);
      this.phases.set(phases ?? []);
      await this.loadPhaseTools(phases ?? []);
    } catch {
      this.phases.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async loadPhaseTools(phases: ProjectPhaseResDto[]): Promise<void> {
    const results = await Promise.all(
      phases.map(async (phase) => {
        try {
          const tools = await this.toolApplicationService.getByPhase(phase.id);
          return { phaseId: phase.id, tools: tools ?? [] };
        } catch {
          return { phaseId: phase.id, tools: [] };
        }
      }),
    );
    const map: Record<number, ToolApplicationResDto[]> = {};
    for (const { phaseId, tools } of results) {
      map[phaseId] = tools;
    }
    this.phaseTools.set(map);
  }

  async reloadPhaseTools(phaseId: number): Promise<void> {
    try {
      const tools = await this.toolApplicationService.getByPhase(phaseId);
      this.phaseTools.update((m) => ({ ...m, [phaseId]: tools ?? [] }));
    } catch {
      this.phaseTools.update((m) => ({ ...m, [phaseId]: [] }));
    }
  }

  async loadDesignPhases(): Promise<void> {
    try {
      const designPhases = await this.catalogService.getDesignPhases();
      this.designPhases.set(designPhases ?? []);
    } catch {
      this.designPhases.set([]);
    }
  }

  async loadTools(): Promise<void> {
    try {
      const tools = await this.catalogService.getTools();
      this.tools.set(tools ?? []);
    } catch {
      this.tools.set([]);
    }
  }

  // ─── Acciones de fases ────────────────────────────────────────────────────
  openAddPhaseDialog(): void {
    this.addPhaseForm = { phaseId: null, orden: this.phases().length + 1, estado: 'NOT_STARTED' };
    this.addPhaseDialogVisible.set(true);
  }

  async submitAddPhase(): Promise<void> {
    if (!this.addPhaseForm.phaseId) {
      this.uiDialog.showWarn('Campo requerido', 'Seleccioná una fase del catálogo');
      return;
    }
    try {
      const dto: CreateProjectPhaseReqDto = {
        projectId: this.projectId,
        phaseId: this.addPhaseForm.phaseId,
        orden: this.addPhaseForm.orden,
        estado: this.addPhaseForm.estado,
      };
      await this.projectPhaseService.create(dto);
      this.addPhaseDialogVisible.set(false);
      this.uiDialog.showSuccess('Fase agregada', 'La fase fue agregada al proyecto');
      await this.loadPhases();
    } catch {
      // Error manejado por el builder
    }
  }

  async updatePhaseStatus(phase: ProjectPhaseResDto, estado: PhaseStatus): Promise<void> {
    try {
      await this.projectPhaseService.update(phase.id, { estado });
      this.phases.update((phases) =>
        phases.map((p) => (p.id === phase.id ? { ...p, estado } : p)),
      );
    } catch {
      // Error manejado por el builder
    }
  }

  // ─── Acciones de herramientas ─────────────────────────────────────────────
  openAddToolDialog(phase: ProjectPhaseResDto): void {
    this.targetPhase.set(phase);
    this.addToolForm = { toolId: null, titulo: '', estado: 'PENDING' };
    this.addToolDialogVisible.set(true);
  }

  async submitAddTool(): Promise<void> {
    if (!this.addToolForm.toolId) {
      this.uiDialog.showWarn('Campo requerido', 'Seleccioná una herramienta');
      return;
    }
    if (!this.addToolForm.titulo.trim()) {
      this.uiDialog.showWarn('Campo requerido', 'Ingresá un título');
      return;
    }
    const phase = this.targetPhase();
    if (!phase) return;

    try {
      const dto: CreateToolApplicationReqDto = {
        projectPhaseId: phase.id,
        toolId: this.addToolForm.toolId,
        titulo: this.addToolForm.titulo.trim(),
        estado: this.addToolForm.estado,
      };
      await this.toolApplicationService.create(dto);
      this.addToolDialogVisible.set(false);
      this.uiDialog.showSuccess('Herramienta agregada', `Agregada a "${phase.phase.nombre}"`);
      await this.reloadPhaseTools(phase.id);
    } catch {
      // Error manejado por el builder
    }
  }

  openEditTool(app: ToolApplicationResDto): void {
    this.selectedApplication.set(app);
    this.detailDialogVisible.set(true);
  }

  async onToolSaved(phaseId: number): Promise<void> {
    await this.reloadPhaseTools(phaseId);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  getPhaseTools(phaseId: number): ToolApplicationResDto[] {
    return this.phaseTools()[phaseId] ?? [];
  }

  getEstadoLabel(estado: PhaseStatus): string {
    return this.estadoOptions.find((o) => o.value === estado)?.label ?? estado;
  }

  getEstadoSeverity(estado: PhaseStatus): 'secondary' | 'info' | 'success' {
    const map: Record<PhaseStatus, 'secondary' | 'info' | 'success'> = {
      NOT_STARTED: 'secondary',
      IN_PROGRESS: 'info',
      COMPLETED: 'success',
    };
    return map[estado];
  }

  getToolEstadoLabel(estado: ToolApplicationStatus): string {
    return this.toolEstadoOptions.find((o) => o.value === estado)?.label ?? estado;
  }

  getToolEstadoSeverity(estado: ToolApplicationStatus): 'secondary' | 'info' | 'success' {
    const map: Record<ToolApplicationStatus, 'secondary' | 'info' | 'success'> = {
      PENDING: 'secondary',
      IN_PROGRESS: 'info',
      COMPLETED: 'success',
    };
    return map[estado];
  }

  goBack(): void {
    void this.router.navigate(['/platform/projects']);
  }
}
