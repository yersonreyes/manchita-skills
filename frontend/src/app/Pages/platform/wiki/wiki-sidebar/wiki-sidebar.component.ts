import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WikiService } from '@core/services/wikiService/wiki.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { WikiTreeNode, buildTree } from '../wiki.types';
import { WikiTreeNodeComponent } from './wiki-tree-node.component';

@Component({
  selector: 'app-wiki-sidebar',
  standalone: true,
  imports: [Button, Dialog, FormsModule, InputText, WikiTreeNodeComponent],
  template: `
    <aside class="wiki-sidebar">
      <div class="wiki-sidebar__header">
        <span class="wiki-sidebar__heading">Wiki</span>
        <p-button
          icon="pi pi-plus"
          label="Nueva página"
          [text]="true"
          size="small"
          (click)="openNewPageDialog(null)"
        />
      </div>

      <div class="wiki-sidebar__tree">
        @if (loading()) {
          <div class="wiki-sidebar__empty">Cargando...</div>
        } @else if (tree().length === 0) {
          <div class="wiki-sidebar__empty">
            <i class="pi pi-book"></i>
            <p>Aún no hay páginas. Creá la primera.</p>
          </div>
        } @else {
          @for (node of tree(); track node.id) {
            <app-wiki-tree-node
              [node]="node"
              [selectedPageId]="selectedPageId()"
              [projectId]="projectId()"
              (addChild)="openNewPageDialog($event)"
            />
          }
        }
      </div>
    </aside>

    <p-dialog
      header="Nueva página"
      [(visible)]="dialogVisible"
      [modal]="true"
      [style]="{ width: '420px' }"
    >
      <!-- Indicador de ubicación -->
      <div class="wiki-location">
        <div class="wiki-location__icon">
          <i [class]="pendingParentTitle ? 'pi pi-chevron-right' : 'pi pi-home'"></i>
        </div>
        <div class="wiki-location__info">
          <span class="wiki-location__label">Se creará en</span>
          @if (pendingParentTitle) {
            <div class="wiki-location__path">
              <span class="wiki-location__root">Raíz</span>
              <i class="pi pi-angle-right wiki-location__sep"></i>
              <span class="wiki-location__parent">{{ pendingParentTitle }}</span>
            </div>
          } @else {
            <span class="wiki-location__root wiki-location__root--active">Raíz de la wiki</span>
          }
        </div>
      </div>

      <div class="wiki-sidebar__form">
        <label class="wiki-sidebar__form-label">Título de la página</label>
        <input
          pInputText
          [(ngModel)]="newPageTitle"
          placeholder="Nombre de la página"
          (keyup.enter)="submitNewPage()"
        />
      </div>

      <ng-template pTemplate="footer">
        <p-button label="Cancelar" severity="secondary" [text]="true" (click)="dialogVisible = false" />
        <p-button label="Crear página" icon="pi pi-plus" (click)="submitNewPage()" [disabled]="!newPageTitle.trim()" />
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .wiki-sidebar {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .wiki-sidebar__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 8px 8px;
      border-bottom: 1px solid var(--p-surface-200);
    }
    .wiki-sidebar__heading {
      font-weight: 600;
      font-size: 0.875rem;
    }
    .wiki-sidebar__tree {
      flex: 1;
      overflow-y: auto;
      padding: 8px 4px;
    }
    .wiki-sidebar__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 24px 16px;
      text-align: center;
      color: var(--p-text-muted-color);
      font-size: 0.875rem;
    }
    .wiki-sidebar__form {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .wiki-sidebar__form input {
      width: 100%;
    }
    .wiki-sidebar__form-label {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--p-text-color);
    }

    /* ─── Location indicator ─── */
    .wiki-location {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      margin-bottom: 16px;
      background: var(--p-surface-50);
      border: 1px solid var(--p-surface-200);
      border-radius: 8px;
    }
    .wiki-location__icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: var(--p-primary-50);
      color: var(--p-primary-color);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 0.875rem;
    }
    .wiki-location__info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }
    .wiki-location__label {
      font-size: 0.72rem;
      font-weight: 500;
      color: var(--p-text-muted-color);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .wiki-location__path {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .wiki-location__root {
      font-size: 0.82rem;
      color: var(--p-text-muted-color);
    }
    .wiki-location__root--active {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--p-primary-color);
    }
    .wiki-location__sep {
      font-size: 0.65rem;
      color: var(--p-text-muted-color);
    }
    .wiki-location__parent {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--p-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `],
})
export class WikiSidebarComponent implements OnInit {
  projectId = input.required<number>();
  selectedPageId = input<number | null>(null);

  private readonly wikiService = inject(WikiService);
  private readonly uiDialog = inject(UiDialogService);
  private readonly router = inject(Router);

  tree = signal<WikiTreeNode[]>([]);
  loading = signal(false);
  dialogVisible = false;
  newPageTitle = '';
  pendingParentId: number | null = null;
  pendingParentTitle: string | null = null;

  async ngOnInit(): Promise<void> {
    await this.loadTree();
  }

  async loadTree(): Promise<void> {
    this.loading.set(true);
    try {
      const pages = await this.wikiService.getByProject(this.projectId());
      this.tree.set(buildTree(pages));
    } catch {
      // silencioso
    } finally {
      this.loading.set(false);
    }
  }

  openNewPageDialog(parentId: number | null): void {
    this.pendingParentId = parentId;
    this.pendingParentTitle = parentId ? this.findNodeTitle(this.tree(), parentId) : null;
    this.newPageTitle = '';
    this.dialogVisible = true;
  }

  async submitNewPage(): Promise<void> {
    if (!this.newPageTitle.trim()) return;
    try {
      const page = await this.wikiService.create({
        projectId: this.projectId(),
        parentId: this.pendingParentId,
        titulo: this.newPageTitle.trim(),
        contenido: '',
      });
      this.dialogVisible = false;
      await this.loadTree();
      void this.router.navigate(['/platform/projects', this.projectId(), 'wiki', page.id]);
    } catch {
      this.uiDialog.showError('Error', 'No se pudo crear la página');
    }
  }

  private findNodeTitle(nodes: WikiTreeNode[], id: number): string | null {
    for (const node of nodes) {
      if (node.id === id) return node.titulo;
      const found = this.findNodeTitle(node.children, id);
      if (found) return found;
    }
    return null;
  }
}
