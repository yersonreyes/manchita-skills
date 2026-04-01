import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { RolePlayService } from '@core/services/rolePlayService/role-play.service';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import {
  EMPTY_ROLE_PLAY,
  ROL_TIPO_LABELS,
  RolDto,
  RolTipo,
  RolePlayData,
  RolePlayMessageDto,
  RolePlaySessionDto,
} from './role-play.types';

@Component({
  selector: 'app-role-play-tool',
  standalone: true,
  imports: [FormsModule, Button, InputText, Tooltip],
  templateUrl: './role-play-tool.component.html',
  styleUrl: './role-play-tool.component.sass',
})
export class RolePlayToolComponent implements OnChanges {
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly rolePlayService = inject(RolePlayService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  // ─── Estado ───────────────────────────────────────────────────────────────
  data = signal<RolePlayData>({ ...EMPTY_ROLE_PLAY });
  aiSession = signal<RolePlaySessionDto | null>(null);
  userInput = signal('');
  sending = signal(false);
  analyzing = signal(false);

  // ─── Opciones de tipo de rol ───────────────────────────────────────────────
  readonly rolTipoOptions = Object.entries(ROL_TIPO_LABELS).map(([value, label]) => ({
    value: value as RolTipo,
    label,
  }));

  // ─── Computed ─────────────────────────────────────────────────────────────
  hasSession = computed(() => !!this.aiSession());
  isAnalyzed = computed(() => this.aiSession()?.status === 'analyzed');
  messages = computed(() => this.aiSession()?.messages ?? []);
  canRequestAnalysis = computed(() => (this.aiSession()?.turnCount ?? 0) >= 3);

  canStart = computed(() => {
    const d = this.data();
    return (
      d.escenario.titulo.trim().length > 0 &&
      d.escenario.descripcion.trim().length > 0 &&
      d.roles.length > 0 &&
      d.roles.every((r) => r.nombre.trim().length > 0)
    );
  });

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnChanges(): void {
    const app = this.application();
    if (!app) return;
    const raw = (app.structuredData as Record<string, unknown>) ?? {};
    this.data.set((raw['data'] as RolePlayData) ?? { ...EMPTY_ROLE_PLAY });
    this.aiSession.set((raw['aiSession'] as RolePlaySessionDto) ?? null);
  }

  // ─── Escenario ────────────────────────────────────────────────────────────
  onEscenarioChange(field: keyof RolePlayData['escenario'], value: string): void {
    this.data.set({
      ...this.data(),
      escenario: { ...this.data().escenario, [field]: value },
    });
    this.scheduleSave();
  }

  // ─── Roles ────────────────────────────────────────────────────────────────
  addRol(): void {
    const newRol: RolDto = {
      id: crypto.randomUUID(),
      nombre: '',
      tipo: 'usuario-primario',
      descripcion: '',
      brief: '',
    };
    this.data.set({ ...this.data(), roles: [...this.data().roles, newRol] });
    this.scheduleSave();
  }

  removeRol(index: number): void {
    const roles = this.data().roles.filter((_, i) => i !== index);
    this.data.set({ ...this.data(), roles });
    this.scheduleSave();
  }

  onRolChange(index: number, field: keyof RolDto, value: string): void {
    const roles = this.data().roles.map((r, i) =>
      i === index ? { ...r, [field]: value } : r
    );
    this.data.set({ ...this.data(), roles });
    this.scheduleSave();
  }

  // ─── Simulación ───────────────────────────────────────────────────────────
  async startSimulation(): Promise<void> {
    if (!this.canStart() || this.sending()) return;
    const app = this.application();
    if (!app) return;

    const now = new Date().toISOString();
    const newSession: RolePlaySessionDto = {
      sessionId: crypto.randomUUID(),
      toolId: app.toolId,
      toolNombre: app.tool?.nombre ?? '',
      createdAt: now,
      updatedAt: now,
      status: 'active',
      turnCount: 0,
      messages: [],
      analysis: null,
    };

    await this.doSendMessage(newSession, this.buildInitialMessage(this.data()));
  }

  async sendMessage(): Promise<void> {
    const content = this.userInput().trim();
    if (!content || this.sending()) return;
    const session = this.aiSession();
    if (!session) return;
    await this.doSendMessage(session, content);
    this.userInput.set('');
  }

  async requestAnalysis(): Promise<void> {
    const session = this.aiSession();
    const app = this.application();
    if (!session || !app || this.analyzing()) return;

    this.analyzing.set(true);
    try {
      const res = await this.rolePlayService.analyze({
        toolApplicationId: app.id,
        history: session.messages,
      });

      const updatedSession: RolePlaySessionDto = {
        ...session,
        status: 'analyzed',
        analysis: res.analysis,
        updatedAt: new Date().toISOString(),
      };

      await this.persistSession(updatedSession);
    } catch (error) {
      this.uiDialog.showError(
        'Error',
        `No se pudo generar el análisis: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      );
    } finally {
      this.analyzing.set(false);
    }
  }

  async clearSession(): Promise<void> {
    const confirmed = await this.uiDialog.confirm({
      header: 'Limpiar simulación',
      message: '¿Estás seguro? Se perderán todos los mensajes y el análisis. El escenario y los roles se conservan.',
      icon: 'pi pi-exclamation-triangle',
    });
    if (!confirmed) return;

    const app = this.application();
    if (!app) return;

    const { aiSession: _, ...rest } = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, { structuredData: rest });

    this.aiSession.set(null);
    this.sessionSaved.emit();
  }

  // ─── Helpers privados ──────────────────────────────────────────────────────
  private buildInitialMessage(data: RolePlayData): string {
    const { escenario, roles } = data;
    const rolesText = roles
      .map(
        (r) =>
          `- ${r.nombre} (${ROL_TIPO_LABELS[r.tipo]})${r.descripcion ? ': ' + r.descripcion : ''}${r.brief ? '\n  Brief: ' + r.brief : ''}`,
      )
      .join('\n');

    return `ESCENARIO: ${escenario.titulo}
Descripción: ${escenario.descripcion}
Objetivo: ${escenario.objetivo}

ROLES:
${rolesText}

Iniciá la simulación del Role Play.`;
  }

  private async doSendMessage(session: RolePlaySessionDto, userContent: string): Promise<void> {
    const app = this.application();
    if (!app) return;

    this.sending.set(true);

    const userMsg: RolePlayMessageDto = { role: 'user', content: userContent };
    const optimisticSession: RolePlaySessionDto = {
      ...session,
      messages: [...session.messages, userMsg],
      updatedAt: new Date().toISOString(),
    };
    this.aiSession.set(optimisticSession);

    try {
      const res = await this.rolePlayService.sendMessage({
        toolApplicationId: app.id,
        userMessage: userContent,
        history: session.messages,
      });

      if (!res.assistantMessage?.trim()) {
        this.uiDialog.showError('Error', 'El AI no retornó una respuesta. Intentá nuevamente.');
        this.aiSession.set(session);
        return;
      }

      const assistantMsg: RolePlayMessageDto = { role: 'assistant', content: res.assistantMessage };
      const updatedSession: RolePlaySessionDto = {
        ...optimisticSession,
        messages: [...optimisticSession.messages, assistantMsg],
        turnCount: res.turnCount,
        updatedAt: new Date().toISOString(),
      };

      await this.persistSession(updatedSession);
    } catch (error) {
      this.uiDialog.showError(
        'Error',
        `No se pudo enviar el mensaje: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      );
      this.aiSession.set(session);
    } finally {
      this.sending.set(false);
    }
  }

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  private scheduleSave(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => void this.saveData(), 800);
  }

  private async saveData(): Promise<void> {
    const app = this.application();
    if (!app) return;
    const current = (app.structuredData as Record<string, unknown>) ?? {};
    try {
      await this.toolApplicationService.update(app.id, {
        structuredData: { ...current, data: this.data() },
      });
      this.sessionSaved.emit();
    } catch { /* silent */ }
  }

  private async persistSession(session: RolePlaySessionDto): Promise<void> {
    const app = this.application();
    if (!app) return;
    const current = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...current, aiSession: session },
    });
    this.aiSession.set(session);
    this.sessionSaved.emit();
  }
}
