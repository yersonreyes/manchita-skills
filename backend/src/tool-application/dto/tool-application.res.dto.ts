import { ApiProperty } from '@nestjs/swagger';

export class ToolApplicationDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  projectPhaseId: number;

  @ApiProperty()
  toolId: number;

  @ApiProperty()
  titulo: string;

  @ApiProperty()
  structuredData: object;

  @ApiProperty()
  estado: string;

  @ApiProperty()
  createdById: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class GetAllToolApplicationsResponseDto {
  @ApiProperty({ type: () => [ToolApplicationDto] })
  res: ToolApplicationDto[];

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}

export class ToolApplicationResponseDto {
  @ApiProperty({ type: () => ToolApplicationDto })
  res: ToolApplicationDto;

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}

export class ErrorResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}
