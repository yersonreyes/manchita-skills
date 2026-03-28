import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ToolCategoryController } from './tool-category.controller';
import { ToolCategoryService } from './tool-category.service';

@Module({
  imports: [PrismaModule],
  controllers: [ToolCategoryController],
  providers: [ToolCategoryService],
})
export class ToolCategoryModule {}
