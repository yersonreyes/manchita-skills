import { Component, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import {
  CjmEtapaAnalisis,
  CustomerJourneyMapReportVersionDto,
} from './customer-journey-map.types';

@Component({
  selector: 'app-customer-journey-map-report',
  standalone: true,
  imports: [FormsModule, Select],
  template: `
    @if (reports().length === 0) {
      <div class="cjmr-empty">
        <div class="cjmr-empty__icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="23" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
            <path d="M14 24h20M24 14v20" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
          </svg>
        </div>
        <h4 class="cjmr-empty__title">Sin informes generados</h4>
        <p class="cjmr-empty__desc">Completá al menos 2 etapas del journey y presioná "Analizar" para obtener el análisis de la experiencia.</p>
      </div>
    } @else {
      <div class="cjmr-container">

        <!-- Version selector -->
        <div class="cjmr-versions">
          <div class="cjmr-versions__selector">
            <span class="cjmr-versions__label">Versión</span>
            <p-select
              [options]="versionOptions()"
              [ngModel]="selectedVersion()"
              (ngModelChange)="selectedVersion.set($event)"
              optionLabel="label"
              optionValue="value"
              placeholder="Más reciente"
              styleClass="cjmr-select"
            />
          </div>
          <span class="cjmr-versions__count">{{ reports().length }} análisis</span>
        </div>

        @if (current(); as rv) {
          <div class="cjmr-content">

            <!-- Executive summary -->
            <div class="cjmr-hero">
              <div class="cjmr-hero__eyebrow">
                <i class="pi pi-map"></i>
                Customer Journey Map — Análisis
              </div>
              <p class="cjmr-hero__summary">{{ rv.report.executiveSummary }}</p>
              <span class="cjmr-hero__date">{{ formatDate(rv.generatedAt) }}</span>
            </div>

            <!-- Momentos de la verdad -->
            @if (rv.report.momentosDeLaVerdad.length) {
              <div class="cjmr-section">
                <div class="cjmr-section__header cjmr-section__header--blue">
                  <span class="cjmr-section__icon">⚡</span>
                  <span class="cjmr-section__title">Momentos de la Verdad</span>
                </div>
                <ul class="cjmr-section__list">
                  @for (m of rv.report.momentosDeLaVerdad; track $index) {
                    <li>{{ m }}</li>
                  }
                </ul>
              </div>
            }

            <!-- Etapas análisis -->
            @if (rv.report.etapasAnalisis.length) {
              <div class="cjmr-etapas">
                <div class="cjmr-etapas__header">
                  <span class="cjmr-etapas__eyebrow">Análisis por Etapa</span>
                </div>
                <div class="cjmr-etapas__grid">
                  @for (ea of rv.report.etapasAnalisis; track $index) {
                    <div class="cjmr-etapa-card" [class]="'cjmr-etapa-card--' + ea.nivelFriccion">
                      <div class="cjmr-etapa-card__header">
                        <span class="cjmr-etapa-card__name">{{ ea.etapa }}</span>
                        <span class="cjmr-etapa-card__badge cjmr-etapa-card__badge--{{ ea.nivelFriccion }}">
                          {{ frictionLabel(ea.nivelFriccion) }}
                        </span>
                      </div>
                      <div class="cjmr-etapa-card__emocion">
                        <i class="pi pi-heart"></i> {{ ea.emocionPredominante }}
                      </div>
                      <p class="cjmr-etapa-card__insight">{{ ea.insight }}</p>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Pain Points & Oportunidades -->
            <div class="cjmr-highlights">
              @if (rv.report.painPointsCriticos.length) {
                <div class="cjmr-card cjmr-card--pain">
                  <div class="cjmr-card__header">
                    <span class="cjmr-card__icon cjmr-card__icon--pain">!</span>
                    <span class="cjmr-card__title">Pain Points Críticos</span>
                  </div>
                  <ul class="cjmr-card__list">
                    @for (p of rv.report.painPointsCriticos; track $index) {
                      <li>{{ p }}</li>
                    }
                  </ul>
                </div>
              }
              @if (rv.report.oportunidadesPriorizadas.length) {
                <div class="cjmr-card cjmr-card--opp">
                  <div class="cjmr-card__header">
                    <span class="cjmr-card__icon cjmr-card__icon--opp">↑</span>
                    <span class="cjmr-card__title">Oportunidades Priorizadas</span>
                  </div>
                  <ul class="cjmr-card__list">
                    @for (o of rv.report.oportunidadesPriorizadas; track $index) {
                      <li>{{ o }}</li>
                    }
                  </ul>
                </div>
              }
            </div>

            <!-- Recommendations -->
            @if (rv.report.recommendations.length) {
              <div class="cjmr-recs">
                <div class="cjmr-recs__header">
                  <span class="cjmr-recs__eyebrow">Recomendaciones</span>
                </div>
                <ol class="cjmr-recs__list">
                  @for (r of rv.report.recommendations; track $index) {
                    <li>{{ r }}</li>
                  }
                </ol>
              </div>
            }

          </div>
        }

      </div>
    }
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100%; }

    .cjmr-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 12px; padding: 48px 32px; text-align: center; color: var(--p-text-muted-color); }
    .cjmr-empty__icon { margin-bottom: 4px; }
    .cjmr-empty__title { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: var(--p-text-secondary-color); margin: 0; }
    .cjmr-empty__desc { font-size: 0.82rem; line-height: 1.6; margin: 0; max-width: 340px; color: var(--p-text-muted-color); }

    .cjmr-container { display: flex; flex-direction: column; gap: 16px; height: 100%; }

    .cjmr-versions { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-shrink: 0; }
    .cjmr-versions__selector { display: flex; align-items: center; gap: 8px; flex: 1; }
    .cjmr-versions__label { font-size: 0.75rem; font-weight: 600; color: var(--p-text-muted-color); white-space: nowrap; }
    .cjmr-versions__count { font-size: 0.72rem; color: var(--p-text-muted-color); white-space: nowrap; }
    ::ng-deep .cjmr-select { width: 100%; }

    .cjmr-content { display: flex; flex-direction: column; gap: 20px; overflow-y: auto; flex: 1; padding-right: 2px; }

    /* Hero */
    .cjmr-hero {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border: 1px solid #bfdbfe;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .cjmr-hero__eyebrow { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #1d4ed8; display: flex; align-items: center; gap: 5px; }
    .cjmr-hero__eyebrow .pi { font-size: 0.72rem; }
    .cjmr-hero__summary { font-size: 0.82rem; line-height: 1.6; color: #1e40af; margin: 0; }
    .cjmr-hero__date { font-size: 0.68rem; color: #60a5fa; margin-top: 2px; }

    /* Sections */
    .cjmr-section { border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
    .cjmr-section--blue { background: #eff6ff; border: 1px solid #bfdbfe; }

    .cjmr-section__header { display: flex; align-items: center; gap: 8px; }
    .cjmr-section__header--blue .cjmr-section__title { color: #1d4ed8; }
    .cjmr-section__icon { width: 24px; height: 24px; border-radius: 6px; background: #bfdbfe; color: #1d4ed8; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0; }
    .cjmr-section__title { font-size: 0.75rem; font-weight: 700; font-family: 'Syne', sans-serif; }

    .cjmr-section__list { margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 5px; }
    .cjmr-section__list li { font-size: 0.8rem; line-height: 1.5; color: var(--p-text-secondary-color); }

    /* Etapas analysis */
    .cjmr-etapas { display: flex; flex-direction: column; gap: 10px; }
    .cjmr-etapas__header { display: flex; align-items: center; gap: 10px; }
    .cjmr-etapas__header::after { content: ''; flex: 1; height: 1px; background: var(--p-surface-200); }
    .cjmr-etapas__eyebrow { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--p-text-muted-color); white-space: nowrap; }
    .cjmr-etapas__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px; }

    .cjmr-etapa-card { border-radius: 10px; padding: 12px; border: 1px solid var(--p-surface-200); background: var(--p-surface-0); display: flex; flex-direction: column; gap: 6px; }
    .cjmr-etapa-card__header { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
    .cjmr-etapa-card__name { font-size: 0.78rem; font-weight: 700; font-family: 'Syne', sans-serif; color: var(--p-text-color); }
    .cjmr-etapa-card__badge { font-size: 0.6rem; font-weight: 700; padding: 2px 6px; border-radius: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
    .cjmr-etapa-card__badge--bajo { background: #dcfce7; color: #15803d; }
    .cjmr-etapa-card__badge--medio { background: #fef9c3; color: #854d0e; }
    .cjmr-etapa-card__badge--alto { background: #fee2e2; color: #b91c1c; }
    .cjmr-etapa-card__emocion { font-size: 0.72rem; color: var(--p-text-muted-color); display: flex; align-items: center; gap: 4px; }
    .cjmr-etapa-card__emocion .pi { font-size: 0.65rem; color: #f43f5e; }
    .cjmr-etapa-card__insight { font-size: 0.75rem; line-height: 1.5; color: var(--p-text-secondary-color); margin: 0; }

    /* Highlights */
    .cjmr-highlights { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .cjmr-card { border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
    .cjmr-card--pain { background: #fff7ed; border: 1px solid #fed7aa; }
    .cjmr-card--opp { background: #f0fdf4; border: 1px solid #bbf7d0; }
    .cjmr-card__header { display: flex; align-items: center; gap: 8px; }
    .cjmr-card__icon { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0; }
    .cjmr-card__icon--pain { background: #fed7aa; color: #c2410c; }
    .cjmr-card__icon--opp { background: #bbf7d0; color: #15803d; }
    .cjmr-card__title { font-size: 0.75rem; font-weight: 700; font-family: 'Syne', sans-serif; color: var(--p-text-color); }
    .cjmr-card__list { margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 4px; }
    .cjmr-card__list li { font-size: 0.78rem; line-height: 1.5; color: var(--p-text-secondary-color); }

    /* Recommendations */
    .cjmr-recs { display: flex; flex-direction: column; gap: 10px; }
    .cjmr-recs__header { display: flex; align-items: center; gap: 10px; }
    .cjmr-recs__header::after { content: ''; flex: 1; height: 1px; background: var(--p-surface-200); }
    .cjmr-recs__eyebrow { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--p-text-muted-color); white-space: nowrap; }
    .cjmr-recs__list { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 6px; }
    .cjmr-recs__list li { font-size: 0.82rem; line-height: 1.5; color: var(--p-text-secondary-color); }
  `],
})
export class CustomerJourneyMapReportComponent {
  reports = input.required<CustomerJourneyMapReportVersionDto[]>();

  selectedVersion = signal<number | null>(null);

  versionOptions = computed(() =>
    this.reports().map(r => ({
      label: `v${r.version} — ${new Date(r.generatedAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}`,
      value: r.version,
    }))
  );

  current = computed<CustomerJourneyMapReportVersionDto | null>(() => {
    const list = this.reports();
    const version = this.selectedVersion();
    if (!list.length) return null;
    if (version === null) return list[0];
    return list.find(r => r.version === version) ?? list[0];
  });

  frictionLabel(level: CjmEtapaAnalisis['nivelFriccion']): string {
    const map = { bajo: 'Baja', medio: 'Media', alto: 'Alta' };
    return map[level] ?? level;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'short' });
  }
}
