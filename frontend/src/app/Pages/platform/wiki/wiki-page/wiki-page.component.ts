import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgStyle } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { WikiService } from '@core/services/wikiService/wiki.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';
import { MarkdownComponent } from 'ngx-markdown';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { WikiBannerUploaderComponent } from '../wiki-banner-uploader/wiki-banner-uploader.component';

// ─── Banners disponibles (gradientes) ────────────────────────────────────────

export interface BannerOption {
  key: string;
  label: string;
  gradient: string;
}

export const BANNER_OPTIONS: BannerOption[] = [
  { key: 'emerald',  label: 'Esmeralda', gradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)' },
  { key: 'blue',     label: 'Azul',      gradient: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)' },
  { key: 'purple',   label: 'Violeta',   gradient: 'linear-gradient(135deg, #7c3aed 0%, #c084fc 100%)' },
  { key: 'rose',     label: 'Rosa',      gradient: 'linear-gradient(135deg, #e11d48 0%, #fb7185 100%)' },
  { key: 'amber',    label: 'Ámbar',     gradient: 'linear-gradient(135deg, #d97706 0%, #fcd34d 100%)' },
  { key: 'teal',     label: 'Teal',      gradient: 'linear-gradient(135deg, #0d9488 0%, #5eead4 100%)' },
  { key: 'indigo',   label: 'Índigo',    gradient: 'linear-gradient(135deg, #4338ca 0%, #818cf8 100%)' },
  { key: 'orange',   label: 'Naranja',   gradient: 'linear-gradient(135deg, #ea580c 0%, #fdba74 100%)' },
  { key: 'slate',    label: 'Pizarra',   gradient: 'linear-gradient(135deg, #334155 0%, #94a3b8 100%)' },
  { key: 'cyan',     label: 'Cyan',      gradient: 'linear-gradient(135deg, #0891b2 0%, #67e8f9 100%)' },
];

// ─── Emojis disponibles ───────────────────────────────────────────────────────

const EMOJI_GROUPS = [
  {
    label: 'Documentos',
    emojis: ['📄','📝','📋','📊','📈','📉','📌','📍','📎','🗂️','🗃️','📁','📂','🗄️','📑','📃'],
  },
  {
    label: 'Ideas y trabajo',
    emojis: ['💡','🔍','🔎','🎯','🚀','⚡','🔥','💎','🏆','🎖️','✅','☑️','🛠️','⚙️','🔧','🔑'],
  },
  {
    label: 'Personas',
    emojis: ['👤','👥','🧑‍💻','👨‍🎨','👩‍🔬','🧑‍🏫','🤝','🙌','👋','💪','🧠','👁️','❤️','🫂','🌍','🏠'],
  },
  {
    label: 'Naturaleza y objetos',
    emojis: ['🌱','🌿','🌲','🌊','⭐','🌙','☀️','🎨','🎭','🎬','🎵','🎲','🧩','🔮','💫','🌈'],
  },
];

