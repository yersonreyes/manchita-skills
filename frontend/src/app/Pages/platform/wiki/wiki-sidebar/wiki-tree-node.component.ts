import { Component, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { Tooltip } from 'primeng/tooltip';
import { Button } from 'primeng/button';
import { WikiTreeNode } from '../wiki.types';
import { WikiTreeNodeComponent } from './wiki-tree-node.component';

@Component({
  selector: 'app-wiki-tree-node',
  standalone: true,
  imports: [Button, Tooltip, WikiTreeNodeComponent],
  template: `
    <div class="wiki-tree-node" [class.active]="node().id === selectedPageId()">
      <div class="wiki-tree-node__row" [style.padding-left.px]="level() * 16 + 8">
        <span class="wiki-tree-node__title" (click)="navigate()">
          {{ node().titulo }}
        </span>
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
    .wiki-tree-node__row {
      display: flex;
      align-items: center;
      gap: 4px;
      border-radius: 6px;
      padding-top: 2px;
      padding-bottom: 2px;
      padding-right: 4px;
    }
    .wiki-tree-node__row:hover {
      background: var(--p-surface-100);
    }
    .wiki-tree-node.active > .wiki-tree-node__row {
      background: var(--p-primary-50);
    }
    .wiki-tree-node__title {
      flex: 1;
      cursor: pointer;
      font-size: 0.875rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `],
})
export class WikiTreeNodeComponent {
  node = input.required<WikiTreeNode>();
  selectedPageId = input<number | null>(null);
  level = input<number>(0);
  projectId = input.required<number>();
  addChild = output<number>();

  private readonly router = inject(Router);

  navigate(): void {
    void this.router.navigate(['/platform/projects', this.projectId(), 'wiki', this.node().id]);
  }
}
