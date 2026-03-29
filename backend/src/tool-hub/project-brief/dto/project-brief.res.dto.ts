import { ApiProperty } from '@nestjs/swagger';

export class ProjectBriefChatResDto {
  @ApiProperty()
  assistantMessage: string;

  @ApiProperty()
  turnCount: number;
}

export class ProjectBriefGenerateResDto {
  @ApiProperty()
  contexto: string;
}
