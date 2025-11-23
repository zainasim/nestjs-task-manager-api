import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, MoreThan } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { TasksQueryDto } from './dto/tasks-query.dto';
import { PaginatedTasksResponseDto } from './dto/paginated-tasks-response.dto';
import { TaskStatus } from '../common/enums/task-status.enum';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  private toResponseDto(task: Task): TaskResponseDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      userId: task.userId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  async create(
    createTaskDto: CreateTaskDto,
    userId: string,
  ): Promise<TaskResponseDto> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      userId,
    });
    const savedTask = await this.taskRepository.save(task);
    return this.toResponseDto(savedTask);
  }

  async findAll(
    query: TasksQueryDto,
    currentUserId: string,
    userRole: UserRole,
  ): Promise<PaginatedTasksResponseDto> {
    const { page = 1, limit = 10, cursor, status, userId } = query;

    const where: FindOptionsWhere<Task> = {};

    if (userRole === UserRole.CLIENT) {
      where.userId = currentUserId;
    } else if (userRole === UserRole.ADMIN) {
      if (userId) {
        where.userId = userId;
      }
    }

    if (status) {
      where.status = status;
    }

    if (cursor) {
      where.id = MoreThan(cursor);
    }

    const [tasks, total] = await this.taskRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: limit + 1,
      skip: cursor ? 0 : (page - 1) * limit,
    });

    const hasMore = tasks.length > limit;
    const data = hasMore ? tasks.slice(0, limit) : tasks;
    const nextCursor = hasMore ? data[data.length - 1].id : undefined;

    return {
      data: data.map((task) => this.toResponseDto(task)),
      total,
      page: cursor ? 1 : page,
      limit,
      nextCursor,
      hasMore,
    };
  }

  async findOne(id: string, currentUserId: string, userRole: UserRole): Promise<TaskResponseDto> {
    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    if (userRole === UserRole.CLIENT && task.userId !== currentUserId) {
      throw new ForbiddenException('You can only access your own tasks');
    }

    return this.toResponseDto(task);
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    currentUserId: string,
    userRole: UserRole,
  ): Promise<TaskResponseDto> {
    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    if (userRole === UserRole.CLIENT && task.userId !== currentUserId) {
      throw new ForbiddenException('You can only update your own tasks');
    }

    Object.assign(task, updateTaskDto);
    const updatedTask = await this.taskRepository.save(task);
    return this.toResponseDto(updatedTask);
  }

  async remove(id: string, currentUserId: string, userRole: UserRole): Promise<void> {
    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    if (userRole === UserRole.CLIENT && task.userId !== currentUserId) {
      throw new ForbiddenException('You can only delete your own tasks');
    }

    await this.taskRepository.remove(task);
  }
}

