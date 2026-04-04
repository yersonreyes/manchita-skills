import { Component, ViewEncapsulation, input } from '@angular/core';
import { Editor } from '@tiptap/core';
import { TiptapBubbleMenuDirective } from 'ngx-tiptap';

@Component({
  selector: 'app-wiki-bubble-menu',
  standalone: true,
  imports: [TiptapBubbleMenuDirective],
  encapsulation: ViewEncapsulation.None,
  template: `
    <tiptap-bubble-menu [editor]="editor()">
      <div class="wiki-bubble-menu">
        <button
          class="wiki-bubble-menu__btn"
          [class.active]="editor().isActive('bold')"
          (click)="editor().chain().focus().toggleBold().run()"
          title="Negrita"
        >
          <i class="pi pi-bold"></i>
        </button>
        <button
          class="wiki-bubble-menu__btn"
          [class.active]="editor().isActive('italic')"
          (click)="editor().chain().focus().toggleItalic().run()"
          title="Cursiva"
        >
          <i class="pi pi-italic"></i>
        </button>
        <button
          class="wiki-bubble-menu__btn"
          [class.active]="editor().isActive('strike')"
          (click)="editor().chain().focus().toggleStrike().run()"
          title="Tachado"
        >
          <i class="pi pi-strikethrough"></i>
        </button>
        <button
          class="wiki-bubble-menu__btn"
          [class.active]="editor().isActive('code')"
          (click)="editor().chain().focus().toggleCode().run()"
          title="Código"
        >
          <i class="pi pi-code"></i>
        </button>

        <span class="wiki-bubble-menu__sep"></span>

        <button
          class="wiki-bubble-menu__btn"
          [class.active]="editor().isActive('heading', { level: 1 })"
          (click)="editor().chain().focus().toggleHeading({ level: 1 }).run()"
          title="Título 1"
        >
          H1
        </button>
        <button
          class="wiki-bubble-menu__btn"
          [class.active]="editor().isActive('heading', { level: 2 })"
          (click)="editor().chain().focus().toggleHeading({ level: 2 }).run()"
          title="Título 2"
        >
          H2
        </button>
        <button
          class="wiki-bubble-menu__btn"
          [class.active]="editor().isActive('heading', { level: 3 })"
          (click)="editor().chain().focus().toggleHeading({ level: 3 }).run()"
          title="Título 3"
        >
          H3
        </button>

        <span class="wiki-bubble-menu__sep"></span>

        <button
          class="wiki-bubble-menu__btn"
          [class.active]="editor().isActive('blockquote')"
          (click)="editor().chain().focus().toggleBlockquote().run()"
          title="Cita"
        >
          <i class="pi pi-quote-right"></i>
        </button>
        <button
          class="wiki-bubble-menu__btn"
          [class.active]="editor().isActive('bulletList')"
          (click)="editor().chain().focus().toggleBulletList().run()"
          title="Lista"
        >
          <i class="pi pi-list"></i>
        </button>
        <button
          class="wiki-bubble-menu__btn"
          [class.active]="editor().isActive('orderedList')"
          (click)="editor().chain().focus().toggleOrderedList().run()"
          title="Lista numerada"
        >
          <i class="pi pi-list-ordered"></i>
        </button>
        <button
          class="wiki-bubble-menu__btn"
          [class.active]="editor().isActive('codeBlock')"
          (click)="editor().chain().focus().toggleCodeBlock().run()"
          title="Bloque de código"
        >
          <i class="pi pi-hashtag"></i>
        </button>
      </div>
    </tiptap-bubble-menu>
  `,
  styles: [`
    .wiki-bubble-menu {
      display: flex;
      align-items: center;
      gap: 2px;
      background: #1f2328;
      border-radius: 8px;
      padding: 4px 6px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }
    .wiki-bubble-menu__btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 28px;
      border: none;
      background: transparent;
      color: rgba(255, 255, 255, 0.7);
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.75rem;
      font-weight: 600;
      transition: background 0.1s, color 0.1s;
    }
    .wiki-bubble-menu__btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }
    .wiki-bubble-menu__btn.active {
      background: rgba(255, 255, 255, 0.15);
      color: white;
    }
    .wiki-bubble-menu__btn i {
      font-size: 0.8rem;
    }
    .wiki-bubble-menu__sep {
      width: 1px;
      height: 18px;
      background: rgba(255, 255, 255, 0.2);
      margin: 0 4px;
    }
  `],
})
export class WikiBubbleMenuComponent {
  editor = input.required<Editor>();
}
