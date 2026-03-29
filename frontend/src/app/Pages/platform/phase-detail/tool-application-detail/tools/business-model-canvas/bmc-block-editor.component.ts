import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BmcBlockConfig } from './bmc-config';

export interface BmcFieldChange {
  blockKey: string;
  fieldKey: string;
  value: string;
}

const ZONE_ACCENT: Record<string, { border: string; light: string; text: string; num: string }> = {
  asociacionesClaves:    { border: '#f59e0b', light: '#fffbeb', text: '#78350f', num: '#d97706' },
  actividadesClaves:     { border: '#f59e0b', light: '#fffbeb', text: '#78350f', num: '#d97706' },
  recursosClaves:        { border: '#f59e0b', light: '#fffbeb', text: '#78350f', num: '#d97706' },
  propuestaDeValor:      { border: '#10b981', light: '#ecfdf5', text: '#064e3b', num: '#059669' },
  relacionesConClientes: { border: '#3b82f6', light: '#eff6ff', text: '#1e3a8a', num: '#2563eb' },
  canales:               { border: '#3b82f6', light: '#eff6ff', text: '#1e3a8a', num: '#2563eb' },
  segmentosDeClientes:   { border: '#3b82f6', light: '#eff6ff', text: '#1e3a8a', num: '#2563eb' },
  estructuraDeCostos:    { border: '#f97316', light: '#fff7ed', text: '#7c2d12', num: '#ea580c' },
  fuentesDeIngreso:      { border: '#22c55e', light: '#f0fdf4', text: '#14532d', num: '#16a34a' },
};

