import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MvpReportVersionDto } from './mvp.types';

@Component({
  selector: 'app-mvp-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (versions().length === 0) {
      <div class="report-empty">
        <i class="pi pi-rocket" style="font-size:2rem;color:#10b981;margin-bottom:.75rem;"></i>
        <p>Definí la hipótesis, el tipo de MVP y el core feature, luego presioná <strong>Generar análisis</strong>.</p>
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
            <h4 class="report-section__title">Validez de la hipótesis</h4>
            <p class="report-section__text">{{ v.report.validezHipotesis }}</p>
          </div>

          <div class="report-section">
            <h4 class="report-section__title">Evaluación del scope</h4>
            <p class="report-section__text">{{ v.report.evaluacionScope }}</p>
          </div>

          <div class="report-row">
            <div class="report-section report-section--half">
              <h4 class="report-section__title">Calidad de las métricas</h4>
              <p class="report-section__text">{{ v.report.calidadMetricas }}</p>
            </div>
            <div class="report-section report-section--half">
              <h4 class="report-section__title">Estado de validación</h4>
              <div class="report-estado">
                <i class="pi pi-gauge" style="color:#10b981;flex-shrink:0;margin-top:.15rem;"></i>
                <p>{{ v.report.estadoValidacion }}</p>
              </div>
            </div>
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
      background: #10b981;
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
    .report-section--summary { background: #d1fae5; border-left: 4px solid #10b981; }
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
    .report-row { display: flex; gap: 1rem; }
    .report-estado { display: flex; align-items: flex-start; gap: .75rem; }
    .report-estado p { margin: 0; color: #374151; line-height: 1.6; font-size: .875rem; }
    .report-ordered-list { padding-left: 1.25rem; margin: 0; display: flex; flex-direction: column; gap: .5rem; }
    .report-ordered-list li { font-size: .875rem; color: #374151; line-height: 1.6; }
  `],
})
export class MvpReportComponent {
  versions = input<MvpReportVersionDto[]>([]);
}
