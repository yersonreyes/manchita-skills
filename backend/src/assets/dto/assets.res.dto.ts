import { ApiProperty } from '@nestjs/swagger';

export class UploadResultDto {
  @ApiProperty()
  url: string;

  @ApiProperty()
  key: string;
}

export class UploadResponseDto {
  @ApiProperty({ type: () => UploadResultDto })
  res: UploadResultDto;

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
