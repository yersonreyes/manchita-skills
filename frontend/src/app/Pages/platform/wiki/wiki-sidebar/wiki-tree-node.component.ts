import { Component, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Tooltip } from 'primeng/tooltip';
import { Button } from 'primeng/button';
import { WikiTreeNode } from '../wiki.types';
import { WikiDragService } from '../wiki-drag.service';

type DropZone = 'before' | 'after' | 'inside' | null;

@Component({
  selector: 'app-wiki-tree-node',
  standalone: true,
  imports: [Button, Tooltip, WikiTreeNodeComponent],
  template: `
    <div
      class="wiki-tree-node"
      [class.active]="node().id === selectedPageId()"
      [class.dragging]="dragService.draggingId() === node().id"
      [class.drop-inside]="dropZone() === 'inside'"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)"
    >
      @if (dropZone() === 'before') {
        <div class="wiki-drop-line"></div>
      }

      <div
        class="wiki-tree-node__row"
        [style.padding-left.px]="level() * 16 + 8"
        draggable="true"
        (dragstart)="onDragStart($event)"
        (dragend)="onDragEnd()"
      >
        <i class="pi pi-bars wiki-tree-node__handle"></i>
        <span class="wiki-tree-node__icon">{{ node().icono ?? '📄' }}</span>
        <span class="wiki-tree-node__title" (click)="navigate()">{{ node().titulo }}</span>
        <p-button
          icon="pi pi-plus"
          [text]="true"
          size="small"
          severity="secondary"
          [rounded]="true"
          (click)="addChild.emit(node().id)"
          pTooltip="Agregar subpágina"
          tooltipPosition="right"
        />
      </div>

      @if (dropZone() === 'after') {
        <div class="wiki-drop-line wiki-drop-line--after"></div>
      }

      @if (node().children.length > 0) {
        <div class="wiki-tree-node__children">
          @for (child of node().children; track child.id) {
            <app-wiki-tree-node
              [node]="child"
              [selectedPageId]="selectedPageId()"
              [level]="level() + 1"
              [projectId]="projectId()"
              (addChild)="addChild.emit($event)"
            />
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .wiki-tree-node { position: relative; }

    .wiki-tree-node__row {
      display: flex;
      align-items: center;
      gap: 4px;
      border-radius: 6px;
      padding-top: 2px;
      padding-bottom: 2px;
      padding-right: 4px;
      cursor: pointer;
    }
    .wiki-tree-node__row:hover { background: var(--p-surface-100); }
    .wiki-tree-node.active > .wiki-tree-node__row { background: var(--p-primary-50); }

    .wiki-tree-node__handle {
      font-size: 0.6rem;
      color: var(--p-text-muted-color);
      opacity: 0;
      flex-shrink: 0;
      cursor: grab;
      padding: 0 2px;
      transition: opacity 0.1s;
    }
    .wiki-tree-node__row:hover .wiki-tree-node__handle { opacity: 1; }

    .wiki-tree-node__icon {
      font-size: 0.85rem;
      flex-shrink: 0;
      line-height: 1;
    }
    .wiki-tree-node__title {
      flex: 1;
      cursor: pointer;
      font-size: 0.875rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .wiki-tree-node.dragging { opacity: 0.4; }

    .wiki-tree-node.drop-inside > .wiki-tree-node__row {
      background: var(--p-primary-100);
      outline: 2px solid var(--p-primary-color);
      outline-offset: -1px;
      border-radius: 6px;
    }

    .wiki-drop-line {
      height: 2px;
      background: var(--p-primary-color);
      border-radius: 2px;
      margin: 1px 8px;
      position: relative;
    }
    .wiki-drop-line::before {
      content: '';
      position: absolute;
      left: -4px;
      top: -3px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--p-primary-color);
    }
    .wiki-drop-line--after { margin-bottom: 1px; }
  `],
})
export class WikiTreeNodeComponent {
  node = input.required<WikiTreeNode>();
  selectedPageId = input<number | null>(null);
  level = input<number>(0);
  projectId = input.required<number>();
  addChild = output<number>();

  readonly dragService = inject(WikiDragService);
  private readonly router = inject(Router);

  dropZone = signal<DropZone>(null);

  navigate(): void {
    void this.router.navigate(['/platform/projects', this.projectId(), 'wiki', this.node().id]);
  }

  onDragStart(event: DragEvent): void {
    event.stopPropagation();
    event.dataTransfer!.effectAllowed = 'move';
    event.dataTransfer?.setData('text/plain', String(this.node().id));
    this.dragService.draggingId.set(this.node().id);
  }

  onDragEnd(): void {
    this.dragService.draggingId.set(null);
    this.dropZone.set(null);
  }

  onDragOver(event: DragEvent): void {
    const draggedId = this.dragService.draggingId();
    if (draggedId === null || draggedId === this.node().id) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer!.dropEffect = 'move';

    // Usar el row para calcular la zona (ignora el área de hijos)
    const row = (event.currentTarget as HTMLElement).querySelector<HTMLElement>(':scope > .wiki-tree-node__row');
    if (!row) return;
    const rect = row.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const h = rect.height;

    if (y < h * 0.3) {
      this.dropZone.set('before');
    } else if (y > h * 0.7) {
      this.dropZone.set('after');
    } else {
      this.dropZone.set('inside');
    }
  }

  onDragLeave(event: DragEvent): void {
    const related = event.relatedTarget as Node | null;
    // Solo limpiar si el cursor salió FUERA de este nodo completo
    if (related && (event.currentTarget as HTMLElement).contains(related)) return;
    this.dropZone.set(null);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const zone = this.dropZone();
    const draggedId = this.dragService.draggingId();
    this.dropZone.set(null);
    this.dragService.draggingId.set(null);
    if (!zone || draggedId === null || draggedId === this.node().id) return;
    this.dragService.dropped$.next({ draggedId, targetId: this.node().id, position: zone });
  }
}
