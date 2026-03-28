import { IsIn, IsInt, IsNotEmpty, IsString, Min, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class AiMessageDto {
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class AiChatRequestDto {
  @IsInt()
  @Min(1)
  toolApplicationId: number;

  @IsString()
  @IsNotEmpty()
  userMessage: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AiMessageDto)
  history: AiMessageDto[];
}

export class AiAnalyzeRequestDto {
  @IsInt()
  @Min(1)
  toolApplicationId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AiMessageDto)
  history: AiMessageDto[];
}
