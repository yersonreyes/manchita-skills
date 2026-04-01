import { Component, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { BenchmarkingBrechaDto, BenchmarkingReportVersionDto } from './benchmarking.types';

@Component({
  selector: 'app-benchmarking-report',
  standalone: true,
  imports: [FormsModule, Select],
  template: `
    @if (reports().length === 0) {
      <div class="bmr-empty">
        <div class="bmr-empty__icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="23" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
            <rect x="14" y="28" width="5" height="8" rx="1" fill="currentColor" opacity="0.3"/>
            <rect x="21.5" y="22" width="5" height="14" rx="1" fill="currentColor" opacity="0.5"/>
            <rect x="29" y="16" width="5" height="20" rx="1" fill="currentColor" opacity="0.7"/>
          </svg>
        </div>
        <h4 class="bmr-empty__title">Sin análisis generados</h4>
        <p class="bmr-empty__desc">Completá la matriz con al menos 2 criterios y 1 competidor, luego presioná "Analizar".</p>
      </div>
    } @else {
      <div class="bmr-container">

        <!-- Version selector -->
        <div class="bmr-versions">
          <div class="bmr-versions__selector">
            <span class="bmr-versions__label">Versión</span>
            <p-select
              [options]="versionOptions()"
              [ngModel]="selectedVersion()"
              (ngModelChange)="selectedVersion.set($event)"
              optionLabel="label"
              optionValue="value"
              placeholder="Más reciente"
              styleClass="bmr-select"
            />
          </div>
          <span class="bmr-versions__count">{{ reports().length }} análisis</span>
        </div>

        @if (current(); as rv) {
          <div class="bmr-content">

            <!-- Hero -->
            <div class="bmr-hero">
              <div class="bmr-hero__eyebrow">
                <i class="pi pi-chart-bar"></i>
                Benchmarking — Análisis Competitivo
              </div>
              <p class="bmr-hero__summary">{{ rv.report.executiveSummary }}</p>
              @if (rv.report.posicionamiento) {
                <div class="bmr-hero__pos">
                  <span class="bmr-hero__pos-label">Posicionamiento actual:</span>
                  {{ rv.report.posicionamiento }}
                </div>
              }
              <span class="bmr-hero__date">{{ formatDate(rv.generatedAt) }}</span>
            </div>

            <!-- Brechas por criterio -->
            @if (rv.report.brechas.length) {
              <div class="bmr-brechas">
                <div class="bmr-section-header">
                  <span class="bmr-section-eyebrow">Análisis por Criterio</span>
                </div>
                <div class="bmr-brechas__list">
                  @for (b of rv.report.brechas; track $index) {
                    <div class="bmr-brecha" [class]="'bmr-brecha--' + b.estado">
                      <div class="bmr-brecha__header">
                        <span class="bmr-brecha__criterio">{{ b.criterio }}</span>
                        <span class="bmr-brecha__badge bmr-brecha__badge--{{ b.estado }}">
                          {{ estadoLabel(b.estado) }}
                        </span>
                      </div>
                      <p class="bmr-brecha__obs">{{ b.observacion }}</p>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Ventajas y amenazas -->
            <div class="bmr-highlights">
              @if (rv.report.ventajasCompetitivas.length) {
                <div class="bmr-card bmr-card--ventaja">
                  <div class="bmr-card__header">
                    <span class="bmr-card__icon bmr-card__icon--ventaja">↑</span>
                    <span class="bmr-card__title">Ventajas Competitivas</span>
                  </div>
                  <ul class="bmr-card__list">
                    @for (v of rv.report.ventajasCompetitivas; track $index) {
                      <li>{{ v }}</li>
                    }
                  </ul>
                </div>
              }
              @if (rv.report.amenazas.length) {
                <div class="bmr-card bmr-card--amenaza">
                  <div class="bmr-card__header">
                    <span class="bmr-card__icon bmr-card__icon--amenaza">!</span>
                    <span class="bmr-card__title">Brechas / Amenazas</span>
                  </div>
                  <ul class="bmr-card__list">
                    @for (a of rv.report.amenazas; track $index) {
                      <li>{{ a }}</li>
                    }
                  </ul>
                </div>
              }
            </div>

            <!-- Oportunidades de diferenciación -->
            @if (rv.report.oportunidadesDeDiferenciacion.length) {
              <div class="bmr-section">
                <div class="bmr-section-header">
                  <span class="bmr-section-eyebrow">Oportunidades de Diferenciación</span>
                </div>
                <ul class="bmr-list bmr-list--opp">
                  @for (o of rv.report.oportunidadesDeDiferenciacion; track $index) {
                    <li>
                      <span class="bmr-list__dot bmr-list__dot--opp"></span>
                      {{ o }}
                    </li>
                  }
                </ul>
              </div>
            }

            <!-- Recommendations -->
            @if (rv.report.recommendations.length) {
              <div class="bmr-recs">
                <div class="bmr-section-header">
                  <span class="bmr-section-eyebrow">Recomendaciones</span>
                </div>
                <ol class="bmr-recs__list">
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

    .bmr-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 12px; padding: 48px 32px; text-align: center; color: var(--p-text-muted-color); }
    .bmr-empty__icon { margin-bottom: 4px; }
    .bmr-empty__title { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: var(--p-text-secondary-color); margin: 0; }
    .bmr-empty__desc { font-size: 0.82rem; line-height: 1.6; margin: 0; max-width: 340px; color: var(--p-text-muted-color); }

    .bmr-container { display: flex; flex-direction: column; gap: 16px; height: 100%; }

    .bmr-versions { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-shrink: 0; }
    .bmr-versions__selector { display: flex; align-items: center; gap: 8px; flex: 1; }
    .bmr-versions__label { font-size: 0.75rem; font-weight: 600; color: var(--p-text-muted-color); white-space: nowrap; }
    .bmr-versions__count { font-size: 0.72rem; color: var(--p-text-muted-color); white-space: nowrap; }
    ::ng-deep .bmr-select { width: 100%; }

    .bmr-content { display: flex; flex-direction: column; gap: 20px; overflow-y: auto; flex: 1; padding-right: 2px; }

    /* Hero */
    .bmr-hero {
      background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%);
      border: 1px solid #fde047;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .bmr-hero__eyebrow { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #854d0e; display: flex; align-items: center; gap: 5px; }
    .bmr-hero__eyebrow .pi { font-size: 0.72rem; }
    .bmr-hero__summary { font-size: 0.82rem; line-height: 1.6; color: #713f12; margin: 0; }
    .bmr-hero__pos { font-size: 0.78rem; color: #854d0e; background: rgba(253,224,71,0.3); border-radius: 6px; padding: 6px 10px; display: flex; gap: 6px; }
    .bmr-hero__pos-label { font-weight: 700; white-space: nowrap; }
    .bmr-hero__date { font-size: 0.68rem; color: #a16207; }

    /* Section headers */
    .bmr-section-header { display: flex; align-items: center; gap: 10px; }
    .bmr-section-header::after { content: ''; flex: 1; height: 1px; background: var(--p-surface-200); }
    .bmr-section-eyebrow { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--p-text-muted-color); white-space: nowrap; }

    /* Brechas */
    .bmr-brechas { display: flex; flex-direction: column; gap: 10px; }
    .bmr-brechas__list { display: flex; flex-direction: column; gap: 6px; }

    .bmr-brecha { border-radius: 8px; padding: 10px 12px; border: 1px solid; display: flex; flex-direction: column; gap: 4px; }
    .bmr-brecha--ventaja { background: #f0fdf4; border-color: #bbf7d0; }
    .bmr-brecha--paridad { background: var(--p-surface-50); border-color: var(--p-surface-200); }
    .bmr-brecha--brecha { background: #fef2f2; border-color: #fecaca; }

    .bmr-brecha__header { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .bmr-brecha__criterio { font-size: 0.8rem; font-weight: 700; font-family: 'Syne', sans-serif; color: var(--p-text-color); }
    .bmr-brecha__badge { font-size: 0.6rem; font-weight: 700; padding: 2px 6px; border-radius: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
    .bmr-brecha__badge--ventaja { background: #bbf7d0; color: #15803d; }
    .bmr-brecha__badge--paridad { background: var(--p-surface-200); color: var(--p-text-muted-color); }
    .bmr-brecha__badge--brecha { background: #fecaca; color: #b91c1c; }
    .bmr-brecha__obs { font-size: 0.78rem; line-height: 1.5; color: var(--p-text-secondary-color); margin: 0; }

    /* Highlights */
    .bmr-highlights { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .bmr-card { border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
    .bmr-card--ventaja { background: #f0fdf4; border: 1px solid #bbf7d0; }
    .bmr-card--amenaza { background: #fef2f2; border: 1px solid #fecaca; }
    .bmr-card__header { display: flex; align-items: center; gap: 8px; }
    .bmr-card__icon { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0; }
    .bmr-card__icon--ventaja { background: #bbf7d0; color: #15803d; }
    .bmr-card__icon--amenaza { background: #fecaca; color: #b91c1c; }
    .bmr-card__title { font-size: 0.75rem; font-weight: 700; font-family: 'Syne', sans-serif; color: var(--p-text-color); }
    .bmr-card__list { margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 4px; }
    .bmr-card__list li { font-size: 0.78rem; line-height: 1.5; color: var(--p-text-secondary-color); }

    /* Oportunidades list */
    .bmr-section { display: flex; flex-direction: column; gap: 10px; }
    .bmr-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
    .bmr-list li { display: flex; align-items: flex-start; gap: 8px; font-size: 0.8rem; line-height: 1.5; color: var(--p-text-secondary-color); }
    .bmr-list__dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
    .bmr-list__dot--opp { background: #8b5cf6; }

    /* Recommendations */
    .bmr-recs { display: flex; flex-direction: column; gap: 10px; }
    .bmr-recs__list { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 6px; }
    .bmr-recs__list li { font-size: 0.82rem; line-height: 1.5; color: var(--p-text-secondary-color); }
  `],
})
export class BenchmarkingReportComponent {
  reports = input.required<BenchmarkingReportVersionDto[]>();

  selectedVersion = signal<number | null>(null);

  versionOptions = computed(() =>
    this.reports().map(r => ({
      label: `v${r.version} — ${new Date(r.generatedAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}`,
      value: r.version,
    }))
  );

  current = computed<BenchmarkingReportVersionDto | null>(() => {
    const list = this.reports();
    const version = this.selectedVersion();
    if (!list.length) return null;
    if (version === null) return list[0];
    return list.find(r => r.version === version) ?? list[0];
  });

  estadoLabel(estado: BenchmarkingBrechaDto['estado']): string {
    const map = { ventaja: 'Ventaja', paridad: 'Paridad', brecha: 'Brecha' };
    return map[estado] ?? estado;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'short' });
  }
}
