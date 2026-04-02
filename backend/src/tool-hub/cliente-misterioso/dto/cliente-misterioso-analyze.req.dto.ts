import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class PasoVisitaDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() descripcion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tiempoDesc?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notas?: string;
}

export class IssueDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() descripcion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() impacto?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() area?: string;
}

export class VisitaMisteriosaDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fecha?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() canal?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() escenario?: string;
  @ApiProperty({ type: [PasoVisitaDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => PasoVisitaDto) pasos: PasoVisitaDto[];
  @ApiProperty({ type: [IssueDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => IssueDto) issues: IssueDto[];
  @ApiPropertyOptional() @IsOptional() @IsNumber() scoreGeneral?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() observaciones?: string;
}

export class ClienteMisteriosoDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() objetivo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() criterios?: string;
  @ApiProperty({ type: [VisitaMisteriosaDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => VisitaMisteriosaDto) visitas: VisitaMisteriosaDto[];
  @ApiPropertyOptional() @IsOptional() @IsString() observacionesGenerales?: string;
}

export class ClienteMisteriosoAnalyzeReqDto {
  @ApiProperty() @IsNumber() toolApplicationId: number;
  @ApiProperty({ type: ClienteMisteriosoDataDto }) @ValidateNested() @Type(() => ClienteMisteriosoDataDto) data: ClienteMisteriosoDataDto;
  @ApiProperty() @IsNumber() currentVersion: number;
}
