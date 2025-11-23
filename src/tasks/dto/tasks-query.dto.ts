import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsUUID, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus } from '../../common/enums/task-status.enum';

export class TasksQueryDto {
  @ApiProperty({ required: false, description: 'Page number (offset-based pagination)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, description: 'Number of items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ required: false, description: 'Cursor for cursor-based pagination' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiProperty({ required: false, enum: TaskStatus, description: 'Filter by task status' })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({ required: false, description: 'Filter by user ID' })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

