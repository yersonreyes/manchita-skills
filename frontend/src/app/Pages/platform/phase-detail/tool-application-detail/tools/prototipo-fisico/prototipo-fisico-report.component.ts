import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PrototipoFisicoReportVersionDto } from './prototipo-fisico.types';

@Component({
  selector: 'app-prototipo-fisico-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (versions().length === 0) {
      <div class="report-empty">
        <i class="pi pi-box" style="font-size:2rem;color:#b45309;margin-bottom:.75rem;"></i>
        <p>Documentá las iteraciones físicas y presioná <strong>Generar análisis</strong>.</p>
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
            <h4 class="report-section__title">Evaluación de la progresión</h4>
            <p class="report-section__text">{{ v.report.evaluacionProgresion }}</p>
          </div>

          <div class="report-row">
            <div class="report-section report-section--half">
              <h4 class="report-section__title">Hallazgos ergonómicos</h4>
              <ul class="report-list">
                @for (h of v.report.hallazgosErgonomicos; track h) {
                  <li class="report-list__item report-list__item--amber">{{ h }}</li>
                }
              </ul>
            </div>
            <div class="report-section report-section--half">
              <h4 class="report-section__title">Mejoras validadas</h4>
              <ul class="report-list">
                @for (m of v.report.mejorasValidadas; track m) {
                  <li class="report-list__item report-list__item--green">{{ m }}</li>
                }
              </ul>
            </div>
          </div>

          <div class="report-section">
            <h4 class="report-section__title">Problemas detectados</h4>
            <ul class="report-list">
              @for (p of v.report.problemasDetectados; track p) {
                <li class="report-list__item report-list__item--red">{{ p }}</li>
              }
            </ul>
          </div>

          @if (v.report.riesgosParaProduccion.length) {
            <div class="report-section">
              <h4 class="report-section__title">Riesgos para producción</h4>
              <ul class="report-list">
                @for (r of v.report.riesgosParaProduccion; track r) {
                  <li class="report-list__item report-list__item--orange">{{ r }}</li>
                }
              </ul>
            </div>
          }

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
      background: #b45309;
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
    .report-section--summary { background: #fef3c7; border-left: 4px solid #b45309; }
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
    .report-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: .5rem; }
    .report-list__item {
      padding: .5rem .75rem;
      border-radius: .5rem;
      font-size: .875rem;
      color: #374151;
      border-left: 3px solid transparent;
    }
    .report-list__item--amber { background: #fef3c7; border-left-color: #b45309; }
    .report-list__item--green { background: #f0fdf4; border-left-color: #16a34a; }
    .report-list__item--red { background: #fef2f2; border-left-color: #ef4444; }
    .report-list__item--orange { background: #fff7ed; border-left-color: #ea580c; }
    .report-ordered-list { padding-left: 1.25rem; margin: 0; display: flex; flex-direction: column; gap: .5rem; }
    .report-ordered-list li { font-size: .875rem; color: #374151; line-height: 1.6; }
  `],
})
export class PrototipoFisicoReportComponent {
  versions = input<PrototipoFisicoReportVersionDto[]>([]);
}
