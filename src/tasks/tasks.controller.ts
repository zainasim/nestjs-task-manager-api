import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { TasksQueryDto } from './dto/tasks-query.dto';
import { PaginatedTasksResponseDto } from './dto/paginated-tasks-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully',
    type: TaskResponseDto,
  })
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req: { user: { id: string } },
  ): Promise<TaskResponseDto> {
    return this.tasksService.create(createTaskDto, req.user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all tasks (paginated with filters)',
    description:
      'Supports both offset-based and cursor-based pagination. Admins can view all tasks, clients can only view their own. Filter by status and userId (admin only).',
  })
  @ApiResponse({
    status: 200,
    description: 'List of tasks',
    type: PaginatedTasksResponseDto,
  })
  async findAll(
    @Query() query: TasksQueryDto,
    @Request() req: { user: { id: string; role: UserRole } },
  ): Promise<PaginatedTasksResponseDto> {
    return this.tasksService.findAll(query, req.user.id, req.user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiResponse({
    status: 200,
    description: 'Task details',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { id: string; role: UserRole } },
  ): Promise<TaskResponseDto> {
    return this.tasksService.findOne(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: { user: { id: string; role: UserRole } },
  ): Promise<TaskResponseDto> {
    return this.tasksService.update(
      id,
      updateTaskDto,
      req.user.id,
      req.user.role,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { id: string; role: UserRole } },
  ): Promise<{ message: string }> {
    await this.tasksService.remove(id, req.user.id, req.user.role);
    return { message: 'Task deleted successfully' };
  }
}

