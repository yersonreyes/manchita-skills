import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TaskStatusModule } from 'src/task-status/task-status.module';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';

@Module({
  imports: [PrismaModule, TaskStatusModule],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
