import { Module } from '@nestjs/common';
import { DesignPhaseModule } from './design-phase/design-phase.module';
import { ToolCategoryModule } from './tool-category/tool-category.module';
import { ToolModule } from './tool/tool.module';

@Module({
  imports: [DesignPhaseModule, ToolCategoryModule, ToolModule],
})
export class CatalogModule {}
