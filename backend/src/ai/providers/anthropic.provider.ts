import Anthropic from '@anthropic-ai/sdk';
import { AiMessage, IAiProvider } from './ai-provider.interface';

export class AnthropicProvider implements IAiProvider {
  readonly name = 'anthropic';
  private client: Anthropic;

  constructor(
    apiKey: string,
    private readonly model = 'claude-haiku-4-5-20251001',
  ) {
    this.client = new Anthropic({ apiKey });
  }

  async chat(
    messages: AiMessage[],
    systemPrompt: string,
    maxTokens = 512,
  ): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const content = response.content[0];
    return content.type === 'text' ? content.text : '';
  }
}
