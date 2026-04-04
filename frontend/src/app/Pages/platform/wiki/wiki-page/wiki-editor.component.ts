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
