import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class WhatIfPreguntaDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() pregunta?: string;
  @ApiPropertyOptional() @IsOptional() @IsIn(['inversion', 'extremo', 'tecnologico', 'usuario', 'competitivo', 'contextual', '']) tipo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() exploracion?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() seleccionada?: boolean;
}

export class WhatIfDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() contexto?: string;
  @ApiProperty({ type: [WhatIfPreguntaDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => WhatIfPreguntaDto) preguntas: WhatIfPreguntaDto[];
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) insightsClave?: string[];
}

export class WhatIfAnalyzeReqDto {
  @ApiProperty() @IsNumber() toolApplicationId: number;
  @ApiProperty({ type: WhatIfDataDto }) @ValidateNested() @Type(() => WhatIfDataDto) data: WhatIfDataDto;
  @ApiProperty() @IsNumber() currentVersion: number;
}
