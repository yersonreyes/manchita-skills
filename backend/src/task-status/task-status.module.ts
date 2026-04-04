import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TaskStatusController } from './task-status.controller';
import { TaskStatusService } from './task-status.service';

@Module({
  imports: [PrismaModule],
  controllers: [TaskStatusController],
  providers: [TaskStatusService],
  exports: [TaskStatusService],
})
export class TaskStatusModule {}
