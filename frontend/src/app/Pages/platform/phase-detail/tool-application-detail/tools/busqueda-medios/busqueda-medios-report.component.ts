import { Component, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { BusquedaMediosReportVersionDto } from './busqueda-medios.types';

@Component({
  selector: 'app-busqueda-medios-report',
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
        <p class="rep-empty__desc">Registrá al menos 3 hallazgos y presioná "Analizar" para obtener el análisis de medios.</p>
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
                <div class="rep-hero__eyebrow">Resumen Ejecutivo</div>
                <p class="rep-hero__summary">{{ rv.report.executiveSummary }}</p>
                <span class="rep-hero__date">{{ formatDate(rv.generatedAt) }}</span>
              </div>
            </div>

            <!-- Sentiment -->
            @if (rv.report.sentimentGeneral) {
              <div class="rep-sentiment">
                <span class="rep-sentiment__label">
                  <i class="pi pi-wave-pulse"></i>
                  Sentiment General
                </span>
                <p class="rep-sentiment__text">{{ rv.report.sentimentGeneral }}</p>
              </div>
            }

            <!-- Tendencias + Narrativas -->
            <div class="rep-highlights">
              @if (rv.report.tendenciasClave.length) {
                <div class="rep-card rep-card--tendencias">
                  <div class="rep-card__header">
                    <span class="rep-card__icon rep-card__icon--tendencias">
                      <i class="pi pi-arrow-up-right"></i>
                    </span>
                    <span class="rep-card__title">Tendencias Clave</span>
                  </div>
                  <ul class="rep-card__list">
                    @for (t of rv.report.tendenciasClave; track $index) {
                      <li>{{ t }}</li>
                    }
                  </ul>
                </div>
              }
              @if (rv.report.narrativasPredominantes.length) {
                <div class="rep-card rep-card--narrativas">
                  <div class="rep-card__header">
                    <span class="rep-card__icon rep-card__icon--narrativas">
                      <i class="pi pi-megaphone"></i>
                    </span>
                    <span class="rep-card__title">Narrativas Predominantes</span>
                  </div>
                  <ul class="rep-card__list">
                    @for (n of rv.report.narrativasPredominantes; track $index) {
                      <li>{{ n }}</li>
                    }
                  </ul>
                </div>
              }
            </div>

            <!-- Gaps -->
            @if (rv.report.gapsIdentificados.length) {
              <div class="rep-gaps">
                <div class="rep-section-header">
                  <span class="rep-section-eyebrow">Gaps Identificados</span>
                </div>
                <div class="rep-gaps__list">
                  @for (g of rv.report.gapsIdentificados; track $index) {
                    <div class="rep-gap-item">
                      <span class="rep-gap-dot"></span>
                      <span>{{ g }}</span>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Implicaciones de Diseño -->
            @if (rv.report.implicacionesDeDiseno.length) {
              <div class="rep-implicaciones">
                <div class="rep-section-header">
                  <span class="rep-section-eyebrow">Implicaciones de Diseño</span>
                </div>
                <div class="rep-impl-grid">
                  @for (imp of rv.report.implicacionesDeDiseno; track $index; let i = $index) {
                    <div class="rep-impl-card">
                      <span class="rep-impl-num">{{ i + 1 }}</span>
                      <p>{{ imp }}</p>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Recommendations -->
            @if (rv.report.recommendations.length) {
              <div class="rep-recs">
                <div class="rep-section-header">
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

    .rep-hero { display: flex; gap: 16px; align-items: stretch; background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); border: 1px solid #99f6e4; border-radius: 12px; padding: 20px; overflow: hidden; }
    .rep-hero__accent { width: 4px; border-radius: 4px; background: linear-gradient(180deg, #0d9488 0%, #5eead4 100%); flex-shrink: 0; }
    .rep-hero__text { display: flex; flex-direction: column; gap: 6px; }
    .rep-hero__eyebrow { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #0d9488; }
    .rep-hero__summary { font-size: 0.82rem; line-height: 1.6; color: var(--p-text-secondary-color); margin: 0; }
    .rep-hero__date { font-size: 0.68rem; color: var(--p-text-muted-color); margin-top: 2px; }

    .rep-sentiment { background: var(--p-surface-50); border: 1px solid var(--p-surface-200); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 6px; }
    .rep-sentiment__label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #0d9488; display: flex; align-items: center; gap: 5px; }
    .rep-sentiment__label .pi { font-size: 0.7rem; }
    .rep-sentiment__text { font-size: 0.82rem; line-height: 1.6; color: var(--p-text-secondary-color); margin: 0; font-style: italic; }

    .rep-highlights { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .rep-card { border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
    .rep-card--tendencias { background: #f0fdfa; border: 1px solid #99f6e4; }
    .rep-card--narrativas { background: #fdf4ff; border: 1px solid #e9d5ff; }
    .rep-card__header { display: flex; align-items: center; gap: 8px; }
    .rep-card__icon { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; flex-shrink: 0; }
    .rep-card__icon--tendencias { background: #ccfbf1; color: #0d9488; }
    .rep-card__icon--narrativas { background: #ede9fe; color: #7c3aed; }
    .rep-card__title { font-size: 0.75rem; font-weight: 700; color: var(--p-text-color); font-family: 'Syne', sans-serif; }
    .rep-card__list { margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 4px; }
    .rep-card__list li { font-size: 0.78rem; line-height: 1.5; color: var(--p-text-secondary-color); }

    .rep-section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .rep-section-header::after { content: ''; flex: 1; height: 1px; background: var(--p-surface-200); }
    .rep-section-eyebrow { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--p-text-muted-color); white-space: nowrap; }

    .rep-gaps__list { display: flex; flex-direction: column; gap: 6px; }
    .rep-gap-item { display: flex; align-items: flex-start; gap: 8px; font-size: 0.82rem; line-height: 1.5; color: var(--p-text-secondary-color); }
    .rep-gap-dot { width: 8px; height: 8px; border-radius: 50%; background: #f59e0b; flex-shrink: 0; margin-top: 5px; }

    .rep-impl-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .rep-impl-card { background: var(--p-surface-50); border: 1px solid var(--p-surface-200); border-radius: 8px; padding: 10px 12px; display: flex; gap: 10px; align-items: flex-start; }
    .rep-impl-num { width: 20px; height: 20px; border-radius: 50%; background: #0d9488; color: white; font-size: 0.65rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
    .rep-impl-card p { margin: 0; font-size: 0.78rem; line-height: 1.5; color: var(--p-text-secondary-color); }

    .rep-recs__list { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 6px; }
    .rep-recs__list li { font-size: 0.82rem; line-height: 1.5; color: var(--p-text-secondary-color); }
  `],
})
export class BusquedaMediosReportComponent {
  reports = input.required<BusquedaMediosReportVersionDto[]>();

  selectedVersion = signal<number | null>(null);

  versionOptions = computed(() =>
    this.reports().map((r) => ({
      label: `v${r.version} — ${new Date(r.generatedAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}`,
      value: r.version,
    }))
  );

  currentReport = computed<BusquedaMediosReportVersionDto | null>(() => {
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
