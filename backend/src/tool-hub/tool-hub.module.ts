import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { PrismaModule } from '../prisma/prisma.module';
import { CincoPorquesController } from './cinco-porques/cinco-porques.controller';
import { CincoPorquesChatService } from './cinco-porques/cinco-porques-chat.service';
import { CincoPorquesAnalyzeService } from './cinco-porques/cinco-porques-analyze.service';

@Module({
  imports: [AiModule, PrismaModule],
  controllers: [CincoPorquesController],
  providers: [CincoPorquesChatService, CincoPorquesAnalyzeService],
})
export class ToolHubModule {}
