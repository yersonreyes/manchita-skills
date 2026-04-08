import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  RequirementPriority,
  RequirementStatus,
  RequirementSubtype,
  RequirementType,
} from '@prisma/client';

export class RequirementCreatedByDto {
  @ApiProperty() id: number;
  @ApiProperty() nombre: string;
}

export class RequirementResDto {
  @ApiProperty() id: number;
  @ApiProperty() projectId: number;
  @ApiProperty({ enum: RequirementType }) type: RequirementType;
  @ApiPropertyOptional({ enum: RequirementSubtype })
  subtype: RequirementSubtype | null;
  @ApiProperty() title: string;
  @ApiProperty() description: string;
  @ApiPropertyOptional() userStory: string | null;
  @ApiProperty({ type: [String] }) acceptanceCriteria: string[];
  @ApiProperty({ enum: RequirementPriority }) priority: RequirementPriority;
  @ApiPropertyOptional() source: string | null;
  @ApiPropertyOptional() businessValue: string | null;
  @ApiProperty({ enum: RequirementStatus }) status: RequirementStatus;
  @ApiProperty() activo: boolean;
  @ApiProperty() createdById: number;
  @ApiPropertyOptional() updatedById: number | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty({ type: RequirementCreatedByDto })
  createdBy: RequirementCreatedByDto;
}
