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
  private readonly baseUrl = 'https://api.minimax.chat/v1';

  constructor(
    private readonly apiKey: string,
    private readonly groupId?: string,
    private readonly model = 'MiniMax-Text-01',
  ) {
    console.log(`[MinimaxProvider] Initialized with key: ${apiKey?.substring(0, 10)}...`);
    console.log(`[MinimaxProvider] GroupId: ${groupId || 'not provided'}`);
  }

  async chat(messages: AiMessage[], systemPrompt: string, maxTokens = 512): Promise<string> {
    // Las claves sk-cp-* parecen requerir el endpoint propietario incluso sin GroupId
    // O al menos ese es más estable. Intentamos con "user" como GroupId si no hay uno.
    console.log('[MinimaxProvider:chat] systemPrompt:', systemPrompt.substring(0, 100) + '...');
    console.log('[MinimaxProvider:chat] messages count:', messages.length);
    console.log('[MinimaxProvider:chat] maxTokens:', maxTokens);

    if (!this.groupId && this.apiKey.startsWith('sk-cp-')) {
      console.log('[MinimaxProvider] Detected sk-cp-* key without GroupId, using fallback endpoint');
      return this.chatWithBearerToken(messages, systemPrompt, maxTokens);
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
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: this.apiKey, // Solo la key, sin "Bearer"
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
      throw new Error(`Minimax API error ${response.status}: ${error}`);
    }

    const data = (await response.json()) as MinimaxChatResponse;
    console.log('[MinimaxProvider:OpenAI] Response:', JSON.stringify(data));
    const content = data.choices?.[0]?.message?.content ?? '';
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
    return data.reply ?? '';
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

    console.log('[MinimaxProvider:Fallback] Using fallback GroupId:', fallbackGroupId);

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
    const content = data.reply ?? '';
    console.log('[MinimaxProvider:Fallback] Extracted content:', content);
    return content;
  }
}
