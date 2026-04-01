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
import { ProjectBriefController } from './project-brief/project-brief.controller';
import { ProjectBriefChatService } from './project-brief/project-brief-chat.service';
import { ProjectBriefGenerateService } from './project-brief/project-brief-generate.service';
import { DiagnosticoIndustriaController } from './diagnostico-industria/diagnostico-industria.controller';
import { DiagnosticoIndustriaAnalyzeService } from './diagnostico-industria/diagnostico-industria-analyze.service';
import { AnalogosAntilogosController } from './analogos-antilogos/analogos-antilogos.controller';
import { AnalogosAntilogosAnalyzeService } from './analogos-antilogos/analogos-antilogos-analyze.service';
import { InOutController } from './in-out/in-out.controller';
import { InOutAnalyzeService } from './in-out/in-out-analyze.service';
import { DiagramaSistemaController } from './diagrama-sistema/diagrama-sistema.controller';
import { DiagramaSistemaAnalyzeService } from './diagrama-sistema/diagrama-sistema-analyze.service';
import { StakeholderMapController } from './stakeholder-map/stakeholder-map.controller';
import { StakeholderMapAnalyzeService } from './stakeholder-map/stakeholder-map-analyze.service';
import { RolePlayController } from './role-play/role-play.controller';
import { RolePlayChatService } from './role-play/role-play-chat.service';
import { RolePlayAnalyzeService } from './role-play/role-play-analyze.service';

@Module({
  imports: [AiModule, PrismaModule],
  controllers: [CincoPorquesController, BmcController, FodaController, ProjectBriefController, DiagnosticoIndustriaController, AnalogosAntilogosController, InOutController, DiagramaSistemaController, StakeholderMapController, RolePlayController],
  providers: [CincoPorquesChatService, CincoPorquesAnalyzeService, BmcAnalyzeService, FodaAnalyzeService, ProjectBriefChatService, ProjectBriefGenerateService, DiagnosticoIndustriaAnalyzeService, AnalogosAntilogosAnalyzeService, InOutAnalyzeService, DiagramaSistemaAnalyzeService, StakeholderMapAnalyzeService, RolePlayChatService, RolePlayAnalyzeService],
})
export class ToolHubModule {}
