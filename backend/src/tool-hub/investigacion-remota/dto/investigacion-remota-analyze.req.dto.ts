import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class MetodoRemotoDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tipo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() objetivo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() herramienta?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() participantes?: string;
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  hallazgos: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() notas?: string;
}

export class InvestigacionRemotaDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() objetivo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contexto?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fechas?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() equipo?: string;
  @ApiProperty({ type: [MetodoRemotoDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetodoRemotoDto)
  metodos: MetodoRemotoDto[];
  @ApiPropertyOptional() @IsOptional() @IsString() observaciones?: string;
}

export class InvestigacionRemotaAnalyzeReqDto {
  @ApiProperty() @IsNumber() toolApplicationId: number;
  @ApiProperty({ type: InvestigacionRemotaDataDto })
  @ValidateNested()
  @Type(() => InvestigacionRemotaDataDto)
  data: InvestigacionRemotaDataDto;
  @ApiProperty() @IsNumber() currentVersion: number;
}
