import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CatalogService } from '@core/services/catalogService/catalog.service';
import { ToolResDto } from '@core/services/catalogService/catalog.res.dto';
import { ProjectPhaseResDto } from '@core/services/projectPhaseService/project-phase.res.dto';
import { ProjectPhaseService } from '@core/services/projectPhaseService/project-phase.service';
import { CreateToolApplicationReqDto, ToolApplicationStatus } from '@core/services/toolApplicationService/tool-application.req.dto';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';

interface SelectOption<T> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-phase-detail',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    Button,
    Card,
    Dialog,
    InputText,
    Select,
    TableModule,
    Tag,
    Tooltip,
    HasPermissionDirective,
    PageHeaderComponent,
  ],
  templateUrl: './phase-detail.html',
  styleUrl: './phase-detail.sass',
})
export class PhaseDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectPhaseService = inject(ProjectPhaseService);
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly catalogService = inject(CatalogService);
  private readonly uiDialog = inject(UiDialogService);

  projectId = 0;
  phaseId = 0;

  // ─── Estado de la página ──────────────────────────────────────────────────
  phase = signal<ProjectPhaseResDto | null>(null);
  applications = signal<ToolApplicationResDto[]>([]);
  tools = signal<ToolResDto[]>([]);
  loading = signal(false);

  // ─── Dialog crear tool application ───────────────────────────────────────
  createDialogVisible = signal(false);
  createForm = {
    toolId: null as number | null,
    titulo: '',
    estado: 'PENDING' as ToolApplicationStatus,
  };
  selectedToolId = signal<number | null>(null);
  selectedTool = computed(() => this.tools().find(t => t.id === this.selectedToolId()) ?? null);


  // ─── Opciones de selects ──────────────────────────────────────────────────
  readonly estadoOptions: SelectOption<ToolApplicationStatus>[] = [
    { label: 'Pendiente', value: 'PENDING' },
    { label: 'En progreso', value: 'IN_PROGRESS' },
    { label: 'Completada', value: 'COMPLETED' },
  ];

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.phaseId = Number(this.route.snapshot.paramMap.get('phaseId'));
    void this.loadPhase();
    void this.loadApplications();
    void this.loadTools();
  }

  async loadPhase(): Promise<void> {
    try {
      const phase = await this.projectPhaseService.getById(this.phaseId);
      this.phase.set(phase);
    } catch {
      // Error manejado por el builder
    }
  }

  async loadApplications(): Promise<void> {
    this.loading.set(true);
    try {
      const apps = await this.toolApplicationService.getByPhase(this.phaseId);
      this.applications.set(apps ?? []);
    } catch {
      this.applications.set([]);
    } finally {
      this.loading.set(false);
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

  // ─── Acciones ─────────────────────────────────────────────────────────────
  openCreateDialog(): void {
    this.createForm = { toolId: null, titulo: '', estado: 'PENDING' };
    this.selectedToolId.set(null);
    this.createDialogVisible.set(true);
  }

  async submitCreate(): Promise<void> {
    if (!this.createForm.toolId) {
      this.uiDialog.showWarn('Campo requerido', 'Seleccioná una herramienta');
      return;
    }
    if (!this.createForm.titulo.trim()) {
      this.uiDialog.showWarn('Campo requerido', 'Ingresá un título');
      return;
    }

    try {
      const dto: CreateToolApplicationReqDto = {
        projectPhaseId: this.phaseId,
        toolId: this.createForm.toolId,
        titulo: this.createForm.titulo.trim(),
        estado: this.createForm.estado,
      };
      await this.toolApplicationService.create(dto);
      this.createDialogVisible.set(false);
      this.uiDialog.showSuccess('Herramienta agregada', 'La aplicación fue creada correctamente');
      await this.loadApplications();
    } catch {
      // Error manejado por el builder
    }
  }

  openDetail(app: ToolApplicationResDto): void {
    void this.router.navigate([
      '/platform/projects', this.projectId,
      'phases', this.phaseId,
      'applications', app.id,
    ]);
  }

  goBack(): void {
    void this.router.navigate(['/platform/projects', this.projectId]);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  getEstadoLabel(estado: ToolApplicationStatus): string {
    return this.estadoOptions.find((o) => o.value === estado)?.label ?? estado;
  }

  getEstadoSeverity(estado: ToolApplicationStatus): 'secondary' | 'info' | 'success' {
    const map: Record<ToolApplicationStatus, 'secondary' | 'info' | 'success'> = {
      PENDING: 'secondary',
      IN_PROGRESS: 'info',
      COMPLETED: 'success',
    };
    return map[estado];
  }
}
