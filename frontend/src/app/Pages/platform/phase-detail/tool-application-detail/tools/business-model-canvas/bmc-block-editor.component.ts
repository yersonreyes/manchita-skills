import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BmcBlockConfig } from './bmc-config';

export interface BmcFieldChange {
  blockKey: string;
  fieldKey: string;
  value: string;
}

@Component({
  selector: 'app-bmc-block-editor',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (blockConfig(); as config) {
      <div class="block-editor">
        <div class="block-editor__header">
          <i class="pi {{ config.icon }}"></i>
          <div>
            <h4 class="block-editor__title">{{ config.label }}</h4>
            @if (config.required) {
              <span class="block-editor__required">Requerido para generar informe</span>
            }
          </div>
        </div>

        <div class="block-editor__fields">
          @for (field of config.fields; track field.key) {
            <div class="block-editor__field">
              <label class="block-editor__label">{{ field.label }}</label>
              <textarea
                class="block-editor__textarea p-inputtext"
                [ngModel]="getFieldValue(config.key, field.key)"
                (ngModelChange)="onFieldChange(config.key, field.key, $event)"
                [placeholder]="field.placeholder"
                rows="3"
              ></textarea>
            </div>
          }
        </div>
      </div>
    } @else {
      <div class="block-editor block-editor--empty">
        <i class="pi pi-hand-pointer"></i>
        <p>Seleccioná un bloque del canvas para editarlo</p>
      </div>
    }
  `,
  styles: [`
    .block-editor {
      display: flex;
      flex-direction: column;
      gap: 20px;
      height: 100%;

      &--empty {
        align-items: center;
        justify-content: center;
        color: var(--p-text-muted-color);
        gap: 12px;

        i { font-size: 2rem; }
        p { font-size: 0.875rem; }
      }

      &__header {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--p-surface-200);

        i {
          font-size: 1.2rem;
          color: var(--p-primary-500);
          margin-top: 2px;
        }
      }

      &__title {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--p-text-color);
        margin: 0;
      }

      &__required {
        font-size: 0.7rem;
        color: var(--p-primary-500);
        font-weight: 500;
      }

      &__fields {
        display: flex;
        flex-direction: column;
        gap: 16px;
        overflow-y: auto;
        flex: 1;
      }

      &__field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      &__label {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--p-text-secondary-color);
      }

      &__textarea {
        width: 100%;
        resize: vertical;
        font-family: inherit;
        font-size: 0.875rem;
        line-height: 1.5;
        padding: 8px 10px;
        border-radius: 6px;
        border: 1px solid var(--p-inputtext-border-color);
        background: var(--p-inputtext-background);
        color: var(--p-inputtext-color);
        transition: border-color 0.15s;

        &:focus {
          outline: none;
          border-color: var(--p-primary-500);
          box-shadow: 0 0 0 2px var(--p-primary-200);
        }
      }
    }
  `],
})
export class BmcBlockEditorComponent {
  blockConfig = input<BmcBlockConfig | null>(null);
  blockData = input<Record<string, Record<string, string>>>({});

  fieldChanged = output<BmcFieldChange>();

  getFieldValue(blockKey: string, fieldKey: string): string {
    return this.blockData()[blockKey]?.[fieldKey] ?? '';
  }

  onFieldChange(blockKey: string, fieldKey: string, value: string): void {
    this.fieldChanged.emit({ blockKey, fieldKey, value });
  }
}
