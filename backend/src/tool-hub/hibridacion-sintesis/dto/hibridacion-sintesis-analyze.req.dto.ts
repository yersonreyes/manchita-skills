import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ConceptoBaseDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nombre?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() descripcion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() esencia?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contribucion?: string;
}

export class HibridacionSintesisDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() contexto?: string;
  @ApiProperty({ type: [ConceptoBaseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConceptoBaseDto)
  conceptosBase: ConceptoBaseDto[];
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  puntosConexion?: string[];
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['superficial', 'estructural', 'paradigmatico', ''])
  nivelSintesis?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ideaSintetizada?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nuevoParadigma?: string;
}

export class HibridacionSintesisAnalyzeReqDto {
  @ApiProperty() @IsNumber() toolApplicationId: number;
  @ApiProperty({ type: HibridacionSintesisDataDto })
  @ValidateNested()
  @Type(() => HibridacionSintesisDataDto)
  data: HibridacionSintesisDataDto;
  @ApiProperty() @IsNumber() currentVersion: number;
}
