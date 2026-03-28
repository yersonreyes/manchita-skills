import { DatePipe } from '@angular/common';
import { Component, OnChanges, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AttachmentType, ToolApplicationStatus, UpdateToolApplicationReqDto } from '@core/services/toolApplicationService/tool-application.req.dto';
import {
  ToolApplicationAttachmentResDto,
  ToolApplicationNoteResDto,
  ToolApplicationResDto,
} from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { AiChatComponent } from './ai-chat/ai-chat';

interface SelectOption<T> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-tool-application-detail',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    Button,
    Dialog,
    InputText,
    Select,
    TableModule,
    Tag,
    Tooltip,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    HasPermissionDirective,
    AiChatComponent,
  ],
  templateUrl: './tool-application-detail.html',
  styleUrl: './tool-application-detail.sass',
})
export class ToolApplicationDetailComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly uiDialog = inject(UiDialogService);

  // ─── Inputs / Outputs ─────────────────────────────────────────────────────
  application = input<ToolApplicationResDto | null>(null);
  visible = model<boolean>(false);
  saved = output<void>();

  // ─── Estado del componente ────────────────────────────────────────────────
  editForm = {
    titulo: '',
    estado: 'PENDING' as ToolApplicationStatus,
    structuredDataJson: '{}',
  };
  jsonError = signal<string | null>(null);
  saving = signal(false);

  notes = signal<ToolApplicationNoteResDto[]>([]);
  newNoteContent = signal('');
  editingNoteId = signal<number | null>(null);
  editingNoteContent = signal('');

  attachments = signal<ToolApplicationAttachmentResDto[]>([]);
  newAttachmentForm = {
    nombre: '',
    url: '',
    tipo: 'LINK' as AttachmentType,
  };
  addAttachmentVisible = signal(false);

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

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnChanges(): void {
    const app = this.application();
    if (app) {
      this.editForm = {
        titulo: app.titulo,
        estado: app.estado,
        structuredDataJson: JSON.stringify(app.structuredData ?? {}, null, 2),
      };
      this.jsonError.set(null);
      this.notes.set([...app.notes]);
      this.attachments.set([...app.attachments]);
      this.newNoteContent.set('');
      this.editingNoteId.set(null);
      this.addAttachmentVisible.set(false);
    }
  }

  // ─── Datos ────────────────────────────────────────────────────────────────
  validateJson(): void {
    try {
      JSON.parse(this.editForm.structuredDataJson);
      this.jsonError.set(null);
    } catch {
      this.jsonError.set('JSON inválido — revisá la sintaxis');
    }
  }

  async saveData(): Promise<void> {
    const app = this.application();
    if (!app) return;

    this.validateJson();
    if (this.jsonError()) return;

    if (!this.editForm.titulo.trim()) {
      this.uiDialog.showWarn('Campo requerido', 'El título no puede estar vacío');
      return;
    }

    this.saving.set(true);
    try {
      const dto: UpdateToolApplicationReqDto = {
        titulo: this.editForm.titulo.trim(),
        estado: this.editForm.estado,
        structuredData: JSON.parse(this.editForm.structuredDataJson) as Record<string, unknown>,
      };
      await this.toolApplicationService.update(app.id, dto);
      this.uiDialog.showSuccess('Guardado', 'Los cambios fueron guardados');
      this.saved.emit();
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

  onAiSessionSaved(): void {
    this.saved.emit();
  }

  close(): void {
    this.visible.set(false);
  }
}
