import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PrototipoFuncionalReportVersionDto } from './prototipo-funcional.types';

@Component({
  selector: 'app-prototipo-funcional-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (versions().length === 0) {
      <div class="report-empty">
        <i class="pi pi-code" style="font-size:2rem;color:#0ea5e9;margin-bottom:.75rem;"></i>
        <p>Definí los flujos críticos, testeá con usuarios reales y presioná <strong>Generar análisis</strong> para obtener el reporte.</p>
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
            <h4 class="report-section__title">Validación técnica</h4>
            <p class="report-section__text">{{ v.report.validacionTecnica }}</p>
          </div>

          <div class="report-section">
            <h4 class="report-section__title">Estado de los flujos</h4>
            <div class="report-estado">
              <i class="pi pi-check-circle" style="color:#0ea5e9;flex-shrink:0;margin-top:.15rem;"></i>
              <p>{{ v.report.estadoFlujos }}</p>
            </div>
          </div>

          <div class="report-row">
            <div class="report-section report-section--half">
              <h4 class="report-section__title">Hallazgos críticos (funcionales)</h4>
              <ul class="report-list">
                @for (h of v.report.hallazgosCriticos; track h) {
                  <li class="report-list__item report-list__item--red">{{ h }}</li>
                }
              </ul>
            </div>
            <div class="report-section report-section--half">
              <h4 class="report-section__title">Hallazgos UX</h4>
              <ul class="report-list">
                @for (h of v.report.hallazgosUX; track h) {
                  <li class="report-list__item report-list__item--violet">{{ h }}</li>
                }
              </ul>
            </div>
          </div>

          <div class="report-section">
            <h4 class="report-section__title">Nivel de confianza para avanzar</h4>
            <div class="report-confianza">
              <i class="pi pi-gauge" style="color:#0ea5e9;"></i>
              <p>{{ v.report.nivelConfianza }}</p>
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
      background: #0ea5e9;
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
    .report-section--summary { background: #e0f2fe; border-left: 4px solid #0ea5e9; }
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
    .report-estado {
      display: flex;
      align-items: flex-start;
      gap: .75rem;
    }
    .report-estado p { margin: 0; color: #374151; line-height: 1.6; font-size: .875rem; }
    .report-confianza {
      display: flex;
      align-items: flex-start;
      gap: .75rem;
    }
    .report-confianza p { margin: 0; color: #374151; line-height: 1.6; font-size: .875rem; }
    .report-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: .5rem; }
    .report-list__item {
      padding: .5rem .75rem;
      border-radius: .5rem;
      font-size: .875rem;
      color: #374151;
      border-left: 3px solid transparent;
    }
    .report-list__item--red { background: #fef2f2; border-left-color: #ef4444; }
    .report-list__item--violet { background: #f5f3ff; border-left-color: #8b5cf6; }
    .report-ordered-list { padding-left: 1.25rem; margin: 0; display: flex; flex-direction: column; gap: .5rem; }
    .report-ordered-list li { font-size: .875rem; color: #374151; line-height: 1.6; }
  `],
})
export class PrototipoFuncionalReportComponent {
  versions = input<PrototipoFuncionalReportVersionDto[]>([]);
}
