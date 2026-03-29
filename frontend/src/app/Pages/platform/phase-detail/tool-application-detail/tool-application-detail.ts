import { DatePipe, JsonPipe, NgComponentOutlet } from '@angular/common';
import { Component, OnInit, Type, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AttachmentType, ToolApplicationStatus, UpdateToolApplicationReqDto } from '@core/services/toolApplicationService/tool-application.req.dto';
import {
  ToolApplicationAttachmentResDto,
  ToolApplicationNoteResDto,
  ToolApplicationResDto,
} from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { ToolMeta, resolveToolMeta } from './tools/tool-registry';

interface SelectOption<T> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-tool-application-detail',
  standalone: true,
  imports: [
    DatePipe,
    JsonPipe,
    NgComponentOutlet,
    FormsModule,
    Button,
    Dialog,
    InputText,
    Select,
    Tag,
    Tooltip,
    HasPermissionDirective,
    PageHeaderComponent,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
  ],
  templateUrl: './tool-application-detail.html',
  styleUrl: './tool-application-detail.sass',
})
export class ToolApplicationDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly uiDialog = inject(UiDialogService);

  // ─── Estado ───────────────────────────────────────────────────────────────
  application = signal<ToolApplicationResDto | null>(null);
  loading = signal(false);
  saving = signal(false);

  // ─── Tool dinámica ────────────────────────────────────────────────────────
  toolMeta = computed<ToolMeta>(() => resolveToolMeta(this.application()?.tool?.codigo));
  toolComponent = computed<Type<unknown>>(() => this.toolMeta().component);
  toolInputs = computed(() => ({
    application: this.application(),
    sessionSaved: () => this.loadApplication(),
  }));

  // ─── Edición header ───────────────────────────────────────────────────────
  editTitulo = signal('');
  editEstado = signal<ToolApplicationStatus>('PENDING');

  // ─── Notas ────────────────────────────────────────────────────────────────
  notes = signal<ToolApplicationNoteResDto[]>([]);
  newNoteContent = signal('');
  editingNoteId = signal<number | null>(null);
  editingNoteContent = signal('');

  // ─── Adjuntos ─────────────────────────────────────────────────────────────
  attachments = signal<ToolApplicationAttachmentResDto[]>([]);
  addAttachmentVisible = signal(false);
  newAttachmentForm = { nombre: '', url: '', tipo: 'LINK' as AttachmentType };

  // ─── JSON modal ───────────────────────────────────────────────────────────
  jsonModalVisible = signal(false);

  // ─── Opciones ─────────────────────────────────────────────────────────────
  readonly estadoOptions: SelectOption<ToolApplicationStatus>[] = [
    { label: 'Pendiente', value: 'PENDING' },
    { label: 'En progreso', value: 'IN_PROGRESS' },
    { label: 'Completada', value: 'COMPLETED' },
  ];

  readonly tipoOptions: SelectOption<AttachmentType>[] = [
    { label: 'Link', value: 'LINK' },
    { label: 'Imagen', value: 'IMAGE' },
    { label: 'PDF', value: 'PDF' },
    { label: 'Otro', value: 'OTHER' },
  ];

  // ─── Route params ─────────────────────────────────────────────────────────
  private projectId = 0;
  private phaseId = 0;
  private appId = 0;

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.phaseId = Number(this.route.snapshot.paramMap.get('phaseId'));
    this.appId = Number(this.route.snapshot.paramMap.get('appId'));
    void this.loadApplication();
  }

  async loadApplication(): Promise<void> {
    this.loading.set(true);
    try {
      const app = await this.toolApplicationService.getById(this.appId);
      this.application.set(app);
      this.editTitulo.set(app.titulo);
      this.editEstado.set(app.estado);
      this.notes.set([...app.notes]);
      this.attachments.set([...app.attachments]);
    } catch {
      // Error manejado por el builder
    } finally {
      this.loading.set(false);
    }
  }

  // ─── Guardar cabecera ─────────────────────────────────────────────────────
  async saveData(): Promise<void> {
    const app = this.application();
    if (!app) return;

    if (!this.editTitulo().trim()) {
      this.uiDialog.showWarn('Campo requerido', 'El título no puede estar vacío');
      return;
    }

    this.saving.set(true);
    try {
      const dto: UpdateToolApplicationReqDto = {
        titulo: this.editTitulo().trim(),
        estado: this.editEstado(),
        structuredData: app.structuredData,
      };
      const updated = await this.toolApplicationService.update(app.id, dto);
      this.application.set(updated);
      this.uiDialog.showSuccess('Guardado', 'Los cambios fueron guardados');
    } catch {
      // Error manejado por el builder
    } finally {
      this.saving.set(false);
    }
  }

  // ─── Notas ────────────────────────────────────────────────────────────────
  async addNote(): Promise<void> {
    const app = this.application();
    const contenido = this.newNoteContent().trim();
    if (!app || !contenido) return;

    try {
      const note = await this.toolApplicationService.addNote(app.id, { contenido });
      this.notes.update((notes) => [...notes, note]);
      this.newNoteContent.set('');
    } catch {
      // Error manejado por el builder
    }
  }

  startEditNote(note: ToolApplicationNoteResDto): void {
    this.editingNoteId.set(note.id);
    this.editingNoteContent.set(note.contenido);
  }

  cancelEditNote(): void {
    this.editingNoteId.set(null);
    this.editingNoteContent.set('');
  }

  async saveNote(noteId: number): Promise<void> {
    const contenido = this.editingNoteContent().trim();
    if (!contenido) return;

    try {
      const updated = await this.toolApplicationService.updateNote(noteId, { contenido });
      this.notes.update((notes) => notes.map((n) => (n.id === noteId ? updated : n)));
      this.editingNoteId.set(null);
    } catch {
      // Error manejado por el builder
    }
  }

  async deleteNote(noteId: number): Promise<void> {
    const confirmed = await this.uiDialog.confirmDelete(null, '¿Eliminar nota?');
    if (!confirmed) return;

    try {
      await this.toolApplicationService.deleteNote(noteId);
      this.notes.update((notes) => notes.filter((n) => n.id !== noteId));
    } catch {
      // Error manejado por el builder
    }
  }

  // ─── Adjuntos ─────────────────────────────────────────────────────────────
  async addAttachment(): Promise<void> {
    const app = this.application();
    if (!app) return;

    if (!this.newAttachmentForm.nombre.trim() || !this.newAttachmentForm.url.trim()) {
      this.uiDialog.showWarn('Campos requeridos', 'Completá nombre y URL');
      return;
    }

    try {
      const attachment = await this.toolApplicationService.addAttachment(app.id, {
        nombre: this.newAttachmentForm.nombre.trim(),
        url: this.newAttachmentForm.url.trim(),
        tipo: this.newAttachmentForm.tipo,
      });
      this.attachments.update((att) => [...att, attachment]);
      this.newAttachmentForm = { nombre: '', url: '', tipo: 'LINK' };
      this.addAttachmentVisible.set(false);
    } catch {
      // Error manejado por el builder
    }
  }

  async deleteAttachment(attachmentId: number): Promise<void> {
    const confirmed = await this.uiDialog.confirmDelete(null, '¿Eliminar adjunto?');
    if (!confirmed) return;

    try {
      await this.toolApplicationService.deleteAttachment(attachmentId);
      this.attachments.update((att) => att.filter((a) => a.id !== attachmentId));
    } catch {
      // Error manejado por el builder
    }
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

  goBack(): void {
    void this.router.navigate(['/platform/projects', this.projectId, 'phases', this.phaseId]);
  }
}
