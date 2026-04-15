import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MARKED_EXTENSIONS, provideMarkdown } from 'ngx-markdown';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';

import { routes } from './app.routes';
import { authTokenInterceptor } from './core/interceptors/auth-token.interceptor';
import { authRefreshInterceptor } from './core/interceptors/auth-refresh.interceptor';

// ─── Tema personalizado: Obsidian Emerald ────────────────────────────────────
const ManchitaPreset = definePreset(Aura, {
  primitive: {
    borderRadius: {
      none: '0',
      xs:   '0.25rem',
      sm:   '0.375rem',
      md:   '0.5rem',
      lg:   '0.625rem',
      xl:   '0.75rem',
    },
  },
  semantic: {
    fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif",
    focusRing: {
      width: '2px',
      style: 'solid',
      color: '{primary.color}',
      offset: '2px',
      shadow: '0 0 0 4px rgb(5 150 105 / 0.2)',
    },
    formField: {
      borderRadius: '{border.radius.md}',
      paddingX: '0.875rem',
      paddingY: '0.625rem',
    },
    primary: {
      50:  '{emerald.50}',
      100: '{emerald.100}',
      200: '{emerald.200}',
      300: '{emerald.300}',
      400: '{emerald.400}',
      500: '{emerald.500}',
      600: '{emerald.600}',
      700: '{emerald.700}',
      800: '{emerald.800}',
      900: '{emerald.900}',
      950: '{emerald.950}',
    },
    colorScheme: {
      light: {
        primary: {
          color:        '{emerald.600}',
          inverseColor: '#ffffff',
          hoverColor:   '{emerald.700}',
          activeColor:  '{emerald.800}',
        },
        highlight: {
          background:      '{emerald.50}',
          focusBackground: '{emerald.100}',
          color:           '{emerald.700}',
          focusColor:      '{emerald.800}',
        },
        surface: {
          0:   '#ffffff',
          50:  '{stone.50}',
          100: '{stone.100}',
          200: '{stone.200}',
          300: '{stone.300}',
          400: '{stone.400}',
          500: '{stone.500}',
          600: '{stone.600}',
          700: '{stone.700}',
          800: '{stone.800}',
          900: '{stone.900}',
          950: '{stone.950}',
        },
      },
    },
  },
});

// ─── Locale español ───────────────────────────────────────────────────────────
const esLocale = {
  firstDayOfWeek: 1,
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  dayNamesMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  monthNames: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ],
  monthNamesShort: [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
  ],
  today: 'Hoy',
  clear: 'Limpiar',
  dateFormat: 'dd/mm/yy',
  weekHeader: 'Sem',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        authTokenInterceptor,
        authRefreshInterceptor,
      ]),
    ),
    provideAnimations(),
    provideAnimationsAsync(),
    provideMarkdown(),
    {
      provide: MARKED_EXTENSIONS,
      useValue: markedHighlight({
        langPrefix: 'hljs language-',
        highlight(code, lang) {
          const language = hljs.getLanguage(lang) ? lang : 'plaintext';
          return hljs.highlight(code, { language }).value;
        },
      }),
      multi: true,
    },
    ConfirmationService,
    MessageService,
    providePrimeNG({
      theme: {
        preset: ManchitaPreset,
        options: { darkModeSelector: 'none' },
      },
      translation: esLocale,
    }),
  ],
};