@Component({
  selector: 'app-wiki-page',
  standalone: true,
  imports: [Button, FormsModule, NgStyle, HasPermissionDirective, InputText, MarkdownComponent, Textarea, WikiBannerUploaderComponent],
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

        <!-- ─── Banner ──────────────────────────────────────────────────────── -->
        <div
          class="wiki-banner"
          [class.wiki-banner--active]="banner()"
          [ngStyle]="bannerStyle()"
        >
          @if (!banner()) {
            <div class="wiki-banner__hint" *hasPermission="'wiki:write'">
              <button class="wiki-banner__add-btn" (click)="uploaderVisible.set(true)">
                <i class="pi pi-image"></i> Agregar banner
              </button>
            </div>
          } @else {
            <div class="wiki-banner__controls" *hasPermission="'wiki:write'">
              <button class="wiki-banner__ctrl-btn" (click)="uploaderVisible.set(true)">
                <i class="pi pi-palette"></i> Cambiar
              </button>
              <button class="wiki-banner__ctrl-btn wiki-banner__ctrl-btn--remove" (click)="saveBanner(null)">
                <i class="pi pi-times"></i> Quitar
              </button>
            </div>
          }
        </div>

        <!-- ─── Banner uploader modal ────────────────────────────────────────── -->
        <app-wiki-banner-uploader
          [(visible)]="uploaderVisible"
          (bannerSelected)="saveBanner($event)"
        />

        <!-- ─── Header ─────────────────────────────────────────────────────── -->
        <div class="wiki-page__header-area">

          <!-- Ícono -->
          <div class="wiki-icon-wrap" *hasPermission="'wiki:write'">
            <button
              class="wiki-icon-btn"
              [class.wiki-icon-btn--set]="icon()"
              (click)="toggleEmojiPicker(); $event.stopPropagation()"
              [title]="icon() ? 'Cambiar ícono' : 'Agregar ícono'"
            >
              @if (icon()) {
                <span class="wiki-icon-btn__emoji">{{ icon() }}</span>
              } @else {
                <span class="wiki-icon-btn__placeholder">
                  <i class="pi pi-face-smile"></i>
                </span>
              }
            </button>

            @if (showEmojiPicker()) {
              <div class="wiki-picker wiki-emoji-picker" (click)="$event.stopPropagation()">
                <div class="wiki-picker__header">
                  <p class="wiki-picker__title">Elegí un ícono</p>
                  @if (icon()) {
                    <button class="wiki-picker__remove" (click)="saveIcon(null)">
                      <i class="pi pi-times"></i> Quitar
                    </button>
                  }
                </div>
                @for (group of emojiGroups; track group.label) {
                  <p class="wiki-emoji-picker__group-label">{{ group.label }}</p>
                  <div class="wiki-emoji-picker__grid">
                    @for (emoji of group.emojis; track emoji) {
                      <button
                        class="wiki-emoji-picker__emoji"
                        [class.wiki-emoji-picker__emoji--active]="icon() === emoji"
                        (click)="saveIcon(emoji)"
                      >{{ emoji }}</button>
                    }
                  </div>
                }
              </div>
            }
          </div>

          <!-- Título + acciones -->
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

            <div class="wiki-page__actions" *hasPermission="'wiki:write'">
              @if (mode() === 'view') {
                <p-button label="Editar" icon="pi pi-pencil" severity="secondary" [outlined]="true" (click)="mode.set('edit')" />
              } @else {
                <p-button label="Vista previa" icon="pi pi-eye" severity="secondary" [outlined]="true" (click)="mode.set('view')" />
                <p-button label="Guardar" icon="pi pi-save" [loading]="saving()" (click)="save()" />
              }
            </div>
          </div>
        </div>

        <!-- ─── Cuerpo ──────────────────────────────────────────────────────── -->
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
    /* ─── Shell ─── */
    .wiki-page {
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
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
    .wiki-page--loading i, .wiki-page--empty i { font-size: 2rem; }

    /* ─── Banner ─── */
    .wiki-banner {
      flex-shrink: 0;
      position: relative;
      width: 100%;
      height: 48px;
      background: var(--p-surface-100);
      transition: height 0.2s ease;
      background-size: cover;
      background-position: center;
      overflow: hidden;
    }
    .wiki-banner--active {
      height: 160px;
    }
    .wiki-banner__hint {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 0 24px;
      opacity: 0;
      transition: opacity 0.15s;
    }
    .wiki-banner:hover .wiki-banner__hint { opacity: 1; }
    .wiki-banner__add-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 6px;
      border: 1px solid var(--p-surface-300);
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(4px);
      font-size: 0.78rem;
      font-weight: 500;
      color: var(--p-text-muted-color);
      cursor: pointer;
      transition: background 0.12s, color 0.12s;
    }
    .wiki-banner__add-btn:hover { background: white; color: var(--p-text-color); }
    .wiki-banner__controls {
      position: absolute;
      bottom: 10px;
      right: 20px;
      display: flex;
      gap: 6px;
      opacity: 0;
      transition: opacity 0.15s;
    }
    .wiki-banner--active:hover .wiki-banner__controls { opacity: 1; }
    .wiki-banner__ctrl-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid rgba(255,255,255,0.4);
      background: rgba(0,0,0,0.25);
      backdrop-filter: blur(6px);
      font-size: 0.75rem;
      font-weight: 500;
      color: rgba(255,255,255,0.9);
      cursor: pointer;
      transition: background 0.12s;
    }
    .wiki-banner__ctrl-btn:hover { background: rgba(0,0,0,0.4); }
    .wiki-banner__ctrl-btn--remove:hover { background: rgba(200,30,30,0.5); }

    /* ─── Header area ─── */
    .wiki-page__header-area {
      padding: 0 32px;
      margin-top: -20px;
    }

    /* ─── Icon ─── */
    .wiki-icon-wrap {
      position: relative;
      display: inline-block;
      margin-bottom: 8px;
    }
    .wiki-icon-btn {
      width: 52px;
      height: 52px;
      border-radius: 10px;
      border: 2px dashed var(--p-surface-300);
      background: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: border-color 0.15s, background 0.15s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .wiki-icon-btn:hover { border-color: var(--p-primary-color); background: var(--p-primary-50); }
    .wiki-icon-btn--set { border-style: solid; border-color: var(--p-surface-200); }
    .wiki-icon-btn--set:hover { border-color: var(--p-primary-color); }
    .wiki-icon-btn__emoji { font-size: 1.75rem; line-height: 1; }
    .wiki-icon-btn__placeholder { font-size: 1.2rem; color: var(--p-text-muted-color); }

    /* ─── Emoji picker ─── */
    .wiki-picker {
      position: absolute;
      z-index: 100;
      background: white;
      border: 1px solid var(--p-surface-200);
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      padding: 14px;
    }
    .wiki-picker__title {
      margin: 0 0 10px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--p-text-muted-color);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .wiki-picker__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .wiki-picker__header .wiki-picker__title { margin: 0; }
    .wiki-picker__remove {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.75rem;
      color: var(--p-text-muted-color);
      background: none;
      border: none;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .wiki-picker__remove:hover { background: var(--p-surface-100); color: #dc2626; }
    .wiki-emoji-picker {
      top: 58px;
      left: 0;
      width: 280px;
      max-height: 320px;
      overflow-y: auto;
    }
    .wiki-emoji-picker__group-label {
      margin: 8px 0 4px;
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--p-text-muted-color);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .wiki-emoji-picker__group-label:first-of-type { margin-top: 0; }
    .wiki-emoji-picker__grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 2px;
    }
    .wiki-emoji-picker__emoji {
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      border-radius: 5px;
      border: none;
      background: none;
      cursor: pointer;
      transition: background 0.1s;
    }
    .wiki-emoji-picker__emoji:hover { background: var(--p-surface-100); }
    .wiki-emoji-picker__emoji--active { background: var(--p-primary-50); }

    /* ─── Page header ─── */
    .wiki-page__header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 20px;
      padding-top: 4px;
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
    .wiki-page__title:hover { border-color: var(--p-primary-color); }
    .wiki-page__title-input {
      flex: 1;
      font-size: 1.75rem;
      font-weight: 700;
    }
    .wiki-page__actions { display: flex; gap: 8px; flex-shrink: 0; }

    /* ─── Body ─── */
    .wiki-page__body {
      flex: 1;
      overflow-y: auto;
      padding: 0 32px 32px;
    }
    .wiki-page__editor {
      width: 100%;
      min-height: 500px;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      line-height: 1.6;
      resize: vertical;
    }
    /* ─── Markdown preview — estilo GitHub ─── */
    .wiki-page__preview {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 0.9375rem;
      line-height: 1.6;
      color: #1f2328;
      word-wrap: break-word;
      max-width: 800px;
    }

    /* Headings */
    .wiki-page__preview h1,
    .wiki-page__preview h2,
    .wiki-page__preview h3,
    .wiki-page__preview h4,
    .wiki-page__preview h5,
    .wiki-page__preview h6 {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      font-weight: 600;
      line-height: 1.25;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
    }
    .wiki-page__preview h1 {
      font-size: 2em;
      font-weight: 700;
      padding-bottom: 0.3em;
      border-bottom: 1px solid #d1d9e0;
      margin-top: 0;
    }
    .wiki-page__preview h2 {
      font-size: 1.5em;
      padding-bottom: 0.3em;
      border-bottom: 1px solid #d1d9e0;
    }
    .wiki-page__preview h3 { font-size: 1.25em; }
    .wiki-page__preview h4 { font-size: 1em; }
    .wiki-page__preview h5 { font-size: 0.875em; }
    .wiki-page__preview h6 { font-size: 0.85em; color: #656d76; }

    /* Párrafos y separadores */
    .wiki-page__preview p { margin: 0 0 1rem; }
    .wiki-page__preview hr {
      height: 4px;
      padding: 0;
      margin: 1.5rem 0;
      background-color: #d1d9e0;
      border: 0;
      border-radius: 2px;
    }

    /* Listas */
    .wiki-page__preview ul,
    .wiki-page__preview ol { margin: 0 0 1rem; padding-left: 2em; }
    .wiki-page__preview ul { list-style-type: disc; }
    .wiki-page__preview ol { list-style-type: decimal; }
    .wiki-page__preview li { margin: 0.25rem 0; }
    .wiki-page__preview li > ul,
    .wiki-page__preview li > ol { margin: 0.25rem 0 0; }

    /* Task list (GitHub checkboxes) */
    .wiki-page__preview input[type="checkbox"] {
      margin: 0 0.25em 0.2em -1.4em;
      vertical-align: middle;
    }

    /* Blockquote */
    .wiki-page__preview blockquote {
      margin: 0 0 1rem;
      padding: 0 1em;
      color: #656d76;
      border-left: 4px solid #d1d9e0;
    }
    .wiki-page__preview blockquote > :last-child { margin-bottom: 0; }

    /* Código inline */
    .wiki-page__preview :not(pre) > code {
      padding: 0.2em 0.4em;
      margin: 0;
      font-size: 85%;
      white-space: break-spaces;
      background-color: #eff1f3;
      border-radius: 6px;
      font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace;
    }

    /* Bloques de código */
    .wiki-page__preview pre {
      margin: 0 0 1rem;
      padding: 1rem;
      overflow: auto;
      font-size: 85%;
      line-height: 1.45;
      background-color: #f6f8fa;
      border-radius: 6px;
      border: 1px solid #d1d9e0;
    }
    .wiki-page__preview pre code {
      display: inline;
      padding: 0;
      margin: 0;
      overflow: visible;
      font-size: 100%;
      word-break: normal;
      white-space: pre;
      background: transparent;
      border: 0;
      font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace;
    }

    /* Links */
    .wiki-page__preview a {
      color: #0969da;
      text-decoration: none;
    }
    .wiki-page__preview a:hover { text-decoration: underline; }

    /* Imágenes */
    .wiki-page__preview img {
      max-width: 100%;
      box-sizing: content-box;
      border-radius: 6px;
    }

    /* Tablas */
    .wiki-page__preview table {
      width: max-content;
      max-width: 100%;
      border-spacing: 0;
      border-collapse: collapse;
      margin: 0 0 1rem;
      overflow: auto;
      display: block;
    }
    .wiki-page__preview tr { background-color: #ffffff; border-top: 1px solid #d1d9e0; }
    .wiki-page__preview tr:nth-child(2n) { background-color: #f6f8fa; }
    .wiki-page__preview th,
    .wiki-page__preview td {
      padding: 6px 13px;
      border: 1px solid #d1d9e0;
    }
    .wiki-page__preview th { font-weight: 600; background-color: #f6f8fa; }

    /* Strong / em */
    .wiki-page__preview strong { font-weight: 600; }
    .wiki-page__preview em { font-style: italic; }
    .wiki-page__preview del { text-decoration: line-through; color: #656d76; }
  `],
})
export class WikiPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly wikiService = inject(WikiService);
  private readonly uiDialog = inject(UiDialogService);

  readonly emojiGroups = EMOJI_GROUPS;

  page = signal<{ id: number; titulo: string; contenido: string; icono: string | null; banner: string | null } | null>(null);
  loading = signal(false);
  saving = signal(false);
  mode = signal<'view' | 'edit'>('view');
  editingTitle = signal(false);
  title = signal('');
  content = signal('');
  icon = signal<string | null>(null);
  banner = signal<string | null>(null);

  showEmojiPicker = signal(false);
  uploaderVisible = signal(false);

  @HostListener('document:click')
  onDocumentClick(): void {
    this.showEmojiPicker.set(false);
  }

  async ngOnInit(): Promise<void> {
    this.route.paramMap.subscribe(async (params) => {
      const pageId = Number(params.get('pageId'));
      if (pageId) await this.loadPage(pageId);
    });
  }

  async loadPage(id: number): Promise<void> {
    this.loading.set(true);
    this.mode.set('view');
    this.showEmojiPicker.set(false);
    try {
      const p = await this.wikiService.getById(id);
      this.page.set(p);
      this.title.set(p.titulo);
      this.content.set(p.contenido);
      this.icon.set(p.icono);
      this.banner.set(p.banner);
    } catch {
      this.page.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  bannerStyle = computed<Record<string, string>>(() => {
    const value = this.banner();
    if (!value) return {} as Record<string, string>;
    if (value.startsWith('http')) {
      return {
        'background-image': `url(${value})`,
        'background-size': 'cover',
        'background-position': 'center',
      };
    }
    const gradient = BANNER_OPTIONS.find(b => b.key === value)?.gradient ?? '';
    return { background: gradient };
  });

  toggleEmojiPicker(): void {
    this.showEmojiPicker.update(v => !v);
  }

  async saveIcon(emoji: string | null): Promise<void> {
    const p = this.page();
    if (!p) return;
    this.icon.set(emoji);
    this.showEmojiPicker.set(false);
    try {
      await this.wikiService.update(p.id, { icono: emoji });
      this.page.set({ ...p, icono: emoji });
    } catch {
      this.icon.set(p.icono);
    }
  }

  async saveBanner(value: string | null): Promise<void> {
    const p = this.page();
    if (!p) return;
    this.banner.set(value);
    try {
      await this.wikiService.update(p.id, { banner: value });
      this.page.set({ ...p, banner: value });
    } catch {
      this.banner.set(p.banner);
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
