import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PrototipoPensarReportVersionDto } from './prototipo-pensar.types';

@Component({
  selector: 'app-prototipo-pensar-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (versions().length === 0) {
      <div class="report-empty">
        <i class="pi pi-lightbulb" style="font-size:2rem;color:#7c3aed;margin-bottom:.75rem;"></i>
        <p>Documentá tus iteraciones y presioná <strong>Generar análisis</strong> para obtener un reporte de pensamiento.</p>
      </div>
    } @else {
      @for (v of versions(); track v.version) {
        <div class="report-version">
          <div class="report-version__header">
            <span class="report-version__badge">v{{ v.version }}</span>
            <span class="report-version__date">{{ v.generatedAt | date:'dd/MM/yyyy HH:mm' }}</span>
          </div>

          <div class="report-section report-section--summary">
            <p>{{ v.report.executiveSummary }}</p>
          </div>

          <div class="report-section">
            <h4 class="report-section__title">Evolución del pensamiento</h4>
            <p class="report-section__text">{{ v.report.evolucionDelPensamiento }}</p>
          </div>

          <div class="report-section">
            <h4 class="report-section__title">Estado de confianza</h4>
            <div class="report-confidence">
              <i class="pi pi-check-circle" style="color:#7c3aed;"></i>
              <p>{{ v.report.estadoConfianza }}</p>
            </div>
          </div>

          <div class="report-row">
            <div class="report-section report-section--half">
              <h4 class="report-section__title">Hipótesis validadas</h4>
              @for (h of v.report.hipotesisValidadas; track h.hipotesis) {
                <div class="report-hypothesis report-hypothesis--valid">
                  <span class="report-hypothesis__label">{{ h.hipotesis }}</span>
                  <p class="report-hypothesis__evidence">{{ h.evidencia }}</p>
                </div>
              }
            </div>
            <div class="report-section report-section--half">
              <h4 class="report-section__title">Hipótesis descartadas</h4>
              @for (h of v.report.hipotesisDescartadas; track h.hipotesis) {
                <div class="report-hypothesis report-hypothesis--invalid">
                  <span class="report-hypothesis__label">{{ h.hipotesis }}</span>
                  <p class="report-hypothesis__evidence">{{ h.evidencia }}</p>
                </div>
              }
            </div>
          </div>

          <div class="report-section">
            <h4 class="report-section__title">Aprendizajes clave</h4>
            <ul class="report-list">
              @for (a of v.report.aprendizajesClave; track a) {
                <li class="report-list__item report-list__item--violet">{{ a }}</li>
              }
            </ul>
          </div>

          <div class="report-section">
            <h4 class="report-section__title">Recomendaciones</h4>
            <ol class="report-ordered-list">
              @for (rec of v.report.recommendations; track rec) {
                <li>{{ rec }}</li>
              }
            </ol>
          </div>
        </div>
      }
    }
  `,
  styles: [`
    .report-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
      text-align: center;
      color: #6b7280;
    }
    .report-version {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .report-version:last-child { border-bottom: none; margin-bottom: 0; }
    .report-version__header { display: flex; align-items: center; gap: .75rem; }
    .report-version__badge {
      background: #7c3aed;
      color: #fff;
      font-size: .75rem;
      font-weight: 700;
      padding: .2rem .6rem;
      border-radius: 9999px;
    }
    .report-version__date { font-size: .8rem; color: #6b7280; }
    .report-section {
      background: #f9fafb;
      border-radius: .75rem;
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: .625rem;
    }
    .report-section--summary { background: #f5f3ff; border-left: 4px solid #7c3aed; }
    .report-section--half { flex: 1; }
    .report-section__title {
      font-size: .85rem;
      font-weight: 700;
      color: #374151;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: .05em;
    }
    .report-section__text { margin: 0; color: #374151; line-height: 1.6; font-size: .875rem; }
    .report-row {
      display: flex;
      gap: 1rem;
    }
    .report-confidence {
      display: flex;
      align-items: flex-start;
      gap: .75rem;
    }
    .report-confidence i { margin-top: .15rem; flex-shrink: 0; }
    .report-confidence p { margin: 0; color: #374151; line-height: 1.6; font-size: .875rem; }
    .report-hypothesis {
      padding: .625rem .875rem;
      border-radius: .5rem;
      border-left: 3px solid transparent;
    }
    .report-hypothesis--valid { background: #f0fdf4; border-left-color: #16a34a; }
    .report-hypothesis--invalid { background: #fef2f2; border-left-color: #ef4444; }
    .report-hypothesis__label { font-size: .8rem; font-weight: 600; color: #374151; display: block; margin-bottom: .25rem; }
    .report-hypothesis__evidence { margin: 0; font-size: .8rem; color: #6b7280; }
    .report-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: .5rem; }
    .report-list__item {
      padding: .5rem .75rem;
      border-radius: .5rem;
      font-size: .875rem;
      color: #374151;
      border-left: 3px solid transparent;
    }
    .report-list__item--violet { background: #f5f3ff; border-left-color: #7c3aed; }
    .report-ordered-list { padding-left: 1.25rem; margin: 0; display: flex; flex-direction: column; gap: .5rem; }
    .report-ordered-list li { font-size: .875rem; color: #374151; line-height: 1.6; }
  `],
})
export class PrototipoPensarReportComponent {
  versions = input<PrototipoPensarReportVersionDto[]>([]);
}
