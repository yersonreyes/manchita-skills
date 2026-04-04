import {
  Component,
  DestroyRef,
  OnInit,
  ViewEncapsulation,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { common, createLowlight } from 'lowlight';
import { TiptapEditorDirective } from 'ngx-tiptap';
import { WikiBubbleMenuComponent } from './wiki-bubble-menu.component';
import { SlashCommands } from './slash-commands.extension';

const lowlight = createLowlight(common);

@Component({
  selector: 'app-wiki-editor',
  standalone: true,
  imports: [TiptapEditorDirective, WikiBubbleMenuComponent],
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (editor()) {
      <div class="wiki-editor" [class.wiki-editor--readonly]="!editable()">
        <tiptap-editor [editor]="editor()!" />
        @if (editable()) {
          <app-wiki-bubble-menu [editor]="editor()!" />
        }
      </div>
    }
  `,
  styles: [`
    .wiki-editor .ProseMirror {
      outline: none;
      min-height: 200px;
    }
    .wiki-editor .ProseMirror p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      color: var(--p-text-muted-color);
      pointer-events: none;
      float: left;
      height: 0;
    }

    /* Task list */
    .wiki-editor .ProseMirror ul[data-type="taskList"] {
      list-style: none;
      padding-left: 0;
    }
    .wiki-editor .ProseMirror ul[data-type="taskList"] li {
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }
    .wiki-editor .ProseMirror ul[data-type="taskList"] li label {
      flex-shrink: 0;
      margin-top: 3px;
    }

    /* Table */
    .wiki-editor .ProseMirror table {
      border-collapse: collapse;
      margin-bottom: 16px;
      width: 100%;
    }
    .wiki-editor .ProseMirror th,
    .wiki-editor .ProseMirror td {
      border: 1px solid hsla(210, 18%, 87%, 1);
      padding: 6px 13px;
      min-width: 80px;
    }
    .wiki-editor .ProseMirror th {
      font-weight: 600;
      background-color: #f6f8fa;
    }

    /* Slash commands menu */
    .wiki-slash-menu {
      position: fixed;
      z-index: 11000;
      background: white;
      border: 1px solid var(--p-surface-200);
      border-radius: 10px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
      padding: 6px;
      min-width: 240px;
      max-height: 320px;
      overflow-y: auto;
      animation: slash-menu-in 0.12s ease-out;
    }
    @keyframes slash-menu-in {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .wiki-slash-menu__item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 8px 10px;
      border: none;
      background: transparent;
      border-radius: 6px;
      cursor: pointer;
      text-align: left;
      transition: background 0.08s;
    }
    .wiki-slash-menu__item:hover,
    .wiki-slash-menu__item--active {
      background: var(--p-primary-50, #ecfdf5);
    }
    .wiki-slash-menu__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: var(--p-surface-100);
      color: var(--p-text-color);
      font-size: 0.85rem;
      flex-shrink: 0;
    }
    .wiki-slash-menu__item--active .wiki-slash-menu__icon {
      background: var(--p-primary-100, #d1fae5);
      color: var(--p-primary-color);
    }
    .wiki-slash-menu__text {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    .wiki-slash-menu__label {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--p-text-color);
    }
    .wiki-slash-menu__desc {
      font-size: 0.75rem;
      color: var(--p-text-muted-color);
    }
    .wiki-slash-menu__empty {
      padding: 12px 10px;
      font-size: 0.8rem;
      color: var(--p-text-muted-color);
      text-align: center;
    }

    /* Table grid picker */
    .wiki-table-picker-overlay {
      position: fixed;
      inset: 0;
      z-index: 11001;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.15);
      animation: slash-menu-in 0.1s ease-out;
    }
    .wiki-table-picker {
      background: white;
      border: 1px solid var(--p-surface-200);
      border-radius: 12px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
      padding: 16px;
    }
    .wiki-table-picker__label {
      text-align: center;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--p-text-color);
      margin-bottom: 10px;
    }
    .wiki-table-picker__grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 3px;
    }
    .wiki-table-picker__cell {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      border: 1.5px solid var(--p-surface-200);
      background: var(--p-surface-50, #fafafa);
      cursor: pointer;
      transition: background 0.06s, border-color 0.06s;
    }
    .wiki-table-picker__cell:hover {
      border-color: var(--p-primary-color);
    }
    .wiki-table-picker__cell--active {
      background: var(--p-primary-100, #d1fae5);
      border-color: var(--p-primary-color);
    }
  `],
})
export class WikiEditorComponent implements OnInit {
  content = input<string>('');
  editable = input<boolean>(true);
  contentChanged = output<string>();

  editor = signal<Editor | null>(null);

  private readonly destroyRef = inject(DestroyRef);
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    const ed = new Editor({
      extensions: [
        StarterKit.configure({
          codeBlock: false,
        }),
        Markdown,
        Placeholder.configure({
          placeholder: 'Empezá a escribir...',
        }),
        Link.configure({
          openOnClick: false,
          autolink: true,
        }),
        Image,
        Table.configure({ resizable: true }),
        TableRow,
        TableCell,
        TableHeader,
        CodeBlockLowlight.configure({ lowlight }),
        TaskList,
        TaskItem.configure({ nested: true }),
        SlashCommands,
      ],
      content: this.content(),
      editable: this.editable(),
      onUpdate: ({ editor }) => {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          const md = (editor.storage as any).markdown.getMarkdown() as string;
          this.contentChanged.emit(md);
        }, 300);
      },
    });

    this.editor.set(ed);

    this.destroyRef.onDestroy(() => {
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      ed.destroy();
    });
  }
}
