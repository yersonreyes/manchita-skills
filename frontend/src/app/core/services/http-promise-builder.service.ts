import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { UiDialogService } from './ui-dialog.service';

// ─── Builder de peticiones HTTP ───────────────────────────────────────────────

export class HttpPromiseRequestBuilder<T> {
  private _method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' = 'GET';
  private _url = '';
  private _body: unknown = null;
  private _params = new HttpParams();
  private _silent = false;

  constructor(
    private readonly http: HttpClient,
    private readonly uiDialog: UiDialogService,
  ) {}

  get(): this { this._method = 'GET'; return this; }
  post(): this { this._method = 'POST'; return this; }
  patch(): this { this._method = 'PATCH'; return this; }
  put(): this { this._method = 'PUT'; return this; }
  delete(): this { this._method = 'DELETE'; return this; }

  url(url: string): this { this._url = url; return this; }
  body(body: unknown): this { this._body = body; return this; }
  silent(): this { this._silent = true; return this; }

  queryParam(key: string, value: string | number | boolean): this {
    this._params = this._params.set(key, String(value));
    return this;
  }

  async send(): Promise<T> {
    const options = { params: this._params };

    let observable$;

    switch (this._method) {
      case 'GET':
        observable$ = this.http.get<unknown>(this._url, options);
        break;
      case 'POST':
        observable$ = this.http.post<unknown>(this._url, this._body, options);
        break;
      case 'PATCH':
        observable$ = this.http.patch<unknown>(this._url, this._body, options);
        break;
      case 'PUT':
        observable$ = this.http.put<unknown>(this._url, this._body, options);
        break;
      case 'DELETE':
        observable$ = this.http.delete<unknown>(this._url, options);
        break;
    }

    try {
      const raw = await firstValueFrom(observable$);

      // Detectar si la respuesta es un envelope { res, code, message }
      if (
        raw !== null &&
        typeof raw === 'object' &&
        'code' in (raw as object) &&
        typeof (raw as Record<string, unknown>)['code'] === 'number'
      ) {
        const envelope = raw as { res: T; code: number; message: string };

        if (envelope.code !== 0) {
          // Error de negocio
          if (!this._silent) {
            this.uiDialog.showError('Error', envelope.message);
          }
          throw new Error(envelope.message);
        }

        return envelope.res;
      }

      // Respuesta sin envelope (login, refresh, etc.)
      return raw as T;

    } catch (error: unknown) {
      // Errores HTTP (4xx, 5xx)
      if (error instanceof Error && (error as unknown as { status?: number }).status !== undefined) {
        const httpError = error as unknown as { status: number; error?: { message?: string } };
        const message = httpError.error?.message ?? 'Error en la petición';
        if (!this._silent) {
          this.uiDialog.showError('Error', Array.isArray(message) ? message.join(', ') : message);
        }
      } else if (!this._silent && !(error instanceof Error && error.message)) {
        // Re-throw silently
      }
      throw error;
    }
  }
}

// ─── Servicio principal ───────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class HttpPromiseBuilderService {
  constructor(
    private readonly http: HttpClient,
    private readonly uiDialog: UiDialogService,
  ) {}

  request<T = unknown>(): HttpPromiseRequestBuilder<T> {
    return new HttpPromiseRequestBuilder<T>(this.http, this.uiDialog);
  }
}
