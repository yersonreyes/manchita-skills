import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProjectPhaseController } from './project-phase.controller';
import { ProjectPhaseService } from './project-phase.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectPhaseController],
  providers: [ProjectPhaseService],
})
export class ProjectPhaseModule {}
