import { Type } from 'class-transformer';
import { IsArray, IsInt, IsString, Min, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FeedbackItemDtoReq {
  @ApiProperty() @IsString() id: string;
  @ApiProperty() @IsString() texto: string;
  @ApiProperty({ enum: ['testing', 'entrevista', 'analytics', 'stakeholder', 'soporte', 'otro'] })
  @IsString() fuente: string;
  @ApiProperty({ enum: ['urgente', 'normal', 'baja'] })
  @IsString() prioridad: string;
}

export class MatrizFeedbackDataDto {
  @ApiProperty() @IsString() contexto: string;

  @ApiProperty({ type: [FeedbackItemDtoReq] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => FeedbackItemDtoReq)
  reforzar: FeedbackItemDtoReq[];

  @ApiProperty({ type: [FeedbackItemDtoReq] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => FeedbackItemDtoReq)
  arreglar: FeedbackItemDtoReq[];

  @ApiProperty({ type: [FeedbackItemDtoReq] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => FeedbackItemDtoReq)
  insights: FeedbackItemDtoReq[];

  @ApiProperty({ type: [FeedbackItemDtoReq] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => FeedbackItemDtoReq)
  evaluar: FeedbackItemDtoReq[];
}

export class MatrizFeedbackAnalyzeReqDto {
  @ApiProperty({ example: 1 }) @IsInt() @Min(1)
  toolApplicationId: number;

  @ApiProperty({ type: MatrizFeedbackDataDto })
  @ValidateNested() @Type(() => MatrizFeedbackDataDto)
  data: MatrizFeedbackDataDto;

  @ApiProperty({ example: 0 }) @IsInt() @Min(0)
  currentVersion: number;
}
