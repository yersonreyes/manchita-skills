import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { PrismaModule } from '../prisma/prisma.module';
import { CincoPorquesController } from './cinco-porques/cinco-porques.controller';
import { CincoPorquesChatService } from './cinco-porques/cinco-porques-chat.service';
import { CincoPorquesAnalyzeService } from './cinco-porques/cinco-porques-analyze.service';
import { BmcController } from './business-model-canvas/bmc.controller';
import { BmcAnalyzeService } from './business-model-canvas/bmc-analyze.service';
import { FodaController } from './foda/foda.controller';
import { FodaAnalyzeService } from './foda/foda-analyze.service';

@Module({
  imports: [AiModule, PrismaModule],
  controllers: [CincoPorquesController, BmcController, FodaController],
  providers: [CincoPorquesChatService, CincoPorquesAnalyzeService, BmcAnalyzeService, FodaAnalyzeService],
})
export class ToolHubModule {}
