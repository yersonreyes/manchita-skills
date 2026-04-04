import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TaskActivityController } from './task-activity.controller';
import { TaskActivityService } from './task-activity.service';

@Module({
  imports: [PrismaModule],
  controllers: [TaskActivityController],
  providers: [TaskActivityService],
})
export class TaskActivityModule {}
