import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PhaseStatus } from '@prisma/client';

export class CreateProjectPhaseRequestDto {
  @ApiProperty({ example: 1, description: 'ID del proyecto' })
  @IsInt()
  @Min(1)
  projectId: number;

  @ApiProperty({
    example: 1,
    description: 'ID de la fase de diseño del catálogo',
  })
  @IsInt()
  @Min(1)
  phaseId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  orden: number;

  @ApiProperty({
    enum: PhaseStatus,
    required: false,
    default: PhaseStatus.NOT_STARTED,
  })
  @IsEnum(PhaseStatus)
  @IsOptional()
  estado?: PhaseStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notas?: string | null;
}

export class UpdateProjectPhaseRequestDto {
  @ApiProperty({ enum: PhaseStatus, required: false })
  @IsEnum(PhaseStatus)
  @IsOptional()
  estado?: PhaseStatus;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  orden?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notas?: string | null;
}
