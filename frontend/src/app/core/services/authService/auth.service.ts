import { Injectable, WritableSignal, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import {
  ForgotPasswordRequest,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from './auth.req.dto';
import {
  JwtPayload,
  LoginResponse,
  RefreshTokenResponse,
  User,
} from './auth.res.dto';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;

  // ─── Estado reactivo (Signals) ────────────────────────────────────────────
  public user: WritableSignal<User | null> = signal<User | null>(null);
  public sessionExpired: WritableSignal<boolean> = signal(false);
  public userPermissions: WritableSignal<string[]> = signal<string[]>([]);
  public isSuperAdmin: WritableSignal<boolean> = signal<boolean>(false);

  // ─── Control de refresh ───────────────────────────────────────────────────
  private isRefreshing = false;
  private refreshPromise: Promise<RefreshTokenResponse> | null = null;
  private expirationTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly httpBuilder: HttpPromiseBuilderService,
    private readonly router: Router,
  ) {
    this.restoreSession();
  }

  // ─── TOKEN STORAGE ────────────────────────────────────────────────────────

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('auth_refresh_token');
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('auth_token', accessToken);
    localStorage.setItem('auth_refresh_token', refreshToken);
  }

  private clearTokens(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_refresh_token');
    localStorage.removeItem('auth_user');
  }

  // ─── JWT DECODE ───────────────────────────────────────────────────────────

  private decodeToken(token: string | null | undefined): JwtPayload | null {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    try {
      const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(payload) as JwtPayload;
    } catch {
      return null;
    }
  }

  isTokenExpired(): boolean {
    const decoded = this.decodeToken(this.getToken());
    if (!decoded?.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  }

  isRefreshTokenExpired(): boolean {
    // El refresh token no tiene fecha de expiración en el payload,
    // lo consideramos válido si existe
    const token = this.getRefreshToken();
    return !token;
  }

  private loadPermissionsFromToken(token: string): void {
    const decoded = this.decodeToken(token);
    if (!decoded) return;
    this.userPermissions.set(decoded.permissions ?? []);
    this.isSuperAdmin.set(decoded.isSuperAdmin ?? false);
  }

  // ─── AUTH METHODS ─────────────────────────────────────────────────────────

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.httpBuilder
      .request<LoginResponse>()
      .post()
      .url(`${this.baseUrl}/login`)
      .body(credentials)
      .send();

    this.setTokens(response.access_token, response.refresh_token);
    this.loadPermissionsFromToken(response.access_token);

    const decoded = this.decodeToken(response.access_token);
    if (decoded) {
      const user: User = {
        id: decoded.sub,
        email: decoded.email,
        nombre: decoded.nombre ?? '',
        isSuperAdmin: decoded.isSuperAdmin,
        activo: true,
      };
      this.user.set(user);
      localStorage.setItem('auth_user', JSON.stringify(user));
    }

    this.sessionExpired.set(false);
    this.startExpirationTimer();
    return response;
  }

  async register(data: RegisterRequest): Promise<{ res: User; message: string; code: number }> {
    return this.httpBuilder
      .request<{ res: User; message: string; code: number }>()
      .post()
      .url(`${this.baseUrl}/register`)
      .body(data)
      .silent()
      .send();
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await this.httpBuilder
      .request<{ res: null; message: string; code: number }>()
      .post()
      .url(`${this.baseUrl}/forgot-password`)
      .body(data)
      .silent()
      .send();
  }

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await this.httpBuilder
      .request<{ res: null; message: string; code: number }>()
      .post()
      .url(`${this.baseUrl}/reset-password`)
      .body(data)
      .silent()
      .send();
  }

  logout(): void {
    this.stopExpirationTimer();
    this.clearTokens();
    this.user.set(null);
    this.userPermissions.set([]);
    this.isSuperAdmin.set(false);
    this.sessionExpired.set(false);
    void this.router.navigate(['/auth']);
  }

  // ─── TOKEN REFRESH ────────────────────────────────────────────────────────

  async refresh(): Promise<RefreshTokenResponse> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this._doRefresh();

    try {
      return await this.refreshPromise;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async _doRefresh(): Promise<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');

    const body: RefreshTokenRequest = { refreshToken };

    const response = await this.httpBuilder
      .request<RefreshTokenResponse>()
      .post()
      .url(`${this.baseUrl}/refresh`)
      .body(body)
      .silent()
      .send();

    this.setTokens(response.access_token, response.refresh_token ?? refreshToken);
    this.loadPermissionsFromToken(response.access_token);
    this.startExpirationTimer();
    return response;
  }

  async refreshWithRetry(retries = 3): Promise<RefreshTokenResponse> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.refresh();
      } catch (err) {
        if (attempt === retries) throw err;
        // Backoff exponencial: 1s, 2s, 4s
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
      }
    }
    throw new Error('All refresh attempts failed');
  }

  // ─── EXPIRATION TIMER ─────────────────────────────────────────────────────

  private startExpirationTimer(): void {
    this.stopExpirationTimer();
    const decoded = this.decodeToken(this.getToken());
    if (!decoded?.exp) return;

    const expiresIn = decoded.exp * 1000 - Date.now();
    const refreshBefore = 5 * 60 * 1000; // 5 minutos antes
    const timeout = Math.max(expiresIn - refreshBefore, 0);

    this.expirationTimer = setTimeout(async () => {
      try {
        await this.refreshWithRetry();
      } catch {
        this.sessionExpired.set(true);
      }
    }, timeout);
  }

  private stopExpirationTimer(): void {
    if (this.expirationTimer) {
      clearTimeout(this.expirationTimer);
      this.expirationTimer = null;
    }
  }

  // ─── SESSION RESTORE ──────────────────────────────────────────────────────

  private restoreSession(): void {
    const token = this.getToken();
    const userJson = localStorage.getItem('auth_user');

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User;
        this.user.set(user);
        this.loadPermissionsFromToken(token);

        if (!this.isTokenExpired()) {
          this.startExpirationTimer();
        } else if (!this.isRefreshTokenExpired()) {
          this.refreshWithRetry().catch(() => this.sessionExpired.set(true));
        } else {
          this.sessionExpired.set(true);
        }
      } catch {
        this.clearTokens();
      }
    }
  }
}
