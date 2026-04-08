import OpenAI from 'openai';
import { AiMessage, IAiProvider } from './ai-provider.interface';

export class OpenAiProvider implements IAiProvider {
  readonly name = 'openai';
  private client: OpenAI;

  constructor(
    apiKey: string,
    private readonly model = 'gpt-4o-mini',
  ) {
    this.client = new OpenAI({ apiKey });
  }

  async chat(
    messages: AiMessage[],
    systemPrompt: string,
    maxTokens = 512,
  ): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
    });

    return response.choices[0]?.message?.content ?? '';
  }
}
