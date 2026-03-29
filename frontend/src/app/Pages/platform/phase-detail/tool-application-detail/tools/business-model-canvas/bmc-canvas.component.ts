import { Component, input, output } from '@angular/core';
import { BmcBlocksDto } from '@core/services/bmcService/bmc.req.dto';
import { BMC_BLOCKS, BmcBlockConfig } from './bmc-config';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-bmc-canvas',
  standalone: true,
  imports: [Tooltip],
  template: `
    <div class="bmc-canvas">
      <div class="bmc-grid">
        @for (block of blockConfigs; track block.key) {
          <div
            class="bmc-cell"
            [class.bmc-cell--active]="activeBlock() === block.key"
            [class.bmc-cell--complete]="isComplete(block)"
            [class.bmc-cell--partial]="isPartial(block)"
            [attr.data-block]="block.key"
            (click)="blockSelected.emit(block.key)"
            [pTooltip]="block.label + (block.required ? ' (requerido)' : '')"
            tooltipPosition="top"
          >
            <i class="pi {{ block.icon }} bmc-cell__icon"></i>
            <span class="bmc-cell__label">{{ block.labelShort }}</span>
            <span class="bmc-cell__status">
              @if (isComplete(block)) {
                <i class="pi pi-check-circle"></i>
              } @else if (isPartial(block)) {
                <i class="pi pi-circle-fill"></i>
              } @else {
                <i class="pi pi-circle"></i>
              }
            </span>
            @if (block.required) {
              <span class="bmc-cell__req-dot"></span>
            }
          </div>
        }
      </div>

      <div class="bmc-progress">
        <span class="bmc-progress__label">{{ completedCount() }}/9 bloques con datos</span>
        <div class="bmc-progress__bar">
          <div class="bmc-progress__fill" [style.width.%]="completedCount() / 9 * 100"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bmc-canvas {
      display: flex;
      flex-direction: column;
      gap: 12px;
      height: 100%;
    }

    .bmc-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1.4fr 1fr 1fr;
      grid-template-rows: 1fr 1fr 0.6fr;
      gap: 4px;
      flex: 1;
      min-height: 0;
    }

    [data-block="asociacionesClaves"]   { grid-row: 1 / 3; grid-column: 1; }
    [data-block="actividadesClaves"]    { grid-row: 1;     grid-column: 2; }
    [data-block="propuestaDeValor"]     { grid-row: 1 / 3; grid-column: 3; }
    [data-block="relacionesConClientes"]{ grid-row: 1;     grid-column: 4; }
    [data-block="segmentosDeClientes"]  { grid-row: 1 / 3; grid-column: 5; }
    [data-block="recursosClaves"]       { grid-row: 2;     grid-column: 2; }
    [data-block="canales"]              { grid-row: 2;     grid-column: 4; }
    [data-block="estructuraDeCostos"]   { grid-row: 3;     grid-column: 1 / 4; }
    [data-block="fuentesDeIngreso"]     { grid-row: 3;     grid-column: 4 / 6; }

    .bmc-cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      padding: 6px 4px;
      border: 1.5px solid var(--p-surface-200);
      border-radius: 6px;
      cursor: pointer;
      background: var(--p-surface-0);
      transition: border-color 0.15s, background 0.15s;
      position: relative;
      text-align: center;
      overflow: hidden;

      &:hover {
        border-color: var(--p-primary-300);
        background: var(--p-primary-50);
      }

      &--active {
        border-color: var(--p-primary-500) !important;
        background: var(--p-primary-50) !important;
        box-shadow: 0 0 0 2px var(--p-primary-200);
      }

      &--complete .bmc-cell__status { color: var(--p-green-500); }
      &--partial  .bmc-cell__status { color: var(--p-orange-400); }

      &__icon {
        font-size: 0.95rem;
        color: var(--p-text-muted-color);
      }

      &__label {
        font-size: 0.6rem;
        font-weight: 600;
        color: var(--p-text-secondary-color);
        line-height: 1.2;
      }

      &__status {
        font-size: 0.6rem;
        color: var(--p-surface-400);
      }

      &__req-dot {
        position: absolute;
        top: 3px;
        right: 3px;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: var(--p-primary-400);
      }
    }

    .bmc-progress {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding-top: 4px;

      &__label {
        font-size: 0.7rem;
        color: var(--p-text-muted-color);
      }

      &__bar {
        height: 4px;
        background: var(--p-surface-200);
        border-radius: 2px;
        overflow: hidden;
      }

      &__fill {
        height: 100%;
        background: var(--p-primary-500);
        border-radius: 2px;
        transition: width 0.3s ease;
      }
    }
  `],
})
export class BmcCanvasComponent {
  blocksData = input.required<BmcBlocksDto>();
  activeBlock = input<string>('');
  blockSelected = output<string>();

  protected readonly blockConfigs = BMC_BLOCKS;

  isComplete(block: BmcBlockConfig): boolean {
    const data = this.blocksData() as unknown as Record<string, Record<string, string>>;
    const blockData = data[block.key];
    if (!blockData) return false;
    return block.fields.every((f) => !!blockData[f.key]?.trim());
  }

  isPartial(block: BmcBlockConfig): boolean {
    const data = this.blocksData() as unknown as Record<string, Record<string, string>>;
    const blockData = data[block.key];
    if (!blockData) return false;
    const filled = block.fields.filter((f) => !!blockData[f.key]?.trim()).length;
    return filled > 0 && filled < block.fields.length;
  }

  completedCount(): number {
    const data = this.blocksData() as unknown as Record<string, Record<string, string>>;
    return BMC_BLOCKS.filter((b) => {
      const blockData = data[b.key];
      return blockData && b.fields.some((f) => !!blockData[f.key]?.trim());
    }).length;
  }
}
