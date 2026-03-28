import { Component, OnChanges, inject, input, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { ToolApplicationService } from '@core/services/toolApplicationService/tool-application.service';
import { AiService } from '@core/services/aiService/ai.service';
import { AiMessageDto } from '@core/services/aiService/ai.req.dto';
import { AiSessionDto, AiAnalysisDto } from '@core/services/aiService/ai.res.dto';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [FormsModule, NgClass, Button, InputText],
  templateUrl: './ai-chat.html',
  styleUrl: './ai-chat.sass',
})
export class AiChatComponent implements OnChanges {
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
  canRequestAnalysis = computed(() => (this.aiSession()?.turnCount ?? 0) >= 1);
  messages = computed(() => this.aiSession()?.messages ?? []);

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnChanges(): void {
    const app = this.application();
    if (app) {
      const raw = app.structuredData as any;
      this.aiSession.set(raw?.aiSession ?? null);
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

    // El mensaje inicial del usuario activa el primer turno de la IA
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

      const now = new Date().toISOString();
      const updatedSession: AiSessionDto = {
        ...session,
        status: 'analyzed',
        analysis: res.analysis,
        updatedAt: now,
      };

      await this.persistSession(updatedSession);
    } catch {
      // Error manejado por el builder
    } finally {
      this.analyzing.set(false);
    }
  }

  // ─── Helpers privados ──────────────────────────────────────────────────────
  private async doSendMessage(session: AiSessionDto, userContent: string): Promise<void> {
    const app = this.application();
    if (!app) return;

    this.sending.set(true);

    // Agregar mensaje usuario de inmediato (UX optimista)
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

      const assistantMsg: AiMessageDto = { role: 'assistant', content: res.assistantMessage };
      const updatedSession: AiSessionDto = {
        ...optimisticSession,
        messages: [...optimisticSession.messages, assistantMsg],
        turnCount: res.turnCount,
        updatedAt: new Date().toISOString(),
      };

      await this.persistSession(updatedSession);
    } catch {
      // Revertir mensaje optimista si falla
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
