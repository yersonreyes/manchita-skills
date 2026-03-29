import { JsonPipe, KeyValuePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';

@Component({
  selector: 'app-default-tool',
  standalone: true,
  imports: [KeyValuePipe, JsonPipe],
  template: `
    <div class="default-tool">
      @if (isEmpty()) {
        <div class="default-tool__empty">
          <i class="pi pi-database"></i>
          <p>Esta herramienta todavía no tiene datos estructurados cargados.</p>
          <p class="hint">Usá el botón "Ver / editar JSON" para agregar datos.</p>
        </div>
      } @else {
        <div class="default-tool__grid">
          @for (entry of data() | keyvalue; track entry.key) {
            <div class="default-tool__entry">
              <span class="default-tool__key">{{ entry.key }}</span>
              <span class="default-tool__value">
                @if (isObject(entry.value)) {
                  <pre class="default-tool__json">{{ entry.value | json }}</pre>
                } @else {
                  {{ entry.value }}
                }
              </span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .default-tool {
      padding: 0.5rem 0;
    }

    .default-tool__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 3rem 1rem;
      color: #9ca3af;
      text-align: center;

      .pi {
        font-size: 2rem;
        opacity: 0.4;
      }

      p {
        margin: 0;
        font-size: 0.875rem;
      }

      .hint {
        font-size: 0.75rem;
        color: #d1d5db;
      }
    }

    .default-tool__grid {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .default-tool__entry {
      display: grid;
      grid-template-columns: 180px 1fr;
      gap: 1rem;
      align-items: start;
      padding: 0.625rem 0.875rem;
      background-color: #f9fafb;
      border: 1px solid #f3f4f6;
      border-radius: 0.5rem;
    }

    .default-tool__key {
      font-size: 0.8125rem;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      word-break: break-word;
    }

    .default-tool__value {
      font-size: 0.875rem;
      color: #1f2937;
      word-break: break-word;
    }

    .default-tool__json {
      font-size: 0.75rem;
      font-family: 'Courier New', monospace;
      background-color: #f3f4f6;
      padding: 0.5rem;
      border-radius: 0.375rem;
      margin: 0;
      overflow-x: auto;
      white-space: pre-wrap;
    }
  `],
})
export class DefaultToolComponent {
  application = input<ToolApplicationResDto | null>(null);

  data = () => (this.application()?.structuredData ?? {}) as Record<string, unknown>;

  isEmpty(): boolean {
    return Object.keys(this.data()).length === 0;
  }

  isObject(value: unknown): boolean {
    return typeof value === 'object' && value !== null;
  }
}
