import { Component, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { FodaReportVersionDto, FODA_QUADRANTS, FodaQuadrantConfig } from './foda.types';

@Component({
  selector: 'app-foda-report',
  standalone: true,
  imports: [FormsModule, Select],
  template: `
    @if (reports().length === 0) {
      <div class="rep-empty">
        <div class="rep-empty__icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="23" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
            <path d="M16 24h16M24 16v16" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
          </svg>
        </div>
        <h4 class="rep-empty__title">Sin informes generados</h4>
        <p class="rep-empty__desc">Completá al menos 2 cuadrantes del FODA y presioná "Analizar" para obtener un análisis estratégico.</p>
      </div>
    } @else {
      <div class="rep-container">

        <!-- Version selector -->
        <div class="rep-versions">
          <div class="rep-versions__selector">
            <span class="rep-versions__label">Versión</span>
            <p-select
              [options]="versionOptions()"
              [ngModel]="selectedVersion()"
              (ngModelChange)="selectedVersion.set($event)"
              optionLabel="label"
              optionValue="value"
              placeholder="Más reciente"
              styleClass="rep-select"
            />
          </div>
          <span class="rep-versions__count">{{ reports().length }} análisis</span>
        </div>

        @if (currentReport(); as rv) {
          <div class="rep-content">

            <!-- Score hero -->
            <div class="rep-hero">
              <div class="rep-score">
                <svg class="rep-score__ring" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="var(--p-surface-200)" stroke-width="6"/>
                  <circle
                    cx="40" cy="40" r="34" fill="none"
                    [attr.stroke]="scoreColor(rv.report.strategicScore)"
                    stroke-width="6"
                    stroke-linecap="round"
                    [attr.stroke-dasharray]="213.6"
                    [attr.stroke-dashoffset]="213.6 * (1 - rv.report.strategicScore / 10)"
                    transform="rotate(-90 40 40)"
                    style="transition: stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)"
                  />
                </svg>
                <div class="rep-score__inner">
                  <span class="rep-score__num">{{ rv.report.strategicScore }}</span>
                  <span class="rep-score__den">/10</span>
                </div>
              </div>
              <div class="rep-hero__text">
                <div class="rep-hero__eyebrow">Balance Estratégico</div>
                <p class="rep-hero__summary">{{ rv.report.executiveSummary }}</p>
                <span class="rep-hero__date">{{ formatDate(rv.generatedAt) }}</span>
              </div>
            </div>

            <!-- Key opportunities & critical threats -->
            <div class="rep-highlights">
              @if (rv.report.keyOpportunities.length) {
                <div class="rep-card rep-card--opp">
                  <div class="rep-card__header">
                    <span class="rep-card__icon rep-card__icon--opp">↑</span>
                    <span class="rep-card__title">Oportunidades Clave</span>
                  </div>
                  <ul class="rep-card__list">
                    @for (o of rv.report.keyOpportunities; track $index) {
                      <li>{{ o }}</li>
                    }
                  </ul>
                </div>
              }
              @if (rv.report.criticalThreats.length) {
                <div class="rep-card rep-card--threat">
                  <div class="rep-card__header">
                    <span class="rep-card__icon rep-card__icon--threat">⚠</span>
                    <span class="rep-card__title">Amenazas Críticas</span>
                  </div>
                  <ul class="rep-card__list">
                    @for (t of rv.report.criticalThreats; track $index) {
                      <li>{{ t }}</li>
                    }
                  </ul>
                </div>
              }
            </div>

            <!-- Quadrant analysis -->
            <div class="rep-quadrants">
              <div class="rep-quadrants__header">
                <span class="rep-quadrants__eyebrow">Análisis por Cuadrante</span>
              </div>
              <div class="rep-quadrants__grid">
                @for (q of quadrantConfigs; track q.key) {
                  <div class="rep-quadrant" [style.border-color]="q.borderColor">
                    <div class="rep-quadrant__name" [style.color]="q.textColor">
                      <i class="pi {{ q.icon }}"></i>
                      {{ q.label }}
                    </div>
                    @if (q.key === 'fortalezas' || q.key === 'oportunidades') {
                      @if (rv.report.quadrantAnalysis[q.key].observations.length) {
                        <div class="rep-group rep-group--obs">
                          @for (item of rv.report.quadrantAnalysis[q.key].observations; track $index) {
                            <span class="rep-group__item">{{ item }}</span>
                          }
                        </div>
                      }
                      @if (rv.report.quadrantAnalysis[q.key].suggestions.length) {
                        <div class="rep-group rep-group--sug">
                          @for (item of rv.report.quadrantAnalysis[q.key].suggestions; track $index) {
                            <span class="rep-group__item">{{ item }}</span>
                          }
                        </div>
                      }
                    } @else {
                      @if (rv.report.quadrantAnalysis[q.key].risks.length) {
                        <div class="rep-group rep-group--risk">
                          @for (item of rv.report.quadrantAnalysis[q.key].risks; track $index) {
                            <span class="rep-group__item">{{ item }}</span>
                          }
                        </div>
                      }
                      @if (rv.report.quadrantAnalysis[q.key].mitigations.length) {
                        <div class="rep-group rep-group--mit">
                          @for (item of rv.report.quadrantAnalysis[q.key].mitigations; track $index) {
                            <span class="rep-group__item">{{ item }}</span>
                          }
                        </div>
                      }
                    }
                  </div>
                }
              </div>
            </div>

            <!-- Recommendations -->
            @if (rv.report.recommendations.length) {
              <div class="rep-recs">
                <div class="rep-recs__header">
                  <span class="rep-recs__eyebrow">Recomendaciones</span>
                </div>
                <ol class="rep-recs__list">
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

    .rep-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 12px; padding: 48px 32px; text-align: center; color: var(--p-text-muted-color); }
    .rep-empty__icon  { margin-bottom: 4px; }
    .rep-empty__title { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: var(--p-text-secondary-color); margin: 0; }
    .rep-empty__desc  { font-size: 0.82rem; line-height: 1.6; margin: 0; max-width: 340px; color: var(--p-text-muted-color); }

    .rep-container { display: flex; flex-direction: column; gap: 16px; height: 100%; }

    .rep-versions          { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-shrink: 0; }
    .rep-versions__selector { display: flex; align-items: center; gap: 8px; flex: 1; }
    .rep-versions__label   { font-size: 0.75rem; font-weight: 600; color: var(--p-text-muted-color); white-space: nowrap; }
    .rep-versions__count   { font-size: 0.72rem; color: var(--p-text-muted-color); white-space: nowrap; }
    ::ng-deep .rep-select  { width: 100%; }

    .rep-content { display: flex; flex-direction: column; gap: 20px; overflow-y: auto; flex: 1; padding-right: 2px; }

    .rep-hero {
      display: flex; gap: 20px; align-items: flex-start;
      background: linear-gradient(135deg, var(--p-surface-50) 0%, var(--p-surface-0) 100%);
      border: 1px solid var(--p-surface-200); border-radius: 12px; padding: 20px;
    }
    .rep-score       { position: relative; flex-shrink: 0; width: 80px; height: 80px; }
    .rep-score__ring { width: 80px; height: 80px; }
    .rep-score__inner { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 2px; }
    .rep-score__num  { font-family: 'Syne', sans-serif; font-size: 1.5rem; font-weight: 800; color: var(--p-text-color); line-height: 1; }
    .rep-score__den  { font-size: 0.6rem; color: var(--p-text-muted-color); font-weight: 600; line-height: 1; margin-top: 6px; }

    .rep-hero__text    { flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .rep-hero__eyebrow { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--p-primary-600); }
    .rep-hero__summary { font-size: 0.82rem; line-height: 1.6; color: var(--p-text-secondary-color); margin: 0; }
    .rep-hero__date    { font-size: 0.68rem; color: var(--p-text-muted-color); margin-top: 2px; }

    .rep-highlights { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .rep-card         { border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
    .rep-card--opp    { background: #f0fdf4; border: 1px solid #bbf7d0; }
    .rep-card--threat { background: #fef2f2; border: 1px solid #fecaca; }
    .rep-card__header { display: flex; align-items: center; gap: 8px; }
    .rep-card__icon   { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0; }
    .rep-card__icon--opp    { background: #bbf7d0; color: #15803d; }
    .rep-card__icon--threat { background: #fecaca; color: #b91c1c; }
    .rep-card__title  { font-size: 0.75rem; font-weight: 700; color: var(--p-text-color); font-family: 'Syne', sans-serif; }
    .rep-card__list   { margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 4px; }
    .rep-card__list li { font-size: 0.78rem; line-height: 1.5; color: var(--p-text-secondary-color); }

    .rep-quadrants         { display: flex; flex-direction: column; gap: 12px; }
    .rep-quadrants__header { display: flex; align-items: center; gap: 10px; }
    .rep-quadrants__header::after { content: ''; flex: 1; height: 1px; background: var(--p-surface-200); }
    .rep-quadrants__eyebrow { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--p-text-muted-color); white-space: nowrap; }
    .rep-quadrants__grid   { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

    .rep-quadrant       { border: 1px solid var(--p-surface-200); border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; background: var(--p-surface-0); }
    .rep-quadrant__name { font-size: 0.72rem; font-weight: 700; display: flex; align-items: center; gap: 5px; font-family: 'Syne', sans-serif; }
    .rep-quadrant__name i { font-size: 0.68rem; }

    .rep-group    { display: flex; flex-direction: column; gap: 3px; }
    .rep-group--obs  { border-left: 2px solid #10b981; padding-left: 7px; }
    .rep-group--sug  { border-left: 2px solid #3b82f6; padding-left: 7px; }
    .rep-group--risk { border-left: 2px solid #ef4444; padding-left: 7px; }
    .rep-group--mit  { border-left: 2px solid #3b82f6; padding-left: 7px; }
    .rep-group__item { font-size: 0.72rem; line-height: 1.4; color: var(--p-text-secondary-color); }

    .rep-recs         { display: flex; flex-direction: column; gap: 10px; }
    .rep-recs__header { display: flex; align-items: center; gap: 10px; }
    .rep-recs__header::after { content: ''; flex: 1; height: 1px; background: var(--p-surface-200); }
    .rep-recs__eyebrow { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--p-text-muted-color); white-space: nowrap; }
    .rep-recs__list   { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 6px; }
    .rep-recs__list li { font-size: 0.82rem; line-height: 1.5; color: var(--p-text-secondary-color); }
  `],
})
export class FodaReportComponent {
  reports = input.required<FodaReportVersionDto[]>();

  selectedVersion = signal<number | null>(null);

  readonly quadrantConfigs: FodaQuadrantConfig[] = FODA_QUADRANTS;

  versionOptions = computed(() =>
    this.reports().map((r) => ({
      label: `v${r.version} — ${new Date(r.generatedAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}`,
      value: r.version,
    }))
  );

  currentReport = computed<FodaReportVersionDto | null>(() => {
    const list = this.reports();
    const version = this.selectedVersion();
    if (!list.length) return null;
    if (version === null) return list[0];
    return list.find((r) => r.version === version) ?? list[0];
  });

  scoreColor(score: number): string {
    if (score >= 8) return '#10b981';
    if (score >= 6) return '#3b82f6';
    if (score >= 4) return '#f59e0b';
    return '#ef4444';
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'short' });
  }
}