@Component({
  selector: 'app-bmc-block-editor',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (blockConfig(); as config) {
      @let accent = zoneAccent(config.key);
      <div
        class="editor"
        [style.--z-border]="accent.border"
        [style.--z-light]="accent.light"
        [style.--z-text]="accent.text"
        [style.--z-num]="accent.num"
      >
        <!-- Block header -->
        <div class="editor__header">
          <div class="editor__header-accent"></div>
          <div class="editor__header-body">
            <span class="editor__block-name">{{ config.label }}</span>
            @if (config.required) {
              <span class="editor__required">★ Requerido para generar informe</span>
            }
          </div>
          <!-- Completion pills -->
          <div class="editor__pills">
            @for (field of config.fields; track field.key; let i = $index) {
              <span
                class="editor__pill"
                [class.editor__pill--done]="!!getFieldValue(config.key, field.key)"
              >{{ i + 1 }}</span>
            }
          </div>
        </div>

        <!-- Fields -->
        <div class="editor__fields">
          @for (field of config.fields; track field.key; let i = $index) {
            <div
              class="editor__field"
              [class.editor__field--filled]="!!getFieldValue(config.key, field.key)"
            >
              <!-- Question -->
              <div class="editor__question">
                <span class="editor__q-num">{{ i + 1 }}</span>
                <p class="editor__q-text">{{ field.label }}</p>
              </div>

              <!-- Answer area -->
              <div class="editor__answer">
                <textarea
                  class="editor__textarea"
                  [ngModel]="getFieldValue(config.key, field.key)"
                  (ngModelChange)="onFieldChange(config.key, field.key, $event)"
                  [placeholder]="field.placeholder"
                  rows="3"
                ></textarea>
                @if (getFieldValue(config.key, field.key)) {
                  <div class="editor__answer-status">
                    <span class="editor__done-mark">✓ Completado</span>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    } @else {
      <div class="editor-empty">
        <div class="editor-empty__grid">
          @for (i of [1,2,3,4,5,6,7,8,9]; track i) {
            <div class="editor-empty__cell" [style.opacity]="(10 - i) * 0.08 + 0.05"></div>
          }
        </div>
        <div class="editor-empty__content">
          <p class="editor-empty__title">Seleccioná un bloque</p>
          <p class="editor-empty__hint">Hacé click en cualquier celda del canvas de la izquierda para empezar a completarla</p>
        </div>
      </div>
    }
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Syne:wght@600;700;800&display=swap');

    .editor {
      --z-border: var(--p-primary-500);
      --z-light: var(--p-surface-50);
      --z-text: var(--p-text-color);
      --z-num: var(--p-primary-500);

      display: flex;
      flex-direction: column;
      height: 100%;
      font-family: 'DM Sans', sans-serif;
      overflow: hidden;

      /* ── Header ── */
      &__header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 18px 14px;
        background: var(--z-light);
        border-bottom: 1px solid color-mix(in srgb, var(--z-border) 20%, transparent);
        flex-shrink: 0;
      }

      &__header-accent {
        width: 3px;
        height: 32px;
        border-radius: 2px;
        background: var(--z-border);
        flex-shrink: 0;
      }

      &__header-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      &__block-name {
        font-family: 'Syne', sans-serif;
        font-size: 0.88rem;
        font-weight: 700;
        color: var(--z-text);
        letter-spacing: -0.01em;
      }

      &__required {
        font-size: 0.65rem;
        font-weight: 600;
        color: var(--z-num);
      }

      &__pills {
        display: flex;
        gap: 4px;
      }

      &__pill {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.65rem;
        font-weight: 700;
        border: 1.5px solid var(--p-surface-300);
        color: var(--p-text-muted-color);
        background: var(--p-surface-0);
        transition: all 0.2s;

        &--done {
          background: var(--z-num);
          border-color: var(--z-num);
          color: white;
        }
      }

      /* ── Fields ── */
      &__fields {
        flex: 1;
        overflow-y: auto;
        padding: 0;
        display: flex;
        flex-direction: column;
      }

      &__field {
        display: flex;
        flex-direction: column;
        gap: 0;
        border-bottom: 1px solid var(--p-surface-200);
        transition: background 0.15s;

        &:last-child { border-bottom: none; }

        &--filled {
          .editor__question { background: color-mix(in srgb, var(--z-light) 60%, var(--p-surface-0)); }
        }
      }

      /* ── Question ── */
      &__question {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 14px 18px 10px;
        transition: background 0.15s;
      }

      &__q-num {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: var(--z-num);
        color: white;
        font-size: 0.68rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-top: 1px;
      }

      &__q-text {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--p-text-color);
        margin: 0;
        line-height: 1.4;
      }

      /* ── Answer ── */
      &__answer {
        padding: 0 18px 14px 52px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      &__textarea {
        width: 100%;
        box-sizing: border-box;
        resize: none;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.85rem;
        line-height: 1.6;
        padding: 10px 12px;
        border-radius: 8px;
        border: 1.5px solid var(--p-surface-300);
        background: var(--p-surface-0);
        color: var(--p-text-color);
        transition: border-color 0.15s, box-shadow 0.15s;

        &::placeholder {
          color: var(--p-surface-400);
          font-style: italic;
          font-size: 0.8rem;
        }

        &:focus {
          outline: none;
          border-color: var(--z-border);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--z-border) 12%, transparent);
          background: var(--p-surface-0);
        }
      }

      &__answer-status {
        display: flex;
        align-items: center;
      }

      &__done-mark {
        font-size: 0.68rem;
        font-weight: 600;
        color: var(--z-num);
        display: flex;
        align-items: center;
        gap: 3px;
      }
    }

    /* ── Empty state ── */
    .editor-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 20px;
      padding: 32px 24px;
      position: relative;
      overflow: hidden;

      &__grid {
        position: absolute;
        inset: 0;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 1fr);
        gap: 8px;
        padding: 16px;
        pointer-events: none;
      }

      &__cell {
        background: var(--p-surface-100);
        border-radius: 6px;
      }

      &__content {
        position: relative;
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 8px;
        background: var(--p-surface-0);
        border: 1px solid var(--p-surface-200);
        border-radius: 12px;
        padding: 20px 24px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      }

      &__title {
        font-family: 'Syne', sans-serif;
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--p-text-secondary-color);
        margin: 0;
      }

      &__hint {
        font-size: 0.78rem;
        color: var(--p-text-muted-color);
        margin: 0;
        max-width: 200px;
        line-height: 1.5;
      }
    }
  `],
})
export class BmcBlockEditorComponent {
  blockConfig = input<BmcBlockConfig | null>(null);
  blockData = input<Record<string, Record<string, string>>>({});

  fieldChanged = output<BmcFieldChange>();

  zoneAccent(key: string) {
    return ZONE_ACCENT[key] ?? { border: 'var(--p-primary-500)', light: 'var(--p-surface-50)', text: 'var(--p-text-color)', num: 'var(--p-primary-500)' };
  }

  getFieldValue(blockKey: string, fieldKey: string): string {
    return this.blockData()[blockKey]?.[fieldKey] ?? '';
  }

  onFieldChange(blockKey: string, fieldKey: string, value: string): void {
    this.fieldChanged.emit({ blockKey, fieldKey, value });
  }
}
