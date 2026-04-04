import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { WikiService } from '@core/services/wikiService/wiki.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';
import { MarkdownComponent } from 'ngx-markdown';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';

@Component({
  selector: 'app-wiki-page',
  standalone: true,
  imports: [Button, FormsModule, HasPermissionDirective, InputText, MarkdownComponent, Textarea],
  template: `
    @if (loading()) {
      <div class="wiki-page wiki-page--loading">
        <i class="pi pi-spin pi-spinner"></i>
      </div>
    } @else if (!page()) {
      <div class="wiki-page wiki-page--empty">
        <i class="pi pi-file"></i>
        <p>Seleccioná una página del panel izquierdo.</p>
      </div>
    } @else {
      <div class="wiki-page">
        <!-- Header -->
        <div class="wiki-page__header">
          @if (editingTitle()) {
            <input
              pInputText
              class="wiki-page__title-input"
              [(ngModel)]="title"
              (blur)="saveTitle()"
              (keyup.enter)="saveTitle()"
              (keyup.escape)="editingTitle.set(false)"
            />
          } @else {
            <h1 class="wiki-page__title" (click)="startEditTitle()">
              {{ title() }}
            </h1>
          }

          <div class="wiki-page__actions" *appHasPermission="'wiki:write'">
            @if (mode() === 'view') {
              <p-button label="Editar" icon="pi pi-pencil" severity="secondary" [outlined]="true" (click)="mode.set('edit')" />
            } @else {
              <p-button label="Vista previa" icon="pi pi-eye" severity="secondary" [outlined]="true" (click)="mode.set('view')" />
              <p-button label="Guardar" icon="pi pi-save" [loading]="saving()" (click)="save()" />
            }
          </div>
        </div>

        <!-- Contenido -->
        <div class="wiki-page__body">
          @if (mode() === 'view') {
            <markdown class="wiki-page__preview" [data]="content()" />
          } @else {
            <textarea
              pTextarea
              class="wiki-page__editor"
              [(ngModel)]="content"
              placeholder="Escribí en markdown..."
              [rows]="30"
              [autoResize]="false"
            ></textarea>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .wiki-page {
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 24px 32px;
      overflow-y: auto;
    }
    .wiki-page--loading,
    .wiki-page--empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      height: 100%;
      color: var(--p-text-muted-color);
      font-size: 0.9rem;
    }
    .wiki-page--loading i,
    .wiki-page--empty i {
      font-size: 2rem;
    }
    .wiki-page__header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 24px;
    }
    .wiki-page__title {
      flex: 1;
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: border-color 0.15s;
    }
    .wiki-page__title:hover {
      border-color: var(--p-primary-color);
    }
    .wiki-page__title--readonly {
      cursor: default;
    }
    .wiki-page__title--readonly:hover {
      border-color: transparent;
    }
    .wiki-page__title-input {
      flex: 1;
      font-size: 1.75rem;
      font-weight: 700;
    }
    .wiki-page__actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }
    .wiki-page__body {
      flex: 1;
    }
    .wiki-page__editor {
      width: 100%;
      min-height: 500px;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      line-height: 1.6;
      resize: vertical;
    }
    .wiki-page__preview {
      line-height: 1.7;
    }
  `],
})
export class WikiPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly wikiService = inject(WikiService);
  private readonly uiDialog = inject(UiDialogService);

  page = signal<{ id: number; titulo: string; contenido: string } | null>(null);
  loading = signal(false);
  saving = signal(false);
  mode = signal<'view' | 'edit'>('view');
  editingTitle = signal(false);
  title = signal('');
  content = signal('');

  async ngOnInit(): Promise<void> {
    this.route.paramMap.subscribe(async (params) => {
      const pageId = Number(params.get('pageId'));
      if (pageId) await this.loadPage(pageId);
    });
  }

  async loadPage(id: number): Promise<void> {
    this.loading.set(true);
    this.mode.set('view');
    try {
      const p = await this.wikiService.getById(id);
      this.page.set(p);
      this.title.set(p.titulo);
      this.content.set(p.contenido);
    } catch {
      this.page.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  startEditTitle(): void {
    this.editingTitle.set(true);
  }

  async saveTitle(): Promise<void> {
    this.editingTitle.set(false);
    const p = this.page();
    if (!p || this.title() === p.titulo) return;
    try {
      await this.wikiService.update(p.id, { titulo: this.title() });
      this.page.set({ ...p, titulo: this.title() });
    } catch {
      this.title.set(p.titulo);
    }
  }

  async save(): Promise<void> {
    const p = this.page();
    if (!p) return;
    this.saving.set(true);
    try {
      await this.wikiService.update(p.id, { contenido: this.content() });
      this.page.set({ ...p, contenido: this.content() });
      this.mode.set('view');
      this.uiDialog.showSuccess('Guardado', 'La página fue guardada correctamente.');
    } catch {
      this.uiDialog.showError('Error', 'No se pudo guardar la página.');
    } finally {
      this.saving.set(false);
    }
  }
}
