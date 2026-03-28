import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DesignPhaseController } from './design-phase.controller';
import { DesignPhaseService } from './design-phase.service';

@Module({
  imports: [PrismaModule],
  controllers: [DesignPhaseController],
  providers: [DesignPhaseService],
})
export class DesignPhaseModule {}
