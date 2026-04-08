import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { AI_PROVIDER } from './constants/ai.constants';
import { IAiProvider, AiMessage } from './providers/ai-provider.interface';

@Injectable()
export class AiService {
  constructor(@Inject(AI_PROVIDER) private readonly provider: IAiProvider) {}

  async chat(
    messages: AiMessage[],
    systemPrompt: string,
    maxTokens = 512,
  ): Promise<string> {
    if (messages.length > 40) {
      throw new BadRequestException(
        'Historial demasiado largo — máximo 40 mensajes',
      );
    }

    console.log(
      '[AiService:chat] provider:',
      this.provider.name,
      '| messages:',
      messages.length,
    );
    const result = await this.provider.chat(messages, systemPrompt, maxTokens);
    console.log('[AiService:chat] response length:', result.length);

    return result;
  }
}
