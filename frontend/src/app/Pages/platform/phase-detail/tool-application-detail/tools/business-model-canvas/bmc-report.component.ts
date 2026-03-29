import { Component, input, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BmcReportVersionDto } from '@core/services/bmcService/bmc.res.dto';
import { BMC_BLOCKS_MAP } from './bmc-config';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-bmc-report',
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
        <p class="rep-empty__desc">Completá los 4 bloques requeridos marcados con ★ y presioná "Generar Informe" para obtener un análisis estratégico de tu modelo de negocio.</p>
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
                    [attr.stroke]="scoreColor(rv.report.coherenceScore)"
                    stroke-width="6"
                    stroke-linecap="round"
                    [attr.stroke-dasharray]="213.6"
                    [attr.stroke-dashoffset]="213.6 * (1 - rv.report.coherenceScore / 10)"
                    transform="rotate(-90 40 40)"
                    style="transition: stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)"
                  />
                </svg>
                <div class="rep-score__inner">
                  <span class="rep-score__num">{{ rv.report.coherenceScore }}</span>
                  <span class="rep-score__den">/10</span>
                </div>
              </div>
              <div class="rep-hero__text">
                <div class="rep-hero__eyebrow">Coherencia del Modelo</div>
                <p class="rep-hero__summary">{{ rv.report.executiveSummary }}</p>
                <span class="rep-hero__date">{{ formatDate(rv.generatedAt) }}</span>
              </div>
            </div>

            <!-- Risks & Recommendations side-by-side -->
            <div class="rep-highlights">
              @if (rv.report.risks.length) {
                <div class="rep-card rep-card--risk">
                  <div class="rep-card__header">
                    <span class="rep-card__icon rep-card__icon--risk">⚠</span>
                    <span class="rep-card__title">Riesgos Estratégicos</span>
                  </div>
                  <ul class="rep-card__list">
                    @for (r of rv.report.risks; track $index) {
                      <li>{{ r }}</li>
                    }
                  </ul>
                </div>
              }
              @if (rv.report.recommendations.length) {
                <div class="rep-card rep-card--rec">
                  <div class="rep-card__header">
                    <span class="rep-card__icon rep-card__icon--rec">→</span>
                    <span class="rep-card__title">Recomendaciones</span>
                  </div>
                  <ol class="rep-card__list rep-card__list--ordered">
                    @for (r of rv.report.recommendations; track $index) {
                      <li>{{ r }}</li>
                    }
                  </ol>
                </div>
              }
            </div>

            <!-- Block analysis -->
            <div class="rep-blocks">
              <div class="rep-blocks__header">
                <span class="rep-blocks__eyebrow">Análisis por Bloque</span>
              </div>
              <div class="rep-blocks__grid">
                @for (entry of blockAnalysisEntries(rv); track entry.key) {
                  <div class="rep-block">
                    <div class="rep-block__name">
                      <i class="pi {{ blockIcon(entry.key) }}"></i>
                      {{ blockLabel(entry.key) }}
                    </div>
                    @if (entry.analysis.strengths.length) {
                      <div class="rep-block__group rep-block__group--s">
                        @for (item of entry.analysis.strengths; track $index) {
                          <span class="rep-block__item">{{ item }}</span>
                        }
                      </div>
                    }
                    @if (entry.analysis.weaknesses.length) {
                      <div class="rep-block__group rep-block__group--w">
                        @for (item of entry.analysis.weaknesses; track $index) {
                          <span class="rep-block__item">{{ item }}</span>
                        }
                      </div>
                    }
                    @if (entry.analysis.suggestions.length) {
                      <div class="rep-block__group rep-block__group--sg">
                        @for (item of entry.analysis.suggestions; track $index) {
                          <span class="rep-block__item">{{ item }}</span>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            </div>

          </div>
        }

      </div>
    }
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@600;700;800&display=swap');

    :host { display: flex; flex-direction: column; height: 100%; font-family: 'DM Sans', sans-serif; }

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
    .rep-card--risk   { background: #fff7ed; border: 1px solid #fed7aa; }
    .rep-card--rec    { background: #f0fdf4; border: 1px solid #bbf7d0; }
    .rep-card__header { display: flex; align-items: center; gap: 8px; }
    .rep-card__icon   { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0; }
    .rep-card__icon--risk { background: #fed7aa; color: #c2410c; }
    .rep-card__icon--rec  { background: #bbf7d0; color: #15803d; }
    .rep-card__title  { font-size: 0.75rem; font-weight: 700; color: var(--p-text-color); font-family: 'Syne', sans-serif; }
    .rep-card__list   { margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 4px; }
    .rep-card__list li { font-size: 0.78rem; line-height: 1.5; color: var(--p-text-secondary-color); }
    .rep-card__list--ordered { padding-left: 20px; }

    .rep-blocks         { display: flex; flex-direction: column; gap: 12px; }
    .rep-blocks__header { display: flex; align-items: center; gap: 10px; }
    .rep-blocks__header::after { content: ''; flex: 1; height: 1px; background: var(--p-surface-200); }
    .rep-blocks__eyebrow { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--p-text-muted-color); white-space: nowrap; }
    .rep-blocks__grid   { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

    .rep-block       { border: 1px solid var(--p-surface-200); border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; background: var(--p-surface-0); }
    .rep-block__name { font-size: 0.72rem; font-weight: 700; color: var(--p-text-color); display: flex; align-items: center; gap: 5px; font-family: 'Syne', sans-serif; }
    .rep-block__name i { font-size: 0.68rem; color: var(--p-primary-500); }
    .rep-block__group    { display: flex; flex-direction: column; gap: 3px; }
    .rep-block__group--s  { border-left: 2px solid #10b981; padding-left: 7px; }
    .rep-block__group--w  { border-left: 2px solid #ef4444; padding-left: 7px; }
    .rep-block__group--sg { border-left: 2px solid #3b82f6; padding-left: 7px; }
    .rep-block__item { font-size: 0.72rem; line-height: 1.4; color: var(--p-text-secondary-color); }
  `],
})
export class BmcReportComponent {
  reports = input.required<BmcReportVersionDto[]>();

  selectedVersion = signal<number | null>(null);

  versionOptions = computed(() =>
    this.reports().map((r) => ({
      label: `v${r.version} — ${new Date(r.generatedAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}`,
      value: r.version,
    }))
  );

  currentReport = computed<BmcReportVersionDto | null>(() => {
    const list = this.reports();
    const version = this.selectedVersion();
    if (!list.length) return null;
    if (version === null) return list[0];
    return list.find((r) => r.version === version) ?? list[0];
  });

  blockAnalysisEntries(rv: BmcReportVersionDto) {
    return Object.entries(rv.report.blockAnalysis).map(([key, analysis]) => ({ key, analysis }));
  }

  blockLabel(key: string): string {
    return BMC_BLOCKS_MAP[key]?.label ?? key;
  }

  blockIcon(key: string): string {
    return BMC_BLOCKS_MAP[key]?.icon ?? 'pi-box';
  }

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
