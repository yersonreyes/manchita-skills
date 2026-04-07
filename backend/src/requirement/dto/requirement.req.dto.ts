import { ApiProperty, ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import {
  RequirementPriority,
  RequirementStatus,
  RequirementSubtype,
  RequirementType,
} from '@prisma/client';

export class CreateRequirementReqDto {
  @ApiProperty({ enum: RequirementType })
  @IsEnum(RequirementType)
  type: RequirementType;

  @ApiPropertyOptional({ enum: RequirementSubtype })
  @IsOptional()
  @IsEnum(RequirementSubtype)
  subtype?: RequirementSubtype;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userStory?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  acceptanceCriteria?: string[];

  @ApiPropertyOptional({ enum: RequirementPriority, default: RequirementPriority.MUST_HAVE })
  @IsOptional()
  @IsEnum(RequirementPriority)
  priority?: RequirementPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  businessValue?: string;
}

export class UpdateRequirementReqDto extends PartialType(
  OmitType(CreateRequirementReqDto, ['type'] as const),
) {}

export class ChangeRequirementStatusReqDto {
  @ApiProperty({ enum: RequirementStatus })
  @IsEnum(RequirementStatus)
  status: RequirementStatus;
}
