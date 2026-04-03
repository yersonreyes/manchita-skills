import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class TraslacionDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dominioOrigen?: string;
  @ApiPropertyOptional() @IsOptional() @IsIn(['industria-similar', 'industria-diferente', 'naturaleza', 'vida-cotidiana', 'tecnologia', '']) fuenteTipo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() mecanismo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() como?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() traduccion?: string;
}

export class HibridacionTraslacionDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() problema?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contexto?: string;
  @ApiProperty({ type: [TraslacionDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => TraslacionDto) traslaciones: TraslacionDto[];
  @ApiPropertyOptional() @IsOptional() @IsString() ideaResultante?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() mecanismoClave?: string;
}

export class HibridacionTraslacionAnalyzeReqDto {
  @ApiProperty() @IsNumber() toolApplicationId: number;
  @ApiProperty({ type: HibridacionTraslacionDataDto }) @ValidateNested() @Type(() => HibridacionTraslacionDataDto) data: HibridacionTraslacionDataDto;
  @ApiProperty() @IsNumber() currentVersion: number;
}
