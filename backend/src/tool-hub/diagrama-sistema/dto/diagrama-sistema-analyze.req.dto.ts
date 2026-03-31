import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

export class SistemaActorDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  id: string;

  @ApiProperty({ example: 'Fintech' })
  @IsString()
  nombre: string;

  @ApiProperty({ enum: ['usuario', 'organizacion', 'sistema', 'gobierno', 'externo'] })
  @IsIn(['usuario', 'organizacion', 'sistema', 'gobierno', 'externo'])
  tipo: 'usuario' | 'organizacion' | 'sistema' | 'gobierno' | 'externo';

  @ApiProperty({ enum: ['dentro', 'fuera'] })
  @IsIn(['dentro', 'fuera'])
  frontera: 'dentro' | 'fuera';
}

export class SistemaConexionDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsUUID()
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  fromId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002' })
  @IsUUID()
  toId: string;

  @ApiProperty({ enum: ['relacion', 'flujo-dinero', 'flujo-informacion', 'flujo-producto', 'regulacion', 'bucle'] })
  @IsIn(['relacion', 'flujo-dinero', 'flujo-informacion', 'flujo-producto', 'regulacion', 'bucle'])
  tipo: 'relacion' | 'flujo-dinero' | 'flujo-informacion' | 'flujo-producto' | 'regulacion' | 'bucle';

  @ApiProperty({ example: 'Regula el acceso al crédito' })
  @IsString()
  descripcion: string;
}

export class SistemaDataDto {
  @ApiProperty({ example: 'Ecosistema de crédito para freelancers' })
  @IsString()
  alcance: string;

  @ApiProperty({ type: [SistemaActorDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SistemaActorDto)
  actores: SistemaActorDto[];

  @ApiProperty({ type: [SistemaConexionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SistemaConexionDto)
  conexiones: SistemaConexionDto[];
}

export class DiagramaSistemaAnalyzeReqDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  toolApplicationId: number;

  @ApiProperty({ type: SistemaDataDto })
  @ValidateNested()
  @Type(() => SistemaDataDto)
  data: SistemaDataDto;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  currentVersion: number;
}
