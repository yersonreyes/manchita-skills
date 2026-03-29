import { Component, computed, input } from '@angular/core';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';

interface FodaData {
  fortalezas?: string[];
  oportunidades?: string[];
  debilidades?: string[];
  amenazas?: string[];
}

interface Quadrant {
  key: keyof FodaData;
  label: string;
  icon: string;
  colorClass: string;
}

@Component({
  selector: 'app-foda-tool',
  standalone: true,
  template: `
    <div class="foda">
      <div class="foda__grid">
        @for (q of quadrants; track q.key) {
          <div class="foda__quadrant foda__quadrant--{{ q.colorClass }}">
            <div class="foda__quadrant-header">
              <i class="pi {{ q.icon }}"></i>
              <span>{{ q.label }}</span>
            </div>
            @if (hasItems(data()[q.key])) {
              <ul class="foda__list">
                @for (item of data()[q.key]; track $index) {
                  <li class="foda__item">{{ item }}</li>
                }
              </ul>
            } @else {
              <p class="foda__empty">Sin elementos cargados</p>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .foda__grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .foda__quadrant {
      border-radius: 0.75rem;
      padding: 1rem;
      border: 1px solid transparent;
    }

    .foda__quadrant--strengths {
      background-color: #f0fdf4;
      border-color: #bbf7d0;
    }
    .foda__quadrant--strengths .foda__quadrant-header { color: #15803d; }
    .foda__quadrant--strengths .foda__item::before { background-color: #22c55e; }

    .foda__quadrant--opportunities {
      background-color: #eff6ff;
      border-color: #bfdbfe;
    }
    .foda__quadrant--opportunities .foda__quadrant-header { color: #1d4ed8; }
    .foda__quadrant--opportunities .foda__item::before { background-color: #3b82f6; }

    .foda__quadrant--weaknesses {
      background-color: #fff7ed;
      border-color: #fed7aa;
    }
    .foda__quadrant--weaknesses .foda__quadrant-header { color: #c2410c; }
    .foda__quadrant--weaknesses .foda__item::before { background-color: #f97316; }

    .foda__quadrant--threats {
      background-color: #fef2f2;
      border-color: #fecaca;
    }
    .foda__quadrant--threats .foda__quadrant-header { color: #b91c1c; }
    .foda__quadrant--threats .foda__item::before { background-color: #ef4444; }

    .foda__quadrant-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 0.875rem;

      .pi { font-size: 0.875rem; }
    }

    .foda__list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .foda__item {
      display: flex;
      align-items: flex-start;
      gap: 0.625rem;
      font-size: 0.875rem;
      color: #374151;
      line-height: 1.5;

      &::before {
        content: '';
        display: block;
        width: 0.375rem;
        height: 0.375rem;
        border-radius: 50%;
        margin-top: 0.4375rem;
        flex-shrink: 0;
      }
    }

    .foda__empty {
      font-size: 0.8125rem;
      color: #d1d5db;
      font-style: italic;
      margin: 0;
    }
  `],
})
export class FodaToolComponent {
  application = input<ToolApplicationResDto | null>(null);

  data = computed<FodaData>(() => (this.application()?.structuredData ?? {}) as FodaData);

  readonly quadrants: Quadrant[] = [
    { key: 'fortalezas', label: 'Fortalezas', icon: 'pi-shield', colorClass: 'strengths' },
    { key: 'oportunidades', label: 'Oportunidades', icon: 'pi-arrow-up-right', colorClass: 'opportunities' },
    { key: 'debilidades', label: 'Debilidades', icon: 'pi-times-circle', colorClass: 'weaknesses' },
    { key: 'amenazas', label: 'Amenazas', icon: 'pi-exclamation-triangle', colorClass: 'threats' },
  ];

  hasItems(arr: unknown): arr is string[] {
    return Array.isArray(arr) && arr.length > 0;
  }
}
