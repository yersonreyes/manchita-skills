import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FriccionEmocionalDto, PrototipoEmpatizarReportVersionDto, SupuestoContrastadoDto } from './prototipo-empatizar.types';

@Component({
  selector: 'app-prototipo-empatizar-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (versions().length === 0) {
      <div class="report-empty">
        <i class="pi pi-heart" style="font-size:2rem;color:#0d9488;margin-bottom:.75rem;"></i>
        <p>Completá la sesión y presioná <strong>Generar análisis</strong> para obtener un reporte de empatía.</p>
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
            <h4 class="report-section__title">Nivel de empatía alcanzado</h4>
            <div class="report-empathy-level">
              <i class="pi pi-heart-fill" style="color:#0d9488;"></i>
              <p>{{ v.report.nivelEmpatiaAlcanzado }}</p>
            </div>
          </div>

          <div class="report-section">
            <h4 class="report-section__title">Insights clave de empatía</h4>
            <ul class="report-list">
              @for (insight of v.report.insightsClaves; track insight) {
                <li class="report-list__item report-list__item--teal">{{ insight }}</li>
              }
            </ul>
          </div>

          <div class="report-section">
            <h4 class="report-section__title">Fricciones emocionales</h4>
            <div class="report-frictions">
              @for (f of v.report.friccionesEmocionales; track f.momento) {
                <div class="report-friction" [class]="'report-friction--' + f.intensidad">
                  <div class="report-friction__header">
                    <span class="report-friction__moment">{{ f.momento }}</span>
                    <span class="report-friction__badge">{{ f.intensidad }}</span>
                  </div>
                  <p class="report-friction__emotion">{{ f.emocion }}</p>
                </div>
              }
            </div>
          </div>

          <div class="report-section">
            <h4 class="report-section__title">Supuestos contrastados</h4>
            <div class="report-assumptions">
              @for (s of v.report.supuestosContrastados; track s.supuesto) {
                <div class="report-assumption" [class]="'report-assumption--' + s.resultado">
                  <div class="report-assumption__header">
                    <span class="report-assumption__label">{{ s.supuesto }}</span>
                    <span class="report-assumption__status">{{ resultadoLabel(s.resultado) }}</span>
                  </div>
                  <p class="report-assumption__evidence">{{ s.evidencia }}</p>
                </div>
              }
            </div>
          </div>

          <div class="report-section">
            <h4 class="report-section__title">Implicaciones para el diseño</h4>
            <ul class="report-list">
              @for (imp of v.report.implicacionesDiseno; track imp) {
                <li class="report-list__item report-list__item--accent">{{ imp }}</li>
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
    .report-version__header {
      display: flex;
      align-items: center;
      gap: .75rem;
    }
    .report-version__badge {
      background: #0d9488;
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
    }
    .report-section--summary { background: #f0fdfa; border-left: 4px solid #0d9488; }
    .report-section__title {
      font-size: .85rem;
      font-weight: 700;
      color: #374151;
      margin: 0 0 .75rem;
      text-transform: uppercase;
      letter-spacing: .05em;
    }
    .report-empathy-level {
      display: flex;
      align-items: flex-start;
      gap: .75rem;
    }
    .report-empathy-level i { margin-top: .15rem; flex-shrink: 0; }
    .report-empathy-level p { margin: 0; color: #374151; line-height: 1.6; }
    .report-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: .5rem; }
    .report-list__item {
      padding: .5rem .75rem;
      border-radius: .5rem;
      font-size: .875rem;
      color: #374151;
      border-left: 3px solid transparent;
    }
    .report-list__item--teal { background: #f0fdfa; border-left-color: #0d9488; }
    .report-list__item--accent { background: #f0fdf4; border-left-color: #16a34a; }
    .report-frictions { display: flex; flex-direction: column; gap: .625rem; }
    .report-friction {
      padding: .75rem 1rem;
      border-radius: .5rem;
      border-left: 4px solid transparent;
    }
    .report-friction--alta { background: #fef2f2; border-left-color: #ef4444; }
    .report-friction--media { background: #fff7ed; border-left-color: #f97316; }
    .report-friction--baja { background: #fefce8; border-left-color: #eab308; }
    .report-friction__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: .375rem; }
    .report-friction__moment { font-size: .875rem; font-weight: 600; color: #374151; }
    .report-friction__badge {
      font-size: .7rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: .15rem .5rem;
      border-radius: 9999px;
      background: rgba(0,0,0,.08);
      color: #374151;
    }
    .report-friction__emotion { margin: 0; font-size: .875rem; color: #6b7280; }
    .report-assumptions { display: flex; flex-direction: column; gap: .625rem; }
    .report-assumption {
      padding: .75rem 1rem;
      border-radius: .5rem;
      border-left: 4px solid transparent;
    }
    .report-assumption--validado { background: #f0fdf4; border-left-color: #16a34a; }
    .report-assumption--refutado { background: #fef2f2; border-left-color: #ef4444; }
    .report-assumption--parcial { background: #fff7ed; border-left-color: #f97316; }
    .report-assumption__header { display: flex; justify-content: space-between; align-items: flex-start; gap: .5rem; margin-bottom: .375rem; }
    .report-assumption__label { font-size: .875rem; font-weight: 600; color: #374151; }
    .report-assumption__status {
      font-size: .7rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: .15rem .5rem;
      border-radius: 9999px;
      background: rgba(0,0,0,.08);
      color: #374151;
      white-space: nowrap;
    }
    .report-assumption__evidence { margin: 0; font-size: .875rem; color: #6b7280; }
    .report-ordered-list { padding-left: 1.25rem; margin: 0; display: flex; flex-direction: column; gap: .5rem; }
    .report-ordered-list li { font-size: .875rem; color: #374151; line-height: 1.6; }
  `],
})
export class PrototipoEmpatizarReportComponent {
  versions = input<PrototipoEmpatizarReportVersionDto[]>([]);

  resultadoLabel(resultado: SupuestoContrastadoDto['resultado']): string {
    const map = { validado: 'Validado', refutado: 'Refutado', parcial: 'Parcial' };
    return map[resultado] ?? resultado;
  }
}
