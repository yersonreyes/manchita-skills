import { ConfigService } from '@nestjs/config';
import { AnthropicProvider } from './anthropic.provider';
import { OpenAiProvider } from './openai.provider';
import { MinimaxProvider } from './minimax.provider';
import { IAiProvider } from './ai-provider.interface';

export function createAiProvider(config: ConfigService): IAiProvider {
  const provider = config.get<string>('AI_PROVIDER', 'anthropic');

  switch (provider) {
    case 'openai':
      return new OpenAiProvider(
        config.get<string>('OPENAI_API_KEY'),
        config.get<string>('OPENAI_MODEL'),
      );

    case 'minimax':
      return new MinimaxProvider(
        config.get<string>('MINIMAX_API_KEY'),
        config.get<string>('MINIMAX_GROUP_ID'),
        config.get<string>('MINIMAX_MODEL'),
      );

    case 'anthropic':
    default:
      return new AnthropicProvider(
        config.get<string>('ANTHROPIC_API_KEY'),
        config.get<string>('ANTHROPIC_MODEL'),
      );
  }
}
