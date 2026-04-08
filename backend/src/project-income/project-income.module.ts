import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailModule } from 'src/mail/mail.module';
import { ProjectIncomeController } from './project-income.controller';
import { ProjectIncomeService } from './project-income.service';
import { IncomeAlertService } from './income-alert.service';

@Module({
  imports: [PrismaModule, MailModule, ScheduleModule.forRoot()],
  controllers: [ProjectIncomeController],
  providers: [ProjectIncomeService, IncomeAlertService],
  exports: [ProjectIncomeService],
})
export class ProjectIncomeModule {}
