import { Component, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { BuzzReportVersionDto } from './buzz-report.types';

@Component({
  selector: 'app-buzz-report-report',
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
        <p class="rep-empty__desc">Registrá al menos 3 menciones y presioná "Analizar" para obtener el Buzz Report.</p>
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

            <!-- Hero + Sentiment breakdown -->
            <div class="rep-hero">
              <div class="rep-hero__text">
                <div class="rep-hero__eyebrow">Resumen Ejecutivo</div>
                <p class="rep-hero__summary">{{ rv.report.executiveSummary }}</p>
                <span class="rep-hero__date">{{ formatDate(rv.generatedAt) }}</span>
              </div>
              <div class="rep-breakdown">
                <div class="rep-breakdown__title">Distribución de Sentiment</div>
                <div class="rep-breakdown__bars">
                  <div class="rep-bar">
                    <span class="rep-bar__label rep-bar__label--pos">Positivo</span>
                    <div class="rep-bar__track">
                      <div class="rep-bar__fill rep-bar__fill--pos" [style.width.%]="rv.report.sentimentBreakdown.positivo"></div>
                    </div>
                    <span class="rep-bar__pct">{{ rv.report.sentimentBreakdown.positivo }}%</span>
                  </div>
                  <div class="rep-bar">
                    <span class="rep-bar__label rep-bar__label--neu">Neutro</span>
                    <div class="rep-bar__track">
                      <div class="rep-bar__fill rep-bar__fill--neu" [style.width.%]="rv.report.sentimentBreakdown.neutro"></div>
                    </div>
                    <span class="rep-bar__pct">{{ rv.report.sentimentBreakdown.neutro }}%</span>
                  </div>
                  <div class="rep-bar">
                    <span class="rep-bar__label rep-bar__label--neg">Negativo</span>
                    <div class="rep-bar__track">
                      <div class="rep-bar__fill rep-bar__fill--neg" [style.width.%]="rv.report.sentimentBreakdown.negativo"></div>
                    </div>
                    <span class="rep-bar__pct">{{ rv.report.sentimentBreakdown.negativo }}%</span>
                  </div>
                </div>
                @if (rv.report.sentimentNarrative) {
                  <p class="rep-breakdown__narrative">{{ rv.report.sentimentNarrative }}</p>
                }
              </div>
            </div>

            <!-- Top canales -->
            @if (rv.report.topCanales.length) {
              <div class="rep-canales">
                <div class="rep-section-header">
                  <span class="rep-section-eyebrow">Canales con Mayor Actividad</span>
                </div>
                <div class="rep-canales__grid">
                  @for (c of rv.report.topCanales; track $index) {
                    <div class="rep-canal-card">
                      <div class="rep-canal-card__top">
                        <span class="rep-canal-card__nombre">{{ c.canal }}</span>
                        <span class="rep-canal-card__volumen">{{ c.volumen }}</span>
                        <span class="rep-canal-card__sentiment" [class.rep-canal-card__sentiment--pos]="c.sentiment === 'positivo'" [class.rep-canal-card__sentiment--neg]="c.sentiment === 'negativo'">{{ c.sentiment }}</span>
                      </div>
                      <p class="rep-canal-card__insight">{{ c.insight }}</p>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Temas + Voces -->
            <div class="rep-highlights">
              @if (rv.report.temasPrincipales.length) {
                <div class="rep-card rep-card--temas">
                  <div class="rep-card__header">
                    <span class="rep-card__icon rep-card__icon--temas"><i class="pi pi-hashtag"></i></span>
                    <span class="rep-card__title">Temas Principales</span>
                  </div>
                  <ul class="rep-card__list">
                    @for (t of rv.report.temasPrincipales; track $index) {
                      <li>{{ t }}</li>
                    }
                  </ul>
                </div>
              }
              @if (rv.report.vocesInfluyentes.length) {
                <div class="rep-card rep-card--voces">
                  <div class="rep-card__header">
                    <span class="rep-card__icon rep-card__icon--voces"><i class="pi pi-megaphone"></i></span>
                    <span class="rep-card__title">Voces Influyentes</span>
                  </div>
                  <ul class="rep-card__list">
                    @for (v of rv.report.vocesInfluyentes; track $index) {
                      <li>{{ v }}</li>
                    }
                  </ul>
                </div>
              }
            </div>

            <!-- Oportunidades + Riesgos -->
            @if (rv.report.oportunidades.length || rv.report.riesgos.length) {
              <div class="rep-oprisks">
                @if (rv.report.oportunidades.length) {
                  <div class="rep-card rep-card--opp">
                    <div class="rep-card__header">
                      <span class="rep-card__icon rep-card__icon--opp">↑</span>
                      <span class="rep-card__title">Oportunidades</span>
                    </div>
                    <ul class="rep-card__list">
                      @for (o of rv.report.oportunidades; track $index) {
                        <li>{{ o }}</li>
                      }
                    </ul>
                  </div>
                }
                @if (rv.report.riesgos.length) {
                  <div class="rep-card rep-card--risk">
                    <div class="rep-card__header">
                      <span class="rep-card__icon rep-card__icon--risk">⚠</span>
                      <span class="rep-card__title">Riesgos</span>
                    </div>
                    <ul class="rep-card__list">
                      @for (r of rv.report.riesgos; track $index) {
                        <li>{{ r }}</li>
                      }
                    </ul>
                  </div>
                }
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

    /* Hero + breakdown */
    .rep-hero { display: flex; gap: 20px; background: linear-gradient(135deg, #fdf4ff 0%, #ede9fe 100%); border: 1px solid #e9d5ff; border-radius: 12px; padding: 20px; }
    .rep-hero__text { flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .rep-hero__eyebrow { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #7c3aed; }
    .rep-hero__summary { font-size: 0.82rem; line-height: 1.6; color: var(--p-text-secondary-color); margin: 0; }
    .rep-hero__date { font-size: 0.68rem; color: var(--p-text-muted-color); margin-top: 2px; }

    .rep-breakdown { width: 220px; flex-shrink: 0; display: flex; flex-direction: column; gap: 8px; }
    .rep-breakdown__title { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--p-text-muted-color); }
    .rep-breakdown__bars { display: flex; flex-direction: column; gap: 5px; }
    .rep-breakdown__narrative { font-size: 0.72rem; line-height: 1.5; color: var(--p-text-muted-color); margin: 0; font-style: italic; }

    .rep-bar { display: flex; align-items: center; gap: 6px; }
    .rep-bar__label { font-size: 0.68rem; font-weight: 600; width: 52px; flex-shrink: 0; }
    .rep-bar__label--pos { color: #16a34a; }
    .rep-bar__label--neu { color: #6b7280; }
    .rep-bar__label--neg { color: #dc2626; }
    .rep-bar__track { flex: 1; height: 6px; background: var(--p-surface-200); border-radius: 3px; overflow: hidden; }
    .rep-bar__fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
    .rep-bar__fill--pos { background: #16a34a; }
    .rep-bar__fill--neu { background: #9ca3af; }
    .rep-bar__fill--neg { background: #dc2626; }
    .rep-bar__pct { font-size: 0.68rem; font-weight: 700; color: var(--p-text-muted-color); width: 30px; text-align: right; flex-shrink: 0; }

    /* Canales */
    .rep-section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .rep-section-header::after { content: ''; flex: 1; height: 1px; background: var(--p-surface-200); }
    .rep-section-eyebrow { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--p-text-muted-color); white-space: nowrap; }

    .rep-canales__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; }
    .rep-canal-card { background: var(--p-surface-50); border: 1px solid var(--p-surface-200); border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 5px; }
    .rep-canal-card__top { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .rep-canal-card__nombre { font-size: 0.75rem; font-weight: 700; color: var(--p-text-color); font-family: 'Syne', sans-serif; }
    .rep-canal-card__volumen { font-size: 0.68rem; color: var(--p-text-muted-color); background: var(--p-surface-100); padding: 1px 6px; border-radius: 4px; }
    .rep-canal-card__sentiment { font-size: 0.65rem; font-weight: 600; padding: 1px 6px; border-radius: 10px; background: #f3f4f6; color: #6b7280; }
    .rep-canal-card__sentiment--pos { background: #dcfce7; color: #16a34a; }
    .rep-canal-card__sentiment--neg { background: #fee2e2; color: #dc2626; }
    .rep-canal-card__insight { font-size: 0.75rem; line-height: 1.4; color: var(--p-text-secondary-color); margin: 0; }

    /* Highlights */
    .rep-highlights { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .rep-oprisks { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .rep-card { border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
    .rep-card--temas { background: #fdf4ff; border: 1px solid #e9d5ff; }
    .rep-card--voces { background: #fdf2f8; border: 1px solid #fbcfe8; }
    .rep-card--opp { background: #f0fdf4; border: 1px solid #bbf7d0; }
    .rep-card--risk { background: #fff7ed; border: 1px solid #fed7aa; }
    .rep-card__header { display: flex; align-items: center; gap: 8px; }
    .rep-card__icon { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0; }
    .rep-card__icon--temas { background: #ede9fe; color: #7c3aed; }
    .rep-card__icon--voces { background: #fce7f3; color: #db2777; }
    .rep-card__icon--opp { background: #bbf7d0; color: #15803d; }
    .rep-card__icon--risk { background: #fed7aa; color: #c2410c; }
    .rep-card__title { font-size: 0.75rem; font-weight: 700; color: var(--p-text-color); font-family: 'Syne', sans-serif; }
    .rep-card__list { margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 4px; }
    .rep-card__list li { font-size: 0.78rem; line-height: 1.5; color: var(--p-text-secondary-color); }

    .rep-recs__list { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 6px; }
    .rep-recs__list li { font-size: 0.82rem; line-height: 1.5; color: var(--p-text-secondary-color); }
  `],
})
export class BuzzReportReportComponent {
  reports = input.required<BuzzReportVersionDto[]>();

  selectedVersion = signal<number | null>(null);

  versionOptions = computed(() =>
    this.reports().map((r) => ({
      label: `v${r.version} — ${new Date(r.generatedAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}`,
      value: r.version,
    }))
  );

  currentReport = computed<BuzzReportVersionDto | null>(() => {
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
