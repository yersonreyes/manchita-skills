import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';
import { AI_PROVIDER } from './constants/ai.constants';
import { createAiProvider } from './providers/ai-provider.factory';

@Module({
  providers: [
    {
      provide: AI_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => createAiProvider(config),
    },
    AiService,
  ],
  exports: [AiService],
})
export class AiModule {}
