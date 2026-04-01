import { Component, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { EntrevistaCualitativaReportVersionDto } from './entrevista-cualitativa.types';

@Component({
  selector: 'app-entrevista-cualitativa-report',
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
        <h4 class="rep-empty__title">Sin análisis generados</h4>
        <p class="rep-empty__desc">Completá al menos 2 respuestas y presioná "Analizar" para obtener el análisis de la entrevista.</p>
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

            <!-- Hero -->
            <div class="rep-hero">
              <div class="rep-hero__accent"></div>
              <div class="rep-hero__text">
                @if (rv.report.perfilEntrevistado) {
                  <div class="rep-hero__profile">
                    <i class="pi pi-user"></i>
                    {{ rv.report.perfilEntrevistado }}
                  </div>
                }
                <div class="rep-hero__eyebrow">Resumen Ejecutivo</div>
                <p class="rep-hero__summary">{{ rv.report.executiveSummary }}</p>
                <span class="rep-hero__date">{{ formatDate(rv.generatedAt) }}</span>
              </div>
            </div>

            <!-- Insights -->
            @if (rv.report.insights.length) {
              <div class="rep-insights">
                <div class="rep-section-header">
                  <span class="rep-section-eyebrow">Insights Clave</span>
                </div>
                <div class="rep-insights__grid">
                  @for (ins of rv.report.insights; track $index; let i = $index) {
                    <div class="rep-insight-card">
                      <div class="rep-insight-card__cat">{{ ins.categoria }}</div>
                      <p class="rep-insight-card__text">{{ ins.insight }}</p>
                      @if (ins.evidencia) {
                        <div class="rep-insight-card__evidence">
                          <i class="pi pi-quote-left"></i>
                          {{ ins.evidencia }}
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Necesidades + Pain Points + Motivaciones -->
            <div class="rep-highlights">
              @if (rv.report.necesidadesDetectadas.length) {
                <div class="rep-card rep-card--needs">
                  <div class="rep-card__header">
                    <span class="rep-card__icon rep-card__icon--needs"><i class="pi pi-heart"></i></span>
                    <span class="rep-card__title">Necesidades Detectadas</span>
                  </div>
                  <ul class="rep-card__list">
                    @for (n of rv.report.necesidadesDetectadas; track $index) {
                      <li>{{ n }}</li>
                    }
                  </ul>
                </div>
              }
              @if (rv.report.painPoints.length) {
                <div class="rep-card rep-card--pain">
                  <div class="rep-card__header">
                    <span class="rep-card__icon rep-card__icon--pain">⚡</span>
                    <span class="rep-card__title">Pain Points</span>
                  </div>
                  <ul class="rep-card__list">
                    @for (p of rv.report.painPoints; track $index) {
                      <li>{{ p }}</li>
                    }
                  </ul>
                </div>
              }
              @if (rv.report.motivaciones.length) {
                <div class="rep-card rep-card--motiv">
                  <div class="rep-card__header">
                    <span class="rep-card__icon rep-card__icon--motiv">★</span>
                    <span class="rep-card__title">Motivaciones</span>
                  </div>
                  <ul class="rep-card__list">
                    @for (m of rv.report.motivaciones; track $index) {
                      <li>{{ m }}</li>
                    }
                  </ul>
                </div>
              }
            </div>

            <!-- Citas destacadas -->
            @if (rv.report.citasDestacadas.length) {
              <div class="rep-citas">
                <div class="rep-section-header">
                  <span class="rep-section-eyebrow">Citas Destacadas</span>
                </div>
                <div class="rep-citas__list">
                  @for (c of rv.report.citasDestacadas; track $index) {
                    <div class="rep-cita">
                      <i class="pi pi-quote-left rep-cita__icon"></i>
                      <p>{{ c }}</p>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Recommendations -->
            @if (rv.report.recommendations.length) {
              <div class="rep-recs">
                <div class="rep-section-header">
                  <span class="rep-section-eyebrow">Recomendaciones para Diseño</span>
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
    .rep-empty__icon { margin-bottom: 4px; }
    .rep-empty__title { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: var(--p-text-secondary-color); margin: 0; }
    .rep-empty__desc { font-size: 0.82rem; line-height: 1.6; margin: 0; max-width: 340px; color: var(--p-text-muted-color); }

    .rep-container { display: flex; flex-direction: column; gap: 16px; height: 100%; }

    .rep-versions { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-shrink: 0; }
    .rep-versions__selector { display: flex; align-items: center; gap: 8px; flex: 1; }
    .rep-versions__label { font-size: 0.75rem; font-weight: 600; color: var(--p-text-muted-color); white-space: nowrap; }
    .rep-versions__count { font-size: 0.72rem; color: var(--p-text-muted-color); white-space: nowrap; }
    ::ng-deep .rep-select { width: 100%; }

    .rep-content { display: flex; flex-direction: column; gap: 20px; overflow-y: auto; flex: 1; padding-right: 2px; }

    .rep-hero { display: flex; gap: 16px; align-items: stretch; background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border: 1px solid #fed7aa; border-radius: 12px; padding: 20px; }
    .rep-hero__accent { width: 4px; border-radius: 4px; background: linear-gradient(180deg, #ea580c 0%, #fb923c 100%); flex-shrink: 0; }
    .rep-hero__text { flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .rep-hero__profile { font-size: 0.72rem; font-weight: 600; color: #ea580c; display: flex; align-items: center; gap: 5px; background: white; border: 1px solid #fed7aa; padding: 3px 10px; border-radius: 20px; width: fit-content; }
    .rep-hero__profile .pi { font-size: 0.65rem; }
    .rep-hero__eyebrow { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #ea580c; }
    .rep-hero__summary { font-size: 0.82rem; line-height: 1.6; color: var(--p-text-secondary-color); margin: 0; }
    .rep-hero__date { font-size: 0.68rem; color: var(--p-text-muted-color); margin-top: 2px; }

    .rep-section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .rep-section-header::after { content: ''; flex: 1; height: 1px; background: var(--p-surface-200); }
    .rep-section-eyebrow { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--p-text-muted-color); white-space: nowrap; }

    .rep-insights__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .rep-insight-card { background: var(--p-surface-50); border: 1px solid var(--p-surface-200); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 6px; }
    .rep-insight-card__cat { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #ea580c; background: #ffedd5; padding: 2px 8px; border-radius: 10px; width: fit-content; }
    .rep-insight-card__text { font-size: 0.8rem; line-height: 1.5; color: var(--p-text-color); margin: 0; font-weight: 500; }
    .rep-insight-card__evidence { font-size: 0.72rem; line-height: 1.4; color: var(--p-text-muted-color); font-style: italic; display: flex; gap: 5px; align-items: flex-start; border-left: 2px solid #fed7aa; padding-left: 7px; }
    .rep-insight-card__evidence .pi { font-size: 0.62rem; flex-shrink: 0; margin-top: 2px; color: #ea580c; }

    .rep-highlights { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
    .rep-card { border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
    .rep-card--needs { background: #f0fdf4; border: 1px solid #bbf7d0; }
    .rep-card--pain { background: #fef2f2; border: 1px solid #fecaca; }
    .rep-card--motiv { background: #fefce8; border: 1px solid #fef08a; }
    .rep-card__header { display: flex; align-items: center; gap: 7px; }
    .rep-card__icon { width: 22px; height: 22px; border-radius: 5px; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700; flex-shrink: 0; }
    .rep-card__icon--needs { background: #bbf7d0; color: #15803d; }
    .rep-card__icon--pain { background: #fecaca; color: #b91c1c; }
    .rep-card__icon--motiv { background: #fef08a; color: #854d0e; }
    .rep-card__title { font-size: 0.72rem; font-weight: 700; color: var(--p-text-color); font-family: 'Syne', sans-serif; }
    .rep-card__list { margin: 0; padding-left: 14px; display: flex; flex-direction: column; gap: 4px; }
    .rep-card__list li { font-size: 0.75rem; line-height: 1.4; color: var(--p-text-secondary-color); }

    .rep-citas__list { display: flex; flex-direction: column; gap: 8px; }
    .rep-cita { display: flex; gap: 10px; align-items: flex-start; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 10px 14px; }
    .rep-cita__icon { color: #ea580c; font-size: 0.72rem; flex-shrink: 0; margin-top: 3px; }
    .rep-cita p { margin: 0; font-size: 0.82rem; line-height: 1.5; color: #7c2d12; font-style: italic; }

    .rep-recs__list { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 6px; }
    .rep-recs__list li { font-size: 0.82rem; line-height: 1.5; color: var(--p-text-secondary-color); }
  `],
})
export class EntrevistaCualitativaReportComponent {
  reports = input.required<EntrevistaCualitativaReportVersionDto[]>();

  selectedVersion = signal<number | null>(null);

  versionOptions = computed(() =>
    this.reports().map((r) => ({
      label: `v${r.version} — ${new Date(r.generatedAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}`,
      value: r.version,
    }))
  );

  currentReport = computed<EntrevistaCualitativaReportVersionDto | null>(() => {
    const list = this.reports();
    const version = this.selectedVersion();
    if (!list.length) return null;
    if (version === null) return list[0];
    return list.find((r) => r.version === version) ?? list[0];
  });

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'short' });
  }
}
