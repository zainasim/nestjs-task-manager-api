import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '../../common/enums/task-status.enum';

export class TaskResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ enum: TaskStatus })
  status: TaskStatus;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

