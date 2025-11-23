import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TaskStatus } from '../../common/enums/task-status.enum';

export class UpdateTaskDto {
  @ApiProperty({ example: 'Updated task title', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: TaskStatus, required: false })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;
}

