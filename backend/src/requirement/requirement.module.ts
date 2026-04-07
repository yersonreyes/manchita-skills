import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RequirementController } from './requirement.controller';
import { RequirementService } from './requirement.service';

@Module({
  imports: [PrismaModule],
  controllers: [RequirementController],
  providers: [RequirementService],
})
export class RequirementModule {}
