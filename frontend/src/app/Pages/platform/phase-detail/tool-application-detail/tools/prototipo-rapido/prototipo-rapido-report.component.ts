import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PrototipoRapidoReportVersionDto } from './prototipo-rapido.types';

@Component({
  selector: 'app-prototipo-rapido-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (versions().length === 0) {
      <div class="report-empty">
        <i class="pi pi-bolt" style="font-size:2rem;color:#ea580c;margin-bottom:.75rem;"></i>
        <p>Documentá el prototipo y el testing, luego presioná <strong>Generar análisis</strong>.</p>
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

          <div class="report-row">
            <div class="report-section report-section--half">
              <h4 class="report-section__title">Validez de la hipótesis</h4>
              <p class="report-section__text">{{ v.report.validezDeLaHipotesis }}</p>
            </div>
            <div class="report-section report-section--half report-section--tasa">
              <h4 class="report-section__title">Tasa de éxito</h4>
              <p class="report-tasa">{{ v.report.tasaExitoCalculada }}</p>
            </div>
          </div>

          <div class="report-section">
            <h4 class="report-section__title">Patrones en el feedback</h4>
            <ul class="report-list">
              @for (p of v.report.patronesEnElFeedback; track p) {
                <li class="report-list__item report-list__item--orange">{{ p }}</li>
              }
            </ul>
          </div>

          <div class="report-row">
            <div class="report-section report-section--half">
              <h4 class="report-section__title">Hipótesis confirmadas</h4>
              <ul class="report-list">
                @for (h of v.report.hipotesisConfirmadas; track h) {
                  <li class="report-list__item report-list__item--green">{{ h }}</li>
                }
              </ul>
            </div>
            <div class="report-section report-section--half">
              <h4 class="report-section__title">Hipótesis refutadas</h4>
              <ul class="report-list">
                @for (h of v.report.hipotesisRefutadas; track h) {
                  <li class="report-list__item report-list__item--red">{{ h }}</li>
                }
              </ul>
            </div>
          </div>

          @if (v.report.riesgosRestantes.length) {
            <div class="report-section">
              <h4 class="report-section__title">Riesgos restantes</h4>
              <ul class="report-list">
                @for (r of v.report.riesgosRestantes; track r) {
                  <li class="report-list__item report-list__item--amber">{{ r }}</li>
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
      background: #ea580c;
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
    .report-section--summary { background: #fff7ed; border-left: 4px solid #ea580c; }
    .report-section--half { flex: 1; }
    .report-section--tasa { align-items: center; justify-content: center; }
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
    .report-tasa {
      font-size: 1.5rem;
      font-weight: 800;
      color: #ea580c;
      margin: 0;
      text-align: center;
    }
    .report-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: .5rem; }
    .report-list__item {
      padding: .5rem .75rem;
      border-radius: .5rem;
      font-size: .875rem;
      color: #374151;
      border-left: 3px solid transparent;
    }
    .report-list__item--orange { background: #fff7ed; border-left-color: #ea580c; }
    .report-list__item--green { background: #f0fdf4; border-left-color: #16a34a; }
    .report-list__item--red { background: #fef2f2; border-left-color: #ef4444; }
    .report-list__item--amber { background: #fffbeb; border-left-color: #d97706; }
    .report-ordered-list { padding-left: 1.25rem; margin: 0; display: flex; flex-direction: column; gap: .5rem; }
    .report-ordered-list li { font-size: .875rem; color: #374151; line-height: 1.6; }
  `],
})
export class PrototipoRapidoReportComponent {
  versions = input<PrototipoRapidoReportVersionDto[]>([]);
}
