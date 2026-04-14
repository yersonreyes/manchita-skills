import { AiMessage, IAiProvider } from './ai-provider.interface';

interface MinimaxChoice {
  message?: { content?: string };
  messages?: Array<{ sender_type?: string; text?: string }>;
  finish_reason?: string;
}

interface MinimaxChatResponse {
  choices?: MinimaxChoice[];
  reply?: string;
}

export class MinimaxProvider implements IAiProvider {
  readonly name = 'minimax';
  private readonly baseUrl = 'https://api.minimaxi.chat/v1';

  constructor(
    private readonly apiKey: string,
    private readonly groupId?: string,
    private readonly model = 'abab6.5s-chat',
  ) {
    console.log(
      `[MinimaxProvider] Initialized with key: ${apiKey?.substring(0, 10)}...`,
    );
    console.log(`[MinimaxProvider] GroupId: ${groupId || 'not provided'}`);
  }

  async chat(
    messages: AiMessage[],
    systemPrompt: string,
    maxTokens = 512,
  ): Promise<string> {
    // sk-cp-* claves son OpenAI-compatible y SIEMPRE usan el endpoint OpenAI, ignoring GroupId
    // Claves sin sk-cp-* usan el endpoint propietario si hay GroupId
    console.log(
      '[MinimaxProvider:chat] systemPrompt:',
      systemPrompt.substring(0, 100) + '...',
    );
    console.log('[MinimaxProvider:chat] messages count:', messages.length);
    console.log('[MinimaxProvider:chat] maxTokens:', maxTokens);

    if (this.apiKey.startsWith('sk-cp-')) {
      console.log(
        '[MinimaxProvider] Detected sk-cp-* key, using OpenAI-compatible endpoint',
      );
      return this.chatOpenAiEndpoint(messages, systemPrompt, maxTokens);
    }
    return this.groupId
      ? this.chatProprietaryEndpoint(messages, systemPrompt, maxTokens)
      : this.chatOpenAiEndpoint(messages, systemPrompt, maxTokens);
  }

  // ─── Endpoint OpenAI-compatible (/v1/chat/completions) ───────────────────────
  // Usado con claves sk-cp-* sin GroupId
  // Minimax requiere Authorization: <KEY> (sin Bearer)
  private async chatOpenAiEndpoint(
    messages: AiMessage[],
    systemPrompt: string,
    maxTokens: number,
  ): Promise<string> {
    console.log(
      '[MinimaxProvider:OpenAI] Using endpoint: /v1/chat/completions',
    );
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.log('[MinimaxProvider:OpenAI] Error response:', error);
      throw new Error(`Minimax API error ${response.status}: ${error}`);
    }

    const data = (await response.json()) as MinimaxChatResponse;
    console.log('[MinimaxProvider:OpenAI] Response:', JSON.stringify(data));
    const content = this.stripThinkBlocks(
      data.choices?.[0]?.message?.content ?? '',
    );
    console.log('[MinimaxProvider:OpenAI] Extracted content:', content);
    return content;
  }

  // ─── Endpoint propietario (/v1/text/chatcompletion_pro) ──────────────────────
  // Usado con GroupId (claves más antiguas)
  private async chatProprietaryEndpoint(
    messages: AiMessage[],
    systemPrompt: string,
    maxTokens: number,
  ): Promise<string> {
    const url = `${this.baseUrl}/text/chatcompletion_pro?GroupId=${this.groupId}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        tokens_to_generate: maxTokens,
        messages: [
          { sender_type: 'SYSTEM', sender_name: 'System', text: systemPrompt },
          ...messages.map((m) => ({
            sender_type: m.role === 'user' ? 'USER' : 'BOT',
            sender_name: m.role === 'user' ? 'Usuario' : 'Asistente',
            text: m.content,
          })),
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Minimax API error ${response.status}: ${error}`);
    }

    const data = (await response.json()) as MinimaxChatResponse;
    console.log(
      '[MinimaxProvider:Proprietary] Response:',
      JSON.stringify(data),
    );
    const content = data.reply ?? '';
    console.log('[MinimaxProvider:Proprietary] Extracted content:', content);
    return content;
  }

  // ─── Fallback endpoint para sk-cp-* sin GroupId ────────────────────────────────
  // Intenta el endpoint propietario con "user" como GroupId por defecto
  private async chatWithBearerToken(
    messages: AiMessage[],
    systemPrompt: string,
    maxTokens: number,
  ): Promise<string> {
    const fallbackGroupId = 'user';
    const url = `${this.baseUrl}/text/chatcompletion_pro?GroupId=${fallbackGroupId}`;

    console.log(
      '[MinimaxProvider:Fallback] Using fallback GroupId:',
      fallbackGroupId,
    );

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        tokens_to_generate: maxTokens,
        messages: [
          { sender_type: 'SYSTEM', sender_name: 'System', text: systemPrompt },
          ...messages.map((m) => ({
            sender_type: m.role === 'user' ? 'USER' : 'BOT',
            sender_name: m.role === 'user' ? 'Usuario' : 'Asistente',
            text: m.content,
          })),
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Minimax API error ${response.status}: ${error}`);
    }

    const data = (await response.json()) as MinimaxChatResponse;
    console.log('[MinimaxProvider:Fallback] Response:', JSON.stringify(data));
    const content = this.stripThinkBlocks(data.reply ?? '');
    console.log('[MinimaxProvider:Fallback] Extracted content:', content);
    return content;
  }

  private stripThinkBlocks(text: string): string {
    return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  }
}
