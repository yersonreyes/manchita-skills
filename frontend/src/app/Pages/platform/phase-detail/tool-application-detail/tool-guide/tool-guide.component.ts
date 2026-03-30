import { Component, computed, input } from '@angular/core';
import { ToolResDto } from '@core/services/catalogService/catalog.res.dto';

interface GuideSection {
  label: string;
  icon: string;
  text: string;
}

@Component({
  selector: 'app-tool-guide',
  standalone: true,
  template: `
    <div class="guide">
      @for (section of sections(); track section.label) {
        <div class="guide__section">
          <div class="guide__section-header">
            <div class="guide__icon">
              <i class="pi {{ section.icon }}"></i>
            </div>
            <span class="guide__label">{{ section.label }}</span>
          </div>
          <p class="guide__text">{{ section.text }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .guide {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .guide__section {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--p-surface-100);

      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
    }

    .guide__section-header {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .guide__icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: var(--p-primary-50, #eff6ff);
      color: var(--p-primary-600, #0284c7);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      flex-shrink: 0;

      .pi { font-size: 0.8rem; }
    }

    .guide__label {
      font-family: 'Syne', sans-serif;
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--p-text-color);
    }

    .guide__text {
      font-size: 0.875rem;
      line-height: 1.7;
      color: var(--p-text-secondary-color);
      margin: 0;
      padding-left: 42px;
    }
  `],
})
export class ToolGuideComponent {
  tool = input.required<ToolResDto>();

  sections = computed<GuideSection[]>(() => {
    const t = this.tool();
    return [
      { label: '¿Qué es?',        icon: 'pi-info-circle', text: t.descripcion },
      { label: '¿Cómo se usa?',   icon: 'pi-list-check',  text: t.comoSeUsa ?? '' },
      { label: '¿Cuándo usarlo?', icon: 'pi-clock',       text: t.cuandoUsarlo ?? '' },
      { label: 'Ejemplo',         icon: 'pi-lightbulb',   text: t.ejemplo ?? '' },
    ].filter((s): s is GuideSection => !!s.text);
  });
}
