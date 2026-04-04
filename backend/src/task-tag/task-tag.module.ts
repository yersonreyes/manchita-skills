import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TaskTagController } from './task-tag.controller';
import { TaskTagService } from './task-tag.service';

@Module({
  imports: [PrismaModule],
  controllers: [TaskTagController],
  providers: [TaskTagService],
})
export class TaskTagModule {}
