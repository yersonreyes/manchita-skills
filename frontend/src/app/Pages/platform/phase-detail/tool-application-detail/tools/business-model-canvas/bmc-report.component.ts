import { Component, input, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BmcReportVersionDto } from '@core/services/bmcService/bmc.res.dto';
import { BMC_BLOCKS_MAP } from './bmc-config';
import { Select } from 'primeng/select';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-bmc-report',
  standalone: true,
  imports: [FormsModule, Select, Tag],
  template: `
    @if (reports().length === 0) {
      <div class="report-empty">
        <i class="pi pi-file-edit"></i>
        <p>Todavía no generaste ningún informe. Completá los bloques requeridos y presioná "Generar Informe".</p>
      </div>
    } @else {
      <div class="report-container">
        <div class="report-toolbar">
          <p-select
            [options]="versionOptions()"
            [(ngModel)]="selectedVersion"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccioná versión"
            class="report-toolbar__select"
          />
          <span class="report-toolbar__count">{{ reports().length }} informe{{ reports().length > 1 ? 's' : '' }} generado{{ reports().length > 1 ? 's' : '' }}</span>
        </div>

        @if (currentReport(); as rv) {
          <div class="report-content">

            <!-- Executive Summary -->
            <div class="report-section">
              <div class="report-section__header">
                <i class="pi pi-file-export"></i>
                <h4>Resumen Ejecutivo</h4>
                <p-tag
                  [value]="'Coherencia: ' + rv.report.coherenceScore + '/10'"
                  [severity]="coherenceSeverity(rv.report.coherenceScore)"
                />
              </div>
              <p class="report-section__text">{{ rv.report.executiveSummary }}</p>
            </div>

            <!-- Block Analysis -->
            <div class="report-section">
              <div class="report-section__header">
                <i class="pi pi-th-large"></i>
                <h4>Análisis por Bloque</h4>
              </div>
              <div class="block-analysis">
                @for (entry of blockAnalysisEntries(rv); track entry.key) {
                  <div class="block-analysis__item">
                    <div class="block-analysis__block-header">
                      <i class="pi {{ blockIcon(entry.key) }}"></i>
                      <strong>{{ blockLabel(entry.key) }}</strong>
                    </div>
                    @if (entry.analysis.strengths?.length) {
                      <div class="block-analysis__group block-analysis__group--strengths">
                        <span class="block-analysis__group-label"><i class="pi pi-check"></i> Fortalezas</span>
                        <ul>@for (s of entry.analysis.strengths; track $index) { <li>{{ s }}</li> }</ul>
                      </div>
                    }
                    @if (entry.analysis.weaknesses?.length) {
                      <div class="block-analysis__group block-analysis__group--weaknesses">
                        <span class="block-analysis__group-label"><i class="pi pi-times"></i> Debilidades</span>
                        <ul>@for (w of entry.analysis.weaknesses; track $index) { <li>{{ w }}</li> }</ul>
                      </div>
                    }
                    @if (entry.analysis.suggestions?.length) {
                      <div class="block-analysis__group block-analysis__group--suggestions">
                        <span class="block-analysis__group-label"><i class="pi pi-lightbulb"></i> Sugerencias</span>
                        <ul>@for (s of entry.analysis.suggestions; track $index) { <li>{{ s }}</li> }</ul>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>

            <!-- Risks -->
            @if (rv.report.risks?.length) {
              <div class="report-section">
                <div class="report-section__header">
                  <i class="pi pi-exclamation-triangle"></i>
                  <h4>Riesgos Estratégicos</h4>
                </div>
                <ul class="report-list report-list--risks">
                  @for (r of rv.report.risks; track $index) { <li>{{ r }}</li> }
                </ul>
              </div>
            }

            <!-- Recommendations -->
            @if (rv.report.recommendations?.length) {
              <div class="report-section">
                <div class="report-section__header">
                  <i class="pi pi-check-square"></i>
                  <h4>Recomendaciones</h4>
                </div>
                <ul class="report-list report-list--recommendations">
                  @for (r of rv.report.recommendations; track $index) { <li>{{ r }}</li> }
                </ul>
              </div>
            }

          </div>
        }
      </div>
    }
  `,
  styles: [`
    .report-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 12px;
      color: var(--p-text-muted-color);
      text-align: center;
      padding: 40px;

      i { font-size: 2.5rem; }
      p { font-size: 0.875rem; max-width: 320px; }
    }

    .report-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      height: 100%;
    }

    .report-toolbar {
      display: flex;
      align-items: center;
      gap: 12px;

      &__select { flex: 1; }
      &__count { font-size: 0.75rem; color: var(--p-text-muted-color); white-space: nowrap; }
    }

    .report-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
      overflow-y: auto;
      flex: 1;
    }

    .report-section {
      display: flex;
      flex-direction: column;
      gap: 10px;

      &__header {
        display: flex;
        align-items: center;
        gap: 8px;

        i { color: var(--p-primary-500); font-size: 1rem; }
        h4 { margin: 0; font-size: 0.9rem; font-weight: 600; flex: 1; }
      }

      &__text {
        font-size: 0.875rem;
        line-height: 1.6;
        color: var(--p-text-secondary-color);
        margin: 0;
      }
    }

    .block-analysis {
      display: flex;
      flex-direction: column;
      gap: 12px;

      &__item {
        border: 1px solid var(--p-surface-200);
        border-radius: 8px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      &__block-header {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--p-text-color);

        i { color: var(--p-primary-500); font-size: 0.85rem; }
      }

      &__group {
        display: flex;
        flex-direction: column;
        gap: 4px;

        ul {
          margin: 0;
          padding-left: 16px;
          font-size: 0.8rem;
          color: var(--p-text-secondary-color);
          li { line-height: 1.5; }
        }

        &--strengths  .block-analysis__group-label { color: var(--p-green-600); }
        &--weaknesses .block-analysis__group-label { color: var(--p-red-600); }
        &--suggestions .block-analysis__group-label { color: var(--p-blue-600); }
      }

      &__group-label {
        font-size: 0.72rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 4px;

        i { font-size: 0.65rem; }
      }
    }

    .report-list {
      margin: 0;
      padding-left: 20px;
      display: flex;
      flex-direction: column;
      gap: 4px;

      li { font-size: 0.875rem; color: var(--p-text-secondary-color); line-height: 1.5; }

      &--risks li::marker { color: var(--p-orange-500); }
      &--recommendations li::marker { color: var(--p-primary-500); }
    }
  `],
})
export class BmcReportComponent {
  reports = input.required<BmcReportVersionDto[]>();

  selectedVersion = signal<number | null>(null);

  versionOptions = computed(() =>
    this.reports().map((r) => ({
      label: `Versión ${r.version} — ${new Date(r.generatedAt).toLocaleString('es-AR')}`,
      value: r.version,
    }))
  );

  currentReport = computed<BmcReportVersionDto | null>(() => {
    const version = this.selectedVersion();
    const list = this.reports();
    if (!list.length) return null;
    if (version === null) return list[0]; // más reciente
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

  coherenceSeverity(score: number): 'success' | 'info' | 'warn' | 'danger' {
    if (score >= 8) return 'success';
    if (score >= 6) return 'info';
    if (score >= 4) return 'warn';
    return 'danger';
  }
}
