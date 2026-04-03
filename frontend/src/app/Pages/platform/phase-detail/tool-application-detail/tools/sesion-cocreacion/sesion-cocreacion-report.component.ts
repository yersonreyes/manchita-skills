import { Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SesionCocreacionReportVersionDto } from './sesion-cocreacion.types';

@Component({
  selector: 'app-sesion-cocreacion-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (reports().length === 0) {
      <div class="empty-report">
        <i class="pi pi-sparkles"></i>
        <p>Aún no hay informes generados. Documentá el objetivo y al menos 2 ideas de la sesión.</p>
      </div>
    } @else {

      @if (reports().length > 1) {
        <div class="version-selector">
          @for (r of reports(); track r.version; let i = $index) {
            <button
              class="version-btn"
              [class.version-btn--active]="selectedIndex() === i"
              (click)="selectedIndex.set(i)"
            >
              v{{ r.version }} — {{ r.generatedAt | date:'dd/MM/yy HH:mm' }}
            </button>
          }
        </div>
      }

      @if (current()) {
        <div class="report">

          <div class="report__summary">
            <p>{{ current()!.report.executiveSummary }}</p>
          </div>

          @if (current()!.report.ideasDestacadas.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-lightbulb"></i>
                Ideas destacadas
              </p>
              <div class="report__ideas">
                @for (item of current()!.report.ideasDestacadas; track $index) {
                  <div class="report__idea">
                    <div class="report__idea-header">
                      <span class="report__grupo">{{ item.grupo }}</span>
                    </div>
                    <p class="report__idea-desc">{{ item.descripcion }}</p>
                    @if (item.potencialInnovador) {
                      <div class="report__idea-meta">
                        <span class="report__tag report__tag--purple">Potencial innovador</span>
                        <p class="report__idea-texto">{{ item.potencialInnovador }}</p>
                      </div>
                    }
                    @if (item.viabilidad) {
                      <p class="report__viabilidad"><strong>Viabilidad:</strong> {{ item.viabilidad }}</p>
                    }
                  </div>
                }
              </div>
            </div>
          }

          @if (current()!.report.patronesEmergentes.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-share-alt"></i>
                Patrones emergentes
              </p>
              <ul class="report__list">
                @for (item of current()!.report.patronesEmergentes; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          }

          @if (current()!.report.tensionesCreativas.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-bolt"></i>
                Tensiones creativas detectadas
              </p>
              <ul class="report__list report__list--tensions">
                @for (item of current()!.report.tensionesCreativas; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          }

          @if (current()!.report.oportunidadesDesarrollo.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-arrow-right"></i>
                Oportunidades de desarrollo
              </p>
              <ul class="report__list report__list--opportunities">
                @for (item of current()!.report.oportunidadesDesarrollo; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          }

          @if (current()!.report.recommendations.length) {
            <div class="report__section">
              <p class="report__label">
                <i class="pi pi-check-square"></i>
                Próximos pasos recomendados
              </p>
              <ul class="report__list report__list--recommendations">
                @for (item of current()!.report.recommendations; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          }

        </div>
      }
    }
  `,
  styles: [`
    .empty-report {
      display: flex; flex-direction: column; align-items: center;
      gap: 0.5rem; padding: 2rem; color: #9ca3af; text-align: center;
    }
    .empty-report i { font-size: 1.5rem; color: #d1d5db; }
    .empty-report p { font-size: 0.875rem; margin: 0; }

    .version-selector { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
    .version-btn {
      padding: 4px 10px; border-radius: 6px;
      border: 1px solid var(--p-surface-300); background: transparent;
      font-size: 0.75rem; color: var(--p-text-secondary-color);
      cursor: pointer; transition: all 0.15s;
    }
    .version-btn:hover { background: var(--p-surface-100); }
    .version-btn--active { background: #fdf4ff; border-color: #f0abfc; color: #c026d3; font-weight: 600; }

    .report {
      display: flex; flex-direction: column; gap: 0;
      border: 1px solid #f0abfc; border-radius: 12px;
      background: linear-gradient(135deg, #fdf4ff, #fae8ff); overflow: hidden;
    }

    .report__summary { padding: 14px 16px; border-bottom: 1px solid #f0abfc; }
    .report__summary p { margin: 0; font-size: 0.875rem; color: #374151; line-height: 1.65; }

    .report__section { padding: 12px 16px; border-bottom: 1px solid #f0abfc; }
    .report__section:last-child { border-bottom: none; }

    .report__label {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.6875rem; font-weight: 700;
      letter-spacing: 0.06em; text-transform: uppercase;
      color: #c026d3; margin: 0 0 8px;
    }
    .report__label .pi { font-size: 0.7rem; }

    .report__ideas { display: flex; flex-direction: column; gap: 8px; }
    .report__idea {
      padding: 10px 12px; border-radius: 8px;
      background: rgba(255,255,255,0.8); border: 1px solid #f0abfc;
    }
    .report__idea-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .report__grupo {
      font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.05em; color: #c026d3;
      border-left: 3px solid #d946ef; padding-left: 6px;
    }
    .report__idea-desc { margin: 0 0 6px; font-size: 0.8125rem; color: #1f2937; font-weight: 500; line-height: 1.4; }

    .report__idea-meta { margin: 5px 0; }
    .report__tag {
      display: inline-block; padding: 1px 6px; border-radius: 4px;
      font-size: 0.67rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.04em; margin-bottom: 3px;
    }
    .report__tag--purple { background: #fae8ff; color: '#86198f'; }
    .report__idea-texto { margin: 3px 0 0; font-size: 0.78rem; color: #4b5563; line-height: 1.4; }
    .report__viabilidad { margin: 4px 0 0; font-size: 0.78rem; color: #374151; }

    .report__list {
      margin: 0; padding-left: 1.25rem;
      display: flex; flex-direction: column; gap: 5px;
    }
    .report__list li { font-size: 0.8125rem; color: #374151; line-height: 1.5; }
    .report__list--tensions li { color: '#7e22ce'; }
    .report__list--opportunities li { color: #065f46; }
    .report__list--recommendations li { font-weight: 500; color: #1f2937; }
  `],
})
export class SesionCocreacionReportComponent {
  reports = input<SesionCocreacionReportVersionDto[]>([]);
  selectedIndex = signal(0);
  current = computed(() => this.reports()[this.selectedIndex()] ?? null);
}
