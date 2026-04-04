import { Editor, Extension, Range } from '@tiptap/core';
import { Suggestion, type SuggestionOptions } from '@tiptap/suggestion';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface SlashCommandItem {
  id: string;
  label: string;
  icon: string;
  description: string;
  command: (editor: Editor, range: Range) => void;
}

// ─── Comandos disponibles ────────────────────────────────────────────────────

const SLASH_COMMANDS: SlashCommandItem[] = [
  {
    id: 'h1',
    label: 'Título 1',
    icon: 'pi pi-heading',
    description: 'Título principal',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run();
    },
  },
  {
    id: 'h2',
    label: 'Título 2',
    icon: 'pi pi-heading',
    description: 'Subtítulo',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run();
    },
  },
  {
    id: 'h3',
    label: 'Título 3',
    icon: 'pi pi-heading',
    description: 'Sección',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleHeading({ level: 3 }).run();
    },
  },
  {
    id: 'bullet',
    label: 'Lista',
    icon: 'pi pi-list',
    description: 'Lista con viñetas',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    id: 'ordered',
    label: 'Lista numerada',
    icon: 'pi pi-list-ordered',
    description: 'Lista con números',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    id: 'task',
    label: 'Lista de tareas',
    icon: 'pi pi-check-square',
    description: 'Checklist con casillas',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    id: 'quote',
    label: 'Cita',
    icon: 'pi pi-quote-right',
    description: 'Bloque de cita',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    id: 'code',
    label: 'Código',
    icon: 'pi pi-code',
    description: 'Bloque de código',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    id: 'hr',
    label: 'Separador',
    icon: 'pi pi-minus',
    description: 'Línea horizontal',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    id: 'table',
    label: 'Tabla',
    icon: 'pi pi-table',
    description: 'Elegí filas × columnas',
    command: (editor, range) => {
      showTablePicker(editor, range);
    },
  },
  {
    id: 'image',
    label: 'Imagen',
    icon: 'pi pi-image',
    description: 'Insertar imagen por URL',
    command: (editor, range) => {
      const src = window.prompt('URL de la imagen:');
      if (src) {
        editor.chain().focus().deleteRange(range).setImage({ src }).run();
      }
    },
  },
];

// ─── Grid picker para tablas ─────────────────────────────────────────────────

const MAX_ROWS = 8;
const MAX_COLS = 8;

function showTablePicker(editor: Editor, range: Range): void {
  const overlay = document.createElement('div');
  overlay.className = 'wiki-table-picker-overlay';

  const picker = document.createElement('div');
  picker.className = 'wiki-table-picker';

  const label = document.createElement('div');
  label.className = 'wiki-table-picker__label';
  label.textContent = 'Seleccioná tamaño';

  const grid = document.createElement('div');
  grid.className = 'wiki-table-picker__grid';

  let hoveredRow = 0;
  let hoveredCol = 0;

  for (let r = 0; r < MAX_ROWS; r++) {
    for (let c = 0; c < MAX_COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'wiki-table-picker__cell';
      cell.dataset['row'] = String(r);
      cell.dataset['col'] = String(c);

      cell.addEventListener('mouseenter', () => {
        hoveredRow = r;
        hoveredCol = c;
        label.textContent = `${r + 1} × ${c + 1}`;
        grid.querySelectorAll<HTMLElement>('.wiki-table-picker__cell').forEach((el) => {
          const er = Number(el.dataset['row']);
          const ec = Number(el.dataset['col']);
          el.classList.toggle('wiki-table-picker__cell--active', er <= r && ec <= c);
        });
      });

      cell.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertTable({ rows: hoveredRow + 1, cols: hoveredCol + 1, withHeaderRow: true })
          .run();
        cleanup();
      });

      grid.appendChild(cell);
    }
  }

  picker.appendChild(label);
  picker.appendChild(grid);
  overlay.appendChild(picker);

  const drawer = editor.view.dom.closest('.p-drawer');
  (drawer || document.body).appendChild(overlay);

  function cleanup(): void {
    overlay.remove();
  }

  // Cerrar al hacer click fuera del picker
  overlay.addEventListener('mousedown', (e) => {
    if (e.target === overlay) {
      editor.chain().focus().deleteRange(range).run();
      cleanup();
    }
  });

  // Cerrar con Escape
  function onKey(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      editor.chain().focus().deleteRange(range).run();
      cleanup();
      document.removeEventListener('keydown', onKey);
    }
  }
  document.addEventListener('keydown', onKey);
}

// ─── Render del popup (vanilla DOM) ──────────────────────────────────────────

