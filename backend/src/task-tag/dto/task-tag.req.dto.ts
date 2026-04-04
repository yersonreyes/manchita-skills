import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateTaskTagRequestDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  projectId: number;

  @ApiProperty({ example: 'Bug' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: '#EF4444' })
  @IsString()
  color: string;
}

export class UpdateTaskTagRequestDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  color?: string;
}
