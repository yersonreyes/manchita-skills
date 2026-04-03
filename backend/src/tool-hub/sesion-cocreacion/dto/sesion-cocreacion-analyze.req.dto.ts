import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class ParticipanteDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() perfil?: string;
  @ApiProperty() @IsNumber() @Min(1) cantidad: number;
}

export class IdeaDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() grupo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() descripcion?: string;
  @ApiProperty() @IsNumber() @Min(0) votos: number;
  @ApiProperty() @IsBoolean() seleccionada: boolean;
}

export class SesionCocreacionDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() objetivo?: string;
  @ApiPropertyOptional() @IsOptional() @IsIn(['presencial', 'remota', 'hibrida', '']) modalidad?: string;
  @ApiProperty({ type: [ParticipanteDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => ParticipanteDto) participantes: ParticipanteDto[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) tecnicasUsadas?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) fasesCumplidas?: string[];
  @ApiProperty({ type: [IdeaDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => IdeaDto) ideas: IdeaDto[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) decisiones?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) aprendizajes?: string[];
}

export class SesionCocreacionAnalyzeReqDto {
  @ApiProperty() @IsNumber() toolApplicationId: number;
  @ApiProperty({ type: SesionCocreacionDataDto }) @ValidateNested() @Type(() => SesionCocreacionDataDto) data: SesionCocreacionDataDto;
  @ApiProperty() @IsNumber() currentVersion: number;
}
