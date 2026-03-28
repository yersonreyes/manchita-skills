import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ToolApplicationController } from './tool-application.controller';
import { ToolApplicationService } from './tool-application.service';

@Module({
  imports: [PrismaModule],
  controllers: [ToolApplicationController],
  providers: [ToolApplicationService],
})
export class ToolApplicationModule {}
