import { Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ClienteMisteriosoReportVersionDto, IMPACTO_COLORS } from './cliente-misterioso.types';

@Component({
  selector: 'app-cliente-misterioso-report',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (reports().length === 0) {
      <div class="cmr__empty">
        <i class="pi pi-sparkles"></i>
        <p>Aún no hay informes generados. Documentá al menos una visita con pasos o issues y hacé clic en "Analizar".</p>
      </div>
    } @else {

      @if (reports().length > 1) {
        <div class="cmr__version-bar">
          @for (r of reports(); track r.version; let idx = $index) {
            <button
              class="cmr__version-btn"
              [class.cmr__version-btn--active]="selectedIndex() === idx"
              (click)="selectedIndex.set(idx)"
            >
              v{{ r.version }} — {{ r.generatedAt | date:'dd/MM HH:mm' }}
            </button>
          }
        </div>
      }

      @if (current()) {
        <div class="cmr__report">

          <!-- Executive summary -->
          <div class="cmr__summary">
            <i class="pi pi-align-left cmr__summary-icon"></i>
            <p class="cmr__summary-text">{{ current()!.report.executiveSummary }}</p>
          </div>

          <!-- Score análisis -->
          @if (current()!.report.scorePromedioAnalisis) {
            <div class="cmr__score-block">
              <span class="cmr__score-label">Evaluación general</span>
              <span class="cmr__score-value">{{ current()!.report.scorePromedioAnalisis }}</span>
            </div>
          }

          <!-- Issues priorizados -->
          @if (current()!.report.issuesPriorizados.length) {
            <div class="cmr__block">
              <h4 class="cmr__block-title">
                <i class="pi pi-exclamation-triangle"></i>
                Issues Priorizados
              </h4>
              <div class="cmr__issues-list">
                @for (issue of current()!.report.issuesPriorizados; track $index) {
                  <div class="cmr__issue-card">
                    <div class="cmr__issue-meta">
                      <span class="cmr__issue-prioridad" [class]="'cmr__issue-prioridad--' + getPrioridadClass(issue.prioridad)">
                        {{ issue.prioridad }}
                      </span>
                      <span class="cmr__issue-canal">{{ issue.canal }}</span>
                    </div>
                    <p class="cmr__issue-desc">{{ issue.issue }}</p>
                    <p class="cmr__issue-impacto">
                      <i class="pi pi-arrow-right"></i>
                      {{ issue.impacto }}
                    </p>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Patrones de experiencia -->
          @if (current()!.report.patronesDeExperiencia.length) {
            <div class="cmr__block">
              <h4 class="cmr__block-title">
                <i class="pi pi-objects-column"></i>
                Patrones de Experiencia
              </h4>
              <ul class="cmr__list">
                @for (p of current()!.report.patronesDeExperiencia; track $index) {
                  <li class="cmr__list-item cmr__list-item--pattern">{{ p }}</li>
                }
              </ul>
            </div>
          }

          <!-- Fortalezas detectadas -->
          @if (current()!.report.fortalezasDetectadas.length) {
            <div class="cmr__block cmr__block--success">
              <h4 class="cmr__block-title">
                <i class="pi pi-check-circle"></i>
                Fortalezas Detectadas
              </h4>
              <ul class="cmr__list">
                @for (f of current()!.report.fortalezasDetectadas; track $index) {
                  <li class="cmr__list-item cmr__list-item--success">{{ f }}</li>
                }
              </ul>
            </div>
          }

          <!-- Fricciones críticas -->
          @if (current()!.report.friccionesCriticas.length) {
            <div class="cmr__block cmr__block--danger">
              <h4 class="cmr__block-title">
                <i class="pi pi-times-circle"></i>
                Fricciones Críticas
              </h4>
              <ul class="cmr__list">
                @for (f of current()!.report.friccionesCriticas; track $index) {
                  <li class="cmr__list-item cmr__list-item--danger">{{ f }}</li>
                }
              </ul>
            </div>
          }

          <!-- Oportunidades -->
          @if (current()!.report.oportunidades.length) {
            <div class="cmr__block">
              <h4 class="cmr__block-title">
                <i class="pi pi-arrow-up-right"></i>
                Oportunidades
              </h4>
              <ul class="cmr__list">
                @for (o of current()!.report.oportunidades; track $index) {
                  <li class="cmr__list-item cmr__list-item--opportunity">{{ o }}</li>
                }
              </ul>
            </div>
          }

          <!-- Recomendaciones -->
          @if (current()!.report.recommendations.length) {
            <div class="cmr__block cmr__block--recommendations">
              <h4 class="cmr__block-title">
                <i class="pi pi-list-check"></i>
                Recomendaciones
              </h4>
              <ol class="cmr__list cmr__list--ordered">
                @for (r of current()!.report.recommendations; track $index) {
                  <li class="cmr__list-item">{{ r }}</li>
                }
              </ol>
            </div>
          }

        </div>
      }
    }
  `,
  styles: [`
    .cmr__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 48px 24px;
      color: var(--p-surface-400);
      text-align: center;
    }

    .cmr__empty i {
      font-size: 36px;
      opacity: 0.4;
    }

    .cmr__empty p {
      font-size: 13px;
      max-width: 320px;
      line-height: 1.5;
    }

    .cmr__version-bar {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }

    .cmr__version-btn {
      padding: 5px 12px;
      border-radius: 6px;
      border: 1px solid var(--p-surface-300);
      background: white;
      font-size: 12px;
      color: var(--p-surface-600);
      cursor: pointer;
      transition: all 0.15s;
    }

    .cmr__version-btn--active {
      background: var(--p-violet-50);
      border-color: var(--p-violet-300);
      color: var(--p-violet-700);
      font-weight: 600;
    }

    .cmr__report {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .cmr__summary {
      display: flex;
      gap: 12px;
      padding: 14px 16px;
      background: var(--p-violet-50);
      border: 1px solid var(--p-violet-100);
      border-radius: 10px;
      align-items: flex-start;
    }

    .cmr__summary-icon {
      color: var(--p-violet-500);
      font-size: 15px;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .cmr__summary-text {
      font-size: 13px;
      line-height: 1.6;
      color: var(--p-surface-700);
      margin: 0;
    }

    .cmr__score-block {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      background: var(--p-surface-50);
      border: 1px solid var(--p-surface-200);
      border-radius: 8px;
    }

    .cmr__score-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--p-surface-500);
    }

    .cmr__score-value {
      font-size: 14px;
      font-weight: 700;
      color: var(--p-surface-800);
    }

    .cmr__block {
      background: var(--p-surface-50);
      border: 1px solid var(--p-surface-200);
      border-radius: 10px;
      padding: 14px 16px;
    }

    .cmr__block--success {
      background: var(--p-green-50);
      border-color: var(--p-green-100);
    }

    .cmr__block--danger {
      background: var(--p-red-50);
      border-color: var(--p-red-100);
    }

    .cmr__block--recommendations {
      background: var(--p-blue-50);
      border-color: var(--p-blue-100);
    }

    .cmr__block-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 700;
      color: var(--p-surface-700);
      margin: 0 0 12px 0;
    }

    .cmr__issues-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .cmr__issue-card {
      background: white;
      border: 1px solid var(--p-surface-200);
      border-radius: 8px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .cmr__issue-meta {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .cmr__issue-prioridad {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 10px;
      letter-spacing: 0.5px;
    }

    .cmr__issue-prioridad--p1 {
      background: var(--p-red-100);
      color: var(--p-red-700);
    }

    .cmr__issue-prioridad--p2 {
      background: var(--p-orange-100);
      color: var(--p-orange-700);
    }

    .cmr__issue-prioridad--p3 {
      background: var(--p-yellow-100);
      color: var(--p-yellow-700);
    }

    .cmr__issue-canal {
      font-size: 11px;
      color: var(--p-surface-500);
      background: var(--p-surface-100);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .cmr__issue-desc {
      font-size: 13px;
      color: var(--p-surface-700);
      line-height: 1.4;
      margin: 0;
      font-weight: 500;
    }

    .cmr__issue-impacto {
      font-size: 12px;
      color: var(--p-surface-500);
      line-height: 1.4;
      margin: 0;
      display: flex;
      gap: 5px;
      align-items: flex-start;
    }

    .cmr__list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 0;
      margin: 0;
      list-style: none;
    }

    .cmr__list--ordered {
      counter-reset: item;
    }

    .cmr__list-item {
      font-size: 13px;
      color: var(--p-surface-700);
      line-height: 1.5;
      padding: 6px 10px;
      border-radius: 6px;
      background: white;
      border: 1px solid var(--p-surface-200);
    }

    .cmr__list--ordered .cmr__list-item {
      counter-increment: item;
      padding-left: 32px;
      position: relative;
    }

    .cmr__list--ordered .cmr__list-item::before {
      content: counter(item);
      position: absolute;
      left: 10px;
      top: 6px;
      font-size: 11px;
      font-weight: 700;
      color: var(--p-blue-500);
      background: var(--p-blue-50);
      width: 16px;
      height: 16px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cmr__list-item--pattern {
      border-left: 3px solid var(--p-violet-400);
    }

    .cmr__list-item--success {
      border-left: 3px solid var(--p-green-400);
    }

    .cmr__list-item--danger {
      border-left: 3px solid var(--p-red-400);
    }

    .cmr__list-item--opportunity {
      border-left: 3px solid var(--p-sky-400);
    }
  `],
})
export class ClienteMisteriosoReportComponent {
  reports = input<ClienteMisteriosoReportVersionDto[]>([]);
  selectedIndex = signal(0);
  current = computed(() => this.reports()[this.selectedIndex()] ?? null);

  getImpactoColor = (impacto: string): string =>
    IMPACTO_COLORS[impacto as keyof typeof IMPACTO_COLORS] ?? '#6b7280';

  getPrioridadClass(prioridad: string): string {
    return prioridad.replace('#', 'p');
  }
}
