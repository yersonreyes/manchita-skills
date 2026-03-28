import { AiMessage, IAiProvider } from './ai-provider.interface';

export class MinimaxProvider implements IAiProvider {
  readonly name = 'minimax';
  private readonly baseUrl = 'https://api.minimax.chat/v1';

  constructor(
    private readonly apiKey: string,
    private readonly groupId: string,
    private readonly model = 'MiniMax-Text-01',
  ) {}

  async chat(messages: AiMessage[], systemPrompt: string, maxTokens = 512): Promise<string> {
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
      throw new Error(`Minimax API error: ${response.statusText}`);
    }

    const data = (await response.json()) as { reply?: string };
    return data.reply ?? '';
  }
}