function renderMenu() {
  let popup: HTMLDivElement | null = null;
  let items: SlashCommandItem[] = [];
  let selectedIndex = 0;
  let capturedEditor: Editor | null = null;
  let capturedRange: Range | null = null;
  let mountedInDrawer = false;

  function createPopup(editor: Editor): HTMLDivElement {
    const el = document.createElement('div');
    el.className = 'wiki-slash-menu';
    el.addEventListener('mousedown', (e) => e.preventDefault());

    // Montar DENTRO del Drawer si existe — la mascara modal del Drawer
    // intercepta pointer events de elementos en document.body
    const drawer = editor.view.dom.closest('.p-drawer');
    if (drawer) {
      el.style.position = 'absolute';
      mountedInDrawer = true;
      drawer.appendChild(el);
    } else {
      mountedInDrawer = false;
      document.body.appendChild(el);
    }

    return el;
  }

  function destroyPopup(): void {
    if (popup) {
      popup.remove();
      popup = null;
    }
    capturedEditor = null;
    capturedRange = null;
  }

  function selectItem(index: number): void {
    const ed = capturedEditor;
    const range = capturedRange;
    const item = items[index];
    destroyPopup();
    if (ed && range && item) {
      item.command(ed, range);
    }
  }

  function updatePopup(): void {
    if (!popup) return;

    if (items.length === 0) {
      popup.innerHTML = `
        <div class="wiki-slash-menu__empty">
          <span>Sin resultados</span>
        </div>
      `;
      return;
    }

    popup.innerHTML = items
      .map(
        (item, i) => `
      <button
        class="wiki-slash-menu__item ${i === selectedIndex ? 'wiki-slash-menu__item--active' : ''}"
        data-index="${i}"
      >
        <span class="wiki-slash-menu__icon"><i class="${item.icon}"></i></span>
        <span class="wiki-slash-menu__text">
          <span class="wiki-slash-menu__label">${item.label}</span>
          <span class="wiki-slash-menu__desc">${item.description}</span>
        </span>
      </button>
    `,
      )
      .join('');

    popup.querySelectorAll<HTMLButtonElement>('.wiki-slash-menu__item').forEach((btn) => {
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        selectItem(Number(btn.dataset['index']));
      });
      btn.addEventListener('mouseenter', () => {
        selectedIndex = Number(btn.dataset['index']);
        highlightActive();
      });
    });
  }

  function highlightActive(): void {
    if (!popup) return;
    popup.querySelectorAll('.wiki-slash-menu__item').forEach((el, i) => {
      el.classList.toggle('wiki-slash-menu__item--active', i === selectedIndex);
    });
  }

  function positionPopup(clientRect: (() => DOMRect | null) | null | undefined): void {
    if (!popup || !clientRect) return;
    const rect = clientRect();
    if (!rect) return;

    if (mountedInDrawer && popup.parentElement) {
      // Convertir coords de viewport a coords relativas al Drawer
      const parentRect = popup.parentElement.getBoundingClientRect();
      popup.style.left = `${rect.left - parentRect.left}px`;
      popup.style.top = `${rect.bottom - parentRect.top + 6}px`;
    } else {
      popup.style.left = `${rect.left}px`;
      popup.style.top = `${rect.bottom + 6}px`;
    }
  }

  return {
    onStart(props: any) {
      popup = createPopup(props.editor);
      items = props.items;
      selectedIndex = 0;
      capturedEditor = props.editor;
      capturedRange = props.range;
      updatePopup();
      positionPopup(props.clientRect);
    },

    onUpdate(props: any) {
      items = props.items;
      selectedIndex = 0;
      capturedEditor = props.editor;
      capturedRange = props.range;
      updatePopup();
      positionPopup(props.clientRect);
    },

    onKeyDown(props: { event: KeyboardEvent }): boolean {
      const { event } = props;

      if (event.key === 'ArrowDown') {
        selectedIndex = (selectedIndex + 1) % items.length;
        highlightActive();
        return true;
      }
      if (event.key === 'ArrowUp') {
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        highlightActive();
        return true;
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }
      if (event.key === 'Escape') {
        destroyPopup();
        return true;
      }

      return false;
    },

    onExit() {
      destroyPopup();
    },
  };
}

// ─── Extension ───────────────────────────────────────────────────────────────

export const SlashCommands = Extension.create<{
  suggestion: Partial<SuggestionOptions<SlashCommandItem, SlashCommandItem>>;
}>({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        startOfLine: false,
        items: ({ query }: { query: string }) => {
          const q = query.toLowerCase();
          return SLASH_COMMANDS.filter(
            (item) =>
              item.label.toLowerCase().includes(q) || item.id.toLowerCase().includes(q),
          );
        },
        command: ({ editor, range, props }) => {
          props.command(editor, range);
        },
        render: renderMenu,
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
