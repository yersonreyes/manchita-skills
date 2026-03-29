import { Component, input, output } from '@angular/core';
import { BmcBlocksDto } from '@core/services/bmcService/bmc.req.dto';
import { BMC_BLOCKS, BmcBlockConfig } from './bmc-config';
import { Tooltip } from 'primeng/tooltip';

// Color zone per BMC section
const BLOCK_ZONE: Record<string, string> = {
  asociacionesClaves:    'zone-left',
  actividadesClaves:     'zone-left',
  recursosClaves:        'zone-left',
  propuestaDeValor:      'zone-center',
  relacionesConClientes: 'zone-right',
  canales:               'zone-right',
  segmentosDeClientes:   'zone-right',
  estructuraDeCostos:    'zone-cost',
  fuentesDeIngreso:      'zone-revenue',
};

@Component({
  selector: 'app-bmc-canvas',
  standalone: true,
  imports: [Tooltip],
  template: `
    <div class="bmc-canvas">

      <!-- Zone labels -->
      <div class="bmc-zones">
        <span class="bmc-zone-label bmc-zone-label--left">Infraestructura</span>
        <span class="bmc-zone-label bmc-zone-label--center">Valor</span>
        <span class="bmc-zone-label bmc-zone-label--right">Mercado</span>
      </div>

      <div class="bmc-grid">
        @for (block of blockConfigs; track block.key) {
          <div
            class="bmc-cell {{ blockZone(block.key) }}"
            [class.bmc-cell--active]="activeBlock() === block.key"
            [class.bmc-cell--complete]="isComplete(block)"
            [class.bmc-cell--partial]="isPartial(block)"
            [attr.data-block]="block.key"
            (click)="blockSelected.emit(block.key)"
            [pTooltip]="block.label + (block.required ? ' ★' : '')"
            tooltipPosition="top"
          >
            <div class="bmc-cell__inner">
              <span class="bmc-cell__label">{{ block.labelShort }}</span>
              <div class="bmc-cell__dots">
                @for (field of block.fields; track field.key) {
                  <span
                    class="bmc-cell__dot"
                    [class.bmc-cell__dot--filled]="hasFieldValue(block.key, field.key)"
                  ></span>
                }
              </div>
            </div>
            @if (block.required) {
              <span class="bmc-cell__star">★</span>
            }
          </div>
        }
      </div>

      <!-- Progress -->
      <div class="bmc-progress">
        <div class="bmc-progress__track">
          <div class="bmc-progress__fill" [style.width.%]="completedCount() / 9 * 100"></div>
        </div>
        <span class="bmc-progress__label">{{ completedCount() }}/9</span>
      </div>

    </div>
  `,
  styles: [`
    .bmc-canvas { display: flex; flex-direction: column; gap: 8px; height: 100%; }

    .bmc-zones { display: grid; grid-template-columns: 2fr 1.4fr 2fr; gap: 4px; padding: 0 2px; }

    .bmc-zone-label {
      font-size: 0.58rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; padding: 2px 6px; border-radius: 4px; text-align: center;
    }
    .bmc-zone-label--left   { color: #92400e; background: #fef3c7; }
    .bmc-zone-label--center { color: #064e3b; background: #d1fae5; }
    .bmc-zone-label--right  { color: #1e3a8a; background: #dbeafe; }

    .bmc-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1.4fr 1fr 1fr;
      grid-template-rows: 1fr 1fr 0.55fr;
      gap: 3px; flex: 1; min-height: 0;
    }

    [data-block="asociacionesClaves"]    { grid-row: 1 / 3; grid-column: 1; }
    [data-block="actividadesClaves"]     { grid-row: 1;     grid-column: 2; }
    [data-block="propuestaDeValor"]      { grid-row: 1 / 3; grid-column: 3; }
    [data-block="relacionesConClientes"] { grid-row: 1;     grid-column: 4; }
    [data-block="segmentosDeClientes"]   { grid-row: 1 / 3; grid-column: 5; }
    [data-block="recursosClaves"]        { grid-row: 2;     grid-column: 2; }
    [data-block="canales"]               { grid-row: 2;     grid-column: 4; }
    [data-block="estructuraDeCostos"]    { grid-row: 3;     grid-column: 1 / 4; }
    [data-block="fuentesDeIngreso"]      { grid-row: 3;     grid-column: 4 / 6; }

    .bmc-cell {
      display: flex; flex-direction: column; align-items: stretch; justify-content: space-between;
      padding: 7px 8px 6px; border-radius: 6px; cursor: pointer;
      transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative; border: 1.5px solid transparent; overflow: hidden;
    }
    .bmc-cell::before { content: ''; position: absolute; inset: 0; opacity: 0; transition: opacity 0.18s; }
    .bmc-cell:hover::before { opacity: 1; }

    .bmc-cell.zone-left  { background: #fffbeb; border-color: #fde68a; }
    .bmc-cell.zone-left:hover { background: #fef3c7; border-color: #f59e0b; }
    .bmc-cell.zone-left .bmc-cell__label { color: #78350f; }
    .bmc-cell.zone-left .bmc-cell__dot--filled { background: #d97706; }

    .bmc-cell.zone-center { background: #ecfdf5; border-color: #6ee7b7; }
    .bmc-cell.zone-center:hover { background: #d1fae5; border-color: #10b981; }
    .bmc-cell.zone-center .bmc-cell__label { color: #064e3b; }
    .bmc-cell.zone-center .bmc-cell__dot--filled { background: #059669; }

    .bmc-cell.zone-right { background: #eff6ff; border-color: #bfdbfe; }
    .bmc-cell.zone-right:hover { background: #dbeafe; border-color: #3b82f6; }
    .bmc-cell.zone-right .bmc-cell__label { color: #1e3a8a; }
    .bmc-cell.zone-right .bmc-cell__dot--filled { background: #2563eb; }

    .bmc-cell.zone-cost { background: #fff7ed; border-color: #fed7aa; }
    .bmc-cell.zone-cost:hover { background: #ffedd5; border-color: #f97316; }
    .bmc-cell.zone-cost .bmc-cell__label { color: #7c2d12; }
    .bmc-cell.zone-cost .bmc-cell__dot--filled { background: #ea580c; }

    .bmc-cell.zone-revenue { background: #f0fdf4; border-color: #bbf7d0; }
    .bmc-cell.zone-revenue:hover { background: #dcfce7; border-color: #22c55e; }
    .bmc-cell.zone-revenue .bmc-cell__label { color: #14532d; }
    .bmc-cell.zone-revenue .bmc-cell__dot--filled { background: #16a34a; }

    .bmc-cell--active {
      border-color: var(--p-primary-500) !important;
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--p-primary-500) 25%, transparent),
                  inset 0 0 0 1px color-mix(in srgb, var(--p-primary-500) 20%, transparent);
      transform: scale(1.02); z-index: 1;
    }
    .bmc-cell--active .bmc-cell__label { color: var(--p-primary-700) !important; }

    .bmc-cell__inner { display: flex; flex-direction: column; gap: 5px; flex: 1; justify-content: center; align-items: center; }
    .bmc-cell__label { font-size: 0.58rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; line-height: 1.3; text-align: center; }
    .bmc-cell__dots  { display: flex; gap: 3px; justify-content: center; }
    .bmc-cell__dot   { width: 5px; height: 5px; border-radius: 50%; background: rgba(0,0,0,0.15); transition: background 0.2s; }
    .bmc-cell__star  { position: absolute; top: 3px; right: 4px; font-size: 0.55rem; color: var(--p-primary-500); line-height: 1; }

    .bmc-progress       { display: flex; align-items: center; gap: 8px; }
    .bmc-progress__track { flex: 1; height: 3px; background: var(--p-surface-200); border-radius: 2px; overflow: hidden; }
    .bmc-progress__fill  { height: 100%; background: linear-gradient(90deg, var(--p-primary-400), var(--p-primary-600)); border-radius: 2px; transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
    .bmc-progress__label { font-size: 0.65rem; font-weight: 600; color: var(--p-text-muted-color); min-width: 24px; text-align: right; }
  `],
})
export class BmcCanvasComponent {
  blocksData = input.required<BmcBlocksDto>();
  activeBlock = input<string>('');
  blockSelected = output<string>();

  protected readonly blockConfigs = BMC_BLOCKS;

  blockZone(key: string): string {
    return BLOCK_ZONE[key] ?? 'zone-left';
  }

  hasFieldValue(blockKey: string, fieldKey: string): boolean {
    const data = this.blocksData() as unknown as Record<string, Record<string, string>>;
    return !!data[blockKey]?.[fieldKey]?.trim();
  }

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
