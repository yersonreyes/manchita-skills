import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class IdeaBrainstormingDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() texto?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cluster?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) votos?: number;
}

export class BrainstormingDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() reto?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tecnica?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() participantes?: string;
  @ApiProperty({ type: [IdeaBrainstormingDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => IdeaBrainstormingDto) ideas: IdeaBrainstormingDto[];
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) topIdeas?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() notas?: string;
}

export class BrainstormingAnalyzeReqDto {
  @ApiProperty() @IsNumber() toolApplicationId: number;
  @ApiProperty({ type: BrainstormingDataDto }) @ValidateNested() @Type(() => BrainstormingDataDto) data: BrainstormingDataDto;
  @ApiProperty() @IsNumber() currentVersion: number;
}
