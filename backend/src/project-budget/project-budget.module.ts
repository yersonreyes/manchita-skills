import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProjectBudgetController } from './project-budget.controller';
import { ProjectBudgetService } from './project-budget.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectBudgetController],
  providers: [ProjectBudgetService],
})
export class ProjectBudgetModule {}
