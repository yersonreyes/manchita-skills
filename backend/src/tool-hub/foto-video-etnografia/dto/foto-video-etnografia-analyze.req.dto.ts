import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class FotoVideoRegistroDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tipo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() titulo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() url?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lugar?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sujeto?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() observacion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() insight?: string;
}

export class FotoVideoEtnografiaDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() objetivo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contexto?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fechasSalida?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() equipo?: string;
  @ApiProperty({ type: [FotoVideoRegistroDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FotoVideoRegistroDto)
  registros: FotoVideoRegistroDto[];
  @ApiPropertyOptional() @IsOptional() @IsString() patronesVisuales?: string;
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  citasVisuales: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() observaciones?: string;
}

export class FotoVideoEtnografiaAnalyzeReqDto {
  @ApiProperty() @IsNumber() toolApplicationId: number;
  @ApiProperty({ type: FotoVideoEtnografiaDataDto })
  @ValidateNested()
  @Type(() => FotoVideoEtnografiaDataDto)
  data: FotoVideoEtnografiaDataDto;
  @ApiProperty() @IsNumber() currentVersion: number;
}
