import { Component, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import {
  DIAGNOSTICO_FORCES,
  DiagnosticoForceConfig,
  DiagnosticoReportVersionDto,
  ForceIntensity,
} from './diagnostico-industria.types';

@Component({
  selector: 'app-diagnostico-industria-report',
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
        <p class="rep-empty__desc">Completá al menos 2 fuerzas y presioná "Analizar" para obtener un diagnóstico estratégico.</p>
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
                    [attr.stroke]="scoreColor(rv.report.industryScore)"
                    stroke-width="6"
                    stroke-linecap="round"
                    [attr.stroke-dasharray]="213.6"
                    [attr.stroke-dashoffset]="213.6 * (1 - rv.report.industryScore / 10)"
                    transform="rotate(-90 40 40)"
                    style="transition: stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)"
                  />
                </svg>
                <div class="rep-score__inner">
                  <span class="rep-score__num">{{ rv.report.industryScore }}</span>
                  <span class="rep-score__den">/10</span>
                </div>
              </div>
              <div class="rep-hero__text">
                <div class="rep-hero__eyebrow">Atractivo de la Industria</div>
                <p class="rep-hero__summary">{{ rv.report.executiveSummary }}</p>
                <span class="rep-hero__date">{{ formatDate(rv.generatedAt) }}</span>
              </div>
            </div>

            <!-- Forces grid -->
            <div class="rep-forces">
              <div class="rep-forces__header">
                <span class="rep-section-eyebrow">Análisis de Fuerzas</span>
              </div>
              <div class="rep-forces__grid">
                @for (force of forceConfigs; track force.key) {
                  @if (rv.report.forceAnalysis[force.key]; as fa) {
                    <div class="rep-force" [style.border-color]="force.borderColor" [style.background]="force.accentBg">
                      <div class="rep-force__header">
                        <i class="pi {{ force.icon }}" [style.color]="force.textColor"></i>
                        <span class="rep-force__name" [style.color]="force.textColor">{{ force.label }}</span>
                        <span
                          class="rep-force__badge"
                          [style.background]="intensityBg(fa.intensity)"
                          [style.color]="intensityColor(fa.intensity)"
                        >{{ fa.intensity }}</span>
                      </div>
                      <p class="rep-force__analysis">{{ fa.analysis }}</p>
                      @if (fa.implications.length) {
                        <ul class="rep-force__implications">
                          @for (imp of fa.implications; track $index) {
                            <li>{{ imp }}</li>
                          }
                        </ul>
                      }
                    </div>
                  }
                }
              </div>
            </div>

            <!-- Key opportunities + key risks -->
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
              @if (rv.report.keyRisks.length) {
                <div class="rep-card rep-card--threat">
                  <div class="rep-card__header">
                    <span class="rep-card__icon rep-card__icon--threat">⚠</span>
                    <span class="rep-card__title">Riesgos Críticos</span>
                  </div>
                  <ul class="rep-card__list">
                    @for (r of rv.report.keyRisks; track $index) {
                      <li>{{ r }}</li>
                    }
                  </ul>
                </div>
              }
            </div>

            <!-- Strategic position -->
            @if (rv.report.strategicPosition) {
              <div class="rep-position">
                <div class="rep-position__header">
                  <span class="rep-section-eyebrow">Posicionamiento Estratégico</span>
                </div>
                <p class="rep-position__text">{{ rv.report.strategicPosition }}</p>
              </div>
            }

            <!-- Recommendations -->
            @if (rv.report.recommendations.length) {
              <div class="rep-recs">
                <div class="rep-recs__header">
                  <span class="rep-section-eyebrow">Recomendaciones</span>
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

    .rep-section-eyebrow { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--p-text-muted-color); white-space: nowrap; }

    /* ─── Hero ───────────────────────────────────────────────────── */
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

    /* ─── Forces ─────────────────────────────────────────────────── */
    .rep-forces { display: flex; flex-direction: column; gap: 10px; }
    .rep-forces__header { display: flex; align-items: center; gap: 10px; }
    .rep-forces__header::after { content: ''; flex: 1; height: 1px; background: var(--p-surface-200); }
    .rep-forces__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

    .rep-force { border-radius: 10px; padding: 12px; border: 1px solid; display: flex; flex-direction: column; gap: 8px; }
    .rep-force__header { display: flex; align-items: center; gap: 6px; }
    .rep-force__header .pi { font-size: 0.8rem; flex-shrink: 0; }
    .rep-force__name { font-size: 0.72rem; font-weight: 700; flex: 1; font-family: 'Syne', sans-serif; }
    .rep-force__badge { font-size: 0.65rem; font-weight: 700; padding: 2px 7px; border-radius: 10px; flex-shrink: 0; letter-spacing: 0.04em; }
    .rep-force__analysis { font-size: 0.78rem; line-height: 1.5; color: var(--p-text-secondary-color); margin: 0; }
    .rep-force__implications { margin: 0; padding-left: 14px; display: flex; flex-direction: column; gap: 3px; }
    .rep-force__implications li { font-size: 0.72rem; line-height: 1.4; color: var(--p-text-muted-color); }

    /* ─── Highlights ─────────────────────────────────────────────── */
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

    /* ─── Strategic position ─────────────────────────────────────── */
    .rep-position { display: flex; flex-direction: column; gap: 10px; background: var(--p-primary-50, #eff6ff); border: 1px solid var(--p-primary-100, #dbeafe); border-radius: 10px; padding: 14px; }
    .rep-position__header { display: flex; align-items: center; gap: 10px; }
    .rep-position__header::after { content: ''; flex: 1; height: 1px; background: var(--p-primary-100, #dbeafe); }
    .rep-position__text { font-size: 0.82rem; line-height: 1.6; color: var(--p-text-secondary-color); margin: 0; }

    /* ─── Recommendations ────────────────────────────────────────── */
    .rep-recs         { display: flex; flex-direction: column; gap: 10px; }
    .rep-recs__header { display: flex; align-items: center; gap: 10px; }
    .rep-recs__header::after { content: ''; flex: 1; height: 1px; background: var(--p-surface-200); }
    .rep-recs__list   { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 6px; }
    .rep-recs__list li { font-size: 0.82rem; line-height: 1.5; color: var(--p-text-secondary-color); }
  `],
})
export class DiagnosticoIndustriaReportComponent {
  reports = input.required<DiagnosticoReportVersionDto[]>();
  selectedVersion = signal<number | null>(null);

  readonly forceConfigs: DiagnosticoForceConfig[] = DIAGNOSTICO_FORCES;

  versionOptions = computed(() =>
    this.reports().map((r) => ({
      label: `v${r.version} — ${new Date(r.generatedAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}`,
      value: r.version,
    }))
  );

  currentReport = computed<DiagnosticoReportVersionDto | null>(() => {
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

  intensityColor(intensity: ForceIntensity): string {
    const map: Record<ForceIntensity, string> = { BAJA: '#15803d', MEDIA: '#b45309', ALTA: '#b91c1c' };
    return map[intensity];
  }

  intensityBg(intensity: ForceIntensity): string {
    const map: Record<ForceIntensity, string> = { BAJA: '#dcfce7', MEDIA: '#fef3c7', ALTA: '#fee2e2' };
    return map[intensity];
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'short' });
  }
}
