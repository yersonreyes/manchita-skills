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
import { PersonaController } from './persona/persona.controller';
import { PersonaAnalyzeService } from './persona/persona-analyze.service';
import { MapaEmpatiaController } from './mapa-empatia/mapa-empatia.controller';
import { MapaEmpatiaAnalyzeService } from './mapa-empatia/mapa-empatia-analyze.service';
import { CustomerJourneyMapController } from './customer-journey-map/customer-journey-map.controller';
import { CustomerJourneyMapAnalyzeService } from './customer-journey-map/customer-journey-map-analyze.service';
import { BenchmarkingController } from './benchmarking/benchmarking.controller';
import { BenchmarkingAnalyzeService } from './benchmarking/benchmarking-analyze.service';
import { BusquedaMediosController } from './busqueda-medios/busqueda-medios.controller';
import { BusquedaMediosAnalyzeService } from './busqueda-medios/busqueda-medios-analyze.service';
import { BuzzReportController } from './buzz-report/buzz-report.controller';
import { BuzzReportAnalyzeService } from './buzz-report/buzz-report-analyze.service';
import { EntrevistaCualitativaController } from './entrevista-cualitativa/entrevista-cualitativa.controller';
import { EntrevistaCualitativaAnalyzeService } from './entrevista-cualitativa/entrevista-cualitativa-analyze.service';
import { EntrevistaExpertoController } from './entrevista-experto/entrevista-experto.controller';
import { EntrevistaExpertoAnalyzeService } from './entrevista-experto/entrevista-experto-analyze.service';
import { FocusGroupController } from './focus-group/focus-group.controller';
import { FocusGroupAnalyzeService } from './focus-group/focus-group-analyze.service';
import { FotoVideoEtnografiaController } from './foto-video-etnografia/foto-video-etnografia.controller';
import { FotoVideoEtnografiaAnalyzeService } from './foto-video-etnografia/foto-video-etnografia-analyze.service';
import { InvestigacionRemotaController } from './investigacion-remota/investigacion-remota.controller';
import { InvestigacionRemotaAnalyzeService } from './investigacion-remota/investigacion-remota-analyze.service';
import { ClienteMisteriosoController } from './cliente-misterioso/cliente-misterioso.controller';
import { ClienteMisteriosoAnalyzeService } from './cliente-misterioso/cliente-misterioso-analyze.service';
import { Perspectiva360Controller } from './perspectiva-360/perspectiva-360.controller';
import { Perspectiva360AnalyzeService } from './perspectiva-360/perspectiva-360-analyze.service';

@Module({
  imports: [AiModule, PrismaModule],
  controllers: [CincoPorquesController, BmcController, FodaController, ProjectBriefController, DiagnosticoIndustriaController, AnalogosAntilogosController, InOutController, DiagramaSistemaController, StakeholderMapController, RolePlayController, PersonaController, MapaEmpatiaController, CustomerJourneyMapController, BenchmarkingController, BusquedaMediosController, BuzzReportController, EntrevistaCualitativaController, EntrevistaExpertoController, FocusGroupController, FotoVideoEtnografiaController, InvestigacionRemotaController, ClienteMisteriosoController, Perspectiva360Controller],
  providers: [CincoPorquesChatService, CincoPorquesAnalyzeService, BmcAnalyzeService, FodaAnalyzeService, ProjectBriefChatService, ProjectBriefGenerateService, DiagnosticoIndustriaAnalyzeService, AnalogosAntilogosAnalyzeService, InOutAnalyzeService, DiagramaSistemaAnalyzeService, StakeholderMapAnalyzeService, RolePlayChatService, RolePlayAnalyzeService, PersonaAnalyzeService, MapaEmpatiaAnalyzeService, CustomerJourneyMapAnalyzeService, BenchmarkingAnalyzeService, BusquedaMediosAnalyzeService, BuzzReportAnalyzeService, EntrevistaCualitativaAnalyzeService, EntrevistaExpertoAnalyzeService, FocusGroupAnalyzeService, FotoVideoEtnografiaAnalyzeService, InvestigacionRemotaAnalyzeService, ClienteMisteriosoAnalyzeService, Perspectiva360AnalyzeService],
})
export class ToolHubModule {}
