import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ToolController } from './tool.controller';
import { ToolService } from './tool.service';

@Module({
  imports: [PrismaModule],
  controllers: [ToolController],
  providers: [ToolService],
})
export class ToolModule {}
