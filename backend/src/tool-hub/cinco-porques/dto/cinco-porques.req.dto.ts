import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AiMessageDto } from '../../../ai/dto/ai.req.dto';

export class CincoPorquesChatReqDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  toolApplicationId: number;

  @ApiProperty({ example: 'Los clientes abandonan el carrito antes de pagar' })
  @IsString()
  @IsNotEmpty()
  userMessage: string;

  @ApiProperty({ type: [AiMessageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AiMessageDto)
  history: AiMessageDto[];
}

export class CincoPorquesAnalyzeReqDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  toolApplicationId: number;

  @ApiProperty({ type: [AiMessageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AiMessageDto)
  history: AiMessageDto[];
}
