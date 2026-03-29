import { Component, OnChanges, inject, input, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { AiService } from '@core/services/aiService/ai.service';
import { AiMessageDto } from '@core/services/aiService/ai.req.dto';
import { AiSessionDto } from '@core/services/aiService/ai.res.dto';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-cinco-porques',
  standalone: true,
  imports: [FormsModule, Button, InputText, Tooltip],
  templateUrl: './cinco-porques.component.html',
  styleUrl: './cinco-porques.component.sass',
})
export class CincoPorquesComponent implements OnChanges {
  private readonly aiService = inject(AiService);
  private readonly toolApplicationService = inject(ToolApplicationService);
  private readonly uiDialog = inject(UiDialogService);

  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();

  // ─── Estado ──────────────────────────────────────────────────────────────
  aiSession = signal<AiSessionDto | null>(null);
  userInput = signal('');
  contextInput = signal('');
  sending = signal(false);
  analyzing = signal(false);

  // ─── Computed ─────────────────────────────────────────────────────────────
  hasSession = computed(() => !!this.aiSession());
  isAnalyzed = computed(() => this.aiSession()?.status === 'analyzed');
  canRequestAnalysis = computed(() => (this.aiSession()?.turnCount ?? 0) >= 3);
  messages = computed(() => this.aiSession()?.messages ?? []);

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnChanges(): void {
    const app = this.application();
    if (app) {
      const raw = app.structuredData as Record<string, unknown>;
      this.aiSession.set((raw?.['aiSession'] as AiSessionDto) ?? null);
    }
  }

  // ─── Acciones ─────────────────────────────────────────────────────────────
  async startSession(): Promise<void> {
    const context = this.contextInput().trim();
    if (!context) return;

    const app = this.application();
    if (!app) return;

    const now = new Date().toISOString();
    const newSession: AiSessionDto = {
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

    await this.doSendMessage(newSession, context);
    this.contextInput.set('');
  }

  async sendMessage(): Promise<void> {
    const content = this.userInput().trim();
    if (!content || this.sending()) return;

    const session = this.aiSession();
    if (!session) return;

    await this.doSendMessage(session, content);
    this.userInput.set('');
  }

  async clearSession(): Promise<void> {
    const confirmed = await this.uiDialog.confirm({
      header: 'Limpiar conversación',
      message: '¿Estás seguro? Se perderán todos los mensajes y el análisis de esta sesión.',
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

  async requestAnalysis(): Promise<void> {
    const session = this.aiSession();
    const app = this.application();
    if (!session || !app || this.analyzing()) return;

    this.analyzing.set(true);
    try {
      const res = await this.aiService.analyze({
        toolApplicationId: app.id,
        history: session.messages,
      });

      const updatedSession: AiSessionDto = {
        ...session,
        status: 'analyzed',
        analysis: res.analysis,
        updatedAt: new Date().toISOString(),
      };

      await this.persistSession(updatedSession);
    } catch (error) {
      this.uiDialog.showError('Error', `No se pudo generar el análisis: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      this.analyzing.set(false);
    }
  }

  // ─── Helpers privados ──────────────────────────────────────────────────────
  private async doSendMessage(session: AiSessionDto, userContent: string): Promise<void> {
    const app = this.application();
    if (!app) return;

    this.sending.set(true);

    const userMsg: AiMessageDto = { role: 'user', content: userContent };
    const optimisticSession: AiSessionDto = {
      ...session,
      messages: [...session.messages, userMsg],
      updatedAt: new Date().toISOString(),
    };
    this.aiSession.set(optimisticSession);

    try {
      const res = await this.aiService.sendMessage({
        toolApplicationId: app.id,
        userMessage: userContent,
        history: session.messages,
      });

      if (!res.assistantMessage?.trim()) {
        this.uiDialog.showError('Error', 'El AI no retornó una respuesta. Intenta nuevamente.');
        this.aiSession.set(session);
        return;
      }

      const assistantMsg: AiMessageDto = { role: 'assistant', content: res.assistantMessage };
      const updatedSession: AiSessionDto = {
        ...optimisticSession,
        messages: [...optimisticSession.messages, assistantMsg],
        turnCount: res.turnCount,
        updatedAt: new Date().toISOString(),
      };

      await this.persistSession(updatedSession);
    } catch (error) {
      this.uiDialog.showError('Error', `No se pudo enviar el mensaje: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      this.aiSession.set(session);
    } finally {
      this.sending.set(false);
    }
  }

  private async persistSession(session: AiSessionDto): Promise<void> {
    const app = this.application();
    if (!app) return;

    const currentData = (app.structuredData as Record<string, unknown>) ?? {};
    await this.toolApplicationService.update(app.id, {
      structuredData: { ...currentData, aiSession: session },
    });

    this.aiSession.set(session);
    this.sessionSaved.emit();
  }
}
