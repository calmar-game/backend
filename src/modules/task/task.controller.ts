import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskEntity } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { UserDto } from '../users/dto/user.dto';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req): Promise<(TaskEntity & { completed?: boolean })[]> {
    const userId = req.user.sub;
    return this.taskService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<TaskEntity | null> {
    return this.taskService.findOne(id);
  }

  @Post()
  create(@Body() data: CreateTaskDto): Promise<TaskEntity> {
    return this.taskService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() data: Partial<TaskEntity>) {
    return this.taskService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.taskService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('complete/:id')
  completeTask(@Param('id') id: string, @Request() req): Promise<UserDto> {
    const userId = req.user.sub;
    return this.taskService.completeTask(userId, Number(id));
  }
}