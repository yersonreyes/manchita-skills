import { Injectable } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';

export interface ConfirmOptions {
  header?: string;
  message: string;
  icon?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  target?: EventTarget | null;
}

@Injectable({ providedIn: 'root' })
export class UiDialogService {
  constructor(
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService,
  ) {}

  // ─── Confirmaciones ───────────────────────────────────────────────────────

  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        target: options.target ?? undefined,
        header: options.header ?? 'Confirmar',
        message: options.message,
        icon: options.icon ?? 'pi pi-question-circle',
        acceptLabel: options.acceptLabel ?? 'Sí',
        rejectLabel: options.rejectLabel ?? 'No',
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });
  }

  alert(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        target: options.target ?? undefined,
        header: options.header ?? 'Aviso',
        message: options.message,
        icon: options.icon ?? 'pi pi-info-circle',
        acceptLabel: options.acceptLabel ?? 'Aceptar',
        rejectVisible: false,
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });
  }

  confirmDelete(target?: EventTarget | null, itemLabel?: string): Promise<boolean> {
    return this.confirm({
      target,
      header: 'Zona Peligrosa',
      message: itemLabel ?? '¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
    });
  }

  confirmApprove(target?: EventTarget | null, itemLabel?: string): Promise<boolean> {
    return this.confirm({
      target,
      header: 'Aprobación',
      message: itemLabel ?? '¿Confirmas esta acción?',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Aprobar',
      rejectLabel: 'Cancelar',
    });
  }

  // ─── Toasts ───────────────────────────────────────────────────────────────

  showSuccess(summary: string, detail?: string, life = 3000): void {
    this.messageService.add({ severity: 'success', summary, detail, life });
  }

  showError(summary: string, detail?: string, life = 4000): void {
    this.messageService.add({ severity: 'error', summary, detail, life });
  }

  showInfo(summary: string, detail?: string, life = 3000): void {
    this.messageService.add({ severity: 'info', summary, detail, life });
  }

  showWarn(summary: string, detail?: string, life = 3000): void {
    this.messageService.add({ severity: 'warn', summary, detail, life });
  }
}
