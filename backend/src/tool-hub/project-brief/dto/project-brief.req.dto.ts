import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AiMessageDto {
  @ApiProperty({ enum: ['user', 'assistant'] })
  @IsString()
  role: 'user' | 'assistant';

  @ApiProperty()
  @IsString()
  content: string;
}

export class ProjectBriefContextDto {
  @ApiProperty()
  @IsString()
  nombre: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  tipo?: string | null;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  etapa?: string | null;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  sector?: string | null;
}

export class ProjectBriefChatReqDto {
  @ApiProperty({ type: [AiMessageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AiMessageDto)
  history: AiMessageDto[];

  @ApiProperty()
  @IsString()
  userMessage: string;

  @ApiProperty({ type: ProjectBriefContextDto })
  @ValidateNested()
  @Type(() => ProjectBriefContextDto)
  projectContext: ProjectBriefContextDto;
}

export class ProjectBriefGenerateReqDto {
  @ApiProperty({ type: [AiMessageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AiMessageDto)
  history: AiMessageDto[];

  @ApiProperty({ type: ProjectBriefContextDto })
  @ValidateNested()
  @Type(() => ProjectBriefContextDto)
  projectContext: ProjectBriefContextDto;
}
