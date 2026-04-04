import { Type } from 'class-transformer';
import { IsArray, IsInt, IsString, Min, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class HipotesisDtoReq {
  @ApiProperty({ example: 'uuid-v4' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Si implementamos checkout express, entonces reduciremos abandono un 20%, porque los usuarios abandonan en el paso de datos de envío.' })
  @IsString()
  formulacion: string;

  @ApiProperty({ example: 'alto', enum: ['alto', 'bajo'] })
  @IsString()
  impacto: string;

  @ApiProperty({ example: 'alta', enum: ['alta', 'baja'] })
  @IsString()
  incertidumbre: string;

  @ApiProperty({ example: 'A/B test con 500 usuarios durante 2 semanas midiendo tasa de abandono en el paso 3.' })
  @IsString()
  experimento: string;
}

export class MatrizHipotesisDataDto {
  @ApiProperty({ example: 'Hipótesis generadas en la fase de Definición para validar las principales asunciones del rediseño de checkout.' })
  @IsString()
  contexto: string;

  @ApiProperty({ type: [HipotesisDtoReq] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HipotesisDtoReq)
  hipotesis: HipotesisDtoReq[];
}

export class MatrizHipotesisAnalyzeReqDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  toolApplicationId: number;

  @ApiProperty({ type: MatrizHipotesisDataDto })
  @ValidateNested()
  @Type(() => MatrizHipotesisDataDto)
  data: MatrizHipotesisDataDto;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  currentVersion: number;
}
