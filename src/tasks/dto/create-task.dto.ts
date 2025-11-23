import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Complete project documentation' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Write comprehensive documentation for the API', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

