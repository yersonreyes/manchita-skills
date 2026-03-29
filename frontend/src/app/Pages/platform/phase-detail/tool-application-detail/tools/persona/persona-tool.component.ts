import { Component, computed, input } from '@angular/core';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';

interface PersonaData {
  nombre?: string;
  edad?: string | number;
  ocupacion?: string;
  bio?: string;
  objetivos?: string[];
  frustraciones?: string[];
  tecnologia?: string;
  cita?: string;
}

@Component({
  selector: 'app-persona-tool',
  standalone: true,
  template: `
    <div class="persona">
      <!-- Header del perfil -->
      <div class="persona__header">
        <div class="persona__avatar">
          <i class="pi pi-user"></i>
        </div>
        <div class="persona__identity">
          <h2 class="persona__name">{{ data().nombre || 'Sin nombre' }}</h2>
          <p class="persona__role">
            @if (data().edad) { <span>{{ data().edad }} años</span> }
            @if (data().ocupacion) { <span class="sep">·</span><span>{{ data().ocupacion }}</span> }
          </p>
        </div>
      </div>

      @if (data().cita) {
        <blockquote class="persona__quote">
          <i class="pi pi-quote-left"></i>
          {{ data().cita }}
        </blockquote>
      }

      @if (data().bio) {
        <div class="persona__section">
          <h3 class="persona__section-title">
            <i class="pi pi-info-circle"></i>
            Sobre {{ data().nombre || 'el usuario' }}
          </h3>
          <p class="persona__bio">{{ data().bio }}</p>
        </div>
      }

      <div class="persona__columns">
        @if (hasItems(data().objetivos)) {
          <div class="persona__section persona__section--goals">
            <h3 class="persona__section-title">
              <i class="pi pi-flag"></i>
              Objetivos
            </h3>
            <ul class="persona__list">
              @for (item of data().objetivos; track $index) {
                <li class="persona__list-item">{{ item }}</li>
              }
            </ul>
          </div>
        }

        @if (hasItems(data().frustraciones)) {
          <div class="persona__section persona__section--frustrations">
            <h3 class="persona__section-title">
              <i class="pi pi-exclamation-triangle"></i>
              Frustraciones
            </h3>
            <ul class="persona__list">
              @for (item of data().frustraciones; track $index) {
                <li class="persona__list-item">{{ item }}</li>
              }
            </ul>
          </div>
        }
      </div>

      @if (data().tecnologia) {
        <div class="persona__section">
          <h3 class="persona__section-title">
            <i class="pi pi-desktop"></i>
            Tecnología
          </h3>
          <p class="persona__bio">{{ data().tecnologia }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .persona {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .persona__header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      background: linear-gradient(135deg, #ecfdf5, #f0fdf4);
      border: 1px solid #a7f3d0;
      border-radius: 0.875rem;
    }

    .persona__avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 4rem;
      height: 4rem;
      border-radius: 50%;
      background: linear-gradient(135deg, #d1fae5, #a7f3d0);
      border: 2px solid #6ee7b7;
      color: #065f46;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .persona__name {
      font-size: 1.25rem;
      font-weight: 700;
      color: #064e3b;
      margin: 0 0 0.25rem;
    }

    .persona__role {
      font-size: 0.875rem;
      color: #065f46;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.375rem;

      .sep { opacity: 0.4; }
    }

    .persona__quote {
      margin: 0;
      padding: 1rem 1.25rem;
      background-color: #fffbeb;
      border-left: 3px solid #f59e0b;
      border-radius: 0 0.5rem 0.5rem 0;
      font-size: 0.9375rem;
      font-style: italic;
      color: #92400e;

      .pi {
        margin-right: 0.5rem;
        color: #f59e0b;
        font-size: 0.875rem;
      }
    }

    .persona__section-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #6b7280;
      margin: 0 0 0.75rem;

      .pi { font-size: 0.8125rem; }
    }

    .persona__bio {
      font-size: 0.9375rem;
      color: #374151;
      line-height: 1.6;
      margin: 0;
    }

    .persona__columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .persona__section {
      background-color: #f9fafb;
      border: 1px solid #f3f4f6;
      border-radius: 0.75rem;
      padding: 1rem;

      &--goals {
        border-color: #bbf7d0;
        background-color: #f0fdf4;

        .persona__section-title { color: #15803d; }
        .persona__list-item::before { background-color: #22c55e; }
      }

      &--frustrations {
        border-color: #fecaca;
        background-color: #fef2f2;

        .persona__section-title { color: #b91c1c; }
        .persona__list-item::before { background-color: #ef4444; }
      }
    }

    .persona__list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .persona__list-item {
      display: flex;
      align-items: flex-start;
      gap: 0.625rem;
      font-size: 0.875rem;
      color: #374151;
      line-height: 1.5;

      &::before {
        content: '';
        display: block;
        width: 0.375rem;
        height: 0.375rem;
        border-radius: 50%;
        background-color: #10b981;
        margin-top: 0.4375rem;
        flex-shrink: 0;
      }
    }
  `],
})
export class PersonaToolComponent {
  application = input<ToolApplicationResDto | null>(null);

  data = computed<PersonaData>(() => (this.application()?.structuredData ?? {}) as PersonaData);

  hasItems(arr: unknown): arr is string[] {
    return Array.isArray(arr) && arr.length > 0;
  }
}
